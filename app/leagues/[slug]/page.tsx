import Image from 'next/image';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PredictionsGrid } from '@/components/predictions/PredictionsGrid';
import { FavoriteButton } from "@/components/dashboard/FavoriteButton";
import { StandingsTable } from "@/components/leagues/StandingsTable";
import { fetchApi } from "@/lib/api/server";
import { League, Prediction, Standing } from "@/types/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await fetchApi<League>(`/leagues/${slug}`, { revalidate: 3600 });
  if (!data) return { title: 'League' };
  return {
    title: `${data.name} Predictions`,
    description: `Administrator-entered picks and fixture details for every ${data.name} match.`,
  };
}

export default async function LeagueDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: league } = await fetchApi<League>(`/leagues/${slug}`, { revalidate: 3600 });

  if (!league) {
    return (
      <Container className="py-24 text-center text-sm text-muted">League not found.</Container>
    );
  }

  const { data: predictions } = await fetchApi<Prediction[]>(
    `/predictions?league=${league._id}&limit=12`,
    { revalidate: 300 },
  );

  const { data: standings } = await fetchApi<Standing[]>(
    `/leagues/${slug}/standings`,
    { revalidate: 900 },
  );

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-surface-elevated">
              {league.logoUrl ? (
                <Image
                  src={league.logoUrl}
                  alt={league.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="font-display text-xl text-muted">
                  {league.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                {league.name}
              </h1>
              <p className="mt-1 text-sm text-muted">{league.country}</p>
            </div>
          </div>
          <FavoriteButton id={league._id} type="league" />
        </Container>
      </div>

      {standings && standings.length > 0 && (
        <Container className="py-10 sm:py-12">
          <h2 className="mb-6 font-display text-xl font-bold uppercase tracking-tight">
            League table
          </h2>
          <StandingsTable standings={standings} />
        </Container>
      )}

      <Container className="py-10 sm:py-12">
        <h2 className="mb-6 font-display text-xl font-bold uppercase tracking-tight">
          Upcoming manual picks
        </h2>
        <PredictionsGrid
          predictions={predictions ?? []}
          emptyMessage="No manual picks for this league yet — check back closer to kickoff."
        />
      </Container>
    </>
  );
}
