import { Skeleton } from "@/components/ui/skeleton";

export default function OffersLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-9 w-56" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-16/9 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
