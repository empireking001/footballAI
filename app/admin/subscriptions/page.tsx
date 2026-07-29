'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { adminList } from '@/lib/api/admin';
import { formatCurrency } from '@/lib/utils';

interface AdminSubscription {
  _id: string;
  user: { name: string; email: string };
  plan: string;
  status: string;
  provider: string;
  amount: number;
  currency: string;
  endDate: string;
}

const STATUS_VARIANT: Record<string, 'live' | 'default' | 'risk-high'> = {
  active: 'live',
  pending: 'default',
  failed: 'risk-high',
  cancelled: 'default',
  expired: 'default',
};

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', page],
    queryFn: () => adminList<AdminSubscription>('subscriptions', { page, limit: 20 }),
  });

  const columns: Column<AdminSubscription>[] = [
    {
      key: 'user',
      label: 'User',
      render: (s) => (
        <div>
          <div className="font-medium text-foreground">{s.user?.name}</div>
          <div className="text-xs text-muted">{s.user?.email}</div>
        </div>
      ),
    },
    { key: 'plan', label: 'Plan' },
    { key: 'provider', label: 'Provider' },
    { key: 'amount', label: 'Amount', render: (s) => formatCurrency(s.amount, s.currency) },
    { key: 'status', label: 'Status', render: (s) => <Badge variant={STATUS_VARIANT[s.status] ?? 'default'}>{s.status}</Badge> },
    { key: 'endDate', label: 'Ends', render: (s) => new Date(s.endDate).toLocaleDateString() },
  ];

  return (
    <div>
      <AdminPageHeader title="Subscriptions" subtitle="Read-only — activated automatically via payment webhooks." />
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
