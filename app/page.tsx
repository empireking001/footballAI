import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { FeaturedPredictionBrowser } from '@/components/home/FeaturedPredictionBrowser';
import { fetchApi } from '@/lib/api/server';
import { Prediction } from '@/types/api';

export const metadata: Metadata = {
  title: 'Football AI Predictions',
  description: 'AI-powered football predictions with transparent supporting data, form, standings, and odds context.',
};

async function getFeatured(when: 'today' | 'tomorrow' | 'week'): Promise<Prediction[]> {
  const result = await fetchApi<Prediction[]>(`/predictions/featured?when=${when}&limit=50`, {
    revalidate: 120,
    tags: ['predictions', `predictions-${when}`],
  });
  return result.data ?? [];
}

export default async function HomePage() {
  const [today, tomorrow, week] = await Promise.all([
    getFeatured('today'),
    getFeatured('tomorrow'),
    getFeatured('week'),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_45%)]" />
        <Container className="relative">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-primary">Football intelligence</span>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-6xl">Make sense of every fixture before kickoff.</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">Football AI combines statistical modelling, automated fixture data, team form, standings, and market context into clear, informational predictions.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#featured" className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Browse featured picks</Link>
            <Link href="/leagues" className="rounded-md border border-border bg-surface-elevated px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50">Explore leagues</Link>
          </div>
        </Container>
      </section>
      <div id="featured">
        <FeaturedPredictionBrowser predictions={{ today, tomorrow, week }} />
      </div>
      <section className="py-12 sm:py-16">
        <Container className="grid gap-5 md:grid-cols-3">
          {[
            ['Statistical foundation', 'Poisson-based modelling turns fixture and team signals into calibrated probabilities.'],
            ['Supporting context', 'See recent form, league position, head-to-head history, and odds alongside every detailed prediction.'],
            ['Informational only', 'Football AI is not a betting or staking service. Use predictions as analytical context, not financial advice.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-border bg-surface-elevated p-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
