type MetaDefinition = {
  name?: string;
  property?: string;
  content: string;
};

function upsertMeta(selector: string, attributes: MetaDefinition) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    if (attributes.name) element.setAttribute('name', attributes.name);
    if (attributes.property) element.setAttribute('property', attributes.property);
    document.head.appendChild(element);
  }

  element.setAttribute('content', attributes.content);
}

function upsertCanonical(url?: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!url) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', url);
}

export function setSeoMeta({
  title,
  description,
  keywords,
  canonicalUrl,
  image,
  type = 'website',
}: {
  title: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  image?: string;
  type?: 'website' | 'article';
}) {
  document.title = title;

  if (description) {
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  }

  if (keywords) {
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords });
  }

  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
  upsertMeta('meta[name="twitter:card"]', {
    name: 'twitter:card',
    content: image ? 'summary_large_image' : 'summary',
  });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });

  if (image) {
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
  }

  upsertCanonical(canonicalUrl);
}

export function setJsonLd(id: string, data: Record<string, unknown>) {
  const scriptId = `jsonld-${id}`;
  let element = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!element) {
    element = document.createElement('script');
    element.id = scriptId;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}
