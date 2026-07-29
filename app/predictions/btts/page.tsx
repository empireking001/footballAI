import type { Metadata } from 'next';
import { MarketPredictionsPage } from '@/components/predictions/MarketPredictionsPage';

export const metadata: Metadata = {
  title: 'Both Teams to Score Predictions',
  description: 'AI-generated BTTS predictions for upcoming football matches.',
};

export default function BttsPredictionsPage() {
  return (
    <MarketPredictionsPage
      eyebrow="BTTS"
      title="Both Teams to Score"
      subtitle="Yes/No probabilities for every covered fixture, from the same statistical model."
      view="btts"
    />
  );
}
