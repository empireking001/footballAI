"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminList, adminUpdate } from "@/lib/api/admin";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/api";

// The admin endpoint returns the raw Mongoose User document (`_id`), unlike
// the sanitized `id`-shaped User returned from auth endpoints.
interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: User["role"];
  subscriptionTier: User["subscriptionTier"];
  isActive: boolean;
  createdAt: string;
}

const ROLE_OPTIONS: User["role"][] = ["user", "admin", "super_admin"];

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page, q],
    queryFn: () =>
      adminList<AdminUser>("users", { page, limit: 20, q: q || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<AdminUser> }) =>
      adminUpdate<AdminUser>("users", id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: "User",
      render: (u) => (
        <div>
          <div className="font-medium text-foreground">{u.name}</div>
          <div className="text-xs text-muted">{u.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (u) => (
        <select
          value={u.role}
          disabled={u._id === currentUser?.id || updateMutation.isPending}
          onChange={(e) =>
            updateMutation.mutate({
              id: u._id,
              body: { role: e.target.value as User["role"] },
            })
          }
          className="rounded-md border border-border bg-surface-elevated px-2 py-1 text-xs text-foreground"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "subscriptionTier",
      label: "Tier",
      render: (u) => (
        <Badge variant={u.subscriptionTier === "vip" ? "vip" : "default"}>
          {u.subscriptionTier}
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (u) => (
        <button
          type="button"
          disabled={u._id === currentUser?.id || updateMutation.isPending}
          onClick={() =>
            updateMutation.mutate({
              id: u._id,
              body: { isActive: !u.isActive },
            })
          }
          className="disabled:opacity-50"
        >
          <Badge variant={u.isActive ? "live" : "risk-high"}>
            {u.isActive ? "active" : "deactivated"}
          </Badge>
        </button>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (u) => new Date(u.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Users"
        subtitle="Manage roles, subscription tiers, and account status."
      />

      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="h-10 w-full rounded-md border border-border bg-surface-elevated pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none"
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(u) => u._id}
        isLoading={isLoading}
        emptyMessage="No users found."
        page={data?.meta?.page}
        totalPages={data?.meta?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
