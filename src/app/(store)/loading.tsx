import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/product-grid";

export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-12 py-8">
      <Skeleton className="mx-auto h-72 w-[92%] rounded-2xl" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
