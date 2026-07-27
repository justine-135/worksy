import { Skeleton } from "@heroui/react/skeleton";

export default function BoardSkeleton() {
  return (
    <div className="flex min-h-0 flex-col space-y-6 overflow-hidden">
      <div className="flex w-full gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="min-h-[calc(100vh-5.5rem)] w-75 shrink-0 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}
