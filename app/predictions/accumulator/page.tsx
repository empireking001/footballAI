import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PredictionsPageHeader } from '@/components/predictions/PageHeader';
import { AccumulatorBuilder } from '@/components/predictions/AccumulatorBuilder';
import { fetchApi } from '@/lib/api/server';
import { Prediction } from '@/types/api';

export const metadata: Metadata = {
  title: 'Accumulator Builder',
  description: 'Build your own accumulator from AI-generated predictions and see the combined probability.',
};

export default async function AccumulatorPage() {
  const { data } = await fetchApi<Prediction[]>('/predictions?limit=15', { revalidate: 300 });
  const predictions = data ?? [];

  return (
    <>
      <PredictionsPageHeader
        eyebrow="Accumulator"
        title="Build Your Accumulator"
        subtitle="Pick an outcome from each match to see your combined probability and fair odds."
      />
      <Container className="py-10 sm:py-12">
        {predictions.length > 0 ? (
          <AccumulatorBuilder predictions={predictions} />
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted">
            No predictions available right now — check back soon.
          </div>
        )}
      </Container>
    </>
  );
}
