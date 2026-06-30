import { LuLayoutGrid, LuMessageSquare, LuPlus } from "react-icons/lu";

import Avatar from "./Avatar";

// Relative bar heights for the faux analytics chart (one is highlighted).
const bars = [40, 55, 35, 60, 48, 95, 52, 38, 62, 30, 58, 42];
const highlightedBar = 5;

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
    text: "Moved “Design review” to In Progress.",
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          <LuLayoutGrid className="h-3.5 w-3.5" />
          Features
        </span>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Everything your team needs to ship on time
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted">
          Maximize your team&apos;s productivity with an affordable,
          easy-to-use project management workspace.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-5xl space-y-6">
        {/* Dynamic dashboard — spans full width with chart mock */}
        <article className="grid items-center gap-8 rounded-3xl border border-border bg-surface-muted p-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Dynamic dashboard
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Get real-time visibility into progress, workload, and risk across
              every project — with data-driven insights that help you act early.
            </p>
            <a
              href="/sign-in"
              className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Explore all
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Acme Inc.
              </span>
              <div className="flex -space-x-2">
                <Avatar initials="A" gradient="from-rose-400 to-pink-500" className="h-6 w-6 ring-2! text-[10px]" />
                <Avatar initials="B" gradient="from-sky-400 to-indigo-500" className="h-6 w-6 ring-2! text-[10px]" />
                <Avatar initials="C" gradient="from-amber-400 to-orange-500" className="h-6 w-6 ring-2! text-[10px]" />
              </div>
            </div>
            <div className="mt-5 flex h-32 items-end justify-between gap-1.5">
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-full rounded-t ${
                    i === highlightedBar ? "bg-primary" : "bg-primary/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </article>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Smart notifications */}
          <article className="rounded-3xl border border-border bg-surface-muted p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground">
                Smart notifications
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted">
                Stay in the loop from the notification center, calendar, or email
                — only for the activity that matters to you.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-semibold text-foreground">
                  Email notification
                </span>
                <button className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
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
                        n.on ? "justify-end bg-primary" : "justify-start bg-foreground/15"
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
          <article className="rounded-3xl border border-border bg-surface-muted p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground">
                Task management
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted">
                Assign work, track progress, and keep approvals moving — every
                update is captured in a shared activity feed.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <LuMessageSquare className="h-4 w-4 text-primary" />
                  Activity
                </span>
                <button className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
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
                      <p className="text-sm leading-5 text-muted">
                        {a.text}
                      </p>
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
