import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { PredictionCard } from '@/components/predictions/PredictionCard';
import { Prediction } from '@/types/api';

export function FixtureStrip({ predictions }: { predictions: Prediction[] }) {
  return (
    <section className="py-14 sm:py-16">
      <Container>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              Latest manual picks
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Latest administrator picks
            </h2>
          </div>
          <Link
            href="/predictions/today"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:flex"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {predictions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {predictions.map((prediction) => (
              <PredictionCard key={prediction._id} prediction={prediction} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
            No manual picks are available right now — administrators add picks as fixtures
            approach.
          </div>
        )}

        <Button variant="secondary" className="mt-6 w-full sm:hidden" asChild>
          <Link href="/predictions/today">View all picks</Link>
        </Button>
      </Container>
    </section>
  );
}
