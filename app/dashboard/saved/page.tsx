import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SavedPredictionsList } from '@/components/dashboard/SavedPredictionsList';

export default function SavedPredictionsPage() {
  return (
    <div>
      <DashboardPageHeader title="Saved predictions" subtitle="Predictions you've bookmarked for later." />
      <SavedPredictionsList />
    </div>
  );
}
