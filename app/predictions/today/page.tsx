import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PredictionsPageHeader } from '@/components/predictions/PageHeader';
import { DateNav, FixtureFeed } from '@/components/predictions/FixtureFeed';
import { fetchApi } from '@/lib/api/server';
import { FixtureFeedItem } from '@/types/api';

export const metadata: Metadata = {
  title: "Today's Football Predictions",
  description: 'Today’s fixtures, AI predictions, live states, and analysis readiness.',
};

export default async function TodayPredictionsPage() {
  const { data, error } = await fetchApi<FixtureFeedItem[]>('/predictions/feed?when=today&limit=50', {
    cache: 'no-store',
  });

  return (
    <>
      <PredictionsPageHeader
        eyebrow="Match centre"
        title="Today’s fixtures"
        subtitle="See every match first. AI analysis appears as soon as the model finishes processing the fixture."
      />
      <Container className="py-10 sm:py-12">
        <DateNav active="today" />
        {error ? <div className="mb-6 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">The match feed is temporarily unavailable. Please refresh in a moment.</div> : null}
        <FixtureFeed items={data ?? []} emptyMessage="No fixtures are scheduled for today in the covered competitions." />
      </Container>
    </>
  );
}
