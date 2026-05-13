import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const sessions = await db.all(
    "SELECT id, title, model, created_at AS createdAt, updated_at AS updatedAt FROM sessions ORDER BY updated_at DESC",
  );

  return NextResponse.json({ sessions });
}

export async function POST() {
  const db = await getDb();
  const now = new Date().toISOString();
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  const result = await db.run(
    "INSERT INTO sessions (title, model, created_at, updated_at) VALUES (?, ?, ?, ?)",
    ["New Chat", model, now, now],
  );

  const session = await db.get(
    "SELECT id, title, model, created_at AS createdAt, updated_at AS updatedAt FROM sessions WHERE id = ?",
    [result.lastID],
  );

  return NextResponse.json({ session });
}
