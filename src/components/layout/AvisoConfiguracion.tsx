import { useState } from 'react';
import { IconCerrar } from '@/components/icons';
import { cn } from '@/lib/cn';
import { problemaDeConfiguracion } from '@/lib/supabase';

/**
 * Banda de aviso cuando `.env` tiene credenciales pero algo está mal.
 *
 * Sin esto, un error de tipeo en la clave deja la app en modo demo sin
 * explicación: se ven datos de ejemplo creyendo que son los reales.
 */
export function AvisoConfiguracion() {
  const problema = problemaDeConfiguracion();
  const [oculto, setOculto] = useState(false);

  if (!problema || oculto) return null;

  const esPeligro = problema.gravedad === 'peligro';

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 border-b px-4 py-3 sm:px-6',
        esPeligro
          ? 'bg-negative-50 border-negative-100 dark:bg-negative-700/15 dark:border-negative-700/30'
          : 'bg-warning-50 border-warning-100 dark:bg-warning-700/15 dark:border-warning-700/30',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-1.5 size-2 shrink-0 rounded-full',
          esPeligro ? 'bg-negative-500' : 'bg-warning-500',
        )}
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[0.8125rem] font-bold',
            esPeligro
              ? 'text-negative-700 dark:text-negative-500'
              : 'text-warning-700 dark:text-warning-500',
          )}
        >
          {problema.titulo}
        </p>
        <p className="text-default mt-1 text-[0.75rem] leading-relaxed">{problema.detalle}</p>
      </div>

      <button
        type="button"
        onClick={() => setOculto(true)}
        aria-label="Ocultar aviso"
        className="text-muted hover:text-strong -mt-1 cursor-pointer rounded-md p-1.5 transition-colors"
      >
        <IconCerrar className="size-4" />
      </button>
    </div>
  );
}
