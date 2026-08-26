import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { LeagueCard } from '@/components/leagues/LeagueCard';
import { fetchApi } from '@/lib/api/server';
import { League } from '@/types/api';
import { AdBanner } from '@/components/ads/AdBanner';

export const metadata: Metadata = {
  title: 'Leagues',
  description: 'Browse every league and competition covered by Football AI manual picks.',
};

export default async function LeaguesPage() {
  const { data } = await fetchApi<League[]>('/leagues?limit=100', { revalidate: 3600 });
  const leagues = data ?? [];

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <span className="font-mono text-xs uppercase tracking-widest text-primary">Explore</span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Leagues &amp; Competitions
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Every league we cover, with fixtures and administrator-entered picks organized by kickoff date.
          </p>
        </Container>
      </div>

      <Container className="py-10 sm:py-12">
        <AdBanner slotId="leagues-top" className="mb-8" />
        {leagues.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {leagues.map((league) => (
              <LeagueCard key={league._id} league={league} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted">
            No leagues are configured yet.
          </div>
        )}
      </Container>
    </>
  );
}
