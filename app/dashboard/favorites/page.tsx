'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getFavorites, toggleFavoriteTeam, toggleFavoriteLeague } from '@/lib/api/user';

function EntityRow({
  id,
  name,
  logoUrl,
  href,
  onRemove,
}: {
  id: string;
  name: string;
  logoUrl?: string;
  href: string;
  onRemove: (id: string) => void;
}) {
  return (
    <Card className="flex items-center justify-between p-4">
      <Link href={href} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
          {logoUrl ? (
            <Image src={logoUrl} alt={name} width={24} height={24} className="object-contain" />
          ) : (
            <span className="text-xs font-semibold text-muted">{name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <span className="text-sm font-medium text-foreground">{name}</span>
      </Link>
      <button
        type="button"
        aria-label={`Remove ${name} from favorites`}
        onClick={() => onRemove(id)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-elevated hover:text-danger"
      >
        <X className="h-4 w-4" />
      </button>
    </Card>
  );
}

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['favorites'], queryFn: getFavorites });

  const removeTeam = useMutation({
    mutationFn: (id: string) => toggleFavoriteTeam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });
  const removeLeague = useMutation({
    mutationFn: (id: string) => toggleFavoriteLeague(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  return (
    <div>
      <DashboardPageHeader
        title="Favorites"
        subtitle="Teams and leagues you're following. Add more from any team or league page."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Teams</h2>
            <div className="flex flex-col gap-2">
              {data && data.teams.length > 0 ? (
                data.teams.map((team) => (
                  <EntityRow
                    key={team._id}
                    id={team._id}
                    name={team.name}
                    logoUrl={team.logoUrl}
                    href={`/teams/${team.slug}`}
                    onRemove={(id) => removeTeam.mutate(id)}
                  />
                ))
              ) : (
                <p className="text-sm text-muted">No favorite teams yet.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Leagues</h2>
            <div className="flex flex-col gap-2">
              {data && data.leagues.length > 0 ? (
                data.leagues.map((league) => (
                  <EntityRow
                    key={league._id}
                    id={league._id}
                    name={league.name}
                    logoUrl={league.logoUrl}
                    href={`/leagues/${league.slug}`}
                    onRemove={(id) => removeLeague.mutate(id)}
                  />
                ))
              ) : (
                <p className="text-sm text-muted">No favorite leagues yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
