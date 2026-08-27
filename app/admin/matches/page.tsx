"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminList } from "@/lib/api/admin";
import { Match, MatchStatus } from "@/types/api";
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

export default function AdminMatchesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<MatchStatus | "all">("scheduled");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "matches", page, status],
    queryFn: () =>
      adminList<Match>("matches", {
        page,
        limit: 20,
        status: status === "all" ? undefined : status,
      }),
  });

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
  ];

  return (
    <div>
      <AdminPageHeader
        title="Matches"
        subtitle="Start with upcoming fixtures to write predictions, then use the status filters for live monitoring, score corrections, and historical review."
        action={<Link href="/admin/matches/new" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Create manual fixture</Link>}
      />
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
