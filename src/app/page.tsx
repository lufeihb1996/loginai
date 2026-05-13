"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    localStorage.setItem("demo_auth", "logged_in");
    localStorage.setItem("demo_user", email);
    if (rememberMe) {
      localStorage.setItem("demo_remember", "1");
    } else {
      localStorage.removeItem("demo_remember");
    }

    router.push("/home");
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to continue to your dashboard.</p>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            className={styles.input}
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <label className={styles.rememberRow}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember me
          </label>

          <button className={styles.button} type="submit">
            Sign In
          </button>
        </form>

        {message ? <p className={styles.message}>{message}</p> : null}
      </section>
    </main>
  );
}
