import type { CausalMerma, CostoFijo, CostoVariable } from '@/types/domain';
import {
  causalMermaAFila,
  causalMermaDesdeFila,
  costoFijoAFila,
  costoFijoDesdeFila,
  costoVariableAFila,
  costoVariableDesdeFila,
} from '../mappers';
import { conCliente, desempaquetar, type ResultadoRepo } from './base';

/* ── Costos fijos ─────────────────────────────────────────────────────────── */

export async function listarCostosFijos(negocioId: string): Promise<ResultadoRepo<CostoFijo[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase.from('costos_fijos').select('*').eq('negocio_id', negocioId).order('nombre'),
    );
    return filas.map(costoFijoDesdeFila);
  });
}

export async function crearCostoFijo(
  negocioId: string,
  costo: Omit<CostoFijo, 'id'>,
): Promise<ResultadoRepo<CostoFijo>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase
        .from('costos_fijos')
        .insert(costoFijoAFila({ ...costo, id: '' }, negocioId))
        .select()
        .single(),
    );
    return costoFijoDesdeFila(fila);
  });
}

export async function eliminarCostoFijo(id: string): Promise<ResultadoRepo<true>> {
  return conCliente(async (supabase) => {
    const { error } = await supabase.from('costos_fijos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true as const;
  });
}

/* ── Costos variables ─────────────────────────────────────────────────────── */

export async function listarCostosVariables(negocioId: string): Promise<ResultadoRepo<CostoVariable[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase.from('costos_variables').select('*').eq('negocio_id', negocioId).order('nombre'),
    );
    return filas.map(costoVariableDesdeFila);
  });
}

export async function crearCostoVariable(
  negocioId: string,
  costo: Omit<CostoVariable, 'id'>,
): Promise<ResultadoRepo<CostoVariable>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase
        .from('costos_variables')
        .insert(costoVariableAFila({ ...costo, id: '' }, negocioId))
        .select()
        .single(),
    );
    return costoVariableDesdeFila(fila);
  });
}

export async function eliminarCostoVariable(id: string): Promise<ResultadoRepo<true>> {
  return conCliente(async (supabase) => {
    const { error } = await supabase.from('costos_variables').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true as const;
  });
}

/* ── Causales de merma ────────────────────────────────────────────────────── */

export async function listarCausalesMerma(negocioId: string): Promise<ResultadoRepo<CausalMerma[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase.from('causales_merma').select('*').eq('negocio_id', negocioId).order('motivo'),
    );
    return filas.map(causalMermaDesdeFila);
  });
}

export async function crearCausalMerma(
  negocioId: string,
  causal: Omit<CausalMerma, 'id'>,
): Promise<ResultadoRepo<CausalMerma>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase
        .from('causales_merma')
        .insert(causalMermaAFila({ ...causal, id: '' }, negocioId))
        .select()
        .single(),
    );
    return causalMermaDesdeFila(fila);
  });
}

export async function eliminarCausalMerma(id: string): Promise<ResultadoRepo<true>> {
  return conCliente(async (supabase) => {
    const { error } = await supabase.from('causales_merma').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true as const;
  });
}
