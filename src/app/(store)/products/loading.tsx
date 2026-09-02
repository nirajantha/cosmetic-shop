import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/product-grid";

export default function ProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-4 h-9 w-56" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <div className="hidden lg:block">
          <Skeleton className="h-96 w-full" />
        </div>
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );
}
