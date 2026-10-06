import type { LoteLIFO, ProductoCatalogo, ProductoInventario } from '@/types/domain';
import {
  catalogoDesdeFila,
  inventarioAFila,
  inventarioDesdeFila,
  loteAFila,
  loteDesdeFila,
} from '../mappers';
import { conCliente, desempaquetar, type ResultadoRepo } from './base';

/* ── Catálogo mayorista ───────────────────────────────────────────────────── */

export async function listarCatalogo(negocioId: string): Promise<ResultadoRepo<ProductoCatalogo[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase.from('productos_catalogo').select('*').eq('negocio_id', negocioId).order('nombre'),
    );
    return filas.map(catalogoDesdeFila);
  });
}

/* ── Inventario activo ────────────────────────────────────────────────────── */

export async function listarInventario(negocioId: string): Promise<ResultadoRepo<ProductoInventario[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase.from('inventario').select('*').eq('negocio_id', negocioId).order('sku'),
    );
    return filas.map(inventarioDesdeFila);
  });
}

export async function crearProductoInventario(
  negocioId: string,
  producto: Omit<ProductoInventario, 'id'>,
): Promise<ResultadoRepo<ProductoInventario>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase
        .from('inventario')
        .insert(inventarioAFila({ ...producto, id: '' }, negocioId))
        .select()
        .single(),
    );
    return inventarioDesdeFila(fila);
  });
}

/** Carga masiva: una sola llamada para todo el lote importado desde Excel/CSV. */
export async function importarLoteInventario(
  negocioId: string,
  productos: Omit<ProductoInventario, 'id'>[],
): Promise<ResultadoRepo<ProductoInventario[]>> {
  return conCliente(async (supabase) => {
    if (productos.length === 0) return [];
    const filas = desempaquetar(
      await supabase
        .from('inventario')
        .insert(productos.map((p) => inventarioAFila({ ...p, id: '' }, negocioId)))
        .select(),
    );
    return filas.map(inventarioDesdeFila);
  });
}

export async function actualizarStock(
  id: string,
  stockActual: number,
): Promise<ResultadoRepo<ProductoInventario>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase.from('inventario').update({ stock_actual: stockActual }).eq('id', id).select().single(),
    );
    return inventarioDesdeFila(fila);
  });
}

export async function eliminarProductoInventario(id: string): Promise<ResultadoRepo<true>> {
  return conCliente(async (supabase) => {
    const { error } = await supabase.from('inventario').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true as const;
  });
}

/* ── Capas LIFO ───────────────────────────────────────────────────────────── */

export async function listarLotesLIFO(negocioId: string): Promise<ResultadoRepo<LoteLIFO[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase
        .from('lotes_lifo')
        .select('*')
        .eq('negocio_id', negocioId)
        .order('fecha', { ascending: false }),
    );
    return filas.map(loteDesdeFila);
  });
}

export async function crearLoteLIFO(
  negocioId: string,
  lote: Omit<LoteLIFO, 'id'>,
): Promise<ResultadoRepo<LoteLIFO>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase
        .from('lotes_lifo')
        .insert(loteAFila({ ...lote, id: '' }, negocioId))
        .select()
        .single(),
    );
    return loteDesdeFila(fila);
  });
}

/**
 * Persiste el consumo de capas tras un despacho LIFO.
 *
 * Se envía solo el saldo de las capas tocadas. Si más adelante varios usuarios
 * despachan el mismo SKU en paralelo, conviene mover esto a una función RPC
 * transaccional en Postgres (ver `supabase/schema.sql`).
 */
export async function aplicarConsumoLotes(
  consumos: { id: string; cantidadDisponible: number }[],
): Promise<ResultadoRepo<true>> {
  return conCliente(async (supabase) => {
    for (const consumo of consumos) {
      const { error } = await supabase
        .from('lotes_lifo')
        .update({ cantidad_disponible: consumo.cantidadDisponible })
        .eq('id', consumo.id);
      if (error) throw new Error(error.message);
    }
    return true as const;
  });
}
