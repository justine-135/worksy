import Link from "next/link";

import Avatar from "./Avatar";

const bars = [40, 55, 35, 60, 48, 95, 52, 38, 62, 30, 58, 42];
const highlightedBar = 5;

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
        <div className="rounded-card border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Acme Inc.
            </span>
            <div className="flex -space-x-2">
              <Avatar
                initials="A"
                gradient="from-rose-400 to-pink-500"
                className="h-6 w-6 ring-2! text-[10px]"
              />
              <Avatar
                initials="B"
                gradient="from-sky-400 to-indigo-500"
                className="h-6 w-6 ring-2! text-[10px]"
              />
              <Avatar
                initials="C"
                gradient="from-amber-400 to-orange-500"
                className="h-6 w-6 ring-2! text-[10px]"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: "24", color: "text-foreground" },
              { label: "In progress", value: "9", color: "text-stat-progress" },
              { label: "Done", value: "15", color: "text-stat-completed" },
            ].map((stat) => (
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

          <div className="mt-4 flex h-28 items-end justify-between gap-1">
            {bars.map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`w-full rounded-t-sm ${
                  i === highlightedBar ? "bg-primary" : "bg-primary/15"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {[
              { label: "Design review", status: "In progress", color: "text-stat-progress bg-warning-soft" },
              { label: "API integration", status: "Done", color: "text-stat-completed bg-success-soft" },
            ].map((task) => (
              <div
                key={task.label}
                className="flex items-center justify-between rounded-md bg-background px-3 py-2"
              >
                <span className="text-xs font-medium text-foreground">
                  {task.label}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${task.color}`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
