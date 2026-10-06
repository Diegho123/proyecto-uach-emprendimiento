import type { ComponentType, SVGProps } from 'react';
import {
  IconConector,
  IconCostos,
  IconEscenarios,
  IconFlujoCaja,
  IconInventario,
  IconMargenes,
  IconMercado,
  IconMermas,
  IconPanel,
} from '@/components/icons';
import type { PerfilNegocio } from '@/types/domain';

export type ClaveVista =
  | 'panel'
  | 'flujo_caja'
  | 'inventario_lifo'
  | 'mermas'
  | 'margenes'
  | 'escenarios'
  | 'mercado'
  | 'conector_erp'
  | 'costos';

export interface ItemNavegacion {
  clave: ClaveVista;
  etiqueta: string;
  descripcion: string;
  icono: ComponentType<SVGProps<SVGSVGElement>>;
  grupo: 'Operación' | 'Análisis' | 'Datos';
  /** Ausente = visible para todos los rubros. */
  soloPerfiles?: PerfilNegocio[];
}

export const NAVEGACION: ItemNavegacion[] = [
  {
    clave: 'panel',
    etiqueta: 'Panel',
    descripcion: 'Punto de equilibrio y resultado del mes',
    icono: IconPanel,
    grupo: 'Operación',
  },
  {
    clave: 'costos',
    etiqueta: 'Estructura de costos',
    descripcion: 'Lo que te cuesta producir, vender y operar',
    icono: IconCostos,
    grupo: 'Operación',
  },
  {
    clave: 'flujo_caja',
    etiqueta: 'Flujo de caja',
    descripcion: 'Proyección de tesorería a 12 meses',
    icono: IconFlujoCaja,
    grupo: 'Operación',
  },
  {
    clave: 'inventario_lifo',
    etiqueta: 'Inventario LIFO',
    descripcion: 'Capas de costo y costo de reposición',
    icono: IconInventario,
    grupo: 'Operación',
    soloPerfiles: ['minimarket'],
  },
  {
    clave: 'margenes',
    etiqueta: 'Márgenes y precios',
    descripcion: 'Precio que sostiene tu margen objetivo',
    icono: IconMargenes,
    grupo: 'Análisis',
  },
  {
    clave: 'mermas',
    etiqueta: 'Mermas',
    descripcion: 'Pérdida operativa cargada al costo',
    icono: IconMermas,
    grupo: 'Análisis',
  },
  {
    clave: 'escenarios',
    etiqueta: 'Simulador de estrés',
    descripcion: 'Resistencia frente a shocks de mercado',
    icono: IconEscenarios,
    grupo: 'Análisis',
  },
  {
    clave: 'mercado',
    etiqueta: 'Mercado y alianzas',
    descripcion: 'Indicadores y compras conjuntas',
    icono: IconMercado,
    grupo: 'Análisis',
  },
  {
    clave: 'conector_erp',
    etiqueta: 'Conector ERP',
    descripcion: 'Importa ventas desde tu facturación',
    icono: IconConector,
    grupo: 'Datos',
  },
];

export const GRUPOS = ['Operación', 'Análisis', 'Datos'] as const;

export function navegacionPara(perfil: PerfilNegocio): ItemNavegacion[] {
  return NAVEGACION.filter((item) => !item.soloPerfiles || item.soloPerfiles.includes(perfil));
}
