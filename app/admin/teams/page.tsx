"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminList } from "@/lib/api/admin";
import { Team } from "@/types/api";

export default function AdminTeamsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "teams", page, q],
    queryFn: () => adminList<Team>("teams", { page, limit: 20, q: q || undefined }),
  });

  const columns: Column<Team>[] = [
    { key: "name", label: "Name" },
    { key: "country", label: "Country" },
    { key: "venueName", label: "Venue", render: (team) => team.venueName || "—" },
    {
      key: "isActive",
      label: "Status",
      render: (team) => (
        <Badge variant={team.isActive ? "live" : "default"}>
          {team.isActive ? "active" : "inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Teams"
        subtitle="Read-only verification. Team records, crests, and metadata are populated automatically from the scheduled data pipeline."
      />
      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search teams…"
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            setPage(1);
          }}
          className="h-10 w-full rounded-md border border-border bg-surface-elevated pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none"
        />
      </div>
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(team) => team._id}
        isLoading={isLoading}
        onRowClick={(team) => router.push(`/admin/teams/${team._id}`)}
        page={data?.meta.page}
        totalPages={data?.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
