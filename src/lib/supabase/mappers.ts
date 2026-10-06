import type {
  CausalMerma,
  CostoFijo,
  CostoVariable,
  CuentaFlujoCaja,
  Insumo,
  LoteLIFO,
  ProductoCatalogo,
  ProductoInventario,
  Recurso,
  UnidadMedida,
} from '@/types/domain';
import type {
  CausalMermaRow,
  CostoFijoRow,
  CostoVariableRow,
  CuentaFlujoCajaRow,
  InsumoRow,
  InventarioRow,
  LoteLifoRow,
  ProductoCatalogoRow,
  RecursoRow,
} from './database.types';

/**
 * Traducción entre filas de Postgres (snake_case) y el dominio (camelCase).
 * Todo el resto de la app trabaja solo con tipos de dominio.
 */

const UNIDADES: readonly UnidadMedida[] = ['kg', 'g', 'l', 'ml', 'un', 'caja', 'par', 'hora', 'proyecto'];

function aUnidad(valor: string): UnidadMedida {
  return (UNIDADES as readonly string[]).includes(valor) ? (valor as UnidadMedida) : 'un';
}

export const insumoDesdeFila = (fila: InsumoRow): Insumo => ({
  id: fila.id,
  nombre: fila.nombre,
  proveedor: fila.proveedor ?? '',
  unidad: aUnidad(fila.unidad),
  costoPorUnidad: Number(fila.costo_por_unidad),
});

export const insumoAFila = (insumo: Insumo, negocioId: string): Omit<InsumoRow, 'id' | 'created_at'> => ({
  negocio_id: negocioId,
  nombre: insumo.nombre,
  proveedor: insumo.proveedor || null,
  unidad: insumo.unidad,
  costo_por_unidad: insumo.costoPorUnidad,
});

export const catalogoDesdeFila = (fila: ProductoCatalogoRow): ProductoCatalogo => ({
  id: fila.id,
  nombre: fila.nombre,
  categoria: fila.categoria,
  costoMayorista: Number(fila.costo_mayorista),
  precioSugerido: Number(fila.precio_sugerido),
  unidad: aUnidad(fila.unidad),
});

export const inventarioDesdeFila = (fila: InventarioRow): ProductoInventario => ({
  id: fila.id,
  sku: fila.sku,
  nombre: fila.nombre,
  categoria: fila.categoria ?? undefined,
  costoCompra: Number(fila.costo_compra),
  precioVenta: Number(fila.precio_venta),
  ventasMensuales: Number(fila.ventas_mensuales),
  stockActual: Number(fila.stock_actual),
  leadTimeDias: Number(fila.lead_time_dias),
  mermaEsperada: Number(fila.merma_esperada),
  puntoReorden: Number(fila.punto_reorden),
});

export const inventarioAFila = (
  item: ProductoInventario,
  negocioId: string,
): Omit<InventarioRow, 'id' | 'created_at'> => ({
  negocio_id: negocioId,
  sku: item.sku,
  nombre: item.nombre,
  categoria: item.categoria ?? null,
  costo_compra: item.costoCompra,
  precio_venta: item.precioVenta,
  ventas_mensuales: item.ventasMensuales,
  stock_actual: item.stockActual,
  lead_time_dias: item.leadTimeDias,
  merma_esperada: item.mermaEsperada,
  punto_reorden: item.puntoReorden,
});

export const loteDesdeFila = (fila: LoteLifoRow): LoteLIFO => ({
  id: fila.id,
  fecha: fila.fecha,
  sku: fila.sku,
  producto: fila.producto,
  cantidadComprada: Number(fila.cantidad_comprada),
  cantidadDisponible: Number(fila.cantidad_disponible),
  costoUnitario: Number(fila.costo_unitario),
});

export const loteAFila = (lote: LoteLIFO, negocioId: string): Omit<LoteLifoRow, 'id' | 'created_at'> => ({
  negocio_id: negocioId,
  sku: lote.sku,
  producto: lote.producto,
  fecha: lote.fecha,
  cantidad_comprada: lote.cantidadComprada,
  cantidad_disponible: lote.cantidadDisponible,
  costo_unitario: lote.costoUnitario,
});

export const recursoDesdeFila = (fila: RecursoRow): Recurso => ({
  id: fila.id,
  nombre: fila.nombre,
  tipo: fila.tipo,
  unidad: aUnidad(fila.unidad),
  costoPorUnidad: Number(fila.costo_por_unidad),
});

export const costoVariableDesdeFila = (fila: CostoVariableRow): CostoVariable => ({
  id: fila.id,
  nombre: fila.nombre,
  costoPorUnidad: Number(fila.costo_por_unidad),
});

export const costoVariableAFila = (
  costo: CostoVariable,
  negocioId: string,
): Omit<CostoVariableRow, 'id'> => ({
  negocio_id: negocioId,
  nombre: costo.nombre,
  costo_por_unidad: costo.costoPorUnidad,
});

export const costoFijoDesdeFila = (fila: CostoFijoRow): CostoFijo => ({
  id: fila.id,
  nombre: fila.nombre,
  monto: Number(fila.monto),
});

export const costoFijoAFila = (costo: CostoFijo, negocioId: string): Omit<CostoFijoRow, 'id'> => ({
  negocio_id: negocioId,
  nombre: costo.nombre,
  monto: costo.monto,
});

export const causalMermaDesdeFila = (fila: CausalMermaRow): CausalMerma => ({
  id: fila.id,
  motivo: fila.motivo,
  porcentaje: Number(fila.porcentaje),
});

export const causalMermaAFila = (causal: CausalMerma, negocioId: string): Omit<CausalMermaRow, 'id'> => ({
  negocio_id: negocioId,
  motivo: causal.motivo,
  porcentaje: causal.porcentaje,
});

export const cuentaFlujoDesdeFila = (fila: CuentaFlujoCajaRow): CuentaFlujoCaja => ({
  id: fila.id,
  tipo: fila.tipo,
  nombre: fila.nombre,
  valores: Array.isArray(fila.valores) ? fila.valores.map(Number) : Array(12).fill(0),
});

export const cuentaFlujoAFila = (
  cuenta: CuentaFlujoCaja,
  negocioId: string,
  orden: number,
): Omit<CuentaFlujoCajaRow, 'id'> => ({
  negocio_id: negocioId,
  tipo: cuenta.tipo,
  nombre: cuenta.nombre,
  valores: cuenta.valores,
  orden,
});
