import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-20" />

      {/* Search bar + filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <Skeleton className="h-4 w-24" />

      {/* Provider cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-3"
          >
            <div className="flex gap-3">
              <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col justify-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
