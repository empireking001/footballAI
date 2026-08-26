import type { Metadata } from 'next';
import { MarketPredictionsPage } from '@/components/predictions/MarketPredictionsPage';

export const metadata: Metadata = {
  title: 'Double Chance Predictions',
  description: 'Administrator-entered double chance picks for upcoming football matches.',
};

export default function DoubleChancePredictionsPage() {
  return (
    <MarketPredictionsPage
      eyebrow="Double Chance"
      title="Double Chance Predictions"
      subtitle="1X and X2 combined-outcome picks entered by the administrator for covered fixtures."
      view="double-chance"
    />
  );
}
