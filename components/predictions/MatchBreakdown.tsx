import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
import { MarketBar } from '@/components/predictions/MarketBar';
import { Container } from '@/components/ui/Container';
import { formatKickoff } from '@/lib/utils';
import { AiSettings, MatchFormItem, Prediction } from '@/types/api';
import { MatchAssistant } from '@/components/predictions/MatchAssistant';
import { AdBanner } from '@/components/ads/AdBanner';

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
  return prediction.markets.find((item) => item.market === market && item.selection === selection)?.probability ?? 0;
}

function FormStrip({ label, items }: { label: string; items: MatchFormItem[] }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="text-xs text-muted">Last five</span>
      </div>
      <div className="mt-3 flex gap-2">
        {items.length === 0 ? (
          <span className="text-xs text-muted">No finished matches stored yet.</span>
        ) : (
          items.map((item) => (
            <div key={item.matchId} className="flex flex-col items-center gap-1" title={`${item.score} · ${item.opponent.name}`}>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  item.result === 'W'
                    ? 'bg-live/15 text-live'
                    : item.result === 'L'
                      ? 'bg-danger/15 text-danger'
                      : 'bg-surface-elevated text-muted'
                }`}
              >
                {item.result}
              </span>
              <span className="text-[10px] text-muted">{item.score}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function OddsTable({ prediction }: { prediction: Prediction }) {
  const odds = prediction.match.odds;
  const rows = [
    ['Home', odds?.home],
    ['Draw', odds?.draw],
    ['Away', odds?.away],
    ['Over 2.5', odds?.over25],
    ['Under 2.5', odds?.under25],
  ] as const;
  const available = rows.filter(([, value]) => value !== undefined);
  if (available.length === 0) {
    return (
      <Card>
        <CardContent className="pt-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Odds comparison</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Odds are not available for this fixture yet. The prediction still uses team, form, standings, and competition data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Odds comparison</h2>
          <span className="text-xs text-muted">Aggregated bookmaker prices</span>
        </div>
        <div className="mt-3 divide-y divide-border">
          {available.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted">{label}</span>
              <span className="font-mono font-semibold tabular-nums text-foreground">{value?.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MatchBreakdown({ prediction, aiSettings }: { prediction: Prediction; aiSettings?: AiSettings }) {
  const { match } = prediction;
  const isManual = prediction.modelVersion === 'manual-v1';
  const correctScores = prediction.markets.filter((item) => item.market === 'Correct Score').slice(0, 5);
  const context = prediction.context;
  const homeStanding = context?.standings.find((row) => typeof row.team === 'object' && row.team?.name === match.homeTeam.name);
  const awayStanding = context?.standings.find((row) => typeof row.team === 'object' && row.team?.name === match.awayTeam.name);
  const showConfidence = aiSettings?.showConfidence !== false;
  const showMarkets = aiSettings?.showMarkets !== false;
  const showExplanation = aiSettings?.showExplanation !== false;
  const showAssistant = aiSettings?.showAssistant !== false;

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <AdBanner slotId="match-top" className="mb-6" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted">
              {match.league.logoUrl && <Image src={match.league.logoUrl} alt="" width={24} height={24} className="h-6 w-6 object-contain" />}
              <span>{match.league.name} · {formatKickoff(match.kickoffAt)}</span>
            </div>
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
          {showMarkets && <div className="mx-auto mt-8 max-w-lg">
            <ConfidenceBar
              home={findMarket(prediction, '1X2', 'Home')}
              draw={findMarket(prediction, '1X2', 'Draw')}
              away={findMarket(prediction, '1X2', 'Away')}
            />
          </div>}
          {showConfidence && (!isManual || prediction.confidenceScore > 0) && <div className="mx-auto mt-6 flex max-w-lg items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted">{isManual ? 'Confidence' : 'AI confidence'}</span>
            <span className="font-mono text-2xl font-bold tabular-nums text-primary">{prediction.confidenceScore}%</span>
          </div>}
        </Container>
      </div>

      <Container className="grid gap-6 py-10 sm:py-12 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {showExplanation && (prediction.aiExplanation || prediction.historicalComparison) && <Card>
            <CardContent className="pt-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">{isManual ? 'Admin explanation' : 'AI analysis'}</h2>
              {prediction.aiExplanation && <p className="mt-3 text-sm leading-relaxed text-foreground/90">{prediction.aiExplanation}</p>}
              {prediction.historicalComparison && <p className="mt-3 text-sm leading-relaxed text-muted">{prediction.historicalComparison}</p>}
            </CardContent>
          </Card>}

          <Card>
            <CardContent className="pt-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">Supporting data</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div className="rounded-md border border-border p-3">
                  <FormStrip label={match.homeTeam.name} items={context?.form.home ?? []} />
                  {homeStanding && <p className="mt-3 text-xs text-muted">League position {homeStanding.position} · {homeStanding.points} pts</p>}
                </div>
                <div className="rounded-md border border-border p-3">
                  <FormStrip label={match.awayTeam.name} items={context?.form.away ?? []} />
                  {awayStanding && <p className="mt-3 text-xs text-muted">League position {awayStanding.position} · {awayStanding.points} pts</p>}
                </div>
              </div>
              {context?.headToHead && context.headToHead.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-foreground">Head-to-head</h3>
                  <div className="mt-2 flex flex-col gap-2">
                    {context.headToHead.map((historic) => (
                      <div key={historic._id} className="flex items-center justify-between text-xs text-muted">
                        <span>{formatKickoff(historic.kickoffAt)}</span>
                        <span>{historic.homeTeam.name} {historic.score?.homeFullTime ?? '-'}–{historic.score?.awayFullTime ?? '-'} {historic.awayTeam.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {showAssistant && <MatchAssistant prediction={prediction} />}

          {showExplanation && prediction.keyFactors.length > 0 && <Card>
            <CardContent className="pt-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">Key factors</h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {prediction.keyFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {factor}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>}

          {showMarkets && <Card>
            <CardContent className="flex flex-col gap-4 pt-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">Other markets</h2>
              <MarketBar label="Double chance" optionA={{ label: '1X', value: findMarket(prediction, 'Double Chance', 'Home or Draw') }} optionB={{ label: 'X2', value: findMarket(prediction, 'Double Chance', 'Draw or Away') }} />
              <MarketBar label="Both teams to score" optionA={{ label: 'Yes', value: findMarket(prediction, 'BTTS', 'Yes') }} optionB={{ label: 'No', value: findMarket(prediction, 'BTTS', 'No') }} />
              <MarketBar label="Over/Under 1.5" optionA={{ label: 'Over', value: findMarket(prediction, 'Over/Under 1.5', 'Over') }} optionB={{ label: 'Under', value: findMarket(prediction, 'Over/Under 1.5', 'Under') }} />
              <MarketBar label="Over/Under 2.5" optionA={{ label: 'Over', value: findMarket(prediction, 'Over/Under 2.5', 'Over') }} optionB={{ label: 'Under', value: findMarket(prediction, 'Over/Under 2.5', 'Under') }} />
              <MarketBar label="Over/Under 3.5" optionA={{ label: 'Over', value: findMarket(prediction, 'Over/Under 3.5', 'Over') }} optionB={{ label: 'Under', value: findMarket(prediction, 'Over/Under 3.5', 'Under') }} />
            </CardContent>
          </Card>}
        </div>

        <div className="flex flex-col gap-6">
          {showMarkets && <OddsTable prediction={prediction} />}
          {showMarkets && <Card>
            <CardContent className="pt-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">Most likely scorelines</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {correctScores.map((score) => (
                  <li key={score.selection} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <span className="font-mono text-sm font-semibold tabular-nums">{score.selection}</span>
                    <span className="font-mono text-sm tabular-nums text-muted">{score.probability.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>}
          <p className="px-1 text-xs leading-relaxed text-muted">{isManual ? 'Entered manually by an administrator.' : `Generated by model ${prediction.modelVersion}.`} Predictions are statistical estimates for informational purposes only — not betting advice.</p>
        </div>
      </Container>
    </>
  );
}
