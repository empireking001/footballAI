'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { SeoMetaForm } from '@/components/admin/SeoMetaForm';
import { Button } from '@/components/ui/Button';
import { adminGet, adminRemove } from '@/lib/api/admin';

interface SeoMeta {
  _id: string;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogImageUrl?: string;
  canonicalUrl?: string;
}

export default function EditSeoOverridePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'seo', id],
    queryFn: () => adminGet<SeoMeta>('seo', id),
  });

  async function handleDelete() {
    if (!confirm('Delete this override?')) return;
    setDeleting(true);
    await adminRemove('seo', id);
    router.push('/admin/seo');
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
        title={`Edit — ${data.path}`}
        action={
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        }
      />
      <SeoMetaForm seo={data} />
    </div>
  );
}
