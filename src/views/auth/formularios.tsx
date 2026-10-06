import { useState, type FormEvent } from 'react';
import { IconCandado, IconCorreo, IconFlechaIzquierda, IconUsuario } from '@/components/icons';
import { Button } from '@/components/ui';
import {
  crearCuenta,
  definirNuevaContrasena,
  enviarCorreoRecuperacion,
  iniciarSesion,
} from '@/lib/supabase/auth';
import {
  AvisoError,
  AvisoExito,
  CampoAuth,
  CampoContrasena,
  LARGO_MINIMO_CONTRASENA,
  evaluarContrasena,
} from './componentes';

export type ModoAuth = 'entrar' | 'registro' | 'recuperar';

const ICONO = 'size-[1.125rem]';

/* ── Iniciar sesión ───────────────────────────────────────────────────────── */

export function FormularioEntrar({ onCambiarModo }: { onCambiarModo: (modo: ModoAuth) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setEnviando(true);
    setError('');

    const resultado = await iniciarSesion(email, password);
    // Si entra, `onAuthStateChange` cambia la vista: no hay que hacer nada más.
    if (!resultado.ok) {
      setError(resultado.mensaje ?? '');
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <CampoAuth
        etiqueta="Correo"
        icono={<IconCorreo className={ICONO} />}
        type="email"
        autoComplete="email"
        placeholder="tu@correo.cl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div>
        <CampoContrasena
          etiqueta="Contraseña"
          icono={<IconCandado className={ICONO} />}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => onCambiarModo('recuperar')}
          className="text-accent mt-2 cursor-pointer text-[0.75rem] font-semibold hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && <AvisoError mensaje={error} />}

      <Button type="submit" variante="primary" className="mt-1 h-11 w-full" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </Button>

      <p className="text-muted text-center text-[0.8125rem]">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={() => onCambiarModo('registro')}
          className="text-accent cursor-pointer font-bold hover:underline"
        >
          Créala gratis
        </button>
      </p>
    </form>
  );
}

/* ── Crear cuenta ─────────────────────────────────────────────────────────── */

export function FormularioRegistro({ onCambiarModo }: { onCambiarModo: (modo: ModoAuth) => void }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(false);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError('');

    if (!evaluarContrasena(password).suficiente) {
      setError(`La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`);
      return;
    }
    if (password !== repetir) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    const resultado = await crearCuenta(nombre, email, password);

    if (!resultado.ok) {
      setError(resultado.mensaje ?? '');
      setEnviando(false);
      return;
    }

    // Sin confirmación por correo la sesión ya quedó abierta y el provider
    // cambia de vista solo; con confirmación hay que avisar al usuario.
    if (resultado.requiereConfirmacion) setConfirmacionPendiente(true);
    setEnviando(false);
  };

  if (confirmacionPendiente) {
    return (
      <div className="flex flex-col gap-5">
        <AvisoExito titulo="Revisa tu correo">
          Te enviamos un enlace a <strong className="text-strong">{email}</strong> para confirmar tu cuenta.
          Ábrelo desde este mismo dispositivo y quedarás dentro.
        </AvisoExito>
        <p className="text-muted text-[0.75rem] leading-relaxed">
          Si no llega en unos minutos, revisa la carpeta de spam o vuelve a registrarte con otro correo.
        </p>
        <Button variante="secondary" className="w-full" onClick={() => onCambiarModo('entrar')}>
          Volver a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <CampoAuth
        etiqueta="Tu nombre"
        icono={<IconUsuario className={ICONO} />}
        autoComplete="name"
        placeholder="María Contreras"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <CampoAuth
        etiqueta="Correo"
        icono={<IconCorreo className={ICONO} />}
        type="email"
        autoComplete="email"
        placeholder="tu@correo.cl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <CampoContrasena
        etiqueta="Contraseña"
        icono={<IconCandado className={ICONO} />}
        autoComplete="new-password"
        placeholder={`Mínimo ${LARGO_MINIMO_CONTRASENA} caracteres`}
        minLength={LARGO_MINIMO_CONTRASENA}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        medidor
        required
      />

      <CampoContrasena
        etiqueta="Repite la contraseña"
        icono={<IconCandado className={ICONO} />}
        autoComplete="new-password"
        placeholder="••••••••"
        value={repetir}
        onChange={(e) => setRepetir(e.target.value)}
        error={repetir.length > 0 && repetir !== password ? 'No coincide con la anterior.' : undefined}
        required
      />

      {error && <AvisoError mensaje={error} />}

      <Button type="submit" variante="primary" className="mt-1 h-11 w-full" disabled={enviando}>
        {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>

      <p className="text-muted text-center text-[0.8125rem]">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={() => onCambiarModo('entrar')}
          className="text-accent cursor-pointer font-bold hover:underline"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  );
}

/* ── Recuperar contraseña ─────────────────────────────────────────────────── */

export function FormularioRecuperar({ onCambiarModo }: { onCambiarModo: (modo: ModoAuth) => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setEnviando(true);
    setError('');

    const resultado = await enviarCorreoRecuperacion(email);
    setEnviando(false);

    if (!resultado.ok) {
      setError(resultado.mensaje ?? '');
      return;
    }
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="flex flex-col gap-5">
        <AvisoExito titulo="Correo enviado">
          Si existe una cuenta con <strong className="text-strong">{email}</strong>, recibirás un enlace para
          crear una contraseña nueva. El enlace vence en una hora.
        </AvisoExito>
        <Button variante="secondary" className="w-full" onClick={() => onCambiarModo('entrar')}>
          Volver a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <p className="text-muted text-[0.8125rem] leading-relaxed">
        Escribe el correo con el que te registraste y te mandamos un enlace para crear una contraseña nueva.
      </p>

      <CampoAuth
        etiqueta="Correo"
        icono={<IconCorreo className={ICONO} />}
        type="email"
        autoComplete="email"
        placeholder="tu@correo.cl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {error && <AvisoError mensaje={error} />}

      <Button type="submit" variante="primary" className="mt-1 h-11 w-full" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviarme el enlace'}
      </Button>

      <button
        type="button"
        onClick={() => onCambiarModo('entrar')}
        className="text-muted hover:text-strong mx-auto flex cursor-pointer items-center gap-1.5 text-[0.8125rem] font-semibold transition-colors"
      >
        <IconFlechaIzquierda className="size-4" />
        Volver
      </button>
    </form>
  );
}

/* ── Definir contraseña nueva (llegando desde el correo) ──────────────────── */

export function FormularioNuevaContrasena({ onListo }: { onListo: () => void }) {
  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError('');

    if (!evaluarContrasena(password).suficiente) {
      setError(`La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`);
      return;
    }
    if (password !== repetir) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    const resultado = await definirNuevaContrasena(password);
    setEnviando(false);

    if (!resultado.ok) {
      setError(resultado.mensaje ?? '');
      return;
    }
    onListo();
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <p className="text-muted text-[0.8125rem] leading-relaxed">
        Elige una contraseña nueva. Quedarás dentro de tu cuenta apenas la guardes.
      </p>

      <CampoContrasena
        etiqueta="Contraseña nueva"
        icono={<IconCandado className={ICONO} />}
        autoComplete="new-password"
        placeholder={`Mínimo ${LARGO_MINIMO_CONTRASENA} caracteres`}
        minLength={LARGO_MINIMO_CONTRASENA}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        medidor
        required
      />

      <CampoContrasena
        etiqueta="Repite la contraseña"
        icono={<IconCandado className={ICONO} />}
        autoComplete="new-password"
        placeholder="••••••••"
        value={repetir}
        onChange={(e) => setRepetir(e.target.value)}
        error={repetir.length > 0 && repetir !== password ? 'No coincide con la anterior.' : undefined}
        required
      />

      {error && <AvisoError mensaje={error} />}

      <Button type="submit" variante="primary" className="mt-1 h-11 w-full" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Guardar y entrar'}
      </Button>
    </form>
  );
}
