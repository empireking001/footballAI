'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { TeamForm } from '@/components/admin/TeamForm';
import { Button } from '@/components/ui/Button';
import { adminGet, adminRemove } from '@/lib/api/admin';
import { Team } from '@/types/api';

type AdminTeam = Team & { shortName?: string; venueCity?: string; founded?: number; isActive: boolean };

export default function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'teams', id],
    queryFn: () => adminGet<AdminTeam>('teams', id),
  });

  async function handleDelete() {
    if (!confirm('Delete this team? This cannot be undone.')) return;
    setDeleting(true);
    await adminRemove('teams', id);
    router.push('/admin/teams');
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
      <TeamForm team={data} />
    </div>
  );
}
