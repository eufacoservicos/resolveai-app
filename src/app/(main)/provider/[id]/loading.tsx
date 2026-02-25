import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderLoading() {
  return (
    <div className="pb-24">
      {/* Hero - centered avatar + name + categories + location */}
      <div className="flex flex-col items-center text-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="mt-3 h-6 w-44" />
        <div className="mt-2 flex gap-1.5">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-4 w-36" />
        <Skeleton className="mt-2 h-6 w-28 rounded-full" />
      </div>

      {/* Stats - 3 column grid */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-xl bg-muted/50 py-3 gap-1.5"
          >
            <Skeleton className="h-6 w-10" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>

      {/* About */}
      <div className="mt-6 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Business hours */}
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>

      {/* Portfolio - 4 column grid */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border p-4 space-y-2.5"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
