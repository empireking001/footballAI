'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AnnouncementForm } from '@/components/admin/AnnouncementForm';
import { Button } from '@/components/ui/Button';
import { adminGet, adminRemove } from '@/lib/api/admin';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  isActive: boolean;
  startAt?: string;
  endAt?: string;
}

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'announcements', id],
    queryFn: () => adminGet<Announcement>('announcements', id),
  });

  async function handleDelete() {
    if (!confirm('Delete this announcement?')) return;
    setDeleting(true);
    await adminRemove('announcements', id);
    router.push('/admin/announcements');
  }

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={`Edit — ${data.title}`}
        action={
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        }
      />
      <AnnouncementForm announcement={data} />
    </div>
  );
}
