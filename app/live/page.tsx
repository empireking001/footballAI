'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { LiveMatchCard } from '@/components/matches/LiveMatchCard';
import { apiClient } from '@/lib/api/client';
import { Match } from '@/types/api';

export default function LiveMatchesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Match[] }>('/matches', {
        params: { status: 'live', limit: 50 },
      });
      return data.data;
    },
    refetchInterval: 30_000, // live scores are synced server-side every 2 minutes; this just keeps the page fresh
  });

  const matches = data ?? [];

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-danger">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
            Live
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Live Matches
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Scores update automatically as matches progress.
          </p>
        </Container>
      </div>

      <Container className="py-10 sm:py-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <LiveMatchCard key={match._id} match={match} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted">
            No matches live right now — check today&apos;s fixtures for upcoming kickoffs.
          </div>
        )}
      </Container>
    </>
  );
}
