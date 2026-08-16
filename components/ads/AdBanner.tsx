'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { AdSlot, SiteSettings } from '@/types/api';

interface AdBannerProps {
  slotId: string;
  className?: string;
}

function AdMarkup({ slot, className }: { slot: AdSlot; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = slot.code;
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attribute) => {
        newScript.setAttribute(attribute.name, attribute.value);
      });
      newScript.text = oldScript.text;
      oldScript.replaceWith(newScript);
    });

    return () => {
      container.innerHTML = '';
    };
  }, [slot.code]);

  return (
    <aside className={className} aria-label={`${slot.label} advertisement`}>
      <div className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted/70">
        Advertisement
      </div>
      <div ref={containerRef} className="flex min-h-12 items-center justify-center overflow-hidden rounded-lg" />
    </aside>
  );
}

export function AdBanner({ slotId, className }: AdBannerProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;
  const { data } = useQuery({
    queryKey: ['public', 'settings', 'ads'],
    queryFn: async () => (await apiClient.get<{ data: SiteSettings }>('/settings')).data.data,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !isAdmin,
  });

  if (isAdmin) return null;

  const slot = data?.adSlots?.find((candidate) => candidate.slotId === slotId && candidate.isEnabled && candidate.code.trim());
  if (!slot) return null;

  return <AdMarkup slot={slot} className={className} />;
}
