import type { Metadata } from 'next';
import { MarketPredictionsPage } from '@/components/predictions/MarketPredictionsPage';

export const metadata: Metadata = {
  title: 'Both Teams to Score Predictions',
  description: 'Administrator-entered BTTS picks for upcoming football matches.',
};

export default function BttsPredictionsPage() {
  return (
    <MarketPredictionsPage
      eyebrow="BTTS"
      title="Both Teams to Score"
      subtitle="Yes/No picks entered by the administrator for covered fixtures."
      view="btts"
    />
  );
}
