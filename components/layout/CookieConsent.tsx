'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const STORAGE_KEY = 'cookie-consent-dismissed';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur">
      <div className="container flex flex-col items-center gap-3 py-4 sm:flex-row sm:justify-between">
        <p className="text-xs text-muted">
          We use a small number of essential cookies to keep you logged in — no third-party
          tracking. See our{' '}
          <Link href="/cookies" className="text-primary hover:underline">
            Cookie Policy
          </Link>
          .
        </p>
        <Button size="sm" onClick={dismiss} className="flex-shrink-0">
          Got it
        </Button>
      </div>
    </div>
  );
}
