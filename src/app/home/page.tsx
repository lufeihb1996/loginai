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

type ViewKey = "home" | "chat" | "history" | "prompts" | "settings";

const MODEL_OPTIONS = [
  "openai/gpt-4o-mini",
  "deepseek/deepseek-chat",
  "anthropic/claude-3.5-sonnet",
  "custom",
];

const NAV_ITEMS: Array<{ key: ViewKey; label: string; kicker: string }> = [
  { key: "home", label: "Home", kicker: "Overview" },
  { key: "chat", label: "Chat", kicker: "AI workspace" },
  { key: "history", label: "History", kicker: "Past sessions" },
  { key: "prompts", label: "Prompt Library", kicker: "Quick starts" },
  { key: "settings", label: "Settings", kicker: "Controls" },
];

const PROMPTS = [
  "Summarize this conversation into 3 action items.",
  "Turn my rough idea into a short product spec.",
  "Explain this concept like I am a beginner.",
  "Rewrite my draft into a professional message.",
];

export default function HomePage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewKey>("chat");
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [customModel, setCustomModel] = useState("");

  const activeModel =
    selectedModel === "custom" ? customModel.trim() : selectedModel;

  const loadSession = async (id: number) => {
    const msgResponse = await fetch(`/api/sessions/${id}/messages`);
    const msgData = (await msgResponse.json()) as {
      session?: Session;
      messages?: ChatMessage[];
      error?: string;
    };

    if (!msgResponse.ok) {
      throw new Error(msgData.error || "Failed to load session.");
    }

    setSessionId(id);
    setMessages(msgData.messages || []);
    setSelectedModel(msgData.session?.model || "openai/gpt-4o-mini");
  };

  const loadSessions = async () => {
    const listResponse = await fetch("/api/sessions");
    const listData = (await listResponse.json()) as {
      sessions?: Session[];
      error?: string;
    };

    if (!listResponse.ok) {
      throw new Error(listData.error || "Failed to load sessions.");
    }

    const nextSessions = listData.sessions || [];
    setSessions(nextSessions);
    return nextSessions;
  };

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
        const nextSessions = await loadSessions();

        if (nextSessions.length > 0) {
          await loadSession(nextSessions[0].id);
          return;
        }

        const createResponse = await fetch("/api/sessions", { method: "POST" });
        const createData = (await createResponse.json()) as {
          session?: Session;
        };
        if (createData.session) {
          setSessionId(createData.session.id);
          setSelectedModel(createData.session.model || "openai/gpt-4o-mini");
          setSessions([createData.session]);
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

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
        session?: Session;
      };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Chat request failed.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply as string },
      ]);
      if (data.session) {
        setSessions((prev) => {
          const otherSessions = prev.filter((session) => session.id !== data.session?.id);
          return [data.session as Session, ...otherSessions];
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onCreateSession = async () => {
    setError("");
    try {
      const createResponse = await fetch("/api/sessions", { method: "POST" });
      const createData = (await createResponse.json()) as {
        session?: Session;
        error?: string;
      };

      if (!createResponse.ok || !createData.session) {
        throw new Error(createData.error || "Failed to create session.");
      }

      setSessions((prev) => [createData.session as Session, ...prev]);
      setSessionId(createData.session.id);
      setSelectedModel(createData.session.model || "openai/gpt-4o-mini");
      setCustomModel("");
      setMessages([]);
      setInput("");
      setActiveView("chat");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
    }
  };

  const onSelectSession = async (nextSession: Session) => {
    setError("");
    setActiveView("chat");
    try {
      await loadSession(nextSession.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
    }
  };

  const renderMainPanel = () => {
    if (activeView === "home") {
      return (
        <section className={styles.panel}>
          <div className={styles.hero}>
            <p className={styles.eyebrow}>Captain&apos;s Deck</p>
            <h1 className={styles.title}>Welcome back, {email}.</h1>
            <p className={styles.subtitle}>
              Your chat workspace is ready. Pick a model, open the Chat tab,
              and keep building.
            </p>
          </div>
          <div className={styles.overviewGrid}>
            <article className={styles.statCard}>
              <span className={styles.statLabel}>Current model</span>
              <strong className={styles.statValue}>
                {activeModel || "Not selected"}
              </strong>
            </article>
            <article className={styles.statCard}>
              <span className={styles.statLabel}>Messages</span>
              <strong className={styles.statValue}>{messages.length}</strong>
            </article>
            <article className={styles.statCard}>
              <span className={styles.statLabel}>Session</span>
              <strong className={styles.statValue}>
                {sessionId ? `#${sessionId}` : "Preparing"}
              </strong>
            </article>
          </div>
        </section>
      );
    }

    if (activeView === "history") {
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>History</h2>
            <p className={styles.sectionText}>
              Switch between saved sessions and jump back into any thread.
            </p>
          </div>
          <div className={styles.historyToolbar}>
            <button
              className={styles.secondaryButton}
              onClick={() => void onCreateSession()}
              type="button"
            >
              New Chat
            </button>
            <p className={styles.historyMeta}>
              {sessions.length} session{sessions.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className={styles.historyList}>
            {sessions.length === 0 ? (
              <div className={styles.placeholderCard}>
                <p className={styles.placeholderTitle}>No history yet</p>
                <p className={styles.placeholderText}>
                  Start a new chat and it will appear here.
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  className={
                    session.id === sessionId
                      ? `${styles.historyItem} ${styles.historyItemActive}`
                      : styles.historyItem
                  }
                  type="button"
                  onClick={() => void onSelectSession(session)}
                >
                  <span className={styles.historyTitle}>
                    {session.title || `Session #${session.id}`}
                  </span>
                  <span className={styles.historyDetails}>
                    #{session.id} · {session.model}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>
      );
    }

    if (activeView === "prompts") {
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Prompt Library</h2>
            <p className={styles.sectionText}>
              Tap one to drop it into the composer.
            </p>
          </div>
          <div className={styles.promptGrid}>
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                className={styles.promptCard}
                type="button"
                onClick={() => {
                  setInput(prompt);
                  setActiveView("chat");
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (activeView === "settings") {
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Settings</h2>
            <p className={styles.sectionText}>
              Tune the current chat model or sign out of this demo session.
            </p>
          </div>

          <div className={styles.modelRow}>
            <select
              className={styles.modelSelect}
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {MODEL_OPTIONS.map((model) => (
                <option key={model} value={model}>
                  {model === "custom" ? "Custom model..." : model}
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

          <button
            className={styles.secondaryButton}
            onClick={onLogout}
            type="button"
          >
            Log Out
          </button>
        </section>
      );
    }

    return (
      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Chat</h2>
          <p className={styles.sectionText}>
            Talk to your selected model and keep iterating.
          </p>
        </div>

        <div className={styles.modelRowCompact}>
          <select
            className={styles.modelSelect}
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model} value={model}>
                {model === "custom" ? "Custom model..." : model}
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
            <p className={styles.emptyText}>
              Ask anything to test OpenRouter integration.
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={
                  msg.role === "user" ? styles.userBubble : styles.aiBubble
                }
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
          <button
            className={styles.sendButton}
            onClick={() => void onSend()}
            type="button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    );
  };

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brandBlock}>
            <p className={styles.brandMini}>loginai</p>
            <h1 className={styles.brandTitle}>Grand Line Console</h1>
            <p className={styles.brandText}>
              A compact AI cockpit for chat, prompts, and session control.
            </p>
          </div>

          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={
                  item.key === activeView
                    ? `${styles.navItem} ${styles.navItemActive}`
                    : styles.navItem
                }
                onClick={() => setActiveView(item.key)}
              >
                <span className={styles.navLabel}>{item.label}</span>
                <span className={styles.navKicker}>{item.kicker}</span>
              </button>
            ))}
          </nav>

          <button
            className={styles.newChatButton}
            onClick={() => void onCreateSession()}
            type="button"
          >
            New Chat
          </button>

          <div className={styles.sidebarFooter}>
            <p className={styles.footerUser}>{email || "Captain"}</p>
            <button
              className={styles.secondaryButton}
              onClick={onLogout}
              type="button"
            >
              Log Out
            </button>
          </div>
        </aside>

        <div className={styles.content}>{renderMainPanel()}</div>
      </section>
    </main>
  );
}
