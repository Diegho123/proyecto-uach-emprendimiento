import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, requireSupabase } from './client';

/**
 * Autenticación por correo y contraseña.
 *
 * Todo pasa por aquí para que ningún componente hable con `supabase.auth`
 * directamente y para traducir los errores, que Supabase devuelve en inglés.
 */

export interface ResultadoAuth {
  ok: boolean;
  /** Mensaje listo para mostrar; ya traducido. */
  mensaje?: string;
}

/** Datos del usuario que la interfaz necesita mostrar. */
export interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
}

const TRADUCCIONES: [RegExp, string][] = [
  [/invalid login credentials/i, 'El correo o la contraseña no coinciden.'],
  [/email not confirmed/i, 'Todavía no confirmas tu correo. Revisa tu bandeja de entrada.'],
  [/user already registered|already been registered/i, 'Ya existe una cuenta con este correo. Inicia sesión.'],
  [/password should be at least (\d+)/i, 'La contraseña debe tener al menos $1 caracteres.'],
  [/unable to validate email address|invalid format/i, 'El correo no tiene un formato válido.'],
  [/email rate limit exceeded|over_email_send_rate_limit/i, 'Enviamos demasiados correos. Espera unos minutos e intenta de nuevo.'],
  [/for security purposes.*(\d+) seconds/i, 'Por seguridad, espera $1 segundos antes de volver a intentarlo.'],
  [/new password should be different/i, 'La contraseña nueva debe ser distinta de la anterior.'],
  [/token has expired|invalid.*token/i, 'El enlace expiró. Pide uno nuevo.'],
  [/weak.?password/i, 'La contraseña es demasiado fácil de adivinar. Combina letras, números y símbolos.'],
  [/failed to fetch|network/i, 'No pudimos conectar con el servidor. Revisa tu conexión.'],
];

function traducir(error: unknown): string {
  const original = error instanceof Error ? error.message : String(error ?? '');

  for (const [patron, traduccion] of TRADUCCIONES) {
    const coincidencia = original.match(patron);
    if (coincidencia) {
      return traduccion.replace(/\$(\d)/g, (_, i: string) => coincidencia[Number(i)] ?? '');
    }
  }

  return original || 'Ocurrió un error inesperado. Intenta de nuevo.';
}

/** A dónde vuelve el usuario tras hacer clic en un enlace del correo. */
function urlDeRetorno(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

export function usuarioDesdeSesion(usuario: User | null): UsuarioSesion | null {
  if (!usuario) return null;

  const metadatos = usuario.user_metadata as { nombre?: string } | undefined;
  const email = usuario.email ?? '';

  return {
    id: usuario.id,
    email,
    nombre: metadatos?.nombre?.trim() || email.split('@')[0] || 'Usuario',
  };
}

export async function iniciarSesion(email: string, password: string): Promise<ResultadoAuth> {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, mensaje: traducir(error) };
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: traducir(error) };
  }
}

export interface ResultadoRegistro extends ResultadoAuth {
  /** True cuando Supabase exige confirmar el correo antes de entrar. */
  requiereConfirmacion?: boolean;
}

export async function crearCuenta(
  nombre: string,
  email: string,
  password: string,
): Promise<ResultadoRegistro> {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // `nombre` viaja en raw_user_meta_data; el trigger del esquema lo copia
      // a public.perfiles al crear el usuario.
      options: { data: { nombre: nombre.trim() }, emailRedirectTo: urlDeRetorno() },
    });

    if (error) return { ok: false, mensaje: traducir(error) };

    // Con confirmación activada, Supabase devuelve el usuario pero sin sesión.
    return { ok: true, requiereConfirmacion: !data.session };
  } catch (error) {
    return { ok: false, mensaje: traducir(error) };
  }
}

/**
 * Envía el correo de recuperación. Siempre responde igual haya o no cuenta con
 * ese correo: confirmar cuáles existen filtraría datos de los usuarios.
 */
export async function enviarCorreoRecuperacion(email: string): Promise<ResultadoAuth> {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: urlDeRetorno(),
    });
    if (error) return { ok: false, mensaje: traducir(error) };
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: traducir(error) };
  }
}

/** Define la contraseña nueva. Requiere la sesión temporal del enlace del correo. */
export async function definirNuevaContrasena(password: string): Promise<ResultadoAuth> {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, mensaje: traducir(error) };
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: traducir(error) };
  }
}

export async function cerrarSesion(): Promise<ResultadoAuth> {
  try {
    const supabase = requireSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) return { ok: false, mensaje: traducir(error) };
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: traducir(error) };
  }
}

export async function sesionActual(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
