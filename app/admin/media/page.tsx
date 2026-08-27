'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Loader2, Copy, Check } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';

interface MediaAsset {
  _id: string;
  url: string;
  publicId: string;
  resourceType: string;
  format?: string;
  bytes?: number;
}

export default function AdminMediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: MediaAsset[] }>('/admin/media', { params: { limit: 60 } });
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/media/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'media'] }),
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiClient.post('/admin/media', formData);
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleCopy(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <AdminPageHeader title="Media library" subtitle="Upload images for teams, leagues, fixtures, and site settings." />

      <div className="mb-6">
        <input ref={fileInputRef} type="file" accept="image/*,video/mp4" className="hidden" onChange={handleFileChange} />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload file'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((asset) => (
            <Card key={asset._id} className="overflow-hidden">
              <div className="relative aspect-square bg-surface-elevated">
                {asset.resourceType === 'image' ? (
                  <Image src={asset.url} alt="" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    {asset.format?.toUpperCase() ?? 'FILE'}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-2">
                <button
                  type="button"
                  onClick={() => handleCopy(asset.url, asset._id)}
                  className="flex items-center gap-1 text-xs text-muted hover:text-foreground"
                >
                  {copiedId === asset._id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedId === asset._id ? 'Copied' : 'Copy URL'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(asset._id)}
                  disabled={deleteMutation.isPending}
                  className="text-muted hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted">
          No media uploaded yet.
        </div>
      )}
    </div>
  );
}
