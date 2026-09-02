import { Skeleton } from "@/components/ui/skeleton";

export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none border-b border-border last:border-0" />
        ))}
      </div>
    </div>
  );
}
