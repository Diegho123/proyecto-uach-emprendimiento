/**
 * Punto único de acceso a la persistencia.
 *
 * Los componentes importan desde aquí; nadie usa el cliente de Supabase
 * directamente. Eso mantiene las consultas en un solo lugar y permite que la
 * app siga funcionando en modo demo cuando no hay credenciales.
 */

export * from './base';
export * as negociosRepo from './negocios';
export * as costosRepo from './costos';
export * as inventarioRepo from './inventario';
export * as produccionRepo from './produccion';
export * as flujoCajaRepo from './flujoCaja';
