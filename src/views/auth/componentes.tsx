import { useId, useMemo, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { IconCheck, IconOjo, IconOjoTachado } from '@/components/icons';
import { cn } from '@/lib/cn';

/* ── Campo con ícono ──────────────────────────────────────────────────────── */

interface CampoAuthProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  etiqueta: string;
  icono: ReactNode;
  error?: string;
}

export function CampoAuth({ etiqueta, icono, error, ...props }: CampoAuthProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-default text-[0.75rem] font-semibold">
        {etiqueta}
      </label>
      <div className="relative">
        <span className="text-faint pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">{icono}</span>
        <input
          id={id}
          className={cn(
            'surface-panel text-strong h-11 w-full rounded-lg border pl-10 text-[0.875rem] transition-colors',
            'placeholder:text-[var(--text-faint)] hover:border-[var(--border-strong)]',
            'focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-negative-500' : '',
          )}
          {...props}
        />
      </div>
      {error && <p className="text-negative-600 dark:text-negative-500 text-[0.6875rem] font-semibold">{error}</p>}
    </div>
  );
}

/* ── Campo de contraseña con ver/ocultar ──────────────────────────────────── */

interface CampoContrasenaProps extends Omit<CampoAuthProps, 'type'> {
  /** Muestra el medidor de robustez (solo tiene sentido al elegir contraseña). */
  medidor?: boolean;
}

export function CampoContrasena({ medidor = false, value, ...props }: CampoContrasenaProps) {
  const [visible, setVisible] = useState(false);
  const texto = typeof value === 'string' ? value : '';

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <CampoAuth type={visible ? 'text' : 'password'} value={value} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          // El campo tiene etiqueta arriba: este desplazamiento centra el botón
          // sobre el input, no sobre el bloque completo.
          className="text-faint hover:text-strong absolute top-[1.85rem] right-2 cursor-pointer rounded-md p-1.5 transition-colors"
        >
          {visible ? <IconOjoTachado className="size-4" /> : <IconOjo className="size-4" />}
        </button>
      </div>
      {medidor && texto.length > 0 && <MedidorContrasena valor={texto} />}
    </div>
  );
}

/* ── Medidor de robustez ──────────────────────────────────────────────────── */

export const LARGO_MINIMO_CONTRASENA = 8;

export interface FuerzaContrasena {
  puntaje: 0 | 1 | 2 | 3 | 4;
  etiqueta: string;
  suficiente: boolean;
}

/**
 * Heurística simple: largo y variedad de caracteres. No pretende medir entropía
 * real, solo evitar contraseñas obviamente débiles antes de enviar el registro.
 */
export function evaluarContrasena(valor: string): FuerzaContrasena {
  let puntaje = 0;
  if (valor.length >= LARGO_MINIMO_CONTRASENA) puntaje++;
  if (valor.length >= 12) puntaje++;
  if (/[a-z]/.test(valor) && /[A-Z]/.test(valor)) puntaje++;
  if (/\d/.test(valor) && /[^\w\s]/.test(valor)) puntaje++;

  const acotado = Math.min(puntaje, 4) as 0 | 1 | 2 | 3 | 4;
  const etiquetas = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'] as const;

  return {
    puntaje: acotado,
    etiqueta: etiquetas[acotado],
    suficiente: valor.length >= LARGO_MINIMO_CONTRASENA,
  };
}

function MedidorContrasena({ valor }: { valor: string }) {
  const fuerza = useMemo(() => evaluarContrasena(valor), [valor]);

  const color =
    fuerza.puntaje <= 1 ? 'bg-negative-500' : fuerza.puntaje === 2 ? 'bg-warning-500' : 'bg-positive-500';

  const tono =
    fuerza.puntaje <= 1
      ? 'text-negative-600 dark:text-negative-500'
      : fuerza.puntaje === 2
        ? 'text-warning-600 dark:text-warning-500'
        : 'text-positive-600 dark:text-positive-500';

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((tramo) => (
          <span
            key={tramo}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              tramo < fuerza.puntaje ? color : 'surface-sunken border',
            )}
          />
        ))}
      </div>
      <span className={cn('w-20 shrink-0 text-right text-[0.6875rem] font-bold', tono)}>{fuerza.etiqueta}</span>
    </div>
  );
}

/* ── Mensajes ─────────────────────────────────────────────────────────────── */

export function AvisoError({ mensaje }: { mensaje: string }) {
  return (
    <p
      role="alert"
      className="bg-negative-50 text-negative-700 dark:bg-negative-700/15 dark:text-negative-500 border-negative-100 dark:border-negative-700/30 rounded-lg border px-3 py-2.5 text-[0.75rem] font-semibold"
    >
      {mensaje}
    </p>
  );
}

export function AvisoExito({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="bg-positive-50 dark:bg-positive-700/12 border-positive-100 dark:border-positive-700/30 flex gap-3 rounded-lg border p-4">
      <span className="bg-positive-500 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white">
        <IconCheck className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-positive-700 dark:text-positive-500 text-[0.8125rem] font-bold">{titulo}</p>
        <div className="text-default mt-1 text-[0.75rem] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
