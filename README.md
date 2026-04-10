# Arango Dental Clinic — Sitio Web Institucional

Sitio web de alta gama para **Arango Dental Clinic**, clínica odontológica ubicada en Benidorm, Alicante (España). Construido con Astro como sitio estático (SSG) con animaciones cinematográficas y un sistema de diseño editorial propio.

**Producción:** [`arangodentalclinic.es`](https://arangodentalclinic.es) · Desplegado en Netlify con CI/CD desde `main`.

---

## Stack Técnico

| Tecnología | Versión | Rol |
|---|---|---|
| [Astro](https://astro.build) | ^5.0.0 | Framework principal (SSG) |
| [TailwindCSS v4](https://tailwindcss.com) | ^4.0.0 | Utilidades de layout y espaciado |
| [GSAP + ScrollTrigger](https://gsap.com) | ^3.14.2 | Animaciones del hero y scroll |
| TypeScript | ^5.0.0 | Tipado en scripts de componentes |

---

## Instalación y desarrollo

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo
npm run build     # build de producción
npm run preview   # previsualizar el build
```

---

## Estructura del proyecto

```
src/
├── components/
│   ├── HeroScroll.astro     # Hero de 400vh con scroll-driven crossfade (GSAP)
│   ├── Navbar.astro         # Navbar fija, adaptativa al scroll y al modo
│   ├── ThemeToggle.astro    # Botón luna/sol — dark/light mode (multi-instancia)
│   └── Footer.astro         # Footer editorial con CTA, links y contacto
├── layouts/
│   └── Layout.astro         # Layout base: SEO, Schema.org, fuentes, dark mode
├── pages/
│   ├── index.astro          # Home: hero + servicios + stats + testimonios + CTA
│   ├── servicios.astro      # Grid de 6 servicios con precios en EUR
│   ├── nosotros.astro       # Historia, valores y equipo
│   ├── contacto.astro       # Info de contacto + formulario mailto
│   └── reservar.astro       # Reservas: teléfono + WhatsApp
└── styles/
    └── global.css           # Variables CSS, tipografía, accesibilidad

public/
├── img/
│   ├── hero/                # 4 imágenes .webp del hero (~136 KB total)
│   └── logo/
│       ├── logo-blanco.png  # Logo para fondos oscuros
│       └── logo-oscuro.png  # Logo para fondos claros
├── favicon.svg
├── robots.txt
└── sitemap.xml
```

---

## Servicios

La web refleja los 6 servicios reales de la clínica:

| Servicio | Precio orientativo |
|---|---|
| Odontología Digital | Consultar |
| Implantología | Desde 800 € |
| Estética Dental | Desde 300 € |
| Rehabilitación Oral | Consultar |
| Periodoncia | Desde 80 € |
| Ortodoncia | Desde 1.500 € |

---

## Sistema de diseño — "Clinical Atelier"

Paleta basada en el proyecto **Luxury Dental Landing** de Stitch. El concepto visual es *Organic Precision*: verde forestal profundo como base, oro cálido como acento, fondos ivory cálidos.

```css
/* Modo claro */
--bg-primary:     #fcf9f8
--teal-700:       #153328   /* botones CTA */
--gold-500:       #C49B38   /* acento dorado */
--text-primary:   #1c1b1b

/* Modo oscuro */
--bg-primary:     #141210
--teal-600:       #98b9a9   /* verde claro sobre oscuro */
--gold-600:       #D4AF55   /* dorado más luminoso */
--text-primary:   #F4F0EB
```

> Usar siempre `var(--token)`. Nunca hex directos en componentes.

### Tipografía

| Fuente | Uso |
|---|---|
| **Cormorant Garamond** (300–700, italic) | Títulos, headlines editoriales |
| **Inter** (300–700) | Cuerpo, navegación, UI |
| **DM Sans** (300–400) | Label superior del hero |

### Dark / Light mode

- La clase `.dark` en `<html>` activa el modo oscuro
- `ThemeToggle.astro` persiste la preferencia en `localStorage` (clave: `theme`)
- Soporta múltiples instancias por página (navbar desktop + overlay mobile)
- `Layout.astro` restaura el tema antes del primer render (sin flash)

---

## Componentes destacados

### HeroScroll.astro

Hero de **400vh** con scroll-driven. La sección sticky ocupa 100vh y hace crossfade entre 4 imágenes con efecto túnel GSAP:

- Entrada: `scale 1.7 → 1.0` con `blur 6px → 0`
- Salida: `scale 1.0 → 0.75`
- `perspective: 1200px` en el contenedor
- Kinetic typography: cada palabra del título entra con su frame de imagen
- Optimizado para mobile: botones en columna, descripción con `max-width: 32ch`

### Navbar.astro

- Transparente sobre el hero; cambia de fondo al hacer scroll
- **Modo claro + scroll:** fondo ivory con blur, links y logo oscuros
- **Modo oscuro + scroll:** fondo oscuro con blur, links blancos
- Clase `is-light-hero` gestionada por JS en páginas con hero claro (ej. `/servicios`)
- Logo dual: blanco por defecto, oscuro al hacer scroll en light mode
- Overlay mobile fullscreen con animación escalonada

### Footer.astro

- Logo dual claro/oscuro según modo
- Franja CTA superior con colores propios (`--f-band-*`)
- Dark mode: fondo verde claro `#d4ffea` en el bloque principal, `#141210` en la franja CTA
- Grid de contacto, servicios y redes sociales

---

## Páginas

| Ruta | Estado |
|---|---|
| `/` | Completa — optimizada mobile |
| `/servicios` | Completa — 6 servicios reales, optimizada mobile |
| `/nosotros` | Completa |
| `/contacto` | Completa — formulario `mailto:` (sin backend) |
| `/reservar` | Placeholder — teléfono y WhatsApp |
| `/politica-privacidad` | Pendiente |
| `/terminos-condiciones` | Pendiente |
| `/aviso-legal` | Pendiente |

---

## Información del negocio

| Campo | Valor |
|---|---|
| Nombre comercial | Arango Dental Clinic |
| Dirección | Avd. Alfonso Puchades 22, Benidorm, Alicante 03501 |
| Teléfono | +34 965 088 282 |
| WhatsApp | +34 665 886 439 |
| Email | Arangodentalclinic@gmail.com |
| Horario | Lun–Vie 9:00–19:00 · Sáb 9:00–14:00 |
| Instagram | [@arangodentalclinic](https://www.instagram.com/arangodentalclinic/) |
| Facebook | [Arango Dental Clinic](https://www.facebook.com/p/Arango-Dental-Clinic-61574405870200/) |

---

## Convenciones

- Todo el contenido en **español** (España)
- Precios en **euros** con formato europeo (`1.500 €`)
- Usar `var(--token)` para colores, nunca hex directos en componentes
- SVG inline para iconos — sin librerías externas ni emojis
- No añadir React ni Framer Motion sin necesidad real
- El hero (`HeroScroll.astro`) tiene lógica delicada — probar scroll completo tras cualquier cambio

---

`github.com/arbendev04/Dental-Clinic` · rama `main`
