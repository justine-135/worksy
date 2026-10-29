"use client";

import { Popover, PopoverContent, PopoverTrigger, Skeleton } from "@heroui/react";
import {
  addDays,
  addWeeks,
  differenceInDays,
  format,
  getDay,
  getDaysInMonth,
  getMonth,
  getYear,
  isSameDay,
  isToday,
  startOfDay,
  subWeeks,
} from "date-fns";
import { useState } from "react";
import {
  MdArrowDropDown,
  MdCalendarToday,
  MdChevronLeft,
  MdChevronRight,
  MdTimeline,
} from "react-icons/md";

import CustomEmpty from "@/components/common/custom/CustomEmpty";
import { ETaskStatus } from "@/enum/taskStatus.enum";
import { TaskResponseDTO } from "@/types/task.dto";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

import TaskDetailDrawer from "../drawer/TaskDetailDrawer";

interface BoardTimelineViewProps {
  columns: TaskBoardResponseDTO[];
  isLoading: boolean;
}

const TOTAL_DAYS = 28;
const DAY_WIDTH_REM = 2; // each day column = 2rem

/** Indicator dot color per column status. */
const COLUMN_INDICATOR: Record<string, string> = {
  TODO: "bg-default-400",
  IN_PROGRESS: "bg-warning",
  DONE: "bg-success",
};

/** Bar color per status. */
const STATUS_BAR: Record<ETaskStatus, string> = {
  [ETaskStatus.TODO]: "bg-default-300 text-default-700",
  [ETaskStatus.IN_PROGRESS]: "bg-warning text-warning-900",
  [ETaskStatus.DONE]: "bg-success text-success-900",
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="overflow-hidden rounded-xl border border-default-200">
        <div className="flex">
          <div className="w-60 shrink-0 border-b border-r border-default-200 bg-content2 px-3 py-2">
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="flex flex-1 gap-px overflow-hidden bg-default-200 border-b border-default-200">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="h-8 flex-1 bg-content1" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex border-b border-default-100 last:border-0">
            <div className="w-60 shrink-0 border-r border-default-100 px-3 py-2.5">
              <Skeleton className="h-4 w-full rounded" />
            </div>
            <div className="flex flex-1 items-center px-2 py-2">
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Task Timeline Row ───────────────────────────────────────────────────────

function TaskTimelineRow({
  task,
  viewStart,
  totalDays,
  projectTitle,
}: {
  task: TaskResponseDTO;
  viewStart: Date;
  totalDays: number;
  projectTitle: string;
}) {
  const start = startOfDay(new Date(task.createdAt));
  const end = task.dueDate ? startOfDay(new Date(task.dueDate)) : start;

  const startOffset = differenceInDays(start, viewStart);
  const endOffset = differenceInDays(end, viewStart);

  // Task entirely outside view
  const isOutsideView = endOffset < 0 || startOffset >= totalDays;

  const clampedStart = Math.max(0, startOffset);
  const clampedEnd = Math.min(totalDays - 1, endOffset);
  const spanWidth = Math.max(1, clampedEnd - clampedStart + 1);

  const barColor = STATUS_BAR[task.status] ?? STATUS_BAR[ETaskStatus.TODO];
  const fullTicketId = `${projectTitle} #${task.ticketNumber}`;

  return (
    <div className="flex border-b border-default-100 last:border-0 hover:bg-default-50 transition-colors">
      {/* Left: task label */}
      <div className="flex w-60 shrink-0 flex-col justify-center gap-0.5 border-r border-default-100 px-3 py-2">
        <span className="text-xs text-default-400">{fullTicketId}</span>
        <span className="truncate text-sm text-foreground">
          <TaskDetailDrawer id={task.id} title={task.title} />
        </span>
      </div>

      {/* Right: timeline bar */}
      <div className="relative min-h-[2.5rem] flex-1 overflow-x-auto">
        <div
          className="relative h-full"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${totalDays}, ${DAY_WIDTH_REM}rem)`,
            minWidth: `${totalDays * DAY_WIDTH_REM}rem`,
          }}
        >
          {/* Background day columns */}
          {Array.from({ length: totalDays }).map((_, i) => (
            <div
              key={i}
              className={[
                "border-l border-default-100 min-h-[2.5rem]",
                isToday(addDays(viewStart, i)) ? "bg-primary/5" : "",
              ].join(" ")}
            />
          ))}

          {/* Task bar */}
          {!isOutsideView && (
            <div
              className="absolute inset-y-0 my-1.5 flex items-center"
              style={{
                left: `${clampedStart * DAY_WIDTH_REM}rem`,
                width: `${spanWidth * DAY_WIDTH_REM}rem`,
              }}
            >
              <div
                title={`${task.title} (${fullTicketId})`}
                className={[
                  "flex h-5 w-full items-center truncate rounded-full px-2 text-xs font-medium",
                  barColor,
                ].join(" ")}
              >
                {spanWidth > 2 ? task.title : ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BoardTimelineView({
  columns,
  isLoading,
}: BoardTimelineViewProps) {
  const [viewStart, setViewStart] = useState(() =>
    subWeeks(startOfDay(new Date()), 1),
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => getYear(new Date()));
  const [pickerMonth, setPickerMonth] = useState(() => getMonth(new Date()));

  if (isLoading) return <TimelineSkeleton />;

  const days = Array.from({ length: TOTAL_DAYS }, (_, i) =>
    addDays(viewStart, i),
  );

  const goToPrevWeek = () => setViewStart((d) => subWeeks(d, 1));
  const goToNextWeek = () => setViewStart((d) => addWeeks(d, 1));
  const goToToday = () => setViewStart(subWeeks(startOfDay(new Date()), 1));

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

  return (
    <div className="flex flex-col gap-3">
      {/* Navigation */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={goToPrevWeek}
          className="flex size-8 items-center justify-center rounded-lg border border-default-200 text-default-600 hover:bg-default-100 active:bg-default-200 transition-colors"
          aria-label="Previous week"
        >
          <MdChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={goToToday}
          className="rounded-lg border border-default-200 px-2.5 py-1 text-xs font-medium text-default-600 hover:bg-default-100 active:bg-default-200 transition-colors"
        >
          Today
        </button>
        <button
          type="button"
          onClick={goToNextWeek}
          className="flex size-8 items-center justify-center rounded-lg border border-default-200 text-default-600 hover:bg-default-100 active:bg-default-200 transition-colors"
          aria-label="Next week"
        >
          <MdChevronRight className="size-5" />
        </button>
        <Popover isOpen={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-default-200 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-default-100 active:bg-default-200 transition-colors"
              aria-label={`Jump to date — currently showing ${format(viewStart, "MMM d")} to ${format(addDays(viewStart, TOTAL_DAYS - 1), "MMM d, yyyy")}`}
              aria-expanded={pickerOpen}
              aria-haspopup="dialog"
            >
              <MdCalendarToday className="size-3.5" />
              {format(viewStart, "MMM d")} – {format(addDays(viewStart, TOTAL_DAYS - 1), "MMM d, yyyy")}
              <MdArrowDropDown
                className={`size-4 text-default-400 transition-transform duration-150 ${pickerOpen ? "rotate-180" : ""}`}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-3 w-60" placement="bottom start">
            {/* Year + Month navigation */}
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (pickerMonth === 0) {
                    setPickerYear((y) => y - 1);
                    setPickerMonth(11);
                  } else {
                    setPickerMonth((m) => m - 1);
                  }
                }}
                className="flex size-7 items-center justify-center rounded-md text-default-500 hover:bg-default-100 active:bg-default-200 transition-colors"
                aria-label="Previous month"
              >
                <MdChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-semibold text-foreground">
                {format(new Date(pickerYear, pickerMonth), "MMMM yyyy")}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (pickerMonth === 11) {
                    setPickerYear((y) => y + 1);
                    setPickerMonth(0);
                  } else {
                    setPickerMonth((m) => m + 1);
                  }
                }}
                className="flex size-7 items-center justify-center rounded-md text-default-500 hover:bg-default-100 active:bg-default-200 transition-colors"
                aria-label="Next month"
              >
                <MdChevronRight className="size-4" />
              </button>
            </div>
            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div
                  key={i}
                  className="py-0.5 text-center text-[10px] font-semibold text-default-400"
                >
                  {d}
                </div>
              ))}
              {/* leading empty cells */}
              {Array.from({
                length: getDay(new Date(pickerYear, pickerMonth, 1)),
              }).map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {/* day buttons */}
              {(() => {
                const rangeEnd = addDays(viewStart, TOTAL_DAYS - 1);
                return Array.from(
                  { length: getDaysInMonth(new Date(pickerYear, pickerMonth)) },
                  (_, i) => {
                    const day = new Date(pickerYear, pickerMonth, i + 1);
                    const isStart = isSameDay(day, viewStart);
                    const isEnd = isSameDay(day, rangeEnd);
                    const isInRange = day > viewStart && day < rangeEnd;
                    const isTodayDay = isToday(day);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setViewStart(startOfDay(day));
                          setPickerOpen(false);
                        }}
                        className={[
                          "flex size-7 items-center justify-center text-xs transition-colors",
                          isStart || isEnd
                            ? "rounded-full bg-primary text-white font-semibold"
                            : isInRange
                              ? "rounded-none bg-primary/10 text-primary-600"
                              : isTodayDay
                                ? "rounded-full ring-1 ring-primary/40 text-primary font-medium hover:bg-primary/10"
                                : "rounded-full text-default-700 hover:bg-default-100 active:bg-default-200",
                        ].join(" ")}
                      >
                        {i + 1}
                      </button>
                    );
                  },
                );
              })()}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Timeline table */}
      <div className="overflow-hidden rounded-xl border border-default-200">
        {/* Header row: Task label | date headers */}
        <div className="flex border-b border-default-200">
          <div className="w-60 shrink-0 border-r border-default-200 bg-content2 px-3 py-2 text-xs font-semibold text-default-500">
            Task
          </div>
          <div className="flex-1 overflow-x-auto">
            <div
              className="flex"
              style={{ minWidth: `${TOTAL_DAYS * DAY_WIDTH_REM}rem` }}
            >
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={[
                    "flex shrink-0 flex-col items-center justify-center border-l border-default-200 py-1 text-xs",
                    isToday(day)
                      ? "bg-primary/5 font-semibold text-primary"
                      : "bg-content2 text-default-500",
                  ].join(" ")}
                  style={{ width: `${DAY_WIDTH_REM}rem` }}
                >
                  <span>{format(day, "d")}</span>
                  <span className="text-[10px] opacity-70">{format(day, "E")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {totalTasks === 0 && (
          <div className="flex justify-center py-4">
            <CustomEmpty
              title="No tasks to display"
              message="Tasks with due dates will appear on the timeline."
              icon={MdTimeline}
            />
          </div>
        )}

        {/* Swimlanes per column */}
        {columns.map((column) => (
          <div key={column.id}>
            {/* Column header (swimlane label) */}
            <div className="flex border-b border-default-200 bg-default-50/60">
              <div className="flex w-60 shrink-0 items-center gap-2 border-r border-default-200 px-3 py-1.5">
                <div
                  className={[
                    "size-2 shrink-0 rounded-full",
                    COLUMN_INDICATOR[column.status] ?? "bg-default-300",
                  ].join(" ")}
                />
                <span className="text-xs font-semibold text-default-700">
                  {column.title}
                </span>
                <span className="rounded bg-default-100 px-1 py-0.5 text-xs text-default-500">
                  {column.tasks.length}
                </span>
              </div>
              <div
                className="flex-1"
                style={{ minWidth: `${TOTAL_DAYS * DAY_WIDTH_REM}rem` }}
              />
            </div>

            {/* Task rows */}
            {column.tasks.length === 0 ? (
              <div className="flex items-center justify-center py-3 text-xs italic text-default-400">
                No tasks in this column
              </div>
            ) : (
              column.tasks.map((task) => (
                <TaskTimelineRow
                  key={task.id}
                  task={task}
                  viewStart={viewStart}
                  totalDays={TOTAL_DAYS}
                  projectTitle={column.project.title}
                />
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
