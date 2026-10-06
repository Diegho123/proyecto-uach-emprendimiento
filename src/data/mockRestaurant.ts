import type { DatosPerfil } from '@/types/domain';

export const mockRestaurant: DatosPerfil = {
  nombreNegocio: 'Cocina Los Andes',
  insumos: [
    { id: 'ins_1', nombre: 'Tomate', proveedor: 'La Vega Central', unidad: 'kg', costoPorUnidad: 1200 },
    { id: 'ins_2', nombre: 'Harina', proveedor: 'Distribuidora Central', unidad: 'kg', costoPorUnidad: 900 },
    { id: 'ins_3', nombre: 'Queso Mozzarella', proveedor: 'Lácteos del Sur', unidad: 'g', costoPorUnidad: 8.5 },
    { id: 'ins_4', nombre: 'Papa', proveedor: 'La Vega Central', unidad: 'kg', costoPorUnidad: 1000 },
    { id: 'ins_5', nombre: 'Carne Molida', proveedor: 'Carnicería San Diego', unidad: 'kg', costoPorUnidad: 6000 },
    { id: 'ins_6', nombre: 'Aceite de Maravilla', proveedor: 'Distribuidora Central', unidad: 'l', costoPorUnidad: 2500 },
  ],
  recetas: [
    {
      id: 'rec_1',
      nombre: 'Pizza Margarita',
      precioVenta: 8500,
      costoTotal: 2225,
      ventasEstimadas: 320,
      ingredientes: [
        { id: 'ins_2', nombre: 'Harina', proveedor: 'Distribuidora Central', unidad: 'kg', costoPorUnidad: 900, cantidadUsada: 0.25 },
        { id: 'ins_3', nombre: 'Queso Mozzarella', proveedor: 'Lácteos del Sur', unidad: 'g', costoPorUnidad: 8.5, cantidadUsada: 200 },
        { id: 'ins_1', nombre: 'Tomate', proveedor: 'La Vega Central', unidad: 'kg', costoPorUnidad: 1200, cantidadUsada: 0.25 },
      ],
    },
    {
      id: 'rec_2',
      nombre: 'Papas Rellenas',
      precioVenta: 6000,
      costoTotal: 1950,
      ventasEstimadas: 180,
      ingredientes: [
        { id: 'ins_4', nombre: 'Papa', proveedor: 'La Vega Central', unidad: 'kg', costoPorUnidad: 1000, cantidadUsada: 0.5 },
        { id: 'ins_5', nombre: 'Carne Molida', proveedor: 'Carnicería San Diego', unidad: 'kg', costoPorUnidad: 6000, cantidadUsada: 0.2 },
        { id: 'ins_6', nombre: 'Aceite de Maravilla', proveedor: 'Distribuidora Central', unidad: 'l', costoPorUnidad: 2500, cantidadUsada: 0.1 },
      ],
    },
  ],
  costosVariables: [
    { id: 'cv_rest_1', nombre: 'Caja y packaging', costoPorUnidad: 350 },
    { id: 'cv_rest_2', nombre: 'Comisión Transbank', costoPorUnidad: 150 },
  ],
  costosFijos: [
    { id: 'cf_rest_1', nombre: 'Arriendo local', monto: 800000 },
    { id: 'cf_rest_2', nombre: 'Sueldos base', monto: 1200000 },
  ],
};
