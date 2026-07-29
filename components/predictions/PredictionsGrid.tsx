import { PredictionCard } from '@/components/predictions/PredictionCard';
import { Prediction } from '@/types/api';

export function PredictionsGrid({
  predictions,
  emptyMessage = 'No predictions available for this window yet — check back closer to kickoff.',
}: {
  predictions: Prediction[];
  emptyMessage?: string;
}) {
  if (predictions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {predictions.map((prediction) => (
        <PredictionCard key={prediction._id} prediction={prediction} />
      ))}
    </div>
  );
}
