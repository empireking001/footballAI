import Link from 'next/link';
import { CheckCircle2, Clock3, LockKeyhole, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { fetchApi } from '@/lib/api/server';
import { Prediction } from '@/types/api';
import { formatKickoff, formatMatchScore } from '@/lib/utils';

function marketResult(prediction: Prediction, market: Prediction['markets'][number]): boolean | 'pending' | 'unsupported' {
  if (prediction.isVipLocked) return 'pending';
  if (prediction.match.status !== 'finished' || !prediction.accuracy?.evaluatedAt) return 'pending';
  if (market.market === '1X2') return prediction.accuracy.winnerCorrect ?? 'unsupported';
  if (market.market === 'BTTS') return prediction.accuracy.bttsCorrect ?? 'unsupported';
  if (market.market.startsWith('Over/Under')) return prediction.accuracy.overUnderCorrect ?? 'unsupported';
  if (market.market === 'Double Chance') return prediction.accuracy.doubleChanceCorrect ?? 'unsupported';
  if (market.market === 'Correct Score') return prediction.accuracy.correctScoreCorrect ?? 'unsupported';
  return 'unsupported';
}

function outcomeSummary(prediction: Prediction) {
  if (prediction.isVipLocked) return { label: 'VIP result', variant: 'vip' as const, icon: <LockKeyhole className="h-3.5 w-3.5" /> };
  const results = prediction.markets
    .map((market) => marketResult(prediction, market))
    .filter((result): result is boolean => typeof result === 'boolean');
  if (results.length === 0) return { label: 'Awaiting review', variant: 'default' as const, icon: <Clock3 className="h-3.5 w-3.5" /> };
  const correct = results.filter(Boolean).length;
  if (correct === results.length) return { label: 'Pick won', variant: 'live' as const, icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
  if (correct === 0) return { label: 'Pick lost', variant: 'risk-high' as const, icon: <XCircle className="h-3.5 w-3.5" /> };
  return { label: `${correct}/${results.length} correct`, variant: 'default' as const, icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
}

function ResultMark({ result }: { result: boolean | 'pending' | 'unsupported' }) {
  if (result === 'pending') return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted"><Clock3 className="h-3.5 w-3.5" /> Awaiting</span>;
  if (result === 'unsupported') return <span className="text-[11px] font-medium text-muted">Manual review</span>;
  return result
    ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-live"><CheckCircle2 className="h-4 w-4" /> Correct</span>
    : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-danger"><XCircle className="h-4 w-4" /> Missed</span>;
}

function RecentResultCard({ prediction }: { prediction: Prediction }) {
  const summary = outcomeSummary(prediction);
  const score = formatMatchScore(prediction.match.score);
  return (
    <Card className="h-full border-border/80 bg-surface/70">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted">{prediction.match.league.name}</p>
          <Link href={`/matches/${prediction.match._id}`} className="mt-1 block text-sm font-semibold text-foreground hover:text-primary">
            {prediction.match.homeTeam.name} vs {prediction.match.awayTeam.name}
          </Link>
          <p className="mt-1 text-[11px] text-muted">{formatKickoff(prediction.match.kickoffAt)}</p>
        </div>
        <Badge variant={summary.variant}><span className="mr-1 inline-flex">{summary.icon}</span>{summary.label}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2.5">
          <span className="text-xs text-muted">Final score</span>
          <span className="font-display text-lg font-bold tabular-nums text-primary">{score ?? 'Pending'}</span>
        </div>
        {prediction.isVipLocked ? (
          <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-muted"><LockKeyhole className="h-3.5 w-3.5 text-vip" /> VIP pick details are hidden, but the completed fixture is recorded.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {prediction.markets.slice(0, 4).map((market, index) => (
              <div key={`${market.market}-${market.selection}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-muted">{market.market}: <strong className="text-foreground">{market.selection}</strong></span>
                <ResultMark result={marketResult(prediction, market)} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export async function RecentResults({ days = 7 }: { days?: number }) {
  const { data } = await fetchApi<Prediction[]>(`/predictions/recent-results?days=${days}`, { cache: 'no-store' });
  const predictions = data ?? [];
  if (predictions.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface/40 py-14 sm:py-18">
      <div className="container">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Verified track record</span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Recent results</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Review the last seven days of completed manual picks. Green checks are correct; red crosses are missed selections.</p>
          </div>
          <Link href="/statistics" className="inline-flex items-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:border-primary/50 hover:text-foreground">View statistics</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{predictions.map((prediction) => <RecentResultCard key={prediction._id} prediction={prediction} />)}</div>
      </div>
    </section>
  );
}
