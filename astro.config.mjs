import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const LEGAL_PAGES_PENDING_NOINDEX = ['/terminos-condiciones'];

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
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap({
      // Excluye la 404 y las páginas legales mientras tengan noindex en Layout.astro
      // (sacarlas de esta lista cuando se les quite el noindex).
      filter: (page) =>
        !page.includes('/404') &&
        !LEGAL_PAGES_PENDING_NOINDEX.some((path) => page.includes(path)),
    }),
  ],
});
