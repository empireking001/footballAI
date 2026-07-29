'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatKickoff, cn } from '@/lib/utils';
import { Prediction } from '@/types/api';

interface Leg {
  predictionId: string;
  matchLabel: string;
  selection: string;
  probability: number;
}

function findWinnerMarkets(prediction: Prediction) {
  return prediction.markets.filter((m) => m.market === '1X2');
}

export function AccumulatorBuilder({ predictions }: { predictions: Prediction[] }) {
  const [legs, setLegs] = useState<Leg[]>([]);

  function toggleLeg(prediction: Prediction, selection: string, probability: number) {
    const matchLabel = `${prediction.match.homeTeam.name} vs ${prediction.match.awayTeam.name}`;
    setLegs((prev) => {
      const existingIndex = prev.findIndex((l) => l.predictionId === prediction._id);
      if (existingIndex >= 0 && prev[existingIndex].selection === selection) {
        // Clicking the already-selected outcome again removes the leg.
        return prev.filter((_, i) => i !== existingIndex);
      }
      const withoutThisMatch = prev.filter((l) => l.predictionId !== prediction._id);
      return [...withoutThisMatch, { predictionId: prediction._id, matchLabel, selection, probability }];
    });
  }

  const combinedProbability = useMemo(() => {
    if (legs.length === 0) return 0;
    return legs.reduce((acc, leg) => acc * (leg.probability / 100), 1) * 100;
  }, [legs]);

  const combinedOdds = combinedProbability > 0 ? 100 / combinedProbability : 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        {predictions.map((prediction) => {
          const winners = findWinnerMarkets(prediction);
          const selectedLeg = legs.find((l) => l.predictionId === prediction._id);

          return (
            <Card key={prediction._id} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{prediction.match.league.name}</span>
                <span className="font-mono text-[11px] tabular-nums text-muted">
                  {formatKickoff(prediction.match.kickoffAt)}
                </span>
              </div>
              <div className="mb-3 flex items-center gap-2">
                {[prediction.match.homeTeam, prediction.match.awayTeam].map((team) => (
                  <div key={team._id} className="flex items-center gap-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-elevated">
                      {team.logoUrl ? (
                        <Image src={team.logoUrl} alt={team.name} width={14} height={14} className="object-contain" />
                      ) : (
                        <span className="text-[8px] text-muted">{team.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-foreground">{team.name}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {winners.map((w) => (
                  <button
                    key={w.selection}
                    type="button"
                    onClick={() => toggleLeg(prediction, w.selection, w.probability)}
                    className={cn(
                      'rounded-md border px-2 py-2 text-center text-xs font-semibold transition-colors',
                      selectedLeg?.selection === w.selection
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border bg-surface-elevated text-foreground hover:border-primary/40',
                    )}
                  >
                    {w.selection}
                    <div className="mt-0.5 font-mono text-[10px] tabular-nums text-muted">
                      {w.probability.toFixed(0)}%
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="lg:sticky lg:top-24 lg:h-fit">
        <Card>
          <CardContent className="pt-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">Your slip</h2>
            {legs.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Tap an outcome on any match to add it here.</p>
            ) : (
              <>
                <ul className="mt-3 flex flex-col gap-2">
                  {legs.map((leg) => (
                    <li
                      key={leg.predictionId}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">{leg.matchLabel}</div>
                        <div className="text-muted">
                          {leg.selection} · {leg.probability.toFixed(0)}%
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLegs((prev) => prev.filter((l) => l.predictionId !== leg.predictionId))}
                        className="ml-2 flex-shrink-0 text-muted hover:text-danger"
                        aria-label="Remove leg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted">Combined probability</span>
                  <span className="font-mono text-lg font-bold tabular-nums text-primary">
                    {combinedProbability.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted">Fair combined odds</span>
                  <span className="font-mono text-lg font-bold tabular-nums text-foreground">
                    {combinedOdds > 0 ? combinedOdds.toFixed(2) : '—'}
                  </span>
                </div>

                <Button variant="secondary" className="mt-4 w-full" onClick={() => setLegs([])}>
                  Clear slip
                </Button>
              </>
            )}
            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              Combined probability multiplies each independent pick — as legs increase, the true
              chance of hitting every one drops fast. For informational purposes only, not betting
              advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
