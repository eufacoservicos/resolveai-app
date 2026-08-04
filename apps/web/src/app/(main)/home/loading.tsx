import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Category filter skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-lg" />
        ))}
      </div>

      {/* Provider cards skeleton */}
      <div>
        <Skeleton className="mb-3 h-6 w-32" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-white p-3"
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
    </div>
  );
}
