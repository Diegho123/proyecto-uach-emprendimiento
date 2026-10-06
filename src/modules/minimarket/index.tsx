import { useState } from 'react';
import { Button, PageHeader } from '@/components/ui';
import { PanelCostosFijos } from '@/modules/compartido/PanelCostosFijos';
import { PanelCostosVariables } from '@/modules/compartido/PanelCostosVariables';
import { Separador } from '@/modules/compartido/Separador';
import { ArmadorInventario } from './ArmadorInventario';
import { CargaMasiva } from './CargaMasiva';
import { TablaInventario } from './TablaInventario';

type Pestana = 'uno_a_uno' | 'masiva';

export function ModuloMinimarket() {
  const [pestana, setPestana] = useState<Pestana>('uno_a_uno');

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Estructura de costos"
        titulo="Inventario y abastecimiento"
        descripcion="Da de alta lo que vendes, define cuándo hay que reponer y registra los costos que no van dentro del producto."
      />

      <Separador
        numero={1}
        titulo="Productos que vendes"
        descripcion="Uno a uno desde el catálogo, o toda tu lista de una vez si ya la tienes en una planilla."
      />

      <div className="space-y-5">
        <div className="surface-sunken inline-flex gap-1 rounded-lg border p-1">
          <Button
            variante={pestana === 'uno_a_uno' ? 'primary' : 'ghost'}
            tamano="sm"
            onClick={() => setPestana('uno_a_uno')}
          >
            Uno a uno
          </Button>
          <Button
            variante={pestana === 'masiva' ? 'primary' : 'ghost'}
            tamano="sm"
            onClick={() => setPestana('masiva')}
          >
            Carga masiva
          </Button>
        </div>

        {pestana === 'uno_a_uno' ? <ArmadorInventario /> : <CargaMasiva />}

        <TablaInventario />
      </div>

      <Separador
        numero={2}
        titulo="Costos variables indirectos"
        descripcion="Bolsas, comisiones de tarjeta, despacho: suben con cada venta."
      />
      <PanelCostosVariables />

      <Separador
        numero={3}
        titulo="Costos fijos"
        descripcion="Arriendo, sueldos, luz. Se pagan igual, vendas mucho o poco."
      />
      <PanelCostosFijos />
    </div>
  );
}
