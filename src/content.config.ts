import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Un artículo por archivo: src/content/blog/<es|en>/<slug>.md
// El slug del archivo es el de la URL (/blog/<slug>/ o /en/blog/<slug>/).
// Los dos idiomas de un mismo tema comparten `translationKey`; con eso se
// generan los hreflang, el selector de idioma y el sitemap (ver
// src/data/blog-pairs.ts). Un artículo sin par en el otro idioma es válido.
export const BLOG_SERVICES = [
  'implantes',
  'ortodoncia',
  'estetica-dental',
  'endodoncia',
  'periodoncia',
  'rehabilitacion-oral',
  'odontologia-digital',
] as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z
      .object({
        // El Layout agrega " | Arango Dental Clinic": tope de 60 para que Google no corte el título.
        title: z.string().max(60),
        description: z.string().min(80).max(160),
        lang: z.enum(['es', 'en']),
        translationKey: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        // Tratamiento al que pertenece: define la categoría, el CTA y la landing enlazada.
        service: z.enum(BLOG_SERVICES),
        tags: z.array(z.string()).default([]),
        // Portada (miniatura de la tarjeta, cabecera del artículo y vista previa al
        // compartir). Va en src/assets/blog/ y se referencia relativa al archivo, ej.
        // "../../../assets/blog/mi-imagen.webp": Astro la optimiza (WebP, varios tamaños).
        // Recomendado 1200×630 o mayor, sin texto dentro. Sin imagen la tarjeta es solo texto.
        image: image().optional(),
        // Obligatorio si hay imagen: describe lo que se ve (SEO y accesibilidad).
        imageAlt: z.string().optional(),
        draft: z.boolean().default(false),
      })
      .refine((data) => !data.image || Boolean(data.imageAlt?.trim()), {
        message: 'imageAlt es obligatorio cuando el artículo tiene image',
        path: ['imageAlt'],
      }),
});

export const collections = { blog };
