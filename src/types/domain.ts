/**
 * Tipos de dominio del negocio.
 * Son la fuente de verdad de la app: la capa de Supabase mapea sus filas
 * hacia estos tipos, y los datos de ejemplo los cumplen igual que los reales.
 */

export type PerfilNegocio = 'restaurant' | 'minimarket' | 'services';

export type UnidadMedida = 'kg' | 'g' | 'l' | 'ml' | 'un' | 'caja' | 'par' | 'hora' | 'proyecto';

export interface Insumo {
  id: string;
  nombre: string;
  proveedor: string;
  unidad: UnidadMedida;
  costoPorUnidad: number;
}

export interface IngredienteReceta extends Insumo {
  cantidadUsada: number;
}

export interface Receta {
  id: string;
  nombre: string;
  precioVenta: number;
  costoTotal: number;
  ventasEstimadas: number;
  ingredientes: IngredienteReceta[];
}

export interface ProductoCatalogo {
  id: string;
  nombre: string;
  categoria: string;
  costoMayorista: number;
  precioSugerido: number;
  unidad: UnidadMedida;
}

export interface ProductoInventario {
  id: string;
  sku: string;
  nombre: string;
  categoria?: string;
  costoCompra: number;
  precioVenta: number;
  ventasMensuales: number;
  stockActual: number;
  leadTimeDias: number;
  mermaEsperada: number;
  puntoReorden: number;
}

export interface LoteLIFO {
  id: string;
  fecha: string;
  sku: string;
  producto: string;
  cantidadComprada: number;
  cantidadDisponible: number;
  costoUnitario: number;
}

export interface Recurso {
  id: string;
  nombre: string;
  tipo: string;
  unidad: UnidadMedida;
  costoPorUnidad: number;
}

export interface ElementoServicio {
  id: string;
  nombre: string;
  unidad: UnidadMedida;
  costoPorUnidad: number;
  cantidadUsada: number;
}

export interface Servicio {
  id: string;
  nombre: string;
  precioVenta: number;
  costoTotal: number;
  ventasMensuales: number;
  elementos: ElementoServicio[];
}

export interface CostoVariable {
  id: string;
  nombre: string;
  costoPorUnidad: number;
}

export interface CostoFijo {
  id: string;
  nombre: string;
  monto: number;
}

export interface CausalMerma {
  id: string;
  motivo: string;
  porcentaje: number;
}

export type TipoCuentaFlujo = 'ingreso' | 'egreso';

export interface CuentaFlujoCaja {
  id: string;
  tipo: TipoCuentaFlujo;
  nombre: string;
  /** Doce posiciones, una por mes calendario. */
  valores: number[];
}

/** Semilla de datos de ejemplo por rubro (la que ve el usuario al entrar). */
export interface DatosPerfil {
  nombreNegocio: string;
  insumos?: Insumo[];
  recetas?: Receta[];
  catalogoMayorista?: ProductoCatalogo[];
  inventario?: ProductoInventario[];
  recursos?: Recurso[];
  servicios?: Servicio[];
  costosVariables: CostoVariable[];
  costosFijos: CostoFijo[];
}

export interface PuntoCurva {
  unidades: number;
  ingresos: number;
  costos: number;
}

export type NivelRiesgo = 'bajo' | 'medio' | 'alto';

export interface DiagnosticoRiesgo {
  nivel: NivelRiesgo;
  colchonPorcentaje: number;
  puntaje: number;
  mensaje: string;
}
