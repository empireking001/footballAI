"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuthStore } from "@/store/authStore";

const NAV_LINKS = [
  { label: "Today", href: "/predictions/today" },
  { label: "Tomorrow", href: "/predictions/tomorrow" },
  { label: "Next 7 days", href: "/predictions/week" },
  { label: "Live", href: "/live" },
  { label: "Naija Matchday", href: "/naija-matchday" },
  { label: "VIP", href: "/predictions/vip" },
  { label: "Leagues", href: "/leagues" },
  { label: "Insights", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
];

export function Header({ siteName = 'Football AI', logoUrl }: { siteName?: string; logoUrl?: string }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" /> : <span className="font-display text-2xl font-bold tracking-tight text-foreground">{siteName}</span>}
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/dashboard">
                  <UserIcon className="h-4 w-4" />
                  {user.name.split(" ")[0]}
                </Link>
              </Button>
              <LogoutButton variant="icon" className="h-9 w-9" />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/register">Sign up free</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md text-foreground lg:hidden"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen((v) => !v)}
        >
          {isMobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </Container>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-border lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-elevated"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                {user ? (
                  <>
                    <Button variant="secondary" asChild>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </Button>
                    <LogoutButton variant="nav" />
                  </>
                ) : (
                  <>
                    <Button variant="secondary" asChild>
                      <Link href="/login">Log in</Link>
                    </Button>
                    <Button variant="primary" asChild>
                      <Link href="/register">Sign up free</Link>
                    </Button>
                  </>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
