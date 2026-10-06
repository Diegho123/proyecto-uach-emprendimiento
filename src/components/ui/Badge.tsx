import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type TonoBadge = 'neutral' | 'accent' | 'positive' | 'negative' | 'warning';

const TONOS: Record<TonoBadge, string> = {
  neutral: 'surface-sunken text-muted border-[var(--border-subtle)]',
  accent:
    'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/60',
  positive:
    'bg-positive-50 text-positive-700 border-positive-100 dark:bg-positive-700/15 dark:text-positive-500 dark:border-positive-700/30',
  negative:
    'bg-negative-50 text-negative-700 border-negative-100 dark:bg-negative-700/15 dark:text-negative-500 dark:border-negative-700/30',
  warning:
    'bg-warning-50 text-warning-700 border-warning-100 dark:bg-warning-700/15 dark:text-warning-500 dark:border-warning-700/30',
};

interface BadgeProps {
  children: ReactNode;
  tono?: TonoBadge;
  /** Punto de color a la izquierda, para estados en tablas. */
  punto?: boolean;
  className?: string;
}

export function Badge({ children, tono = 'neutral', punto = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[0.6875rem] font-bold whitespace-nowrap',
        TONOS[tono],
        className,
      )}
    >
      {punto && <span className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
