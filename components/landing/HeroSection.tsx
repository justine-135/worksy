import Link from "next/link";

import FauxDashboardCard from "./FauxDashboardCard";

const stats = [
  { label: "Total", value: "24", color: "text-foreground" },
  { label: "In progress", value: "9", color: "text-stat-progress" },
  { label: "Done", value: "15", color: "text-stat-completed" },
];

const tasks = [
  { label: "Design review", status: "In progress" },
  { label: "API integration", status: "Done" },
];

const taskStatusClass: Record<string, string> = {
  "In progress": "text-stat-progress bg-warning-soft",
  Done: "text-stat-completed bg-success-soft",
};

export default function HeroSection() {
  return (
    <section className="bg-background px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
        {/* Left: headline + CTAs */}
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Manage projects and ship with your team
          </h1>

          <p className="mt-5 max-w-md text-base leading-7 text-muted">
            Worksy helps teams plan, track, and ship work faster — with Kanban
            boards, role-based access, and data-driven insights to keep every
            project on schedule.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-in"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Get started
            </Link>
            <Link
              href="#features"
              className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-5 text-xs text-subtle">
            Used by 50,000+ teams worldwide
          </p>
        </div>

        {/* Right: faux product screenshot */}
        <FauxDashboardCard
          chartContainerClassName="mt-4 h-28 gap-1"
          inactiveClass="bg-primary/15"
          footer={
            <div className="mt-4 space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.label}
                  className="flex items-center justify-between rounded-md bg-background px-3 py-2"
                >
                  <span className="text-xs font-medium text-foreground">
                    {task.label}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${taskStatusClass[task.status]}`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          }
        >
          <div className="mt-4 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-card border border-border bg-background p-3"
              >
                <p className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-subtle">{stat.label}</p>
              </div>
            ))}
          </div>
        </FauxDashboardCard>
      </div>
    </section>
  );
}
