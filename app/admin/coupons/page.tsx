'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminList } from '@/lib/api/admin';
import { Coupon } from '@/types/api';

export default function AdminCouponsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons', page],
    queryFn: () => adminList<Coupon>('coupons', { page, limit: 20 }),
  });

  const columns: Column<Coupon>[] = [
    { key: 'code', label: 'Code', render: (c) => <span className="font-mono font-semibold">{c.code}</span> },
    {
      key: 'discount',
      label: 'Discount',
      render: (c) => (c.discountType === 'percentage' ? `${c.discountValue}%` : `₦${c.discountValue}`),
    },
    { key: 'usedCount', label: 'Used', render: (c) => `${c.usedCount}${c.maxUses ? ` / ${c.maxUses}` : ''}` },
    {
      key: 'expiresAt',
      label: 'Expires',
      render: (c) => (c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (c) => <Badge variant={c.isActive ? 'live' : 'default'}>{c.isActive ? 'active' : 'inactive'}</Badge>,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        subtitle="Discount codes applied at checkout."
        action={
          <Button asChild>
            <Link href="/admin/coupons/new">
              <Plus className="h-4 w-4" /> New coupon
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(c) => c._id}
        isLoading={isLoading}
        onRowClick={(c) => router.push(`/admin/coupons/${c._id}`)}
        page={data?.meta.page}
        totalPages={data?.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
