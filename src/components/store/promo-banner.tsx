import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative flex min-h-64 flex-col items-start justify-center gap-4 overflow-hidden rounded-2xl bg-foreground px-8 py-12 text-background sm:px-14">
        <Image
          src="https://picsum.photos/seed/aurelle-promo/1600/500"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="relative flex flex-col gap-3">
          <span className="text-xs font-medium tracking-widest uppercase opacity-80">Korean Skincare Edit</span>
          <h2 className="max-w-md font-heading text-3xl text-balance">
            The routine everyone&apos;s talking about
          </h2>
          <Link href="/categories/serum" className={buttonVariants({ variant: "secondary", className: "w-fit" })}>
            Shop Serums
          </Link>
        </div>
      </div>
    </section>
  );
}
