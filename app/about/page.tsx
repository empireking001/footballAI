import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'About',
  description: 'How Football AI generates predictions and why we show our accuracy track record.',
};

const PILLARS = [
  {
    title: 'Statistics first',
    body: 'Every prediction starts with a Poisson expected-goals model built from real recent form, head-to-head history, and league scoring trends — not a black box.',
  },
  {
    title: 'Plain-English explanations',
    body: "We use AI to explain the numbers the model already produced, in a couple of sentences you can actually read before kickoff — never to invent a probability.",
  },
  {
    title: 'Graded, not just generated',
    body: 'Every prediction is automatically checked against the final result. Our accuracy stats on the home page are the real, ongoing track record — not a marketing number.',
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="border-b border-border bg-surface/50 py-12 text-center sm:py-16">
        <Container className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">About</span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Predictions you can actually check
          </h1>
          <p className="mt-3 text-sm text-muted">
            Football AI exists because most prediction sites ask you to trust a number with no way
            to verify it. We&apos;d rather show our work.
          </p>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title}>
              <CardContent className="pt-5">
                <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                  {pillar.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
}
