'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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

interface PredictionFormValues {
  tier: PredictionTier;
  isFeatured: boolean;
  confidenceScore: number | '';
  riskRating: RiskRating;
  aiExplanation: string;
  historicalComparison: string;
}

export default function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [predictionSaved, setPredictionSaved] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
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
          homeFullTime: data.score.homeFullTime ?? '',
          awayFullTime: data.score.awayFullTime ?? '',
        }
      : undefined,
  });

  const predictionForm = useForm<PredictionFormValues>({
    values: predictionQuery.data
      ? {
          tier: predictionQuery.data.tier,
          isFeatured: predictionQuery.data.isFeatured ?? false,
          confidenceScore: predictionQuery.data.confidenceScore,
          riskRating: predictionQuery.data.riskRating,
          aiExplanation: predictionQuery.data.aiExplanation,
          historicalComparison: predictionQuery.data.historicalComparison ?? '',
        }
      : undefined,
  });

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
    if (!predictionQuery.data) return;
    setPredictionError(null);
    try {
      await apiClient.patch(`/admin/predictions/${predictionQuery.data._id}`, {
        tier: values.tier,
        isFeatured: values.isFeatured,
        confidenceScore: values.confidenceScore === '' ? undefined : Number(values.confidenceScore),
        riskRating: values.riskRating,
        aiExplanation: values.aiExplanation.trim(),
        historicalComparison: values.historicalComparison.trim() || undefined,
      });
      await predictionQuery.refetch();
      setPredictionSaved(true);
      setTimeout(() => setPredictionSaved(false), 2000);
    } catch {
      setPredictionError('Something went wrong saving this prediction.');
    }
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
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Prediction editor</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Update the prediction attached to this fixture without leaving the match page.</p>
        </div>
        {predictionQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading prediction…</div>
        ) : predictionQuery.data ? (
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
                Confidence score
                <input type="number" min="0" max="100" {...predictionForm.register('confidenceScore', { setValueAs: (value) => value === '' ? '' : Number(value) })} className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                Risk rating
                <select {...predictionForm.register('riskRating')} className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground">
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
              AI explanation
              <textarea rows={7} {...predictionForm.register('aiExplanation')} className="w-full rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Historical comparison
              <textarea rows={4} {...predictionForm.register('historicalComparison')} className="w-full rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
            </label>
            {predictionError && <p className="text-sm text-danger">{predictionError}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={predictionForm.formState.isSubmitting} className="w-fit">
                {predictionForm.formState.isSubmitting ? 'Saving prediction…' : 'Save prediction'}
              </Button>
              {predictionSaved && <span className="text-sm text-live">Prediction saved</span>}
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted">No prediction exists for this match yet. Use Prediction Operations → Backfill, then return here to edit it.</p>
        )}
      </section>
    </div>
  );
}
