import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // El CSS de cada página es específico de esa página (estilos con scope
  // por componente, no un bundle global compartido), así que inlinearlo
  // siempre evita el <link rel="stylesheet"> render-blocking sin costo real:
  // no hay CSS "no crítico" que valga la pena separar en un archivo aparte.
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
