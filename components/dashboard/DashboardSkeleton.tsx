import { Skeleton } from "@heroui/react/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Row 1: Stat cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </section>

      {/* Row 2: Progress + Priority */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-20 rounded-xl lg:col-span-2" />
        <Skeleton className="h-20 rounded-xl" />
      </div>

      {/* Row 3: Upcoming + Team workload */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl lg:col-span-2" />
      </div>

      {/* Row 4: Activity + Right column */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>

      {/* Row 5: Board columns */}
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
