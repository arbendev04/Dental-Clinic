import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postPath } from '../../data/blog';

export async function GET(context: APIContext) {
  const posts = await getPosts('es');
  return rss({
    title: 'Arango Dental Clinic — Blog',
    description: 'Consejos de salud dental, tratamientos y dudas frecuentes de Arango Dental Clinic, tu dentista en Benidorm.',
    site: context.site ?? 'https://arangodentalclinic.es',
    customData: '<language>es-es</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postPath(post),
    })),
  });
}
