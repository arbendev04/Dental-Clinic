import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';

export type BlogPost = CollectionEntry<'blog'>;
export type BlogService = BlogPost['data']['service'];

// Tratamiento → nombre visible y landing, por idioma. Los nombres coinciden con
// los de src/data/servicios.ts / servicios-en.ts (anchor text coherente en todo el sitio).
export const SERVICE_INFO: Record<BlogService, Record<Lang, { label: string; href: string }>> = {
  'implantes': {
    es: { label: 'Implantes dentales', href: '/implantes/' },
    en: { label: 'Dental implants', href: '/en/dental-implants/' },
  },
  'ortodoncia': {
    es: { label: 'Ortodoncia', href: '/ortodoncia/' },
    en: { label: 'Orthodontics', href: '/en/orthodontics/' },
  },
  'estetica-dental': {
    es: { label: 'Estética dental', href: '/estetica-dental/' },
    en: { label: 'Cosmetic dentistry', href: '/en/cosmetic-dentistry/' },
  },
  'endodoncia': {
    es: { label: 'Endodoncia', href: '/endodoncia/' },
    en: { label: 'Root canal treatment', href: '/en/root-canal-treatment/' },
  },
  'periodoncia': {
    es: { label: 'Periodoncia', href: '/periodoncia/' },
    en: { label: 'Gum disease treatment', href: '/en/gum-treatment/' },
  },
  'rehabilitacion-oral': {
    es: { label: 'Rehabilitación oral', href: '/rehabilitacion-oral/' },
    en: { label: 'Oral rehabilitation', href: '/en/oral-rehabilitation/' },
  },
  'odontologia-digital': {
    es: { label: 'Odontología digital', href: '/odontologia-digital/' },
    en: { label: 'Digital dentistry', href: '/en/digital-dentistry/' },
  },
};

// Valor que se guarda en "Tratamiento de interés" de Zoho: siempre el nombre canónico en
// español (el mismo de las opciones del desplegable de /contacto y de attribution.ts).
export const SERVICE_CRM_NAME: Record<BlogService, string> = {
  'implantes': 'Implantología',
  'ortodoncia': 'Ortodoncia',
  'estetica-dental': 'Estética Dental',
  'endodoncia': 'Endodoncia',
  'periodoncia': 'Periodoncia',
  'rehabilitacion-oral': 'Rehabilitación Oral',
  'odontologia-digital': 'Odontología Digital',
};

export const blogBasePath =(lang: Lang): string => (lang === 'en' ? '/en/blog/' : '/blog/');

// El id de la entrada es "<lang>/<slug>": el slug es el nombre del archivo.
export const postSlug = (post: BlogPost): string => post.id.split('/').pop() as string;

export const postPath = (post: BlogPost): string => `${blogBasePath(post.data.lang)}${postSlug(post)}/`;

// Artículos publicados (sin borradores) de un idioma, del más nuevo al más viejo.
export async function getPosts(lang: Lang): Promise<BlogPost[]> {
  const posts = await getCollection('blog', (p) => p.data.lang === lang && !p.data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

// Minutos de lectura (~220 palabras por minuto), mínimo 1.
export function readingMinutes(body: string | undefined): number {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function wordCount(body: string | undefined): number {
  return (body ?? '').split(/\s+/).filter(Boolean).length;
}

export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// Relacionados: primero del mismo tratamiento, después los más recientes.
export function relatedPosts(current: BlogPost, all: BlogPost[], limit = 2): BlogPost[] {
  const others = all.filter((p) => p.id !== current.id);
  const sameService = others.filter((p) => p.data.service === current.data.service);
  const rest = others.filter((p) => p.data.service !== current.data.service);
  return [...sameService, ...rest].slice(0, limit);
}
