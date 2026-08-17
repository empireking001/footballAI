'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { AdSlot } from '@/types/api';

interface SettingsFormValues {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialTwitter: string;
  socialFacebook: string;
  socialInstagram: string;
  socialWhatsapp: string;
  metaTitle: string;
  metaDescription: string;
  announcementEnabled: boolean;
  announcementMessage: string;
  maintenanceEnabled: boolean;
  maintenanceMessage: string;
}

const DEFAULT_AD_SLOTS: AdSlot[] = [
  { slotId: 'global-top', label: 'Global top banner', code: '', isEnabled: false },
  { slotId: 'predictions-top', label: 'Predictions page banner', code: '', isEnabled: false },
  { slotId: 'match-top', label: 'Match page banner', code: '', isEnabled: false },
  { slotId: 'leagues-top', label: 'Leagues page banner', code: '', isEnabled: false },
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adSlots, setAdSlots] = useState<AdSlot[]>(DEFAULT_AD_SLOTS);

  const { register, handleSubmit, reset } = useForm<SettingsFormValues>();

  useEffect(() => {
    apiClient.get('/admin/settings').then(({ data }) => {
      const s = data.data;
      reset({
        siteName: s.siteName ?? '',
        logoUrl: s.logoUrl ?? '',
        faviconUrl: s.faviconUrl ?? '',
        contactEmail: s.contact?.email ?? '',
        contactPhone: s.contact?.phone ?? '',
        contactAddress: s.contact?.address ?? '',
        socialTwitter: s.socialLinks?.twitter ?? '',
        socialFacebook: s.socialLinks?.facebook ?? '',
        socialInstagram: s.socialLinks?.instagram ?? '',
        socialWhatsapp: s.socialLinks?.whatsapp ?? '',
        metaTitle: s.seoDefaults?.metaTitle ?? '',
        metaDescription: s.seoDefaults?.metaDescription ?? '',
        announcementEnabled: s.announcementBanner?.isEnabled ?? false,
        announcementMessage: s.announcementBanner?.message ?? '',
        maintenanceEnabled: s.maintenanceMode?.isEnabled ?? false,
        maintenanceMessage: s.maintenanceMode?.message ?? '',
      });
      setAdSlots(s.adSlots?.length ? s.adSlots : DEFAULT_AD_SLOTS);
      setLoading(false);
    }).catch((requestError) => {
      setError((requestError as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Unable to load site settings.');
      setLoading(false);
    });
  }, [reset]);

  async function onSubmit(values: SettingsFormValues) {
    setSaving(true);
    setError(null);
    try {
      await apiClient.patch('/admin/settings', {
        siteName: values.siteName.trim(),
        logoUrl: values.logoUrl.trim() || undefined,
        faviconUrl: values.faviconUrl.trim() || undefined,
        contact: { email: values.contactEmail.trim() || undefined, phone: values.contactPhone.trim(), address: values.contactAddress.trim() },
        socialLinks: {
          twitter: values.socialTwitter || undefined,
          facebook: values.socialFacebook || undefined,
          instagram: values.socialInstagram || undefined,
          whatsapp: values.socialWhatsapp || undefined,
        },
        seoDefaults: { metaTitle: values.metaTitle, metaDescription: values.metaDescription },
        announcementBanner: { isEnabled: values.announcementEnabled, message: values.announcementMessage },
        maintenanceMode: { isEnabled: values.maintenanceEnabled, message: values.maintenanceMessage },
        adSlots: adSlots.map((slot) => ({ ...slot, slotId: slot.slotId.trim(), label: slot.label.trim() })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (requestError) {
      const response = (requestError as { response?: { data?: { message?: string; details?: Array<{ field?: string; message?: string }> } } }).response?.data;
      const details = response?.details?.map((item) => `${item.field ?? 'field'}: ${item.message ?? 'invalid value'}`).join('; ');
      setError(details ? `${response?.message ?? 'Validation failed'} — ${details}` : response?.message ?? 'Unable to save site settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function updateAdSlot(index: number, patch: Partial<AdSlot>) {
    setAdSlots((current) => current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, ...patch } : slot)));
  }

  function removeAdSlot(index: number) {
    setAdSlots((current) => current.filter((_, slotIndex) => slotIndex !== index));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Site settings"
        subtitle="Changes here reflect across the public site immediately (cache clears on save)."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-3xl flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">General</h2>
            <Input label="Site name" {...register('siteName')} />
            <Input label="Logo URL" {...register('logoUrl')} />
            <Input label="Favicon URL" {...register('faviconUrl')} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">Contact</h2>
            <Input label="Email" type="email" {...register('contactEmail')} />
            <Input label="Phone" {...register('contactPhone')} />
            <Input label="Address" {...register('contactAddress')} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">Social links</h2>
            <Input label="Twitter / X" {...register('socialTwitter')} />
            <Input label="Facebook" {...register('socialFacebook')} />
            <Input label="Instagram" {...register('socialInstagram')} />
            <Input label="WhatsApp" {...register('socialWhatsapp')} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">SEO defaults</h2>
            <Input label="Meta title" {...register('metaTitle')} />
            <Input label="Meta description" {...register('metaDescription')} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">Advertising</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Paste the exact HTML or script supplied by your ad network. Enable a slot only after its code and placement have been checked.</p>
            </div>
            <div className="flex flex-col gap-4">
              {adSlots.map((slot, index) => (
                <div key={`${slot.slotId}-${index}`} className="rounded-lg border border-border bg-surface/50 p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <Input label="Slot ID" value={slot.slotId} onChange={(event) => updateAdSlot(index, { slotId: event.target.value })} />
                    <Input label="Label" value={slot.label} onChange={(event) => updateAdSlot(index, { label: event.target.value })} />
                    <Button type="button" variant="secondary" onClick={() => removeAdSlot(index)} aria-label={`Remove ${slot.label}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={slot.isEnabled} onChange={(event) => updateAdSlot(index, { isEnabled: event.target.checked })} className="h-4 w-4 rounded border-border" />
                    Enable this ad slot
                  </label>
                  <label className="mt-3 block text-sm font-medium text-foreground">
                    Raw HTML / script code
                    <textarea value={slot.code} onChange={(event) => updateAdSlot(index, { code: event.target.value })} rows={6} className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-primary" placeholder="<script>...</script>" />
                  </label>
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" onClick={() => setAdSlots((current) => [...current, { slotId: `custom-${current.length + 1}`, label: 'Custom ad slot', code: '', isEnabled: false }])} className="w-fit">
              <Plus className="mr-2 h-4 w-4" /> Add ad slot
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">Announcement banner</h2>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" {...register('announcementEnabled')} className="h-4 w-4 rounded border-border" />
              Show announcement banner
            </label>
            <Input label="Message" {...register('announcementMessage')} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">Maintenance mode</h2>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" {...register('maintenanceEnabled')} className="h-4 w-4 rounded border-danger" />
              <span className="text-danger">Enable maintenance mode (blocks public API traffic)</span>
            </label>
            <Input label="Maintenance message" {...register('maintenanceMessage')} />
          </CardContent>
        </Card>

        {error && <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm leading-6 text-danger">{error}</div>}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} className="w-fit">
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
          {saved && <span className="text-sm text-live">Saved</span>}
        </div>
      </form>
    </div>
  );
}
