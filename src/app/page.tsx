import Link from "next/link";
import styles from "./page.module.css";

const featuredStories = [
  {
    title: "How quiet teams build loud products",
    category: "Essay",
    readTime: "8 min read",
    summary:
      "A field note on small editorial teams, careful product writing, and the rhythm behind memorable launches.",
  },
  {
    title: "The notebook behind every good release",
    category: "Behind the scenes",
    readTime: "5 min read",
    summary:
      "Why release journals, screenshots, and interview snippets become the raw material for stronger stories.",
  },
  {
    title: "Designing a publishing flow for one-person teams",
    category: "Workflow",
    readTime: "6 min read",
    summary:
      "An opinionated publishing stack for creators who need drafts, reviews, analytics, and calm operations in one place.",
  },
];

const columns = [
  "Editorial systems",
  "Product storytelling",
  "Creator operations",
  "Audience growth",
];

export default function BlogLandingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Northstar Journal</p>
          <h1 className={styles.title}>
            A modern blog for product stories, field notes, and sharp ideas.
          </h1>
          <p className={styles.subtitle}>
            Built for thoughtful publishing: featured essays, clean article
            rails, newsletter capture, and an editorial desk for the team behind
            it.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/home">
              Open Editorial Desk
            </Link>
            <a className={styles.secondaryAction} href="#stories">
              Browse stories
            </a>
          </div>
        </div>

        <article className={styles.heroFeature}>
          <span className={styles.badge}>Featured Issue</span>
          <h2 className={styles.featureTitle}>
            The new publishing stack is less about tools and more about tempo.
          </h2>
          <p className={styles.featureText}>
            Editors need a homepage that feels curated, a backend that respects
            process, and an archive that turns every post into a long-term
            asset. This concept blog is designed around exactly that.
          </p>
          <div className={styles.featureMeta}>
            <span>Issue 08</span>
            <span>Editorial systems</span>
            <span>12 min read</span>
          </div>
        </article>
      </section>

      <section className={styles.signalBar}>
        {columns.map((column) => (
          <div key={column} className={styles.signalPill}>
            {column}
          </div>
        ))}
      </section>

      <section className={styles.storyGrid} id="stories">
        <article className={styles.leadStory}>
          <p className={styles.storyLabel}>Lead Story</p>
          <h2 className={styles.storyHeadline}>
            Why every strong blog starts with a point of view, not a theme.
          </h2>
          <p className={styles.storyBody}>
            Good editorial brands are remembered for the way they frame ideas.
            This homepage is built around a clear opinion: fewer posts, sharper
            curation, and stronger packaging.
          </p>
        </article>

        <div className={styles.storyRail}>
          {featuredStories.map((story) => (
            <article key={story.title} className={styles.storyCard}>
              <div className={styles.storyMeta}>
                <span>{story.category}</span>
                <span>{story.readTime}</span>
              </div>
              <h3 className={styles.storyCardTitle}>{story.title}</h3>
              <p className={styles.storyCardSummary}>{story.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.bottomGrid}>
        <article className={styles.collectionCard}>
          <p className={styles.collectionLabel}>Series</p>
          <h3 className={styles.collectionTitle}>Publishing systems for lean teams</h3>
          <p className={styles.collectionText}>
            A running collection on editorial operations, writing calendars,
            release notes, and the mechanics of sustainable content teams.
          </p>
        </article>

        <article className={styles.collectionCard}>
          <p className={styles.collectionLabel}>Newsletter</p>
          <h3 className={styles.collectionTitle}>Weekly field notes, no filler</h3>
          <p className={styles.collectionText}>
            Subscribe flow, featured signup rail, and sponsor-ready placements
            all fit naturally into this structure.
          </p>
        </article>
      </section>
    </main>
  );
}
