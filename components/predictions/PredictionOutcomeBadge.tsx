import { CheckCircle2, Clock3, LockKeyhole, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Prediction } from '@/types/api';

export type MarketResult = boolean | 'pending' | 'unsupported';

export function getMarketResult(prediction: Prediction, market: Prediction['markets'][number]): MarketResult {
  if (prediction.isVipLocked) return 'pending';
  if (prediction.match.status !== 'finished' || !prediction.accuracy?.evaluatedAt) return 'pending';
  if (market.market === '1X2') return prediction.accuracy.winnerCorrect ?? 'unsupported';
  if (market.market === 'BTTS') return prediction.accuracy.bttsCorrect ?? 'unsupported';
  if (market.market.startsWith('Over/Under')) return prediction.accuracy.overUnderCorrect ?? 'unsupported';
  if (market.market === 'Double Chance') return prediction.accuracy.doubleChanceCorrect ?? 'unsupported';
  if (market.market === 'Correct Score') return prediction.accuracy.correctScoreCorrect ?? 'unsupported';
  return 'unsupported';
}

export function getPredictionOutcome(prediction: Prediction): 'won' | 'lost' | 'mixed' | 'pending' | 'locked' {
  if (prediction.isVipLocked) return 'locked';
  const results = prediction.markets
    .map((market) => getMarketResult(prediction, market))
    .filter((result): result is boolean => typeof result === 'boolean');
  if (results.length === 0) return 'pending';
  const correct = results.filter(Boolean).length;
  if (correct === results.length) return 'won';
  if (correct === 0) return 'lost';
  return 'mixed';
}

export function PredictionOutcomeBadge({ prediction }: { prediction: Prediction }) {
  if (prediction.match.status !== 'finished') return null;
  const outcome = getPredictionOutcome(prediction);
  if (outcome === 'locked') return <Badge variant="vip"><LockKeyhole className="mr-1 h-3.5 w-3.5" />Result recorded</Badge>;
  if (outcome === 'pending') return <Badge variant="default"><Clock3 className="mr-1 h-3.5 w-3.5" />Awaiting review</Badge>;
  if (outcome === 'won') return <Badge variant="live"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Won</Badge>;
  if (outcome === 'lost') return <Badge variant="risk-high"><XCircle className="mr-1 h-3.5 w-3.5" />Lost</Badge>;
  const correct = prediction.markets.map((market) => getMarketResult(prediction, market)).filter((result): result is boolean => typeof result === 'boolean').filter(Boolean).length;
  const total = prediction.markets.map((market) => getMarketResult(prediction, market)).filter((result): result is boolean => typeof result === 'boolean').length;
  return <Badge variant="default"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />{correct}/{total} correct</Badge>;
}
