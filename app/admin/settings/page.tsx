'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';

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

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      setLoading(false);
    });
  }, [reset]);

  async function onSubmit(values: SettingsFormValues) {
    setSaving(true);
    try {
      await apiClient.patch('/admin/settings', {
        siteName: values.siteName,
        logoUrl: values.logoUrl || undefined,
        faviconUrl: values.faviconUrl || undefined,
        contact: { email: values.contactEmail, phone: values.contactPhone, address: values.contactAddress },
        socialLinks: {
          twitter: values.socialTwitter || undefined,
          facebook: values.socialFacebook || undefined,
          instagram: values.socialInstagram || undefined,
          whatsapp: values.socialWhatsapp || undefined,
        },
        seoDefaults: { metaTitle: values.metaTitle, metaDescription: values.metaDescription },
        announcementBanner: { isEnabled: values.announcementEnabled, message: values.announcementMessage },
        maintenanceMode: { isEnabled: values.maintenanceEnabled, message: values.maintenanceMessage },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
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

      <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-6">
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
