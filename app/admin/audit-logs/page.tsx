"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminList } from "@/lib/api/admin";

interface AuditLogEntry {
  _id: string;
  userEmail?: string;
  action: string;
  resource: string;
  statusCode: number;
  ipAddress?: string;
  createdAt: string;
}

const ACTION_VARIANT: Record<string, "live" | "default" | "risk-high"> = {
  POST: "live",
  PATCH: "default",
  PUT: "default",
  DELETE: "risk-high",
};

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit-logs", page],
    queryFn: () => adminList<AuditLogEntry>("audit-logs", { page, limit: 30 }),
  });

  const columns: Column<AuditLogEntry>[] = [
    { key: "userEmail", label: "Admin", render: (l) => l.userEmail ?? "—" },
    {
      key: "action",
      label: "Action",
      render: (l) => (
        <Badge variant={ACTION_VARIANT[l.action] ?? "default"}>
          {l.action}
        </Badge>
      ),
    },
    {
      key: "resource",
      label: "Resource",
      render: (l) => <span className="font-mono text-xs">{l.resource}</span>,
    },
    { key: "statusCode", label: "Status" },
    {
      key: "createdAt",
      label: "When",
      render: (l) => new Date(l.createdAt).toLocaleString(),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Audit logs"
        subtitle="Every mutating admin action, recorded automatically."
      />
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(l) => l._id}
        isLoading={isLoading}
        page={data?.meta?.page}
        totalPages={data?.meta?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
