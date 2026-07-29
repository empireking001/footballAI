import { cn } from '@/lib/utils';

interface MarketBarProps {
  label: string;
  optionA: { label: string; value: number };
  optionB: { label: string; value: number };
  colorA?: string;
  colorB?: string;
}

/** Two-option comparison bar for BTTS / Over-Under style markets. */
export function MarketBar({
  label,
  optionA,
  optionB,
  colorA = 'bg-primary',
  colorB = 'bg-info',
}: MarketBarProps) {
  const leading = optionA.value >= optionB.value ? 'A' : 'B';
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-muted">{label}</span>
      </div>
      <div className="flex h-8 w-full overflow-hidden rounded-md border border-border">
        <div
          className={cn(
            'flex items-center justify-center text-xs font-semibold tabular-nums transition-all',
            colorA,
            leading === 'A' ? 'text-primary-foreground' : 'text-foreground/70 opacity-50',
          )}
          style={{ width: `${Math.max(optionA.value, 8)}%` }}
        >
          {optionA.label} {optionA.value.toFixed(0)}%
        </div>
        <div
          className={cn(
            'flex items-center justify-center text-xs font-semibold tabular-nums transition-all',
            colorB,
            leading === 'B' ? 'text-info-foreground' : 'text-foreground/70 opacity-50',
          )}
          style={{ width: `${Math.max(optionB.value, 8)}%` }}
        >
          {optionB.label} {optionB.value.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
