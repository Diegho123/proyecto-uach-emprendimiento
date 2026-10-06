import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  className?: string;
}

export function EmptyState({ titulo, descripcion, accion, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'surface-sunken flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center',
        className,
      )}
    >
      <p className="text-strong text-[0.8125rem] font-semibold">{titulo}</p>
      {descripcion && <p className="text-muted max-w-sm text-[0.75rem] leading-relaxed">{descripcion}</p>}
      {accion && <div className="mt-1">{accion}</div>}
    </div>
  );
}
