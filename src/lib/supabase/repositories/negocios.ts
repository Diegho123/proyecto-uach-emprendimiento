import type { PerfilNegocio } from '@/types/domain';
import type { NegocioRow } from '../database.types';
import { conCliente, desempaquetar, type ResultadoRepo } from './base';

export interface Negocio {
  id: string;
  nombre: string;
  perfil: PerfilNegocio;
  porcentajeMermaGlobal: number;
  margenObjetivoPorcentaje: number;
  saldoInicialCaja: number;
}

const desdeFila = (fila: NegocioRow): Negocio => ({
  id: fila.id,
  nombre: fila.nombre,
  perfil: fila.perfil,
  porcentajeMermaGlobal: Number(fila.porcentaje_merma_global),
  margenObjetivoPorcentaje: Number(fila.margen_objetivo_porcentaje),
  saldoInicialCaja: Number(fila.saldo_inicial_caja),
});

/** Negocios del usuario autenticado. Las políticas RLS acotan el resultado. */
export async function listarNegocios(): Promise<ResultadoRepo<Negocio[]>> {
  return conCliente(async (supabase) => {
    const filas = desempaquetar(
      await supabase.from('negocios').select('*').order('created_at', { ascending: true }),
    );
    return filas.map(desdeFila);
  });
}

export async function obtenerNegocio(negocioId: string): Promise<ResultadoRepo<Negocio>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase.from('negocios').select('*').eq('id', negocioId).single(),
    );
    return desdeFila(fila);
  });
}

export async function crearNegocio(
  nombre: string,
  perfil: PerfilNegocio,
): Promise<ResultadoRepo<Negocio>> {
  return conCliente(async (supabase) => {
    const { data: sesion } = await supabase.auth.getUser();
    const ownerId = sesion.user?.id;
    if (!ownerId) throw new Error('Necesitas iniciar sesión para crear un negocio');

    const fila = desempaquetar(
      await supabase
        .from('negocios')
        .insert({ nombre, perfil, owner_id: ownerId })
        .select()
        .single(),
    );
    return desdeFila(fila);
  });
}

/** Parámetros operativos que el usuario ajusta desde Mermas y Márgenes. */
export async function actualizarParametros(
  negocioId: string,
  parametros: Partial<Pick<Negocio, 'porcentajeMermaGlobal' | 'margenObjetivoPorcentaje' | 'saldoInicialCaja'>>,
): Promise<ResultadoRepo<Negocio>> {
  return conCliente(async (supabase) => {
    const fila = desempaquetar(
      await supabase
        .from('negocios')
        .update({
          ...(parametros.porcentajeMermaGlobal !== undefined && {
            porcentaje_merma_global: parametros.porcentajeMermaGlobal,
          }),
          ...(parametros.margenObjetivoPorcentaje !== undefined && {
            margen_objetivo_porcentaje: parametros.margenObjetivoPorcentaje,
          }),
          ...(parametros.saldoInicialCaja !== undefined && {
            saldo_inicial_caja: parametros.saldoInicialCaja,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', negocioId)
        .select()
        .single(),
    );
    return desdeFila(fila);
  });
}

export async function eliminarNegocio(negocioId: string): Promise<ResultadoRepo<true>> {
  return conCliente(async (supabase) => {
    const { error } = await supabase.from('negocios').delete().eq('id', negocioId);
    if (error) throw new Error(error.message);
    return true as const;
  });
}
