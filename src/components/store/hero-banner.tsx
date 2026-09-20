import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24 lg:px-8">
        <div className="flex flex-col items-start gap-5">
          <span className="rounded-full bg-background px-3 py-1 text-xs font-medium tracking-wide uppercase">
            Authentic beauty, delivered
          </span>
          <h1 className="font-heading text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
            Skincare and makeup that actually works for you
          </h1>
          <p className="max-w-md text-base text-muted-foreground text-balance">
            Shop authentic, dermatologist- and expert-loved brands from Korea and beyond —
            curated for real routines, not just trends.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className={buttonVariants({ size: "lg" })}>Shop Now</Link>
            <Link href="/offers" className={buttonVariants({ size: "lg", variant: "outline" })}>
              View Offers
            </Link>
          </div>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted md:aspect-square">
          <Image
            src="https://picsum.photos/seed/aurelle-hero/1200/1200"
            alt="A curated flat-lay of Aurelle skincare and makeup essentials"
            fill
            preload
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
