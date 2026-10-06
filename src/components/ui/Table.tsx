import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/**
 * Tabla de datos. El scroll horizontal vive dentro del contenedor, nunca en el
 * body de la página, y la cabecera queda fija al desplazarse.
 */
export function Tabla({
  children,
  className,
  anchoMinimo,
}: {
  children: ReactNode;
  className?: string;
  anchoMinimo?: string;
}) {
  return (
    <div className={cn('-mx-1 overflow-x-auto px-1', className)}>
      <table className="w-full border-collapse text-left text-[0.8125rem]" style={{ minWidth: anchoMinimo }}>
        {children}
      </table>
    </div>
  );
}

export function TablaCabecera({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-10">
      <tr className="surface-panel">{children}</tr>
    </thead>
  );
}

interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  numerico?: boolean;
}

export function Th({ children, className, numerico, ...props }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        'label-eyebrow border-b border-[var(--border-subtle)] px-3 py-2.5 font-bold whitespace-nowrap',
        numerico && 'text-right',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TablaCuerpo({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr
      className={cn(
        'border-b border-[var(--border-subtle)] transition-colors last:border-0 hover:bg-[var(--surface-sunken)]',
        className,
      )}
    >
      {children}
    </tr>
  );
}

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numerico?: boolean;
  enfasis?: boolean;
}

export function Td({ children, className, numerico, enfasis, ...props }: TdProps) {
  return (
    <td
      className={cn(
        'px-3 py-2.5 align-middle',
        numerico ? 'text-right font-mono tabular' : 'text-default',
        enfasis && 'text-strong font-semibold',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}
