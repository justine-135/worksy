"use client";

import { Popover, PopoverContent, PopoverTrigger, Skeleton } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { MdCheck, MdClose, MdSearch } from "react-icons/md";

import CustomAvatar from "@/components/common/custom/CustomAvatar";

import type { ActiveFilter, AsyncFilterData, FilterDef, FilterOption } from "./types";

// ─── StaticPopoverContent ─────────────────────────────────────────────────────

interface StaticPopoverContentProps {
  options: FilterOption[];
  selectedValue: string | null;
  onSelect: (value: string, label: string) => void;
}

function StaticPopoverContent({ options, selectedValue, onSelect }: StaticPopoverContentProps) {
  return (
    <div className="w-40 p-1">
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
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
            onClick={() => onSelect(opt.value, opt.label)}
          >
            {opt.dot && <span className={`size-2 rounded-full shrink-0 ${opt.dot}`} />}
            <span className="flex-1 text-left">{opt.label}</span>
            {isSelected && <MdCheck className="size-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

// ─── AsyncPopoverContent ──────────────────────────────────────────────────────

interface AsyncPopoverContentProps {
  data: AsyncFilterData;
  selectedValue: string | null;
  onSelect: (value: string, label: string) => void;
}

function AsyncPopoverContent({ data, selectedValue, onSelect }: AsyncPopoverContentProps) {
  const { items, isLoading, search, onSearch } = data;

  return (
    <div className="w-56 overflow-hidden p-0">
      {/* Search row */}
      <div className="flex items-center gap-2 border-b border-default-100 px-3 py-2">
        <MdSearch className="size-4 shrink-0 text-default-400" />
        <input
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-default-400 text-foreground"
          placeholder="Search…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-1">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="mx-3 my-1 h-9 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-xs text-default-400">No results found</p>
      ) : (
        <div className="max-h-52 overflow-y-auto py-1">
          {items.map((item) => {
            const isSelected = selectedValue === item.value;
            return (
              <button
                key={item.value}
                type="button"
                className={[
                  "flex w-full items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors",
                  isSelected ? "bg-primary/5" : "hover:bg-default-100",
                ].join(" ")}
                onClick={() => onSelect(item.value, item.label)}
              >
                {item.avatar && (
                  <CustomAvatar
                    avatarProps={{ className: "size-6 shrink-0" }}
                    avatarImageProps={item.avatar.src ? { src: item.avatar.src } : undefined}
                    fallback={item.avatar.name}
                  />
                )}
                <span className="flex-1 truncate text-left text-sm text-foreground">
                  {item.label}
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

// ─── TableSearch ──────────────────────────────────────────────────────────────

interface TableSearchProps {
  filterDefs: FilterDef[];
  onFilterChange: (filters: ActiveFilter[]) => void;
  asyncData?: Record<string, AsyncFilterData>;
  placeholder?: string;
  ariaLabel?: string;
}

export default function TableSearch({
  filterDefs,
  onFilterChange,
  asyncData,
  placeholder,
  ariaLabel = "Filter",
}: TableSearchProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [subPopoverOpenIdx, setSubPopoverOpenIdx] = useState<number | null>(null);

  const ghostInputRef = useRef<HTMLInputElement>(null);
  const textInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const usedTypes = new Set(activeFilters.map((f) => f.type));
  const availableTypes = filterDefs.filter((fd) => !usedTypes.has(fd.type));

  // ── Handlers ────────────────────────────────────────────────────────────────

  const fireFilterChange = (filters: ActiveFilter[]) => {
    onFilterChange(filters);
  };

  const removeFilter = (index: number) => {
    const next = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fireFilterChange(next);
  };

  const handleTypeSelect = (type: string) => {
    setTypePopoverOpen(false);
    const next: ActiveFilter = { type, value: null, displayLabel: null };
    const newFilters = [...activeFilters, next];
    setActiveFilters(newFilters);
    const def = filterDefs.find((fd) => fd.type === type);
    if (def?.kind === "text") {
      setTimeout(() => textInputRefs.current[type]?.focus(), 0);
    }
  };

  const handleTextChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newFilters = activeFilters.map((f) =>
      f.type === type ? { ...f, value: val || null, displayLabel: val || null } : f,
    );
    setActiveFilters(newFilters);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fireFilterChange(newFilters), 300);
  };

  const selectOption = (value: string, label: string) => {
    const newFilters = activeFilters.map((f, i) =>
      i === subPopoverOpenIdx ? { ...f, value, displayLabel: label } : f,
    );
    setActiveFilters(newFilters);
    setSubPopoverOpenIdx(null);
    fireFilterChange(newFilters);
  };

  const handleGhostKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " && availableTypes.length > 0) {
      e.preventDefault();
      setTypePopoverOpen(true);
    }
    if (e.key === "Backspace" && activeFilters.length > 0) {
      removeFilter(activeFilters.length - 1);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      role="search"
      aria-label={ariaLabel}
      className="flex flex-1 w-full flex-wrap items-center gap-1.5 rounded-xl border border-default-200 bg-content1 px-3 py-1.5 min-h-9.5 cursor-pointer transition-colors hover:border-default-400 focus-within:border-primary"
      onClick={() => ghostInputRef.current?.focus()}
    >
      {/* Chips */}
      <AnimatePresence initial={false}>
        {activeFilters.map((filter, index) => {
          const def = filterDefs.find((fd) => fd.type === filter.type);

          return (
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
                {def?.label ?? filter.type}:
              </span>

              {/* Value area */}
              {def?.kind === "text" ? (
                <input
                  ref={(el) => {
                    textInputRefs.current[filter.type] = el;
                  }}
                  aria-label={`Filter by ${def.label}`}
                  className="min-w-20 max-w-45 bg-transparent text-sm text-foreground outline-none placeholder:text-primary/50"
                  placeholder="type to filter…"
                  value={filter.value ?? ""}
                  onChange={(e) => handleTextChange(filter.type, e)}
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
                      {filter.displayLabel ?? "Select…"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent placement="bottom start" className="p-0">
                    {def?.kind === "static" && def.options && (
                      <StaticPopoverContent
                        options={def.options}
                        selectedValue={filter.value}
                        onSelect={selectOption}
                      />
                    )}
                    {def?.kind === "async" && asyncData?.[filter.type] && (
                      <AsyncPopoverContent
                        data={asyncData[filter.type]}
                        selectedValue={filter.value}
                        onSelect={selectOption}
                      />
                    )}
                  </PopoverContent>
                </Popover>
              )}

              {/* × remove button */}
              <span className="min-w-6 min-h-6 flex items-center justify-center">
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
          );
        })}
      </AnimatePresence>

      {/* Type-picker popover + ghost input */}
      {availableTypes.length > 0 && (
        <Popover isOpen={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
          <PopoverTrigger>
            <span className="sr-only" />
          </PopoverTrigger>
          <PopoverContent placement="bottom start" className="w-48 p-1">
            <div id="table-filter-type-listbox">
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
        <div className="flex-1 min-w-20">
          <input
            ref={ghostInputRef}
            readOnly
            role="combobox"
            aria-label="Add a filter"
            aria-haspopup="listbox"
            aria-expanded={typePopoverOpen}
            aria-controls="table-filter-type-listbox"
            className="w-full cursor-pointer bg-transparent text-sm outline-none placeholder:text-default-400 caret-transparent"
            placeholder={activeFilters.length === 0 ? (placeholder ?? "Filter…") : "Add filter…"}
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
