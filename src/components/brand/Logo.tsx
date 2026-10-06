import { cn } from '@/lib/cn';

interface LogoProps {
  /** `compacto` deja solo el isotipo, para la barra lateral colapsada. */
  variante?: 'completo' | 'compacto';
  className?: string;
}

export function Logo({ variante = 'completo', className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <Isotipo />
      {variante === 'completo' && (
        <div className="flex min-w-0 flex-col leading-none">
          <span className="font-display text-strong text-[1.0625rem] font-extrabold tracking-tight">
            Integra<span className="text-accent">Pyme</span>
          </span>
          <span className="label-eyebrow mt-1 text-[0.5625rem]">Control de márgenes</span>
        </div>
      )}
    </div>
  );
}

/**
 * Isotipo: una barra que crece sobre una línea base. La marca de nivel
 * cruzándola es el punto de equilibrio, que es de lo que trata el producto.
 */
function Isotipo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn('size-8 shrink-0', className)}
    >
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path d="M8 22.5V16.5" stroke="white" strokeOpacity="0.5" strokeWidth="2.75" strokeLinecap="round" />
      <path d="M14.5 22.5V12" stroke="white" strokeOpacity="0.75" strokeWidth="2.75" strokeLinecap="round" />
      <path d="M21 22.5V8.5" stroke="white" strokeWidth="2.75" strokeLinecap="round" />
      <path d="M5.5 18.25H26.5" stroke="#12b76a" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.1 4.4" />
    </svg>
  );
}
