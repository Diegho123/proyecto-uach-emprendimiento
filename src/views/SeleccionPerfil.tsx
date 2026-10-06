import { useTema } from '@/app/useTema';
import { Logo } from '@/components/brand/Logo';
import { IconBaseDatos, IconLuna, IconSol } from '@/components/icons';
import {
  IlustracionMinimarket,
  IlustracionRestaurante,
  IlustracionServicios,
} from '@/components/illustrations';
import { Badge } from '@/components/ui';
import { useAppState } from '@/store/appState';
import { useAuth } from '@/store/authState';
import type { PerfilNegocio } from '@/types/domain';

interface Opcion {
  id: PerfilNegocio;
  titulo: string;
  descripcion: string;
  incluye: string[];
  Ilustracion: typeof IlustracionRestaurante;
}

const OPCIONES: Opcion[] = [
  {
    id: 'restaurant',
    titulo: 'Restaurante o local de comida',
    descripcion: 'Vendes platos y tu costo depende de los ingredientes de cada receta.',
    incluye: ['Fichas técnicas de recetas', 'Costeo por ingrediente', 'Margen por plato'],
    Ilustracion: IlustracionRestaurante,
  },
  {
    id: 'minimarket',
    titulo: 'Minimarket, almacén o ferretería',
    descripcion: 'Compras mayorista para revender y necesitas controlar stock y reposición.',
    incluye: ['Capas de costo LIFO', 'Punto de reorden', 'Carga masiva de catálogo'],
    Ilustracion: IlustracionMinimarket,
  },
  {
    id: 'services',
    titulo: 'Servicios por hora o proyecto',
    descripcion: 'Cobras honorarios y tu costo son las horas del equipo asignadas a cada cliente.',
    incluye: ['Costo de hora-hombre', 'Rentabilidad por proyecto', 'Portafolio de servicios'],
    Ilustracion: IlustracionServicios,
  },
];

export function SeleccionPerfil() {
  const { elegirPerfil } = useAppState();
  const { estado } = useAuth();
  const { tema, alternar } = useTema();

  return (
    <div className="surface-app min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <Logo />
        <div className="flex items-center gap-3">
          {estado !== 'demo' ? (
            <Badge tono="positive" punto className="hidden sm:inline-flex">
              Supabase conectado
            </Badge>
          ) : (
            <span className="text-muted hidden items-center gap-1.5 rounded-md border px-2 py-1 text-[0.6875rem] font-bold sm:inline-flex">
              <IconBaseDatos className="size-3.5" />
              Modo demo
            </span>
          )}
          <button
            type="button"
            onClick={alternar}
            className="text-muted hover:text-strong hover:surface-sunken cursor-pointer rounded-lg border p-2 transition-colors"
            aria-label={tema === 'claro' ? 'Activar tema oscuro' : 'Activar tema claro'}
          >
            {tema === 'claro' ? <IconLuna /> : <IconSol />}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="animate-fade-rise mx-auto max-w-2xl py-10 text-center sm:py-14">
          <p className="label-eyebrow mb-3">Configuración inicial</p>
          <h1 className="text-[2rem] leading-[1.15] font-extrabold sm:text-[2.5rem]">
            ¿Qué tipo de negocio manejas?
          </h1>
          <p className="text-muted mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed">
            Ajustamos la estructura de costos y el cálculo de punto de equilibrio a tu operación.
            Cargamos datos de ejemplo de tu rubro para que veas todo funcionando de inmediato.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {OPCIONES.map((opcion, indice) => (
            <TarjetaPerfil
              key={opcion.id}
              opcion={opcion}
              indice={indice}
              onElegir={() => elegirPerfil(opcion.id)}
            />
          ))}
        </div>

        <p className="text-faint mt-10 text-center text-[0.75rem]">
          Puedes cambiar de rubro cuando quieras desde el menú lateral.
        </p>
      </main>
    </div>
  );
}

function TarjetaPerfil({
  opcion,
  indice,
  onElegir,
}: {
  opcion: Opcion;
  indice: number;
  onElegir: () => void;
}) {
  const { Ilustracion } = opcion;

  return (
    <button
      type="button"
      onClick={onElegir}
      style={{ animationDelay: `${indice * 70}ms` }}
      className="animate-fade-rise rounded-card surface-panel group flex cursor-pointer flex-col overflow-hidden border p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-pop"
    >
      <div className="surface-sunken mb-5 flex h-32 items-center justify-center rounded-xl border">
        <Ilustracion className="h-auto w-full max-w-[13rem] px-4" />
      </div>

      <h2 className="text-[1rem] leading-snug font-bold">{opcion.titulo}</h2>
      <p className="text-muted mt-2 text-[0.8125rem] leading-relaxed">{opcion.descripcion}</p>

      <ul className="mt-4 space-y-1.5 border-t pt-4">
        {opcion.incluye.map((linea) => (
          <li key={linea} className="text-muted flex items-center gap-2 text-[0.75rem]">
            <span className="size-1 shrink-0 rounded-full bg-[var(--accent)]" />
            {linea}
          </li>
        ))}
      </ul>

      <span className="text-accent mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold">
        Empezar con este perfil
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </span>
    </button>
  );
}
