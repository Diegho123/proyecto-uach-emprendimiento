interface SeparadorProps {
  numero: number;
  titulo: string;
  descripcion?: string;
}

/**
 * Marca los pasos de la estructura de costos. El número importa: el orden es
 * el que hay que seguir para que los cálculos tengan sentido.
 */
export function Separador({ numero, titulo, descripcion }: SeparadorProps) {
  return (
    <div className="flex items-start gap-3 border-t pt-8">
      <span className="bg-[var(--accent-soft)] text-accent flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-[0.8125rem] font-bold">
        {numero}
      </span>
      <div className="min-w-0">
        <h3 className="text-[1.0625rem] leading-tight font-bold">{titulo}</h3>
        {descripcion && <p className="text-muted mt-1.5 max-w-2xl text-[0.8125rem] leading-relaxed">{descripcion}</p>}
      </div>
    </div>
  );
}
