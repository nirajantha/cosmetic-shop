interface BestSellersChartProps {
  items: { productName: string; quantitySold: number }[];
}

export function BestSellersChart({ items }: BestSellersChartProps) {
  const maxQuantity = Math.max(1, ...items.map((i) => i.quantitySold));

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background p-5">
        <h3 className="text-sm font-semibold">Best-Selling Products</h3>
        <p className="mt-4 text-sm text-muted-foreground">No sales data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="text-sm font-semibold">Best-Selling Products</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.productName} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="line-clamp-1 font-medium">{item.productName}</span>
              <span className="shrink-0 text-muted-foreground">{item.quantitySold} sold</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, (item.quantitySold / maxQuantity) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
