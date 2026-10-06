import { GRUPOS, navegacionPara, type ClaveVista } from '@/app/navegacion';
import { Logo } from '@/components/brand/Logo';
import { IconCambiar, IconCerrar, IconSalir } from '@/components/icons';
import { cn } from '@/lib/cn';
import { useAuth } from '@/store/authState';
import type { PerfilNegocio } from '@/types/domain';

interface SidebarProps {
  perfil: PerfilNegocio;
  vistaActiva: ClaveVista;
  onNavegar: (vista: ClaveVista) => void;
  onCambiarNegocio: () => void;
  /** En móvil el aside se muestra como panel deslizante sobre el contenido. */
  abiertoEnMovil: boolean;
  onCerrarMovil: () => void;
}

export function Sidebar({
  perfil,
  vistaActiva,
  onNavegar,
  onCambiarNegocio,
  abiertoEnMovil,
  onCerrarMovil,
}: SidebarProps) {
  const items = navegacionPara(perfil);

  return (
    <>
      {abiertoEnMovil && (
        <div
          className="bg-ink-950/50 fixed inset-0 z-40 backdrop-blur-[2px] lg:hidden"
          onClick={onCerrarMovil}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'surface-panel fixed inset-y-0 left-0 z-50 flex w-[16.5rem] flex-col border-r',
          'transition-transform duration-250 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          abiertoEnMovil ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b px-4">
          <Logo />
          <button
            type="button"
            onClick={onCerrarMovil}
            className="text-muted hover:text-strong hover:surface-sunken -mr-1 cursor-pointer rounded-lg p-2 lg:hidden"
            aria-label="Cerrar menú"
          >
            <IconCerrar />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {GRUPOS.map((grupo) => {
            const delGrupo = items.filter((item) => item.grupo === grupo);
            if (delGrupo.length === 0) return null;

            return (
              <div key={grupo}>
                <p className="label-eyebrow px-3 pb-2">{grupo}</p>
                <ul className="space-y-0.5">
                  {delGrupo.map((item) => {
                    const activo = item.clave === vistaActiva;
                    const Icono = item.icono;

                    return (
                      <li key={item.clave}>
                        <button
                          type="button"
                          onClick={() => onNavegar(item.clave)}
                          aria-current={activo ? 'page' : undefined}
                          title={item.descripcion}
                          className={cn(
                            'group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left',
                            'text-[0.8125rem] font-semibold transition-colors duration-150',
                            activo
                              ? 'text-accent bg-[var(--accent-soft)]'
                              : 'text-muted hover:surface-sunken hover:text-strong',
                          )}
                        >
                          <Icono
                            className={cn(
                              'size-[1.125rem] shrink-0 transition-colors',
                              activo ? 'text-[var(--accent)]' : 'text-faint group-hover:text-[var(--text-muted)]',
                            )}
                          />
                          <span className="truncate">{item.etiqueta}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <PieDeUsuario onCambiarNegocio={onCambiarNegocio} />
      </aside>
    </>
  );
}

/** Identidad de quien está usando la app y las dos salidas posibles. */
function PieDeUsuario({ onCambiarNegocio }: { onCambiarNegocio: () => void }) {
  const { estado, usuario, hayBackend, cerrarSesion, salirDelModoDemo } = useAuth();
  const esDemo = estado === 'demo';

  const iniciales = (usuario?.nombre ?? 'Demo')
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="space-y-1 border-t p-3">
      <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold',
            esDemo ? 'surface-sunken text-muted border' : 'bg-[var(--accent)] text-white',
          )}
          aria-hidden="true"
        >
          {esDemo ? 'D' : iniciales}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-strong truncate text-[0.8125rem] font-bold">
            {esDemo ? 'Modo demo' : (usuario?.nombre ?? 'Tu cuenta')}
          </p>
          <p className="text-faint truncate text-[0.6875rem]">
            {esDemo ? 'Los cambios no se guardan' : (usuario?.email ?? '')}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCambiarNegocio}
        className="text-muted hover:surface-sunken hover:text-strong flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-semibold transition-colors"
      >
        <IconCambiar className="text-faint size-[1.125rem] shrink-0" />
        Cambiar de negocio
      </button>

      {/* Sin credenciales de Supabase no hay a dónde volver: el modo demo es
          la única forma de usar la app y ofrecer una salida solo confunde. */}
      {hayBackend && (
        <button
          type="button"
          onClick={esDemo ? salirDelModoDemo : cerrarSesion}
          className="text-muted hover:surface-sunken hover:text-strong flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-semibold transition-colors"
        >
          <IconSalir className="text-faint size-[1.125rem] shrink-0" />
          {esDemo ? 'Salir del modo demo' : 'Cerrar sesión'}
        </button>
      )}
    </div>
  );
}
