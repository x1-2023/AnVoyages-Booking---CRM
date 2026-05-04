import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const siteUrl = process.env.SITE_URL || 'http://localhost:8080';
const apiUrl = process.env.VITE_API_URL || 'http://localhost:3000/api';

async function getJson(path) {
  try {
    const response = await fetch(`${apiUrl}${path}`);
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, lastmod, priority = '0.7', changefreq = 'weekly') {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

const [posts, products, locations] = await Promise.all([
  getJson('/blog'),
  getJson('/properties?isActive=true'),
  getJson('/locations?isActive=true'),
]);

const entries = [
  urlEntry(`${siteUrl}/`, new Date(), '1.0', 'daily'),
  urlEntry(`${siteUrl}/properties`, new Date(), '0.9', 'daily'),
  urlEntry(`${siteUrl}/destinations`, new Date(), '0.8', 'weekly'),
  urlEntry(`${siteUrl}/blog`, new Date(), '0.8', 'weekly'),
  urlEntry(`${siteUrl}/contact`, new Date(), '0.5', 'monthly'),
  ...locations.map((location) =>
    urlEntry(`${siteUrl}/destinations/${location.slug || location.id}`, location.updatedAt, '0.8', 'weekly'),
  ),
  ...products.map((product) =>
    urlEntry(`${siteUrl}/property/${product.id}`, product.updatedAt, '0.8', 'weekly'),
  ),
  ...posts.map((post) =>
    urlEntry(`${siteUrl}/blog/${post.slug}`, post.updatedAt || post.publishedAt, '0.7', 'weekly'),
  ),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(join(publicDir, 'robots.txt'), robots, 'utf8');

console.log(`Generated sitemap with ${entries.length} URLs for ${siteUrl}`);
