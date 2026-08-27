'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminList } from '@/lib/api/admin';
import { apiClient } from '@/lib/api/client';
import { formatKickoff, formatMatchScore } from '@/lib/utils';
import { Prediction, SiteSettings } from '@/types/api';

type PredictionPhase = 'upcoming' | 'completed' | 'all';
type MarketResult = boolean | 'pending' | 'unsupported';

const PHASE_OPTIONS: { key: PredictionPhase; label: string; description: string }[] = [
  { key: 'upcoming', label: 'Upcoming picks', description: 'Fixtures still to play' },
  { key: 'completed', label: 'Completed results', description: 'Final scores and judged picks' },
  { key: 'all', label: 'All manual picks', description: 'Full prediction ledger' },
];

function marketResult(prediction: Prediction, market: Prediction['markets'][number]): MarketResult {
  if (prediction.match.status !== 'finished' || !prediction.accuracy?.evaluatedAt) return 'pending';
  if (market.market === '1X2') return prediction.accuracy.winnerCorrect ?? 'unsupported';
  if (market.market === 'BTTS') return prediction.accuracy.bttsCorrect ?? 'unsupported';
  if (market.market.startsWith('Over/Under')) return prediction.accuracy.overUnderCorrect ?? 'unsupported';
  if (market.market === 'Double Chance') return prediction.accuracy.doubleChanceCorrect ?? 'unsupported';
  if (market.market === 'Correct Score') return prediction.accuracy.correctScoreCorrect ?? 'unsupported';
  return 'unsupported';
}

function ResultBadge({ result }: { result: MarketResult }) {
  if (result === 'unsupported') return null;
  if (result === 'pending') return <Badge variant="default">Awaiting review</Badge>;
  return <Badge variant={result ? 'live' : 'risk-high'}>{result ? 'Correct' : 'Missed'}</Badge>;
}

function predictionResultSummary(prediction: Prediction) {
  if (prediction.match.status !== 'finished') return { label: 'Upcoming', variant: 'default' as const };
  if (!prediction.accuracy?.evaluatedAt) return { label: 'Awaiting review', variant: 'default' as const };

  const results = prediction.markets
    .map((market) => marketResult(prediction, market))
    .filter((result): result is boolean => typeof result === 'boolean');
  if (results.length === 0) return { label: 'No supported markets', variant: 'default' as const };
  const correct = results.filter(Boolean).length;
  return { label: `${correct}/${results.length} markets correct`, variant: correct > 0 ? 'live' as const : 'risk-high' as const };
}

function SyncStatusCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'sync-status'],
    queryFn: async () => (await apiClient.get<{ data: SiteSettings }>('/settings')).data.data,
    staleTime: 60 * 1000,
  });

  const timestamp = (value?: string) =>
    value
      ? new Date(value).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
      : 'Not recorded yet';
  const liveAt = data?.dataSync?.liveScoresLastSyncedAt;
  const liveFresh = liveAt ? Date.now() - new Date(liveAt).getTime() < 5 * 60 * 1000 : false;

  return (
    <Card className="mb-5 border-border bg-surface/50">
      <CardContent className="pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-bold uppercase tracking-tight">Live-data health</h2>
            <p className="mt-1 text-sm text-muted">Fixtures, scores, standings, and odds sync independently from manual picks.</p>
          </div>
          <Badge variant={liveFresh ? 'live' : 'risk-high'}>{liveFresh ? 'Live sync healthy' : 'Live sync needs attention'}</Badge>
        </div>
        <div className="mt-4 grid gap-3 text-xs text-muted sm:grid-cols-3">
          <div><span className="font-semibold text-foreground">Live scores</span><br />{isLoading ? 'Loading…' : timestamp(liveAt)}</div>
          <div><span className="font-semibold text-foreground">Fixtures</span><br />{isLoading ? 'Loading…' : timestamp(data?.dataSync?.fixturesLastSyncedAt)}</div>
          <div><span className="font-semibold text-foreground">Standings</span><br />{isLoading ? 'Loading…' : timestamp(data?.dataSync?.standingsLastSyncedAt)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPredictionsPage() {
  const [page, setPage] = useState(1);
  const [phase, setPhase] = useState<PredictionPhase>('upcoming');
  const [evaluationMessage, setEvaluationMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'manual-predictions', page, phase],
    queryFn: () => adminList<Prediction>('predictions', { page, limit: 20, phase }),
  });

  const evaluateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<{ message?: string }>('/admin/predictions/evaluate');
      return response.data.message ?? 'Completed predictions reviewed.';
    },
    onSuccess: (message) => {
      setEvaluationMessage(message);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'manual-predictions'] });
    },
    onError: () => setEvaluationMessage('Unable to review completed predictions. Check the admin session and try again.'),
  });

  const columns: Column<Prediction>[] = [
    {
      key: 'match',
      label: 'Fixture',
      render: (prediction) => {
        const finalScore = formatMatchScore(prediction.match.score);
        return (
          <div>
            <Link href={`/admin/matches/${prediction.match._id}`} className="font-semibold text-foreground hover:text-primary">
              {prediction.match.homeTeam.name} vs {prediction.match.awayTeam.name}
            </Link>
            <p className="mt-1 text-xs text-muted">{prediction.match.league.name} · {formatKickoff(prediction.match.kickoffAt)}</p>
            {finalScore && <p className="mt-1 font-mono text-xs font-semibold text-primary">Final score: {finalScore}</p>}
          </div>
        );
      },
    },
    {
      key: 'markets',
      label: 'Prediction and outcome',
      render: (prediction) => (
        <div className="max-w-[22rem] space-y-1.5 text-xs text-foreground">
          {prediction.markets.length > 0
            ? prediction.markets.map((market, index) => {
                const result = marketResult(prediction, market);
                return (
                  <div key={`${market.market}-${market.selection}-${index}`} className="flex flex-wrap items-center gap-1.5">
                    <span>{market.market}: {market.selection}</span>
                    <ResultBadge result={result} />
                  </div>
                );
              })
            : 'No market entered'}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Result status',
      render: (prediction) => {
        const summary = predictionResultSummary(prediction);
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={prediction.tier === 'vip' ? 'vip' : 'default'}>{prediction.tier === 'vip' ? 'VIP' : 'Free'}</Badge>
            <Badge variant={summary.variant}>{summary.label}</Badge>
            {prediction.isFeatured && <Badge variant="live">Featured</Badge>}
          </div>
        );
      },
    },
    {
      key: 'edit',
      label: 'Action',
      render: (prediction) => (
        <Button size="sm" asChild>
          <Link href={`/admin/matches/${prediction.match._id}`}>{prediction.match.status === 'finished' ? 'Review result' : 'Open editor'}</Link>
        </Button>
      ),
    },
  ];

  const selectedPhase = PHASE_OPTIONS.find((option) => option.key === phase);

  return (
    <div>
      <AdminPageHeader
        title="Manual picks"
        subtitle="Keep upcoming picks separate from completed results, then compare every saved market with the official final score."
      />
      <SyncStatusCard />
      <Card className="mb-5 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Prediction ledger</p>
            <p className="mt-1 text-sm leading-6 text-muted">{selectedPhase?.description}. Completed rows show the final score and whether each supported market was correct or missed.</p>
            {data?.meta && <p className="mt-2 text-xs text-muted">{data.meta.total} manual pick{data.meta.total === 1 ? '' : 's'} in this view.</p>}
          </div>
          <Button type="button" variant="secondary" onClick={() => evaluateMutation.mutate()} disabled={evaluateMutation.isPending} className="w-fit">
            {evaluateMutation.isPending ? 'Reviewing…' : 'Review completed picks'}
          </Button>
        </CardContent>
      </Card>
      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        {PHASE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => {
              setPhase(option.key);
              setPage(1);
              setEvaluationMessage(null);
            }}
            className={`rounded-lg border px-4 py-3 text-left transition-colors ${phase === option.key ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary/40'}`}
          >
            <span className="block text-sm font-semibold text-foreground">{option.label}</span>
            <span className="mt-1 block text-xs text-muted">{option.description}</span>
          </button>
        ))}
      </div>
      {evaluationMessage && <p className="mb-4 text-sm text-muted">{evaluationMessage}</p>}
      {isError && <div className="mb-4 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">Unable to load manual picks. {error instanceof Error ? error.message : 'Check the admin session and backend response, then try again.'}</div>}
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(prediction) => prediction._id}
        isLoading={isLoading}
        page={data?.meta.page}
        totalPages={data?.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
