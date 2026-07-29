import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { SeoMetaForm } from '@/components/admin/SeoMetaForm';

export default function NewSeoOverridePage() {
  return (
    <div>
      <AdminPageHeader title="New SEO override" />
      <SeoMetaForm />
    </div>
  );
}
