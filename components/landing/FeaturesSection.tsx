import Link from "next/link";
import { LuMessageSquare, LuPlus, LuShield } from "react-icons/lu";

import Avatar from "./Avatar";
import { FadeInView } from "./FadeInView";
import FauxDashboardCard from "./FauxDashboardCard";

const notifications = [
  { label: "New messages, comments, or replies", on: true },
  { label: "Social emails", on: false },
  { label: "Announcement and updates", on: true },
  { label: "Reminders", on: false, disabled: true },
];

const activity = [
  {
    initials: "BS",
    gradient: "from-sky-400 to-indigo-500",
    name: "Bill Sanders",
    text: 'Moved "Design review" to In Progress.',
  },
  {
    initials: "JC",
    gradient: "from-amber-400 to-orange-500",
    name: "Jane Cooper",
    text: "Created a new task in Sprint 12.",
  },
];

const permissions = [
  { label: "task.create", on: true },
  { label: "board.edit", on: true },
  { label: "dashboard.view", on: false },
  { label: "member.invite", on: false },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-surface px-6 py-20">
      <FadeInView>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything your team needs to ship on time
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted">
            Maximize your team&apos;s productivity with an affordable,
            easy-to-use project management workspace.
          </p>
        </div>
      </FadeInView>

      <div className="mx-auto mt-12 max-w-5xl space-y-6">
        {/* Dynamic dashboard — spans full width */}
        <FadeInView>
          <article className="grid items-center gap-8 rounded-card border border-border bg-surface-muted p-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Dynamic dashboard
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                Get real-time visibility into progress, workload, and risk across
                every project — with data-driven insights that help you act early.
              </p>
              <Link
                href="/sign-in"
                className="mt-5 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Explore all
              </Link>
            </div>
            <FauxDashboardCard />
          </article>
        </FadeInView>

        {/* Three-column feature cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Smart notifications */}
          <FadeInView delay={0}>
            <article className="flex h-full flex-col rounded-card border border-border bg-surface-muted p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground">
                  Smart notifications
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted">
                  Stay in the loop — only for the activity that matters to you.
                </p>
              </div>

              <div className="mt-6 flex-1 rounded-card border border-border bg-surface p-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-sm font-semibold text-foreground">
                    Notifications
                  </span>
                  <button className="rounded-md bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    Save
                  </button>
                </div>
                <ul className="mt-3 space-y-3">
                  {notifications.map((n) => (
                    <li
                      key={n.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span
                        className={`text-xs ${n.disabled ? "text-subtle" : "text-muted"}`}
                      >
                        {n.label}
                      </span>
                      <span
                        className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                          n.on
                            ? "justify-end bg-primary"
                            : "justify-start bg-foreground/15"
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </FadeInView>

          {/* Task management */}
          <FadeInView delay={0.06}>
            <article className="flex h-full flex-col rounded-card border border-border bg-surface-muted p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground">
                  Task management
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted">
                  Assign work, set due dates, and keep every update in a shared
                  activity feed.
                </p>
              </div>

              <div className="mt-6 flex-1 rounded-card border border-border bg-surface p-4">
                <div className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      Design system audit
                    </p>
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-danger-soft text-danger">
                      High
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Avatar
                      initials="JC"
                      gradient="from-amber-400 to-orange-500"
                      className="h-5 w-5 ring-1! text-[8px]"
                    />
                    <span className="text-xs text-subtle">Jane Cooper</span>
                  </div>
                  <div className="mt-2 text-[10px] text-subtle">
                    Due Oct 30, 2026
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <LuMessageSquare className="h-3.5 w-3.5 text-primary" />
                    Activity
                  </span>
                  <button className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[10px] font-semibold text-white">
                    <LuPlus className="h-3 w-3" />
                    Comment
                  </button>
                </div>
                <ul className="mt-3 space-y-3">
                  {activity.map((a) => (
                    <li key={a.name} className="flex gap-2">
                      <Avatar
                        initials={a.initials}
                        gradient={a.gradient}
                        className="h-6 w-6 shrink-0 ring-1! text-[9px]"
                      />
                      <p className="text-xs leading-5 text-muted">
                        <span className="font-semibold text-foreground">
                          {a.name}
                        </span>{" "}
                        {a.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </FadeInView>

          {/* Role-based access */}
          <FadeInView delay={0.12}>
            <article className="flex h-full flex-col rounded-card border border-border bg-surface-muted p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground">
                  Role-based access
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted">
                  Define exactly who can view, edit, or manage any part of your
                  project.
                </p>
              </div>

              <div className="mt-6 flex-1 rounded-card border border-border bg-surface p-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <LuShield className="h-4 w-4 text-primary" />
                    Editor role
                  </span>
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success">
                    Active
                  </span>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {permissions.map((p) => (
                    <li
                      key={p.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="font-mono text-xs text-muted">
                        {p.label}
                      </span>
                      <span
                        className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                          p.on
                            ? "justify-end bg-primary"
                            : "justify-start bg-foreground/15"
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
