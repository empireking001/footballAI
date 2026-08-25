import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Match } from '@/types/api';

function TeamRow({ name, logoUrl, score }: { name: string; logoUrl?: string; score?: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-elevated">
          {logoUrl ? (
            <Image src={logoUrl} alt={name} width={18} height={18} className="object-contain" />
          ) : (
            <span className="text-[10px] font-semibold text-muted">{name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <span className="truncate text-sm font-medium text-foreground">{name}</span>
      </div>
      <span className="font-mono text-lg font-bold tabular-nums text-foreground">{score ?? '-'}</span>
    </div>
  );
}

export function LiveMatchCard({ match }: { match: Match }) {
  const statusLabel = match.status === 'halftime' ? 'HT' : 'LIVE';

  return (
    <Link href={`/matches/${match._id}`}>
      <Card className="p-4 transition-colors hover:border-primary/40">
        <div className="mb-3 flex items-center justify-between">
          <span className="truncate text-xs font-medium text-muted">{match.league.name}</span>
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-danger">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
            {statusLabel}
          </span>
        </div>
        <CardContent className="flex flex-col gap-2 p-0">
          <TeamRow name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} score={match.score?.homeFullTime} />
          <TeamRow name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} score={match.score?.awayFullTime} />
        </CardContent>
      </Card>
    </Link>
  );
}
