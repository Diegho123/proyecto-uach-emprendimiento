import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** `sunken` para zonas de trabajo (drop zones, previsualizaciones). */
  tone?: 'panel' | 'sunken';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
} as const;

export function Card({ children, className, tone = 'panel', padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card min-w-0 border shadow-card',
        tone === 'panel' ? 'surface-panel' : 'surface-sunken',
        PADDING[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  titulo: ReactNode;
  descripcion?: ReactNode;
  eyebrow?: ReactNode;
  acciones?: ReactNode;
  className?: string;
}

export function CardHeader({ titulo, descripcion, eyebrow, acciones, className }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="label-eyebrow mb-1.5">{eyebrow}</p>}
        <h3 className="text-[0.9375rem] leading-tight font-bold">{titulo}</h3>
        {descripcion && (
          <p className="text-muted mt-1 max-w-prose text-[0.8125rem] leading-relaxed">{descripcion}</p>
        )}
      </div>
      {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
    </div>
  );
}
