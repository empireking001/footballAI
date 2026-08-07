"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SyncLeaguesDialog } from "@/components/admin/SyncLeaguesDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
      render: (l) => (
        <Badge variant={l.isActive ? "live" : "default"}>
          {l.isActive ? "active" : "inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Leagues"
        subtitle="Manage leagues and pull new ones from football-data.org."
        action={
          <Button asChild>
            <Link href="/admin/leagues/new">
              <Plus className="h-4 w-4" /> New league
            </Link>
          </Button>
        }
      />

      <div className="mb-4">
        <SyncLeaguesDialog />
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(l) => l._id}
        isLoading={isLoading}
        onRowClick={(l) => router.push(`/admin/leagues/${l._id}`)}
        page={data?.meta?.page}
        totalPages={data?.meta?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
