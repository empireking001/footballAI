"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminList } from "@/lib/api/admin";
import { League } from "@/types/api";

export default function AdminLeaguesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leagues", page],
    queryFn: () => adminList<League>("leagues", { page, limit: 20 }),
  });

  const columns: Column<League>[] = [
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
        subtitle="Read-only verification. Leagues are populated and refreshed automatically by the scheduled data pipeline."
      />
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
