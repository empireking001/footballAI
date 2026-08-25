import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, ChevronRight, Radio, Sparkles, Trophy } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FixtureFeed } from '@/components/predictions/FixtureFeed';
import { fetchApi } from '@/lib/api/server';
import { FixtureFeedItem } from '@/types/api';

export const metadata: Metadata = {
  title: 'Football AI | Upcoming fixtures and AI match analysis',
  description: 'Browse upcoming football fixtures, live matches, and transparent AI analysis across the next seven days.',
};

export default async function HomePage() {
  const [{ data: feed }, { data: stats }] = await Promise.all([
    fetchApi<FixtureFeedItem[]>('/predictions/feed?when=week&limit=9', { cache: 'no-store' }),
    fetchApi<{ leaguesCovered: number; teamsTracked: number; matchesAnalyzed: number; predictionsGenerated: number }>('/stats', { revalidate: 900, tags: ['stats'] }),
  ]);
  const items = feed ?? [];
  const available = items.filter((item) => item.prediction).length;
  const pending = items.filter((item) => !item.prediction).length;

  return (
    <>
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_right,_rgba(159,255,0,0.12),_transparent_38%),linear-gradient(135deg,_#0b1020,_#111827)] py-16 sm:py-24">
        <Container>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Football intelligence
            </div>
            <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground sm:text-7xl">
              Know what is next before kickoff.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              A fixture-first match centre combining statistical modelling, team context, form, standings, and transparent AI explanations. Every upcoming match stays visible while analysis is prepared.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/predictions/today" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
                Explore today <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/predictions/week" className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50">
                Browse the week
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container className="relative -mt-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Fixtures in view" value={items.length} icon={<CalendarDays className="h-4 w-4" />} />
          <StatCard label="AI-ready" value={available} icon={<Sparkles className="h-4 w-4" />} />
          <StatCard label="Analysis pending" value={pending} icon={<ChevronRight className="h-4 w-4" />} />
          <StatCard label="Leagues covered" value={stats?.leaguesCovered ?? '—'} icon={<Trophy className="h-4 w-4" />} />
        </div>
      </Container>

      <section className="py-14 sm:py-18">
        <Container>
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">The fixture board</span>
              <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Upcoming matches</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">No more blank pages. See the fixture, kickoff time, and analysis status in one place.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/predictions/tomorrow" className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:border-primary/50 hover:text-foreground">Tomorrow</Link>
              <Link href="/live" className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:border-primary/50 hover:text-foreground"><Radio className="h-3 w-3" /> Live</Link>
            </div>
          </div>
          <FixtureFeed items={items} emptyMessage="Fixtures are syncing. Please check back shortly." />
        </Container>
      </section>

      <section className="border-y border-border bg-surface/40 py-14 sm:py-18">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="overflow-hidden border-primary/25 bg-[linear-gradient(135deg,_rgba(159,255,0,0.13),_rgba(20,24,37,0.75))]">
              <CardContent className="p-7 sm:p-9">
                <Badge variant="vip">VIP analysis</Badge>
                <h2 className="mt-4 max-w-xl font-display text-3xl font-bold uppercase tracking-tight">See the reasoning, not just the pick.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Unlock the full AI explanation, key factors, model confidence, risk notes, standings, recent form, head-to-head context, and market comparison.</p>
                <Link href="/pricing" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Compare VIP plans <ArrowRight className="h-4 w-4" /></Link>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-7 sm:p-9">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">How it works</span>
                <div className="mt-5 space-y-5">
                  <Step number="01" title="Select a date" body="Today, tomorrow, or the next seven days." />
                  <Step number="02" title="Open a fixture" body="Read the model’s confidence and supporting context." />
                  <Step number="03" title="Ask better questions" body="Use VIP analysis to understand the risks and signals." />
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <Card className="border-border/80 bg-surface/95 shadow-xl shadow-black/10">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2 text-primary">{icon}<span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span></div>
        <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="font-mono text-xs text-primary">{number}</span>
      <div><p className="text-sm font-semibold text-foreground">{title}</p><p className="mt-1 text-xs leading-5 text-muted">{body}</p></div>
    </div>
  );
}
