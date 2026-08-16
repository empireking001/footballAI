"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { adminList, adminUpdate } from "@/lib/api/admin";
import { apiClient } from "@/lib/api/client";
import { Prediction } from "@/types/api";

function formatMatch(prediction: Prediction) {
  return `${prediction.match.homeTeam.name} vs ${prediction.match.awayTeam.name}`;
}

function BackfillPanel() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/admin/predictions/backfill', { days: 7, limit: 200 });
      return response.data;
    },
    onSuccess: (response) => {
      setError(false);
      setMessage(response.message ?? 'Prediction backfill completed.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'predictions'] });
    },
    onError: (err) => {
      setError(true);
      setMessage(err instanceof Error ? err.message : 'Backfill failed.');
    },
  });

  return (
    <Card className="mb-6 border-primary/25 bg-primary/[0.04]">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary"><Wand2 className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-widest">Operations recovery</span></div>
          <h2 className="mt-2 font-display text-lg font-bold uppercase tracking-tight">Populate the next 7 days</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Use this when fixtures exist but predictions have not been generated. It is safe to run repeatedly; existing predictions are skipped.</p>
          {message ? <p className={`mt-2 text-xs ${error ? 'text-danger' : 'text-live'}`}>{message}</p> : null}
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="shrink-0"><Sparkles className="h-4 w-4" />{mutation.isPending ? 'Generating…' : 'Backfill predictions'}</Button>
      </CardContent>
    </Card>
  );
}

export default function AdminPredictionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'predictions', 'featured', page],
    queryFn: () => adminList<Prediction>('predictions/featured', { page, limit: 50 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Prediction> }) => adminUpdate<Prediction>('predictions', id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'predictions'] }),
  });

  const columns: Column<Prediction>[] = [
    {
      key: 'match',
      label: 'Fixture',
      render: (p) => <div><div className="font-medium text-foreground">{formatMatch(p)}</div><div className="text-xs text-muted">{p.match.league.name} · {new Date(p.match.kickoffAt).toLocaleString()}</div></div>,
    },
    { key: 'confidenceScore', label: 'AI confidence', render: (p) => <span className="font-mono text-sm font-semibold">{p.confidenceScore}%</span> },
    {
      key: 'isFeatured',
      label: 'Featured',
      render: (p) => <button type="button" onClick={() => updateMutation.mutate({ id: p._id, body: { isFeatured: !p.isFeatured } })} disabled={updateMutation.isPending} className="disabled:opacity-50"><Badge variant={p.isFeatured ? 'live' : 'default'}>{p.isFeatured ? <><CheckCircle2 className="mr-1 inline h-3 w-3" />Featured</> : 'Hidden'}</Badge></button>,
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (p) => <select value={p.tier} onChange={(e) => updateMutation.mutate({ id: p._id, body: { tier: e.target.value as 'free' | 'vip' } })} disabled={updateMutation.isPending} className="rounded-md border border-border bg-surface-elevated px-2 py-1 text-xs font-semibold text-foreground"><option value="free">Free</option><option value="vip">VIP / Pro</option></select>,
    },
    {
      key: 'aiExplanation',
      label: 'AI explanation',
      render: (p) => <textarea defaultValue={p.aiExplanation} aria-label={`Edit explanation for ${formatMatch(p)}`} onBlur={(e) => { if (e.target.value !== p.aiExplanation) updateMutation.mutate({ id: p._id, body: { aiExplanation: e.target.value } }); }} className="min-h-20 w-full min-w-[240px] rounded-md border border-border bg-surface-elevated p-2 text-xs leading-5 text-foreground" />,
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Prediction operations" subtitle="Backfill missing analysis, then curate what users see across Free and VIP." />
      <BackfillPanel />
      {isError ? <div className="mb-4 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">The prediction list could not be loaded. Check your login session and backend status, then retry.</div> : null}
      <DataTable columns={columns} rows={data?.data ?? []} rowKey={(p) => p._id} isLoading={isLoading} emptyMessage="No upcoming predictions yet. Run the backfill action above after fixture sync." page={data?.meta?.page} totalPages={data?.meta?.totalPages} onPageChange={setPage} />
      <div className="mt-4 flex items-center gap-2 text-xs text-muted"><RefreshCw className="h-3.5 w-3.5" />Changes save when a control is changed or an explanation field loses focus.</div>
    </div>
  );
}
