import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { TeamSearch } from '@/components/teams/TeamSearch';
import { fetchApi } from '@/lib/api/server';
import { Team } from '@/types/api';

export const metadata: Metadata = {
  title: 'Teams',
  description: 'Search and browse every team covered by Football AI manual picks.',
};

export default async function TeamsPage() {
  const { data } = await fetchApi<Team[]>('/teams?limit=30', { revalidate: 3600 });

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <span className="font-mono text-xs uppercase tracking-widest text-primary">Explore</span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Teams
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Search for any team to see their upcoming fixtures and administrator-entered picks.
          </p>
        </Container>
      </div>

      <Container className="py-10 sm:py-12">
        <TeamSearch initialTeams={data ?? []} />
      </Container>
    </>
  );
}
