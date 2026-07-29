import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BlogPostForm } from '@/components/admin/BlogPostForm';

export default function NewBlogPostPage() {
  return (
    <div>
      <AdminPageHeader title="New post" />
      <BlogPostForm />
    </div>
  );
}
