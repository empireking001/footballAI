'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { Plan } from '@/types/api';

type Currency = 'NGN' | 'USD';
type Provider = 'paystack' | 'flutterwave' | 'stripe';

const PLAN_LABELS: Record<Plan['plan'], { title: string; tagline: string; featured?: boolean }> = {
  monthly: { title: 'Monthly', tagline: 'Flexible, cancel any time' },
  quarterly: { title: 'Quarterly', tagline: 'Save vs. paying monthly', featured: true },
  yearly: { title: 'Yearly', tagline: 'Best value for the season' },
};

const BENEFITS = [
  'Every free-tier prediction, automatically upgraded',
  'Full correct-score and cards/corners breakdowns',
  'Early access before free predictions unlock',
  'Priority WhatsApp support',
];

const PROVIDERS_BY_CURRENCY: Record<Currency, { id: Provider; label: string }[]> = {
  NGN: [
    { id: 'paystack', label: 'Pay with Paystack' },
    { id: 'flutterwave', label: 'Pay with Flutterwave' },
  ],
  USD: [
    { id: 'stripe', label: 'Pay with Card (Stripe)' },
    { id: 'flutterwave', label: 'Pay with Flutterwave' },
  ],
};

export function PricingPlans({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [selectedPlan, setSelectedPlan] = useState<Plan['plan'] | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(plan: Plan['plan'], provider: Provider) {
    if (!user) {
      router.push(`/register?plan=${plan}`);
      return;
    }
    setError(null);
    setLoadingProvider(provider);
    try {
      const { data } = await apiClient.post('/subscriptions/checkout', {
        plan,
        provider,
        currency,
        callbackUrl: `${window.location.origin}/dashboard/subscription`,
      });
      window.location.href = data.data.authorizationUrl;
    } catch {
      setError('Something went wrong starting checkout — please try again.');
      setLoadingProvider(null);
    }
  }

  return (
    <div>
      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-surface-elevated p-1">
          {(['NGN', 'USD'] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                currency === c ? 'bg-primary text-primary-foreground' : 'text-muted',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const label = PLAN_LABELS[plan.plan];
          const isSelected = selectedPlan === plan.plan;
          return (
            <Card
              key={plan.plan}
              className={cn(
                'flex flex-col p-6',
                label.featured && 'border-primary/50 shadow-glow',
              )}
            >
              <CardContent className="flex flex-1 flex-col p-0">
                {label.featured && (
                  <span className="mb-3 w-fit rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-xl font-bold uppercase tracking-tight">
                  {label.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{label.tagline}</p>
                <div className="mt-5 font-mono text-3xl font-bold tabular-nums text-foreground">
                  {formatCurrency(plan.pricing[currency], currency)}
                </div>
                <p className="mt-1 text-xs text-muted">every {plan.durationDays} days</p>

                <ul className="mt-6 flex flex-col gap-2.5">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-vip" />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex-1" />

                {isSelected ? (
                  <div className="flex flex-col gap-2">
                    {PROVIDERS_BY_CURRENCY[currency].map((p) => (
                      <Button
                        key={p.id}
                        variant="vip"
                        disabled={loadingProvider !== null}
                        onClick={() => handleCheckout(plan.plan, p.id)}
                      >
                        {loadingProvider === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          p.label
                        )}
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button variant={label.featured ? 'vip' : 'secondary'} onClick={() => setSelectedPlan(plan.plan)}>
                    Choose {label.title.toLowerCase()}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && <p className="mt-6 text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
