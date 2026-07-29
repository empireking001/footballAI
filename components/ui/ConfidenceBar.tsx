'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConfidenceBarProps {
  home: number; // 0-100
  draw: number;
  away: number;
  homeLabel?: string;
  awayLabel?: string;
  className?: string;
}

/**
 * The site's signature element — a broadcast-style segmented probability
 * bar. Appears identically in the hero and every prediction card so the
 * shape becomes recognizable: this is what an AI prediction *looks like*
 * on this site, the same way a Sky Sports graphic has its own signature.
 */
export function ConfidenceBar({
  home,
  draw,
  away,
  homeLabel = '1',
  awayLabel = '2',
  className,
}: ConfidenceBarProps) {
  const segments = [
    { key: 'home', value: home, label: homeLabel, bar: 'bg-primary', text: 'text-primary' },
    { key: 'draw', value: draw, label: 'X', bar: 'bg-muted-foreground/50', text: 'text-muted' },
    { key: 'away', value: away, label: awayLabel, bar: 'bg-info', text: 'text-info' },
  ] as const;

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-1.5 flex justify-between font-mono text-xs tabular-nums">
        {segments.map((s) => (
          <span key={s.key} className={cn('font-semibold', s.text)}>
            {s.label} <span className="text-foreground">{s.value.toFixed(0)}%</span>
          </span>
        ))}
      </div>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-surface-elevated">
        {segments.map((s) => (
          <motion.div
            key={s.key}
            className={cn('h-full rounded-full', s.bar)}
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.max(s.value, 2)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
    </div>
  );
}
