import type { DiagnosticoRiesgo, LoteLIFO, NivelRiesgo, PuntoCurva } from '@/types/domain';

/**
 * Motor de cálculo. Responde tres preguntas:
 *   1. ¿Cuánto tengo que vender para no perder plata? (punto de equilibrio)
 *   2. ¿Cuánto me queda libre por cada venta?        (margen de contribución)
 *   3. ¿Qué tan cerca del límite estoy?              (colchón de seguridad)
 */

export function margenContribucionUnitario(precioVenta: number, costoVariableUnitario: number): number {
  return Number(precioVenta || 0) - Number(costoVariableUnitario || 0);
}

/**
 * Unidades que hay que vender en el mes para cubrir los costos fijos.
 * Si cada venta no deja nada libre, no existe volumen que los cubra: null.
 */
export function puntoEquilibrioUnidades(costosFijos: number, margenUnitario: number): number | null {
  if (margenUnitario <= 0) return null;
  return Math.ceil(Number(costosFijos || 0) / margenUnitario);
}

export function puntoEquilibrioPesos(unidades: number | null, precioVenta: number): number | null {
  if (unidades === null) return null;
  return unidades * Number(precioVenta || 0);
}

export function resultadoOperacional(
  unidadesVendidas: number,
  precioVenta: number,
  costoVariableUnitario: number,
  costosFijos: number,
): number {
  const ingresos = unidadesVendidas * Number(precioVenta || 0);
  const variables = unidadesVendidas * Number(costoVariableUnitario || 0);
  return ingresos - variables - Number(costosFijos || 0);
}

/**
 * Puntos para dibujar ingresos vs. costos totales. Donde las dos líneas se
 * cruzan está el punto de equilibrio.
 */
export function generarCurvaEquilibrio(
  costosFijos: number,
  costoVariableUnitario: number,
  precioVenta: number,
  unidadesMaximas: number,
  pasos = 8,
): PuntoCurva[] {
  const tope = Math.max(1, Math.round(unidadesMaximas));
  const salto = Math.max(1, Math.round(tope / pasos));
  const puntos: PuntoCurva[] = [];

  for (let unidades = 0; unidades <= tope; unidades += salto) {
    puntos.push({
      unidades,
      ingresos: Math.round(unidades * Number(precioVenta || 0)),
      costos: Math.round(Number(costosFijos || 0) + unidades * Number(costoVariableUnitario || 0)),
    });
  }

  return puntos;
}

/**
 * Cuánto pueden bajar las ventas actuales antes de tocar el punto de equilibrio.
 * Alto es bueno; negativo significa que ya se está perdiendo plata.
 */
export function colchonDeSeguridad(ventasActuales: number, puntoEquilibrio: number | null): number {
  if (!ventasActuales || ventasActuales <= 0) return 0;
  if (puntoEquilibrio === null) return -100;
  return Math.round(((ventasActuales - puntoEquilibrio) / ventasActuales) * 100);
}

/** Traduce el colchón a un puntaje de 1 a 10: un solo número fácil de leer. */
export function puntajeSalud(colchonPorcentaje: number): number {
  const acotado = Math.max(0, Math.min(colchonPorcentaje, 50));
  return Math.round(1 + (acotado / 50) * 9);
}

export function clasificarRiesgo(ventasActuales: number, puntoEquilibrio: number | null): DiagnosticoRiesgo {
  const colchonPorcentaje = colchonDeSeguridad(ventasActuales, puntoEquilibrio);
  const puntaje = puntajeSalud(colchonPorcentaje);

  let nivel: NivelRiesgo = 'alto';
  let mensaje =
    'Estás muy cerca del límite: casi cualquier baja en las ventas te hace perder plata este mes.';

  if (colchonPorcentaje >= 30) {
    nivel = 'bajo';
    mensaje = 'Tienes buen margen. Aunque bajen las ventas, no deberías tener problemas.';
  } else if (colchonPorcentaje >= 10) {
    nivel = 'medio';
    mensaje = 'Tienes algo de margen, pero conviene no confiarse si las ventas caen.';
  }

  return { nivel, colchonPorcentaje, puntaje, mensaje };
}

/**
 * Precio que absorbe el costo total y deja el margen objetivo sobre la venta:
 * P = Costo / (1 - margen).
 */
export function precioSegunMargenObjetivo(costoTotalUnitario: number, margenObjetivo: number): number {
  const divisor = Math.max(0.01, 1 - margenObjetivo / 100);
  return Math.round(costoTotalUnitario / divisor);
}

/**
 * Punto de reorden: consumo diario × días de reposición, con 50% de holgura
 * para cubrir la variabilidad de la demanda.
 */
export function calcularPuntoReorden(ventasMensuales: number, leadTimeDias: number): number {
  const ventas = Math.max(0, Number(ventasMensuales) || 0);
  const dias = Math.max(1, Number(leadTimeDias) || 1);
  return Math.ceil((ventas / 30) * dias * 1.5);
}

/** Capas de un SKU ordenadas de la compra más reciente a la más antigua (LIFO). */
export function capasLIFO(lotes: LoteLIFO[], sku: string): LoteLIFO[] {
  return lotes
    .filter((lote) => lote.sku === sku)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export interface CapaConsumida {
  loteId: string;
  fecha: string;
  unidades: number;
  costoUnitario: number;
  costoTotal: number;
}

export interface ResultadoDespachoLIFO {
  lotesActualizados: LoteLIFO[];
  unidades: number;
  cmvTotal: number;
  costoUnitarioEfectivo: number;
  capas: CapaConsumida[];
}

/**
 * Despacha unidades consumiendo primero la última compra ingresada (UEPS).
 * Reconoce el costo de reposición más reciente, que es el que de verdad
 * afecta el margen cuando los precios suben.
 */
export function despacharLIFO(
  lotes: LoteLIFO[],
  sku: string,
  unidadesADespachar: number,
): ResultadoDespachoLIFO | null {
  const orden = capasLIFO(lotes, sku);
  const disponible = orden.reduce((acc, lote) => acc + lote.cantidadDisponible, 0);

  if (unidadesADespachar <= 0 || unidadesADespachar > disponible) return null;

  let remanente = unidadesADespachar;
  let cmvTotal = 0;
  const capas: CapaConsumida[] = [];
  const consumoPorLote = new Map<string, number>();

  for (const lote of orden) {
    if (remanente === 0) break;
    if (lote.cantidadDisponible === 0) continue;

    const descuento = Math.min(lote.cantidadDisponible, remanente);
    const costoTotal = descuento * lote.costoUnitario;

    cmvTotal += costoTotal;
    remanente -= descuento;
    consumoPorLote.set(lote.id, descuento);

    capas.push({
      loteId: lote.id,
      fecha: lote.fecha,
      unidades: descuento,
      costoUnitario: lote.costoUnitario,
      costoTotal,
    });
  }

  const lotesActualizados = lotes.map((lote) => {
    const consumido = consumoPorLote.get(lote.id);
    if (!consumido) return lote;
    return { ...lote, cantidadDisponible: lote.cantidadDisponible - consumido };
  });

  return {
    lotesActualizados,
    unidades: unidadesADespachar,
    cmvTotal,
    costoUnitarioEfectivo: Math.round(cmvTotal / unidadesADespachar),
    capas,
  };
}

/** Costo de reposición vigente de un SKU: la capa LIFO más reciente con stock. */
export function costoReposicionLIFO(lotes: LoteLIFO[], sku: string): number | null {
  const capa = capasLIFO(lotes, sku).find((lote) => lote.cantidadDisponible > 0);
  return capa ? capa.costoUnitario : null;
}
