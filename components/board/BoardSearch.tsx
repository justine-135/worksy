"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import {
  MdCircle,
  MdClose,
  MdPerson,
  MdPriorityHigh,
  MdTitle,
} from "react-icons/md";

import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";

import {
  AssigneeContent,
  PriorityContent,
  StatusContent,
} from "./search/BoardSearchPopovers";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FilterType = "title" | "assignee" | "priority" | "status";

export interface ActiveFilter {
  type: FilterType;
  value: string | null;
  displayLabel: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TYPES = [
  { type: "title" as FilterType, label: "Title", Icon: MdTitle },
  { type: "assignee" as FilterType, label: "Assignee", Icon: MdPerson },
  { type: "priority" as FilterType, label: "Priority", Icon: MdPriorityHigh },
  { type: "status" as FilterType, label: "Status", Icon: MdCircle },
];

// ─── Main component props ─────────────────────────────────────────────────────

interface BoardSearchProps {
  projectId?: string | null;
  onFilterChange: (filters: ActiveFilter[]) => void;
}

// ─── BoardSearch ──────────────────────────────────────────────────────────────

export default function BoardSearch({ projectId, onFilterChange }: BoardSearchProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [subPopoverOpenIdx, setSubPopoverOpenIdx] = useState<number | null>(null);
  const [memberSearch, setMemberSearch] = useState("");

  const ghostInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived
  const usedTypes = useMemo(() => new Set(activeFilters.map((f) => f.type)), [activeFilters]);
  const availableTypes = FILTER_TYPES.filter((ft) => !usedTypes.has(ft.type));

  // Fetch members only when assignee filter is active
  const { data: assigneesData, isLoading: assigneesLoading } = useGetProjectMembers({
    projectId,
    take: 50,
    enabled: activeFilters.some((f) => f.type === "assignee"),
  });

  const filteredMembers = useMemo(() => {
    const members = assigneesData?.data ?? [];
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter((m) => m.user.name.toLowerCase().includes(q));
  }, [assigneesData, memberSearch]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function fireFilterChange(filters: ActiveFilter[]) {
    onFilterChange(filters);
  }

  function removeFilter(index: number) {
    const next = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fireFilterChange(next);
  }

  function handleTypeSelect(type: FilterType) {
    setTypePopoverOpen(false);
    const next: ActiveFilter = { type, value: null, displayLabel: null };
    const newFilters = [...activeFilters, next];
    setActiveFilters(newFilters);
    if (type === "title") {
      setTimeout(() => titleInputRef.current?.focus(), 0);
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    const newFilters = activeFilters.map((f) =>
      f.type === "title" ? { ...f, value: val || null, displayLabel: val || null } : f,
    );
    setActiveFilters(newFilters);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fireFilterChange(newFilters), 300);
  }

  function selectAssignee(memberId: string, name: string) {
    const newFilters = activeFilters.map((f, i) =>
      i === subPopoverOpenIdx ? { ...f, value: memberId, displayLabel: name } : f,
    );
    setActiveFilters(newFilters);
    setSubPopoverOpenIdx(null);
    fireFilterChange(newFilters);
  }

  function selectOption(value: string, label: string) {
    const newFilters = activeFilters.map((f, i) =>
      i === subPopoverOpenIdx ? { ...f, value, displayLabel: label } : f,
    );
    setActiveFilters(newFilters);
    setSubPopoverOpenIdx(null);
    fireFilterChange(newFilters);
  }

  function handleGhostKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === " " && availableTypes.length > 0) {
      e.preventDefault();
      setTypePopoverOpen(true);
    }
    if (e.key === "Backspace" && activeFilters.length > 0) {
      removeFilter(activeFilters.length - 1);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      role="search"
      aria-label="Filter tasks"
      className="flex flex-1 w-full flex-wrap items-center gap-1.5 rounded-xl border border-default-200 bg-content1 px-3 py-1.5 min-h-[38px] cursor-pointer transition-colors hover:border-default-400 focus-within:border-primary"
      onClick={() => {
        ghostInputRef.current?.focus();
      }}
    >
      {/* Chips */}
      <AnimatePresence initial={false}>
        {activeFilters.map((filter, index) => (
          <motion.span
            key={`${filter.type}-${index}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 pl-2 pr-1 py-0.5"
          >
            {/* Type label */}
            <span className="text-xs font-semibold text-primary capitalize select-none">
              {filter.type}:
            </span>

            {/* Value area */}
            {filter.type === "title" ? (
              <input
                ref={titleInputRef}
                aria-label="Filter by title"
                className="min-w-[80px] max-w-[180px] bg-transparent text-sm text-foreground outline-none placeholder:text-primary/50"
                placeholder="type to filter…"
                value={filter.value ?? ""}
                onChange={handleTitleChange}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Popover
                isOpen={subPopoverOpenIdx === index}
                onOpenChange={(open) => {
                  if (!open) setSubPopoverOpenIdx(null);
                }}
              >
                <PopoverTrigger>
                  <button
                    type="button"
                    aria-label={`Change ${filter.type} filter value`}
                    aria-haspopup="listbox"
                    aria-expanded={subPopoverOpenIdx === index}
                    className={[
                      "text-sm",
                      filter.displayLabel
                        ? "font-medium text-foreground hover:text-primary"
                        : "italic text-primary/60 hover:text-primary",
                    ].join(" ")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubPopoverOpenIdx(index);
                    }}
                  >
                    {filter.displayLabel ?? `Select…`}
                  </button>
                </PopoverTrigger>
                <PopoverContent placement="bottom start" className="p-0">
                  {filter.type === "assignee" && (
                    <AssigneeContent
                      assigneesLoading={assigneesLoading}
                      filteredMembers={filteredMembers}
                      activeFilter={filter}
                      memberSearch={memberSearch}
                      setMemberSearch={setMemberSearch}
                      selectAssignee={selectAssignee}
                    />
                  )}
                  {filter.type === "priority" && (
                    <PriorityContent activeFilter={filter} selectOption={selectOption} />
                  )}
                  {filter.type === "status" && (
                    <StatusContent activeFilter={filter} selectOption={selectOption} />
                  )}
                </PopoverContent>
              </Popover>
            )}

            {/* × remove button */}
            <span className="min-w-[24px] min-h-[24px] flex items-center justify-center">
              <button
                type="button"
                aria-label={`Remove ${filter.type} filter`}
                className="ml-0.5 rounded-sm p-0.5 text-primary/60 hover:bg-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFilter(index);
                }}
              >
                <MdClose className="size-3" />
              </button>
            </span>
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Ghost input + type picker popover */}
      {availableTypes.length > 0 && (
        <Popover isOpen={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
          <PopoverTrigger>
            {/* Invisible trigger; we open the popover programmatically */}
            <span className="sr-only" />
          </PopoverTrigger>
          <PopoverContent placement="bottom start" className="w-48 p-1">
            <div id="board-filter-type-listbox">
            <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-default-400">
              Filter by
            </p>
            {availableTypes.map(({ type, label, Icon }) => (
              <button
                key={type}
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-default-700 hover:bg-default-100 cursor-pointer"
                onClick={() => handleTypeSelect(type)}
              >
                <Icon className="size-4 shrink-0 text-default-500" />
                {label}
              </button>
            ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {availableTypes.length > 0 && (
        <div className="flex-1 min-w-[80px]">
          <input
            ref={ghostInputRef}
            readOnly
            role="combobox"
            aria-label="Add a filter"
            aria-haspopup="listbox"
            aria-expanded={typePopoverOpen}
            aria-controls="board-filter-type-listbox"
            className="w-full cursor-pointer bg-transparent text-sm outline-none placeholder:text-default-400 caret-transparent"
            placeholder={activeFilters.length === 0 ? "Filter…" : "Add filter…"}
            value=""
            onKeyDown={handleGhostKeyDown}
            onClick={(e) => {
              e.stopPropagation();
              if (availableTypes.length > 0) setTypePopoverOpen(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
