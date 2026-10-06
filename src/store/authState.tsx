import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { cerrarSesion as cerrarSesionRemota, usuarioDesdeSesion, type UsuarioSesion } from '@/lib/supabase/auth';

/**
 * Estados posibles de la sesión:
 *
 *  cargando     — todavía no sabemos si hay sesión guardada
 *  sin_sesion   — hay que iniciar sesión o crear cuenta
 *  recuperacion — el usuario llegó desde el enlace del correo y debe definir
 *                 una contraseña nueva antes de entrar
 *  autenticado  — sesión válida
 *  demo         — sin credenciales, o el usuario eligió explorar sin cuenta
 */
export type EstadoSesion = 'cargando' | 'sin_sesion' | 'recuperacion' | 'autenticado' | 'demo';

/** Lo que informa Supabase, sin considerar la elección de modo demo. */
type EstadoRemoto = 'cargando' | 'sin_sesion' | 'recuperacion' | 'autenticado';

interface AuthState {
  estado: EstadoSesion;
  usuario: UsuarioSesion | null;
  /** Hay credenciales de Supabase: existe a dónde iniciar sesión. */
  hayBackend: boolean;

  /** Entra a la app sin cuenta, con los datos de ejemplo. */
  entrarEnModoDemo: () => void;
  salirDelModoDemo: () => void;
  cerrarSesion: () => Promise<void>;
  /** Tras definir la contraseña nueva, sigue a la app con la sesión ya activa. */
  terminarRecuperacion: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configurado = isSupabaseConfigured();

  const [estadoRemoto, setEstadoRemoto] = useState<EstadoRemoto>('cargando');
  const [demoElegido, setDemoElegido] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    if (!configurado) return;

    const supabase = getSupabase();
    if (!supabase) return;

    let vigente = true;

    const { data: suscripcion } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (!vigente) return;

      setUsuario(usuarioDesdeSesion(sesion?.user ?? null));

      // El enlace de recuperación abre una sesión válida, pero el usuario aún
      // no eligió contraseña: lo retenemos en el formulario en vez de dejarlo
      // entrar con una credencial que no conoce.
      if (evento === 'PASSWORD_RECOVERY') {
        setDemoElegido(false);
        setEstadoRemoto('recuperacion');
        return;
      }

      if (!sesion) {
        setEstadoRemoto('sin_sesion');
        return;
      }

      // Entrar con cuenta real deja atrás el modo demo.
      if (evento === 'SIGNED_IN') setDemoElegido(false);

      // Un refresco de token no debe sacar al usuario del formulario de
      // recuperación si todavía está en él.
      setEstadoRemoto((actual) => (actual === 'recuperacion' ? actual : 'autenticado'));
    });

    return () => {
      vigente = false;
      suscripcion.subscription.unsubscribe();
    };
  }, [configurado]);

  /**
   * La elección de modo demo manda sobre "sin sesión": si no lo hiciera, el
   * evento inicial de Supabase (que llega después del clic) devolvería al
   * usuario al login apenas entra a explorar.
   *
   * Una sesión real o una recuperación en curso sí tienen prioridad.
   */
  const estado: EstadoSesion = !configurado
    ? 'demo'
    : estadoRemoto === 'autenticado' || estadoRemoto === 'recuperacion'
      ? estadoRemoto
      : demoElegido
        ? 'demo'
        : estadoRemoto;

  const cerrarSesion = useCallback(async () => {
    setDemoElegido(false);
    if (!configurado) return;
    await cerrarSesionRemota();
    setUsuario(null);
    setEstadoRemoto('sin_sesion');
  }, [configurado]);

  const value = useMemo<AuthState>(
    () => ({
      estado,
      usuario,
      hayBackend: configurado,
      entrarEnModoDemo: () => setDemoElegido(true),
      salirDelModoDemo: () => setDemoElegido(false),
      cerrarSesion,
      terminarRecuperacion: () => setEstadoRemoto('autenticado'),
    }),
    [estado, usuario, configurado, cerrarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return contexto;
}
