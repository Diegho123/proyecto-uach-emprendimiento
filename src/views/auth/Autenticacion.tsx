import { useState } from 'react';
import { useTema } from '@/app/useTema';
import { Logo } from '@/components/brand/Logo';
import { IconBaseDatos, IconLuna, IconSol } from '@/components/icons';
import { useAuth } from '@/store/authState';
import {
  FormularioEntrar,
  FormularioNuevaContrasena,
  FormularioRecuperar,
  FormularioRegistro,
  type ModoAuth,
} from './formularios';

const TITULOS: Record<ModoAuth, { titulo: string; bajada: string }> = {
  entrar: {
    titulo: 'Entra a tu cuenta',
    bajada: 'Retoma el control de tus márgenes donde lo dejaste.',
  },
  registro: {
    titulo: 'Crea tu cuenta',
    bajada: 'Empieza a saber cuánto tienes que vender para no perder plata.',
  },
  recuperar: {
    titulo: 'Recupera tu acceso',
    bajada: 'Te enviamos un enlace por correo.',
  },
};

const ARGUMENTOS = [
  {
    titulo: 'Tu punto de equilibrio, siempre a la vista',
    detalle: 'Cuántas unidades tienes que vender este mes para no perder plata.',
  },
  {
    titulo: 'El costo real, con merma incluida',
    detalle: 'Lo que se pierde antes de venderse también sale de tu margen.',
  },
  {
    titulo: 'Qué pasa si suben los costos',
    detalle: 'Simula shocks de precio o caídas de demanda antes de que ocurran.',
  },
];

export function Autenticacion() {
  const { estado, entrarEnModoDemo, terminarRecuperacion } = useAuth();
  const { tema, alternar } = useTema();
  const [modo, setModo] = useState<ModoAuth>('entrar');

  const recuperando = estado === 'recuperacion';
  const encabezado = recuperando
    ? { titulo: 'Define tu contraseña nueva', bajada: 'Es el último paso para volver a entrar.' }
    : TITULOS[modo];

  return (
    <div className="surface-app flex min-h-screen">
      <PanelMarca />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 px-6 py-5 lg:justify-end">
          <Logo className="lg:hidden" />
          <button
            type="button"
            onClick={alternar}
            className="text-muted hover:text-strong hover:surface-sunken cursor-pointer rounded-lg border p-2 transition-colors"
            aria-label={tema === 'claro' ? 'Activar tema oscuro' : 'Activar tema claro'}
          >
            {tema === 'claro' ? <IconLuna /> : <IconSol />}
          </button>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-12">
          <div key={recuperando ? 'recuperacion' : modo} className="animate-fade-rise w-full max-w-[24rem]">
            <div className="mb-7">
              <h1 className="text-[1.75rem] leading-tight font-extrabold">{encabezado.titulo}</h1>
              <p className="text-muted mt-2 text-[0.875rem] leading-relaxed">{encabezado.bajada}</p>
            </div>

            {recuperando ? (
              <FormularioNuevaContrasena onListo={terminarRecuperacion} />
            ) : modo === 'entrar' ? (
              <FormularioEntrar onCambiarModo={setModo} />
            ) : modo === 'registro' ? (
              <FormularioRegistro onCambiarModo={setModo} />
            ) : (
              <FormularioRecuperar onCambiarModo={setModo} />
            )}

            {!recuperando && (
              <div className="mt-8 border-t pt-6">
                <button
                  type="button"
                  onClick={entrarEnModoDemo}
                  className="text-muted hover:text-strong hover:surface-sunken flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed py-2.5 text-[0.8125rem] font-semibold transition-colors"
                >
                  <IconBaseDatos className="size-4" />
                  Explorar sin cuenta, con datos de ejemplo
                </button>
                <p className="text-faint mt-2 text-center text-[0.6875rem]">
                  Nada de lo que hagas en modo demo se guarda.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Columna de marca. Se oculta bajo lg: en móvil el formulario es lo único que
 * importa y no conviene empujarlo bajo el pliegue.
 */
function PanelMarca() {
  return (
    <aside className="bg-ink-900 relative hidden w-[26rem] shrink-0 flex-col justify-between overflow-hidden p-10 lg:flex xl:w-[30rem]">
      {/* Retícula tenue: da profundidad sin competir con el texto. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '2.5rem 2.5rem',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[var(--color-brand-500)] opacity-20 blur-3xl"
      />

      <div className="relative">
        <Logo className="[&_span]:!text-white [&_span+span]:!text-ink-400" />
      </div>

      <div className="relative">
        <h2 className="text-[1.875rem] leading-[1.2] font-extrabold text-white">
          Sabe si tu negocio
          <br />
          está ganando plata.
        </h2>
        <p className="text-ink-400 mt-4 max-w-sm text-[0.875rem] leading-relaxed">
          Sin planillas ni contadores. Cargas tus costos una vez y el sistema te dice cuánto necesitas vender.
        </p>

        <ul className="mt-9 space-y-5">
          {ARGUMENTOS.map((argumento) => (
            <li key={argumento.titulo} className="flex gap-3.5">
              <span className="bg-brand-500 mt-1.5 size-1.5 shrink-0 rounded-full" />
              <div>
                <p className="text-[0.875rem] font-bold text-white">{argumento.titulo}</p>
                <p className="text-ink-400 mt-1 text-[0.8125rem] leading-relaxed">{argumento.detalle}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-ink-500 relative text-[0.6875rem]">
        Tus datos quedan aislados por usuario: nadie más puede consultarlos.
      </p>
    </aside>
  );
}
