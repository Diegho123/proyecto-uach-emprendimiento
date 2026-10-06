import { useState, type ReactNode } from 'react';
import type { ClaveVista } from '@/app/navegacion';
import { useTema } from '@/app/useTema';
import type { PerfilNegocio } from '@/types/domain';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  perfil: PerfilNegocio;
  nombreNegocio: string;
  vistaActiva: ClaveVista;
  onNavegar: (vista: ClaveVista) => void;
  onCambiarNegocio: () => void;
  children: ReactNode;
}

export function AppShell({
  perfil,
  nombreNegocio,
  vistaActiva,
  onNavegar,
  onCambiarNegocio,
  children,
}: AppShellProps) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const { tema, alternar } = useTema();

  const navegar = (vista: ClaveVista) => {
    onNavegar(vista);
    setMenuMovilAbierto(false);
  };

  return (
    <div className="surface-app flex min-h-screen">
      <Sidebar
        perfil={perfil}
        vistaActiva={vistaActiva}
        onNavegar={navegar}
        onCambiarNegocio={onCambiarNegocio}
        abiertoEnMovil={menuMovilAbierto}
        onCerrarMovil={() => setMenuMovilAbierto(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          nombreNegocio={nombreNegocio}
          vistaActiva={vistaActiva}
          tema={tema}
          onAlternarTema={alternar}
          onAbrirMenu={() => setMenuMovilAbierto(true)}
        />

        <main className="mx-auto w-full max-w-[86rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* La clave remonta la vista en cada cambio: reinicia scroll y animación. */}
          <div key={vistaActiva} className="animate-fade-rise">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
