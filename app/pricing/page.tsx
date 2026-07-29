import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PricingPlans } from '@/components/pricing/PricingPlans';
import { fetchApi } from '@/lib/api/server';
import { Plan } from '@/types/api';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple VIP pricing — monthly, quarterly, or yearly. Cancel any time.',
};

export default async function PricingPage() {
  const { data } = await fetchApi<Plan[]>('/plans', { revalidate: 3600 });

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-12 text-center sm:py-16">
        <Container>
          <span className="font-mono text-xs uppercase tracking-widest text-vip">Pricing</span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Simple, upfront pricing
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Free predictions for everyone. Upgrade to VIP whenever you want deeper coverage.
          </p>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        {data && data.length > 0 ? (
          <PricingPlans plans={data} />
        ) : (
          <p className="text-center text-sm text-muted">Pricing is temporarily unavailable.</p>
        )}
      </Container>
    </>
  );
}
