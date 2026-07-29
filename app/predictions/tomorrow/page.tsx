import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PredictionsPageHeader } from '@/components/predictions/PageHeader';
import { PredictionsGrid } from '@/components/predictions/PredictionsGrid';
import { fetchApi } from '@/lib/api/server';
import { Prediction } from '@/types/api';

export const metadata: Metadata = {
  title: "Tomorrow's Football Predictions",
  description: 'AI-generated football predictions for every match kicking off tomorrow.',
};

export default async function TomorrowPredictionsPage() {
  const { data } = await fetchApi<Prediction[]>('/predictions?when=tomorrow&limit=50', {
    revalidate: 300,
    tags: ['predictions', 'predictions-tomorrow'],
  });

  return (
    <>
      <PredictionsPageHeader
        eyebrow="Tomorrow"
        title="Tomorrow's Predictions"
        subtitle="Get ahead of kickoff — free predictions for tomorrow's fixtures."
      />
      <Container className="py-10 sm:py-12">
        <PredictionsGrid
          predictions={data ?? []}
          emptyMessage="No predictions for tomorrow's fixtures yet — they're generated automatically each night."
        />
      </Container>
    </>
  );
}
