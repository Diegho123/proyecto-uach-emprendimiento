import { useState } from 'react';
import type { ClaveVista } from '@/app/navegacion';
import { AppShell } from '@/components/layout/AppShell';
import { ModuloMinimarket } from '@/modules/minimarket';
import { ModuloRestaurante } from '@/modules/restaurante';
import { ModuloServicios } from '@/modules/servicios';
import { AppStateProvider, useAppState } from '@/store/appState';
import { ConectorErp } from '@/views/ConectorErp';
import { FlujoCaja } from '@/views/FlujoCaja';
import { InventarioLIFO } from '@/views/InventarioLIFO';
import { MargenesPrecios } from '@/views/MargenesPrecios';
import { MercadoAlianzas } from '@/views/MercadoAlianzas';
import { Mermas } from '@/views/Mermas';
import { Panel } from '@/views/Panel';
import { SeleccionPerfil } from '@/views/SeleccionPerfil';
import { SimuladorEstres } from '@/views/SimuladorEstres';
import type { PerfilNegocio } from '@/types/domain';

/**
 * La app propiamente tal, una vez resuelta la sesión.
 *
 * Vive en su propio módulo para que `App.tsx` pueda cargarla de forma diferida:
 * quien llega al login no necesita descargar el panel, los módulos por rubro ni
 * el gráfico.
 */

/** La estructura de costos cambia por completo según el rubro. */
function EstructuraDeCostos({ perfil }: { perfil: PerfilNegocio }) {
  switch (perfil) {
    case 'restaurant':
      return <ModuloRestaurante />;
    case 'minimarket':
      return <ModuloMinimarket />;
    case 'services':
      return <ModuloServicios />;
  }
}

function Contenido() {
  const { perfil, nombreNegocio, reiniciarNegocio } = useAppState();
  const [vista, setVista] = useState<ClaveVista>('panel');

  if (!perfil) return <SeleccionPerfil />;

  const cambiarNegocio = () => {
    reiniciarNegocio();
    setVista('panel');
  };

  const renderizar = () => {
    switch (vista) {
      case 'panel':
        return <Panel />;
      case 'costos':
        return <EstructuraDeCostos perfil={perfil} />;
      case 'flujo_caja':
        return <FlujoCaja />;
      case 'inventario_lifo':
        return <InventarioLIFO />;
      case 'mermas':
        return <Mermas />;
      case 'margenes':
        return <MargenesPrecios />;
      case 'escenarios':
        return <SimuladorEstres />;
      case 'mercado':
        return <MercadoAlianzas />;
      case 'conector_erp':
        return <ConectorErp />;
    }
  };

  return (
    <AppShell
      perfil={perfil}
      nombreNegocio={nombreNegocio}
      vistaActiva={vista}
      onNavegar={setVista}
      onCambiarNegocio={cambiarNegocio}
    >
      {renderizar()}
    </AppShell>
  );
}

export default function Aplicacion() {
  return (
    <AppStateProvider>
      <Contenido />
    </AppStateProvider>
  );
}
