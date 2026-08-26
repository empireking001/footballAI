import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QueryProvider } from '@/lib/query-provider';
import { AuthInitializer } from '@/components/providers/AuthInitializer';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { AdBanner } from '@/components/ads/AdBanner';
import { fetchApi } from '@/lib/api/server';
import { SiteSettings } from '@/types/api';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Football AI — Live Fixtures and Manual Picks',
    template: '%s | Football AI',
  },
  description:
    'Live football fixtures, scores, odds, leagues, and administrator-entered picks — 1X2, BTTS, Over/Under, correct score, and more.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = await fetchApi<SiteSettings>('/settings', { cache: 'no-store' });
  const siteName = settings?.siteName?.trim() || 'Football AI';

  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthInitializer />
          <CookieConsent />
          <div className="flex min-h-screen flex-col">
            <Header siteName={siteName} logoUrl={settings?.logoUrl} />
            <AdBanner slotId="global-top" className="mx-auto w-full max-w-7xl px-4 pt-4" />
            <main className="flex-1">{children}</main>
            <Footer siteName={siteName} />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
