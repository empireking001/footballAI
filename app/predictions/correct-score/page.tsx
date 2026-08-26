import type { Metadata } from 'next';
import { MarketPredictionsPage } from '@/components/predictions/MarketPredictionsPage';

export const metadata: Metadata = {
  title: 'Correct Score Predictions',
  description: 'Administrator-entered correct-score picks for upcoming football matches.',
};

export default function CorrectScorePredictionsPage() {
  return (
    <MarketPredictionsPage
      eyebrow="Correct Score"
      title="Correct Score Predictions"
      subtitle="Exact scoreline picks entered by the administrator for covered fixtures."
      view="correct-score"
    />
  );
}
