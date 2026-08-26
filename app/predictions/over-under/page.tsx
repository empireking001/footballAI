import type { Metadata } from 'next';
import { MarketPredictionsPage } from '@/components/predictions/MarketPredictionsPage';

export const metadata: Metadata = {
  title: 'Over/Under Predictions',
  description: 'Administrator-entered Over/Under 2.5 goals picks for upcoming football matches.',
};

export default function OverUnderPredictionsPage() {
  return (
    <MarketPredictionsPage
      eyebrow="Over/Under"
      title="Over/Under 2.5 Goals"
      subtitle="Total-goals picks entered by the administrator for covered fixtures."
      view="over-under"
    />
  );
}
