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
import { AdminBlogPost } from "@/types/api";

export default function AdminBlogPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "blog", page],
    queryFn: () => adminList<AdminBlogPost>("blog", { page, limit: 20 }),
  });

  const columns: Column<AdminBlogPost>[] = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category", render: (p) => p.category || "—" },
    { key: "views", label: "Views" },
    {
      key: "status",
      label: "Status",
      render: (p) => (
        <Badge variant={p.status === "published" ? "live" : "default"}>
          {p.status}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        subtitle="Manage articles and drafts."
        action={
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus className="h-4 w-4" /> New post
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(p) => p._id}
        isLoading={isLoading}
        onRowClick={(p) => router.push(`/admin/blog/${p._id}`)}
        page={data?.meta?.page}
        totalPages={data?.meta?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
