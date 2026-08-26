import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock3, LockKeyhole, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PredictionCard } from '@/components/predictions/PredictionCard';
import { FixtureFeedItem } from '@/types/api';
import { formatKickoff, formatMatchScore } from '@/lib/utils';

function Crest({ name, logoUrl }: { name: string; logoUrl?: string }) {
  return logoUrl ? <Image src={logoUrl} alt="" width={32} height={32} className="h-8 w-8 object-contain" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-[10px] font-semibold text-muted">{name.slice(0, 2).toUpperCase()}</span>;
}

function AwaitingPredictionCard({ item }: { item: FixtureFeedItem }) {
  const { match, state } = item;
  const isLive = state === 'live';
  const currentScore = formatMatchScore(match.score);
  return <Link href={`/matches/${match._id}`} className="block"><Card className="h-full border-border/80 bg-surface/70 transition-colors hover:border-primary/50"><CardHeader className="flex flex-row items-center justify-between pb-3"><span className="max-w-[65%] truncate text-xs font-medium text-muted">{match.league.name}</span><Badge variant={isLive ? 'live' : 'default'}>{isLive ? <><Radio className="mr-1 h-3 w-3" />Live</> : <><Clock3 className="mr-1 h-3 w-3" />Scheduled</>}</Badge></CardHeader><CardContent><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 flex-1 items-center gap-2"><Crest name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} /><span className="truncate text-sm font-semibold text-foreground">{match.homeTeam.name}</span></div><span className={`font-display text-xs ${currentScore ? 'text-primary' : 'text-muted'}`}>{currentScore ?? 'VS'}</span><div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right"><span className="truncate text-sm font-semibold text-foreground">{match.awayTeam.name}</span><Crest name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} /></div></div><div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted"><span>{isLive ? 'Score updates automatically' : formatKickoff(match.kickoffAt)}</span><span className="text-muted">Prediction pending</span></div><p className="mt-3 text-xs leading-5 text-muted">The fixture is available. A manual prediction has not been entered yet.</p></CardContent></Card></Link>;
}

function LockedFixtureCard({ item }: { item: FixtureFeedItem }) {
  if (!item.prediction) return <AwaitingPredictionCard item={item} />;
  return <Link href={`/matches/${item.match._id}`} className="block"><Card className="h-full border-primary/30 bg-primary/[0.04] transition-colors hover:border-primary/60"><CardHeader className="flex flex-row items-center justify-between pb-3"><span className="truncate text-xs font-medium text-muted">{item.match.league.name}</span><Badge variant="vip"><LockKeyhole className="mr-1 h-3 w-3" />VIP</Badge></CardHeader><CardContent><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-semibold text-foreground">{item.match.homeTeam.name}</span><span className={`font-display text-xs ${formatMatchScore(item.match.score) ? 'text-primary' : 'text-muted'}`}>{formatMatchScore(item.match.score) ?? 'VS'}</span><span className="truncate text-right text-sm font-semibold text-foreground">{item.match.awayTeam.name}</span></div><div className="mt-5 rounded-md border border-dashed border-primary/30 bg-surface/70 p-4 text-center"><LockKeyhole className="mx-auto h-5 w-5 text-primary" /><p className="mt-2 text-sm font-semibold text-foreground">VIP prediction locked</p><p className="mt-1 text-xs leading-5 text-muted">Upgrade to view this manually entered pick.</p></div></CardContent></Card></Link>;
}

export function FixtureFeed({ items, emptyMessage = 'No fixtures found for this date.' }: { items: FixtureFeedItem[]; emptyMessage?: string }) {
  if (items.length === 0) return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted">{emptyMessage}</div>;
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => item.isVipLocked ? <LockedFixtureCard key={item.match._id} item={item} /> : item.prediction ? <PredictionCard key={item.match._id} prediction={item.prediction} /> : <AwaitingPredictionCard key={item.match._id} item={item} />)}</div>;
}

export function DateNav({ active }: { active: 'today' | 'tomorrow' | 'week' }) {
  const links = [{ key: 'today', label: 'Today', href: '/predictions/today' }, { key: 'tomorrow', label: 'Tomorrow', href: '/predictions/tomorrow' }, { key: 'week', label: 'Next 7 days', href: '/predictions/week' }] as const;
  return <div className="mb-8 flex flex-wrap gap-2">{links.map((link) => <Link key={link.key} href={link.href} className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${active === link.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted hover:border-primary/50 hover:text-foreground'}`}>{link.label}<ArrowRight className="ml-1 inline h-3 w-3" /></Link>)}</div>;
}
