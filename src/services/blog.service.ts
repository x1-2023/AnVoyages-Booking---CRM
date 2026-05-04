import { api } from '@/lib/api';

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  titleVi?: string;
  titleEn?: string;
  slug: string;
  slugVi?: string;
  slugEn?: string;
  excerpt?: string;
  excerptVi?: string;
  excerptEn?: string;
  contentHtml: string;
  contentHtmlVi?: string;
  contentHtmlEn?: string;
  coverImage?: string;
  category?: string;
  categoryVi?: string;
  categoryEn?: string;
  tags: string[];
  tagsVi?: string[];
  tagsEn?: string[];
  authorName: string;
  status: BlogStatus;
  statusVi?: BlogStatus;
  statusEn?: BlogStatus;
  featured: boolean;
  readingMinutes: number;
  seoTitle?: string;
  seoTitleVi?: string;
  seoTitleEn?: string;
  seoDescription?: string;
  seoDescriptionVi?: string;
  seoDescriptionEn?: string;
  seoKeywords?: string;
  seoKeywordsVi?: string;
  seoKeywordsEn?: string;
  canonicalUrl?: string;
  ogImage?: string;
  publishedAt?: string;
  publishedAtVi?: string;
  publishedAtEn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  name: string;
  count: number;
}

export type BlogPostPayload = Omit<
  BlogPost,
  'id' | 'slug' | 'tags' | 'authorName' | 'status' | 'featured' | 'readingMinutes' | 'createdAt' | 'updatedAt'
> & {
  slug?: string;
  tags?: string[];
  authorName?: string;
  status?: BlogStatus;
  featured?: boolean;
  readingMinutes?: number;
};

export const blogService = {
  async getPublished(params?: { q?: string; category?: string; lang?: string }) {
    const response = await api.get('/blog', { params });
    return response.data as BlogPost[];
  },

  async getCategories(lang?: string) {
    const response = await api.get('/blog/categories', { params: { lang } });
    return response.data as BlogCategory[];
  },

  async getBySlug(slug: string, lang?: string) {
    const response = await api.get(`/blog/slug/${slug}`, { params: { lang } });
    return response.data as BlogPost;
  },

  async getAdminPosts(params?: { status?: string; q?: string }) {
    const response = await api.get('/blog/admin/all', { params });
    return response.data as BlogPost[];
  },

  async getAdminPost(id: string) {
    const response = await api.get(`/blog/admin/${id}`);
    return response.data as BlogPost;
  },

  async create(data: BlogPostPayload) {
    const response = await api.post('/blog', data);
    return response.data as BlogPost;
  },

  async update(id: string, data: Partial<BlogPostPayload>) {
    const response = await api.patch(`/blog/${id}`, data);
    return response.data as BlogPost;
  },

  async delete(id: string) {
    const response = await api.delete(`/blog/${id}`);
    return response.data;
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/media/blog-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data as { url: string; filename: string; size: number; mimeType: string };
  },
};
