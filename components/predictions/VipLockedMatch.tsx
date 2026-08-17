'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Lock, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { MatchBreakdown } from '@/components/predictions/MatchBreakdown';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { Prediction } from '@/types/api';
import { AdBanner } from '@/components/ads/AdBanner';

/**
 * Rendered when the server-side fetch for a match's prediction came back
 * 403 (VIP-locked). Server Components can't read the in-memory access
 * token, so VIP-gated content is retried here on the client once the auth
 * store has hydrated from the refresh cookie.
 */
export function VipLockedMatch({ matchId, unavailableReason = 'vip' }: { matchId: string; unavailableReason?: 'vip' | 'disabled' | 'audience' }) {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isVip = user?.subscriptionTier === 'vip' || user?.role === 'admin' || user?.role === 'super_admin';
  const isAiUnavailable = unavailableReason !== 'vip';

  const { data, isLoading } = useQuery({
    queryKey: ['prediction', 'match', matchId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Prediction }>(`/predictions/match/${matchId}`);
      return data.data;
    },
    enabled: isHydrated && !!user && isVip && !isAiUnavailable,
  });

  if (!isHydrated || (!isAiUnavailable && isVip && isLoading)) {
    return (
      <Container className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </Container>
    );
  }

  if (data) return <MatchBreakdown prediction={data} />;

  return (
    <Container className="flex flex-col items-center gap-8 py-20">
      <AdBanner slotId="match-top" className="w-full max-w-2xl" />
      <div className="max-w-md rounded-xl border border-vip/30 bg-vip/5 p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-vip" />
        <h1 className="mt-4 font-display text-xl font-bold uppercase tracking-tight">
          {unavailableReason === 'disabled' ? 'AI analysis is currently off' : unavailableReason === 'audience' ? 'AI analysis is limited' : 'This is a VIP prediction'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {unavailableReason === 'disabled'
            ? 'The administrator has temporarily hidden AI analysis. The fixture remains available.'
            : unavailableReason === 'audience'
              ? 'The administrator has limited AI analysis to another audience. The fixture remains available.'
              : user
                ? 'Upgrade to VIP to see the full breakdown for this match.'
                : 'Log in and upgrade to VIP to see the full breakdown for this match.'}
        </p>
        {!isAiUnavailable && <Button variant="vip" className="mt-5" asChild>
          <Link href={user ? '/pricing' : '/login'}>{user ? 'See VIP plans' : 'Log in'}</Link>
        </Button>}
      </div>
    </Container>
  );
}
