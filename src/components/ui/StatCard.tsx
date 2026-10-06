import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Badge, type TonoBadge } from './Badge';

interface StatCardProps {
  etiqueta: string;
  valor: ReactNode;
  detalle?: ReactNode;
  indicador?: { texto: string; tono: TonoBadge };
  /** Tiñe la cifra cuando su signo es lo primero que hay que leer. */
  tonoValor?: 'neutral' | 'accent' | 'positive' | 'negative';
  /** Para valores que son texto y no cifra ("Sincronizado", "Ninguno"). */
  textual?: boolean;
  className?: string;
}

const TONO_VALOR = {
  neutral: 'text-strong',
  accent: 'text-accent',
  positive: 'text-positive-600 dark:text-positive-500',
  negative: 'text-negative-600 dark:text-negative-500',
} as const;

export function StatCard({
  etiqueta,
  valor,
  detalle,
  indicador,
  tonoValor = 'neutral',
  textual = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-card surface-panel flex min-w-0 flex-col justify-between gap-3 border p-4 shadow-card transition-shadow hover:shadow-raised',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="label-eyebrow">{etiqueta}</p>
        {indicador && <Badge tono={indicador.tono}>{indicador.texto}</Badge>}
      </div>

      <p
        className={cn(
          'leading-tight font-bold',
          textual ? 'text-[1.125rem]' : 'font-mono text-[1.625rem] leading-none tabular',
          TONO_VALOR[tonoValor],
        )}
      >
        {valor}
      </p>

      {detalle && <p className="text-muted text-[0.75rem] leading-snug">{detalle}</p>}
    </div>
  );
}

/** Rejilla estándar para filas de indicadores: se adapta sola al ancho. */
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-4', className)}>
      {children}
    </div>
  );
}
