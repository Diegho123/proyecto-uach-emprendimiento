import type { DatosPerfil } from '@/types/domain';

export const mockServices: DatosPerfil = {
  nombreNegocio: 'Consultora Cordillera',
  recursos: [
    { id: 'res_1', nombre: 'Consultor Senior', tipo: 'Personal', unidad: 'hora', costoPorUnidad: 25000 },
    { id: 'res_2', nombre: 'Analista Junior', tipo: 'Personal', unidad: 'hora', costoPorUnidad: 12000 },
    { id: 'res_3', nombre: 'Diseñador Gráfico', tipo: 'Personal', unidad: 'hora', costoPorUnidad: 18000 },
    { id: 'res_4', nombre: 'Licencia Software Cloud', tipo: 'Tecnología', unidad: 'proyecto', costoPorUnidad: 45000 },
    { id: 'res_5', nombre: 'Soporte Externo', tipo: 'Terceros', unidad: 'hora', costoPorUnidad: 15000 },
  ],
  servicios: [
    {
      id: 'srv_1',
      nombre: 'Auditoría Financiera',
      precioVenta: 1200000,
      ventasMensuales: 3,
      costoTotal: 980000,
      elementos: [
        { id: 'res_1', nombre: 'Consultor Senior', unidad: 'hora', costoPorUnidad: 25000, cantidadUsada: 20 },
        { id: 'res_2', nombre: 'Analista Junior', unidad: 'hora', costoPorUnidad: 12000, cantidadUsada: 40 },
      ],
    },
    {
      id: 'srv_2',
      nombre: 'Implementación ERP Base',
      precioVenta: 850000,
      ventasMensuales: 5,
      costoTotal: 340000,
      elementos: [
        { id: 'res_1', nombre: 'Consultor Senior', unidad: 'hora', costoPorUnidad: 25000, cantidadUsada: 10 },
        { id: 'res_4', nombre: 'Licencia Software Cloud', unidad: 'proyecto', costoPorUnidad: 45000, cantidadUsada: 1 },
        { id: 'res_3', nombre: 'Diseñador Gráfico', unidad: 'hora', costoPorUnidad: 18000, cantidadUsada: 2.5 },
      ],
    },
  ],
  costosVariables: [
    { id: 'cv_srv_1', nombre: 'Traslados y viáticos', costoPorUnidad: 15000 },
    { id: 'cv_srv_2', nombre: 'Comisión de ventas', costoPorUnidad: 25000 },
  ],
  costosFijos: [
    { id: 'cf_srv_1', nombre: 'Arriendo oficina / cowork', monto: 350000 },
    { id: 'cf_srv_2', nombre: 'Sueldos base (administración)', monto: 800000 },
    { id: 'cf_srv_3', nombre: 'Suscripciones y servidores', monto: 120000 },
  ],
};
