import { Skeleton } from "@heroui/react/skeleton";

/**
 * Skeleton for pages laid out as "search field + action button" over a table
 * (Members, Roles, ...). Mirrors the `flex flex-col space-y-6` detail layout.
 */
export default function TablePageSkeleton() {
  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
