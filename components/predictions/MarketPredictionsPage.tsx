import { Container } from '@/components/ui/Container';
import { PredictionsPageHeader } from '@/components/predictions/PageHeader';
import { MarketPredictionCard } from '@/components/predictions/MarketPredictionCard';
import { fetchApi } from '@/lib/api/server';
import { Prediction } from '@/types/api';

interface MarketPredictionsPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  view: 'btts' | 'over-under' | 'correct-score' | 'double-chance';
}

export async function MarketPredictionsPage({ eyebrow, title, subtitle, view }: MarketPredictionsPageProps) {
  const { data } = await fetchApi<Prediction[]>('/predictions?limit=30', {
    cache: 'no-store',
  });
  const predictions = data ?? [];

  return (
    <>
      <PredictionsPageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <Container className="py-10 sm:py-12">
        {predictions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {predictions.map((prediction) => (
              <MarketPredictionCard key={prediction._id} prediction={prediction} view={view} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted">
            No manual picks are available right now — check back soon.
          </div>
        )}
      </Container>
    </>
  );
}
