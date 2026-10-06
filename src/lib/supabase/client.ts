import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Cliente de Supabase.
 *
 * La app arranca igual sin credenciales: en ese caso trabaja con los datos de
 * ejemplo en memoria y `isSupabaseConfigured()` devuelve false. Al completar
 * `.env` con las claves del proyecto, toda la capa de repositorios queda activa
 * sin tocar ni un componente.
 *
 * Variables:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY  (o VITE_SUPABASE_PUBLISHABLE_KEY, ver abajo)
 */

const url = import.meta.env.VITE_SUPABASE_URL?.trim();

/**
 * Supabase renombró la clave pública: los proyectos nuevos la llaman
 * "publishable key" y los anteriores "anon key". Aceptamos los dos nombres de
 * variable para que dé lo mismo cómo la hayas escrito en `.env`.
 */
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export type TypedSupabaseClient = SupabaseClient<Database>;

export interface ProblemaConfiguracion {
  /** `peligro` bloquea el arranque; `formato` solo indica que algo falta. */
  gravedad: 'peligro' | 'formato';
  titulo: string;
  detalle: string;
}

/* ── Validación de las credenciales ───────────────────────────────────────── */

/**
 * Detecta una clave de servidor puesta por error en el frontend.
 *
 * Todo lo que va en `.env` con prefijo `VITE_` termina dentro del bundle, o sea
 * es público. La `service_role` (y las nuevas `sb_secret_…`) se saltan las
 * políticas RLS: publicarla deja la base entera abierta a cualquiera que mire
 * el código fuente de la página.
 */
function esClaveDeServidor(clave: string): boolean {
  if (clave.startsWith('sb_secret_')) return true;

  // Las claves antiguas son JWT: el rol viaja en el payload, en base64url.
  const partes = clave.split('.');
  if (partes.length !== 3) return false;

  try {
    const payload = JSON.parse(
      atob(partes[1].replace(/-/g, '+').replace(/_/g, '/')),
    ) as { role?: string };
    return payload.role === 'service_role';
  } catch {
    // No se pudo decodificar: no afirmamos nada.
    return false;
  }
}

function revisarConfiguracion(): ProblemaConfiguracion | null {
  if (!url && !anonKey) return null; // Modo demo deliberado.

  if (!url || !anonKey) {
    return {
      gravedad: 'formato',
      titulo: 'Falta una de las dos variables',
      detalle: `Tienes ${url ? 'la URL' : 'la clave'} pero no ${url ? 'la clave' : 'la URL'}. Completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env y reinicia el servidor.`,
    };
  }

  if (esClaveDeServidor(anonKey)) {
    return {
      gravedad: 'peligro',
      titulo: 'Esa es una clave de servidor',
      detalle:
        'La clave pública contiene una service_role o secret key. Esa clave se salta las políticas RLS y quedaría publicada en el navegador. Reemplázala por la publishable key (sb_publishable_…) o la anon key, y rota la que expusiste desde el panel de Supabase.',
    };
  }

  if (!/^https:\/\/[\w-]+\.supabase\.(co|in)$/.test(url) && !url.startsWith('http://localhost')) {
    return {
      gravedad: 'formato',
      titulo: 'La URL no parece la de un proyecto',
      detalle: `VITE_SUPABASE_URL vale "${url}". Debería verse como https://tuproyecto.supabase.co, sin barra ni ruta al final.`,
    };
  }

  return null;
}

const problema = revisarConfiguracion();

if (problema) {
  const consola = problema.gravedad === 'peligro' ? console.error : console.warn;
  consola(`[Supabase] ${problema.titulo}\n${problema.detalle}`);
}

/**
 * Qué anda mal con las credenciales, si es que algo anda mal.
 * La interfaz lo muestra para no caer en modo demo en silencio.
 */
export function problemaDeConfiguracion(): ProblemaConfiguracion | null {
  return problema;
}

/* ── Instancia ────────────────────────────────────────────────────────────── */

let cliente: TypedSupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  // Con una clave de servidor preferimos no conectar: mejor la app en demo que
  // la base de datos abierta.
  return Boolean(url && anonKey) && problema?.gravedad !== 'peligro';
}

/**
 * Devuelve el cliente, o `null` si el proyecto todavía no tiene credenciales.
 * Los repositorios usan esta variante para poder degradar a modo demo.
 */
export function getSupabase(): TypedSupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  cliente ??= createClient<Database>(url as string, anonKey as string, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: { schema: 'public' },
    global: {
      headers: { 'x-application-name': 'integra-pyme' },
    },
  });

  return cliente;
}

/**
 * Igual que `getSupabase()`, pero falla ruidosamente. Úsalo en flujos donde la
 * persistencia es obligatoria y seguir en modo demo sería un error silencioso.
 */
export function requireSupabase(): TypedSupabaseClient {
  const instancia = getSupabase();
  if (!instancia) {
    throw new Error(
      problema?.detalle ??
        'Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env',
    );
  }
  return instancia;
}
