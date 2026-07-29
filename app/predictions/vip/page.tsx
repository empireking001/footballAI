'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Lock, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { PredictionsPageHeader } from '@/components/predictions/PageHeader';
import { PredictionsGrid } from '@/components/predictions/PredictionsGrid';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { Prediction } from '@/types/api';

function UpsellCard({ title, message, cta, href }: { title: string; message: string; cta: string; href: string }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-vip/30 bg-vip/5 p-8 text-center">
      <Lock className="mx-auto h-8 w-8 text-vip" />
      <h2 className="mt-4 font-display text-xl font-bold uppercase tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <Button variant="vip" className="mt-5" asChild>
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}

export default function VipPredictionsPage() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const isVip = user?.subscriptionTier === 'vip' || user?.role === 'admin' || user?.role === 'super_admin';

  const { data, isLoading } = useQuery({
    queryKey: ['predictions', 'vip'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Prediction[] }>('/predictions/vip?limit=50');
      return data.data;
    },
    enabled: isHydrated && !!user && isVip,
  });

  return (
    <>
      <PredictionsPageHeader
        eyebrow="VIP"
        title="VIP Predictions"
        subtitle="Higher-confidence picks with the full market breakdown unlocked."
      />
      <Container className="py-10 sm:py-12">
        {!isHydrated ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : !user ? (
          <UpsellCard
            title="Log in to view VIP predictions"
            message="Create a free account, then upgrade to VIP any time."
            cta="Log in"
            href="/login"
          />
        ) : !isVip ? (
          <UpsellCard
            title="Upgrade to VIP"
            message="Unlock the full market breakdown and higher-confidence picks."
            cta="See VIP plans"
            href="/pricing"
          />
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : (
          <PredictionsGrid
            predictions={data ?? []}
            emptyMessage="No VIP predictions available right now — check back soon."
          />
        )}
      </Container>
    </>
  );
}
