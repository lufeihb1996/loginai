"use client";

import Link from "next/link";
import styles from "./page.module.css";

const postQueue = [
  {
    title: "Launch note: The anatomy of a good homepage issue",
    status: "Ready to publish",
    owner: "Mia",
    slot: "Tomorrow · 09:00",
  },
  {
    title: "Interview: how solo creators manage editorial rhythm",
    status: "In review",
    owner: "Ken",
    slot: "Friday · 14:00",
  },
  {
    title: "Collection build: product storytelling templates",
    status: "Drafting",
    owner: "Ava",
    slot: "Next week",
  },
];

const commentsQueue = [
  "5 new comments are waiting for moderation.",
  "Newsletter signup conversion rose 18% this week.",
  "Longform essays are outperforming short updates by 2.4x.",
];

export default function EditorialDeskPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <aside className={styles.sidebar}>
          <div>
            <p className={styles.sidebarKicker}>Northstar Journal</p>
            <h1 className={styles.sidebarTitle}>Editorial Desk</h1>
            <p className={styles.sidebarText}>
              Plan issues, track submissions, and keep the publishing machine
              calm.
            </p>
          </div>

          <nav className={styles.nav}>
            <button className={styles.navItemActive} type="button">
              Dashboard
            </button>
            <button className={styles.navItem} type="button">
              Posts
            </button>
            <button className={styles.navItem} type="button">
              Categories
            </button>
            <button className={styles.navItem} type="button">
              Newsletter
            </button>
            <button className={styles.navItem} type="button">
              Settings
            </button>
          </nav>

          <Link className={styles.backLink} href="/">
            Return to blog homepage
          </Link>
        </aside>

        <section className={styles.content}>
          <header className={styles.header}>
            <div>
              <p className={styles.headerEyebrow}>Content operations</p>
              <h2 className={styles.headerTitle}>
                A blog business dashboard built for publishing, not just posting.
              </h2>
            </div>
            <button className={styles.primaryButton} type="button">
              New article
            </button>
          </header>

          <div className={styles.metricGrid}>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Monthly readers</span>
              <strong className={styles.metricValue}>128,400</strong>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Newsletter CTR</span>
              <strong className={styles.metricValue}>8.7%</strong>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Queued stories</span>
              <strong className={styles.metricValue}>12</strong>
            </article>
          </div>

          <div className={styles.board}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Publishing Queue</h3>
                <span className={styles.cardMeta}>Next 7 days</span>
              </div>
              <div className={styles.queueList}>
                {postQueue.map((post) => (
                  <article key={post.title} className={styles.queueItem}>
                    <div>
                      <h4 className={styles.queueTitle}>{post.title}</h4>
                      <p className={styles.queueInfo}>
                        {post.owner} · {post.slot}
                      </p>
                    </div>
                    <span className={styles.statusPill}>{post.status}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Business Notes</h3>
                <span className={styles.cardMeta}>Today</span>
              </div>
              <div className={styles.noteList}>
                {commentsQueue.map((note) => (
                  <div key={note} className={styles.noteItem}>
                    {note}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
