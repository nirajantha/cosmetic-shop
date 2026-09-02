import { ProductGridSkeleton } from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-9 w-56" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <Skeleton className="hidden h-96 w-full lg:block" />
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );
}
