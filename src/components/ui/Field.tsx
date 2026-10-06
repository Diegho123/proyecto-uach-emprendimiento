import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const CONTROL_BASE =
  'w-full rounded-lg border surface-panel px-3 text-[0.8125rem] text-strong transition-colors ' +
  'placeholder:text-[var(--text-faint)] hover:border-[var(--border-strong)] ' +
  'focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:surface-sunken';

interface EnvoltorioProps {
  etiqueta?: ReactNode;
  ayuda?: ReactNode;
  sufijo?: ReactNode;
  className?: string;
  children: (id: string) => ReactNode;
}

function Envoltorio({ etiqueta, ayuda, sufijo, className, children }: EnvoltorioProps) {
  const id = useId();

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {etiqueta && (
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={id} className="text-default text-[0.75rem] font-semibold">
            {etiqueta}
          </label>
          {sufijo}
        </div>
      )}
      {children(id)}
      {ayuda && <p className="text-faint text-[0.6875rem] leading-snug">{ayuda}</p>}
    </div>
  );
}

interface CampoTextoProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  etiqueta?: ReactNode;
  ayuda?: ReactNode;
  sufijo?: ReactNode;
  className?: string;
  inputClassName?: string;
  /** Alinea a la derecha y usa cifras monoespaciadas: para montos. */
  numerico?: boolean;
}

export function CampoTexto({
  etiqueta,
  ayuda,
  sufijo,
  className,
  inputClassName,
  numerico,
  ...props
}: CampoTextoProps) {
  return (
    <Envoltorio etiqueta={etiqueta} ayuda={ayuda} sufijo={sufijo} className={className}>
      {(id) => (
        <input
          id={id}
          className={cn(CONTROL_BASE, 'h-10', numerico && 'text-right font-mono tabular', inputClassName)}
          {...props}
        />
      )}
    </Envoltorio>
  );
}

interface CampoSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  etiqueta?: ReactNode;
  ayuda?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function CampoSelect({ etiqueta, ayuda, className, children, ...props }: CampoSelectProps) {
  return (
    <Envoltorio etiqueta={etiqueta} ayuda={ayuda} className={className}>
      {(id) => (
        <select id={id} className={cn(CONTROL_BASE, 'h-10 cursor-pointer appearance-none pr-9', SELECT_CARET)} {...props}>
          {children}
        </select>
      )}
    </Envoltorio>
  );
}

// Chevron embebido: evita depender de una librería de íconos para un solo glifo.
const SELECT_CARET =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%236b7789' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E\")] bg-[length:12px] bg-[position:right_0.75rem_center] bg-no-repeat";

interface CampoAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  etiqueta?: ReactNode;
  ayuda?: ReactNode;
  className?: string;
}

export function CampoArea({ etiqueta, ayuda, className, ...props }: CampoAreaProps) {
  return (
    <Envoltorio etiqueta={etiqueta} ayuda={ayuda} className={className}>
      {(id) => (
        <textarea id={id} className={cn(CONTROL_BASE, 'resize-y py-2.5 font-mono text-[0.75rem] leading-relaxed')} {...props} />
      )}
    </Envoltorio>
  );
}

interface DeslizadorProps {
  etiqueta: ReactNode;
  valorMostrado: ReactNode;
  min: number;
  max: number;
  paso: number;
  valor: number;
  onChange: (valor: number) => void;
  tonoValor?: 'accent' | 'positive' | 'negative';
  className?: string;
}

export function Deslizador({
  etiqueta,
  valorMostrado,
  min,
  max,
  paso,
  valor,
  onChange,
  tonoValor = 'accent',
  className,
}: DeslizadorProps) {
  const id = useId();
  const tono = {
    accent: 'text-accent',
    positive: 'text-positive-600 dark:text-positive-500',
    negative: 'text-negative-600 dark:text-negative-500',
  }[tonoValor];

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-default text-[0.75rem] font-semibold">
          {etiqueta}
        </label>
        <span className={cn('font-mono text-[0.8125rem] font-bold tabular', tono)}>{valorMostrado}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-brand"
      />
    </div>
  );
}
