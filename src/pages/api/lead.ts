export const prerender = false;

import type { APIRoute } from 'astro';

interface LeadPayload {
  nombre?: string;
  telefono?: string;
  email?: string;
  tratamiento?: string;
  consentimiento?: boolean;
  _gotcha?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_url?: string;
  lang?: string;
  // Formularios del blog: `source: 'blog'` y el slug del artículo desde el que se escribe.
  source?: string;
  article?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.eu/oauth/v2/token';
const CALLMEBOT_URL = 'https://api.callmebot.com/whatsapp.php';
const ALLOWED_ORIGIN_HOSTS = ['arangodentalclinic.es', 'localhost', '127.0.0.1'];
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_LIMIT_MAX_SUBMISSIONS = 3;

// El plan de Zoho CRM no admite campos personalizados nuevos en Leads, así que
// la atribución va a campos estándar sin uso cuya etiqueta se renombró en Zoho
// (ej. Skype_ID se ve como "UTM Source"). Los límites son los del campo.
const MARKETING_FIELDS = {
  utm_source: { zohoField: 'Skype_ID', maxLength: 50 },
  utm_medium: { zohoField: 'Twitter', maxLength: 50 },
  utm_campaign: { zohoField: 'Designation', maxLength: 100 },
  utm_content: { zohoField: 'Company', maxLength: 200 },
  utm_term: { zohoField: 'Fax', maxLength: 30 },
  landing_url: { zohoField: 'Website', maxLength: 255 },
} as const;

const META_UTM_SOURCES = ['facebook', 'fb', 'instagram', 'ig'];
const GOOGLE_PAID_MEDIUMS = ['cpc', 'ppc', 'paid'];
const DEFAULT_LEAD_SOURCE = 'Sitio Web';
const META_LEAD_SOURCE = 'Facebook Ads';
const GOOGLE_LEAD_SOURCE = 'Google Ads';
const BLOG_LEAD_SOURCE = 'Blog';
const MAX_ATTRIBUTION_RETRIES = 4;

// Mensajes de error que ve el visitante según el idioma del sitio desde el que escribe.
const MESSAGES = {
  es: {
    forbidden: 'Solicitud no permitida.',
    rateLimited: 'Demasiadas solicitudes. Probá de nuevo más tarde o escribinos por WhatsApp.',
    required: 'El nombre y el teléfono son obligatorios.',
    consent: 'Debes aceptar la política de privacidad para continuar.',
    config: 'Error de configuración del servidor.',
    saveFailed: 'No hemos podido guardar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.',
  },
  en: {
    forbidden: 'Request not allowed.',
    rateLimited: 'Too many requests. Please try again later or message us on WhatsApp.',
    required: 'Name and phone number are required.',
    consent: 'You must accept the privacy policy to continue.',
    config: 'Server configuration error.',
    saveFailed: 'We could not save your request. Please try again or message us on WhatsApp.',
  },
} as const;

// Cacheado en memoria mientras el proceso serverless siga "caliente" — evita
// pedir un token nuevo en cada invocación (el de Zoho dura ~1h).
let cachedToken: CachedToken | null = null;

// Registro en memoria de envíos por IP para un rate-limit básico. Es un
// mejor-esfuerzo (no persiste entre instancias frías o escaladas), pero
// frena ráfagas obvias desde un mismo origen sin depender de un servicio externo.
const submissionsByIp = new Map<string, number[]>();

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissionsByIp.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  submissionsByIp.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_SUBMISSIONS;
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength);
}

// La campaña de pago manda: un visitante que llegó por un anuncio y escribe desde un
// artículo sigue contando como Facebook/Google Ads. "Blog" es solo para tráfico orgánico.
function resolveLeadSource(utmSource: string, utmMedium: string, fromBlog: boolean): string {
  const source = utmSource.toLowerCase();
  if (META_UTM_SOURCES.includes(source)) return META_LEAD_SOURCE;
  if (source === 'google' && GOOGLE_PAID_MEDIUMS.includes(utmMedium.toLowerCase())) return GOOGLE_LEAD_SOURCE;
  if (fromBlog) return BLOG_LEAD_SOURCE;
  return DEFAULT_LEAD_SOURCE;
}

// El slug del artículo solo se usa en el aviso por WhatsApp: se acepta únicamente un slug válido.
function cleanArticleSlug(value: unknown): string {
  const text = cleanText(value, 120);
  return /^[a-z0-9-]+$/.test(text) ? text : '';
}

// Solo URLs http(s) de nuestro propio dominio: el campo se muestra como link en Zoho.
function cleanLandingUrl(value: unknown, maxLength: number): string {
  const text = cleanText(value, maxLength);
  try {
    const url = new URL(text);
    const isHttp = url.protocol === 'https:' || url.protocol === 'http:';
    const isOwnHost = ALLOWED_ORIGIN_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
    return isHttp && isOwnHost ? text : '';
  } catch {
    return '';
  }
}

function hasValidOrigin(request: Request): boolean {
  const source = request.headers.get('origin') ?? request.headers.get('referer');
  // Algunos navegadores muy restrictivos no envían ninguna de las dos: no
  // bloqueamos solo por eso, es una señal débil para descartar por sí sola.
  if (!source) return true;
  return ALLOWED_ORIGIN_HOSTS.some((host) => source.includes(host));
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.accessToken;
  }

  const clientId = import.meta.env.ZOHO_CLIENT_ID;
  const clientSecret = import.meta.env.ZOHO_CLIENT_SECRET;
  const refreshToken = import.meta.env.ZOHO_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Faltan variables de entorno de Zoho (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET o ZOHO_REFRESH_TOKEN).');
  }

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const response = await fetch(`${ZOHO_ACCOUNTS_URL}?${params.toString()}`, {
    method: 'POST',
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error('Zoho OAuth: no se pudo refrescar el access_token:', data);
    throw new Error('No se pudo obtener el token de acceso de Zoho.');
  }

  // Restamos 60s de margen para no usar un token que expire durante la
  // siguiente petición (expires_in viene en segundos, normalmente 3600).
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in - 60) * 1000,
  };

  return cachedToken.accessToken;
}

// Aviso por WhatsApp vía CallMeBot (gratuito, solo se envía a un número ya
// vinculado por el propio destinatario). Si falla, no debe romper la
// respuesta al usuario — el Lead ya quedó guardado en Zoho de todas formas.
// Zoho indica en `details.api_name` qué campo hizo fallar el alta.
function getRejectedField(result: unknown): string | undefined {
  const field = (result as { data?: { details?: { api_name?: unknown } }[] })?.data?.[0]?.details?.api_name;
  return typeof field === 'string' ? field : undefined;
}

async function createZohoLead(
  apiDomain: string,
  accessToken: string,
  leadData: Record<string, string>,
): Promise<{ ok: boolean; result: unknown }> {
  const response = await fetch(`${apiDomain}/crm/v6/Leads`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: [leadData] }),
  });

  const result = await response.json();
  const record = result?.data?.[0];
  return { ok: response.ok && record?.status === 'success', result };
}

async function sendWhatsAppNotification(
  nombre: string,
  telefono: string,
  tratamiento: string,
  origen: string,
  campana: string,
  idioma: string,
  articulo = '',
): Promise<void> {
  const phone = import.meta.env.CALLMEBOT_PHONE;
  const apiKey = import.meta.env.CALLMEBOT_APIKEY;

  if (!phone || !apiKey) {
    console.error('CallMeBot: faltan CALLMEBOT_PHONE o CALLMEBOT_APIKEY, se omite el aviso por WhatsApp.');
    return;
  }

  const mensaje = [
    '🦷 Nuevo Lead - Arango Dental Clinic',
    `Nombre: ${nombre}`,
    `Teléfono: ${telefono}`,
    `Tratamiento: ${tratamiento || 'No especificado'}`,
    `Origen: ${origen}`,
    `Idioma del sitio: ${idioma}`,
    ...(campana ? [`Campaña: ${campana}`] : []),
    ...(articulo ? [`Artículo del blog: ${articulo}`] : []),
    'Revisá tu email o el CRM para más detalles.',
  ].join('\n');

  const params = new URLSearchParams({ phone, apikey: apiKey, text: mensaje });

  try {
    const response = await fetch(`${CALLMEBOT_URL}?${params.toString()}`);
    if (!response.ok) {
      console.error('CallMeBot: respuesta no OK al enviar el aviso:', response.status, await response.text());
    }
  } catch (error) {
    console.error('CallMeBot: error al enviar el aviso por WhatsApp:', error);
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Solicitud inválida.' }, 400);
  }

  // Honeypot: campo oculto que ningún humano completa. Si viene con valor,
  // es un bot — respondemos como si hubiera salido bien para no darle
  // pistas, pero no llegamos a tocar Zoho.
  if (body._gotcha) {
    return jsonResponse({ success: true }, 200);
  }

  const lang: 'es' | 'en' = body.lang === 'en' ? 'en' : 'es';
  const msg = MESSAGES[lang];

  if (!hasValidOrigin(request)) {
    return jsonResponse({ error: msg.forbidden }, 403);
  }

  let ip: string | null = null;
  try {
    ip = clientAddress;
  } catch {
    // clientAddress puede no estar disponible según el entorno; sin IP no
    // aplicamos rate-limit para esta solicitud puntual.
  }
  if (ip && isRateLimited(ip)) {
    return jsonResponse(
      { error: msg.rateLimited },
      429,
    );
  }

  const nombre = body.nombre?.trim();
  const telefono = body.telefono?.trim();
  const email = body.email?.trim();
  const tratamiento = body.tratamiento?.trim();

  if (!nombre || !telefono) {
    return jsonResponse({ error: msg.required }, 400);
  }

  if (!body.consentimiento) {
    return jsonResponse({ error: msg.consent }, 400);
  }

  const apiDomain = import.meta.env.ZOHO_API_DOMAIN;
  if (!apiDomain) {
    console.error('Falta la variable de entorno ZOHO_API_DOMAIN.');
    return jsonResponse({ error: msg.config }, 500);
  }

  try {
    const accessToken = await getAccessToken();

    const baseLead: Record<string, string> = {
      Last_Name: nombre,
      Phone: telefono,
      Lead_Source: DEFAULT_LEAD_SOURCE,
    };
    if (email) baseLead.Email = email;
    if (tratamiento) baseLead.Description = tratamiento;

    const marketing: Record<string, string> = {};
    for (const [key, { zohoField, maxLength }] of Object.entries(MARKETING_FIELDS)) {
      const value =
        key === 'landing_url'
          ? cleanLandingUrl(body.landing_url, maxLength)
          : cleanText(body[key as keyof LeadPayload], maxLength);
      if (value) marketing[zohoField] = value;
    }

    const fromBlog = body.source === 'blog';
    const leadSource = resolveLeadSource(
      cleanText(body.utm_source, MARKETING_FIELDS.utm_source.maxLength),
      cleanText(body.utm_medium, MARKETING_FIELDS.utm_medium.maxLength),
      fromBlog,
    );
    const attributedLead: Record<string, string> = { ...baseLead, ...marketing, Lead_Source: leadSource };

    let savedLead = attributedLead;
    let created = await createZohoLead(apiDomain, accessToken, attributedLead);

    // Un campo de atribución que Zoho rechace (valor no válido, fuente fuera del
    // picklist, campo renombrado) no debe costar un lead ni la atribución entera:
    // se descarta solo ese campo y se reintenta; si no alcanza, se guarda sin atribución.
    const attributionFields = new Set([...Object.keys(marketing), 'Lead_Source']);
    for (let retry = 0; retry < MAX_ATTRIBUTION_RETRIES && !created.ok; retry++) {
      const rejected = getRejectedField(created.result);
      if (!rejected || !attributionFields.has(rejected) || !(rejected in savedLead)) break;
      console.error(`Zoho CRM: se rechazó el campo ${rejected}, se reintenta sin él:`, JSON.stringify(created.result));
      const { [rejected]: _dropped, ...rest } = savedLead;
      savedLead = rejected === 'Lead_Source' ? { ...rest, Lead_Source: DEFAULT_LEAD_SOURCE } : rest;
      created = await createZohoLead(apiDomain, accessToken, savedLead);
    }

    const hasAttribution = Object.keys(marketing).length > 0 || leadSource !== DEFAULT_LEAD_SOURCE;
    if (!created.ok && hasAttribution) {
      console.error('Zoho CRM: falló el alta con atribución, se reintenta sin ella:', JSON.stringify(created.result));
      savedLead = baseLead;
      created = await createZohoLead(apiDomain, accessToken, baseLead);
    }

    if (!created.ok) {
      console.error('Zoho CRM: error creando el Lead:', JSON.stringify(created.result));
      return jsonResponse(
        { error: msg.saveFailed },
        502,
      );
    }

    await sendWhatsAppNotification(
      nombre,
      telefono,
      tratamiento ?? '',
      savedLead.Lead_Source,
      savedLead.Designation ?? '',
      lang === 'en' ? 'Inglés' : 'Español',
      fromBlog ? cleanArticleSlug(body.article) : '',
    );

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error('Error al crear el Lead en Zoho:', error);
    return jsonResponse(
      { error: msg.saveFailed },
      500,
    );
  }
};
