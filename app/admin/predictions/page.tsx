"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminList } from "@/lib/api/admin";
import { apiClient } from "@/lib/api/client";
import { formatKickoff } from "@/lib/utils";
import { Prediction, PredictionTier, SiteSettings } from "@/types/api";

function SyncStatusCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "sync-status"],
    queryFn: async () => (await apiClient.get<{ data: SiteSettings }>("/settings")).data.data,
    staleTime: 60 * 1000,
  });

  const timestamp = (value?: string) =>
    value
      ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
      : "Not recorded yet";
  const liveAt = data?.dataSync?.liveScoresLastSyncedAt;
  const liveFresh = liveAt ? Date.now() - new Date(liveAt).getTime() < 5 * 60 * 1000 : false;

  return (
    <Card className="mb-5 border-border bg-surface/50">
      <CardContent className="pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-bold uppercase tracking-tight">Data operations</h2>
            <p className="mt-1 text-sm text-muted">Fixtures and live scores continue to sync independently from manual predictions.</p>
          </div>
          <Badge variant={liveFresh ? "live" : "risk-high"}>{liveFresh ? "Live sync healthy" : "Live sync needs attention"}</Badge>
        </div>
        <div className="mt-4 grid gap-3 text-xs text-muted sm:grid-cols-3">
          <div><span className="font-semibold text-foreground">Live scores</span><br />{isLoading ? "Loading…" : timestamp(liveAt)}</div>
          <div><span className="font-semibold text-foreground">Fixtures</span><br />{isLoading ? "Loading…" : timestamp(data?.dataSync?.fixturesLastSyncedAt)}</div>
          <div><span className="font-semibold text-foreground">Standings</span><br />{isLoading ? "Loading…" : timestamp(data?.dataSync?.standingsLastSyncedAt)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPredictionsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "manual-predictions", page],
    queryFn: () => adminList<Prediction>("predictions", { page, limit: 20 }),
  });

  const updatePrediction = useMutation({
    mutationFn: async ({ prediction, patch }: { prediction: Prediction; patch: Partial<Pick<Prediction, "isFeatured" | "tier" | "aiExplanation">> }) => {
      setSavingId(prediction._id);
      return apiClient.patch(`/admin/predictions/${prediction._id}`, patch);
    },
    onSettled: async () => {
      setSavingId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "manual-predictions"] });
    },
  });

  function noteFor(prediction: Prediction): string {
    return drafts[prediction._id] ?? prediction.aiExplanation;
  }

  const columns: Column<Prediction>[] = [
    {
      key: "match",
      label: "Match",
      render: (prediction) => (
        <div>
          <Link href={`/admin/matches/${prediction.match._id}`} className="font-semibold text-foreground hover:text-primary">
            {prediction.match.homeTeam.name} vs {prediction.match.awayTeam.name}
          </Link>
          <p className="mt-1 text-xs text-muted">{prediction.match.league.name} · {formatKickoff(prediction.match.kickoffAt)}</p>
        </div>
      ),
    },
    {
      key: "markets",
      label: "Manual picks",
      render: (prediction) => (
        <div className="max-w-[16rem] text-xs text-foreground">
          {prediction.markets.length > 0
            ? prediction.markets.map((market) => `${market.market}: ${market.selection}`).join(" · ")
            : "No market entered"}
        </div>
      ),
    },
    {
      key: "isFeatured",
      label: "Featured",
      render: (prediction) => (
        <Button
          size="sm"
          variant={prediction.isFeatured ? "primary" : "secondary"}
          disabled={savingId === prediction._id}
          onClick={() => updatePrediction.mutate({ prediction, patch: { isFeatured: !prediction.isFeatured } })}
        >
          {prediction.isFeatured ? "Featured" : "Hidden"}
        </Button>
      ),
    },
    {
      key: "tier",
      label: "Tier",
      render: (prediction) => (
        <select
          value={prediction.tier}
          disabled={savingId === prediction._id}
          className="rounded-md border border-border bg-surface px-2 py-1 text-xs"
          onChange={(event) => updatePrediction.mutate({ prediction, patch: { tier: event.target.value as PredictionTier } })}
        >
          <option value="free">Free</option>
          <option value="vip">VIP</option>
        </select>
      ),
    },
    {
      key: "aiExplanation",
      label: "Manual note",
      render: (prediction) => (
        <textarea
          value={noteFor(prediction)}
          rows={2}
          className="min-w-[15rem] rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground"
          onChange={(event) => setDrafts((current) => ({ ...current, [prediction._id]: event.target.value }))}
          onBlur={() => {
            const value = noteFor(prediction).trim();
            if (value !== prediction.aiExplanation) updatePrediction.mutate({ prediction, patch: { aiExplanation: value } });
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Manual predictions"
        subtitle="This is the only prediction management page. Open any upcoming fixture to type, revise, feature, or tier the prediction users will see."
      />
      <SyncStatusCard />
      <Card className="mb-5 border-primary/20 bg-primary/5">
        <CardContent className="pt-5 text-sm leading-6 text-muted">
          Select a match to edit its real fixture details, then use the Manual prediction editor to enter the market, selection, probability, optional confidence, risk, note, historical comparison, and key factors. No automatic prediction generation is used.
        </CardContent>
      </Card>
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(prediction) => prediction._id}
        isLoading={isLoading}
        page={data?.meta.page}
        totalPages={data?.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
