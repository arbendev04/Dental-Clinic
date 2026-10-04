import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { PAGE_PAIRS, SITE_URL } from './src/data/i18n.ts';

// Páginas con noindex en Layout.astro que no deben aparecer en el sitemap
// (hoy solo la 404; las páginas legales son indexables).
const NOINDEX_PAGES = ['/404'];

export default defineConfig({
  site: 'https://arangodentalclinic.es',
  // El sitio sigue siendo estático por defecto (SSG); el adaptador de Vercel
  // solo habilita el render on-demand de rutas puntuales que exportan
  // `prerender = false` (ej. src/pages/api/lead.ts), sin afectar el resto.
  output: 'static',
  adapter: vercel(),
  // El CSS de cada página es específico de esa página (estilos con scope
  // por componente, no un bundle global compartido), así que inlinearlo
  // siempre evita el <link rel="stylesheet"> render-blocking sin costo real:
  // no hay CSS "no crítico" que valga la pena separar en un archivo aparte.
  build: {
    inlineStylesheets: 'always',
  },
  // Los redirects 301 viven en vercel.json (rutas viejas ya indexadas → URLs
  // cortas actuales). No declararlos también acá: Astro tomaba "/x" y "/x/"
  // como la misma ruta y avisaba de una colisión que será error en el futuro.
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap({
      // Excluye las páginas con noindex (ver NOINDEX_PAGES arriba).
      filter: (page) => !NOINDEX_PAGES.some((path) => page.includes(path)),
      // Alternates es/en para cada par de src/data/i18n.ts (la opción `i18n` del
      // plugin solo empareja URLs que difieren únicamente por el prefijo /en, y
      // acá los slugs cambian). Tienen que coincidir con los <link hreflang> del <head>.
      serialize(item) {
        const path = new URL(item.url).pathname;
        const pair = PAGE_PAIRS.find((p) => p.es === path || p.en === path);
        if (pair) {
          item.links = [
            { url: SITE_URL + pair.es, lang: 'es' },
            { url: SITE_URL + pair.en, lang: 'en' },
          ];
        }
        return item;
      },
    }),
  ],
});
