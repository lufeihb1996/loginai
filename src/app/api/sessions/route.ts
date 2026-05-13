import { NextResponse } from "next/server";
import { createSession, listSessions } from "@/lib/db";

export async function GET() {
  const sessions = listSessions();
  return NextResponse.json({ sessions });
}

export async function POST() {
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const session = createSession(model);
  return NextResponse.json({ session });
}
