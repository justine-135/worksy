"use client";

import { Chip, Skeleton, Tabs } from "@heroui/react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  MdCalendarMonth,
  MdChevronLeft,
  MdChevronRight,
  MdExpandLess,
  MdExpandMore,
  MdViewDay,
  MdViewWeek,
} from "react-icons/md";

import { TASK_STATUS_CHIP, TASK_STATUS_LABELS } from "@/enum/taskStatus.enum";
import { TaskResponseDTO } from "@/types/task.dto";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

import TaskDetailDrawer from "../drawer/TaskDetailDrawer";

interface BoardCalendarViewProps {
  columns: TaskBoardResponseDTO[];
  isLoading: boolean;
}

// ─── Module-level constants ──────────────────────────────────────────────────

const SLOT_HEIGHT = 60; // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_MONTH_VISIBLE = 3;

const STATUS_BG: Record<string, string> = {
  accent: "bg-primary/10 text-primary-600",
  warning: "bg-warning/10 text-warning-600",
  success: "bg-success/10 text-success-600",
  default: "bg-default-100 text-default-600",
};

type AgendaView = "day" | "week" | "month";

function isAllDay(task: TaskResponseDTO): boolean {
  if (!task.dueDate) return true;
  const d = new Date(task.dueDate);
  return d.getHours() === 0 && d.getMinutes() === 0;
}

// ─── AgendaSkeleton ──────────────────────────────────────────────────────────

function AgendaSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-default-200">
        <Skeleton className="h-7 w-36 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <div className="flex border border-default-200 rounded-xl overflow-hidden">
        <div className="w-14 shrink-0" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 border-l border-default-200 p-2">
            <Skeleton className="h-4 w-8 rounded mx-auto mb-1" />
            <Skeleton className="h-6 w-8 rounded-full mx-auto" />
          </div>
        ))}
      </div>
      <div className="flex border border-default-200 rounded-xl overflow-hidden h-64">
        <div className="w-14 shrink-0 flex flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-15 flex items-start pt-1 pr-2">
              <Skeleton className="h-3 w-10 rounded ml-auto" />
            </div>
          ))}
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 border-l border-default-200" />
        ))}
      </div>
    </div>
  );
}

// ─── AgendaHeader ────────────────────────────────────────────────────────────

interface AgendaHeaderProps {
  currentDate: Date;
  activeView: AgendaView;
  onViewChange: (v: AgendaView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const VIEW_OPTIONS: { key: AgendaView; label: string; icon: React.ElementType }[] = [
  { key: "day", label: "Day", icon: MdViewDay },
  { key: "week", label: "Week", icon: MdViewWeek },
  { key: "month", label: "Month", icon: MdCalendarMonth },
];

function AgendaHeader({
  currentDate,
  activeView,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: AgendaHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 pb-3 border-b border-default-200">
      <h2 className="text-lg font-semibold text-foreground">
        {format(currentDate, "MMMM yyyy")}
      </h2>
      <div className="flex items-center gap-2">
        {/* View selector */}
        <Tabs
          selectedKey={activeView}
          onSelectionChange={(key) => onViewChange(key as AgendaView)}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Calendar view">
              {VIEW_OPTIONS.map(({ key, label, icon: Icon }) => (
                <Tabs.Tab key={key} id={key}>
                  <Icon className="size-4" />
                  {label}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
        {/* Navigation */}
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous"
          className="flex size-8 items-center justify-center rounded-lg border border-default-200 text-default-600 hover:bg-default-100 active:bg-default-200 transition-colors"
        >
          <MdChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={onToday}
          className="rounded-lg border border-default-200 px-2.5 py-1 text-xs font-medium text-default-600 hover:bg-default-100 active:bg-default-200 transition-colors"
        >
          Today
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next"
          className="flex size-8 items-center justify-center rounded-lg border border-default-200 text-default-600 hover:bg-default-100 active:bg-default-200 transition-colors"
        >
          <MdChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

// ─── AgendaWeekHeader ────────────────────────────────────────────────────────

function AgendaWeekHeader({ weekDates }: { weekDates: Date[] }) {
  return (
    <div className="flex border-b border-default-200 bg-content2">
      {/* Time gutter spacer */}
      <div className="w-14 shrink-0" />
      {weekDates.map((date) => {
        const today = isToday(date);
        return (
          <div
            key={date.toISOString()}
            className="flex-1 flex flex-col items-center py-2 border-l border-default-200"
          >
            <span className="text-[11px] font-medium uppercase tracking-wide text-default-400">
              {format(date, "EEE")}
            </span>
            <span
              className={[
                "mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-semibold",
                today ? "bg-primary text-white" : "text-foreground",
              ].join(" ")}
            >
              {format(date, "d")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── AgendaAllDaySection ─────────────────────────────────────────────────────

interface AgendaAllDaySectionProps {
  tasks: TaskResponseDTO[];
  isOpen: boolean;
  onToggle: () => void;
}

function AgendaAllDaySection({ tasks, isOpen, onToggle }: AgendaAllDaySectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (tasks.length === 0) return null;

  return (
    <div className="border-b border-default-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 px-3 py-2 bg-content2 hover:bg-default-100 transition-colors text-left"
      >
        {isOpen ? (
          <MdExpandLess className="size-4 text-default-400 shrink-0" />
        ) : (
          <MdExpandMore className="size-4 text-default-400 shrink-0" />
        )}
        <span className="text-xs font-medium text-default-500">All-day / Unscheduled</span>
        <span className="rounded-md bg-default-100 px-1.5 py-0.5 text-xs text-default-600">
          {tasks.length}
        </span>
      </button>
      {isOpen && (
        <div className="flex flex-col divide-y divide-default-100 bg-content1">
          {tasks.map((task) => {
            const chip = TASK_STATUS_CHIP[task.status] ?? "default";
            return (
              <div key={task.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("task", task.id);
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-default-50 text-left transition-colors"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {task.title}
                  </span>
                  <Chip
                    size="sm"
                    variant="soft"
                    className={`${STATUS_BG[chip]} border-0 text-xs font-medium shrink-0`}
                  >
                    {TASK_STATUS_LABELS[task.status]}
                  </Chip>
                </button>
                <div
                  className="pointer-events-none absolute size-0 overflow-hidden"
                  aria-hidden="true"
                >
                  <TaskDetailDrawer id={task.id} title={task.title} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── AgendaTimeSlotGroup ─────────────────────────────────────────────────────

interface AgendaTimeSlotGroupProps {
  tasks: TaskResponseDTO[];
  top: number;
}

function AgendaTimeSlotGroup({ tasks, top }: AgendaTimeSlotGroupProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div
      className="absolute left-1 right-1 flex flex-col gap-px overflow-hidden rounded-md"
      style={{ top, height: SLOT_HEIGHT }}
    >
      {tasks.map((task) => {
        const chip = TASK_STATUS_CHIP[task.status] ?? "default";
        return (
          <div key={task.id} className="relative min-h-0 flex-1">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("task", task.id);
                router.push(`${pathname}?${params.toString()}`);
              }}
              className={[
                "absolute inset-0 px-2 py-0.5 text-left text-xs",
                "cursor-pointer hover:opacity-90 transition-opacity overflow-hidden",
                STATUS_BG[chip] ?? STATUS_BG.default,
              ].join(" ")}
            >
              <span className="block truncate font-medium leading-tight">{task.title}</span>
            </button>
            <div
              className="pointer-events-none absolute size-0 overflow-hidden"
              aria-hidden="true"
            >
              <TaskDetailDrawer id={task.id} title={task.title} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AgendaTimeGrid ──────────────────────────────────────────────────────────

interface AgendaTimeGridProps {
  columns: Date[];
  tasks: TaskResponseDTO[];
}

function AgendaTimeGrid({ columns, tasks }: AgendaTimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 8 * SLOT_HEIGHT });
  }, []);

  const timedTasks = tasks.filter((t) => t.dueDate && !isAllDay(t));

  const tasksForColumn = (date: Date) =>
    timedTasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date));

  const now = new Date();
  const currentTimeTop = (now.getHours() + now.getMinutes() / 60) * SLOT_HEIGHT;

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto max-h-[calc(100vh-280px)] border-t border-default-200"
    >
      <div className="flex">
        {/* Time gutter */}
        <div className="w-14 shrink-0">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex items-start justify-end pr-2 pt-1 text-[11px] text-default-400"
              style={{ height: SLOT_HEIGHT }}
            >
              {h === 0 ? "" : format(new Date(2000, 0, 1, h), "h a")}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {columns.map((date) => {
          const today = isToday(date);
          const colTasks = tasksForColumn(date);
          return (
            <div
              key={date.toISOString()}
              className="flex-1 relative border-l border-default-200"
              style={{ minWidth: 0 }}
            >
              {/* Hour slot dividers */}
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="border-b border-default-100"
                  style={{ height: SLOT_HEIGHT }}
                />
              ))}

              {/* Current time indicator */}
              {today && (
                <div
                  className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                  style={{ top: currentTimeTop }}
                >
                  <span className="size-2 rounded-full bg-danger shrink-0 -ml-1" />
                  <div className="flex-1 border-t border-danger" />
                </div>
              )}

              {/* Task cards — grouped by hour to prevent overlap */}
              {Array.from(
                colTasks.reduce<Map<number, TaskResponseDTO[]>>((acc, task) => {
                  const hour = new Date(task.dueDate!).getHours();
                  if (!acc.has(hour)) acc.set(hour, []);
                  acc.get(hour)!.push(task);
                  return acc;
                }, new Map()),
              ).map(([hour, hourTasks]) => (
                <AgendaTimeSlotGroup
                  key={hour}
                  tasks={hourTasks}
                  top={hour * SLOT_HEIGHT}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AgendaWeekView ──────────────────────────────────────────────────────────

interface AgendaWeekViewProps {
  currentDate: Date;
  tasks: TaskResponseDTO[];
}

function AgendaWeekView({ currentDate, tasks }: AgendaWeekViewProps) {
  const [allDayOpen, setAllDayOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const weekEnd = addDays(weekStart, 6);
  const weekTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) >= weekStart &&
      new Date(t.dueDate) <= weekEnd,
  );
  const allDayTasks = [
    ...tasks.filter((t) => !t.dueDate),
    ...weekTasks.filter(isAllDay),
  ];

  return (
    <div className="mt-3 rounded-xl border border-default-200 overflow-hidden">
      <AgendaWeekHeader weekDates={weekDates} />
      <AgendaAllDaySection
        tasks={allDayTasks}
        isOpen={allDayOpen}
        onToggle={() => setAllDayOpen((o) => !o)}
      />
      <AgendaTimeGrid columns={weekDates} tasks={weekTasks} />
    </div>
  );
}

// ─── AgendaDayView ───────────────────────────────────────────────────────────

interface AgendaDayViewProps {
  currentDate: Date;
  tasks: TaskResponseDTO[];
}

function AgendaDayView({ currentDate, tasks }: AgendaDayViewProps) {
  const [allDayOpen, setAllDayOpen] = useState(false);

  const dayTasks = tasks.filter(
    (t) => t.dueDate && isSameDay(new Date(t.dueDate), currentDate),
  );
  const allDayTasks = [
    ...tasks.filter((t) => !t.dueDate),
    ...dayTasks.filter(isAllDay),
  ];

  return (
    <div className="mt-3 rounded-xl border border-default-200 overflow-hidden">
      {/* Single-day header */}
      <div className="flex border-b border-default-200 bg-content2">
        <div className="w-14 shrink-0" />
        <div className="flex-1 flex flex-col items-center py-2 border-l border-default-200">
          <span className="text-[11px] font-medium uppercase tracking-wide text-default-400">
            {format(currentDate, "EEE")}
          </span>
          <span
            className={[
              "mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-semibold",
              isToday(currentDate) ? "bg-primary text-white" : "text-foreground",
            ].join(" ")}
          >
            {format(currentDate, "d")}
          </span>
        </div>
      </div>
      <AgendaAllDaySection
        tasks={allDayTasks}
        isOpen={allDayOpen}
        onToggle={() => setAllDayOpen((o) => !o)}
      />
      <AgendaTimeGrid columns={[currentDate]} tasks={dayTasks} />
    </div>
  );
}

// ─── AgendaMonthView ─────────────────────────────────────────────────────────

interface AgendaMonthViewProps {
  currentDate: Date;
  tasks: TaskResponseDTO[];
}

function AgendaMonthView({ currentDate, tasks }: AgendaMonthViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPad = getDay(monthStart);
  const paddedDays: (Date | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...days,
  ];
  const remainder = paddedDays.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) paddedDays.push(null);
  }

  const tasksOnDate = (date: Date) =>
    tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date));

  return (
    <div className="mt-3 grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-default-200 bg-default-200">
      {/* Day-of-week headers */}
      {DAY_HEADERS.map((d) => (
        <div
          key={d}
          className="bg-content2 p-2 text-center text-xs font-semibold text-default-500"
        >
          {d}
        </div>
      ))}

      {/* Day cells */}
      {paddedDays.map((date, idx) => {
        if (!date) {
          return (
            <div key={`pad-${idx}`} className="min-h-25 bg-default-50 opacity-60" />
          );
        }
        const inMonth = isSameMonth(date, currentDate);
        const today = isToday(date);
        const cellTasks = tasksOnDate(date);
        const visible = cellTasks.slice(0, MAX_MONTH_VISIBLE);
        const overflow = cellTasks.length - MAX_MONTH_VISIBLE;

        return (
          <div
            key={date.toISOString()}
            className={[
              "min-h-25 bg-content1 p-2",
              !inMonth ? "opacity-50" : "",
              today ? "ring-2 ring-inset ring-primary/30" : "",
            ].join(" ")}
          >
            <div
              className={[
                "mb-1 text-xs font-medium",
                today
                  ? "flex size-6 items-center justify-center rounded-full bg-primary text-white"
                  : inMonth
                    ? "text-foreground"
                    : "text-default-400",
              ].join(" ")}
            >
              {format(date, "d")}
            </div>
            <div className="flex flex-col gap-0.5">
              {visible.map((task) => {
                const chip = TASK_STATUS_CHIP[task.status] ?? "default";
                return (
                  <div key={task.id} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("task", task.id);
                        router.push(`${pathname}?${params.toString()}`);
                      }}
                      className={[
                        "block w-full truncate rounded-md px-1.5 py-0.5 text-left text-xs",
                        "hover:opacity-80 transition-opacity",
                        STATUS_BG[chip] ?? STATUS_BG.default,
                      ].join(" ")}
                    >
                      {task.title}
                    </button>
                    <div
                      className="pointer-events-none absolute size-0 overflow-hidden"
                      aria-hidden="true"
                    >
                      <TaskDetailDrawer id={task.id} title={task.title} />
                    </div>
                  </div>
                );
              })}
              {overflow > 0 && (
                <span className="px-1 text-xs text-default-500">+{overflow} more</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BoardCalendarView({ columns, isLoading }: BoardCalendarViewProps) {
  const [activeView, setActiveView] = useState<AgendaView>("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const goNext = () =>
    setCurrentDate((d) =>
      activeView === "month"
        ? addMonths(d, 1)
        : activeView === "week"
          ? addWeeks(d, 1)
          : addDays(d, 1),
    );
  const goPrev = () =>
    setCurrentDate((d) =>
      activeView === "month"
        ? subMonths(d, 1)
        : activeView === "week"
          ? subWeeks(d, 1)
          : subDays(d, 1),
    );
  const goToday = () => setCurrentDate(new Date());

  if (isLoading) return <AgendaSkeleton />;

  const allTasks = columns.flatMap((col) => col.tasks);

  return (
    <div className="flex flex-col gap-0">
      <AgendaHeader
        currentDate={currentDate}
        activeView={activeView}
        onViewChange={setActiveView}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
      />
      {activeView === "week" && <AgendaWeekView currentDate={currentDate} tasks={allTasks} />}
      {activeView === "day" && <AgendaDayView currentDate={currentDate} tasks={allTasks} />}
      {activeView === "month" && (
        <AgendaMonthView currentDate={currentDate} tasks={allTasks} />
      )}
    </div>
  );
}
