import { useEffect, useMemo, useState } from 'react';
import { Calendar, Search, User, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { blogService, BlogCategory, BlogPost } from '@/services/blog.service';
import { setJsonLd, setSeoMeta } from '@/lib/seo';

const fallbackImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80';

function formatDate(value: string | undefined, locale: string, fallback: string) {
  if (!value) return fallback;
  return new Date(value).toLocaleDateString(locale);
}

export default function BlogPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSeoMeta({
      title: t('seo.blog.title'),
      description: t('seo.blog.description'),
      keywords: t('seo.blog.keywords'),
      canonicalUrl: `${window.location.origin}/blog`,
    });
    setJsonLd('blog', {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: t('seo.blog.title'),
      url: `${window.location.origin}/blog`,
      publisher: { '@type': 'Organization', name: 'An Voyages' },
    });
  }, [t]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [postData, categoryData] = await Promise.all([
          blogService.getPublished({
            q: searchQuery || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            lang: i18n.language,
          }),
          blogService.getCategories(i18n.language),
        ]);
        setPosts(postData);
        setCategories(categoryData);
      } finally {
        setLoading(false);
      }
    };

    const timer = window.setTimeout(loadData, 250);
    return () => window.clearTimeout(timer);
  }, [i18n.language, searchQuery, selectedCategory]);

  const featuredPost = useMemo(() => posts.find((post) => post.featured) || posts[0], [posts]);
  const regularPosts = featuredPost ? posts.filter((post) => post.id !== featuredPost.id) : posts;
  const totalCount = categories.reduce((sum, category) => sum + category.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="container-custom mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
              {t('blog.title')}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('blog.subtitle')}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('blog.search_placeholder')}
                className="h-12 pl-12"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-12 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">{t('blog.all_categories', { count: totalCount })}</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <main className="pb-20">
        <div className="container-custom mx-auto px-4 md:px-8">
          {loading ? (
            <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
              {t('blog.loading')}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground">{t('blog.no_results_title')}</h2>
              <p className="mt-2 text-muted-foreground">{t('blog.no_results_hint')}</p>
            </div>
          ) : (
            <div className="space-y-10">
              {featuredPost && (
                <article className="grid overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-[1.05fr_0.95fr]">
                  <Link to={`/blog/${featuredPost.slug}`} className="block min-h-[280px] overflow-hidden">
                    <img
                      src={featuredPost.coverImage || fallbackImage}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-col justify-center p-6 md:p-8">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {featuredPost.category && <Badge>{featuredPost.category}</Badge>}
                      {featuredPost.featured && <Badge variant="secondary">{t('blog.featured')}</Badge>}
                    </div>
                    <Link to={`/blog/${featuredPost.slug}`}>
                      <h2 className="font-display text-3xl font-bold leading-tight text-foreground hover:text-primary">
                        {featuredPost.title}
                      </h2>
                    </Link>
                    {featuredPost.excerpt && (
                      <p className="mt-4 text-muted-foreground">{featuredPost.excerpt}</p>
                    )}
                    <PostMeta
                      post={featuredPost}
                      locale={locale}
                      unpublishedLabel={t('blog.unpublished')}
                      readTimeLabel={t('blog.read_time')}
                      className="mt-5"
                    />
                    <Button asChild variant="hero" className="mt-6 w-fit">
                      <Link to={`/blog/${featuredPost.slug}`}>
                        {t('blog.view_post')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              )}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularPosts.map((post) => (
                  <article key={post.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <Link to={`/blog/${post.slug}`} className="block h-52 overflow-hidden">
                      <img
                        src={post.coverImage || fallbackImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </Link>
                    <div className="p-5">
                      {post.category && <Badge variant="secondary">{post.category}</Badge>}
                      <Link to={`/blog/${post.slug}`}>
                        <h2 className="mt-3 line-clamp-2 font-display text-xl font-bold text-foreground hover:text-primary">
                          {post.title}
                        </h2>
                      </Link>
                      {post.excerpt && (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                      )}
                      <PostMeta
                        post={post}
                        locale={locale}
                        unpublishedLabel={t('blog.unpublished')}
                        readTimeLabel={t('blog.read_time')}
                        className="mt-4"
                        compact
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PostMeta({
  post,
  locale,
  unpublishedLabel,
  readTimeLabel,
  className = '',
  compact = false,
}: {
  post: BlogPost;
  locale: string;
  unpublishedLabel: string;
  readTimeLabel: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 text-sm text-muted-foreground ${className}`}>
      <span className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4" />
        {formatDate(post.publishedAt, locale, unpublishedLabel)}
      </span>
      {!compact && (
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          {post.authorName}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        {readTimeLabel.replace('{{count}}', String(post.readingMinutes))}
      </span>
    </div>
  );
}
