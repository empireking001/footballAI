'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Copy, Check, Loader2, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getReferralStats } from '@/lib/api/subscriptions';
import { formatCurrency } from '@/lib/utils';

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['referrals', 'me'],
    queryFn: getReferralStats,
  });

  const referralLink =
    typeof window !== 'undefined' && data
      ? `${window.location.origin}/register?ref=${data.referralCode}`
      : '';

  async function handleCopy() {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <DashboardPageHeader
        title="Referrals"
        subtitle="Share your link — earn a percentage of every friend's first subscription payment."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Gift className="h-4 w-4 text-vip" /> Total earnings
              </div>
              <div className="mt-2 font-mono text-3xl font-bold tabular-nums text-vip">
                {data ? formatCurrency(data.referralEarnings, 'NGN') : '—'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="text-xs text-muted">Your referral link</div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="h-10 flex-1 truncate rounded-md border border-border bg-surface-elevated px-3 text-xs text-foreground"
                />
                <Button size="sm" variant="secondary" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted">Code: {data?.referralCode}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
