import Link from "next/link";
import OtpForm from "@/components/auth/otp-form";
import styles from "./page.module.css";

export default function Home({ searchParams }: { searchParams?: { needSignIn?: string } }) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.badge}>Hackathon Base Environment</span>
        <h1>Launch quickly with Next.js, Supabase, and Vercel</h1>
        <p>
          This starter gives you authenticated sessions, seeded demo data, and a dashboard shell so you can
          focus on your idea inside 10 hours.
        </p>
        <p className={styles.subtle}>
          Mandatory stack for the event: Next.js App Router + Supabase + Vercel, delivered with a practical base.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/dashboard" className={styles.primaryButton}>
            Open Dashboard
          </Link>
          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondaryButton}
          >
            Vercel Template
          </a>
        </div>
      </section>
      <section className={styles.card}>
        <h2>Sign in to continue</h2>
        {searchParams?.needSignIn ? (
          <p className={styles.status}>Sign in required to open dashboard.</p>
        ) : null}
        <OtpForm />
      </section>
    </main>
  );
}
