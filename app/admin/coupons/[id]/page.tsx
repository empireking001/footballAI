'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CouponForm } from '@/components/admin/CouponForm';
import { Button } from '@/components/ui/Button';
import { adminGet, adminRemove } from '@/lib/api/admin';
import { Coupon } from '@/types/api';

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons', id],
    queryFn: () => adminGet<Coupon>('coupons', id),
  });

  async function handleDelete() {
    if (!confirm('Delete this coupon? This cannot be undone.')) return;
    setDeleting(true);
    await adminRemove('coupons', id);
    router.push('/admin/coupons');
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
        title={`Edit — ${data.code}`}
        action={
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        }
      />
      <CouponForm coupon={data} />
    </div>
  );
}
