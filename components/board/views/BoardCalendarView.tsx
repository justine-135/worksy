"use client";

import { Popover, PopoverContent, PopoverTrigger, Skeleton } from "@heroui/react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  getMonth,
  getYear,
  isSameDay,
  isSameMonth,
  isToday,
  setMonth,
  setYear,
  startOfMonth,
  subMonths,
} from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MdArrowDropDown, MdChevronLeft, MdChevronRight, MdExpandLess, MdExpandMore } from "react-icons/md";

import { TASK_STATUS_CHIP } from "@/enum/taskStatus.enum";
import { TaskResponseDTO } from "@/types/task.dto";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

import TaskDetailDrawer from "../drawer/TaskDetailDrawer";

interface BoardCalendarViewProps {
  columns: TaskBoardResponseDTO[];
  isLoading: boolean;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Maps ETaskStatus chip color name to a Tailwind bg class for the calendar chips. */
const STATUS_BG: Record<string, string> = {
  accent: "bg-primary/10 text-primary-600",
  warning: "bg-warning/10 text-warning-600",
  success: "bg-success/10 text-success-600",
  default: "bg-default-100 text-default-600",
};

const MAX_VISIBLE_PER_DAY = 3;

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-default-200 bg-default-200">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="bg-content2 px-2 py-2 text-center text-xs font-semibold text-default-500"
          >
            {d}
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-24 bg-content1 p-2">
            <Skeleton className="mb-1 h-4 w-6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Calendar Task Chip ──────────────────────────────────────────────────────

function CalendarTaskChip({
  task,
  colorClass,
}: {
  task: TaskResponseDTO;
  colorClass: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("task", task.id);
          router.push(`${pathname}?${params.toString()}`);
        }}
        className={[
          "block w-full truncate text-left rounded-md px-1.5 py-0.5 text-xs",
          "hover:opacity-80 transition-opacity",
          colorClass,
        ].join(" ")}
      >
        {task.title}
      </button>
      <div
        className="absolute size-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <TaskDetailDrawer id={task.id} title={task.title} />
      </div>
    </div>
  );
}

// ─── Day Cell ────────────────────────────────────────────────────────────────

function DayCell({
  date,
  tasks,
  currentMonth,
}: {
  date: Date;
  tasks: TaskResponseDTO[];
  currentMonth: Date;
}) {
  const inMonth = isSameMonth(date, currentMonth);
  const today = isToday(date);
  const visibleTasks = tasks.slice(0, MAX_VISIBLE_PER_DAY);
  const overflow = tasks.length - MAX_VISIBLE_PER_DAY;

  return (
    <div
      className={[
        "min-h-24 p-2 bg-content1",
        !inMonth ? "opacity-40" : "",
        today ? "ring-2 ring-inset ring-primary/30" : "",
      ].join(" ")}
    >
      <div
        className={[
          "mb-1 text-xs font-medium",
          today
            ? "flex size-5 items-center justify-center rounded-full bg-primary text-white"
            : inMonth
              ? "text-foreground"
              : "text-default-400",
        ].join(" ")}
      >
        {format(date, "d")}
      </div>
      <div className="flex flex-col gap-0.5">
        {visibleTasks.map((task) => {
          const chipColor = TASK_STATUS_CHIP[task.status] ?? "default";
          const colorClass = STATUS_BG[chipColor] ?? STATUS_BG.default;
          return (
            <CalendarTaskChip key={task.id} task={task} colorClass={colorClass} />
          );
        })}
        {overflow > 0 && (
          <span className="px-1 text-xs text-default-500">+{overflow} more</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BoardCalendarView({
  columns,
  isLoading,
}: BoardCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [unscheduledOpen, setUnscheduledOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => getYear(new Date()));

  if (isLoading) return <CalendarSkeleton />;

  const allTasks = columns.flatMap((col) => col.tasks);
  const scheduledTasks = allTasks.filter((t) => t.dueDate);
  const unscheduledTasks = allTasks.filter((t) => !t.dueDate);

  const tasksOnDate = (date: Date): TaskResponseDTO[] =>
    scheduledTasks.filter(
      (t) => t.dueDate && isSameDay(new Date(t.dueDate), date),
    );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with empty cells so the first day falls on the right weekday column
  const startPadding = getDay(monthStart); // 0 = Sunday
  const paddedDays: (Date | null)[] = [
    ...Array.from({ length: startPadding }, () => null),
    ...days,
  ];

  // Fill remaining cells so the grid is complete rows of 7
  const remainder = paddedDays.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      paddedDays.push(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="flex size-8 items-center justify-center rounded-lg border border-default-200 text-default-600 hover:bg-default-100 active:bg-default-200 transition-colors"
            aria-label="Previous month"
          >
            <MdChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(startOfMonth(new Date()))}
            className="rounded-lg border border-default-200 px-2.5 py-1 text-xs font-medium text-default-600 hover:bg-default-100 active:bg-default-200 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="flex size-8 items-center justify-center rounded-lg border border-default-200 text-default-600 hover:bg-default-100 active:bg-default-200 transition-colors"
            aria-label="Next month"
          >
            <MdChevronRight className="size-5" />
          </button>
        </div>

        <Popover isOpen={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-foreground hover:bg-default-100 active:bg-default-200 transition-colors"
              aria-label={`Jump to month — currently ${format(currentMonth, "MMMM yyyy")}`}
              aria-expanded={pickerOpen}
              aria-haspopup="dialog"
            >
              {format(currentMonth, "MMMM yyyy")}
              <MdArrowDropDown
                className={`size-4 text-default-400 transition-transform duration-150 ${pickerOpen ? "rotate-180" : ""}`}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-3 w-52" placement="bottom start">
            {/* Year navigation */}
            <div className="mb-2 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setPickerYear((y) => y - 1)}
                className="flex size-7 items-center justify-center rounded-md text-default-500 hover:bg-default-100 active:bg-default-200 transition-colors"
                aria-label="Previous year"
              >
                <MdChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-semibold">{pickerYear}</span>
              <button
                type="button"
                onClick={() => setPickerYear((y) => y + 1)}
                className="flex size-7 items-center justify-center rounded-md text-default-500 hover:bg-default-100 active:bg-default-200 transition-colors"
                aria-label="Next year"
              >
                <MdChevronRight className="size-4" />
              </button>
            </div>
            {/* 12 month buttons in a 3×4 grid */}
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 12 }, (_, i) => {
                const monthDate = startOfMonth(setMonth(setYear(new Date(), pickerYear), i));
                const isSelected = isSameMonth(monthDate, currentMonth);
                const isCurrentCalendarMonth = i === getMonth(new Date()) && pickerYear === getYear(new Date());
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(monthDate);
                      setPickerOpen(false);
                    }}
                    className={[
                      "rounded-lg py-1.5 text-xs font-medium transition-colors",
                      isSelected
                        ? "bg-primary text-white"
                        : isCurrentCalendarMonth
                          ? "ring-1 ring-primary/40 text-primary hover:bg-primary/10"
                          : "text-default-700 hover:bg-default-100 active:bg-default-200",
                    ].join(" ")}
                  >
                    {format(monthDate, "MMM")}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-default-200 bg-default-200">
        {/* Day-of-week headers */}
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="bg-content2 px-2 py-2 text-center text-xs font-semibold text-default-500"
          >
            {day}
          </div>
        ))}

        {/* Day cells */}
        {paddedDays.map((date, idx) =>
          date ? (
            <DayCell
              key={date.toISOString()}
              date={date}
              tasks={tasksOnDate(date)}
              currentMonth={currentMonth}
            />
          ) : (
            <div key={`pad-${idx}`} className="min-h-24 bg-content1/50" />
          ),
        )}
      </div>

      {/* Unscheduled tasks */}
      {unscheduledTasks.length > 0 && (
        <div className="rounded-xl border border-default-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setUnscheduledOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 bg-content2 hover:bg-default-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                Unscheduled
              </span>
              <span className="rounded-md bg-default-100 px-1.5 py-0.5 text-xs text-default-600">
                {unscheduledTasks.length}
              </span>
            </div>
            {unscheduledOpen ? (
              <MdExpandLess className="size-5 text-default-400" />
            ) : (
              <MdExpandMore className="size-5 text-default-400" />
            )}
          </button>

          {unscheduledOpen && (
            <div className="divide-y divide-default-100">
              {unscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-default-50 transition-colors"
                >
                  <div
                    className={[
                      "size-2 shrink-0 rounded-full",
                      STATUS_BG[TASK_STATUS_CHIP[task.status] ?? "default"]?.split(
                        " ",
                      )[0] ?? "bg-default-300",
                    ].join(" ")}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    <TaskDetailDrawer id={task.id} title={task.title} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
