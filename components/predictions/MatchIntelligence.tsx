import { Card, CardContent } from '@/components/ui/Card';
import { formatKickoff } from '@/lib/utils';
import { Match, MatchContext, MatchFormItem, TeamStats } from '@/types/api';

function formatRecord(stats?: TeamStats): string {
  if (!stats || stats.matchesPlayed === 0) return '—';
  return `${stats.wins}-${stats.draws}-${stats.losses}`;
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
      <div className="flex items-center justify-between gap-3"><h3 className="truncate text-sm font-semibold text-foreground">{name}</h3><span className="font-mono text-[10px] uppercase tracking-widest text-muted">Verified data</span></div>
      <div className="mt-4 grid gap-2">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 text-xs"><span className="text-muted">{label}</span><span className="font-mono font-semibold tabular-nums text-foreground">{value}</span></div>)}</div>
      <div className="mt-4 border-t border-border pt-3 text-xs text-muted">{venueLabel}: <span className="font-mono font-semibold text-foreground">{formatRecord(venue)}</span></div>
    </div>
  );
}

function StandingComparison({ context, homeName, awayName }: { context: MatchContext; homeName: string; awayName: string }) {
  const homeStanding = context.standings.find((row) => typeof row.team === 'object' && row.team?.name === homeName);
  const awayStanding = context.standings.find((row) => typeof row.team === 'object' && row.team?.name === awayName);
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

export function MatchIntelligence({ match, context }: { match: Match; context?: MatchContext }) {
  if (!context) return null;
  return (
    <Card><CardContent className="pt-5"><div><h2 className="font-display text-lg font-bold uppercase tracking-tight">Match intelligence</h2><p className="mt-1 text-xs text-muted">Verified statistics calculated from stored finished fixtures and live standings.</p></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><TeamProfile name={match.homeTeam.name} overall={context.teamStats?.home.overall} venueLabel="Home record" venue={context.teamStats?.home.venue} /><TeamProfile name={match.awayTeam.name} overall={context.teamStats?.away.overall} venueLabel="Away record" venue={context.teamStats?.away.venue} /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-md border border-border p-3"><FormStrip label={`${match.homeTeam.name} form`} items={context.form.home} /></div><div className="rounded-md border border-border p-3"><FormStrip label={`${match.awayTeam.name} form`} items={context.form.away} /></div></div><StandingComparison context={context} homeName={match.homeTeam.name} awayName={match.awayTeam.name} />{context.headToHead.length > 0 && <div className="mt-5 border-t border-border pt-5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-foreground">Head-to-head</h3><span className="font-mono text-[10px] uppercase tracking-widest text-muted">Last five</span></div><div className="mt-3 flex flex-col gap-2">{context.headToHead.map((historic) => <div key={historic._id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-xs text-muted"><span>{formatKickoff(historic.kickoffAt)}</span><span className="text-right">{historic.homeTeam.name} {historic.score?.homeFullTime ?? '-'}–{historic.score?.awayFullTime ?? '-'} {historic.awayTeam.name}</span></div>)}</div></div>}</CardContent></Card>
  );
}
