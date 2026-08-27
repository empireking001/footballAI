"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminList } from "@/lib/api/admin";
import { Match, MatchStatus, Prediction } from "@/types/api";
import { formatKickoff } from "@/lib/utils";

const STATUS_OPTIONS: (MatchStatus | "all")[] = [
  "all",
  "scheduled",
  "live",
  "halftime",
  "finished",
  "postponed",
  "cancelled",
  "suspended",
];

const STATUS_VARIANT: Record<string, "live" | "default" | "risk-high"> = {
  live: "live",
  halftime: "live",
  finished: "default",
  cancelled: "risk-high",
  postponed: "risk-high",
  suspended: "risk-high",
};

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayRange(key: string): { from: string; to: string } {
  return { from: `${key}T00:00:00.000Z`, to: `${key}T23:59:59.999Z` };
}

function getDayOptions() {
  const base = new Date();
  base.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setUTCDate(base.getUTCDate() + index);
    return {
      key: dateKey(date),
      weekday: date.toLocaleDateString('en-NG', { weekday: 'short', timeZone: 'Africa/Lagos' }),
      date: date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', timeZone: 'Africa/Lagos' }),
    };
  });
}

export default function AdminMatchesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<MatchStatus | "all">("scheduled");
  const [day, setDay] = useState('all');
  const dayOptions = useMemo(getDayOptions, []);
  const range = day === 'all' ? undefined : dayRange(day);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "matches", page, status, day],
    queryFn: () =>
      adminList<Match>("matches", {
        page,
        limit: 20,
        status: status === "all" ? undefined : status,
        from: range?.from,
        to: range?.to,
      }),
  });

  const { data: predictionData } = useQuery({
    queryKey: ['admin', 'manual-predictions', 'match-status'],
    queryFn: () => adminList<Prediction>('predictions', { phase: 'all', limit: 100 }),
    staleTime: 30 * 1000,
  });
  const predictedMatchIds = useMemo(() => new Set((predictionData?.data ?? []).map((prediction) => prediction.match._id)), [predictionData?.data]);

  const columns: Column<Match>[] = [
    {
      key: "match",
      label: "Match",
      render: (match) => `${match.homeTeam?.name ?? 'Unknown home team'} vs ${match.awayTeam?.name ?? 'Unknown away team'}`,
    },
    { key: "league", label: "League", render: (match) => match.league?.name ?? 'Unknown league' },
    { key: "kickoffAt", label: "Kickoff", render: (match) => formatKickoff(match.kickoffAt) },
    {
      key: "score",
      label: "Score",
      render: (match) =>
        match.score?.homeFullTime !== undefined
          ? `${match.score.homeFullTime}-${match.score.awayFullTime}`
          : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (match) => <Badge variant={STATUS_VARIANT[match.status] ?? "default"}>{match.status}</Badge>,
    },
    {
      key: 'prediction',
      label: 'Manual pick',
      render: (match) => predictedMatchIds.has(match._id)
        ? <Badge variant="live">Selected</Badge>
        : <Badge variant="default">Not selected</Badge>,
    },
    {
      key: 'action',
      label: 'Action',
      render: (match) => <Link href={`/admin/matches/${match._id}`} className="inline-flex rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">{predictedMatchIds.has(match._id) ? 'Edit pick' : 'Select match'}</Link>,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Matches"
        subtitle="Browse every covered fixture by day. Select only the matches you want to receive a manual prediction; all other fixtures remain visible to users as prediction pending."
        action={<Link href="/admin/matches/new" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Create manual fixture</Link>}
      />
      <div className="mb-4 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          <button type="button" onClick={() => { setDay('all'); setPage(1); }} className={`flex min-w-[4.8rem] flex-col items-center rounded-lg border px-3 py-2 text-center text-xs transition-colors ${day === 'all' ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-surface-elevated text-muted'}`}><span className="font-bold uppercase tracking-wider">All</span><span className="mt-0.5">days</span></button>
          {dayOptions.map((option) => (
            <button key={option.key} type="button" onClick={() => { setDay(option.key); setPage(1); }} className={`flex min-w-[4.8rem] flex-col items-center rounded-lg border px-3 py-2 text-center text-xs transition-colors ${day === option.key ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-surface-elevated text-muted'}`}><span className="font-bold uppercase tracking-wider">{option.weekday}</span><span className="mt-0.5">{option.date}</span></button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setStatus(option);
              setPage(1);
            }}
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              status === option
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-surface-elevated text-muted"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted">
        <strong className="text-foreground">Selection rule:</strong> the provider supplies the fixture list, but the administrator decides which individual matches receive a manual pick. Users can see every fixture; only selected matches show your entered markets.
      </div>
      {isError && <div className="mb-4 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">Unable to load matches for this filter. {error instanceof Error ? error.message : 'Check the admin session and backend response, then try again.'}</div>}
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(match) => match._id}
        isLoading={isLoading}
        onRowClick={(match) => router.push(`/admin/matches/${match._id}`)}
        page={data?.meta.page}
        totalPages={data?.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
