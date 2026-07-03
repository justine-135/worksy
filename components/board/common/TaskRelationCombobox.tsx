"use client";

import { ComboBox, Input, Label } from "@heroui/react";
import { useState } from "react";

import { useDebounce } from "@/hooks/common/useDebounce";
import { useSearchTask } from "@/hooks/task/useSearchTask";
import { TaskSearchResultDTO } from "@/types/task.dto";

interface Props {
  projectId?: string | null;
  // Tasks to keep out of the results (the current task + already-linked ones,
  // so they can't be picked again).
  excludeTaskIds?: string[];
  onSelect: (task: TaskSearchResultDTO) => void;
  // When the selection is being processed (e.g. the parent's save mutation), the
  // list is grayed out and click-blocked, and the picked row shows a spinner.
  isPending?: boolean;
  // Input placeholder — lets callers phrase the search for their mode
  // (e.g. "Search a parent task…" vs "Search a task to add as a child…").
  placeholder?: string;
}

/**
 * Searchable task picker used by both AddTaskModal and TaskDetailDrawer. Opens
 * showing the 5 most-recent tasks (empty query) and filters by title as you
 * type (debounced). Mirrors UserComboBox: the HeroUI ComboBox is just a shell —
 * the option rows are hand-rendered so we control the layout and click.
 */
export default function TaskRelationCombobox({
  projectId,
  excludeTaskIds = [],
  onSelect,
  isPending = false,
  placeholder = "Search a task...",
}: Props) {
  const [query, setQuery] = useState("");
  // The list (including the recent-tasks default) only appears once the input is
  // focused/clicked; blurring hides it again.
  const [isFocused, setIsFocused] = useState(false);
  // The row the user picked — kept so we can show a spinner on it while the
  // selection is being processed.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useSearchTask({
    projectId,
    query: debouncedQuery,
    // Don't fetch (not even the recent 5) until the input is focused.
    enabled: isFocused,
  });

  // Drop the current task and anything already linked so they can't be re-picked.
  const results = data.filter((task) => !excludeTaskIds.includes(task.id));

  return (
    <ComboBox aria-label="Search tasks to link" menuTrigger="input">
      <ComboBox.InputGroup>
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </ComboBox.InputGroup>

      {/* Stay open while a selection is being processed (even after the input
          blurs on click) so the loading animation is visible. */}
      {(isFocused || isPending) && (
        <div
          className={`mt-2 max-h-56 overflow-y-auto rounded-xl border border-default-200 shadow-sm ${
            isPending ? "pointer-events-none opacity-50" : ""
          }`}
          aria-busy={isPending}
        >
          {isLoading && (
            <p className="px-3 py-2 text-sm text-gray-400">Searching...</p>
          )}
          {!isLoading && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">No tasks found</p>
          )}
          {results.map((task) => (
            <div
              key={task.id}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 hover:bg-gray-50"
              // onMouseDown fires before the input's onBlur, so the selection
              // registers before the list is hidden.
              onMouseDown={() => {
                setSelectedId(task.id);
                onSelect(task);
              }}
            >
              {isPending && selectedId === task.id ? (
                <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              ) : (
                <span className="shrink-0 text-xs font-medium text-gray-400">
                  #{task.ticketNumber}
                </span>
              )}
              <Label className="cursor-pointer truncate text-sm font-medium">
                {task.title}
              </Label>
            </div>
          ))}
        </div>
      )}
    </ComboBox>
  );
}
