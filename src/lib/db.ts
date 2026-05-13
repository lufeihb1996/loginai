export type ChatRole = "user" | "assistant";

export type Session = {
  id: number;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: number;
  sessionId: number;
  role: ChatRole;
  content: string;
  createdAt: string;
};

type Store = {
  sessionSeq: number;
  messageSeq: number;
  sessions: Session[];
  messages: Message[];
};

declare global {
  // eslint-disable-next-line no-var
  var __loginaiStore: Store | undefined;
}

function getStore(): Store {
  if (!global.__loginaiStore) {
    global.__loginaiStore = {
      sessionSeq: 1,
      messageSeq: 1,
      sessions: [],
      messages: [],
    };
  }

  return global.__loginaiStore;
}

export function listSessions(): Session[] {
  const store = getStore();
  return [...store.sessions].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  );
}

export function createSession(model: string): Session {
  const store = getStore();
  const now = new Date().toISOString();
  const session: Session = {
    id: store.sessionSeq++,
    title: "New Chat",
    model,
    createdAt: now,
    updatedAt: now,
  };
  store.sessions.push(session);
  return session;
}

export function getSession(id: number): Session | null {
  const store = getStore();
  return store.sessions.find((s) => s.id === id) || null;
}

export function listMessages(sessionId: number): Message[] {
  const store = getStore();
  return store.messages
    .filter((m) => m.sessionId === sessionId)
    .sort((a, b) => a.id - b.id);
}

export function addMessage(
  sessionId: number,
  role: ChatRole,
  content: string,
): Message {
  const store = getStore();
  const message: Message = {
    id: store.messageSeq++,
    sessionId,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
  store.messages.push(message);
  return message;
}

export function updateSessionModel(sessionId: number, model: string): Session | null {
  const store = getStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session) {
    return null;
  }

  session.model = model;
  session.updatedAt = new Date().toISOString();
  return session;
}
