import Image from 'next/image';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { fetchApi } from '@/lib/api/server';
import { BlogPostSummary } from '@/types/api';

interface BlogPostDetail extends BlogPostSummary {
  content: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  return fetchApi<BlogPostDetail>(`/blog/${slug}`, { revalidate: 300 });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getPost(slug);
  if (!data) return { title: 'Blog post' };
  return { title: data.title, description: data.excerpt };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: post } = await getPost(slug);

  if (!post) {
    return <Container className="py-24 text-center text-sm text-muted">Post not found.</Container>;
  }

  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);

  return (
    <article>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container className="max-w-3xl">
          {post.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {post.category}
            </span>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted">
            <span>{post.author.name}</span>
            {post.publishedAt && (
              <>
                <span aria-hidden>·</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>
        </Container>
      </div>

      {post.coverImageUrl && (
        <div className="relative aspect-[21/9] w-full bg-surface-elevated">
          <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <Container className="max-w-3xl py-10 sm:py-12">
        <div className="flex flex-col gap-5 text-base leading-relaxed text-foreground/90">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Container>
    </article>
  );
}
