import type { ClaveVista } from '@/app/navegacion';
import { NAVEGACION } from '@/app/navegacion';
import type { Tema } from '@/app/useTema';
import { IconBaseDatos, IconLuna, IconMenu, IconSol } from '@/components/icons';
import { Badge } from '@/components/ui';
import { useAuth } from '@/store/authState';

interface TopbarProps {
  nombreNegocio: string;
  vistaActiva: ClaveVista;
  tema: Tema;
  onAlternarTema: () => void;
  onAbrirMenu: () => void;
}

export function Topbar({ nombreNegocio, vistaActiva, tema, onAlternarTema, onAbrirMenu }: TopbarProps) {
  const { estado } = useAuth();
  const item = NAVEGACION.find((n) => n.clave === vistaActiva);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-[var(--surface-panel)]/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onAbrirMenu}
        className="text-muted hover:text-strong hover:surface-sunken -ml-1 cursor-pointer rounded-lg p-2 lg:hidden"
        aria-label="Abrir menú"
      >
        <IconMenu />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-strong truncate text-[0.875rem] font-bold">{nombreNegocio}</p>
        {item && <p className="text-muted truncate text-[0.75rem]">{item.descripcion}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <IndicadorConexion enDemo={estado === 'demo'} />

        <button
          type="button"
          onClick={onAlternarTema}
          className="text-muted hover:text-strong hover:surface-sunken cursor-pointer rounded-lg border p-2 transition-colors"
          aria-label={tema === 'claro' ? 'Activar tema oscuro' : 'Activar tema claro'}
          title={tema === 'claro' ? 'Tema oscuro' : 'Tema claro'}
        >
          {tema === 'claro' ? <IconLuna /> : <IconSol />}
        </button>
      </div>
    </header>
  );
}

/**
 * Deja explícito de dónde salen los números: datos de ejemplo o la base real.
 * Sin esto no hay forma de distinguir una demo de la operación en producción.
 */
function IndicadorConexion({ enDemo }: { enDemo: boolean }) {
  if (!enDemo) {
    return (
      <Badge tono="positive" punto className="hidden sm:inline-flex">
        Supabase conectado
      </Badge>
    );
  }

  return (
    <span
      className="text-muted hidden items-center gap-1.5 rounded-md border px-2 py-1 text-[0.6875rem] font-bold sm:inline-flex"
      title="Sin credenciales de Supabase: los datos son de ejemplo y no se guardan"
    >
      <IconBaseDatos className="size-3.5" />
      Modo demo
    </span>
  );
}
