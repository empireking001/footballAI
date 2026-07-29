import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CouponForm } from '@/components/admin/CouponForm';

export default function NewCouponPage() {
  return (
    <div>
      <AdminPageHeader title="New coupon" />
      <CouponForm />
    </div>
  );
}
