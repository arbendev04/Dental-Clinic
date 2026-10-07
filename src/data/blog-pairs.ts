import fs from 'node:fs';
import path from 'node:path';

// Lee el frontmatter de los artículos directo del disco (sin `astro:content`)
// porque lo usan tanto astro.config.mjs (sitemap) como el Layout (hreflang):
// una sola fuente de verdad para emparejar artículos ES ↔ EN.

export type BlogLang = 'es' | 'en';

export interface BlogMeta {
  lang: BlogLang;
  slug: string;
  translationKey: string;
  pubDate: string;
  updatedDate?: string;
}

const BLOG_DIR = path.resolve(process.cwd(), 'src/content/blog');

export function blogPath(lang: BlogLang, slug: string): string {
  return lang === 'en' ? `/en/blog/${slug}/` : `/blog/${slug}/`;
}

function field(frontmatter: string, key: string): string | undefined {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
  return match?.[1].replace(/^["']|["']$/g, '').split('#')[0].trim();
}

function readLang(lang: BlogLang): BlogMeta[] {
  const dir = path.join(BLOG_DIR, lang);
  if (!fs.existsSync(dir)) return [];
  const metas: BlogMeta[] = [];
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
    if (!frontmatter || field(frontmatter, 'draft') === 'true') continue;
    const translationKey = field(frontmatter, 'translationKey');
    const pubDate = field(frontmatter, 'pubDate');
    if (!translationKey || !pubDate) continue;
    metas.push({
      lang,
      slug: file.replace(/\.md$/, ''),
      translationKey,
      pubDate,
      updatedDate: field(frontmatter, 'updatedDate'),
    });
  }
  return metas;
}

export function listBlogMeta(): BlogMeta[] {
  return [...readLang('es'), ...readLang('en')];
}

// Solo los temas que existen publicados en los dos idiomas.
export function getBlogPairs(): Array<{ es: string; en: string }> {
  const all = listBlogMeta();
  const pairs: Array<{ es: string; en: string }> = [];
  for (const es of all.filter((m) => m.lang === 'es')) {
    const en = all.find((m) => m.lang === 'en' && m.translationKey === es.translationKey);
    if (en) pairs.push({ es: blogPath('es', es.slug), en: blogPath('en', en.slug) });
  }
  return pairs;
}

// Fecha de última modificación por ruta (para <lastmod> del sitemap).
export function getBlogLastmod(urlPath: string): string | undefined {
  const meta = listBlogMeta().find((m) => blogPath(m.lang, m.slug) === urlPath);
  return meta ? meta.updatedDate ?? meta.pubDate : undefined;
}

// Fecha más reciente de todos los artículos de un idioma (lastmod del índice del blog).
export function getBlogIndexLastmod(lang: BlogLang): string | undefined {
  const dates = listBlogMeta()
    .filter((m) => m.lang === lang)
    .map((m) => m.updatedDate ?? m.pubDate)
    .sort();
  return dates.at(-1);
}
