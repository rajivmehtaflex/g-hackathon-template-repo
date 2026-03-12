import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ProjectRow = {
  id: string;
  title: string;
  status: string;
  progress: number;
  owner_name: string | null;
  description: string | null;
  is_demo: boolean | null;
};

type ActivityRow = {
  id: string;
  event: string;
  created_at: string;
  project_id: string;
  projects?: { title: string } | null;
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?needSignIn=1");
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, title, status, progress, owner_name, description, is_demo")
    .order("updated_at", { ascending: false })
    .limit(6);

  const { data: activity, error: activityError } = await supabase
    .from("project_updates")
    .select("id, event, created_at, project_id, projects(title)")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className={styles.kicker}>Authenticated Workspace</p>
          <h1>Hackathon Dashboard</h1>
          <p>Welcome {user.email}</p>
        </div>
        <form action="/api/auth/signout" method="post">
          <button className={styles.signOut} type="submit">
            Sign Out
          </button>
        </form>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Projects</h2>
          {projectsError ? (
            <p className={styles.error}>{projectsError.message}</p>
          ) : projects?.length ? (
            <ul className={styles.list}>
              {(projects as ProjectRow[]).map((project) => (
                <li key={project.id} className={styles.item}>
                  <p className={styles.itemTitle}>{project.title}</p>
                  <p>{project.description || "No description."}</p>
                  <div className={styles.meta}>
                    <span>{project.status}</span>
                    <span>{project.progress}%</span>
                    <span>{project.owner_name || "Guest"}{project.is_demo ? " · Demo" : ""}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No records. Seed data should show by default.</p>
          )}
        </article>

        <article className={styles.card}>
          <h2>Activity Feed</h2>
          {activityError ? (
            <p className={styles.error}>{activityError.message}</p>
          ) : activity?.length ? (
            <ul className={styles.list}>
              {(activity as ActivityRow[]).map((event) => (
                <li key={event.id} className={styles.activityItem}>
                  <p>{event.event}</p>
                  <p className={styles.activityMeta}>
                    {event.projects?.title || "Unknown workspace"} ·{" "}
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity.</p>
          )}
        </article>
      </section>

      <section className={styles.nextSteps}>
        <h2>Next Step</h2>
        <p>Swap this dashboard with your feature set and wire your first product definition.</p>
        <Link href="/" className={styles.link}>
          Return to landing
        </Link>
      </section>
    </main>
  );
}
