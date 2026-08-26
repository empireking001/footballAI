'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Loader2,
  Users,
  Trophy,
  Shield,
  Settings,
  Users2,
  CalendarDays,
  CreditCard,
} from 'lucide-react';
import { Container } from "@/components/ui/Container";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Leagues', href: '/admin/leagues', icon: Trophy },
  { label: 'Teams', href: '/admin/teams', icon: Users2 },
  { label: 'Matches', href: '/admin/matches', icon: CalendarDays },
  { label: 'Manual picks', href: '/admin/predictions', icon: CalendarDays },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (!isAdmin) {
      router.replace('/dashboard');
    }
  }, [isHydrated, user, isAdmin, router, pathname]);

  if (!isHydrated || !user || !isAdmin) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <Container className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-[220px_1fr]">
      <aside>
        <div className="mb-4 flex items-center gap-2 px-3">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Admin
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted hover:bg-surface-elevated hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-border pt-4">
          <LogoutButton variant="nav" />
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </Container>
  );
}
