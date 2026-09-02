interface TrendLineChartProps {
  title: string;
  points: { label: string; value: number }[];
  formatValue: (value: number) => string;
}

const WIDTH = 600;
const HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 24, left: 16 };

export function TrendLineChart({ title, points, formatValue }: TrendLineChartProps) {
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(1, ...points.map((p) => p.value));

  const coords = points.map((point, index) => {
    const x = PADDING.left + (index / Math.max(1, points.length - 1)) * innerWidth;
    const y = PADDING.top + innerHeight - (point.value / maxValue) * innerHeight;
    return { ...point, x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1]?.x ?? 0},${PADDING.top + innerHeight} L${coords[0]?.x ?? 0},${PADDING.top + innerHeight} Z`;
  const last = coords[coords.length - 1];

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-3 w-full" role="img" aria-label={title}>
        <line
          x1={PADDING.left}
          y1={PADDING.top + innerHeight}
          x2={WIDTH - PADDING.right}
          y2={PADDING.top + innerHeight}
          stroke="var(--border)"
          strokeWidth={1}
        />
        <path d={areaPath} fill="var(--primary)" opacity={0.1} stroke="none" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c) => (
          <circle key={c.label} cx={c.x} cy={c.y} r={3} fill="var(--primary)" stroke="var(--background)" strokeWidth={2}>
            <title>
              {c.label}: {formatValue(c.value)}
            </title>
          </circle>
        ))}
        {last && (
          <text x={last.x} y={last.y - 10} textAnchor="end" className="fill-foreground text-[11px] font-medium">
            {formatValue(last.value)}
          </text>
        )}
        <text x={PADDING.left} y={HEIGHT - 6} className="fill-muted-foreground text-[10px]">
          {points[0]?.label}
        </text>
        <text x={WIDTH - PADDING.right} y={HEIGHT - 6} textAnchor="end" className="fill-muted-foreground text-[10px]">
          {points[points.length - 1]?.label}
        </text>
      </svg>
    </div>
  );
}
