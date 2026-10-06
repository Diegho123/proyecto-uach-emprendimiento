/**
 * Forma del esquema `public` en Supabase.
 *
 * Se mantiene a mano y coincide con `supabase/schema.sql`. Cuando el proyecto
 * esté creado, puedes regenerarlo con:
 *
 *   npx supabase gen types typescript --project-id <ref> --schema public \
 *     > src/lib/supabase/database.types.ts
 *
 * Las columnas usan snake_case (convención Postgres); `mappers.ts` traduce
 * hacia y desde los tipos de dominio en camelCase.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Relacion = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Tabla<Row, Insert, Update, Relaciones extends Relacion[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relaciones;
};

/** Atajo para la clave foránea `<tabla>_<columna>_fkey` hacia la PK destino. */
type FK<Tabla_ extends string, Columna extends string, Destino extends string> = {
  foreignKeyName: `${Tabla_}_${Columna}_fkey`;
  columns: [Columna];
  isOneToOne: false;
  referencedRelation: Destino;
  referencedColumns: ['id'];
};

type PerteneceANegocio<T extends string> = [FK<T, 'negocio_id', 'negocios'>];

export type NegocioRow = {
  id: string;
  owner_id: string;
  nombre: string;
  perfil: 'restaurant' | 'minimarket' | 'services';
  porcentaje_merma_global: number;
  margen_objetivo_porcentaje: number;
  saldo_inicial_caja: number;
  created_at: string;
  updated_at: string;
};

export type InsumoRow = {
  id: string;
  negocio_id: string;
  nombre: string;
  proveedor: string | null;
  unidad: string;
  costo_por_unidad: number;
  created_at: string;
};

export type RecetaRow = {
  id: string;
  negocio_id: string;
  nombre: string;
  precio_venta: number;
  costo_total: number;
  ventas_estimadas: number;
  created_at: string;
};

export type RecetaIngredienteRow = {
  id: string;
  receta_id: string;
  insumo_id: string;
  cantidad_usada: number;
};

export type ProductoCatalogoRow = {
  id: string;
  negocio_id: string;
  nombre: string;
  categoria: string;
  costo_mayorista: number;
  precio_sugerido: number;
  unidad: string;
};

export type InventarioRow = {
  id: string;
  negocio_id: string;
  sku: string;
  nombre: string;
  categoria: string | null;
  costo_compra: number;
  precio_venta: number;
  ventas_mensuales: number;
  stock_actual: number;
  lead_time_dias: number;
  merma_esperada: number;
  punto_reorden: number;
  created_at: string;
};

export type LoteLifoRow = {
  id: string;
  negocio_id: string;
  sku: string;
  producto: string;
  fecha: string;
  cantidad_comprada: number;
  cantidad_disponible: number;
  costo_unitario: number;
  created_at: string;
};

export type RecursoRow = {
  id: string;
  negocio_id: string;
  nombre: string;
  tipo: string;
  unidad: string;
  costo_por_unidad: number;
};

export type ServicioRow = {
  id: string;
  negocio_id: string;
  nombre: string;
  precio_venta: number;
  costo_total: number;
  ventas_mensuales: number;
  created_at: string;
};

export type ServicioElementoRow = {
  id: string;
  servicio_id: string;
  recurso_id: string;
  cantidad_usada: number;
};

export type CostoVariableRow = {
  id: string;
  negocio_id: string;
  nombre: string;
  costo_por_unidad: number;
};

export type CostoFijoRow = {
  id: string;
  negocio_id: string;
  nombre: string;
  monto: number;
};

export type CausalMermaRow = {
  id: string;
  negocio_id: string;
  motivo: string;
  porcentaje: number;
};

export type CuentaFlujoCajaRow = {
  id: string;
  negocio_id: string;
  tipo: 'ingreso' | 'egreso';
  nombre: string;
  valores: number[];
  orden: number;
};

type Insertable<T, Generadas extends keyof T> = Omit<T, Generadas> & Partial<Pick<T, Generadas>>;

export type Database = {
  public: {
    Tables: {
      negocios: Tabla<
        NegocioRow,
        Insertable<
          NegocioRow,
          | 'id'
          | 'created_at'
          | 'updated_at'
          | 'porcentaje_merma_global'
          | 'margen_objetivo_porcentaje'
          | 'saldo_inicial_caja'
        >,
        Partial<NegocioRow>,
        [FK<'negocios', 'owner_id', 'users'>]
      >;
      insumos: Tabla<
        InsumoRow,
        Insertable<InsumoRow, 'id' | 'created_at'>,
        Partial<InsumoRow>,
        PerteneceANegocio<'insumos'>
      >;
      recetas: Tabla<
        RecetaRow,
        Insertable<RecetaRow, 'id' | 'created_at'>,
        Partial<RecetaRow>,
        PerteneceANegocio<'recetas'>
      >;
      receta_ingredientes: Tabla<
        RecetaIngredienteRow,
        Insertable<RecetaIngredienteRow, 'id'>,
        Partial<RecetaIngredienteRow>,
        [FK<'receta_ingredientes', 'receta_id', 'recetas'>, FK<'receta_ingredientes', 'insumo_id', 'insumos'>]
      >;
      productos_catalogo: Tabla<
        ProductoCatalogoRow,
        Insertable<ProductoCatalogoRow, 'id'>,
        Partial<ProductoCatalogoRow>,
        PerteneceANegocio<'productos_catalogo'>
      >;
      inventario: Tabla<
        InventarioRow,
        Insertable<InventarioRow, 'id' | 'created_at'>,
        Partial<InventarioRow>,
        PerteneceANegocio<'inventario'>
      >;
      lotes_lifo: Tabla<
        LoteLifoRow,
        Insertable<LoteLifoRow, 'id' | 'created_at'>,
        Partial<LoteLifoRow>,
        PerteneceANegocio<'lotes_lifo'>
      >;
      recursos: Tabla<
        RecursoRow,
        Insertable<RecursoRow, 'id'>,
        Partial<RecursoRow>,
        PerteneceANegocio<'recursos'>
      >;
      servicios: Tabla<
        ServicioRow,
        Insertable<ServicioRow, 'id' | 'created_at'>,
        Partial<ServicioRow>,
        PerteneceANegocio<'servicios'>
      >;
      servicio_elementos: Tabla<
        ServicioElementoRow,
        Insertable<ServicioElementoRow, 'id'>,
        Partial<ServicioElementoRow>,
        [FK<'servicio_elementos', 'servicio_id', 'servicios'>, FK<'servicio_elementos', 'recurso_id', 'recursos'>]
      >;
      costos_variables: Tabla<
        CostoVariableRow,
        Insertable<CostoVariableRow, 'id'>,
        Partial<CostoVariableRow>,
        PerteneceANegocio<'costos_variables'>
      >;
      costos_fijos: Tabla<
        CostoFijoRow,
        Insertable<CostoFijoRow, 'id'>,
        Partial<CostoFijoRow>,
        PerteneceANegocio<'costos_fijos'>
      >;
      causales_merma: Tabla<
        CausalMermaRow,
        Insertable<CausalMermaRow, 'id'>,
        Partial<CausalMermaRow>,
        PerteneceANegocio<'causales_merma'>
      >;
      cuentas_flujo_caja: Tabla<
        CuentaFlujoCajaRow,
        Insertable<CuentaFlujoCajaRow, 'id'>,
        Partial<CuentaFlujoCajaRow>,
        PerteneceANegocio<'cuentas_flujo_caja'>
      >;
    };
    Views: Record<never, never>;
    Functions: {
      /** Despacho LIFO transaccional; ver `supabase/schema.sql`. */
      despachar_lifo: {
        Args: { p_negocio_id: string; p_sku: string; p_unidades: number };
        Returns: { cmv_total: number; costo_unitario_efectivo: number }[];
      };
      es_mi_negocio: {
        Args: { negocio: string };
        Returns: boolean;
      };
    };
    Enums: {
      perfil_negocio: 'restaurant' | 'minimarket' | 'services';
      tipo_cuenta_flujo: 'ingreso' | 'egreso';
    };
    CompositeTypes: Record<never, never>;
  };
};
