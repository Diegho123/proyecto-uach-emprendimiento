import { useState, type DragEvent, type FormEvent } from 'react';
import { IconCerrar, IconMas } from '@/components/icons';
import { Button, CampoTexto, Card, CardHeader, EmptyState } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatearCLP, formatearPorcentaje, idLocal, pluralizar } from '@/lib/format';
import { useAppState } from '@/store/appState';
import type { IngredienteReceta, Insumo } from '@/types/domain';

const FORMULARIO_INICIAL = { nombre: '', precioVenta: '', ventasEstimadas: '' };

/**
 * Armador de fichas técnicas. Se puede arrastrar el insumo o simplemente
 * pulsarlo: el arrastre no funciona en táctil ni con teclado, así que el clic
 * es la vía principal y el drag, un atajo.
 */
export function ArmadorReceta() {
  const { insumos, agregarReceta } = useAppState();

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [ingredientes, setIngredientes] = useState<IngredienteReceta[]>([]);
  const [zonaActiva, setZonaActiva] = useState(false);
  const [aviso, setAviso] = useState('');

  const agregarIngrediente = (insumo: Insumo) => {
    setIngredientes((prev) =>
      prev.some((ing) => ing.id === insumo.id) ? prev : [...prev, { ...insumo, cantidadUsada: 0 }],
    );
    setAviso('');
  };

  const actualizarCantidad = (id: string, cantidad: string) =>
    setIngredientes((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, cantidadUsada: Number(cantidad) || 0 } : ing)),
    );

  const quitarIngrediente = (id: string) =>
    setIngredientes((prev) => prev.filter((ing) => ing.id !== id));

  const soltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    setZonaActiva(false);
    const carga = evento.dataTransfer.getData('application/json');
    if (!carga) return;
    try {
      agregarIngrediente(JSON.parse(carga) as Insumo);
    } catch {
      // Arrastre de otro origen: se ignora sin romper la vista.
    }
  };

  const costoReceta = ingredientes.reduce((acc, ing) => acc + ing.cantidadUsada * ing.costoPorUnidad, 0);
  const precio = Number(formulario.precioVenta) || 0;
  const margen = precio - costoReceta;
  const margenPorcentaje = precio > 0 ? (margen / precio) * 100 : 0;

  const guardar = (evento: FormEvent) => {
    evento.preventDefault();

    if (ingredientes.length === 0) {
      setAviso('Agrega al menos un insumo para poder costear la receta.');
      return;
    }
    if (ingredientes.some((ing) => ing.cantidadUsada <= 0)) {
      setAviso('Indica cuánto usas de cada insumo.');
      return;
    }

    agregarReceta({
      id: idLocal('rec'),
      nombre: formulario.nombre.trim(),
      precioVenta: precio,
      ventasEstimadas: Number(formulario.ventasEstimadas) || 0,
      costoTotal: Math.round(costoReceta),
      ingredientes,
    });

    setFormulario(FORMULARIO_INICIAL);
    setIngredientes([]);
    setAviso('');
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <Card className="h-fit">
        <CardHeader
          eyebrow="Despensa"
          titulo="Tus insumos"
          descripcion="Pulsa o arrastra para sumarlos a la receta."
        />

        <div className="mt-4 flex max-h-[26rem] flex-col gap-2 overflow-y-auto pr-1">
          {insumos.length === 0 ? (
            <p className="text-muted py-6 text-center text-[0.75rem]">
              Registra insumos en el paso anterior.
            </p>
          ) : (
            insumos.map((insumo) => {
              const yaEsta = ingredientes.some((ing) => ing.id === insumo.id);

              return (
                <button
                  key={insumo.id}
                  type="button"
                  draggable={!yaEsta}
                  onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(insumo))}
                  onClick={() => agregarIngrediente(insumo)}
                  disabled={yaEsta}
                  className={cn(
                    'group flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                    yaEsta
                      ? 'surface-sunken cursor-default opacity-50'
                      : 'surface-panel cursor-grab hover:border-[var(--accent)] hover:shadow-subtle active:cursor-grabbing',
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-strong truncate text-[0.8125rem] font-semibold">{insumo.nombre}</p>
                    <p className="text-faint truncate text-[0.6875rem]">{insumo.proveedor || 'Sin proveedor'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-accent font-mono text-[0.75rem] font-bold tabular">
                      {formatearCLP(insumo.costoPorUnidad)}
                      <span className="text-faint">/{insumo.unidad}</span>
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
        <CardHeader eyebrow="Nueva receta" titulo="Arma un plato y calcula su costo real" />

        <form onSubmit={guardar} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <CampoTexto
              etiqueta="Nombre del plato"
              placeholder="Pizza margarita"
              value={formulario.nombre}
              onChange={(e) => setFormulario((p) => ({ ...p, nombre: e.target.value }))}
              required
            />
            <CampoTexto
              etiqueta="Precio de venta"
              type="number"
              numerico
              min={1}
              placeholder="8500"
              value={formulario.precioVenta}
              onChange={(e) => setFormulario((p) => ({ ...p, precioVenta: e.target.value }))}
              required
            />
            <CampoTexto
              etiqueta="Ventas al mes"
              type="number"
              numerico
              min={1}
              placeholder="100"
              value={formulario.ventasEstimadas}
              onChange={(e) => setFormulario((p) => ({ ...p, ventasEstimadas: e.target.value }))}
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
            {ingredientes.length === 0 ? (
              <div className="flex h-full min-h-[7.5rem] items-center justify-center">
                <p className="text-muted text-center text-[0.8125rem]">
                  Suelta o pulsa insumos de la despensa
                  <span className="text-faint mt-1 block text-[0.6875rem]">
                    Se irán sumando al costo del plato
                  </span>
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {ingredientes.map((ing) => (
                  <li
                    key={ing.id}
                    className="surface-panel flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <span className="text-strong min-w-0 flex-1 truncate text-[0.8125rem] font-semibold">
                      {ing.nombre}
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={ing.cantidadUsada || ''}
                        placeholder="0"
                        onChange={(e) => actualizarCantidad(ing.id, e.target.value)}
                        aria-label={`Cantidad de ${ing.nombre}`}
                        className="surface-sunken text-strong w-20 rounded-md border px-2 py-1.5 text-right font-mono text-[0.75rem] tabular focus:border-[var(--accent)] focus:outline-none"
                      />
                      <span className="text-faint w-8 text-[0.6875rem] font-semibold">{ing.unidad}</span>
                    </div>

                    <span className="text-negative-600 dark:text-negative-500 w-24 shrink-0 text-right font-mono text-[0.8125rem] font-bold tabular">
                      {formatearCLP(ing.cantidadUsada * ing.costoPorUnidad)}
                    </span>

                    <button
                      type="button"
                      onClick={() => quitarIngrediente(ing.id)}
                      aria-label={`Quitar ${ing.nombre}`}
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
              <p className="label-eyebrow mb-1">Costo del plato</p>
              <p className="text-strong font-mono text-[1.25rem] font-bold tabular">
                {formatearCLP(costoReceta)}
              </p>
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
              Guardar receta
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/** Fichas técnicas ya guardadas, con su margen real. */
export function ListaRecetas() {
  const { recetas, eliminarReceta } = useAppState();

  if (recetas.length === 0) {
    return (
      <EmptyState
        titulo="Aún no guardas recetas"
        descripcion="Cada receta que guardes se suma al volumen y al costo promedio que ve el panel."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {recetas.map((receta) => {
        const margen = receta.precioVenta - receta.costoTotal;
        const margenPorcentaje = receta.precioVenta > 0 ? (margen / receta.precioVenta) * 100 : 0;

        return (
          <Card key={receta.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2 border-b pb-3">
              <h4 className="min-w-0 flex-1 truncate text-[0.9375rem] font-bold">{receta.nombre}</h4>
              <button
                type="button"
                onClick={() => eliminarReceta(receta.id)}
                aria-label={`Eliminar ${receta.nombre}`}
                className="text-faint hover:text-negative-600 dark:hover:text-negative-500 -mt-1 -mr-1 cursor-pointer rounded p-1 transition-colors"
              >
                <IconCerrar className="size-3.5" />
              </button>
            </div>

            <FilaDato etiqueta="Costo" valor={formatearCLP(receta.costoTotal)} />
            <FilaDato etiqueta="Precio de venta" valor={formatearCLP(receta.precioVenta)} enfasis />
            <FilaDato etiqueta="Ventas al mes" valor={pluralizar(receta.ventasEstimadas, 'plato', 'platos')} />
            <FilaDato etiqueta="Ingredientes" valor={`${receta.ingredientes.length}`} />

            <div className="mt-auto flex items-baseline justify-between gap-2 border-t pt-3">
              <span className="text-default text-[0.8125rem] font-semibold">Margen</span>
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

function FilaDato({ etiqueta, valor, enfasis }: { etiqueta: string; valor: string; enfasis?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[0.8125rem]">
      <span className="text-muted">{etiqueta}</span>
      <span className={cn('font-mono tabular', enfasis ? 'text-strong font-bold' : 'text-default font-semibold')}>
        {valor}
      </span>
    </div>
  );
}
