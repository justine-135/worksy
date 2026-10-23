import { LuCalendar } from "react-icons/lu";

import Avatar from "../Avatar";
import FauxDashboardCard from "../FauxDashboardCard";

const colorSwatches = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
];

const kanbanColumns = [
  {
    label: "To Do",
    color: "text-muted",
    tasks: ["Update homepage copy", "Fix nav menu"],
  },
  {
    label: "In Progress",
    color: "text-stat-progress",
    tasks: ["Design audit", "API endpoints"],
  },
  {
    label: "Done",
    color: "text-stat-completed",
    tasks: ["Auth flow"],
  },
];

const inviteMembers = [
  {
    initials: "JC",
    gradient: "from-amber-400 to-orange-500",
    name: "Jane Cooper",
    role: "Editor",
  },
  {
    initials: "BS",
    gradient: "from-sky-400 to-indigo-500",
    name: "Bill Sanders",
    role: "Viewer",
  },
];

const dashboardStats = [
  { label: "Total", value: "24", color: "text-foreground" },
  { label: "In progress", value: "9", color: "text-stat-progress" },
  { label: "Done", value: "15", color: "text-stat-completed" },
];

export function StepVisual({ step }: { step: number }) {
  if (step === 1) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted">Project name</p>
          <div className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
            Q4 Product Launch
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted">Color</p>
          <div className="mt-1.5 flex gap-2">
            {colorSwatches.map((c, i) => (
              <span
                key={i}
                className={`h-6 w-6 rounded-full ${c} ${i === 0 ? "ring-2 ring-primary ring-offset-2" : ""}`}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted">Description</p>
          <div className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-xs text-subtle">
            Plan and track everything for Q4 release...
          </div>
        </div>
        <button className="w-full cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
          Create project
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
          <span className="h-3 w-3 rounded-full bg-subtle/30" />
          <span className="text-xs text-subtle">Search by name or email...</span>
        </div>
        {inviteMembers.map((m) => (
          <div
            key={m.name}
            className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
          >
            <Avatar
              initials={m.initials}
              gradient={m.gradient}
              className="h-7 w-7 text-[10px]"
            />
            <span className="flex-1 text-sm font-medium text-foreground">
              {m.name}
            </span>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
              {m.role}
            </span>
            <button className="cursor-pointer rounded-md bg-primary px-3 py-1 text-xs font-semibold text-white">
              Invite
            </button>
          </div>
        ))}
        <div className="flex items-center gap-3 rounded-md border border-dashed border-border px-3 py-2 opacity-40">
          <span className="h-7 w-7 rounded-full bg-surface-muted" />
          <span className="text-xs text-subtle">Add another member...</span>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {kanbanColumns.map((col) => (
          <div key={col.label} className="space-y-2">
            <p className={`text-xs font-semibold ${col.color}`}>{col.label}</p>
            {col.tasks.map((task) => (
              <div
                key={task}
                className="rounded-md border border-border bg-background px-2.5 py-2 text-xs text-muted shadow-sm"
              >
                {task}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="rounded-md border border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">
          Design system audit
        </p>
        <p className="mt-1 text-xs text-muted">
          Review all components for accessibility and consistency.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-subtle">
              Assignee
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <Avatar
                initials="JC"
                gradient="from-amber-400 to-orange-500"
                className="h-5 w-5 ring-1! text-[8px]"
              />
              <span className="text-xs text-foreground">Jane Cooper</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-subtle">
              Priority
            </p>
            <span className="mt-1 inline-block rounded bg-danger-soft px-1.5 py-0.5 text-[10px] font-semibold text-danger">
              High
            </span>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-subtle">
              Due date
            </p>
            <span className="mt-1 inline-flex items-center gap-1 rounded bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium text-warning">
              <LuCalendar className="h-3 w-3" />
              Oct 30, 2026
            </span>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-subtle">
              Status
            </p>
            <span className="mt-1 inline-block rounded bg-warning-soft px-1.5 py-0.5 text-[10px] font-semibold text-stat-progress">
              In Progress
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FauxDashboardCard
      chartContainerClassName="mt-4 h-24 gap-1"
      inactiveClass="bg-primary/15"
    >
      <div className="mt-4 grid grid-cols-3 gap-3">
        {dashboardStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-card border border-border bg-background p-3"
          >
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-0.5 text-xs text-subtle">{stat.label}</p>
          </div>
        ))}
      </div>
    </FauxDashboardCard>
  );
}
