import Image from 'next/image';
import Link from 'next/link';
import { Clock3, LockKeyhole } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MatchBreakdown } from '@/components/predictions/MatchBreakdown';
import { fetchApi } from '@/lib/api/server';
import { Match, Prediction } from '@/types/api';
import { formatKickoff, formatMatchScore } from '@/lib/utils';
import { AdBanner } from '@/components/ads/AdBanner';
import type { Metadata } from 'next';

interface PageProps { params: Promise<{ id: string }> }

async function getPrediction(matchId: string) {
  return fetchApi<Prediction>(`/predictions/match/${matchId}`, { cache: 'no-store' });
}

async function getMatch(matchId: string) {
  return fetchApi<Match>(`/matches/${matchId}`, { cache: 'no-store' });
}

function FixtureHeader({ match, badge }: { match: Match; badge: string }) {
  const currentScore = formatMatchScore(match.score);
  return (
    <div className="border-b border-border bg-surface/50 py-12 sm:py-16">
      <Container>
        <AdBanner slotId="match-top" className="mb-6" />
        <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted">{match.league.name} · {formatKickoff(match.kickoffAt)}</span><Badge variant="default"><Clock3 className="mr-1 h-3 w-3" />{badge}</Badge></div>
        <div className="mx-auto mt-10 flex max-w-2xl items-center justify-between gap-6 text-center"><div className="flex-1"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated p-3 text-sm font-bold text-muted">{match.homeTeam.logoUrl ? <Image src={match.homeTeam.logoUrl} alt="" width={64} height={64} className="h-full w-full object-contain" /> : match.homeTeam.name.slice(0, 2).toUpperCase()}</div><p className="mt-3 text-sm font-semibold text-foreground">{match.homeTeam.name}</p></div><div className="flex flex-col items-center gap-1"><span className={`font-display text-2xl font-bold tabular-nums ${currentScore ? 'text-primary' : 'text-muted'}`}>{currentScore ?? 'VS'}</span>{currentScore && <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Match score</span>}</div><div className="flex-1"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated p-3 text-sm font-bold text-muted">{match.awayTeam.logoUrl ? <Image src={match.awayTeam.logoUrl} alt="" width={64} height={64} className="h-full w-full object-contain" /> : match.awayTeam.name.slice(0, 2).toUpperCase()}</div><p className="mt-3 text-sm font-semibold text-foreground">{match.awayTeam.name}</p></div></div>
      </Container>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const [{ data: prediction }, { data: match }] = await Promise.all([getPrediction(id), getMatch(id)]);
  const subject = prediction?.match ?? match;
  if (!subject) return { title: 'Match centre' };
  return { title: `${subject.homeTeam.name} vs ${subject.awayTeam.name} | Football AI`, description: `Manual prediction and match details for ${subject.homeTeam.name} vs ${subject.awayTeam.name}.` };
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [{ data, status }, { data: match }] = await Promise.all([getPrediction(id), getMatch(id)]);
  if (data) return <MatchBreakdown prediction={data} />;
  if (!match) return <Container className="flex flex-col items-center gap-4 py-24 text-center"><h1 className="font-display text-2xl font-bold uppercase tracking-tight">Match not found</h1><p className="max-w-sm text-sm text-muted">This fixture is no longer available in the current feed.</p><Button variant="secondary" asChild><Link href="/predictions/week">Browse the week</Link></Button></Container>;

  if (status === 403) return <><FixtureHeader match={match} badge="VIP prediction" /><Container className="py-10 sm:py-12"><Card className="mx-auto max-w-2xl border-primary/25 bg-primary/[0.04]"><CardContent className="p-7 text-center sm:p-10"><LockKeyhole className="mx-auto h-7 w-7 text-primary" /><h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight">VIP prediction locked</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">This manually entered prediction is reserved for VIP members. Upgrade your account to view the pick and supporting notes.</p><div className="mt-6 flex justify-center"><Button asChild><Link href="/pricing">View VIP access</Link></Button></div></CardContent></Card></Container></>;

  return <><FixtureHeader match={match} badge="Prediction not entered" /><Container className="py-10 sm:py-12"><Card className="mx-auto max-w-2xl border-border bg-surface/70"><CardContent className="p-7 text-center sm:p-10"><h1 className="font-display text-2xl font-bold uppercase tracking-tight">No manual prediction yet</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">The administrator has not entered a prediction for this fixture yet. The fixture, kickoff time, and live status will continue to update normally.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild><Link href="/predictions/today">Today’s fixtures</Link></Button><Button variant="secondary" asChild><Link href="/predictions/week">Next 7 days</Link></Button></div></CardContent></Card></Container></>;
}
