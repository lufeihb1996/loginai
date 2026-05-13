import { NextResponse } from "next/server";
import { addMessage, getSession, listMessages, updateSessionModel } from "@/lib/db";

type OpenRouterMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(request: Request) {
  try {
    const { message, sessionId, model } = (await request.json()) as {
      message?: string;
      sessionId?: number;
      model?: string;
    };

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (!sessionId || !Number.isInteger(sessionId)) {
      return NextResponse.json({ error: "Valid sessionId is required." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const selectedModel = model || process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    addMessage(sessionId, "user", message);

    const historyMessages = listMessages(sessionId).map((row) => ({
      role: row.role,
      content: row.content,
    }));

    const messages: OpenRouterMessage[] = [
      {
        role: "system",
        content: "You are a concise and helpful assistant.",
      },
      ...historyMessages,
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenRouter request failed: ${errorText}` },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: "No reply returned by model." }, { status: 502 });
    }

    addMessage(sessionId, "assistant", reply);
    const updatedSession = updateSessionModel(sessionId, selectedModel);

    return NextResponse.json({ reply, session: updatedSession });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
