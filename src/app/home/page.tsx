"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("demo_auth") === "logged_in";
    if (!isLoggedIn) {
      router.replace("/");
      return;
    }

    const savedUser = localStorage.getItem("demo_user") || "User";
    setEmail(savedUser);
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

    setError("");
    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
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
