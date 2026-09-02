import { cn } from "@/lib/utils";

interface ProductBadgesProps {
  isNew?: boolean;
  isOutOfStock?: boolean;
  discountPercent?: number;
  className?: string;
}

export function ProductBadges({ isNew, isOutOfStock, discountPercent, className }: ProductBadgesProps) {
  if (!isNew && !isOutOfStock && !discountPercent) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-x-2 top-2 flex flex-wrap gap-1.5", className)}>
      {isOutOfStock ? (
        <span className="rounded-full bg-foreground/80 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-background uppercase">
          Out of Stock
        </span>
      ) : (
        <>
          {!!discountPercent && discountPercent > 0 && (
            <span className="rounded-full bg-brand-sale px-2.5 py-1 text-[10px] font-semibold tracking-wide text-brand-sale-foreground uppercase">
              {discountPercent}% OFF
            </span>
          )}
          {isNew && (
            <span className="rounded-full bg-brand-rose px-2.5 py-1 text-[10px] font-semibold tracking-wide text-brand-rose-foreground uppercase">
              New
            </span>
          )}
        </>
      )}
    </div>
  );
}
