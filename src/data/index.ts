import type { CausalMerma, DatosPerfil, PerfilNegocio } from '@/types/domain';
import { mockRestaurant } from './mockRestaurant';
import { mockMinimarket, lotesLifoDemo } from './mockMinimarket';
import { mockServices } from './mockServices';

/**
 * Datos de ejemplo por rubro. Se cargan al elegir perfil para que el usuario
 * vea el sistema completo funcionando antes de escribir un solo número propio.
 */
export const datosPorPerfil: Record<PerfilNegocio, DatosPerfil> = {
  restaurant: mockRestaurant,
  minimarket: mockMinimarket,
  services: mockServices,
};

export const causalesMermaDemo: CausalMerma[] = [
  { id: 'mer_1', motivo: 'Caducidad o descomposición', porcentaje: 3 },
  { id: 'mer_2', motivo: 'Manipulación y roturas', porcentaje: 1.5 },
  { id: 'mer_3', motivo: 'Diferencia de inventario físico', porcentaje: 0.5 },
];

export { lotesLifoDemo };
export { mockRestaurant, mockMinimarket, mockServices };
