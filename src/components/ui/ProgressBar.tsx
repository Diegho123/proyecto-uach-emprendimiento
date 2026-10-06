import { cn } from '@/lib/cn';

interface ProgressBarProps {
  /** 0–100. Se acota para que nunca desborde el riel. */
  porcentaje: number;
  tono?: 'accent' | 'positive' | 'warning';
  className?: string;
}

const TONOS = {
  accent: 'bg-[var(--accent)]',
  positive: 'bg-positive-500',
  warning: 'bg-warning-500',
} as const;

export function ProgressBar({ porcentaje, tono = 'accent', className }: ProgressBarProps) {
  const valor = Math.max(0, Math.min(100, porcentaje));

  return (
    <div
      className={cn('surface-sunken h-2 w-full overflow-hidden rounded-full border', className)}
      role="progressbar"
      aria-valuenow={Math.round(valor)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', TONOS[tono])}
        style={{ width: `${valor}%` }}
      />
    </div>
  );
}
