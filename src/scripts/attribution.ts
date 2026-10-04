const STORAGE_KEY = 'attribution';
const MAX_VALUE_LENGTH = 255;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

const GOOGLE_CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid'] as const;

type UtmKey = (typeof UTM_KEYS)[number];

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_url?: string;
}

interface StoredAttribution extends Attribution {
  landing_path?: string;
}

const TRATAMIENTO_POR_RUTA: Record<string, string> = {
  '/implantes': 'Implantología',
  '/ortodoncia': 'Ortodoncia',
  '/estetica-dental': 'Estética Dental',
  '/endodoncia': 'Endodoncia',
  '/periodoncia': 'Periodoncia',
  '/rehabilitacion-oral': 'Rehabilitación Oral',
  '/odontologia-digital': 'Odontología Digital',
  // Landings en inglés: el CRM sigue recibiendo el valor en español.
  '/en/dental-implants': 'Implantología',
  '/en/orthodontics': 'Ortodoncia',
  '/en/cosmetic-dentistry': 'Estética Dental',
  '/en/root-canal-treatment': 'Endodoncia',
  '/en/gum-treatment': 'Periodoncia',
  '/en/oral-rehabilitation': 'Rehabilitación Oral',
  '/en/digital-dentistry': 'Odontología Digital',
};

function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

// URLSearchParams ya decodifica %XX y "+"; el intento extra cubre valores
// doblemente codificados (ej. "%257C" → "%7C" → "|").
function cleanValue(raw: string): string {
  let value = raw;
  if (value.includes('%')) {
    try {
      value = decodeURIComponent(value);
    } catch {
      // se conserva el valor ya decodificado una vez
    }
  }
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, MAX_VALUE_LENGTH);
}

function readStored(): StoredAttribution {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAttribution) : {};
  } catch {
    return {};
  }
}

function writeStored(value: StoredAttribution): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // sessionStorage no disponible (modo privado, cuota): se envía sin atribución
  }
}

// Se llama en cada página: guarda los UTM al aterrizar (el último click de
// anuncio de la sesión pisa al anterior) y, si no hay ninguno, solo recuerda
// la primera página vista para saber por dónde entró el visitante.
export function captureAttribution(): void {
  const params = new URLSearchParams(window.location.search);
  const landing = {
    landing_url: window.location.origin + window.location.pathname,
    landing_path: window.location.pathname,
  };

  const fromUrl: Partial<Record<UtmKey, string>> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      const cleaned = cleanValue(value);
      if (cleaned) fromUrl[key] = cleaned;
    }
  }

  // Google Ads con etiquetado automático pega un click id aunque no haya UTM;
  // solo se infiere el origen, el identificador en sí no se guarda.
  if (GOOGLE_CLICK_ID_KEYS.some((key) => params.has(key))) {
    fromUrl.utm_source ??= 'google';
    fromUrl.utm_medium ??= 'cpc';
  }

  if (Object.keys(fromUrl).length > 0) {
    writeStored({ ...fromUrl, ...landing });
    return;
  }

  if (!readStored().landing_url) {
    writeStored(landing);
  }
}

export function getAttribution(): Attribution {
  const { landing_path: _landingPath, ...attribution } = readStored();
  return attribution;
}

// Tratamiento según la página actual (landings) o, si no hay, según la
// landing por donde entró en esta sesión.
export function tratamientoPorPagina(): string {
  const current = TRATAMIENTO_POR_RUTA[normalizePath(window.location.pathname)];
  if (current) return current;
  const landingPath = readStored().landing_path;
  return (landingPath && TRATAMIENTO_POR_RUTA[normalizePath(landingPath)]) || '';
}
