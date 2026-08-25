import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MatchBreakdown } from '@/components/predictions/MatchBreakdown';
import { VipLockedMatch } from '@/components/predictions/VipLockedMatch';
import { fetchApi } from '@/lib/api/server';
import { Match, Prediction, SiteSettings } from '@/types/api';
import { formatKickoff } from '@/lib/utils';
import { AdBanner } from '@/components/ads/AdBanner';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPrediction(matchId: string) {
  return fetchApi<Prediction>(`/predictions/match/${matchId}`, { cache: 'no-store' });
}

async function getMatch(matchId: string) {
  return fetchApi<Match>(`/matches/${matchId}`, { cache: 'no-store' });
}

async function getPublicSettings() {
  return fetchApi<SiteSettings>('/settings', { cache: 'no-store' });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const [{ data: prediction }, { data: match }] = await Promise.all([getPrediction(id), getMatch(id)]);
  const subject = prediction?.match ?? match;
  if (!subject) return { title: 'Match centre' };
  return {
    title: `${subject.homeTeam.name} vs ${subject.awayTeam.name} | Football AI`,
    description: prediction ? `AI prediction and match context for ${subject.homeTeam.name} vs ${subject.awayTeam.name}.` : `Upcoming fixture centre for ${subject.homeTeam.name} vs ${subject.awayTeam.name}.`,
  };
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [{ data, status, error }, { data: settings }] = await Promise.all([getPrediction(id), getPublicSettings()]);

  if (status === 403) return <VipLockedMatch matchId={id} unavailableReason={error?.includes('disabled') ? 'disabled' : error?.includes('audience') ? 'audience' : 'vip'} />;
  if (data) return <MatchBreakdown prediction={data} aiSettings={settings?.ai} />;

  const { data: match } = await getMatch(id);
  if (!match) {
    return <Container className="flex flex-col items-center gap-4 py-24 text-center"><h1 className="font-display text-2xl font-bold uppercase tracking-tight">Match not found</h1><p className="max-w-sm text-sm text-muted">This fixture is no longer available in the current feed.</p><Button variant="secondary" asChild><Link href="/predictions/week">Browse the week</Link></Button></Container>;
  }

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-12 sm:py-16">
        <Container>
          <AdBanner slotId="match-top" className="mb-6" />
          <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted">{match.league.name} · {formatKickoff(match.kickoffAt)}</span><Badge variant="default"><Clock3 className="mr-1 h-3 w-3" />Analysis pending</Badge></div>
          <div className="mx-auto mt-10 flex max-w-2xl items-center justify-between gap-6 text-center"><div className="flex-1"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated p-3 text-sm font-bold text-muted">{match.homeTeam.logoUrl ? <Image src={match.homeTeam.logoUrl} alt="" width={64} height={64} className="h-full w-full object-contain" /> : match.homeTeam.name.slice(0, 2).toUpperCase()}</div><p className="mt-3 text-sm font-semibold text-foreground">{match.homeTeam.name}</p></div><span className="font-display text-xl text-muted">VS</span><div className="flex-1"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated p-3 text-sm font-bold text-muted">{match.awayTeam.logoUrl ? <Image src={match.awayTeam.logoUrl} alt="" width={64} height={64} className="h-full w-full object-contain" /> : match.awayTeam.name.slice(0, 2).toUpperCase()}</div><p className="mt-3 text-sm font-semibold text-foreground">{match.awayTeam.name}</p></div></div>
        </Container>
      </div>
      <Container className="py-10 sm:py-12">
        <Card className="mx-auto max-w-2xl border-primary/25 bg-primary/[0.04]"><CardContent className="p-7 text-center sm:p-10"><Sparkles className="mx-auto h-7 w-7 text-primary" /><h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight">Football AI is preparing this match</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">The fixture is confirmed. The statistical model will publish its prediction and supporting explanation automatically. Check back before kickoff.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild><Link href="/predictions/today">Today’s fixtures</Link></Button><Button variant="secondary" asChild><Link href="/predictions/week">Next 7 days</Link></Button></div></CardContent></Card>
      </Container>
    </>
  );
}
