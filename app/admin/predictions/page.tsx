"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { adminList } from "@/lib/api/admin";
import { apiClient } from "@/lib/api/client";
import { Prediction } from "@/types/api";

function GenerateSingleForm() {
  const [matchId, setMatchId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const queryClient = useQueryClient();

  async function handleGenerate() {
    setStatus("loading");
    try {
      await apiClient.post("/admin/predictions/generate", { matchId });
      setStatus("done");
      queryClient.invalidateQueries({ queryKey: ["admin", "predictions"] });
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-5">
        <h2 className="font-display text-base font-bold uppercase tracking-tight">
          Generate for one match
        </h2>
        <Input
          label="Match ID"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
        />
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={status === "loading" || !matchId}
          className="w-fit"
        >
          <Sparkles className="h-4 w-4" />{" "}
          {status === "loading" ? "Generating…" : "Generate"}
        </Button>
        {status === "done" && (
          <span className="text-xs text-live">Generated.</span>
        )}
        {status === "error" && (
          <span className="text-xs text-danger">
            Failed — check the match ID and status.
          </span>
        )}
      </CardContent>
    </Card>
  );
}

function GenerateRangeForm() {
  const [leagueId, setLeagueId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const queryClient = useQueryClient();

  async function handleGenerate() {
    setStatus("loading");
    try {
      await apiClient.post("/admin/predictions/generate-range", {
        leagueId,
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
      });
      setStatus("done");
      queryClient.invalidateQueries({ queryKey: ["admin", "predictions"] });
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-5">
        <h2 className="font-display text-base font-bold uppercase tracking-tight">
          Generate for a league range
        </h2>
        <Input
          label="League ID"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={status === "loading" || !leagueId || !from || !to}
          className="w-fit"
        >
          <Sparkles className="h-4 w-4" />{" "}
          {status === "loading" ? "Generating…" : "Generate range"}
        </Button>
        {status === "done" && <span className="text-xs text-live">Done.</span>}
        {status === "error" && (
          <span className="text-xs text-danger">Failed.</span>
        )}
      </CardContent>
    </Card>
  );
}

function EvaluateAccuracyButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  async function handleEvaluate() {
    setStatus("loading");
    await apiClient.post("/admin/predictions/evaluate");
    setStatus("done");
  }
  return (
    <Button
      variant="secondary"
      onClick={handleEvaluate}
      disabled={status === "loading"}
    >
      <RefreshCw className="h-4 w-4" />{" "}
      {status === "loading" ? "Evaluating…" : "Evaluate accuracy now"}
    </Button>
  );
}

export default function AdminPredictionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "predictions", page],
    queryFn: () => adminList<Prediction>("predictions", { page, limit: 20 }),
  });

  const columns: Column<Prediction>[] = [
    {
      key: "match",
      label: "Match",
      render: (p) => `${p.match.homeTeam.name} vs ${p.match.awayTeam.name}`,
    },
    {
      key: "tier",
      label: "Tier",
      render: (p) => (
        <Badge variant={p.tier === "vip" ? "vip" : "default"}>{p.tier}</Badge>
      ),
    },
    {
      key: "confidenceScore",
      label: "Confidence",
      render: (p) => `${p.confidenceScore}%`,
    },
    {
      key: "riskRating",
      label: "Risk",
      render: (p) => (
        <Badge variant={`risk-${p.riskRating}`}>{p.riskRating}</Badge>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Predictions"
        subtitle="Generated automatically, or trigger manually below."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GenerateSingleForm />
        <GenerateRangeForm />
      </div>

      <div className="mb-4">
        <EvaluateAccuracyButton />
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(p) => p._id}
        isLoading={isLoading}
        onRowClick={(p) => router.push(`/matches/${p.match._id}`)}
        page={data?.meta?.page}
        totalPages={data?.meta?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
