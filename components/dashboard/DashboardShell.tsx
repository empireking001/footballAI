'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Loader2,
  LayoutDashboard,
  Bookmark,
  CreditCard,
  Gift,
  Heart,
  Settings,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Saved', href: '/dashboard/saved', icon: Bookmark },
  { label: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  { label: 'Referrals', href: '/dashboard/referrals', icon: Gift },
  { label: 'Favorites', href: '/dashboard/favorites', icon: Heart },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isHydrated, user, router, pathname]);

  if (!isHydrated || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <Container className="grid grid-cols-1 gap-8 py-8 pb-24 sm:py-10 lg:grid-cols-[220px_1fr] lg:pb-10">
      <aside className="hidden lg:block">
        <nav className="sticky top-24 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
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

      {/* Mobile bottom nav — dashboard is the one app-like surface on the site */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                active ? "text-primary" : "text-muted",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </Container>
  );
}
