import { useState, type DragEvent, type FormEvent } from 'react';
import { IconCerrar, IconMas } from '@/components/icons';
import { Badge, Button, CampoTexto, Card, CardHeader, EmptyState } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatearCLP, formatearPorcentaje, idLocal } from '@/lib/format';
import { useAppState } from '@/store/appState';
import type { ElementoServicio, Recurso } from '@/types/domain';

const FORMULARIO_INICIAL = { nombre: '', precioVenta: '', ventasMensuales: '' };

/**
 * Costeo de proyectos por horas-hombre. El costo real de un servicio son las
 * horas del equipo que consume; sin eso, el "margen" es solo el precio.
 */
export function ArmadorServicio() {
  const { recursos, agregarServicio } = useAppState();

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [elementos, setElementos] = useState<ElementoServicio[]>([]);
  const [zonaActiva, setZonaActiva] = useState(false);
  const [aviso, setAviso] = useState('');

  const agregarElemento = (recurso: Recurso) => {
    setElementos((prev) =>
      prev.some((el) => el.id === recurso.id)
        ? prev
        : [
            ...prev,
            {
              id: recurso.id,
              nombre: recurso.nombre,
              unidad: recurso.unidad,
              costoPorUnidad: recurso.costoPorUnidad,
              cantidadUsada: 0,
            },
          ],
    );
    setAviso('');
  };

  const soltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    setZonaActiva(false);
    const carga = evento.dataTransfer.getData('application/json');
    if (!carga) return;
    try {
      agregarElemento(JSON.parse(carga) as Recurso);
    } catch {
      // Arrastre no reconocido.
    }
  };

  const costoTotal = elementos.reduce((acc, el) => acc + el.cantidadUsada * el.costoPorUnidad, 0);
  const precio = Number(formulario.precioVenta) || 0;
  const margen = precio - costoTotal;
  const margenPorcentaje = precio > 0 ? (margen / precio) * 100 : 0;

  const guardar = (evento: FormEvent) => {
    evento.preventDefault();

    if (elementos.length === 0) {
      setAviso('Asigna al menos un recurso para costear el servicio.');
      return;
    }
    if (elementos.some((el) => el.cantidadUsada <= 0)) {
      setAviso('Indica cuántas horas o unidades usa cada recurso.');
      return;
    }

    agregarServicio({
      id: idLocal('srv'),
      nombre: formulario.nombre.trim(),
      precioVenta: precio,
      ventasMensuales: Number(formulario.ventasMensuales) || 0,
      costoTotal: Math.round(costoTotal),
      elementos,
    });

    setFormulario(FORMULARIO_INICIAL);
    setElementos([]);
    setAviso('');
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <Card className="h-fit">
        <CardHeader
          eyebrow="Equipo y recursos"
          titulo="Quién trabaja en el proyecto"
          descripcion="Pulsa o arrastra para asignarlos."
        />

        <div className="mt-4 flex max-h-[26rem] flex-col gap-2 overflow-y-auto pr-1">
          {recursos.length === 0 ? (
            <p className="text-muted py-6 text-center text-[0.75rem]">No hay recursos configurados.</p>
          ) : (
            recursos.map((recurso) => {
              const yaEsta = elementos.some((el) => el.id === recurso.id);

              return (
                <button
                  key={recurso.id}
                  type="button"
                  draggable={!yaEsta}
                  onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(recurso))}
                  onClick={() => agregarElemento(recurso)}
                  disabled={yaEsta}
                  className={cn(
                    'group flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                    yaEsta
                      ? 'surface-sunken cursor-default opacity-50'
                      : 'surface-panel cursor-grab hover:border-[var(--accent)] hover:shadow-subtle active:cursor-grabbing',
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-strong truncate text-[0.8125rem] font-semibold">{recurso.nombre}</p>
                    <Badge tono="neutral" className="mt-1">
                      {recurso.tipo}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-accent font-mono text-[0.75rem] font-bold tabular">
                      {formatearCLP(recurso.costoPorUnidad)}
                      <span className="text-faint">/{recurso.unidad}</span>
                    </span>
                    {!yaEsta && (
                      <IconMas className="text-faint size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Card>

      <Card>
        <CardHeader eyebrow="Nuevo servicio" titulo="Estructura un proyecto y calcula su rentabilidad" />

        <form onSubmit={guardar} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <CampoTexto
              etiqueta="Nombre del servicio"
              placeholder="Auditoría financiera"
              value={formulario.nombre}
              onChange={(e) => setFormulario((p) => ({ ...p, nombre: e.target.value }))}
              required
            />
            <CampoTexto
              etiqueta="Precio de venta"
              type="number"
              numerico
              min={1}
              placeholder="1200000"
              value={formulario.precioVenta}
              onChange={(e) => setFormulario((p) => ({ ...p, precioVenta: e.target.value }))}
              required
            />
            <CampoTexto
              etiqueta="Proyectos al mes"
              type="number"
              numerico
              min={1}
              placeholder="3"
              value={formulario.ventasMensuales}
              onChange={(e) => setFormulario((p) => ({ ...p, ventasMensuales: e.target.value }))}
              required
            />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setZonaActiva(true);
            }}
            onDragLeave={() => setZonaActiva(false)}
            onDrop={soltar}
            className={cn(
              'min-h-[9rem] rounded-xl border-2 border-dashed p-3 transition-colors',
              zonaActiva ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'surface-sunken',
            )}
          >
            {elementos.length === 0 ? (
              <div className="flex h-full min-h-[7.5rem] items-center justify-center">
                <p className="text-muted text-center text-[0.8125rem]">
                  Asigna recursos al proyecto
                  <span className="text-faint mt-1 block text-[0.6875rem]">
                    Las horas de cada perfil son el costo real del servicio
                  </span>
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {elementos.map((el) => (
                  <li
                    key={el.id}
                    className="surface-panel flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <span className="text-strong min-w-0 flex-1 truncate text-[0.8125rem] font-semibold">
                      {el.nombre}
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={el.cantidadUsada || ''}
                        placeholder="0"
                        onChange={(e) =>
                          setElementos((prev) =>
                            prev.map((item) =>
                              item.id === el.id
                                ? { ...item, cantidadUsada: Number(e.target.value) || 0 }
                                : item,
                            ),
                          )
                        }
                        aria-label={`Cantidad de ${el.nombre}`}
                        className="surface-sunken text-strong w-20 rounded-md border px-2 py-1.5 text-right font-mono text-[0.75rem] tabular focus:border-[var(--accent)] focus:outline-none"
                      />
                      <span className="text-faint w-14 text-[0.6875rem] font-semibold">{el.unidad}s</span>
                    </div>

                    <span className="text-negative-600 dark:text-negative-500 w-28 shrink-0 text-right font-mono text-[0.8125rem] font-bold tabular">
                      {formatearCLP(el.cantidadUsada * el.costoPorUnidad)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setElementos((prev) => prev.filter((item) => item.id !== el.id))}
                      aria-label={`Quitar ${el.nombre}`}
                      className="text-faint hover:text-negative-600 dark:hover:text-negative-500 cursor-pointer rounded p-1 transition-colors"
                    >
                      <IconCerrar className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {aviso && (
            <p className="text-negative-600 dark:text-negative-500 text-[0.75rem] font-semibold">{aviso}</p>
          )}

          <div className="surface-sunken flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
            <div>
              <p className="label-eyebrow mb-1">Costo directo</p>
              <p className="text-strong font-mono text-[1.25rem] font-bold tabular">{formatearCLP(costoTotal)}</p>
            </div>

            <div>
              <p className="label-eyebrow mb-1">Margen de contribución</p>
              <p
                className={cn(
                  'font-mono text-[1.25rem] font-bold tabular',
                  margen > 0 ? 'text-positive-600 dark:text-positive-500' : 'text-negative-600 dark:text-negative-500',
                )}
              >
                {formatearCLP(margen)}
                <span className="ml-1.5 text-[0.8125rem]">({formatearPorcentaje(margenPorcentaje)})</span>
              </p>
            </div>

            <Button type="submit" variante="primary" className="ml-auto">
              Guardar servicio
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function ListaServicios() {
  const { servicios, eliminarServicio } = useAppState();

  if (servicios.length === 0) {
    return (
      <EmptyState
        titulo="Aún no hay servicios en el portafolio"
        descripcion="Estructura un proyecto arriba para ver su rentabilidad real y que entre al cálculo del panel."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {servicios.map((servicio) => {
        const margen = servicio.precioVenta - servicio.costoTotal;
        const margenPorcentaje = servicio.precioVenta > 0 ? (margen / servicio.precioVenta) * 100 : 0;

        return (
          <Card key={servicio.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2 border-b pb-3">
              <h4 className="min-w-0 flex-1 truncate text-[0.9375rem] font-bold">{servicio.nombre}</h4>
              <button
                type="button"
                onClick={() => eliminarServicio(servicio.id)}
                aria-label={`Eliminar ${servicio.nombre}`}
                className="text-faint hover:text-negative-600 dark:hover:text-negative-500 -mt-1 -mr-1 cursor-pointer rounded p-1 transition-colors"
              >
                <IconCerrar className="size-3.5" />
              </button>
            </div>

            <Fila etiqueta="Costo directo" valor={formatearCLP(servicio.costoTotal)} />
            <Fila etiqueta="Fee cobrado" valor={formatearCLP(servicio.precioVenta)} enfasis />
            <Fila etiqueta="Proyectos al mes" valor={String(servicio.ventasMensuales)} />
            <Fila etiqueta="Recursos asignados" valor={String(servicio.elementos.length)} />

            <div className="mt-auto flex items-baseline justify-between gap-2 border-t pt-3">
              <span className="text-default text-[0.8125rem] font-semibold">Margen bruto</span>
              <span
                className={cn(
                  'font-mono text-[1rem] font-bold tabular',
                  margen >= 0 ? 'text-positive-600 dark:text-positive-500' : 'text-negative-600 dark:text-negative-500',
                )}
              >
                {formatearPorcentaje(margenPorcentaje)}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Fila({ etiqueta, valor, enfasis }: { etiqueta: string; valor: string; enfasis?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[0.8125rem]">
      <span className="text-muted">{etiqueta}</span>
      <span className={cn('font-mono tabular', enfasis ? 'text-strong font-bold' : 'text-default font-semibold')}>
        {valor}
      </span>
    </div>
  );
}
