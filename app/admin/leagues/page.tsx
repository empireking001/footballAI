'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminList, adminSyncFixtures } from "@/lib/api/admin";
import { League } from "@/types/api";

function dateValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function AdminLeaguesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [leagueId, setLeagueId] = useState("");
  const [from, setFrom] = useState(() => `${new Date().getFullYear()}-01-01`);
  const [to, setTo] = useState(() => dateValue(new Date()));
  const [message, setMessage] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leagues", page],
    queryFn: () => adminList<League>("leagues", { page, limit: 20 }),
  });

  useEffect(() => {
    if (!leagueId) {
      const primeraDivision = data?.data.find((league) => /primera division/i.test(league.name));
      if (primeraDivision) setLeagueId(primeraDivision._id);
    }
  }, [data?.data, leagueId]);

  const syncMutation = useMutation({
    mutationFn: () => adminSyncFixtures({ leagueId, from, to }),
    onSuccess: (result) => {
      setMessage(result.message ?? "Historical fixtures synced successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "leagues"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "matches"] });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "Historical fixture sync failed.");
    },
  });

  const columns: Column<League>[] = [
    {
      key: "logoUrl",
      label: "Logo",
      render: (league) => league.logoUrl ? <Image src={league.logoUrl} alt="" width={32} height={32} className="h-8 w-8 object-contain" /> : <span className="text-xs text-muted">—</span>,
    },
    { key: "name", label: "Name" },
    { key: "country", label: "Country" },
    { key: "season", label: "Season" },
    { key: "type", label: "Type" },
    {
      key: "isActive",
      label: "Status",
      render: (league) => (
        <Badge variant={league.isActive ? "live" : "default"}>
          {league.isActive ? "active" : "inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Leagues"
        subtitle="Live competitions are populated automatically. Use the history tool to import additional legitimate provider fixtures for form and head-to-head context."
      />
      <section className="mb-6 rounded-lg border border-border bg-surface/50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">Import fixture history</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">This imports real finished fixtures from the football-data provider. It does not create predictions, change live scores, or invent statistics.</p>
          </div>
          <Badge variant="default">Provider data only</Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
          <label className="grid gap-1.5 text-xs font-medium text-muted">Competition<select value={leagueId} onChange={(event) => setLeagueId(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"><option value="">Select competition</option>{(data?.data ?? []).map((league) => <option key={league._id} value={league._id}>{league.name} · {league.season}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-medium text-muted">From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground" /></label>
          <label className="grid gap-1.5 text-xs font-medium text-muted">To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground" /></label>
          <button type="button" disabled={!leagueId || !from || !to || syncMutation.isPending} onClick={() => { setMessage(""); syncMutation.mutate(); }} className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50">{syncMutation.isPending ? "Syncing…" : "Sync history"}</button>
        </div>
        {message && <p className="mt-3 text-sm text-primary" role="status">{message}</p>}
      </section>
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(league) => league._id}
        isLoading={isLoading}
        onRowClick={(league) => router.push(`/admin/leagues/${league._id}`)}
        page={data?.meta.page}
        totalPages={data?.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
