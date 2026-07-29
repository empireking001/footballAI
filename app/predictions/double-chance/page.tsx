import type { Metadata } from 'next';
import { MarketPredictionsPage } from '@/components/predictions/MarketPredictionsPage';

export const metadata: Metadata = {
  title: 'Double Chance Predictions',
  description: 'AI-generated double chance predictions for upcoming football matches.',
};

export default function DoubleChancePredictionsPage() {
  return (
    <MarketPredictionsPage
      eyebrow="Double Chance"
      title="Double Chance Predictions"
      subtitle="1X and X2 combined-outcome probabilities for every covered fixture."
      view="double-chance"
    />
  );
}
