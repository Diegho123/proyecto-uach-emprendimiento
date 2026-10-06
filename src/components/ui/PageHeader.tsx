import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}

export function PageHeader({ eyebrow, titulo, descripcion, acciones }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="label-eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-[1.5rem] leading-tight font-extrabold">{titulo}</h2>
        {descripcion && (
          <p className="text-muted mt-2 max-w-2xl text-[0.875rem] leading-relaxed">{descripcion}</p>
        )}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </header>
  );
}
