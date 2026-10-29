"use client";

import { Skeleton } from "@heroui/react";
import { MdCheck, MdSearch } from "react-icons/md";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import { MemberDataDTO } from "@/types/projectMember.dto";

import type { ActiveFilter } from "../BoardSearch";

export const PRIORITY_OPTIONS = [
  { value: "URGENT", label: "Urgent", dot: "bg-danger" },
  { value: "HIGH", label: "High", dot: "bg-warning" },
  { value: "MEDIUM", label: "Medium", dot: "bg-primary" },
  { value: "LOW", label: "Low", dot: "bg-default-400" },
];

export const STATUS_OPTIONS = [
  { value: "TODO", label: "Todo", dot: "bg-primary" },
  { value: "IN_PROGRESS", label: "In Progress", dot: "bg-warning" },
  { value: "DONE", label: "Done", dot: "bg-success" },
];

interface AssigneeContentProps {
  assigneesLoading: boolean;
  filteredMembers: MemberDataDTO[];
  activeFilter: ActiveFilter | null;
  memberSearch: string;
  setMemberSearch: (s: string) => void;
  selectAssignee: (id: string, name: string) => void;
}

export function AssigneeContent({
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
        <p className="py-6 text-center text-xs text-default-400">
          No members found
        </p>
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
                {isSelected && (
                  <MdCheck className="size-4 shrink-0 text-primary" />
                )}
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

export function PriorityContent({
  activeFilter,
  selectOption,
}: PriorityContentProps) {
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

export function StatusContent({
  activeFilter,
  selectOption,
}: StatusContentProps) {
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
