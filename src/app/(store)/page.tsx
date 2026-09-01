import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs tracking-wide uppercase">
        Foundation preview
      </Badge>
      <h1 className="font-heading text-5xl leading-tight tracking-tight text-balance">
        Aurelle
      </h1>
      <p className="max-w-md text-lg text-muted-foreground text-balance">
        Premium cosmetics, skincare, hair and body essentials — the storefront
        lands in the next phase. This page confirms the design system: fonts,
        colors and core UI components.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button>Shop Now</Button>
        <Button variant="outline">Explore Brands</Button>
        <Button variant="secondary">View Offers</Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-brand-sale px-3 py-1 text-xs font-medium text-brand-sale-foreground">
          20% OFF
        </span>
        <span className="rounded-full bg-brand-rose px-3 py-1 text-xs font-medium text-brand-rose-foreground">
          New
        </span>
        <span className="rounded-full bg-brand-gold px-3 py-1 text-xs font-medium text-brand-gold-foreground">
          Best Seller
        </span>
      </div>
    </main>
  );
}
