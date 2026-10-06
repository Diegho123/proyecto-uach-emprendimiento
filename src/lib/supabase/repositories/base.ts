import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { getSupabase, type TypedSupabaseClient } from '../client';

/**
 * Resultado uniforme de todo repositorio.
 *
 * `modo: 'demo'` no es un error: significa que Supabase aún no está
 * configurado y la app debe seguir con los datos de ejemplo. La UI puede
 * distinguir "sin conexión configurada" de "la consulta falló".
 */
export type ResultadoRepo<T> =
  | { ok: true; datos: T; modo: 'supabase' }
  | { ok: true; datos: null; modo: 'demo' }
  | { ok: false; error: string; modo: 'supabase' };

export function modoDemo<T>(): ResultadoRepo<T> {
  return { ok: true, datos: null, modo: 'demo' };
}

export function exito<T>(datos: T): ResultadoRepo<T> {
  return { ok: true, datos, modo: 'supabase' };
}

export function fallo<T>(error: unknown): ResultadoRepo<T> {
  const mensaje =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Error desconocido al consultar Supabase';
  return { ok: false, error: mensaje, modo: 'supabase' };
}

/**
 * Envuelve una consulta: corta a modo demo si no hay cliente y normaliza el
 * manejo de errores, para que ningún repositorio repita ese preámbulo.
 */
export async function conCliente<T>(
  operacion: (supabase: TypedSupabaseClient) => Promise<T>,
): Promise<ResultadoRepo<T>> {
  const supabase = getSupabase();
  if (!supabase) return modoDemo<T>();

  try {
    return exito(await operacion(supabase));
  } catch (error) {
    return fallo<T>(error);
  }
}

/** Lanza si la respuesta de PostgREST trae error; si no, devuelve los datos. */
export function desempaquetar<T>(respuesta: PostgrestSingleResponse<T>): T {
  if (respuesta.error) throw new Error(respuesta.error.message);
  if (respuesta.data === null) throw new Error('La consulta no devolvió datos');
  return respuesta.data;
}
