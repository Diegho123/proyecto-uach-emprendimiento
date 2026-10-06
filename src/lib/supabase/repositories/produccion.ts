import type { Insumo, Receta, Recurso, Servicio } from '@/types/domain';
import { insumoAFila, insumoDesdeFila, recursoDesdeFila } from '../mappers';
import { conCliente, desempaquetar, type ResultadoRepo } from './base';

/* ── Insumos (restaurante) ────────────────────────────────────────────────── */

export async function listarInsumos(negocioId: string): Promise<ResultadoRepo<Insumo[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase.from('insumos').select('*').eq('negocio_id', negocioId).order('nombre'),
    );
    return filas.map(insumoDesdeFila);
  });
}

export async function crearInsumo(
  negocioId: string,
  insumo: Omit<Insumo, 'id'>,
): Promise<ResultadoRepo<Insumo>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase
        .from('insumos')
        .insert(insumoAFila({ ...insumo, id: '' }, negocioId))
        .select()
        .single(),
    );
    return insumoDesdeFila(fila);
  });
}

export async function eliminarInsumo(id: string): Promise<ResultadoRepo<true>> {
  return conCliente(async (supabase) => {
    const { error } = await supabase.from('insumos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true as const;
  });
}

/* ── Recetas ──────────────────────────────────────────────────────────────── */

/**
 * Trae recetas con sus ingredientes en una sola consulta anidada, resolviendo
 * el insumo de cada línea para no perder nombre, unidad ni costo unitario.
 */
export async function listarRecetas(negocioId: string): Promise<ResultadoRepo<Receta[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase
        .from('recetas')
        .select('*, receta_ingredientes(*, insumos(*))')
        .eq('negocio_id', negocioId)
        .order('nombre'),
    );

    return filas.map((fila) => ({
      id: fila.id,
      nombre: fila.nombre,
      precioVenta: Number(fila.precio_venta),
      costoTotal: Number(fila.costo_total),
      ventasEstimadas: Number(fila.ventas_estimadas),
      ingredientes: fila.receta_ingredientes.map((linea) => ({
        ...insumoDesdeFila(linea.insumos),
        cantidadUsada: Number(linea.cantidad_usada),
      })),
    }));
  });
}

/** Crea la receta y sus líneas de ingredientes en dos pasos encadenados. */
export async function crearReceta(
  negocioId: string,
  receta: Omit<Receta, 'id'>,
): Promise<ResultadoRepo<string>> {
  return conCliente(async (supabase) => {
    const cabecera = desempaquetar(
      await supabase
        .from('recetas')
        .insert({
          negocio_id: negocioId,
          nombre: receta.nombre,
          precio_venta: receta.precioVenta,
          costo_total: receta.costoTotal,
          ventas_estimadas: receta.ventasEstimadas,
        })
        .select()
        .single(),
    );

    if (receta.ingredientes.length > 0) {
      const { error } = await supabase.from('receta_ingredientes').insert(
        receta.ingredientes.map((ingrediente) => ({
          receta_id: cabecera.id,
          insumo_id: ingrediente.id,
          cantidad_usada: ingrediente.cantidadUsada,
        })),
      );
      if (error) throw new Error(error.message);
    }

    return cabecera.id;
  });
}

export async function eliminarReceta(id: string): Promise<ResultadoRepo<true>> {
  return conCliente(async (supabase) => {
    // receta_ingredientes cae por ON DELETE CASCADE.
    const { error } = await supabase.from('recetas').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true as const;
  });
}

/* ── Recursos y servicios (agencias) ──────────────────────────────────────── */

export async function listarRecursos(negocioId: string): Promise<ResultadoRepo<Recurso[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase.from('recursos').select('*').eq('negocio_id', negocioId).order('nombre'),
    );
    return filas.map(recursoDesdeFila);
  });
}

export async function listarServicios(negocioId: string): Promise<ResultadoRepo<Servicio[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase
        .from('servicios')
        .select('*, servicio_elementos(*, recursos(*))')
        .eq('negocio_id', negocioId)
        .order('nombre'),
    );

    return filas.map((fila) => ({
      id: fila.id,
      nombre: fila.nombre,
      precioVenta: Number(fila.precio_venta),
      costoTotal: Number(fila.costo_total),
      ventasMensuales: Number(fila.ventas_mensuales),
      elementos: fila.servicio_elementos.map((linea) => {
        const recurso = recursoDesdeFila(linea.recursos);
        return {
          id: recurso.id,
          nombre: recurso.nombre,
          unidad: recurso.unidad,
          costoPorUnidad: recurso.costoPorUnidad,
          cantidadUsada: Number(linea.cantidad_usada),
        };
      }),
    }));
  });
}

export async function crearServicio(
  negocioId: string,
  servicio: Omit<Servicio, 'id'>,
): Promise<ResultadoRepo<string>> {
  return conCliente(async (supabase) => {
    const cabecera = desempaquetar(
      await supabase
        .from('servicios')
        .insert({
          negocio_id: negocioId,
          nombre: servicio.nombre,
          precio_venta: servicio.precioVenta,
          costo_total: servicio.costoTotal,
          ventas_mensuales: servicio.ventasMensuales,
        })
        .select()
        .single(),
    );

    if (servicio.elementos.length > 0) {
      const { error } = await supabase.from('servicio_elementos').insert(
        servicio.elementos.map((elemento) => ({
          servicio_id: cabecera.id,
          recurso_id: elemento.id,
          cantidad_usada: elemento.cantidadUsada,
        })),
      );
      if (error) throw new Error(error.message);
    }

    return cabecera.id;
  });
}
