"use client";

import { Popover, PopoverContent, PopoverTrigger, Skeleton } from "@heroui/react";
import { useMemo, useRef, useState } from "react";
import {
  MdCheck,
  MdCircle,
  MdClose,
  MdPerson,
  MdPriorityHigh,
  MdSearch,
  MdTitle,
} from "react-icons/md";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";
import { MemberDataDTO } from "@/types/projectMember.dto";

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

const PRIORITY_OPTIONS = [
  { value: "URGENT", label: "Urgent", dot: "bg-danger" },
  { value: "HIGH", label: "High", dot: "bg-warning" },
  { value: "MEDIUM", label: "Medium", dot: "bg-primary" },
  { value: "LOW", label: "Low", dot: "bg-default-400" },
];

const STATUS_OPTIONS = [
  { value: "TODO", label: "Todo", dot: "bg-primary" },
  { value: "IN_PROGRESS", label: "In Progress", dot: "bg-warning" },
  { value: "DONE", label: "Done", dot: "bg-success" },
];

// ─── Sub-popover components (module-scope to preserve identity) ───────────────

interface AssigneeContentProps {
  assigneesLoading: boolean;
  filteredMembers: MemberDataDTO[];
  activeFilter: ActiveFilter | null;
  memberSearch: string;
  setMemberSearch: (s: string) => void;
  selectAssignee: (id: string, name: string) => void;
}

function AssigneeContent({
  assigneesLoading,
  filteredMembers,
  activeFilter,
  memberSearch,
  setMemberSearch,
  selectAssignee,
}: AssigneeContentProps) {
  return (
    <div className="w-56 overflow-hidden p-0">
      {/* Search row */}
      <div className="flex items-center gap-2 border-b border-default-100 px-3 py-2">
        <MdSearch className="size-4 shrink-0 text-default-400" />
        <input
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-default-400 text-foreground"
          placeholder="Search members…"
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
        />
      </div>

      {/* Member list */}
      {assigneesLoading ? (
        <div className="py-1">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="mx-3 my-1 h-9 rounded-lg" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <p className="py-6 text-center text-xs text-default-400">No members found</p>
      ) : (
        <div className="max-h-52 overflow-y-auto py-1">
          {filteredMembers.map((member) => {
            const isSelected = activeFilter?.value === member.id;
            return (
              <button
                key={member.id}
                type="button"
                className={[
                  "flex w-full items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors",
                  isSelected ? "bg-primary/5" : "hover:bg-default-100",
                ].join(" ")}
                onClick={() => selectAssignee(member.id, member.user.name)}
              >
                <CustomAvatar
                  avatarProps={{ className: "size-6 shrink-0" }}
                  avatarImageProps={
                    member.user.image ? { src: member.user.image } : undefined
                  }
                  fallback={member.user.name}
                />
                <span className="flex-1 truncate text-left text-sm text-foreground">
                  {member.user.name}
                </span>
                {isSelected && <MdCheck className="size-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PriorityContentProps {
  activeFilter: ActiveFilter | null;
  selectOption: (value: string, label: string) => void;
}

function PriorityContent({ activeFilter, selectOption }: PriorityContentProps) {
  return (
    <div className="w-40 p-1">
      {PRIORITY_OPTIONS.map((opt) => {
        const isSelected = activeFilter?.value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={[
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
              isSelected
                ? "bg-primary/5 font-medium text-primary"
                : "text-foreground hover:bg-default-100",
            ].join(" ")}
            onClick={() => selectOption(opt.value, opt.label)}
          >
            <span className={`size-2 rounded-full shrink-0 ${opt.dot}`} />
            <span className="flex-1 text-left">{opt.label}</span>
            {isSelected && <MdCheck className="size-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

interface StatusContentProps {
  activeFilter: ActiveFilter | null;
  selectOption: (value: string, label: string) => void;
}

function StatusContent({ activeFilter, selectOption }: StatusContentProps) {
  return (
    <div className="w-40 p-1">
      {STATUS_OPTIONS.map((opt) => {
        const isSelected = activeFilter?.value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={[
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
              isSelected
                ? "bg-primary/5 font-medium text-primary"
                : "text-foreground hover:bg-default-100",
            ].join(" ")}
            onClick={() => selectOption(opt.value, opt.label)}
          >
            <span className={`size-2 rounded-full shrink-0 ${opt.dot}`} />
            <span className="flex-1 text-left">{opt.label}</span>
            {isSelected && <MdCheck className="size-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component props ─────────────────────────────────────────────────────

interface BoardSearchProps {
  projectId?: string | null;
  onFilterChange: (filter: ActiveFilter | null) => void;
}

// ─── BoardSearch ──────────────────────────────────────────────────────────────

export default function BoardSearch({ projectId, onFilterChange }: BoardSearchProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [subPopoverOpen, setSubPopoverOpen] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch members only when assignee filter is active
  const { data: assigneesData, isLoading: assigneesLoading } = useGetProjectMembers({
    projectId,
    take: 50,
    enabled: activeFilter?.type === "assignee",
  });

  const filteredMembers = useMemo(() => {
    const members = assigneesData?.data ?? [];
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter((m) => m.user.name.toLowerCase().includes(q));
  }, [assigneesData, memberSearch]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function clearFilter() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setActiveFilter(null);
    setTitleInput("");
    setMemberSearch("");
    setTypePopoverOpen(false);
    setSubPopoverOpen(false);
    onFilterChange(null);
  }

  function handleBarClick() {
    if (!activeFilter) {
      setTypePopoverOpen(true);
    }
  }

  function handleTypeSelect(type: FilterType) {
    setTypePopoverOpen(false);
    const next: ActiveFilter = { type, value: null, displayLabel: null };
    setActiveFilter(next);

    if (type === "title") {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSubPopoverOpen(true);
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitleInput(val);

    const next: ActiveFilter = { type: "title", value: val || null, displayLabel: val || null };
    setActiveFilter(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange(val ? next : null);
    }, 300);
  }

  function handleValueClick(e: React.MouseEvent) {
    e.stopPropagation();
    setSubPopoverOpen(true);
  }

  function selectAssignee(memberId: string, name: string) {
    const next: ActiveFilter = { type: "assignee", value: memberId, displayLabel: name };
    setActiveFilter(next);
    setSubPopoverOpen(false);
    onFilterChange(next);
  }

  function selectPriorityOrStatus(type: "priority" | "status", value: string, label: string) {
    const next: ActiveFilter = { type, value, displayLabel: label };
    setActiveFilter(next);
    setSubPopoverOpen(false);
    onFilterChange(next);
  }

  // Stable partial-application wrappers so prop references are stable per render
  function selectPriority(value: string, label: string) {
    selectPriorityOrStatus("priority", value, label);
  }

  function selectStatus(value: string, label: string) {
    selectPriorityOrStatus("status", value, label);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Popover isOpen={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
      <PopoverTrigger>
        <div
          role="button"
          tabIndex={0}
          aria-label="Filter tasks"
          aria-haspopup="listbox"
          aria-expanded={typePopoverOpen}
          className="flex items-center gap-1.5 rounded-xl border border-default-200 bg-content1 px-3 py-1.5 min-w-[200px] cursor-pointer hover:border-default-400 transition-colors"
          onClick={handleBarClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleBarClick();
          }}
        >
          {!activeFilter ? (
            <>
              <MdSearch className="size-4 shrink-0 text-default-400" />
              <span className="flex-1 select-none text-sm text-default-400">Filter…</span>
            </>
          ) : (
            <>
              {/* Active-type chip */}
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {activeFilter.type}:
                <button
                  type="button"
                  className="ml-0.5 rounded-sm p-0.5 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilter();
                  }}
                  aria-label="Clear filter"
                >
                  <MdClose className="size-3" />
                </button>
              </span>

              {/* Value area */}
              {activeFilter.type === "title" ? (
                <input
                  ref={inputRef}
                  className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-default-400 text-foreground"
                  placeholder="Search by title…"
                  value={titleInput}
                  onChange={handleTitleChange}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <Popover isOpen={subPopoverOpen} onOpenChange={setSubPopoverOpen}>
                  <PopoverTrigger>
                    <button
                      type="button"
                      className={[
                        "flex-1 text-left text-sm",
                        activeFilter.displayLabel
                          ? "font-medium text-foreground"
                          : "text-default-400",
                      ].join(" ")}
                      onClick={handleValueClick}
                    >
                      {activeFilter.displayLabel ?? `Select ${activeFilter.type}…`}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent placement="bottom start" className="p-0">
                    {activeFilter.type === "assignee" && (
                      <AssigneeContent
                        assigneesLoading={assigneesLoading}
                        filteredMembers={filteredMembers}
                        activeFilter={activeFilter}
                        memberSearch={memberSearch}
                        setMemberSearch={setMemberSearch}
                        selectAssignee={selectAssignee}
                      />
                    )}
                    {activeFilter.type === "priority" && (
                      <PriorityContent
                        activeFilter={activeFilter}
                        selectOption={selectPriority}
                      />
                    )}
                    {activeFilter.type === "status" && (
                      <StatusContent
                        activeFilter={activeFilter}
                        selectOption={selectStatus}
                      />
                    )}
                  </PopoverContent>
                </Popover>
              )}
            </>
          )}
        </div>
      </PopoverTrigger>

      {/* Type-picker popover content */}
      <PopoverContent placement="bottom start" className="w-48 p-1">
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-default-400">
          Filter by
        </p>
        {FILTER_TYPES.map(({ type, label, Icon }) => (
          <button
            key={type}
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-default-700 transition-colors hover:bg-default-100 active:bg-default-200 cursor-pointer"
            onClick={() => handleTypeSelect(type)}
          >
            <Icon className="size-4 shrink-0 text-default-500" />
            {label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
