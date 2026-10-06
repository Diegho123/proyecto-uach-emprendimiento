import { PageHeader } from '@/components/ui';
import { PanelCostosFijos } from '@/modules/compartido/PanelCostosFijos';
import { PanelCostosVariables } from '@/modules/compartido/PanelCostosVariables';
import { Separador } from '@/modules/compartido/Separador';
import { ArmadorReceta, ListaRecetas } from './ArmadorReceta';
import { PanelInsumos } from './PanelInsumos';

export function ModuloRestaurante() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Estructura de costos"
        titulo="Tu operación, paso a paso"
        descripcion="Primero los insumos, después las recetas que los usan, y al final los costos que no van dentro del plato. Con eso el panel puede calcular tu punto de equilibrio real."
      />

      <Separador
        numero={1}
        titulo="Materias primas"
        descripcion="Lo que compras a tus proveedores, con su costo por unidad de medida."
      />
      <PanelInsumos />

      <Separador
        numero={2}
        titulo="Recetas y precios"
        descripcion="Cuánto usas de cada insumo en cada plato. De ahí sale el costo real y el margen que te deja."
      />
      <div className="space-y-6">
        <ArmadorReceta />
        <ListaRecetas />
      </div>

      <Separador
        numero={3}
        titulo="Costos variables indirectos"
        descripcion="Suben con cada venta pero no van dentro del plato: cajas, bolsas, comisiones."
      />
      <PanelCostosVariables />

      <Separador
        numero={4}
        titulo="Costos fijos"
        descripcion="Los que se pagan igual, vendas mucho o poco. Son lo que tu punto de equilibrio tiene que cubrir."
      />
      <PanelCostosFijos />
    </div>
  );
}
