import type { Lang } from './i18n';
import type { BlogService } from './blog';

// Tratamientos relacionados entre sí (enlazado landing ↔ landing, Tarea 11 del Plan SEO).
// Cada landing muestra 3 con una frase de por qué se relacionan. Los textos son
// información general (sin prometer nada ni afirmar técnicas concretas): nombres y URLs
// salen de SERVICE_INFO (src/data/blog.ts), la misma fuente que navbar y footer.
// Para sumar una relación, agregar la clave aquí; no hace falta tocar las 14 landings.
export const RELATED_SERVICES: Record<BlogService, Array<{ key: BlogService; why: Record<Lang, string> }>> = {
  'implantes': [
    {
      key: 'rehabilitacion-oral',
      why: {
        es: 'Sobre un implante se coloca después la corona, el puente o la prótesis: la rehabilitación oral cubre ese paso.',
        en: 'A crown, bridge or denture is fitted on top of an implant once it has healed: oral rehabilitation covers that step.',
      },
    },
    {
      key: 'periodoncia',
      why: {
        es: 'Unas encías sanas son importantes antes y después de un implante; la periodoncia se ocupa de cuidarlas.',
        en: 'Healthy gums matter before and after an implant, and gum treatment is how they are looked after.',
      },
    },
    {
      key: 'odontologia-digital',
      why: {
        es: 'El escáner intraoral 3D y la radiografía digital ayudan a estudiar tu caso y a planificar el tratamiento.',
        en: 'A 3D intraoral scan and digital X-rays help to study your case and plan the treatment.',
      },
    },
  ],
  'ortodoncia': [
    {
      key: 'estetica-dental',
      why: {
        es: 'Algunas personas combinan la ortodoncia con estética dental; tu dentista te indicará si encaja en tu caso.',
        en: 'Some people combine orthodontics with cosmetic dentistry, and your dentist will tell you whether it suits your case.',
      },
    },
    {
      key: 'periodoncia',
      why: {
        es: 'Antes de mover los dientes, las encías deben estar sanas; si hay inflamación, primero se trata.',
        en: 'Gums need to be healthy before teeth are moved, and if there is inflammation it is treated first.',
      },
    },
    {
      key: 'odontologia-digital',
      why: {
        es: 'Un registro digital de la boca con escáner intraoral sirve de base para planificar brackets o alineadores.',
        en: 'A digital record of your mouth taken with an intraoral scanner is the basis for planning braces or aligners.',
      },
    },
  ],
  'estetica-dental': [
    {
      key: 'ortodoncia',
      why: {
        es: 'Si lo que molesta es la posición de los dientes, la ortodoncia puede ser el primer paso antes de otros tratamientos estéticos.',
        en: 'If what bothers you is the position of your teeth, orthodontics may be the first step before other cosmetic treatments.',
      },
    },
    {
      key: 'rehabilitacion-oral',
      why: {
        es: 'Cuando hay dientes dañados o con coronas, la rehabilitación oral y la estética suelen valorarse juntas.',
        en: 'When teeth are damaged or crowned, oral rehabilitation and cosmetic work are usually considered together.',
      },
    },
    {
      key: 'periodoncia',
      why: {
        es: 'Unas encías sanas son la base de cualquier tratamiento estético; la periodoncia las cuida.',
        en: 'Healthy gums are the foundation of any cosmetic treatment, and gum treatment looks after them.',
      },
    },
  ],
  'endodoncia': [
    {
      key: 'rehabilitacion-oral',
      why: {
        es: 'Tras una endodoncia, con frecuencia se coloca una corona o una reconstrucción para proteger el diente.',
        en: 'After a root canal, a crown or rebuild is often fitted to protect the tooth.',
      },
    },
    {
      key: 'periodoncia',
      why: {
        es: 'Algunas molestias vienen de las encías y no del interior del diente; una exploración ayuda a distinguirlas.',
        en: 'Some discomfort comes from the gums rather than the inside of the tooth, and an examination helps tell them apart.',
      },
    },
    {
      key: 'odontologia-digital',
      why: {
        es: 'La radiografía digital ayuda a ver el estado de la raíz y de los tejidos que rodean al diente.',
        en: 'A digital X-ray helps to see the condition of the root and the tissues around the tooth.',
      },
    },
  ],
  'periodoncia': [
    {
      key: 'implantes',
      why: {
        es: 'Si se ha perdido un diente, los implantes son una opción para reponerlo; unas encías sanas son importantes para cuidarlos.',
        en: 'If a tooth has been lost, implants are one option to replace it, and healthy gums are important to look after them.',
      },
    },
    {
      key: 'ortodoncia',
      why: {
        es: 'Mover los dientes con ortodoncia requiere encías sanas; la periodoncia ayuda a conseguirlo.',
        en: 'Moving teeth with orthodontics requires healthy gums, and gum treatment helps to achieve that.',
      },
    },
    {
      key: 'endodoncia',
      why: {
        es: 'Ante un dolor en un diente, conviene distinguir si viene de la encía o del interior del diente.',
        en: 'When a tooth hurts, it is worth working out whether the cause is the gum or the inside of the tooth.',
      },
    },
  ],
  'rehabilitacion-oral': [
    {
      key: 'implantes',
      why: {
        es: 'Los implantes dentales son una de las formas de sustituir dientes perdidos, a veces junto con coronas o puentes.',
        en: 'Dental implants are one way to replace missing teeth, sometimes together with crowns or bridges.',
      },
    },
    {
      key: 'endodoncia',
      why: {
        es: 'Un diente tratado con endodoncia puede necesitar después una corona o una reconstrucción.',
        en: 'A tooth that has had a root canal may afterwards need a crown or a rebuild.',
      },
    },
    {
      key: 'estetica-dental',
      why: {
        es: 'Además de la función, también se tienen en cuenta la forma y el color de los dientes; ahí entra la estética dental.',
        en: 'As well as function, the shape and colour of the teeth are taken into account, and that is where cosmetic dentistry comes in.',
      },
    },
  ],
  'odontologia-digital': [
    {
      key: 'implantes',
      why: {
        es: 'El escáner y la radiografía digital ayudan a planificar la colocación de un implante.',
        en: 'The scan and digital X-rays help to plan where an implant is placed.',
      },
    },
    {
      key: 'ortodoncia',
      why: {
        es: 'Los alineadores y los brackets se planifican a partir de un registro preciso de tu boca.',
        en: 'Aligners and braces are planned from an accurate record of your mouth.',
      },
    },
    {
      key: 'endodoncia',
      why: {
        es: 'La radiografía digital es una herramienta clave para valorar un diente que duele.',
        en: 'A digital X-ray is a key tool for assessing a tooth that hurts.',
      },
    },
  ],
};
