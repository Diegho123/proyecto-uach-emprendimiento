const CLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

/**
 * El peso chileno no usa decimales, pero un costo unitario sí: un insumo puede
 * costar $8,5 por gramo y redondearlo a $9 falsea la ficha de la receta.
 */
const CLP_UNITARIO = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 2,
});

const NUMERO = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });

const DECIMAL = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function esFinito(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor);
}

/** "$1.500.000" — el formato con el que un dueño de pyme lee sus números. */
export function formatearCLP(valor: number | null | undefined): string {
  if (!esFinito(valor)) return CLP.format(0);
  // Bajo $100 los decimales importan (costos por gramo o mililitro).
  if (!Number.isInteger(valor) && Math.abs(valor) < 100) return CLP_UNITARIO.format(valor);
  return CLP.format(Math.round(valor));
}

/** Versión compacta para ejes de gráficos: $1,2M / $340k. */
export function formatearCLPCompacto(valor: number | null | undefined): string {
  if (!esFinito(valor)) return '$0';
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) return `$${DECIMAL.format(valor / 1_000_000)}M`;
  if (abs >= 1_000) return `$${NUMERO.format(Math.round(valor / 1_000))}k`;
  return `$${NUMERO.format(Math.round(valor))}`;
}

export function formatearNumero(valor: number | null | undefined): string {
  if (!esFinito(valor)) return '0';
  return NUMERO.format(Math.round(valor));
}

export function formatearUnidades(valor: number | null | undefined): string {
  return `${formatearNumero(valor)} un.`;
}

/** Concuerda el sustantivo con la cantidad: "1 capa" / "3 capas". */
export function pluralizar(cantidad: number, singular: string, plural: string): string {
  return `${formatearNumero(cantidad)} ${Math.abs(Math.round(cantidad)) === 1 ? singular : plural}`;
}

export function formatearPorcentaje(valor: number | null | undefined, decimales = 1): string {
  if (!esFinito(valor)) return '0%';
  return `${valor.toFixed(decimales).replace('.', ',')}%`;
}

/** Antepone el signo para deltas, donde la dirección importa más que el monto. */
export function conSigno(valor: number, formateador: (n: number) => string): string {
  if (valor > 0) return `+${formateador(valor)}`;
  return formateador(valor);
}

export function formatearFecha(iso: string): string {
  const fecha = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return iso;
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha);
}

/** Identificadores locales para filas creadas en el cliente antes de persistir. */
export function idLocal(prefijo: string): string {
  return `${prefijo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
