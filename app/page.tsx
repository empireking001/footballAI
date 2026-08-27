import Link from 'next/link';
import { ArrowRight, CalendarDays, Radio, Trophy, PenLine } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FixtureFeed } from '@/components/predictions/FixtureFeed';
import { RecentResults } from '@/components/predictions/RecentResults';
import { fetchApi, getSiteName } from '@/lib/api/server';
import { FixtureFeedItem } from '@/types/api';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return {
    title: `${siteName} | Manual football picks and live fixtures`,
    description: 'Browse upcoming football fixtures and administrator-entered football predictions across the next seven days.',
  };
}

export default async function HomePage() {
  const siteName = await getSiteName();
  const [{ data: feed }, { data: stats }] = await Promise.all([
    fetchApi<FixtureFeedItem[]>('/predictions/feed?when=week&limit=9', { cache: 'no-store' }),
    fetchApi<{ leaguesCovered: number }>('/stats', { revalidate: 900, tags: ['stats'] }),
  ]);
  const items = feed ?? [];
  const available = items.filter((item) => item.prediction).length;
  const pending = items.filter((item) => !item.prediction).length;

  return (
    <>
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_right,_rgba(159,255,0,0.12),_transparent_38%),linear-gradient(135deg,_#0b1020,_#111827)] py-16 sm:py-24">
        <Container>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><PenLine className="h-3.5 w-3.5" /> Manual match centre</div>
            <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground sm:text-7xl">Know what is next before kickoff.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">Browse upcoming fixtures, live scores, team context, and clear predictions entered and managed by the <strong className="text-foreground">{siteName}</strong>. Every fixture stays visible while you plan your selections.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/predictions/today" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">Explore today <ArrowRight className="h-4 w-4" /></Link><Link href="/predictions/week" className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50">Browse the week</Link></div>
          </div>
        </Container>
      </section>

      <Container className="relative -mt-8"><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard label="Fixtures in view" value={items.length} icon={<CalendarDays className="h-4 w-4" />} /><StatCard label="Manual picks" value={available} icon={<PenLine className="h-4 w-4" />} /><StatCard label="Awaiting pick" value={pending} icon={<CalendarDays className="h-4 w-4" />} /><StatCard label="Leagues covered" value={stats?.leaguesCovered ?? '—'} icon={<Trophy className="h-4 w-4" />} /></div></Container>

      <section className="py-14 sm:py-18"><Container><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">The fixture board</span><h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Upcoming matches</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted">See the fixture, kickoff time, live status, and manual prediction availability in one place.</p></div><div className="flex gap-2"><Link href="/predictions/tomorrow" className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:border-primary/50 hover:text-foreground">Tomorrow</Link><Link href="/live" className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:border-primary/50 hover:text-foreground"><Radio className="h-3 w-3" /> Live</Link></div></div><FixtureFeed items={items} emptyMessage="Fixtures are syncing. Please check back shortly." /></Container></section>

      <RecentResults days={7} />

      <section className="border-y border-border bg-surface/40 py-14 sm:py-18"><Container><div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"><Card className="overflow-hidden border-primary/25 bg-[linear-gradient(135deg,_rgba(159,255,0,0.13),_rgba(20,24,37,0.75))]"><CardContent className="p-7 sm:p-9"><Badge variant="vip">VIP picks</Badge><h2 className="mt-4 max-w-xl font-display text-3xl font-bold uppercase tracking-tight">Get the picks your way.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Unlock manually entered VIP selections, confidence, risk notes, supporting form, standings, and market details for selected fixtures.</p><Link href="/pricing" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Compare VIP plans <ArrowRight className="h-4 w-4" /></Link></CardContent></Card><Card><CardContent className="p-7 sm:p-9"><span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">How it works</span><div className="mt-5 space-y-5"><Step number="01" title="Select a date" body="Today, tomorrow, or the next seven days." /><Step number="02" title="Open a fixture" body="Read the administrator-entered pick and supporting context." /><Step number="03" title="Choose your access" body="Free and VIP picks are clearly labelled before you open them." /></div></CardContent></Card></div></Container></section>
    </>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) { return <Card className="border-border/80 bg-surface/95 shadow-xl shadow-black/10"><CardContent className="p-4 sm:p-5"><div className="flex items-center gap-2 text-primary">{icon}<span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span></div><div className="mt-2 font-mono text-2xl font-bold tabular-nums text-foreground">{value}</div></CardContent></Card>; }
function Step({ number, title, body }: { number: string; title: string; body: string }) { return <div className="flex gap-3"><span className="font-mono text-xs text-primary">{number}</span><div><p className="text-sm font-semibold text-foreground">{title}</p><p className="mt-1 text-xs leading-5 text-muted">{body}</p></div></div>; }
