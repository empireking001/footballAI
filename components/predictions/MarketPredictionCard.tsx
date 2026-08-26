import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MarketBar } from '@/components/predictions/MarketBar';
import { SaveButton } from '@/components/predictions/SaveButton';
import { formatKickoff, formatMatchScore } from '@/lib/utils';
import { Prediction } from '@/types/api';

type MarketView = 'btts' | 'over-under' | 'correct-score' | 'double-chance';

function TeamCrest({ name, logoUrl }: { name: string; logoUrl?: string }) {
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

function findMarketValue(
  prediction: Prediction,
  marketMatches: (market: string) => boolean,
  selectionMatches: (selection: string) => boolean,
): number {
  return prediction.markets.find((item) => marketMatches(item.market) && selectionMatches(item.selection))?.probability ?? 0;
}

function MarketHighlight({ prediction, view }: { prediction: Prediction; view: MarketView }) {
  switch (view) {
    case 'btts':
      return (
        <MarketBar
          label="Both teams to score"
          optionA={{ label: 'Yes', value: findMarketValue(prediction, (market) => market === 'BTTS', (selection) => selection === 'Yes') }}
          optionB={{ label: 'No', value: findMarketValue(prediction, (market) => market === 'BTTS', (selection) => selection === 'No') }}
        />
      );
    case 'over-under':
      return (
        <MarketBar
          label="Over/Under 2.5 goals"
          optionA={{ label: 'Over', value: findMarketValue(prediction, (market) => market === 'Over/Under' || market.startsWith('Over/Under'), (selection) => selection.startsWith('Over')) }}
          optionB={{ label: 'Under', value: findMarketValue(prediction, (market) => market === 'Over/Under' || market.startsWith('Over/Under'), (selection) => selection.startsWith('Under')) }}
        />
      );
    case 'double-chance':
      return (
        <MarketBar
          label="Double chance"
          optionA={{ label: '1X', value: findMarketValue(prediction, (market) => market === 'Double Chance', (selection) => selection === '1X' || selection === 'Home or Draw') }}
          optionB={{ label: 'X2', value: findMarketValue(prediction, (market) => market === 'Double Chance', (selection) => selection === 'X2' || selection === 'Draw or Away') }}
        />
      );
    case 'correct-score': {
      const topScores = prediction.markets
        .filter((m) => m.market === 'Correct Score')
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 3);
      return (
        <div>
          <span className="mb-2 block text-xs font-medium text-muted">Most likely scorelines</span>
          <div className="flex gap-2">
            {topScores.map((score) => (
              <div
                key={score.selection}
                className="flex flex-1 flex-col items-center rounded-md border border-border py-2"
              >
                <span className="font-mono text-sm font-bold tabular-nums">{score.selection}</span>
                <span className="font-mono text-xs tabular-nums text-muted">
                  {score.probability.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
}

export function MarketPredictionCard({ prediction, view }: { prediction: Prediction; view: MarketView }) {
  const { match } = prediction;
  const currentScore = formatMatchScore(match.score);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <span className="truncate text-xs font-medium text-muted">{match.league.name}</span>
        <div className="flex items-center gap-1.5">
          {prediction.tier === 'vip' && <Badge variant="vip">VIP</Badge>}
          <SaveButton predictionId={prediction._id} />
        </div>
      </CardHeader>
      <CardContent>
        <Link href={`/matches/${match._id}`} className="block">
          <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamCrest name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} />
            <span className={`font-display text-xl font-bold tabular-nums ${currentScore ? 'text-primary' : 'text-muted'}`}>{currentScore ?? 'VS'}</span>
            <TeamCrest name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} />
          </div>
          <span className="mb-3 block font-mono text-[11px] tabular-nums text-muted">
            {formatKickoff(match.kickoffAt)}
          </span>
        </Link>
        <MarketHighlight prediction={prediction} view={view} />
      </CardContent>
    </Card>
  );
}
