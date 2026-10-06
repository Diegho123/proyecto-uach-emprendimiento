import { PageHeader } from '@/components/ui';
import { PanelCostosFijos } from '@/modules/compartido/PanelCostosFijos';
import { PanelCostosVariables } from '@/modules/compartido/PanelCostosVariables';
import { Separador } from '@/modules/compartido/Separador';
import { ArmadorServicio, ListaServicios } from './ArmadorServicio';

export function ModuloServicios() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Estructura de costos"
        titulo="Rentabilidad por proyecto"
        descripcion="El costo de un servicio son las horas de tu equipo. Asignándolas a cada proyecto sabes cuáles te dejan plata de verdad y cuáles solo te mantienen ocupado."
      />

      <Separador
        numero={1}
        titulo="Proyectos y horas asignadas"
        descripcion="Cuántas horas de cada perfil consume el servicio, y a qué precio lo cobras."
      />
      <div className="space-y-6">
        <ArmadorServicio />
        <ListaServicios />
      </div>

      <Separador
        numero={2}
        titulo="Costos variables por proyecto"
        descripcion="Traslados, viáticos, comisiones de venta: cambian según cuántos proyectos tomes."
      />
      <PanelCostosVariables />

      <Separador
        numero={3}
        titulo="Costos fijos"
        descripcion="Oficina, administración, suscripciones. Se pagan tengas proyectos o no."
      />
      <PanelCostosFijos />
    </div>
  );
}
