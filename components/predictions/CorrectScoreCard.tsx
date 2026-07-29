import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { SaveButton } from '@/components/predictions/SaveButton';
import { formatKickoff } from '@/lib/utils';
import { Prediction } from '@/types/api';

function TeamMini({ name, logoUrl }: { name: string; logoUrl?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-elevated">
        {logoUrl ? (
          <Image src={logoUrl} alt={name} width={18} height={18} className="object-contain" />
        ) : (
          <span className="text-[10px] font-semibold text-muted">{name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <span className="truncate text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}

export function CorrectScoreCard({ prediction }: { prediction: Prediction }) {
  const { match } = prediction;
  const topScores = prediction.markets
    .filter((m) => m.market === 'Correct Score')
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <span className="truncate text-xs font-medium text-muted">{match.league.name}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] tabular-nums text-muted">{formatKickoff(match.kickoffAt)}</span>
          <SaveButton predictionId={prediction._id} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Link href={`/matches/${match._id}`} className="flex flex-col gap-2">
          <TeamMini name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} />
          <TeamMini name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} />
        </Link>
        <div className="flex flex-col gap-2">
          {topScores.map((score, i) => (
            <div
              key={score.selection}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-elevated text-[10px] font-semibold text-muted">
                  {i + 1}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums">{score.selection}</span>
              </div>
              <span className="font-mono text-xs tabular-nums text-muted">
                {score.probability.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
