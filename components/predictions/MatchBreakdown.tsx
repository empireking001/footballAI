import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
import { Container } from '@/components/ui/Container';
import { formatKickoff, formatMatchScore } from '@/lib/utils';
import { MarketOutcome, MatchFormItem, Prediction, Standing, TeamStats } from '@/types/api';
import { AdBanner } from '@/components/ads/AdBanner';

function TeamCrest({ name, logoUrl, size = 64 }: { name: string; logoUrl?: string; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center rounded-full border border-border bg-surface-elevated" style={{ width: size, height: size }}>
        {logoUrl ? <Image src={logoUrl} alt={name} width={size * 0.55} height={size * 0.55} className="object-contain" /> : <span className="font-display text-xl text-muted">{name.slice(0, 2).toUpperCase()}</span>}
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
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-foreground">{label}</h3><span className="text-xs text-muted">Last five</span></div>
      <div className="mt-3 flex gap-2">
        {items.length === 0 ? <span className="text-xs text-muted">No finished matches stored yet.</span> : items.map((item) => (
          <div key={item.matchId} className="flex flex-col items-center gap-1" title={`${item.score} · ${item.opponent.name}`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${item.result === 'W' ? 'bg-live/15 text-live' : item.result === 'L' ? 'bg-danger/15 text-danger' : 'bg-surface-elevated text-muted'}`}>{item.result}</span>
            <span className="text-[10px] text-muted">{item.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRecord(stats?: TeamStats): string {
  if (!stats || stats.matchesPlayed === 0) return '—';
  return `${stats.wins}-${stats.draws}-${stats.losses}`;
}

function TeamProfile({ name, overall, venueLabel, venue }: { name: string; overall?: TeamStats; venueLabel: string; venue?: TeamStats }) {
  const rows = [
    ['Record', formatRecord(overall)],
    ['Goals for', overall?.matchesPlayed ? `${overall.goalsFor} · ${overall.avgGoalsFor.toFixed(2)}/match` : '—'],
    ['Goals against', overall?.matchesPlayed ? `${overall.goalsAgainst} · ${overall.avgGoalsAgainst.toFixed(2)}/match` : '—'],
    ['Clean sheets', overall?.matchesPlayed ? `${overall.cleanSheets}/${overall.matchesPlayed}` : '—'],
    ['Failed to score', overall?.matchesPlayed ? `${overall.failedToScore}/${overall.matchesPlayed}` : '—'],
  ];
  return (
    <div className="rounded-lg border border-border bg-surface/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Verified data</span>
      </div>
      <div className="mt-4 grid gap-2">
        {rows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 text-xs"><span className="text-muted">{label}</span><span className="font-mono font-semibold tabular-nums text-foreground">{value}</span></div>)}
      </div>
      <div className="mt-4 border-t border-border pt-3 text-xs text-muted">{venueLabel}: <span className="font-mono font-semibold text-foreground">{formatRecord(venue)}</span></div>
    </div>
  );
}

function StandingComparison({ homeStanding, awayStanding, homeName, awayName }: { homeStanding?: Standing; awayStanding?: Standing; homeName: string; awayName: string }) {
  if (!homeStanding && !awayStanding) return null;
  return (
    <div className="mt-5 border-t border-border pt-5">
      <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-foreground">League table comparison</h3><span className="font-mono text-[10px] uppercase tracking-widest text-muted">Live standings</span></div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-surface-elevated px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted"><span>Team</span><span>Pos</span><span>Pts</span></div>
        {[{ name: homeName, standing: homeStanding }, { name: awayName, standing: awayStanding }].map(({ name, standing }) => <div key={name} className="grid grid-cols-[1fr_auto_auto] gap-3 border-t border-border px-3 py-2.5 text-xs"><span className="truncate text-foreground">{name}</span><span className="font-mono text-foreground">{standing?.position ?? '—'}</span><span className="font-mono font-semibold text-primary">{standing?.points ?? '—'}</span></div>)}
      </div>
    </div>
  );
}

function marketLabel(market: string): string {
  if (market === '1X2') return 'Match result';
  if (market === 'BTTS') return 'Both teams to score';
  if (market === 'Over/Under' || market.startsWith('Over/Under')) return 'Goals market';
  if (market === 'Double Chance') return 'Double chance';
  if (market === 'Correct Score') return 'Correct score';
  return market;
}

function MarketGroup({ market, items }: { market: string; items: MarketOutcome[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{marketLabel(market)}</h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Manual pick</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={`${item.market}-${item.selection}`} className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2.5">
            <span className="text-sm font-semibold text-foreground">{item.selection}</span>
            <span className="font-mono text-sm font-bold tabular-nums text-primary">{item.probability.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OddsTable({ prediction }: { prediction: Prediction }) {
  const odds = prediction.match.odds;
  const rows = [['Home', odds?.home], ['Draw', odds?.draw], ['Away', odds?.away], ['Over 2.5', odds?.over25], ['Under 2.5', odds?.under25]] as const;
  const available = rows.filter(([, value]) => value !== undefined);
  return (
    <Card>
      <CardContent className="pt-5">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Odds comparison</h2>
        {available.length === 0 ? <p className="mt-3 text-sm leading-6 text-muted">Odds are not available for this fixture yet.</p> : <div className="mt-3 divide-y divide-border">{available.map(([label, value]) => <div key={label} className="flex items-center justify-between py-2 text-sm"><span className="text-muted">{label}</span><span className="font-mono font-semibold tabular-nums text-foreground">{value?.toFixed(2)}</span></div>)}</div>}
      </CardContent>
    </Card>
  );
}

export function MatchBreakdown({ prediction }: { prediction: Prediction }) {
  const { match } = prediction;
  const currentScore = formatMatchScore(match.score);
  const correctScores = prediction.markets.filter((item) => item.market === 'Correct Score').slice(0, 5);
  const context = prediction.context;
  const homeStanding = context?.standings.find((row) => typeof row.team === 'object' && row.team?.name === match.homeTeam.name);
  const awayStanding = context?.standings.find((row) => typeof row.team === 'object' && row.team?.name === match.awayTeam.name);
  const winnerMarkets = prediction.markets.filter((item) => item.market === '1X2');
  const marketGroups = prediction.markets.reduce<Record<string, MarketOutcome[]>>((groups, item) => {
    const key = item.market.startsWith('Over/Under') ? 'Over/Under' : item.market;
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <AdBanner slotId="match-top" className="mb-6" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted">{match.league.logoUrl && <Image src={match.league.logoUrl} alt="" width={24} height={24} className="h-6 w-6 object-contain" />}<span>{match.league.name} · {formatKickoff(match.kickoffAt)}</span></div>
            <div className="flex gap-2">{prediction.tier === 'vip' && <Badge variant="vip">VIP</Badge>}<Badge variant={`risk-${prediction.riskRating}`}>{prediction.riskRating} risk</Badge></div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 sm:gap-12"><TeamCrest name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} size={80} /><div className="flex flex-col items-center gap-1"><span className={`font-display text-3xl font-bold tabular-nums ${currentScore ? 'text-primary' : 'text-muted'}`}>{currentScore ?? 'VS'}</span>{currentScore && <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Match score</span>}</div><TeamCrest name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} size={80} /></div>
          {winnerMarkets.length > 0 && <div className="mx-auto mt-8 max-w-lg"><ConfidenceBar home={findMarket(prediction, '1X2', 'Home')} draw={findMarket(prediction, '1X2', 'Draw')} away={findMarket(prediction, '1X2', 'Away')} /></div>}
          {prediction.confidenceScore > 0 && <div className="mx-auto mt-6 flex max-w-lg items-center justify-between border-t border-border pt-4"><span className="text-sm text-muted">Confidence</span><span className="font-mono text-2xl font-bold tabular-nums text-primary">{prediction.confidenceScore}%</span></div>}
        </Container>
      </div>

      <Container className="grid gap-6 py-10 sm:py-12 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {(prediction.aiExplanation || prediction.historicalComparison) && <Card><CardContent className="pt-5"><h2 className="font-display text-lg font-bold uppercase tracking-tight">Prediction note</h2>{prediction.aiExplanation && <p className="mt-3 text-sm leading-relaxed text-foreground/90">{prediction.aiExplanation}</p>}{prediction.historicalComparison && <p className="mt-3 text-sm leading-relaxed text-muted">{prediction.historicalComparison}</p>}</CardContent></Card>}

          <Card><CardContent className="pt-5"><div><h2 className="font-display text-lg font-bold uppercase tracking-tight">Match intelligence</h2><p className="mt-1 text-xs text-muted">Verified statistics calculated from stored finished fixtures and live standings.</p></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><TeamProfile name={match.homeTeam.name} overall={context?.teamStats?.home.overall} venueLabel="Home record" venue={context?.teamStats?.home.venue} /><TeamProfile name={match.awayTeam.name} overall={context?.teamStats?.away.overall} venueLabel="Away record" venue={context?.teamStats?.away.venue} /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-md border border-border p-3"><FormStrip label={`${match.homeTeam.name} form`} items={context?.form.home ?? []} /></div><div className="rounded-md border border-border p-3"><FormStrip label={`${match.awayTeam.name} form`} items={context?.form.away ?? []} /></div></div><StandingComparison homeStanding={homeStanding} awayStanding={awayStanding} homeName={match.homeTeam.name} awayName={match.awayTeam.name} />{context?.headToHead && context.headToHead.length > 0 && <div className="mt-5 border-t border-border pt-5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-foreground">Head-to-head</h3><span className="font-mono text-[10px] uppercase tracking-widest text-muted">Last five</span></div><div className="mt-3 flex flex-col gap-2">{context.headToHead.map((historic) => <div key={historic._id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-xs text-muted"><span>{formatKickoff(historic.kickoffAt)}</span><span className="text-right">{historic.homeTeam.name} {historic.score?.homeFullTime ?? '-'}–{historic.score?.awayFullTime ?? '-'} {historic.awayTeam.name}</span></div>)}</div></div>}</CardContent></Card>

          {prediction.keyFactors.length > 0 && <Card><CardContent className="pt-5"><h2 className="font-display text-lg font-bold uppercase tracking-tight">Key factors</h2><ul className="mt-3 flex flex-col gap-2.5">{prediction.keyFactors.map((factor, index) => <li key={index} className="flex items-start gap-2.5 text-sm text-foreground/90"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />{factor}</li>)}</ul></CardContent></Card>}

          {prediction.markets.length > 0 && <Card><CardContent className="flex flex-col gap-4 pt-5"><div><h2 className="font-display text-lg font-bold uppercase tracking-tight">Manual picks</h2><p className="mt-1 text-xs text-muted">Administrator-entered selections by market.</p></div>{Object.entries(marketGroups).map(([market, items]) => <MarketGroup key={market} market={market} items={items} />)}</CardContent></Card>}
        </div>

        <div className="flex flex-col gap-6"><OddsTable prediction={prediction} />{correctScores.length > 0 && <Card><CardContent className="pt-5"><h2 className="font-display text-lg font-bold uppercase tracking-tight">Most likely scorelines</h2><ul className="mt-3 flex flex-col gap-2">{correctScores.map((score) => <li key={score.selection} className="flex items-center justify-between rounded-md border border-border px-3 py-2"><span className="font-mono text-sm font-semibold tabular-nums">{score.selection}</span><span className="font-mono text-sm tabular-nums text-muted">{score.probability.toFixed(1)}%</span></li>)}</ul></CardContent></Card>}<p className="px-1 text-xs leading-relaxed text-muted">Entered manually by an administrator. Predictions are informational estimates and not betting advice.</p></div>
      </Container>
    </>
  );
}
