import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

const BENEFITS = [
  'Higher-confidence picks across every market',
  'Full correct-score and cards/corners breakdowns',
  'Early access before free predictions unlock',
  'Priority support on WhatsApp',
];

export function VipTeaser() {
  return (
    <section className="border-y border-border bg-surface/50 py-14 sm:py-16">
      <Container>
        <div className="relative overflow-hidden rounded-xl border border-vip/30 bg-gradient-to-br from-vip/10 via-surface to-surface p-8 sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-vip/20 blur-[100px]"
          />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-vip">VIP tier</span>
              <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                Go deeper than the free feed
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted">
                Same statistical model, tuned for higher-conviction plays with the full market
                breakdown unlocked.
              </p>
              <Button variant="vip" size="lg" className="mt-6" asChild>
                <Link href="/pricing">
                  See VIP plans <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <ul className="flex flex-col gap-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-vip" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
