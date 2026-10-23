"use client";

import { Skeleton } from "@heroui/react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LuSearch, LuUser } from "react-icons/lu";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import { useDebounce } from "@/hooks/common/useDebounce";
import { useSearchUser } from "@/hooks/user/useSearchUser";
import { useSessionStore } from "@/store/session.store";
import { UserResponseDTO } from "@/types/user.dto";

const ResultSkeleton = () => (
  <div className="flex items-center gap-3 px-3 py-2.5">
    <Skeleton className="size-8 shrink-0 rounded-full" />
    <div className="flex flex-1 flex-col gap-1.5">
      <Skeleton className="h-3 w-28 rounded-md" />
      <Skeleton className="h-2.5 w-40 rounded-md" />
    </div>
  </div>
);

interface Props {
  onSelect: (user: UserResponseDTO) => void;
}

export function UserComboBox({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userId = useSessionStore((s) => s.userId);

  const trimmed = query.trim();
  const debouncedQuery = useDebounce(trimmed, 300);

  const { data, isLoading } = useSearchUser({
    query: debouncedQuery,
    currentId: userId,
  });

  const showDropdown = isFocused && trimmed.length >= 1;
  const needsMoreInput = trimmed.length === 1;
  const showEmpty =
    showDropdown && !needsMoreInput && !isLoading && data.length === 0;

  useLayoutEffect(() => {
    if (showDropdown && containerRef.current) {
      setDropdownRect(containerRef.current.getBoundingClientRect());
    }
  }, [showDropdown]);

  const handleSelect = (user: UserResponseDTO) => {
    onSelect(user);
    setQuery("");
    inputRef.current?.blur();
  };

  const dropdown =
    showDropdown && dropdownRect
      ? createPortal(
          <div
            style={{
              position: "fixed",
              top: dropdownRect.bottom + 6,
              left: dropdownRect.left,
              width: dropdownRect.width,
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-xl border border-default-200 bg-content1 shadow-lg"
          >
            {needsMoreInput ? (
              <div className="px-3 py-4 text-center text-sm text-default-400">
                Keep typing to search…
              </div>
            ) : isLoading ? (
              <div className="divide-y divide-default-100">
                <ResultSkeleton />
                <ResultSkeleton />
              </div>
            ) : showEmpty ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <LuUser className="size-8 text-default-300" />
                <p className="text-sm text-default-500">
                  No users found for{" "}
                  <span className="font-medium text-default-700">
                    &ldquo;{trimmed}&rdquo;
                  </span>
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-default-100">
                {data.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 bg-content1 px-3 py-2.5 text-left transition-colors hover:bg-default-100 focus-visible:bg-default-100 focus-visible:outline-none"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(user)}
                    >
                      <CustomAvatar
                        avatarProps={{ size: "sm" }}
                        avatarImageProps={{
                          src: user.image || "",
                          alt: user.name || "User",
                        }}
                        avatarFallbackProps={{ className: "text-xs" }}
                        fallback={user.name || ""}
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-default-500">
                          {user.email}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors ${
          isFocused
            ? "border-primary bg-content1"
            : "border-default-200 bg-default-50 hover:border-default-300"
        }`}
      >
        <LuSearch
          className={`size-4 shrink-0 transition-colors ${isFocused ? "text-primary" : "text-default-400"}`}
        />
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-default-400"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          autoComplete="off"
        />
      </div>

      {dropdown}
    </div>
  );
}
