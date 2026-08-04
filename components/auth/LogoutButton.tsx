'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/lib/api/auth';

interface LogoutButtonProps {
  className?: string;
  variant?: 'nav' | 'inline' | 'icon';
}

/**
 * Calls the backend to revoke the refresh cookie, clears local auth state
 * regardless of whether that call succeeds (a failed logout request should
 * never leave the user stuck looking logged-in), then sends them home.
 */
export function LogoutButton({ className, variant = 'inline' }: LogoutButtonProps) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
    } catch {
      // Even if the server call fails (expired session, network hiccup),
      // still clear local state so the UI reflects logged-out immediately.
    } finally {
      clearAuth();
      router.push('/');
      router.refresh();
    }
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        aria-label="Log out"
        className={cn(
          'flex items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-elevated hover:text-danger disabled:opacity-50',
          className,
        )}
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  if (variant === 'nav') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-elevated hover:text-danger',
          className,
        )}
      >
        <LogOut className="h-4 w-4" />
        {loading ? 'Logging out…' : 'Log out'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn('text-sm font-medium text-muted hover:text-danger', className)}
    >
      {loading ? 'Logging out…' : 'Log out'}
    </button>
  );
}