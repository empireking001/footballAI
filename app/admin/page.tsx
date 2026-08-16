"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowRight, CalendarDays, Database, Radio, Sparkles, UsersRound } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api/client';
import { adminList } from '@/lib/api/admin';
import { Match, Prediction } from '@/types/api';

interface Stats { leaguesCovered: number; teamsTracked: number; matchesAnalyzed: number; predictionsGenerated: number; }
interface Health { success: boolean; status: string; services: { database: string; redis: string }; uptimeSeconds: number; }

export default function AdminOverviewPage() {
  const stats = useQuery({ queryKey: ['admin', 'stats'], queryFn: async () => (await apiClient.get<{ data: Stats }>('/stats')).data.data });
  const health = useQuery({ queryKey: ['admin', 'health'], queryFn: async () => (await apiClient.get<{ data: Health }>('/health')).data.data, refetchInterval: 30000 });
  const matches = useQuery({ queryKey: ['admin', 'upcoming-matches'], queryFn: () => apiClient.get<{ data: Match[]; meta: { total: number } }>('/matches?when=week&limit=1').then((response) => response.data) });
  const predictions = useQuery({ queryKey: ['admin', 'featured-preview'], queryFn: () => adminList<Prediction>('predictions/featured', { limit: 1 }) });

  const cards = [
    { label: 'Database', value: health.data?.services.database ?? 'Checking', icon: <Database className="h-4 w-4" />, variant: health.data?.services.database === 'connected' ? 'live' : 'default' },
    { label: 'Upcoming fixtures', value: matches.data?.meta?.total ?? '—', icon: <CalendarDays className="h-4 w-4" />, variant: 'default' },
    { label: 'Predictions generated', value: stats.data?.predictionsGenerated ?? '—', icon: <Sparkles className="h-4 w-4" />, variant: stats.data?.predictionsGenerated ? 'live' : 'risk-high' },
    { label: 'Live score service', value: health.data?.status === 'ok' ? 'Online' : 'Checking', icon: <Radio className="h-4 w-4" />, variant: health.data?.status === 'ok' ? 'live' : 'default' },
  ] as const;

  return (
    <div>
      <AdminPageHeader title="Operations centre" subtitle="See whether data is flowing, recover missing predictions, and curate the public feed." />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((card) => <Card key={card.label}><CardContent className="p-5"><div className="flex items-center gap-2 text-primary">{card.icon}<span className="text-[10px] font-bold uppercase tracking-widest text-muted">{card.label}</span></div><div className="mt-3 font-mono text-2xl font-bold capitalize text-foreground">{card.value}</div></CardContent></Card>)}
      </div>
      <Card className="mt-6 border-primary/25 bg-primary/[0.04]"><CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-bold uppercase tracking-tight">Prediction backlog</h2></div><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{matches.data?.meta?.total ?? 'Upcoming'} fixtures are available across the next seven days. The prediction counter is {stats.data?.predictionsGenerated ?? 'still loading'}; use recovery if the count is zero.</p></div><Link href="/admin/predictions" className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Open prediction operations <ArrowRight className="h-4 w-4" /></Link></CardContent></Card>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <QuickLink href="/admin/predictions" icon={<Sparkles className="h-5 w-5" />} title="Curate predictions" body="Feature picks, switch Free/VIP, and edit explanations." />
        <QuickLink href="/admin/users" icon={<UsersRound className="h-5 w-5" />} title="Test user tiers" body="Switch a test account between Free and VIP / Pro." />
        <QuickLink href="/admin/matches" icon={<CalendarDays className="h-5 w-5" />} title="Verify fixtures" body="Check that the upcoming match pipeline is populated." />
      </div>
      {predictions.isError ? <p className="mt-4 text-xs text-danger">Featured prediction health is unavailable. Check your admin session or backend logs.</p> : null}
    </div>
  );
}

function QuickLink({ href, icon, title, body }: { href: string; icon: React.ReactNode; title: string; body: string }) {
  return <Link href={href} className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/50"><div className="text-primary">{icon}</div><h3 className="mt-4 text-sm font-bold text-foreground group-hover:text-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-muted">{body}</p><Badge variant="default" className="mt-4">Open <ArrowRight className="ml-1 inline h-3 w-3" /></Badge></Link>;
}
