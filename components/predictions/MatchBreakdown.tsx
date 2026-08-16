import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
import { MarketBar } from '@/components/predictions/MarketBar';
import { Container } from '@/components/ui/Container';
import { formatKickoff } from '@/lib/utils';
import { Prediction } from '@/types/api';
import { MatchAssistant } from '@/components/predictions/MatchAssistant';

function TeamCrest({ name, logoUrl, size = 64 }: { name: string; logoUrl?: string; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex items-center justify-center rounded-full border border-border bg-surface-elevated"
        style={{ width: size, height: size }}
      >
        {logoUrl ? (
          <Image src={logoUrl} alt={name} width={size * 0.55} height={size * 0.55} className="object-contain" />
        ) : (
          <span className="font-display text-xl text-muted">{name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <span className="max-w-[8rem] text-center text-sm font-semibold text-foreground">{name}</span>
    </div>
  );
}

function findMarket(prediction: Prediction, market: string, selection: string): number {
  return prediction.markets.find((m) => m.market === market && m.selection === selection)?.probability ?? 0;
}

export function MatchBreakdown({ prediction }: { prediction: Prediction }) {
  const { match } = prediction;
  const correctScores = prediction.markets.filter((m) => m.market === 'Correct Score').slice(0, 5);

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted">
              {match.league.name} · {formatKickoff(match.kickoffAt)}
            </span>
            <div className="flex gap-2">
              {prediction.tier === 'vip' && <Badge variant="vip">VIP</Badge>}
              <Badge variant={`risk-${prediction.riskRating}`}>{prediction.riskRating} risk</Badge>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 sm:gap-12">
            <TeamCrest name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} size={80} />
            <span className="font-display text-2xl text-muted">VS</span>
            <TeamCrest name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} size={80} />
          </div>

          <div className="mx-auto mt-8 max-w-lg">
            <ConfidenceBar
              home={findMarket(prediction, '1X2', 'Home')}
              draw={findMarket(prediction, '1X2', 'Draw')}
              away={findMarket(prediction, '1X2', 'Away')}
            />
          </div>

          <div className="mx-auto mt-6 flex max-w-lg items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted">AI confidence</span>
            <span className="font-mono text-2xl font-bold tabular-nums text-primary">
              {prediction.confidenceScore}%
            </span>
          </div>
        </Container>
      </div>

      <Container className="grid gap-6 py-10 sm:py-12 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardContent className="pt-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                AI analysis
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{prediction.aiExplanation}</p>
              {prediction.historicalComparison && (
                <p className="mt-3 text-sm leading-relaxed text-muted">{prediction.historicalComparison}</p>
              )}
            </CardContent>
          </Card>

          <MatchAssistant prediction={prediction} />

          <Card>
            <CardContent className="pt-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">Key factors</h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {prediction.keyFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {factor}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4 pt-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                Other markets
              </h2>
              <MarketBar
                label="Double chance"
                optionA={{ label: '1X', value: findMarket(prediction, 'Double Chance', 'Home or Draw') }}
                optionB={{ label: 'X2', value: findMarket(prediction, 'Double Chance', 'Draw or Away') }}
              />
              <MarketBar
                label="Both teams to score"
                optionA={{ label: 'Yes', value: findMarket(prediction, 'BTTS', 'Yes') }}
                optionB={{ label: 'No', value: findMarket(prediction, 'BTTS', 'No') }}
              />
              <MarketBar
                label="Over/Under 1.5"
                optionA={{ label: 'Over', value: findMarket(prediction, 'Over/Under 1.5', 'Over') }}
                optionB={{ label: 'Under', value: findMarket(prediction, 'Over/Under 1.5', 'Under') }}
              />
              <MarketBar
                label="Over/Under 2.5"
                optionA={{ label: 'Over', value: findMarket(prediction, 'Over/Under 2.5', 'Over') }}
                optionB={{ label: 'Under', value: findMarket(prediction, 'Over/Under 2.5', 'Under') }}
              />
              <MarketBar
                label="Over/Under 3.5"
                optionA={{ label: 'Over', value: findMarket(prediction, 'Over/Under 3.5', 'Over') }}
                optionB={{ label: 'Under', value: findMarket(prediction, 'Over/Under 3.5', 'Under') }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="pt-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                Most likely scorelines
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {correctScores.map((score) => (
                  <li
                    key={score.selection}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <span className="font-mono text-sm font-semibold tabular-nums">{score.selection}</span>
                    <span className="font-mono text-sm tabular-nums text-muted">
                      {score.probability.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">Market context</h2>
              {match.odds?.home || match.odds?.draw || match.odds?.away ? (
                <>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-md border border-border p-2"><span className="block text-muted">Home</span><strong className="mt-1 block font-mono text-foreground">{match.odds.home ?? '—'}</strong></div><div className="rounded-md border border-border p-2"><span className="block text-muted">Draw</span><strong className="mt-1 block font-mono text-foreground">{match.odds.draw ?? '—'}</strong></div><div className="rounded-md border border-border p-2"><span className="block text-muted">Away</span><strong className="mt-1 block font-mono text-foreground">{match.odds.away ?? '—'}</strong></div></div>
                  <p className="mt-3 text-[11px] text-muted">Last synced {match.odds.lastUpdatedAt ? new Date(match.odds.lastUpdatedAt).toLocaleString() : 'recently'}. Market prices move; they are context, not advice.</p>
                </>
              ) : <p className="mt-3 text-sm leading-6 text-muted">Odds are not available for this fixture yet. The prediction remains usable because the model also uses team and competition data.</p>}
            </CardContent>
          </Card>

          <p className="px-1 text-xs leading-relaxed text-muted">
            Generated by model {prediction.modelVersion}. Predictions are statistical estimates for
            informational purposes only — not betting advice.
          </p>
        </div>
      </Container>
    </>
  );
}
