"use client";

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
  const [status, setStatus] = useState<MatchStatus | "all">("all");

  const { data, isLoading } = useQuery({
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
      render: (m) => `${m.homeTeam.name} vs ${m.awayTeam.name}`,
    },
    { key: "league", label: "League", render: (m) => m.league.name },
    {
      key: "kickoffAt",
      label: "Kickoff",
      render: (m) => formatKickoff(m.kickoffAt),
    },
    {
      key: "score",
      label: "Score",
      render: (m) =>
        m.score.homeFullTime !== undefined
          ? `${m.score.homeFullTime}-${m.score.awayFullTime}`
          : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (m) => (
        <Badge variant={STATUS_VARIANT[m.status] ?? "default"}>
          {m.status}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Matches"
        subtitle="Matches populate via league fixture sync."
      />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              status === s
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-surface-elevated text-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(m) => m._id}
        isLoading={isLoading}
        onRowClick={(m) => router.push(`/admin/matches/${m._id}`)}
        page={data?.meta?.page}
        totalPages={data?.meta?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
