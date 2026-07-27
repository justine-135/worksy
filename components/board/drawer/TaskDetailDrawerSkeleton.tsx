import { Skeleton } from "@heroui/react/skeleton";

export const TaskDetailDrawerSkeleton = () => (
  <div className="flex gap-6">
    <div className="min-w-0 flex-1">
      <div className="flex gap-4">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-1 h-32 w-full rounded-xl" />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex gap-4">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Right: sidebar sections (assignees, column, status, participants) */}
    <aside className="w-64 shrink-0 space-y-6 border-l border-default-200 pl-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
    </aside>
  </div>
);
