'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, CreditCard, Gift, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { useAuthStore } from '@/store/authStore';
import { getMySubscriptions } from '@/lib/api/subscriptions';
import { getReferralStats } from '@/lib/api/subscriptions';
import { formatCurrency } from '@/lib/utils';

export default function DashboardOverviewPage() {
  const user = useAuthStore((s) => s.user);

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: getMySubscriptions,
  });
  const { data: referrals } = useQuery({
    queryKey: ['referrals', 'me'],
    queryFn: getReferralStats,
  });

  const activeSub = subscriptions?.find((s) => s.status === 'active');

  return (
    <div>
      <DashboardPageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}`}
        subtitle="Here's what's happening with your account."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-start justify-between pt-5">
            <div>
              <span className="text-xs text-muted">Subscription</span>
              <div className="mt-1 font-display text-lg font-bold uppercase tracking-tight">
                {user?.subscriptionTier === 'vip' ? 'VIP' : 'Free'}
              </div>
              {activeSub && (
                <p className="mt-1 text-xs text-muted">
                  Renews {new Date(activeSub.endDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between pt-5">
            <div>
              <span className="text-xs text-muted">Referral earnings</span>
              <div className="mt-1 font-mono text-lg font-bold tabular-nums text-foreground">
                {referrals ? formatCurrency(referrals.referralEarnings, 'NGN') : '—'}
              </div>
              <p className="mt-1 text-xs text-muted">Code: {referrals?.referralCode ?? user?.referralCode}</p>
            </div>
            <Gift className="h-5 w-5 text-vip" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between pt-5">
            <div>
              <span className="text-xs text-muted">Saved predictions</span>
              <div className="mt-1 font-display text-lg font-bold uppercase tracking-tight">
                View all
              </div>
            </div>
            <Bookmark className="h-5 w-5 text-info" />
          </CardContent>
        </Card>
      </div>

      {user?.subscriptionTier !== 'vip' && (
        <div className="mt-6 rounded-xl border border-vip/30 bg-vip/5 p-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">
            Unlock VIP predictions
          </h2>
          <p className="mt-1 text-sm text-muted">
            Get the full market breakdown and higher-confidence picks.
          </p>
          <Button variant="vip" className="mt-4" asChild>
            <Link href="/pricing">
              See plans <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {!user?.isEmailVerified && (
        <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
          Your email isn&apos;t verified yet.{' '}
          <Link href="/dashboard/settings" className="font-semibold text-primary hover:underline">
            Resend the verification email
          </Link>{' '}
          from Settings.
        </div>
      )}
    </div>
  );
}
