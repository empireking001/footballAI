import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AnnouncementForm } from '@/components/admin/AnnouncementForm';

export default function NewAnnouncementPage() {
  return (
    <div>
      <AdminPageHeader title="New announcement" />
      <AnnouncementForm />
    </div>
  );
}
