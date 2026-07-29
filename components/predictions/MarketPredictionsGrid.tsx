import { MarketFocusCard } from '@/components/predictions/MarketFocusCard';
import { Prediction } from '@/types/api';

export function MarketPredictionsGrid({
  predictions,
  market,
  optionALabel,
  optionBLabel,
  emptyMessage,
}: {
  predictions: Prediction[];
  market: string;
  optionALabel: string;
  optionBLabel: string;
  emptyMessage: string;
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
        <MarketFocusCard
          key={prediction._id}
          prediction={prediction}
          market={market}
          optionALabel={optionALabel}
          optionBLabel={optionBLabel}
        />
      ))}
    </div>
  );
}
