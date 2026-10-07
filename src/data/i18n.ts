import { getBlogPairs } from './blog-pairs.ts';

export type Lang = 'es' | 'en';

export const SITE_URL = 'https://arangodentalclinic.es';

// Páginas que existen en los dos idiomas (rutas con barra final, sin dominio).
// Layout.astro genera de acá los <link rel="alternate" hreflang>; Navbar usa
// el mismo mapa para el selector de idioma. Una página que no esté acá no
// emite hreflang y su selector de idioma lleva al home del otro idioma.
export const PAGE_PAIRS: ReadonlyArray<{ es: string; en: string }> = [
  { es: '/', en: '/en/' },
  { es: '/servicios/', en: '/en/services/' },
  { es: '/implantes/', en: '/en/dental-implants/' },
  { es: '/ortodoncia/', en: '/en/orthodontics/' },
  { es: '/estetica-dental/', en: '/en/cosmetic-dentistry/' },
  { es: '/endodoncia/', en: '/en/root-canal-treatment/' },
  { es: '/periodoncia/', en: '/en/gum-treatment/' },
  { es: '/rehabilitacion-oral/', en: '/en/oral-rehabilitation/' },
  { es: '/odontologia-digital/', en: '/en/digital-dentistry/' },
  { es: '/contacto/', en: '/en/contact/' },
  { es: '/politica-privacidad/', en: '/en/privacy-policy/' },
  { es: '/nosotros/', en: '/en/about-us/' },
  { es: '/aviso-legal/', en: '/en/legal-notice/' },
  { es: '/terminos-condiciones/', en: '/en/terms-and-conditions/' },
  { es: '/blog/', en: '/en/blog/' },
];

// Páginas fijas + artículos del blog que existen publicados en los dos idiomas
// (emparejados por `translationKey`, ver blog-pairs.ts). Es la lista que usan
// el hreflang del <head>, el selector de idioma y el sitemap.
export function getAllPairs(): Array<{ es: string; en: string }> {
  return [...PAGE_PAIRS, ...getBlogPairs()];
}

export function normalizePath(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function getLang(pathname: string): Lang {
  return normalizePath(pathname).startsWith('/en/') ? 'en' : 'es';
}

export function getAlternates(pathname: string): { es: string; en: string } | null {
  const path = normalizePath(pathname);
  return getAllPairs().find((pair) => pair.es === path || pair.en === path) ?? null;
}

// Destino del selector de idioma: la página equivalente o, si no existe, el home del idioma pedido.
export function getSwitchHref(pathname: string, target: Lang): string {
  const alternates = getAlternates(pathname);
  if (alternates) return alternates[target];
  return target === 'en' ? '/en/' : '/';
}
