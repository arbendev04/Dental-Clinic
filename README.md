# Arango Dental Clinic — Sitio Web Institucional

Sitio web de alta gama para **Arango Dental Clinic**, clínica odontológica ubicada en Benidorm, Alicante (España). Construido con Astro como sitio estático (SSG) con animaciones cinematográficas y un sistema de diseño editorial propio.

Dominio previsto: [`aurumdental.es`](https://aurumdental.es)

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
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Previsualizar el build
npm run preview
```

---

## Estructura del proyecto

```
src/
├── components/
│   ├── HeroScroll.astro     # Hero de 400vh con scroll-driven crossfade (GSAP)
│   ├── Navbar.astro         # Navbar fija, adaptativa al scroll y al modo
│   ├── ThemeToggle.astro    # Botón luna/sol — dark/light mode
│   └── Footer.astro         # Footer editorial con CTA, links y contacto
├── layouts/
│   └── Layout.astro         # Layout base: SEO, Schema.org, fuentes, dark mode
├── pages/
│   ├── index.astro          # Home: hero + servicios + stats + testimonios + CTA
│   ├── servicios.astro      # Grid de 6 servicios con precio en EUR
│   ├── nosotros.astro       # Historia, valores y equipo
│   ├── contacto.astro       # Info de contacto + formulario mailto
│   └── reservar.astro       # Reservas: teléfono + WhatsApp
└── styles/
    └── global.css           # Variables CSS, tipografía, accesibilidad

public/
├── img/
│   ├── hero/                # Imágenes .webp del hero (excluidas del git)
│   └── logo/
│       ├── logo-blanco.png  # Logo para fondos oscuros
│       └── logo-oscuro.png  # Logo para fondos claros
├── favicon.svg
├── robots.txt
└── sitemap.xml
```

---

## Sistema de diseño — "Clinical Atelier"

Paleta basada en el proyecto **Luxury Dental Landing** de Stitch. El concepto visual es *Organic Precision*: verde forestal profundo como base, oro cálido como acento, fondos ivory cálidos.

### Variables CSS (siempre usar variables, nunca hex directos en componentes)

```css
/* Modo claro */
--bg-primary:    #fcf9f8   /* superficie principal */
--bg-secondary:  #f6f3f2   /* secciones alternadas */
--teal-500:      #466558   /* acento verde medio */
--teal-600:      #2f4d41   /* hover / texto */
--teal-700:      #153328   /* botones CTA, primary */
--gold-500:      #C49B38   /* acento dorado */
--text-primary:  #1c1b1b
--text-secondary:#414845

/* Modo oscuro */
--bg-primary:    #141210
--bg-secondary:  #1D1A16
--teal-600:      #98b9a9   /* verde claro sobre oscuro */
--gold-500:      #C49B38
--gold-600:      #D4AF55
--text-primary:  #F4F0EB
```

### Tipografía

| Fuente | Uso |
|---|---|
| **Cormorant Garamond** (300–700, italic) | Títulos `h1–h6`, taglines, headlines editoriales |
| **Inter** (300–700) | Cuerpo, navegación, UI, labels |
| **DM Sans** (300–400) | Label superior del hero |

### Dark / Light mode

- La clase `.dark` en `<html>` activa el modo oscuro
- `ThemeToggle.astro` persiste la preferencia en `localStorage` (clave: `theme`)
- `Layout.astro` restaura el tema antes del primer render (sin flash)

---

## Componentes destacados

### HeroScroll.astro

Hero de **400vh** con scroll-driven. La sección sticky ocupa 100vh y hace crossfade entre 4 imágenes con efecto túnel GSAP:

- Entrada: `scale 1.7 → 1.0` con `blur 6px → 0` (efecto de profundidad)
- Salida: `scale 1.0 → 0.75`
- `perspective: 1200px` en el contenedor
- Kinetic typography: cada palabra del título entra con su frame de imagen

### Navbar.astro

- Transparente sobre el hero; cambia de fondo al hacer scroll
- **Modo claro + scroll**: fondo ivory `rgba(252,249,248,0.92)` + blur, links y logo oscuros
- **Modo oscuro + scroll**: fondo `rgba(10,10,10,0.80)` + blur, links blancos
- Indicador deslizante bajo el link activo/hover
- Overlay mobile fullscreen con animación escalonada, adaptativo al modo

### Footer.astro

- Siempre oscuro, pero con colores distintos por modo:
  - **Modo claro**: verde forestal `#0d2219`
  - **Modo oscuro**: obsidiana cálida `#252118` (contrasta con el fondo de página)
- Franja editorial CTA con headline en Cormorant Garamond
- Grid de 4 columnas: marca + clínica + servicios + contacto

---

## Páginas

| Ruta | Estado |
|---|---|
| `/` | Completa |
| `/servicios` | Completa — precios en EUR |
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
| Dominio | `aurumdental.es` |
| Dirección | Avd. Alfonso Puchades 22, Benidorm, Alicante 03501 |
| Teléfono | +34 965 088 282 |
| WhatsApp | +34 665 886 439 |
| Email | Arangodentalclinic@gmail.com |
| Horario | Lun–Vie 9:00–19:00 |
| Instagram | [@arangodentalclinic](https://www.instagram.com/arangodentalclinic/) |
| Facebook | [Arango Dental Clinic](https://www.facebook.com/p/Arango-Dental-Clinic-61574405870200/) |

---

## Assets excluidos del repositorio

Las imágenes del hero y los vídeos **no están en el repositorio** (son binarios pesados). Hay que transferirlos al servidor manualmente en el momento del deploy.

```
public/img/hero/   ← 4 imágenes .webp del hero
public/video/      ← vídeos de apoyo
```

---

## Convenciones

- Todo el contenido en **español** (España)
- Precios en **euros** con formato europeo (`1.500 €`)
- Usar `var(--token)` para colores, nunca hex directos en componentes
- SVG inline para iconos — sin librerías externas ni emojis
- No añadir React ni Framer Motion sin necesidad real
- El hero (`HeroScroll.astro`) tiene lógica delicada — probar scroll completo tras cualquier cambio

---

## Repositorio

`github.com/arbendev04/Dental-Clinic` · rama `main`
