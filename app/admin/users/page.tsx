'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminList, adminUpdate } from '@/lib/api/admin';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types/api';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: User['role'];
  subscriptionTier: User['subscriptionTier'];
  isActive: boolean;
  createdAt: string;
}

const ROLE_OPTIONS: User['role'][] = ['user', 'admin', 'super_admin'];

type AdminRole = 'admin' | 'super_admin';

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteRole, setPromoteRole] = useState<AdminRole>('admin');
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<AdminRole>('admin');
  const [createTier, setCreateTier] = useState<User['subscriptionTier']>('free');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, q],
    queryFn: () => adminList<AdminUser>('users', { page, limit: 20, q: q || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<AdminUser> }) => adminUpdate<AdminUser>('users', id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  function apiError(error: unknown, fallback: string) {
    return isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;
  }

  async function handlePromote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage(null);
    setActionError(null);
    try {
      await apiClient.post('/admin/users/promote-by-email', { email: promoteEmail, role: promoteRole });
      setActionMessage(`${promoteEmail} is now ${promoteRole}.`);
      setPromoteEmail('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (error) {
      setActionError(apiError(error, 'Could not promote that account.'));
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage(null);
    setActionError(null);
    try {
      await apiClient.post('/admin/users/create-admin', {
        name: createName,
        email: createEmail,
        password: createPassword,
        role: createRole,
        subscriptionTier: createTier,
      });
      setActionMessage(`${createRole} account created for ${createEmail}.`);
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (error) {
      setActionError(apiError(error, 'Could not create the administrator account.'));
    }
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      label: 'User',
      render: (u) => (
        <div>
          <div className="font-medium text-foreground">{u.name}</div>
          <div className="text-xs text-muted">{u.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (
        <select
          value={u.role}
          disabled={u._id === currentUser?.id || updateMutation.isPending}
          onChange={(e) => updateMutation.mutate({ id: u._id, body: { role: e.target.value as User['role'] } })}
          className="rounded-md border border-border bg-surface-elevated px-2 py-1 text-xs text-foreground"
        >
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      ),
    },
    {
      key: 'subscriptionTier',
      label: 'Tier',
      render: (u) => (
        <select
          aria-label={`Change ${u.name} subscription tier`}
          value={u.subscriptionTier}
          disabled={u._id === currentUser?.id || updateMutation.isPending}
          onChange={(e) => updateMutation.mutate({ id: u._id, body: { subscriptionTier: e.target.value as User['subscriptionTier'] } })}
          className="rounded-md border border-border bg-surface-elevated px-2 py-1 text-xs font-semibold text-foreground disabled:opacity-50"
        >
          <option value="free">Free</option>
          <option value="vip">VIP / Pro</option>
        </select>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (u) => (
        <button
          type="button"
          disabled={u._id === currentUser?.id || updateMutation.isPending}
          onClick={() => updateMutation.mutate({ id: u._id, body: { isActive: !u.isActive } })}
          className="disabled:opacity-50"
        >
          <Badge variant={u.isActive ? 'live' : 'risk-high'}>{u.isActive ? 'active' : 'deactivated'}</Badge>
        </button>
      ),
    },
    { key: 'createdAt', label: 'Joined', render: (u) => new Date(u.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <AdminPageHeader title="Users" subtitle="Manage roles, subscription tiers, and account status." />

      <div className="mb-8 grid gap-5 xl:grid-cols-2">
        <form onSubmit={handlePromote} className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Promote existing user</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Enter an existing account email. Only a super admin can grant super_admin.</p>
          <div className="mt-4 flex flex-col gap-3">
            <Input label="User email" type="email" value={promoteEmail} onChange={(event) => setPromoteEmail(event.target.value)} required />
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">New role<select value={promoteRole} onChange={(event) => setPromoteRole(event.target.value as AdminRole)} className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground"><option value="admin">admin</option><option value="super_admin">super_admin</option></select></label>
            <Button type="submit" className="w-fit">Promote user</Button>
          </div>
        </form>

        <form onSubmit={handleCreate} className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Create administrator</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Create a new admin login with a separate email and password.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input label="Full name" value={createName} onChange={(event) => setCreateName(event.target.value)} required />
            <Input label="Email" type="email" value={createEmail} onChange={(event) => setCreateEmail(event.target.value)} required />
            <Input label="Temporary password" type="password" value={createPassword} onChange={(event) => setCreatePassword(event.target.value)} required />
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">Role<select value={createRole} onChange={(event) => setCreateRole(event.target.value as AdminRole)} className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground"><option value="admin">admin</option><option value="super_admin">super_admin</option></select></label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">Tier<select value={createTier} onChange={(event) => setCreateTier(event.target.value as User['subscriptionTier'])} className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground"><option value="free">Free</option><option value="vip">VIP / Pro</option></select></label>
          </div>
          <Button type="submit" className="mt-4 w-fit">Create admin account</Button>
        </form>
      </div>

      {actionMessage && <p className="mb-4 rounded-md border border-live/30 bg-live/5 p-3 text-sm text-live">{actionMessage}</p>}
      {actionError && <p className="mb-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{actionError}</p>}

      <div className="relative mb-4 max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input type="search" placeholder="Search name or email…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="h-10 w-full rounded-md border border-border bg-surface-elevated pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none" /></div>
      <DataTable columns={columns} rows={data?.data ?? []} rowKey={(u) => u._id} isLoading={isLoading} emptyMessage="No users found." page={data?.meta?.page} totalPages={data?.meta?.totalPages} onPageChange={setPage} />
    </div>
  );
}
