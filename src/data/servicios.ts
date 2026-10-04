export interface Servicio {
  nombre: string;
  descripcion: string;
  duracion: string;
  /** Si existe, la card de /servicios/ y el submenú del navbar enlazan aquí en vez de a WhatsApp. */
  landingHref?: string;
}

export const servicios: Servicio[] = [
  {
    nombre: 'Odontología Digital',
    descripcion: 'Evaluamos tu salud bucal con tecnología digital avanzada para detectar problemas y planificar tu tratamiento con precisión.',
    duracion: 'Consulta inicial',
    landingHref: '/odontologia-digital/',
  },
  {
    nombre: 'Implantes Dentales',
    descripcion: 'Reemplazamos dientes perdidos mediante implantología dental para recuperar la función y apariencia natural de tu sonrisa.',
    duracion: 'Múltiples sesiones',
    landingHref: '/implantes/',
  },
  {
    nombre: 'Estética Dental',
    descripcion: 'Mejoramos la apariencia de tus dientes mediante tratamientos de estética dental como carillas y blanqueamiento.',
    duracion: 'Desde 1 sesión',
    landingHref: '/estetica-dental/',
  },
  {
    nombre: 'Rehabilitación Oral',
    descripcion: 'Restauramos dientes dañados o perdidos mediante rehabilitación oral, con coronas, puentes y prótesis adaptadas a ti.',
    duracion: 'Plan personalizado',
    landingHref: '/rehabilitacion-oral/',
  },
  {
    nombre: 'Periodoncia',
    descripcion: 'Tratamos el sangrado, inflamación y enfermedades de las encías mediante tratamientos de periodoncia.',
    duracion: '45–60 min',
    landingHref: '/periodoncia/',
  },
  {
    nombre: 'Ortodoncia',
    descripcion: 'Alineamos tus dientes y corregimos problemas de mordida mediante ortodoncia, brackets y alineadores transparentes.',
    duracion: 'Consulta inicial',
    landingHref: '/ortodoncia/',
  },
  {
    nombre: 'Endodoncia',
    descripcion: 'Tratamos infecciones y daños internos del diente mediante endodoncia para intentar conservar la pieza dental.',
    duracion: '60–90 min',
    landingHref: '/endodoncia/',
  },
];
