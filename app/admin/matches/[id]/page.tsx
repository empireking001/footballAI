'use client';

import { use, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

const MARKET_OPTIONS = ['1X2', 'BTTS', 'Over/Under', 'Double Chance', 'Correct Score', 'Other'];
const MARKET_PRESETS: Record<string, MarketFormValue[]> = {
  '1X2': [
    { market: '1X2', selection: 'Home', probability: 50 },
    { market: '1X2', selection: 'Draw', probability: 25 },
    { market: '1X2', selection: 'Away', probability: 25 },
  ],
  BTTS: [
    { market: 'BTTS', selection: 'Yes', probability: 55 },
    { market: 'BTTS', selection: 'No', probability: 45 },
  ],
  'Over/Under': [
    { market: 'Over/Under', selection: 'Over 2.5', probability: 50 },
    { market: 'Over/Under', selection: 'Under 2.5', probability: 50 },
  ],
  'Double Chance': [{ market: 'Double Chance', selection: '1X', probability: 65 }],
  'Correct Score': [{ market: 'Correct Score', selection: '2-1', probability: 25 }],
};

function getSelectionOptions(market: string): string[] {
  if (market === '1X2') return ['Home', 'Draw', 'Away'];
  if (market === 'BTTS') return ['Yes', 'No'];
  if (market === 'Over/Under') return ['Over 0.5', 'Under 0.5', 'Over 1.5', 'Under 1.5', 'Over 2.5', 'Under 2.5', 'Over 3.5', 'Under 3.5'];
  if (market === 'Double Chance') return ['1X', 'X2', '12'];
  return [];
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
  markets: [
    { market: '1X2', selection: 'Home', probability: 50 },
    { market: '1X2', selection: 'Draw', probability: 25 },
    { market: '1X2', selection: 'Away', probability: 25 },
  ],
};

export default function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [predictionSaved, setPredictionSaved] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

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
  const watchedMarkets = predictionForm.watch('markets');
  const previewValues = predictionForm.watch();

  useEffect(() => {
    if (predictionQuery.isLoading || predictionQuery.data) return;
    const savedDraft = window.localStorage.getItem(`manual-prediction-draft:${id}`);
    if (!savedDraft) return;
    try {
      predictionForm.reset(JSON.parse(savedDraft) as PredictionFormValues);
    } catch {
      window.localStorage.removeItem(`manual-prediction-draft:${id}`);
    }
  }, [id, predictionForm, predictionQuery.data, predictionQuery.isLoading]);

  function appendMarketPreset(market: string) {
    const preset = MARKET_PRESETS[market] ?? [{ market, selection: '', probability: 50 }];
    preset.forEach((item) => marketFields.append({ ...item }));
  }

  function saveDraft(values: PredictionFormValues) {
    window.localStorage.setItem(`manual-prediction-draft:${id}`, JSON.stringify(values));
    setDraftSaved(true);
    setPredictionError(null);
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const updatedMatch = await adminUpdate<Match & { venue?: string; referee?: string; isFeatured?: boolean }>('matches', id, {
        status: values.status,
        venue: values.venue || undefined,
        referee: values.referee || undefined,
        isFeatured: values.isFeatured,
        score: {
          homeFullTime: values.homeFullTime === '' ? undefined : Number(values.homeFullTime),
          awayFullTime: values.awayFullTime === '' ? undefined : Number(values.awayFullTime),
        },
      });
      queryClient.setQueryData(['admin', 'matches', id], updatedMatch);
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
      setPredictionError('Add at least one market selection before saving. Notes and confidence are optional.');
      return;
    }

    try {
      const response = predictionQuery.data
        ? await apiClient.patch<{ data: Prediction }>(`/admin/predictions/${predictionQuery.data._id}`, (() => {
            const { matchId: _matchId, ...updatePayload } = payload;
            return updatePayload;
          })())
        : await apiClient.post<{ data: Prediction }>('/admin/predictions/manual', payload);
      queryClient.setQueryData(['admin', 'predictions', 'match', id], response.data.data);
      window.localStorage.removeItem(`manual-prediction-draft:${id}`);
      setDraftSaved(false);
      setPredictionError(null);
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
        <div className="border-b border-border pb-3">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Match details</h2>
          <p className="mt-1 text-sm text-muted">Save the score and fixture information separately from the manual pick.</p>
        </div>
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
          <Input label={`${data.homeTeam.name} goals`} type="number" min="0" {...register('homeFullTime', { setValueAs: (value) => value === '' ? '' : Number(value) })} />
          <Input label={`${data.awayTeam.name} goals`} type="number" min="0" {...register('awayFullTime', { setValueAs: (value) => value === '' ? '' : Number(value) })} />
        </div>
        <p className="-mt-2 text-xs leading-5 text-muted">This score appears on public fixture cards after you save. Provider scores can update it when official live data becomes available.</p>

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
          {saved && <span className="text-sm text-live">Match details saved</span>}
        </div>
      </form>

      <section className="mt-10 max-w-3xl rounded-lg border border-primary/25 bg-primary/[0.04] p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Manual prediction editor</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Type your own prediction for this match, or revise the existing manual pick. Saving replaces the pick attached to this fixture.</p>
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
              Prediction note <span className="font-normal text-muted">(optional)</span>
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
            <div className="rounded-xl border border-border bg-surface/50 p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Market selections</h3>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-muted">Choose a market preset to add professional, ready-to-edit rows. Add only the selections you want users to see.</p>
                </div>
                <Button type="button" variant="secondary" onClick={() => appendMarketPreset('Other')}>Add custom market</Button>
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                {MARKET_OPTIONS.slice(0, -1).map((market) => (
                  <Button key={market} type="button" variant="secondary" onClick={() => appendMarketPreset(market)}>{market}</Button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {marketFields.fields.map((field, index) => {
                  const market = watchedMarkets?.[index]?.market ?? field.market;
                  const selectionOptions = getSelectionOptions(market);
                  const currentSelection = watchedMarkets?.[index]?.selection ?? field.selection;
                  return (
                    <div key={field.id} className="rounded-lg border border-border bg-background/40 p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Market {index + 1}</span>
                        <Button type="button" variant="secondary" onClick={() => marketFields.remove(index)} disabled={marketFields.fields.length === 1}>Remove</Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_120px] md:items-end">
                        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                          Market type
                          <select {...predictionForm.register(`markets.${index}.market`)} className="h-11 rounded-md border border-border bg-surface-elevated px-3 text-sm text-foreground">
                            {MARKET_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                          Selection
                          {selectionOptions.length > 0 ? (
                            <select {...predictionForm.register(`markets.${index}.selection`)} className="h-11 rounded-md border border-border bg-surface-elevated px-3 text-sm text-foreground">
                              {!selectionOptions.includes(currentSelection) && currentSelection && <option value={currentSelection}>{currentSelection}</option>}
                              {selectionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                          ) : (
                            <Input label="Selection" placeholder={market === 'Correct Score' ? 'e.g. 2-1' : 'Type the selection'} {...predictionForm.register(`markets.${index}.selection`)} />
                          )}
                        </label>
                        <Input label="Probability %" type="number" min="0" max="100" {...predictionForm.register(`markets.${index}.probability`, { setValueAs: (value) => value === '' ? '' : Number(value) })} />
                      </div>
                      {market === 'Correct Score' && <p className="mt-2 text-xs text-muted">Use the standard scoreline format: home goals–away goals.</p>}
                    </div>
                  );
                })}
              </div>
            </div>
            {showPreview && (
              <div className="rounded-xl border border-primary/25 bg-background/70 p-4 sm:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Public preview</p>
                    <h3 className="mt-1 font-display text-lg font-bold uppercase tracking-tight">{data.homeTeam.name} vs {data.awayTeam.name}</h3>
                  </div>
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted">{previewValues.tier === 'vip' ? 'VIP' : 'Free'}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {previewValues.markets.filter((market) => market.market.trim() && market.selection.trim() && market.probability !== '').map((market, index) => (
                    <div key={`${market.market}-${market.selection}-${index}`} className="flex items-center justify-between rounded-md border border-border bg-surface/50 px-3 py-2.5 text-sm">
                      <span className="text-muted">{market.market}</span>
                      <span className="font-semibold text-foreground">{market.selection}</span>
                      <span className="font-mono text-xs text-primary">{market.probability}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {predictionError && <p className="text-sm text-danger">{predictionError}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={() => saveDraft(previewValues)}>Save draft</Button>
              <Button type="button" variant="secondary" onClick={() => setShowPreview((current) => !current)}>{showPreview ? 'Hide preview' : 'Preview public card'}</Button>
              <Button type="submit" disabled={predictionForm.formState.isSubmitting} className="w-fit">
                {predictionForm.formState.isSubmitting ? 'Publishing…' : predictionQuery.data ? 'Save & publish changes' : 'Publish manual pick'}
              </Button>
              {draftSaved && <span className="text-sm text-muted">Draft saved on this browser</span>}
              {predictionSaved && <span className="text-sm text-live">Published successfully</span>}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
