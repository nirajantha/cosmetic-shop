import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function StoreNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-heading text-6xl">404</p>
      <h1 className="text-xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="text-sm text-muted-foreground">
        The product, category or brand you&apos;re looking for may have moved or is no longer available.
      </p>
      <Link href="/products" className={buttonVariants()}>Continue Shopping</Link>
    </div>
  );
}
