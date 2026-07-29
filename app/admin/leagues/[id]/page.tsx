'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LeagueForm } from '@/components/admin/LeagueForm';
import { Button } from '@/components/ui/Button';
import { adminGet, adminRemove } from '@/lib/api/admin';
import { League } from '@/types/api';

export default function EditLeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'leagues', id],
    queryFn: () => adminGet<League>('leagues', id),
  });

  async function handleDelete() {
    if (!confirm('Delete this league? This cannot be undone.')) return;
    setDeleting(true);
    await adminRemove('leagues', id);
    router.push('/admin/leagues');
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
        title={`Edit — ${data.name}`}
        action={
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        }
      />
      <LeagueForm league={data} />
    </div>
  );
}
