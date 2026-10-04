import type { Servicio } from './servicios';

// Versión en inglés de src/data/servicios.ts — mismo orden y misma cantidad de
// entradas (las dos listas deben mantenerse en paralelo).
export const servicios: Servicio[] = [
  {
    nombre: 'Digital Dentistry',
    descripcion: 'We assess your oral health with advanced digital technology to detect problems and plan your treatment with precision.',
    duracion: 'Initial consultation',
    landingHref: '/en/digital-dentistry/',
  },
  {
    nombre: 'Dental Implants',
    descripcion: 'We replace missing teeth with dental implants to restore the function and natural look of your smile.',
    duracion: 'Several sessions',
    landingHref: '/en/dental-implants/',
  },
  {
    nombre: 'Cosmetic Dentistry',
    descripcion: 'We improve the appearance of your teeth with cosmetic dentistry treatments such as veneers and whitening.',
    duracion: 'From 1 session',
    landingHref: '/en/cosmetic-dentistry/',
  },
  {
    nombre: 'Oral Rehabilitation',
    descripcion: 'We restore damaged or missing teeth through oral rehabilitation, with crowns, bridges and prostheses tailored to you.',
    duracion: 'Personalised plan',
    landingHref: '/en/oral-rehabilitation/',
  },
  {
    nombre: 'Gum Disease Treatment',
    descripcion: 'We treat bleeding, inflammation and gum disease with periodontal care.',
    duracion: '45–60 min',
    landingHref: '/en/gum-treatment/',
  },
  {
    nombre: 'Orthodontics',
    descripcion: 'We align your teeth and correct bite problems with orthodontics, braces and clear aligners.',
    duracion: 'Initial consultation',
    landingHref: '/en/orthodontics/',
  },
  {
    nombre: 'Root Canal Treatment',
    descripcion: 'We treat infections and internal damage to the tooth with endodontics, aiming to save the natural tooth.',
    duracion: '60–90 min',
    landingHref: '/en/root-canal-treatment/',
  },
];
