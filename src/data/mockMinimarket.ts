import type { DatosPerfil } from '@/types/domain';

export const mockMinimarket: DatosPerfil = {
  nombreNegocio: 'Ferretería El Roble',
  catalogoMayorista: [
    { id: 'cat_1', nombre: 'Tornillo Yeso Cartón 6x1 (caja 1000)', categoria: 'Fijaciones', costoMayorista: 4500, precioSugerido: 7990, unidad: 'caja' },
    { id: 'cat_2', nombre: 'Disco Corte Metal 4½"', categoria: 'Herramientas', costoMayorista: 650, precioSugerido: 1290, unidad: 'un' },
    { id: 'cat_3', nombre: 'Cinta Teflón ¾ x 10 m', categoria: 'Gasfitería', costoMayorista: 280, precioSugerido: 690, unidad: 'un' },
    { id: 'cat_4', nombre: 'Broca Concreto 6 mm', categoria: 'Accesorios', costoMayorista: 1100, precioSugerido: 2190, unidad: 'un' },
    { id: 'cat_5', nombre: 'Guante Cabritilla (par)', categoria: 'Seguridad', costoMayorista: 1800, precioSugerido: 3490, unidad: 'par' },
    { id: 'cat_6', nombre: 'Silicona Neutra 280 ml', categoria: 'Adhesivos', costoMayorista: 2400, precioSugerido: 4290, unidad: 'un' },
    { id: 'cat_7', nombre: 'Arroz Grado 1 (1 kg)', categoria: 'Abarrotes', costoMayorista: 1150, precioSugerido: 1590, unidad: 'kg' },
    { id: 'cat_8', nombre: 'Aceite Vegetal 900 ml', categoria: 'Abarrotes', costoMayorista: 1450, precioSugerido: 1990, unidad: 'un' },
  ],
  inventario: [
    { id: 'inv_1', sku: 'FER-001', nombre: 'Tornillo Yeso Cartón 6x1 (caja 1000)', categoria: 'Fijaciones', costoCompra: 4500, precioVenta: 7990, ventasMensuales: 200, stockActual: 25, leadTimeDias: 3, mermaEsperada: 2, puntoReorden: 30 },
    { id: 'inv_2', sku: 'FER-002', nombre: 'Disco Corte Metal 4½"', categoria: 'Herramientas', costoCompra: 650, precioVenta: 1290, ventasMensuales: 1400, stockActual: 320, leadTimeDias: 2, mermaEsperada: 1, puntoReorden: 140 },
    { id: 'inv_3', sku: 'FER-003', nombre: 'Cinta Teflón ¾ x 10 m', categoria: 'Gasfitería', costoCompra: 280, precioVenta: 690, ventasMensuales: 900, stockActual: 260, leadTimeDias: 4, mermaEsperada: 0.5, puntoReorden: 180 },
    { id: 'inv_4', sku: 'AB-001', nombre: 'Arroz Grado 1 (1 kg)', categoria: 'Abarrotes', costoCompra: 1150, precioVenta: 1590, ventasMensuales: 1500, stockActual: 400, leadTimeDias: 2, mermaEsperada: 1.5, puntoReorden: 150 },
    { id: 'inv_5', sku: 'AB-002', nombre: 'Aceite Vegetal 900 ml', categoria: 'Abarrotes', costoCompra: 1450, precioVenta: 1990, ventasMensuales: 1200, stockActual: 240, leadTimeDias: 3, mermaEsperada: 0.5, puntoReorden: 180 },
  ],
  costosVariables: [
    { id: 'cv_mini_1', nombre: 'Bolsas y packaging', costoPorUnidad: 120 },
    { id: 'cv_mini_2', nombre: 'Comisión POS (1,5%)', costoPorUnidad: 80 },
  ],
  costosFijos: [
    { id: 'cf_mini_1', nombre: 'Arriendo local comercial', monto: 750000 },
    { id: 'cf_mini_2', nombre: 'Sueldo operador de bodega', monto: 550000 },
    { id: 'cf_mini_3', nombre: 'Luz y conectividad', monto: 95000 },
  ],
};

/** Capas de compra iniciales para ver el motor LIFO funcionando desde el inicio. */
export const lotesLifoDemo = [
  { id: 'lot_1', fecha: '2026-08-01', sku: 'FER-001', producto: 'Tornillo Yeso Cartón 6x1', cantidadComprada: 30, cantidadDisponible: 0, costoUnitario: 4200 },
  { id: 'lot_2', fecha: '2026-08-10', sku: 'FER-001', producto: 'Tornillo Yeso Cartón 6x1', cantidadComprada: 25, cantidadDisponible: 5, costoUnitario: 4500 },
  { id: 'lot_3', fecha: '2026-08-20', sku: 'FER-001', producto: 'Tornillo Yeso Cartón 6x1', cantidadComprada: 20, cantidadDisponible: 20, costoUnitario: 4900 },
  { id: 'lot_4', fecha: '2026-08-05', sku: 'FER-002', producto: 'Disco Corte Metal 4½"', cantidadComprada: 300, cantidadDisponible: 40, costoUnitario: 600 },
  { id: 'lot_5', fecha: '2026-08-18', sku: 'FER-002', producto: 'Disco Corte Metal 4½"', cantidadComprada: 280, cantidadDisponible: 280, costoUnitario: 680 },
];
