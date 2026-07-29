'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookmarkX, Loader2 } from 'lucide-react';
import { PredictionCard } from '@/components/predictions/PredictionCard';
import { getSavedPredictions, toggleSavedPrediction } from '@/lib/api/user';
import { Prediction } from '@/types/api';

export function SavedPredictionsList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-predictions'],
    queryFn: () => getSavedPredictions(1, 50),
  });

  const unsaveMutation = useMutation({
    mutationFn: (predictionId: string) => toggleSavedPrediction(predictionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-predictions'] }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  const predictions = (data?.data ?? []) as Prediction[];

  if (predictions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted">
        You haven&apos;t saved any predictions yet — bookmark one from any prediction card.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {predictions.map((prediction) => (
        <div key={prediction._id} className="relative">
          <button
            type="button"
            aria-label="Remove from saved"
            onClick={() => unsaveMutation.mutate(prediction._id)}
            disabled={unsaveMutation.isPending}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-danger backdrop-blur transition-colors hover:bg-danger/15"
          >
            <BookmarkX className="h-4 w-4" />
          </button>
          <PredictionCard prediction={prediction} showSaveButton={false} />
        </div>
      ))}
    </div>
  );
}
