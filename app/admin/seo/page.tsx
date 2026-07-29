'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { adminList } from '@/lib/api/admin';

interface SeoMeta {
  _id: string;
  path: string;
  title: string;
  description: string;
}

export default function AdminSeoPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'seo', page],
    queryFn: () => adminList<SeoMeta>('seo', { page, limit: 20 }),
  });

  const columns: Column<SeoMeta>[] = [
    { key: 'path', label: 'Path', render: (s) => <span className="font-mono text-xs">{s.path}</span> },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description', render: (s) => <span className="line-clamp-1">{s.description}</span> },
  ];

  return (
    <div>
      <AdminPageHeader
        title="SEO overrides"
        subtitle="Per-path meta title/description overrides for the public site."
        action={
          <Button asChild>
            <Link href="/admin/seo/new">
              <Plus className="h-4 w-4" /> New override
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(s) => s._id}
        isLoading={isLoading}
        onRowClick={(s) => router.push(`/admin/seo/${s._id}`)}
        page={data?.meta.page}
        totalPages={data?.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
