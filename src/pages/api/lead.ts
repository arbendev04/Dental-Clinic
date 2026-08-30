export const prerender = false;

import type { APIRoute } from 'astro';

interface LeadPayload {
  nombre?: string;
  telefono?: string;
  email?: string;
  tratamiento?: string;
  consentimiento?: boolean;
  _gotcha?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.eu/oauth/v2/token';
const ALLOWED_ORIGIN_HOSTS = ['arangodentalclinic.es', 'localhost', '127.0.0.1'];
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_LIMIT_MAX_SUBMISSIONS = 3;

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

  if (!hasValidOrigin(request)) {
    return jsonResponse({ error: 'Solicitud no permitida.' }, 403);
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
      { error: 'Demasiadas solicitudes. Probá de nuevo más tarde o escribinos por WhatsApp.' },
      429,
    );
  }

  const nombre = body.nombre?.trim();
  const telefono = body.telefono?.trim();
  const email = body.email?.trim();
  const tratamiento = body.tratamiento?.trim();

  if (!nombre || !telefono) {
    return jsonResponse({ error: 'El nombre y el teléfono son obligatorios.' }, 400);
  }

  if (!body.consentimiento) {
    return jsonResponse({ error: 'Debes aceptar la política de privacidad para continuar.' }, 400);
  }

  const apiDomain = import.meta.env.ZOHO_API_DOMAIN;
  if (!apiDomain) {
    console.error('Falta la variable de entorno ZOHO_API_DOMAIN.');
    return jsonResponse({ error: 'Error de configuración del servidor.' }, 500);
  }

  try {
    const accessToken = await getAccessToken();

    const leadData: Record<string, string> = {
      Last_Name: nombre,
      Phone: telefono,
      Lead_Source: 'Sitio Web',
    };
    if (email) leadData.Email = email;
    if (tratamiento) leadData.Description = tratamiento;

    const zohoResponse = await fetch(`${apiDomain}/crm/v6/Leads`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [leadData] }),
    });

    const zohoResult = await zohoResponse.json();
    const record = zohoResult?.data?.[0];
    const isSuccess = zohoResponse.ok && record?.status === 'success';

    if (!isSuccess) {
      console.error('Zoho CRM: error creando el Lead:', JSON.stringify(zohoResult));
      return jsonResponse(
        { error: 'No hemos podido guardar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.' },
        502,
      );
    }

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error('Error al crear el Lead en Zoho:', error);
    return jsonResponse(
      { error: 'No hemos podido guardar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.' },
      500,
    );
  }
};
