import { NextResponse } from "next/server";
import { getSession, listMessages } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sessionId = Number(params.id);
  if (!Number.isInteger(sessionId)) {
    return NextResponse.json({ error: "Invalid session id." }, { status: 400 });
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const messages = listMessages(sessionId);
  return NextResponse.json({ session, messages });
}
