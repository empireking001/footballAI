import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PredictionsPageHeader } from '@/components/predictions/PageHeader';
import { DateNav, FixtureFeed } from '@/components/predictions/FixtureFeed';
import { fetchApi } from '@/lib/api/server';
import { FixtureFeedItem } from '@/types/api';

export const metadata: Metadata = {
  title: "Tomorrow’s Football Predictions",
  description: 'Tomorrow’s fixtures, AI predictions, live states, and analysis readiness.',
};

export default async function TomorrowPredictionsPage() {
  const { data, error } = await fetchApi<FixtureFeedItem[]>('/predictions/feed?when=tomorrow&limit=50', {
    revalidate: 60,
    tags: ['fixtures', 'predictions-tomorrow'],
  });

  return (
    <>
      <PredictionsPageHeader
        eyebrow="Plan ahead"
        title="Tomorrow’s fixtures"
        subtitle="Get ahead of kickoff with upcoming matches and clear AI analysis readiness."
      />
      <Container className="py-10 sm:py-12">
        <DateNav active="tomorrow" />
        {error ? <div className="mb-6 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">The match feed is temporarily unavailable. Please refresh in a moment.</div> : null}
        <FixtureFeed items={data ?? []} emptyMessage="No fixtures are scheduled for tomorrow in the covered competitions." />
      </Container>
    </>
  );
}
