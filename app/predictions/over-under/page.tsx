import type { Metadata } from 'next';
import { MarketPredictionsPage } from '@/components/predictions/MarketPredictionsPage';

export const metadata: Metadata = {
  title: 'Over/Under Predictions',
  description: 'AI-generated Over/Under 2.5 goals predictions for upcoming football matches.',
};

export default function OverUnderPredictionsPage() {
  return (
    <MarketPredictionsPage
      eyebrow="Over/Under"
      title="Over/Under 2.5 Goals"
      subtitle="Total-goals probabilities derived from each match's expected-goals model."
      view="over-under"
    />
  );
}
