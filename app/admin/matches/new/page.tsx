'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { adminCreateManualMatch } from '@/lib/api/admin';

function defaultKickoff(): string {
  const value = new Date(Date.now() + 24 * 60 * 60 * 1000);
  value.setMinutes(0, 0, 0);
  return value.toISOString().slice(0, 16);
}

export default function NewManualMatchPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    leagueName: '',
    leagueCountry: 'International',
    season: String(new Date().getUTCFullYear()),
    homeTeamName: '',
    awayTeamName: '',
    kickoffAt: defaultKickoff(),
    venue: '',
    referee: '',
  });
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: () => adminCreateManualMatch({
      leagueName: form.leagueName,
      leagueCountry: form.leagueCountry,
      season: Number(form.season),
      homeTeamName: form.homeTeamName,
      awayTeamName: form.awayTeamName,
      kickoffAt: new Date(form.kickoffAt).toISOString(),
      venue: form.venue || undefined,
      referee: form.referee || undefined,
    }),
    onSuccess: (match) => {
      const id = (match as { _id?: string } | null)?._id;
      router.push(id ? `/admin/matches/${id}` : '/admin/matches');
    },
    onError: (value) => setError(value instanceof Error ? value.message : 'Unable to create the manual fixture.'),
  });

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    mutation.mutate();
  }

  return (
    <div>
      <AdminPageHeader
        title="Create manual fixture"
        subtitle="Add a match that is not available in the automated provider feed, then open its editor to publish a manual pick."
        action={<Link href="/admin/matches" className="rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-semibold">Back to matches</Link>}
      />
      <form onSubmit={submit} className="max-w-3xl rounded-lg border border-border bg-surface/50 p-5 sm:p-6">
        <div className="mb-5 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted">
          This fixture is marked as <strong className="text-foreground">manual</strong>. It will not be overwritten by automated provider synchronization. Since it has no provider history, Match Intelligence will show only verified data that exists for the same teams.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">League or competition<input required value={form.leagueName} onChange={(event) => update('leagueName', event.target.value)} placeholder="Example: CAF Champions League" className="h-11 rounded-md border border-border bg-background px-3 font-normal" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Country or region<input value={form.leagueCountry} onChange={(event) => update('leagueCountry', event.target.value)} placeholder="International" className="h-11 rounded-md border border-border bg-background px-3 font-normal" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Season<input required type="number" min="2000" max="2100" value={form.season} onChange={(event) => update('season', event.target.value)} className="h-11 rounded-md border border-border bg-background px-3 font-normal" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Kickoff<input required type="datetime-local" value={form.kickoffAt} onChange={(event) => update('kickoffAt', event.target.value)} className="h-11 rounded-md border border-border bg-background px-3 font-normal" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Home team<input required value={form.homeTeamName} onChange={(event) => update('homeTeamName', event.target.value)} placeholder="Home team name" className="h-11 rounded-md border border-border bg-background px-3 font-normal" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Away team<input required value={form.awayTeamName} onChange={(event) => update('awayTeamName', event.target.value)} placeholder="Away team name" className="h-11 rounded-md border border-border bg-background px-3 font-normal" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Venue <span className="text-xs font-normal text-muted">Optional</span><input value={form.venue} onChange={(event) => update('venue', event.target.value)} placeholder="Stadium name" className="h-11 rounded-md border border-border bg-background px-3 font-normal" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Referee <span className="text-xs font-normal text-muted">Optional</span><input value={form.referee} onChange={(event) => update('referee', event.target.value)} placeholder="Referee name" className="h-11 rounded-md border border-border bg-background px-3 font-normal" /></label>
        </div>
        {error && <p className="mt-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger" role="alert">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={mutation.isPending} className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{mutation.isPending ? 'Creating fixture…' : 'Create fixture and add pick'}</button>
          <Link href="/admin/matches" className="rounded-md border border-border bg-surface-elevated px-5 py-2.5 text-sm font-semibold">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
