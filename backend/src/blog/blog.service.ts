import { Injectable, NotFoundException } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBlogPostDto) {
    const slug = await this.ensureUniqueSlug(dto.slug || dto.slugVi || dto.titleVi || dto.title);
    const data = this.toPrismaData(dto, slug);

    return this.parsePost(
      await this.prisma.blogPost.create({
        data,
      }),
    );
  }

  async findAll(params: { status?: string; q?: string; category?: string; lang?: string; publicOnly?: boolean }) {
    const where: any = {};
    const lang = this.normalizeLang(params.lang);

    if (params.publicOnly) {
      if (lang === 'en') {
        where.statusEn = 'published';
        where.publishedAtEn = { not: null };
      } else {
        where.statusVi = 'published';
        where.publishedAtVi = { not: null };
      }
    } else if (params.status && params.status !== 'all') {
      where.status = params.status;
    }

    if (params.category && params.category !== 'all') {
      where.OR = [
        { category: params.category },
        { categoryVi: params.category },
        { categoryEn: params.category },
      ];
    }

    if (params.q) {
      const search = [
        { title: { contains: params.q } },
        { titleVi: { contains: params.q } },
        { titleEn: { contains: params.q } },
        { excerpt: { contains: params.q } },
        { excerptVi: { contains: params.q } },
        { excerptEn: { contains: params.q } },
        { category: { contains: params.q } },
        { categoryVi: { contains: params.q } },
        { categoryEn: { contains: params.q } },
        { seoKeywords: { contains: params.q } },
        { seoKeywordsVi: { contains: params.q } },
        { seoKeywordsEn: { contains: params.q } },
      ];
      where.OR = where.OR ? [...where.OR, ...search] : search;
    }

    const posts = await this.prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return posts.map((post) => this.parsePost(post, lang));
  }

  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return this.parsePost(post);
  }

  async findPublishedBySlug(slug: string, lang?: string) {
    const normalizedLang = this.normalizeLang(lang);
    const post = await this.prisma.blogPost.findFirst({
      where: {
        OR: [{ slug }, { slugVi: slug }, { slugEn: slug }],
        ...(normalizedLang === 'en'
          ? { statusEn: 'published', publishedAtEn: { not: null } }
          : { statusVi: 'published', publishedAtVi: { not: null } }),
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return this.parsePost(post, normalizedLang);
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const current = await this.prisma.blogPost.findUnique({ where: { id } });

    if (!current) {
      throw new NotFoundException('Blog post not found');
    }

    const slugSource = dto.slug || (dto.title && dto.title !== current.title ? dto.title : undefined);
    const slug = slugSource ? await this.ensureUniqueSlug(slugSource, id) : undefined;
    const data = this.toPrismaData(dto, slug, current.status);

    return this.parsePost(
      await this.prisma.blogPost.update({
        where: { id },
        data,
      }),
    );
  }

  async remove(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    await this.prisma.blogPost.delete({ where: { id } });

    return { message: 'Blog post deleted successfully' };
  }

  async getCategories(lang?: string) {
    const normalizedLang = this.normalizeLang(lang);
    const posts = await this.prisma.blogPost.findMany({
      where: normalizedLang === 'en'
        ? { statusEn: 'published', categoryEn: { not: null } }
        : { statusVi: 'published', categoryVi: { not: null } },
      select: { category: true, categoryVi: true, categoryEn: true },
    });

    const counts = new Map<string, number>();
    posts.forEach((post) => {
      const category = normalizedLang === 'en' ? post.categoryEn || post.category : post.categoryVi || post.category;
      if (!category) return;
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }

  private toPrismaData(dto: Partial<CreateBlogPostDto>, slug?: string, currentStatus?: string) {
    const status = dto.status || currentStatus;
    const shouldPublish = status === 'published';
    const contentHtml = dto.contentHtml === undefined ? undefined : this.sanitizeContentHtml(dto.contentHtml);
    const contentHtmlVi = dto.contentHtmlVi === undefined ? undefined : this.sanitizeContentHtml(dto.contentHtmlVi);
    const contentHtmlEn = dto.contentHtmlEn === undefined ? undefined : this.sanitizeContentHtml(dto.contentHtmlEn);
    const data: any = {
      ...dto,
      contentHtml,
      contentHtmlVi,
      contentHtmlEn,
      tags: dto.tags ? JSON.stringify(dto.tags) : undefined,
      tagsVi: dto.tagsVi ? JSON.stringify(dto.tagsVi) : undefined,
      tagsEn: dto.tagsEn ? JSON.stringify(dto.tagsEn) : undefined,
      readingMinutes: dto.readingMinutes || this.estimateReadingMinutes(contentHtmlEn || contentHtmlVi || contentHtml || ''),
    };

    if (slug) {
      data.slug = slug;
    }

    if (contentHtml && !dto.excerpt) {
      data.excerpt = this.makeExcerpt(contentHtml);
    }

    if (contentHtmlVi && !dto.excerptVi) {
      data.excerptVi = this.makeExcerpt(contentHtmlVi);
    }

    if (contentHtmlEn && !dto.excerptEn) {
      data.excerptEn = this.makeExcerpt(contentHtmlEn);
    }

    if (shouldPublish && currentStatus !== 'published') {
      data.publishedAt = new Date();
    }

    if (status && status !== 'published') {
      data.publishedAt = null;
    }

    if (dto.statusVi === 'published') {
      data.publishedAtVi = new Date();
    } else if (dto.statusVi && dto.statusVi !== 'published') {
      data.publishedAtVi = null;
    }

    if (dto.statusEn === 'published') {
      data.publishedAtEn = new Date();
    } else if (dto.statusEn && dto.statusEn !== 'published') {
      data.publishedAtEn = null;
    }

    return data;
  }

  private parsePost(post: any, lang?: string) {
    const normalizedLang = this.normalizeLang(lang);
    const localized = normalizedLang === 'en'
      ? {
          title: post.titleEn || post.title,
          slug: post.slugEn || post.slug,
          excerpt: post.excerptEn || post.excerpt,
          contentHtml: post.contentHtmlEn || post.contentHtml,
          category: post.categoryEn || post.category,
          tags: post.tagsEn ? JSON.parse(post.tagsEn) : post.tags ? JSON.parse(post.tags) : [],
          status: post.statusEn || post.status,
          seoTitle: post.seoTitleEn || post.seoTitle,
          seoDescription: post.seoDescriptionEn || post.seoDescription,
          seoKeywords: post.seoKeywordsEn || post.seoKeywords,
          publishedAt: post.publishedAtEn || post.publishedAt,
        }
      : {
          title: post.titleVi || post.title,
          slug: post.slugVi || post.slug,
          excerpt: post.excerptVi || post.excerpt,
          contentHtml: post.contentHtmlVi || post.contentHtml,
          category: post.categoryVi || post.category,
          tags: post.tagsVi ? JSON.parse(post.tagsVi) : post.tags ? JSON.parse(post.tags) : [],
          status: post.statusVi || post.status,
          seoTitle: post.seoTitleVi || post.seoTitle,
          seoDescription: post.seoDescriptionVi || post.seoDescription,
          seoKeywords: post.seoKeywordsVi || post.seoKeywords,
          publishedAt: post.publishedAtVi || post.publishedAt,
        };

    return {
      ...post,
      ...localized,
      tags: localized.tags,
      tagsVi: post.tagsVi ? JSON.parse(post.tagsVi) : [],
      tagsEn: post.tagsEn ? JSON.parse(post.tagsEn) : [],
    };
  }

  private normalizeLang(lang?: string) {
    return lang?.toLowerCase().startsWith('en') ? 'en' : 'vi';
  }

  private async ensureUniqueSlug(value: string, ignoreId?: string) {
    const base = this.slugify(value) || `bai-viet-${Date.now()}`;
    let slug = base;
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.blogPost.findUnique({ where: { slug } });

      if (!existing || existing.id === ignoreId) {
        return slug;
      }

      slug = `${base}-${suffix}`;
      suffix += 1;
    }
  }

  private slugify(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 160);
  }

  private estimateReadingMinutes(contentHtml: string) {
    const text = this.stripHtml(contentHtml);
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
  }

  private makeExcerpt(contentHtml: string) {
    return this.stripHtml(contentHtml).slice(0, 220);
  }

  private stripHtml(value: string) {
    return value
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private sanitizeContentHtml(value: string) {
    return sanitizeHtml(value || '', {
      allowedTags: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'blockquote',
        'ul',
        'ol',
        'li',
        'a',
        'img',
        'figure',
        'figcaption',
        'iframe',
        'div',
        'span',
        'pre',
        'code',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel', 'title'],
        img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
        iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
        div: ['class'],
        figure: ['class'],
        figcaption: ['class'],
        span: ['class'],
        code: ['class'],
        pre: ['class'],
      },
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'],
      transformTags: {
        a: sanitizeHtml.simpleTransform('a', {
          rel: 'noopener noreferrer',
          target: '_blank',
        }),
        img: sanitizeHtml.simpleTransform('img', {
          loading: 'lazy',
        }),
      },
    }).trim();
  }
}
