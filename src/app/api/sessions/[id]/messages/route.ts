import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sessionId = Number(params.id);
  if (!Number.isInteger(sessionId)) {
    return NextResponse.json({ error: "Invalid session id." }, { status: 400 });
  }

  const db = await getDb();

  const session = await db.get(
    "SELECT id, title, model, created_at AS createdAt, updated_at AS updatedAt FROM sessions WHERE id = ?",
    [sessionId],
  );

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const messages = await db.all(
    "SELECT id, role, content, created_at AS createdAt FROM messages WHERE session_id = ? ORDER BY id ASC",
    [sessionId],
  );

  return NextResponse.json({ session, messages });
}
