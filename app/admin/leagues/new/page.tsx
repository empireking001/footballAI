import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LeagueForm } from '@/components/admin/LeagueForm';

export default function NewLeaguePage() {
  return (
    <div>
      <AdminPageHeader title="New league" />
      <LeagueForm />
    </div>
  );
}
