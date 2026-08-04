import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-5">
      {/* User header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Menu items */}
      <div className="rounded-xl border border-border bg-white divide-y divide-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>

      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}
