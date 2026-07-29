import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { MatchBreakdown } from '@/components/predictions/MatchBreakdown';
import { VipLockedMatch } from '@/components/predictions/VipLockedMatch';
import { fetchApi } from '@/lib/api/server';
import { Prediction } from '@/types/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPrediction(matchId: string) {
  return fetchApi<Prediction>(`/predictions/match/${matchId}`, { revalidate: 60 });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getPrediction(id);
  if (!data) return { title: 'Match prediction' };

  const title = `${data.match.homeTeam.name} vs ${data.match.awayTeam.name} Prediction`;
  return {
    title,
    description: `AI prediction for ${data.match.homeTeam.name} vs ${data.match.awayTeam.name}: ${data.confidenceScore}% confidence, ${data.riskRating} risk. ${data.aiExplanation.slice(0, 140)}`,
  };
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data, status } = await getPrediction(id);

  if (status === 403) {
    return <VipLockedMatch matchId={id} />;
  }

  if (!data) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
          No prediction yet
        </h1>
        <p className="max-w-sm text-sm text-muted">
          This match doesn&apos;t have a prediction generated yet — check back closer to kickoff.
        </p>
        <Button variant="secondary" asChild>
          <Link href="/predictions/today">Browse today&apos;s predictions</Link>
        </Button>
      </Container>
    );
  }

  return <MatchBreakdown prediction={data} />;
}
