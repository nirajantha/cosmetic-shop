import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-56" />
        </div>
      </div>
    </div>
  );
}
