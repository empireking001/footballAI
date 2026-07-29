'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { TeamCard } from '@/components/teams/TeamCard';
import { apiClient } from '@/lib/api/client';
import { Team } from '@/types/api';

export function TeamSearch({ initialTeams }: { initialTeams: Team[] }) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ['teams', 'search', debounced],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Team[] }>('/teams', {
        params: { q: debounced, limit: 30 },
      });
      return data.data;
    },
    enabled: debounced.length > 0,
  });

  const teams = debounced.length > 0 ? data ?? [] : initialTeams;

  return (
    <div>
      <div className="relative mb-8 max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search teams…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 w-full rounded-md border border-border bg-surface-elevated pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus-visible:outline-none"
        />
        {isFetching && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />
        )}
      </div>

      {teams.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted">
          {debounced ? `No teams found for "${debounced}".` : 'No teams available yet.'}
        </div>
      )}
    </div>
  );
}
