"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminList } from "@/lib/api/admin";
import { apiClient } from "@/lib/api/client";
import { formatKickoff } from "@/lib/utils";
import { Prediction, PredictionTier } from "@/types/api";

export default function AdminPredictionsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "predictions", "featured", page],
    queryFn: () => adminList<Prediction>("predictions/featured", { page, limit: 20 }),
  });

  async function updatePrediction(
    prediction: Prediction,
    patch: Partial<Pick<Prediction, "isFeatured" | "tier" | "aiExplanation">>,
  ) {
    setSavingId(prediction._id);
    try {
      await apiClient.patch(`/admin/predictions/${prediction._id}`, patch);
      await queryClient.invalidateQueries({ queryKey: ["admin", "predictions", "featured"] });
    } finally {
      setSavingId(null);
    }
  }

  function explanationFor(prediction: Prediction): string {
    return drafts[prediction._id] ?? prediction.aiExplanation;
  }

  const columns: Column<Prediction>[] = [
    {
      key: "match",
      label: "Match",
      render: (prediction) => (
        <div>
          <Link
            href={`/matches/${prediction.match._id}`}
            className="font-semibold text-foreground hover:text-primary"
            onClick={(event) => event.stopPropagation()}
          >
            {prediction.match.homeTeam.name} vs {prediction.match.awayTeam.name}
          </Link>
          <p className="mt-1 text-xs text-muted">
            {prediction.match.league.name} · {formatKickoff(prediction.match.kickoffAt)}
          </p>
        </div>
      ),
    },
    {
      key: "confidenceScore",
      label: "AI confidence",
      render: (prediction) => `${prediction.confidenceScore}%`,
    },
    {
      key: "isFeatured",
      label: "Featured",
      render: (prediction) => (
        <Button
          size="sm"
          variant={prediction.isFeatured ? "primary" : "secondary"}
          disabled={savingId === prediction._id}
          onClick={(event) => {
            event.stopPropagation();
            void updatePrediction(prediction, { isFeatured: !prediction.isFeatured });
          }}
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
          onClick={(event) => event.stopPropagation()}
          onChange={(event) =>
            void updatePrediction(prediction, { tier: event.target.value as PredictionTier })
          }
        >
          <option value="free">Free</option>
          <option value="vip">VIP</option>
        </select>
      ),
    },
    {
      key: "aiExplanation",
      label: "AI explanation",
      render: (prediction) => (
        <div className="min-w-[18rem]">
          <textarea
            value={explanationFor(prediction)}
            rows={3}
            className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground"
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              setDrafts((current) => ({ ...current, [prediction._id]: event.target.value }))
            }
            onBlur={() => {
              const value = explanationFor(prediction).trim();
              if (value && value !== prediction.aiExplanation) {
                void updatePrediction(prediction, { aiExplanation: value });
              }
            }}
          />
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={prediction.riskRating === "low" ? "live" : "default"}>
              {prediction.riskRating} risk
            </Badge>
            {savingId === prediction._id && <span className="text-[11px] text-muted">Saving…</span>}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Featured predictions"
        subtitle="Curation-only view. Predictions are generated automatically; use this page to select, tier, and refine what users see over the next seven days."
      />
      <Card className="mb-5 border-primary/20 bg-primary/5">
        <CardContent className="pt-5 text-sm text-muted">
          Leagues, teams, fixtures, predictions, odds, and accuracy jobs run automatically. This is the only daily prediction management surface.
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
