"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

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

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Home</h1>
        <p className={styles.subtitle}>You are logged in as {email}.</p>
        <button className={styles.button} onClick={onLogout} type="button">
          Log Out
        </button>
      </section>
    </main>
  );
}
