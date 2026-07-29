import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { MarketBar } from '@/components/predictions/MarketBar';
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

interface MarketFocusCardProps {
  prediction: Prediction;
  market: string;
  optionALabel: string;
  optionBLabel: string;
}

/** Same prediction data as PredictionCard, but the market bar shown is
 * configurable — powers the BTTS/Over-Under/Double-Chance listing pages
 * without duplicating a prediction fetch per market. */
export function MarketFocusCard({ prediction, market, optionALabel, optionBLabel }: MarketFocusCardProps) {
  const { match } = prediction;
  const optionA = prediction.markets.find((m) => m.market === market && m.selection === optionALabel);
  const optionB = prediction.markets.find((m) => m.market === market && m.selection === optionBLabel);

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
        <MarketBar
          label={market}
          optionA={{ label: optionALabel, value: optionA?.probability ?? 0 }}
          optionB={{ label: optionBLabel, value: optionB?.probability ?? 0 }}
        />
      </CardContent>
    </Card>
  );
}
