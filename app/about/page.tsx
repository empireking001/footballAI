import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';
import { getSiteName } from '@/lib/api/server';

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return {
    title: 'About',
    description: `How ${siteName} presents live football data and administrator-entered manual picks.`,
  };
}

const PILLARS = [
  {
    title: 'Verified data',
    body: 'Fixtures, scores, standings, team records, form, and odds come from the connected football-data services and are shown with clear availability states.',
  },
  {
    title: 'Manual picks',
    body: 'Every user-facing selection is entered and reviewed by an administrator. The platform does not generate automated predictions or assistant recommendations.',
  },
  {
    title: 'Transparent context',
    body: 'Each match page brings the pick together with team comparison, recent form, head-to-head history, and league information so users can review the available facts.',
  },
];

export default async function AboutPage() {
  const siteName = await getSiteName();
  return (
    <>
      <div className="border-b border-border bg-surface/50 py-12 text-center sm:py-16">
        <Container className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">About</span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Football information you can review
          </h1>
          <p className="mt-3 text-sm text-muted">
            {siteName} combines live football information with clear, administrator-entered picks. We show the supporting facts instead of asking users to trust an unexplained number.
          </p>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title}>
              <CardContent className="pt-5">
                <h2 className="font-display text-lg font-bold uppercase tracking-tight">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
}
