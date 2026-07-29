import * as React from 'react';
import { cva, type VariantProps } from '@/lib/cva';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-surface-elevated text-muted border border-border',
        live: 'bg-live/15 text-live',
        vip: 'bg-vip/15 text-vip',
        'risk-low': 'bg-live/15 text-live',
        'risk-medium': 'bg-primary/15 text-primary',
        'risk-high': 'bg-danger/15 text-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
