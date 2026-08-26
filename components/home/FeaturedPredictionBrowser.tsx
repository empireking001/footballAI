'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Prediction } from '@/types/api';
import { PredictionCard } from '@/components/predictions/PredictionCard';

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'week', label: 'This week' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function FeaturedPredictionBrowser({
  predictions,
}: {
  predictions: Record<TabKey, Prediction[]>;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const activePredictions = predictions[activeTab] ?? [];

  return (
    <section className="border-y border-border bg-surface/40 py-10 sm:py-14">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Curated feed</span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight">Featured manual picks</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">Browse administrator-entered picks by kickoff date. Featured status and VIP access are curated by the Football AI team.</p>
          </div>
          <Link href="/predictions/today" className="text-sm font-semibold text-primary hover:underline">View all picks</Link>
        </div>

        <div className="mt-7 flex gap-2 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activePredictions.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-border px-6 py-12 text-center text-sm text-muted">No featured manual picks are available for this date window yet.</div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activePredictions.map((prediction) => (
              <div key={prediction._id} className="relative">
                <div className={prediction.tier === 'vip' ? 'pointer-events-none select-none blur-[3px]' : undefined}>
                  <PredictionCard prediction={prediction} />
                </div>
                {prediction.tier === 'vip' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-surface/45 p-5 text-center backdrop-blur-[1px]">
                    <div className="rounded-lg border border-primary/30 bg-background/95 p-5 shadow-lg">
                      <p className="font-display text-lg font-bold uppercase tracking-tight">VIP manual pick</p>
                      <p className="mt-2 text-sm text-muted">Unlock the full pick and supporting note for this featured match.</p>
                      <Link href="/pricing" className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Upgrade to VIP</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
