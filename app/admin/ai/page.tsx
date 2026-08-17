'use client';

import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { AiAudience, AiSettings } from '@/types/api';

const DEFAULT_AI_SETTINGS: AiSettings = {
  isEnabled: true,
  audience: 'both',
  showConfidence: true,
  showMarkets: true,
  showExplanation: true,
  showAssistant: true,
};

const TOGGLES: { key: keyof Pick<AiSettings, 'showConfidence' | 'showMarkets' | 'showExplanation' | 'showAssistant'>; title: string; description: string }[] = [
  { key: 'showConfidence', title: 'Confidence score', description: 'Display the model confidence percentage on match cards and match details.' },
  { key: 'showMarkets', title: 'Market selections', description: 'Display 1X2, BTTS, over/under, double chance, and correct-score markets.' },
  { key: 'showExplanation', title: 'AI explanation', description: 'Display the written reasoning, historical comparison, and key factors.' },
  { key: 'showAssistant', title: 'Match Assistant', description: 'Allow eligible users to ask follow-up questions about the stored match analysis.' },
];

export default function AdminAiPage() {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<{ data: AiSettings }>('/admin/ai/settings').then(({ data }) => {
      setSettings({ ...DEFAULT_AI_SETTINGS, ...data.data });
      setLoading(false);
    }).catch(() => {
      setError('Unable to load AI settings from the backend.');
      setLoading(false);
    });
  }, []);

  async function saveSettings() {
    setSaving(true);
    setError(null);
    try {
      const { data } = await apiClient.patch<{ data: AiSettings }>('/admin/ai/settings', settings);
      setSettings({ ...DEFAULT_AI_SETTINGS, ...data.data });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message ?? 'Unable to save AI settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>;

  return (
    <div>
      <AdminPageHeader
        title="AI control centre"
        subtitle="Control whether AI analysis appears across fixtures, who can see it, and which AI sections are displayed. Manual predictions remain available from every match editor."
      />

      <div className="flex max-w-3xl flex-col gap-6">
        <Card className={settings.isEnabled ? 'border-primary/30 bg-primary/[0.04]' : 'border-danger/30 bg-danger/[0.04]'}>
          <CardContent className="pt-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className={settings.isEnabled ? 'mt-1 h-5 w-5 text-primary' : 'mt-1 h-5 w-5 text-danger'} />
                <div>
                  <h2 className="font-display text-lg font-bold uppercase tracking-tight">Show AI analysis across matches</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">Turn this off to keep fixtures and kickoff information visible while hiding predictions, confidence, markets, explanations, and the assistant from public users.</p>
                </div>
              </div>
              <button type="button" onClick={() => setSettings((current) => ({ ...current, isEnabled: !current.isEnabled }))} className={`relative h-7 w-14 flex-shrink-0 rounded-full transition-colors ${settings.isEnabled ? 'bg-primary' : 'bg-danger/70'}`} aria-pressed={settings.isEnabled}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${settings.isEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">Who can see the AI analysis?</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Choose exactly which audience receives the AI layer. The underlying fixture remains visible to everyone.</p>
            </div>
            <select value={settings.audience} onChange={(event) => setSettings((current) => ({ ...current, audience: event.target.value as AiAudience }))} className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground">
              <option value="free">Free users only</option>
              <option value="vip">VIP users only</option>
              <option value="both">Free and VIP users</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">AI sections</h2>
              <p className="mt-1 text-sm leading-6 text-muted">These controls affect the visible AI components across match cards and match details.</p>
            </div>
            {TOGGLES.map((toggle) => (
              <label key={toggle.key} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                <span><span className="block text-sm font-semibold text-foreground">{toggle.title}</span><span className="mt-1 block text-xs leading-5 text-muted">{toggle.description}</span></span>
                <input type="checkbox" checked={settings[toggle.key]} onChange={(event) => setSettings((current) => ({ ...current, [toggle.key]: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-border" />
              </label>
            ))}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex items-center gap-3">
          <Button type="button" onClick={() => void saveSettings()} disabled={saving} className="w-fit">{saving ? 'Saving AI settings…' : 'Save AI settings'}</Button>
          {saved && <span className="text-sm text-live">AI settings saved</span>}
        </div>
      </div>
    </div>
  );
}
