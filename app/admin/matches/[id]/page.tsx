'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { adminGet, adminUpdate } from '@/lib/api/admin';
import { apiClient } from '@/lib/api/client';
import { Match, MatchStatus, Prediction, PredictionTier, RiskRating } from '@/types/api';

const STATUS_OPTIONS: MatchStatus[] = [
  'scheduled',
  'live',
  'halftime',
  'finished',
  'postponed',
  'cancelled',
  'suspended',
];

interface FormValues {
  status: MatchStatus;
  venue: string;
  referee: string;
  isFeatured: boolean;
  homeFullTime: number | '';
  awayFullTime: number | '';
}

interface MarketFormValue {
  market: string;
  selection: string;
  probability: number | '';
}

interface PredictionFormValues {
  tier: PredictionTier;
  isFeatured: boolean;
  confidenceScore: number | '';
  riskRating: RiskRating | '';
  aiExplanation: string;
  historicalComparison: string;
  keyFactorsText: string;
  markets: MarketFormValue[];
}

const DEFAULT_PREDICTION_VALUES: PredictionFormValues = {
  tier: 'free',
  isFeatured: false,
  confidenceScore: '',
  riskRating: '',
  aiExplanation: '',
  historicalComparison: '',
  keyFactorsText: '',
  markets: [{ market: '1X2', selection: 'Home', probability: 50 }],
};

export default function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [predictionSaved, setPredictionSaved] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const { data, isLoading, isError: isMatchError, error: matchError } = useQuery({
    queryKey: ['admin', 'matches', id],
    queryFn: () => adminGet<Match & { venue?: string; referee?: string; isFeatured?: boolean }>('matches', id),
  });

  const predictionQuery = useQuery<Prediction | null>({
    queryKey: ['admin', 'predictions', 'match', id],
    queryFn: async () => {
      try {
        return (await apiClient.get<{ data: Prediction }>(`/admin/predictions/match/${id}`)).data.data;
      } catch (error) {
        if ((error as { response?: { status?: number } }).response?.status === 404) return null;
        throw error;
      }
    },
    retry: false,
  });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    values: data
      ? {
          status: data.status,
          venue: data.venue ?? '',
          referee: data.referee ?? '',
          isFeatured: data.isFeatured ?? false,
          homeFullTime: data.score?.homeFullTime ?? '',
          awayFullTime: data.score?.awayFullTime ?? '',
        }
      : undefined,
  });

  const predictionForm = useForm<PredictionFormValues>({
    values: predictionQuery.data
      ? {
          tier: predictionQuery.data.tier,
          isFeatured: predictionQuery.data.isFeatured ?? false,
          confidenceScore: predictionQuery.data.confidenceScore ?? '',
          riskRating: predictionQuery.data.riskRating ?? '',
          aiExplanation: predictionQuery.data.aiExplanation,
          historicalComparison: predictionQuery.data.historicalComparison ?? '',
          keyFactorsText: predictionQuery.data.keyFactors.join('\n'),
          markets: predictionQuery.data.markets.map((market) => ({
            market: market.market,
            selection: market.selection,
            probability: market.probability,
          })),
        }
      : DEFAULT_PREDICTION_VALUES,
  });
  const marketFields = useFieldArray({ control: predictionForm.control, name: 'markets' });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await adminUpdate('matches', id, {
        status: values.status,
        venue: values.venue || undefined,
        referee: values.referee || undefined,
        isFeatured: values.isFeatured,
        score: {
          homeFullTime: values.homeFullTime === '' ? undefined : Number(values.homeFullTime),
          awayFullTime: values.awayFullTime === '' ? undefined : Number(values.awayFullTime),
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setServerError('Something went wrong saving this match.');
    }
  }

  async function onPredictionSubmit(values: PredictionFormValues) {
    setPredictionError(null);
    const markets = values.markets
      .filter((market) => market.market.trim() && market.selection.trim() && market.probability !== '')
      .map((market) => ({
        market: market.market.trim(),
        selection: market.selection.trim(),
        probability: Number(market.probability),
      }));
    const payload = {
      matchId: id,
      tier: values.tier,
      isFeatured: values.isFeatured,
      confidenceScore: values.confidenceScore === '' ? 0 : Number(values.confidenceScore),
      riskRating: values.riskRating || 'medium',
      aiExplanation: values.aiExplanation.trim(),
      historicalComparison: values.historicalComparison.trim() || undefined,
      keyFactors: values.keyFactorsText.split('\n').map((factor) => factor.trim()).filter(Boolean),
      markets,
    };

    if (markets.length === 0) {
      setPredictionError('Add at least one market selection before saving. The AI explanation and confidence fields are optional.');
      return;
    }

    try {
      if (predictionQuery.data) {
        const { matchId: _matchId, ...updatePayload } = payload;
        await apiClient.patch(`/admin/predictions/${predictionQuery.data._id}`, updatePayload);
      } else {
        await apiClient.post('/admin/predictions/manual', payload);
      }
      await predictionQuery.refetch();
      setPredictionSaved(true);
      setTimeout(() => setPredictionSaved(false), 2000);
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setPredictionError(message ?? 'Something went wrong saving this prediction.');
    }
  }

  if (isMatchError) {
    return <div className="rounded-lg border border-danger/30 bg-danger/5 p-6 text-sm text-danger">Unable to load this match: {matchError instanceof Error ? matchError.message : 'The admin API returned an error.'}</div>;
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
      <AdminPageHeader title={`${data.homeTeam.name} vs ${data.awayTeam.name}`} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label={`${data.homeTeam.name} goals`} type="number" {...register('homeFullTime')} />
          <Input label={`${data.awayTeam.name} goals`} type="number" {...register('awayFullTime')} />
        </div>

        <Input label="Venue" {...register('venue')} />
        <Input label="Referee" {...register('referee')} />

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" {...register('isFeatured')} className="h-4 w-4 rounded border-border" />
          Featured match
        </label>

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
          {saved && <span className="text-sm text-live">Saved</span>}
        </div>
      </form>

      <section className="mt-10 max-w-3xl rounded-lg border border-primary/25 bg-primary/[0.04] p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Manual prediction editor</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Type your own prediction for this match, or revise the existing AI/manual prediction. Saving replaces the prediction attached to this fixture.</p>
        </div>
        {predictionQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading prediction…</div>
        ) : (
          <form onSubmit={predictionForm.handleSubmit(onPredictionSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                Tier
                <select {...predictionForm.register('tier')} className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground">
                  <option value="free">Free</option>
                  <option value="vip">VIP</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                Confidence score <span className="font-normal text-muted">(optional)</span>
                <input type="number" min="0" max="100" {...predictionForm.register('confidenceScore', { setValueAs: (value) => value === '' ? '' : Number(value) })} className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                Risk rating <span className="font-normal text-muted">(optional)</span>
                <select {...predictionForm.register('riskRating')} className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground">
                  <option value="">Not set</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" {...predictionForm.register('isFeatured')} className="h-4 w-4 rounded border-border" />
              Feature this prediction on public surfaces
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Explanation <span className="font-normal text-muted">(optional — not required for manual predictions)</span>
              <textarea rows={7} {...predictionForm.register('aiExplanation')} className="w-full rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Historical comparison <span className="font-normal text-muted">(optional)</span>
              <textarea rows={4} {...predictionForm.register('historicalComparison')} className="w-full rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Key factors <span className="font-normal text-muted">(one factor per line)</span>
              <textarea rows={5} {...predictionForm.register('keyFactorsText')} className="w-full rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground outline-none focus:border-primary" placeholder="Strong home form\nRecent defensive improvement\nImportant missing player" />
            </label>
            <div className="rounded-lg border border-border bg-surface/50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Market selections</h3>
                  <p className="mt-1 text-xs text-muted">Add the exact pick you want users to see.</p>
                </div>
                <Button type="button" variant="secondary" onClick={() => marketFields.append({ market: '', selection: '', probability: 50 })}>Add market</Button>
              </div>
              <div className="flex flex-col gap-3">
                {marketFields.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 sm:grid-cols-[1fr_1.2fr_100px_auto] sm:items-end">
                    <Input label="Market" placeholder="1X2 / BTTS / Correct Score" {...predictionForm.register(`markets.${index}.market`)} />
                    <Input label="Selection" placeholder="Home / Yes / 2-1" {...predictionForm.register(`markets.${index}.selection`)} />
                    <Input label="Probability %" type="number" min="0" max="100" {...predictionForm.register(`markets.${index}.probability`, { setValueAs: (value) => value === '' ? '' : Number(value) })} />
                    <Button type="button" variant="secondary" onClick={() => marketFields.remove(index)} disabled={marketFields.fields.length === 1}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
            {predictionError && <p className="text-sm text-danger">{predictionError}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={predictionForm.formState.isSubmitting} className="w-fit">
                {predictionForm.formState.isSubmitting ? 'Saving prediction…' : predictionQuery.data ? 'Save prediction changes' : 'Create manual prediction'}
              </Button>
              {predictionSaved && <span className="text-sm text-live">Prediction saved</span>}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
