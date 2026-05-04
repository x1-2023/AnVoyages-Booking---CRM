import { useEffect, useState } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/BackButton';
import { blogService, BlogPost } from '@/services/blog.service';
import { setJsonLd, setSeoMeta } from '@/lib/seo';

const fallbackImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80';

function formatDate(value: string | undefined, locale: string) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(locale);
}

export default function BlogPostPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await blogService.getBySlug(slug, i18n.language);
        setPost(data);
        setSeoMeta({
          title: data.seoTitle || `${data.title} | An Voyages`,
          description: data.seoDescription || data.excerpt,
          keywords: data.seoKeywords || data.tags.join(', '),
          canonicalUrl: data.canonicalUrl || `${window.location.origin}/blog/${data.slug}`,
          image: data.ogImage || data.coverImage,
          type: 'article',
        });
        setJsonLd('article', {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title,
          description: data.seoDescription || data.excerpt,
          image: data.ogImage || data.coverImage,
          author: { '@type': 'Person', name: data.authorName },
          publisher: { '@type': 'Organization', name: 'An Voyages' },
          datePublished: data.publishedAt,
          dateModified: data.updatedAt,
          mainEntityOfPage: `${window.location.origin}/blog/${data.slug}`,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [i18n.language, slug]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28">
        <div className="container-custom mx-auto px-4 md:px-8">
          <BackButton to="/blog" label={t('blog.back_to_blog')} className="mb-6" />

          {loading ? (
            <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
              {t('blog.loading')}
            </div>
          ) : !post ? (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <h1 className="font-display text-3xl font-bold text-foreground">{t('blog.post_not_found_title')}</h1>
              <p className="mt-2 text-muted-foreground">{t('blog.post_not_found_hint')}</p>
            </div>
          ) : (
            <article className="mx-auto max-w-4xl pb-20">
              <header>
                <div className="flex flex-wrap gap-2">
                  {post.category && <Badge>{post.category}</Badge>}
                  {post.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
                  {post.title}
                </h1>
                {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {post.authorName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.publishedAt, locale)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {t('blog.read_time', { count: post.readingMinutes })}
                  </span>
                </div>
              </header>

              <img
                src={post.coverImage || fallbackImage}
                alt={post.title}
                className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
              />

              <div
                className="prose prose-lg mt-10 max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-img:rounded-xl prose-iframe:aspect-video prose-iframe:w-full prose-iframe:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
