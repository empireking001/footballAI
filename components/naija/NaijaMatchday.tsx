'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, MapPin, Share2, Sparkles, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';

const CLUBS = [
  { name: 'Enyimba', city: 'Aba', state: 'Abia', colors: 'blue / white', short: 'ENY' },
  { name: 'Rangers International', city: 'Enugu', state: 'Enugu', colors: 'green / white', short: 'RAN' },
  { name: 'Shooting Stars', city: 'Ibadan', state: 'Oyo', colors: 'blue / white', short: '3SC' },
  { name: 'Kano Pillars', city: 'Kano', state: 'Kano', colors: 'yellow / green', short: 'KAN' },
  { name: 'Rivers United', city: 'Port Harcourt', state: 'Rivers', colors: 'blue / white', short: 'RIV' },
  { name: 'Sporting Lagos', city: 'Lagos', state: 'Lagos', colors: 'pink / navy', short: 'SPL' },
  { name: 'Remo Stars', city: 'Ikenne', state: 'Ogun', colors: 'blue / white', short: 'REM' },
  { name: 'Plateau United', city: 'Jos', state: 'Plateau', colors: 'blue / white', short: 'PLU' },
];

const MATCH = { home: 'Shooting Stars', away: 'Rangers International', kickoff: 'Today · 4:00 PM', venue: 'Lekan Salami Stadium, Ibadan' };

type Call = 'home' | 'draw' | 'away';

export function NaijaMatchday() {
  const [club, setClub] = useState(CLUBS[2]);
  const [call, setCall] = useState<Call | null>(null);
  const [copied, setCopied] = useState(false);
  const [votes, setVotes] = useState({ home: 58, draw: 19, away: 23 });

  const totalVotes = votes.home + votes.draw + votes.away;
  const shareText = useMemo(
    () => `My Naija Matchday call: ${club.name} are my club. ${MATCH.home} vs ${MATCH.away} — I’m backing ${call === 'home' ? MATCH.home : call === 'away' ? MATCH.away : 'a draw'} on LegendEmpire.`,
    [call, club.name],
  );

  function makeCall(nextCall: Call) {
    if (call === nextCall) return;
    setCall(nextCall);
    setVotes((current) => ({ ...current, [nextCall]: current[nextCall] + 1 }));
  }

  const ShareIcon = copied ? Check : Share2;

  async function shareCall() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: 'My Naija Matchday call', text: shareText, url: window.location.href });
      return;
    }
    await navigator.clipboard?.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <>
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_right,_rgba(159,255,0,0.16),_transparent_38%),linear-gradient(135deg,_#0b1020,_#111827)] py-14 sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Sparkles className="h-3.5 w-3.5" /> LegendEmpire presents</div>
            <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground sm:text-7xl">Naija Matchday.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">Local football, your voice. Pick your club, make the call, and see what Nigerian fans are feeling before kickoff.</p>
            <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-muted"><span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-2"><Trophy className="h-3.5 w-3.5 text-primary" /> NPFL fan pulse</span><span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-2"><Share2 className="h-3.5 w-3.5 text-primary" /> Made to share</span></div>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden border-primary/25 bg-[linear-gradient(145deg,_rgba(159,255,0,0.1),_rgba(20,24,37,0.7))]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4"><div><span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Your club identity</span><h2 className="mt-2 font-display text-3xl font-bold uppercase">Who do you rep?</h2></div><MapPin className="h-6 w-6 text-primary" /></div>
              <p className="mt-2 text-sm leading-6 text-muted">Choose a club to personalise your matchday card. No login required for the first call.</p>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CLUBS.map((item) => <button key={item.name} type="button" onClick={() => setClub(item)} className={`rounded-lg border p-3 text-left transition ${club.name === item.name ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background/30 text-muted hover:border-primary/50'}`}><span className="font-mono text-[10px] text-primary">{item.short}</span><span className="mt-2 block text-xs font-semibold leading-4">{item.name}</span><span className="mt-1 block text-[10px]">{item.city}, {item.state}</span></button>)}
              </div>
              <div className="mt-6 rounded-xl border border-border bg-background/40 p-5"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-mono text-sm font-black text-primary-foreground">{club.short}</div><div><p className="text-lg font-bold text-foreground">{club.name}</p><p className="text-xs text-muted">{club.city} · {club.colors}</p></div></div></div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between"><span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Today’s local call</span><span className="rounded-full bg-live/10 px-2.5 py-1 text-[10px] font-bold uppercase text-live">Fan pulse</span></div>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase">{MATCH.home} <span className="text-muted">vs</span> {MATCH.away}</h2>
              <p className="mt-2 text-xs text-muted">{MATCH.kickoff} · {MATCH.venue}</p>
              <div className="mt-6 space-y-3">
                {([['home', MATCH.home], ['draw', 'Na draw'], ['away', MATCH.away] ] as [Call, string][]).map(([key, label]) => <button key={key} type="button" onClick={() => makeCall(key)} className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${call === key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}><span className="text-sm font-semibold text-foreground">{label}</span><span className="font-mono text-xs text-muted">{Math.round((votes[key] / totalVotes) * 100)}%</span></button>)}
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted"><Users className="h-4 w-4 text-primary" /> {totalVotes.toLocaleString()} community calls so far</div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-elevated"><div className="flex h-full"><div className="bg-primary" style={{ width: `${(votes.home / totalVotes) * 100}%` }} /><div className="bg-muted/50" style={{ width: `${(votes.draw / totalVotes) * 100}%` }} /><div className="bg-info" style={{ width: `${(votes.away / totalVotes) * 100}%` }} /></div></div>
              <button type="button" onClick={shareCall} disabled={!call} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"><ShareIcon className="h-4 w-4" /> {copied ? 'Call copied' : 'Share my call'}</button>
              {!call && <p className="mt-2 text-center text-[11px] text-muted">Choose a result above to unlock your share card.</p>}
            </CardContent>
          </Card>
        </div>

        <section className="mt-10 border-y border-border py-10"><div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">The LegendEmpire difference</span><h2 className="mt-2 font-display text-3xl font-bold uppercase">From picks to belonging.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">The fan pulse is community sentiment, not a guarantee and not a betting instruction. For transparent statistical analysis on any fixture, use the full match centre.</p></div><Link href="/predictions/today" className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50">Open match centre <ArrowRight className="h-4 w-4" /></Link></div></section>
      </Container>
    </>
  );
}
