import { Skeleton } from "@heroui/react/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </section>
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <Skeleton className="h-full min-h-72 w-full rounded-xl lg:col-span-1" />
      </div>
    </div>
  );
}
