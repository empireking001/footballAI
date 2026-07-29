import type { Metadata } from 'next';
import { MarketPredictionsPage } from '@/components/predictions/MarketPredictionsPage';

export const metadata: Metadata = {
  title: 'Correct Score Predictions',
  description: 'AI-generated correct score predictions for upcoming football matches.',
};

export default function CorrectScorePredictionsPage() {
  return (
    <MarketPredictionsPage
      eyebrow="Correct Score"
      title="Correct Score Predictions"
      subtitle="The three most likely exact scorelines for every covered fixture."
      view="correct-score"
    />
  );
}
