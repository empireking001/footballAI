'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminList } from '@/lib/api/admin';
import { apiClient } from '@/lib/api/client';
import { formatKickoff, formatMatchScore } from '@/lib/utils';
import { Prediction, SiteSettings } from '@/types/api';

function SyncStatusCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'sync-status'],
    queryFn: async () => (await apiClient.get<{ data: SiteSettings }>('/settings')).data.data,
    staleTime: 60 * 1000,
  });

  const timestamp = (value?: string) =>
    value
      ? new Date(value).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
      : 'Not recorded yet';
  const liveAt = data?.dataSync?.liveScoresLastSyncedAt;
  const liveFresh = liveAt ? Date.now() - new Date(liveAt).getTime() < 5 * 60 * 1000 : false;

  return (
    <Card className="mb-5 border-border bg-surface/50">
      <CardContent className="pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-bold uppercase tracking-tight">Live-data health</h2>
            <p className="mt-1 text-sm text-muted">Fixtures, scores, standings, and odds sync independently from manual picks.</p>
          </div>
          <Badge variant={liveFresh ? 'live' : 'risk-high'}>{liveFresh ? 'Live sync healthy' : 'Live sync needs attention'}</Badge>
        </div>
        <div className="mt-4 grid gap-3 text-xs text-muted sm:grid-cols-3">
          <div><span className="font-semibold text-foreground">Live scores</span><br />{isLoading ? 'Loading…' : timestamp(liveAt)}</div>
          <div><span className="font-semibold text-foreground">Fixtures</span><br />{isLoading ? 'Loading…' : timestamp(data?.dataSync?.fixturesLastSyncedAt)}</div>
          <div><span className="font-semibold text-foreground">Standings</span><br />{isLoading ? 'Loading…' : timestamp(data?.dataSync?.standingsLastSyncedAt)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPredictionsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'manual-predictions', page],
    queryFn: () => adminList<Prediction>('predictions', { page, limit: 20 }),
  });

  const columns: Column<Prediction>[] = [
    {
      key: 'match',
      label: 'Fixture',
      render: (prediction) => {
        const score = formatMatchScore(prediction.match.score);
        return (
          <div>
            <Link href={`/admin/matches/${prediction.match._id}`} className="font-semibold text-foreground hover:text-primary">
              {prediction.match.homeTeam.name} vs {prediction.match.awayTeam.name}
            </Link>
            <p className="mt-1 text-xs text-muted">{prediction.match.league.name} · {formatKickoff(prediction.match.kickoffAt)}</p>
            {score && <p className="mt-1 font-mono text-xs font-semibold text-primary">Score {score}</p>}
          </div>
        );
      },
    },
    {
      key: 'markets',
      label: 'Entered markets',
      render: (prediction) => (
        <div className="max-w-[18rem] text-xs text-foreground">
          {prediction.markets.length > 0
            ? prediction.markets.map((market) => `${market.market}: ${market.selection}`).join(' · ')
            : 'No market entered'}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (prediction) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={prediction.tier === 'vip' ? 'vip' : 'default'}>{prediction.tier === 'vip' ? 'VIP' : 'Free'}</Badge>
          <Badge variant={prediction.isFeatured ? 'live' : 'default'}>{prediction.isFeatured ? 'Featured' : 'Standard'}</Badge>
        </div>
      ),
    },
    {
      key: 'edit',
      label: 'Action',
      render: (prediction) => (
        <Button size="sm" asChild>
          <Link href={`/admin/matches/${prediction.match._id}`}>Open editor</Link>
        </Button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Manual picks"
        subtitle="Use the fixture editor as the single place to enter scores, markets, notes, tiers, and featured picks."
      />
      <SyncStatusCard />
      <Card className="mb-5 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 pt-5 text-sm leading-6 text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl">Open an upcoming fixture to save its score separately, add structured market presets, preview the public presentation, and publish the manual pick.</p>
          <Button asChild className="w-fit"><Link href="/admin/matches">Browse upcoming matches</Link></Button>
        </CardContent>
      </Card>
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(prediction) => prediction._id}
        isLoading={isLoading}
        page={data?.meta.page}
        totalPages={data?.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
