import { Container } from '@/components/ui/Container';

interface AccuracySummary {
  totalEvaluated: number;
  winnerAccuracy: number;
  bttsAccuracy: number;
  overUnderAccuracy: number;
  correctScoreAccuracy: number;
}

const STATS: { key: keyof AccuracySummary; label: string }[] = [
  { key: 'winnerAccuracy', label: 'Match winner' },
  { key: 'bttsAccuracy', label: 'Both teams to score' },
  { key: 'overUnderAccuracy', label: 'Over/Under 2.5' },
  { key: 'correctScoreAccuracy', label: 'Exact score' },
];

export function AccuracyStat({ summary }: { summary: AccuracySummary | null }) {
  const hasData = summary && summary.totalEvaluated > 0;

  return (
    <section className="border-b border-border bg-surface/50">
      <Container className="py-14 sm:py-16">
        <div className="mb-10 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Self-learning track record
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            We grade our own predictions
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
            {hasData
              ? `Measured against ${summary!.totalEvaluated.toLocaleString()} finished matches — updated automatically as results come in.`
              : "We're still accumulating finished matches to grade — the numbers below will populate automatically as results come in."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.key}
              className="rounded-lg border border-border bg-surface p-5 text-center sm:p-6"
            >
              <div className="font-mono text-3xl font-bold tabular-nums text-primary sm:text-4xl">
                {hasData ? `${summary![stat.key]}%` : '—'}
              </div>
              <div className="mt-2 text-xs text-muted sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
