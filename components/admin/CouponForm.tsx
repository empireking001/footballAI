'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { adminCreate, adminUpdate } from '@/lib/api/admin';
import { Coupon } from '@/types/api';

const PLANS = ['monthly', 'quarterly', 'yearly'] as const;

const schema = z.object({
  code: z.string().trim().min(3).toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().positive(),
  applicablePlans: z.array(z.enum(PLANS)),
  maxUses: z.coerce.number().int().positive().optional().or(z.literal('')),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: coupon
      ? {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          applicablePlans: coupon.applicablePlans,
          maxUses: coupon.maxUses,
          expiresAt: coupon.expiresAt?.slice(0, 10),
          isActive: coupon.isActive,
        }
      : { discountType: 'percentage', applicablePlans: [], isActive: true },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const body = {
        ...values,
        maxUses: values.maxUses === '' ? undefined : values.maxUses,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined,
      };
      if (coupon) {
        await adminUpdate('coupons', coupon._id, body);
      } else {
        await adminCreate('coupons', body);
      }
      router.push('/admin/coupons');
      router.refresh();
    } catch {
      setServerError('Something went wrong saving this coupon.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      <Input label="Code" error={errors.code?.message} {...register('code')} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="discountType" className="text-sm font-medium text-foreground">
            Discount type
          </label>
          <select
            id="discountType"
            {...register('discountType')}
            className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <Input
          label="Discount value"
          type="number"
          step="0.01"
          error={errors.discountValue?.message}
          {...register('discountValue')}
        />
      </div>

      <div>
        <span className="text-sm font-medium text-foreground">Applicable plans</span>
        <p className="mb-2 text-xs text-muted">Leave all unchecked to apply to every plan.</p>
        <div className="flex gap-4">
          {PLANS.map((plan) => (
            <label key={plan} className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" value={plan} {...register('applicablePlans')} className="h-4 w-4 rounded border-border" />
              {plan}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Max uses (optional)" type="number" {...register('maxUses')} />
        <Input label="Expires on (optional)" type="date" {...register('expiresAt')} />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-border" />
        Active
      </label>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Saving…' : coupon ? 'Save changes' : 'Create coupon'}
      </Button>
    </form>
  );
}
