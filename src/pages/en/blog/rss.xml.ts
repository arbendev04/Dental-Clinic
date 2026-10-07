import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postPath } from '../../../data/blog';

export async function GET(context: APIContext) {
  const posts = await getPosts('en');
  return rss({
    title: 'Arango Dental Clinic — Blog',
    description: 'Dental health tips, treatments and frequently asked questions from Arango Dental Clinic, your English-speaking dentist in Benidorm.',
    site: context.site ?? 'https://arangodentalclinic.es',
    customData: '<language>en-gb</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postPath(post),
    })),
  });
}
