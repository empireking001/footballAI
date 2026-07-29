import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { BlogPostSummary } from '@/types/api';

export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-primary/40">
        <div className="relative aspect-[16/9] w-full bg-surface-elevated">
          {post.coverImageUrl ? (
            <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-2xl text-muted">FA</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          {post.category && (
            <span className="mb-2 w-fit text-xs font-semibold uppercase tracking-wide text-primary">
              {post.category}
            </span>
          )}
          <h3 className="font-display text-lg font-bold leading-snug tracking-tight">{post.title}</h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{post.excerpt}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <span>{post.author.name}</span>
            {post.publishedAt && (
              <span>{new Date(post.publishedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
