'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getMySubscriptions, verifyPayment, cancelSubscription } from '@/lib/api/subscriptions';
import { formatCurrency } from '@/lib/utils';

function VerifyPaymentBanner() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'done'>('idle');

  useEffect(() => {
    if (!reference) return;
    setStatus('verifying');
    verifyPayment(reference)
      .then(() => queryClient.invalidateQueries({ queryKey: ['subscriptions', 'me'] }))
      .finally(() => setStatus('done'));
  }, [reference, queryClient]);

  if (!reference || status === 'idle') return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-live/30 bg-live/10 p-4 text-sm">
      {status === 'verifying' ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-live" /> Confirming your payment…
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4 text-live" /> Payment confirmed — your subscription is
          up to date below.
        </>
      )}
    </div>
  );
}

const STATUS_VARIANT: Record<string, 'default' | 'live' | 'risk-high'> = {
  active: 'live',
  pending: 'default',
  failed: 'risk-high',
  cancelled: 'default',
  expired: 'default',
};

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: getMySubscriptions,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelSubscription(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions', 'me'] }),
  });

  return (
    <div>
      <DashboardPageHeader title="Subscription" subtitle="Manage your VIP subscription and billing." />

      <Suspense fallback={null}>
        <VerifyPaymentBanner />
      </Suspense>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : subscriptions && subscriptions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {subscriptions.map((sub) => (
            <Card key={sub._id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold uppercase tracking-tight">
                      {sub.plan}
                    </span>
                    <Badge variant={STATUS_VARIANT[sub.status] ?? 'default'}>{sub.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {formatCurrency(sub.amount, sub.currency)} via {sub.provider} ·{' '}
                    {sub.status === 'active'
                      ? `renews ${new Date(sub.endDate).toLocaleDateString()}`
                      : `ended ${new Date(sub.endDate).toLocaleDateString()}`}
                  </p>
                </div>
                {sub.status === 'active' && sub.autoRenew && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate(sub._id)}
                  >
                    Cancel auto-renew
                  </Button>
                )}
                {sub.status === 'active' && !sub.autoRenew && (
                  <span className="text-xs text-muted">Auto-renew off — access ends at expiry</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted">You don&apos;t have any subscriptions yet.</p>
          <Button className="mt-4" variant="vip" asChild>
            <Link href="/pricing">See VIP plans</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
