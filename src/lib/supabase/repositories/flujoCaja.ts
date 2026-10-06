import type { CuentaFlujoCaja } from '@/types/domain';
import { cuentaFlujoAFila, cuentaFlujoDesdeFila } from '../mappers';
import { conCliente, desempaquetar, type ResultadoRepo } from './base';

export async function listarCuentasFlujo(negocioId: string): Promise<ResultadoRepo<CuentaFlujoCaja[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase.from('cuentas_flujo_caja').select('*').eq('negocio_id', negocioId).order('orden'),
    );
    return filas.map(cuentaFlujoDesdeFila);
  });
}

export async function crearCuentaFlujo(
  negocioId: string,
  cuenta: Omit<CuentaFlujoCaja, 'id'>,
  orden: number,
): Promise<ResultadoRepo<CuentaFlujoCaja>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase
        .from('cuentas_flujo_caja')
        .insert(cuentaFlujoAFila({ ...cuenta, id: '' }, negocioId, orden))
        .select()
        .single(),
    );
    return cuentaFlujoDesdeFila(fila);
  });
}

export async function actualizarCuentaFlujo(
  id: string,
  cambios: Partial<Pick<CuentaFlujoCaja, 'nombre' | 'valores'>>,
): Promise<ResultadoRepo<CuentaFlujoCaja>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase
        .from('cuentas_flujo_caja')
        .update({
          ...(cambios.nombre !== undefined && { nombre: cambios.nombre }),
          ...(cambios.valores !== undefined && { valores: cambios.valores }),
        })
        .eq('id', id)
        .select()
        .single(),
    );
    return cuentaFlujoDesdeFila(fila);
  });
}

export async function eliminarCuentaFlujo(id: string): Promise<ResultadoRepo<true>> {
  return conCliente(async (supabase) => {
    const { error } = await supabase.from('cuentas_flujo_caja').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true as const;
  });
}
