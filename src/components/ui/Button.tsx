import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Tamano = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  children: ReactNode;
  iconoIzquierda?: ReactNode;
}

const VARIANTES: Record<Variante, string> = {
  primary:
    'bg-[var(--accent)] text-white shadow-subtle hover:brightness-110 active:brightness-95 disabled:hover:brightness-100',
  secondary:
    'surface-panel border text-default hover:surface-sunken hover:text-strong active:scale-[0.99]',
  ghost: 'text-muted hover:surface-sunken hover:text-strong',
  danger:
    'border border-negative-100 bg-negative-50 text-negative-700 hover:bg-negative-100 dark:border-negative-700/40 dark:bg-negative-700/15 dark:text-negative-500 dark:hover:bg-negative-700/25',
  success:
    'border border-positive-100 bg-positive-50 text-positive-700 hover:bg-positive-100 dark:border-positive-700/40 dark:bg-positive-700/15 dark:text-positive-500 dark:hover:bg-positive-700/25',
};

const TAMANOS: Record<Tamano, string> = {
  sm: 'h-8 px-3 text-[0.75rem] gap-1.5',
  md: 'h-10 px-4 text-[0.8125rem] gap-2',
};

export function Button({
  variante = 'secondary',
  tamano = 'md',
  className,
  children,
  iconoIzquierda,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-all duration-150',
        'disabled:cursor-not-allowed disabled:opacity-45',
        VARIANTES[variante],
        TAMANOS[tamano],
        className,
      )}
      {...props}
    >
      {iconoIzquierda}
      {children}
    </button>
  );
}
