import Link from "next/link";
import { LuMessageSquare, LuPlus } from "react-icons/lu";

import Avatar from "./Avatar";
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

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-surface px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Everything your team needs to ship on time
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted">
          Maximize your team&apos;s productivity with an affordable,
          easy-to-use project management workspace.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-5xl space-y-6">
        {/* Dynamic dashboard — spans full width with chart mock */}
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Smart notifications */}
          <article className="rounded-card border border-border bg-surface-muted p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground">
                Smart notifications
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted">
                Stay in the loop from the notification center, calendar, or
                email — only for the activity that matters to you.
              </p>
            </div>

            <div className="mt-6 rounded-card border border-border bg-surface p-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-semibold text-foreground">
                  Email notification
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
                      className={`text-sm ${
                        n.disabled ? "text-subtle" : "text-muted"
                      }`}
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

          {/* Task management */}
          <article className="rounded-card border border-border bg-surface-muted p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground">
                Task management
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted">
                Assign work, track progress, and keep approvals moving — every
                update is captured in a shared activity feed.
              </p>
            </div>

            <div className="mt-6 rounded-card border border-border bg-surface p-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <LuMessageSquare className="h-4 w-4 text-primary" />
                  Activity
                </span>
                <button className="flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-white">
                  <LuPlus className="h-3 w-3" />
                  Comment
                </button>
              </div>
              <ul className="mt-4 space-y-4">
                {activity.map((a) => (
                  <li key={a.name} className="flex gap-3">
                    <Avatar
                      initials={a.initials}
                      gradient={a.gradient}
                      className="h-8 w-8 ring-2! text-[11px]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {a.name}
                      </p>
                      <p className="text-sm leading-5 text-muted">{a.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
