import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QueryProvider } from '@/lib/query-provider';
import { AuthInitializer } from '@/components/providers/AuthInitializer';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { AdBanner } from '@/components/ads/AdBanner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Football AI — AI-Powered Football Predictions',
    template: '%s | Football AI',
  },
  description:
    'AI-powered football predictions, match analysis, and statistics — 1X2, BTTS, Over/Under, correct score, and more, backed by a statistical model with a tracked accuracy record.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthInitializer />
          <CookieConsent />
          <div className="flex min-h-screen flex-col">
            <Header />
            <AdBanner slotId="global-top" className="mx-auto w-full max-w-7xl px-4 pt-4" />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
