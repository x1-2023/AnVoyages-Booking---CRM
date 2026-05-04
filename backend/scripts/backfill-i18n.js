const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const textMap = new Map([
  ['Hạ Long', 'Ha Long'],
  ['Cát Bà', 'Cat Ba'],
  ['Cô Tô', 'Co To'],
  ['Quan Lạn', 'Quan Lan'],
  ['Khách sạn', 'Hotel'],
  ['Du thuyền', 'Cruise'],
  ['Thuê xe', 'Car rental'],
  ['Trekking', 'Trekking'],
  ['Xe Điện', 'Electric shuttle'],
  ['Ăn 3 Bữa', '3 meals included'],
  ['Hướng Dẫn Viên', 'Tour guide'],
  ['Ăn sáng', 'Breakfast included'],
  ['Kayak', 'Kayak'],
  ['Wifi', 'Wi-Fi'],
  ['Hồ bơi', 'Swimming pool'],
  ['Đưa đón', 'Transfer'],
  ['Tour biển Quan Lạn 2 ngày 1 đêm', 'Quan Lan beach tour 2 days 1 night'],
  ['Gói tour ngắn ngày phù hợp nhóm bạn và gia đình muốn đi cuối tuần.', 'A short package tour for friends and families planning a weekend trip.'],
]);

const phraseMap = [
  [/Hạ Long/g, 'Ha Long'],
  [/Cát Bà/g, 'Cat Ba'],
  [/Cô Tô/g, 'Co To'],
  [/Quan Lạn/g, 'Quan Lan'],
  [/du thuyền/gi, 'cruise'],
  [/khách sạn/gi, 'hotel'],
  [/homestay/gi, 'homestay'],
  [/tour/gi, 'tour'],
  [/combo/gi, 'package'],
  [/ngày/gi, 'days'],
  [/đêm/gi, 'nights'],
  [/gia đình/gi, 'families'],
  [/nhóm bạn/gi, 'groups of friends'],
  [/cuối tuần/gi, 'weekend'],
  [/hướng dẫn viên/gi, 'tour guide'],
  [/ăn sáng/gi, 'breakfast'],
  [/ăn 3 bữa/gi, '3 meals included'],
  [/xe điện/gi, 'electric shuttle'],
];

function translateText(value) {
  if (!value) return value;
  const exact = textMap.get(value.trim());
  if (exact) return exact;
  let output = value;
  for (const [pattern, replacement] of phraseMap) {
    output = output.replace(pattern, replacement);
  }
  return output === value ? value : output;
}

function stripHtml(value = '') {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

function parseJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function makeSeoTitle(name, suffix = 'An Voyages') {
  return `${name} | ${suffix}`.slice(0, 70);
}

function makeSeoDescription(description, fallback) {
  const source = stripHtml(description || fallback || '');
  return source.slice(0, 160);
}

async function main() {
  const locations = await prisma.location.findMany();
  for (const location of locations) {
    const nameEn = location.nameEn || translateText(location.name);
    await prisma.location.update({
      where: { id: location.id },
      data: {
        nameVi: location.nameVi || location.name,
        nameEn,
        descriptionVi: location.descriptionVi || location.description,
        descriptionEn: location.descriptionEn || translateText(location.description),
        seoTitleVi: location.seoTitleVi || location.seoTitle || makeSeoTitle(location.name),
        seoTitleEn: location.seoTitleEn || makeSeoTitle(nameEn),
        seoDescriptionVi: location.seoDescriptionVi || location.seoDescription || makeSeoDescription(location.description, location.name),
        seoDescriptionEn: location.seoDescriptionEn || makeSeoDescription(translateText(location.description), nameEn),
      },
    });
  }

  const categories = await prisma.productCategory.findMany();
  for (const category of categories) {
    await prisma.productCategory.update({
      where: { id: category.id },
      data: {
        nameVi: category.nameVi || category.name,
        nameEn: category.nameEn || translateText(category.name),
        descriptionVi: category.descriptionVi || category.description,
        descriptionEn: category.descriptionEn || translateText(category.description),
      },
    });
  }

  const properties = await prisma.property.findMany({ include: { location: true } });
  for (const property of properties) {
    const nameEn = property.nameEn || translateText(property.name);
    const amenitiesVi = parseJsonArray(property.amenitiesVi || property.amenities);
    const amenitiesEn = parseJsonArray(property.amenitiesEn);
    await prisma.property.update({
      where: { id: property.id },
      data: {
        nameVi: property.nameVi || property.name,
        nameEn,
        descriptionVi: property.descriptionVi || property.description,
        descriptionEn: property.descriptionEn || translateText(property.description),
        amenitiesVi: JSON.stringify(amenitiesVi),
        amenitiesEn: JSON.stringify(amenitiesEn.length ? amenitiesEn : amenitiesVi.map(translateText)),
        seoTitleVi: property.seoTitleVi || makeSeoTitle(property.name),
        seoTitleEn: property.seoTitleEn || makeSeoTitle(nameEn),
        seoDescriptionVi: property.seoDescriptionVi || makeSeoDescription(property.description, property.name),
        seoDescriptionEn: property.seoDescriptionEn || makeSeoDescription(translateText(property.description), nameEn),
        seoKeywordsVi: property.seoKeywordsVi || [property.name, property.location?.name, property.type, 'An Voyages'].filter(Boolean).join(', '),
        seoKeywordsEn: property.seoKeywordsEn || [nameEn, translateText(property.location?.name), property.type, 'An Voyages'].filter(Boolean).join(', '),
      },
    });
  }

  const posts = await prisma.blogPost.findMany();
  for (const post of posts) {
    const titleEn = post.titleEn || translateText(post.title);
    const contentHtmlEn = post.contentHtmlEn || post.contentHtml;
    await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        titleVi: post.titleVi || post.title,
        titleEn,
        slugVi: post.slugVi || post.slug,
        slugEn: post.slugEn || slugify(titleEn || post.slug),
        excerptVi: post.excerptVi || post.excerpt,
        excerptEn: post.excerptEn || translateText(post.excerpt),
        contentHtmlVi: post.contentHtmlVi || post.contentHtml,
        contentHtmlEn,
        categoryVi: post.categoryVi || post.category,
        categoryEn: post.categoryEn || translateText(post.category),
        tagsVi: post.tagsVi || post.tags,
        tagsEn: post.tagsEn || JSON.stringify(parseJsonArray(post.tags).map(translateText)),
        statusVi: post.statusVi || post.status,
        statusEn: post.statusEn || post.status,
        publishedAtVi: post.publishedAtVi || post.publishedAt,
        publishedAtEn: post.publishedAtEn || post.publishedAt,
        seoTitleVi: post.seoTitleVi || post.seoTitle || makeSeoTitle(post.title),
        seoTitleEn: post.seoTitleEn || makeSeoTitle(titleEn),
        seoDescriptionVi: post.seoDescriptionVi || post.seoDescription || makeSeoDescription(post.contentHtml, post.title),
        seoDescriptionEn: post.seoDescriptionEn || makeSeoDescription(contentHtmlEn, titleEn),
        seoKeywordsVi: post.seoKeywordsVi || post.seoKeywords,
        seoKeywordsEn: post.seoKeywordsEn || translateText(post.seoKeywords),
      },
    });
  }

  console.log(`Backfilled ${locations.length} locations, ${categories.length} categories, ${properties.length} products, ${posts.length} blog posts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
