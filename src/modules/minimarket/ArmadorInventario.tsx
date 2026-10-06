import { useState, type DragEvent, type FormEvent } from 'react';
import { IconMas } from '@/components/icons';
import { Badge, Button, CampoTexto, Card, CardHeader } from '@/components/ui';
import { calcularPuntoReorden } from '@/lib/calculations';
import { cn } from '@/lib/cn';
import { formatearCLP, formatearPorcentaje, idLocal } from '@/lib/format';
import { useAppState } from '@/store/appState';
import type { ProductoCatalogo } from '@/types/domain';

/**
 * Alta de productos desde el catálogo mayorista.
 *
 * Se elige un producto (pulsando o arrastrando) y se completan los parámetros
 * de rotación. El punto de reorden se calcula solo: consumo diario por los días
 * que tarda el proveedor, más holgura.
 */
export function ArmadorInventario() {
  const { catalogoMayorista, agregarProductoInventario } = useAppState();

  const [seleccionado, setSeleccionado] = useState<ProductoCatalogo | null>(null);
  const [zonaActiva, setZonaActiva] = useState(false);
  const [datos, setDatos] = useState({ precioVenta: '', ventasMensuales: '', stockActual: '', leadTimeDias: '3' });

  const elegirProducto = (producto: ProductoCatalogo) => {
    setSeleccionado(producto);
    setDatos({
      precioVenta: String(producto.precioSugerido || Math.round(producto.costoMayorista * 1.4)),
      ventasMensuales: '40',
      stockActual: '15',
      leadTimeDias: '3',
    });
  };

  const soltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    setZonaActiva(false);
    const carga = evento.dataTransfer.getData('application/json');
    if (!carga) return;
    try {
      elegirProducto(JSON.parse(carga) as ProductoCatalogo);
    } catch {
      // Arrastre no reconocido.
    }
  };

  const ventas = Number(datos.ventasMensuales) || 0;
  const leadTime = Number(datos.leadTimeDias) || 3;
  const precio = Number(datos.precioVenta) || 0;
  const puntoReorden = calcularPuntoReorden(ventas, leadTime);
  const margen = precio > 0 && seleccionado ? ((precio - seleccionado.costoMayorista) / precio) * 100 : 0;

  const guardar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!seleccionado || !precio) return;

    agregarProductoInventario({
      id: idLocal('inv'),
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      nombre: seleccionado.nombre,
      categoria: seleccionado.categoria,
      costoCompra: seleccionado.costoMayorista,
      precioVenta: precio,
      ventasMensuales: ventas,
      stockActual: Number(datos.stockActual) || 0,
      leadTimeDias: leadTime,
      mermaEsperada: 1,
      puntoReorden,
    });

    setSeleccionado(null);
    setDatos({ precioVenta: '', ventasMensuales: '', stockActual: '', leadTimeDias: '3' });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <Card className="h-fit">
        <CardHeader
          eyebrow="Catálogo mayorista"
          titulo="Elige qué vas a vender"
          descripcion="Pulsa o arrastra un producto para darlo de alta."
        />

        <div className="mt-4 flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
          {catalogoMayorista.map((producto) => (
            <button
              key={producto.id}
              type="button"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(producto))}
              onClick={() => elegirProducto(producto)}
              className={cn(
                'surface-panel group flex cursor-grab flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-left transition-all active:cursor-grabbing',
                seleccionado?.id === producto.id
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'hover:border-[var(--accent)] hover:shadow-subtle',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-strong min-w-0 flex-1 text-[0.8125rem] leading-snug font-semibold">
                  {producto.nombre}
                </span>
                <Badge tono="neutral">{producto.categoria}</Badge>
              </div>
              <div className="text-faint flex items-center gap-3 text-[0.6875rem]">
                <span>
                  Costo <strong className="text-default font-mono">{formatearCLP(producto.costoMayorista)}</strong>
                </span>
                <span>
                  Sugerido <strong className="text-default font-mono">{formatearCLP(producto.precioSugerido)}</strong>
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Alta de producto"
          titulo="Parámetros de rotación y stock"
          descripcion="Con esto calculamos cuándo tienes que volver a pedir."
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setZonaActiva(true);
          }}
          onDragLeave={() => setZonaActiva(false)}
          onDrop={soltar}
          className={cn(
            'mt-5 flex min-h-[5.5rem] items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors',
            zonaActiva ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'surface-sunken',
          )}
        >
          {seleccionado ? (
            <div>
              <p className="label-eyebrow text-accent mb-1.5">Producto seleccionado</p>
              <p className="text-strong text-[0.9375rem] font-bold">{seleccionado.nombre}</p>
              <p className="text-muted mt-1 text-[0.75rem]">
                Costo mayorista: <strong className="font-mono">{formatearCLP(seleccionado.costoMayorista)}</strong>
              </p>
            </div>
          ) : (
            <p className="text-muted flex items-center gap-2 text-[0.8125rem]">
              <IconMas className="text-faint size-4" />
              Elige un producto del catálogo
            </p>
          )}
        </div>

        <form onSubmit={guardar} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto
              etiqueta="Precio de venta"
              type="number"
              numerico
              min={1}
              value={datos.precioVenta}
              onChange={(e) => setDatos((p) => ({ ...p, precioVenta: e.target.value }))}
              disabled={!seleccionado}
              required
              sufijo={
                seleccionado && precio > 0 ? (
                  <span
                    className={cn(
                      'font-mono text-[0.6875rem] font-bold tabular',
                      margen >= 25
                        ? 'text-positive-600 dark:text-positive-500'
                        : 'text-warning-600 dark:text-warning-500',
                    )}
                  >
                    margen {formatearPorcentaje(margen, 0)}
                  </span>
                ) : undefined
              }
            />
            <CampoTexto
              etiqueta="Ventas estimadas al mes"
              type="number"
              numerico
              min={1}
              value={datos.ventasMensuales}
              onChange={(e) => setDatos((p) => ({ ...p, ventasMensuales: e.target.value }))}
              disabled={!seleccionado}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto
              etiqueta="Stock físico actual"
              type="number"
              numerico
              min={0}
              value={datos.stockActual}
              onChange={(e) => setDatos((p) => ({ ...p, stockActual: e.target.value }))}
              disabled={!seleccionado}
              required
            />
            <CampoTexto
              etiqueta="Días que demora el proveedor"
              type="number"
              numerico
              min={1}
              value={datos.leadTimeDias}
              onChange={(e) => setDatos((p) => ({ ...p, leadTimeDias: e.target.value }))}
              disabled={!seleccionado}
              required
              ayuda={seleccionado ? `Punto de reorden: ${puntoReorden} unidades` : undefined}
            />
          </div>

          <Button type="submit" variante="primary" className="w-full" disabled={!seleccionado}>
            Registrar en inventario
          </Button>
        </form>
      </Card>
    </div>
  );
}
