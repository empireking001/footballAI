"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminList } from "@/lib/api/admin";

interface Announcement {
  _id: string;
  title: string;
  type: "info" | "success" | "warning" | "promo";
  isActive: boolean;
}

const TYPE_VARIANT: Record<string, "live" | "default" | "risk-high" | "vip"> = {
  info: "default",
  success: "live",
  warning: "risk-high",
  promo: "vip",
};

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", page],
    queryFn: () =>
      adminList<Announcement>("announcements", { page, limit: 20 }),
  });

  const columns: Column<Announcement>[] = [
    { key: "title", label: "Title" },
    {
      key: "type",
      label: "Type",
      render: (a) => <Badge variant={TYPE_VARIANT[a.type]}>{a.type}</Badge>,
    },
    {
      key: "isActive",
      label: "Status",
      render: (a) => (
        <Badge variant={a.isActive ? "live" : "default"}>
          {a.isActive ? "active" : "inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Announcements"
        subtitle="Homepage banner/ticker messages."
        action={
          <Button asChild>
            <Link href="/admin/announcements/new">
              <Plus className="h-4 w-4" /> New announcement
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(a) => a._id}
        isLoading={isLoading}
        onRowClick={(a) => router.push(`/admin/announcements/${a._id}`)}
        page={data?.meta?.page}
        totalPages={data?.meta?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
