import type { Metadata } from 'next';
import { Big_Shoulders, Sora, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QueryProvider } from '@/lib/query-provider';
import { AuthInitializer } from '@/components/providers/AuthInitializer';
import { CookieConsent } from '@/components/layout/CookieConsent';
import './globals.css';

// Condensed, bold, broadcast-scoreboard energy — used sparingly for
// headlines, scores, and section eyebrows, never for body copy.
const displayFont = Big_Shoulders({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

// Clean geometric body face — carries all reading copy.
const bodyFont = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

// Tabular data face for odds, probabilities, timers, scorelines — the
// "live data feed" texture that reinforces the terminal concept.
const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

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
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <body>
        <QueryProvider>
          <AuthInitializer />
          <CookieConsent />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
