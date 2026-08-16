import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PredictionsPageHeader } from '@/components/predictions/PageHeader';
import { DateNav, FixtureFeed } from '@/components/predictions/FixtureFeed';
import { fetchApi } from '@/lib/api/server';
import { FixtureFeedItem } from '@/types/api';

export const metadata: Metadata = {
  title: 'Next 7 Days of Football',
  description: 'Browse upcoming fixtures and AI analysis across the next seven days.',
};

export default async function WeekPredictionsPage() {
  const { data, error } = await fetchApi<FixtureFeedItem[]>('/predictions/feed?when=week&limit=100', {
    revalidate: 60,
    tags: ['fixtures', 'predictions-week'],
  });

  return (
    <>
      <PredictionsPageHeader
        eyebrow="The fixture board"
        title="Next 7 days"
        subtitle="Plan the week ahead. Every covered fixture stays visible while AI analysis is generated."
      />
      <Container className="py-10 sm:py-12">
        <DateNav active="week" />
        {error ? <div className="mb-6 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">The match feed is temporarily unavailable. Please refresh in a moment.</div> : null}
        <FixtureFeed items={data ?? []} emptyMessage="No fixtures are scheduled in the next seven days." />
      </Container>
    </>
  );
}
