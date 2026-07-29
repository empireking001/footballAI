import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { fetchApi } from '@/lib/api/server';
import { BlogPostSummary } from '@/types/api';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Football analysis, strategy, and platform updates from the Football AI team.',
};

export default async function BlogPage() {
  const { data } = await fetchApi<BlogPostSummary[]>('/blog?limit=12', { revalidate: 600 });
  const posts = data ?? [];

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <span className="font-mono text-xs uppercase tracking-widest text-primary">Blog</span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Analysis &amp; Insight
          </h1>
        </Container>
      </div>

      <Container className="py-10 sm:py-12">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted">
            No posts published yet — check back soon.
          </div>
        )}
      </Container>
    </>
  );
}
