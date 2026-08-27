import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
import { SaveButton } from '@/components/predictions/SaveButton';
import { PredictionOutcomeBadge } from '@/components/predictions/PredictionOutcomeBadge';
import { formatKickoff, formatMatchScore } from '@/lib/utils';
import { Prediction } from '@/types/api';

function TeamCrest({ name, logoUrl }: { name: string; logoUrl?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-elevated">
        {logoUrl ? (
          <Image src={logoUrl} alt={name} width={28} height={28} className="object-contain" />
        ) : (
          <span className="font-display text-sm text-muted">{name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <span className="max-w-[6rem] truncate text-xs font-medium text-foreground">{name}</span>
    </div>
  );
}

export function PredictionCard({
  prediction,
  showSaveButton = true,
}: {
  prediction: Prediction;
  showSaveButton?: boolean;
}) {
  const { match, confidenceScore, riskRating, tier } = prediction;
  const currentScore = formatMatchScore(match.score);
  const winner = prediction.markets.filter((m) => m.market === '1X2');
  const home = winner.find((m) => m.selection === 'Home')?.probability ?? 0;
  const draw = winner.find((m) => m.selection === 'Draw')?.probability ?? 0;
  const away = winner.find((m) => m.selection === 'Away')?.probability ?? 0;

  return (
    <Link href={`/matches/${match._id}`} className="block">
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <span className="truncate text-xs font-medium text-muted">{match.league.name}</span>
          <div className="flex items-center gap-1.5">
            {tier === 'vip' && <Badge variant="vip">VIP</Badge>}
            <PredictionOutcomeBadge prediction={prediction} />
            <Badge variant={`risk-${riskRating}`}>{riskRating} risk</Badge>
            {showSaveButton && <SaveButton predictionId={prediction._id} />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex items-center justify-between gap-2">
            <TeamCrest name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} />
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-[11px] tabular-nums text-muted">
                {formatKickoff(match.kickoffAt)}
              </span>
              <span className={`font-display text-lg ${currentScore ? 'text-primary' : 'text-muted'}`}>
                {currentScore ?? 'VS'}
              </span>
            </div>
            <TeamCrest name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} />
          </div>

          {winner.length > 0 && <ConfidenceBar home={home} draw={draw} away={away} />}

          {confidenceScore > 0 && <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-muted">Confidence</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {confidenceScore}%
            </span>
          </div>}
        </CardContent>
      </Card>
    </Link>
  );
}
