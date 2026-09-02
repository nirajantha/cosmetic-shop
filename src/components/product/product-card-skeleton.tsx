import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
