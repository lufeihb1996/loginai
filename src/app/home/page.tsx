"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Session = {
  id: number;
  title: string;
  model: string;
};

const MODEL_OPTIONS = [
  "openai/gpt-4o-mini",
  "deepseek/deepseek-chat",
  "anthropic/claude-3.5-sonnet",
  "custom",
];

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [customModel, setCustomModel] = useState("");

  const activeModel = selectedModel === "custom" ? customModel.trim() : selectedModel;

  useEffect(() => {
    const init = async () => {
      const isLoggedIn = localStorage.getItem("demo_auth") === "logged_in";
      if (!isLoggedIn) {
        router.replace("/");
        return;
      }

      const savedUser = localStorage.getItem("demo_user") || "User";
      setEmail(savedUser);

      try {
        const listResponse = await fetch("/api/sessions");
        const listData = (await listResponse.json()) as { sessions?: Session[] };

        if (listData.sessions && listData.sessions.length > 0) {
          setSessionId(listData.sessions[0].id);
          setSelectedModel(listData.sessions[0].model || "openai/gpt-4o-mini");
          const msgResponse = await fetch(`/api/sessions/${listData.sessions[0].id}/messages`);
          const msgData = (await msgResponse.json()) as { messages?: ChatMessage[] };
          setMessages(msgData.messages || []);
          return;
        }

        const createResponse = await fetch("/api/sessions", { method: "POST" });
        const createData = (await createResponse.json()) as { session?: Session };
        if (createData.session) {
          setSessionId(createData.session.id);
          setSelectedModel(createData.session.model || "openai/gpt-4o-mini");
        }
      } catch {
        setError("Failed to initialize chat session.");
      }
    };

    void init();
  }, [router]);

  const onLogout = () => {
    localStorage.removeItem("demo_auth");
    localStorage.removeItem("demo_user");
    localStorage.removeItem("demo_remember");
    router.replace("/");
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text || loading) {
      return;
    }

    if (!sessionId) {
      setError("Session not ready yet.");
      return;
    }

    if (!activeModel) {
      setError("Please select or input a model.");
      return;
    }

    setError("");
    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId,
          model: activeModel,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Chat request failed.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Home</h1>
            <p className={styles.subtitle}>You are logged in as {email}.</p>
          </div>
          <button className={styles.logoutButton} onClick={onLogout} type="button">
            Log Out
          </button>
        </div>

        <div className={styles.modelRow}>
          <select
            className={styles.modelSelect}
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m === "custom" ? "Custom model..." : m}
              </option>
            ))}
          </select>
          {selectedModel === "custom" ? (
            <input
              className={styles.modelInput}
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="Enter OpenRouter model ID"
            />
          ) : null}
        </div>

        <div className={styles.chatBox}>
          {messages.length === 0 ? (
            <p className={styles.emptyText}>Ask anything to test OpenRouter integration.</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={msg.role === "user" ? styles.userBubble : styles.aiBubble}
              >
                {msg.content}
              </div>
            ))
          )}
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void onSend();
              }
            }}
          />
          <button className={styles.sendButton} onClick={() => void onSend()} type="button" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </main>
  );
}
