'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, Column } from '@/components/admin/DataTable';
import { adminList } from '@/lib/api/admin';

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
}

export default function AdminNewsletterPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'newsletter', page],
    queryFn: () => adminList<Subscriber>('newsletter', { page, limit: 50 }),
  });

  const columns: Column<Subscriber>[] = [
    { key: 'email', label: 'Email' },
    { key: 'subscribedAt', label: 'Subscribed', render: (s) => new Date(s.subscribedAt).toLocaleDateString() },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Newsletter"
        subtitle={`${data?.meta.total ?? 0} active subscribers.`}
      />
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(s) => s._id}
        isLoading={isLoading}
        page={data?.meta.page}
        totalPages={data?.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
