import { useState } from 'react';
import {
  CampoTexto,
  Card,
  CardHeader,
  Deslizador,
  PageHeader,
  StatCard,
  StatGrid,
} from '@/components/ui';
import { precioSegunMargenObjetivo } from '@/lib/calculations';
import { formatearCLP, formatearPorcentaje } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useAppState } from '@/store/appState';

export function MargenesPrecios() {
  const {
    margenObjetivoPorcentaje,
    setMargenObjetivoPorcentaje,
    costoVariableConsolidado,
    costoFijoTotal,
    ventasEstimadasMensuales,
    precioVentaConsolidado,
  } = useAppState();

  const [tasaIva, setTasaIva] = useState(19);

  // Cada unidad tiene que cargar su parte del costo fijo del mes.
  const costoFijoUnitario = ventasEstimadasMensuales > 0 ? costoFijoTotal / ventasEstimadasMensuales : 0;
  const costoTotalUnitario = costoVariableConsolidado + costoFijoUnitario;

  const precioNeto = precioSegunMargenObjetivo(costoTotalUnitario, margenObjetivoPorcentaje);
  const precioBruto = Math.round(precioNeto * (1 + tasaIva / 100));
  const utilidadUnitaria = precioNeto - costoTotalUnitario;

  const brechaConPrecioActual = precioVentaConsolidado > 0 ? precioNeto - precioVentaConsolidado : 0;

  const composicion = [
    { etiqueta: 'Costo variable', monto: costoVariableConsolidado, clase: 'bg-negative-500' },
    { etiqueta: 'Absorción de costos fijos', monto: costoFijoUnitario, clase: 'bg-warning-500' },
    { etiqueta: 'Utilidad', monto: utilidadUnitaria, clase: 'bg-positive-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Análisis"
        titulo="Márgenes y precios"
        descripcion="Cuánto tendrías que cobrar para cubrir todos tus costos —incluida la merma y tu parte de los gastos fijos— y quedarte con el margen que buscas."
      />

      <StatGrid>
        <StatCard
          etiqueta="Costo variable unitario"
          valor={formatearCLP(costoVariableConsolidado)}
          detalle="Insumos y costos directos, con merma incluida"
        />
        <StatCard
          etiqueta="Costo fijo por unidad"
          valor={formatearCLP(costoFijoUnitario)}
          detalle={
            ventasEstimadasMensuales > 0
              ? `Repartido entre ${ventasEstimadasMensuales.toLocaleString('es-CL')} unidades`
              : 'Falta volumen para repartir los fijos'
          }
        />
        <StatCard
          etiqueta="Precio neto sugerido"
          valor={formatearCLP(precioNeto)}
          detalle={`Con margen objetivo de ${formatearPorcentaje(margenObjetivoPorcentaje, 0)}`}
          tonoValor="accent"
        />
        <StatCard
          etiqueta="Precio final con IVA"
          valor={formatearCLP(precioBruto)}
          detalle="Tarifa pública sugerida"
          tonoValor="positive"
        />
      </StatGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Parámetros" titulo="Define tu objetivo comercial" />

          <div className="mt-6 space-y-6">
            <Deslizador
              etiqueta="Margen deseado sobre la venta"
              valorMostrado={formatearPorcentaje(margenObjetivoPorcentaje, 0)}
              min={5}
              max={80}
              paso={1}
              valor={margenObjetivoPorcentaje}
              onChange={setMargenObjetivoPorcentaje}
            />

            <CampoTexto
              etiqueta="Tasa de IVA (%)"
              type="number"
              numerico
              min={0}
              max={50}
              value={tasaIva}
              onChange={(e) => setTasaIva(Number(e.target.value) || 0)}
              ayuda="En Chile el IVA general es 19%."
            />

            {precioVentaConsolidado > 0 && (
              <div className="surface-sunken rounded-xl border p-4">
                <p className="label-eyebrow mb-2">Comparación con tu precio actual</p>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-muted text-[0.75rem]">
                    Hoy cobras {formatearCLP(precioVentaConsolidado)}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[0.9375rem] font-bold tabular',
                      brechaConPrecioActual > 0
                        ? 'text-negative-600 dark:text-negative-500'
                        : 'text-positive-600 dark:text-positive-500',
                    )}
                  >
                    {brechaConPrecioActual > 0 ? '+' : ''}
                    {formatearCLP(brechaConPrecioActual)}
                  </span>
                </div>
                <p className="text-faint mt-2 text-[0.6875rem] leading-relaxed">
                  {brechaConPrecioActual > 0
                    ? `Te faltan ${formatearCLP(brechaConPrecioActual)} por unidad para alcanzar el margen objetivo.`
                    : 'Tu precio actual ya supera el margen objetivo.'}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Composición"
            titulo="En qué se va cada peso que cobras"
            descripcion="Sobre el precio neto sugerido."
          />

          <div className="mt-6 space-y-5">
            <div className="surface-sunken flex h-3 w-full overflow-hidden rounded-full border">
              {composicion.map((parte) => (
                <div
                  key={parte.etiqueta}
                  className={parte.clase}
                  style={{ width: `${precioNeto > 0 ? (Math.max(0, parte.monto) / precioNeto) * 100 : 0}%` }}
                />
              ))}
            </div>

            <div className="space-y-3">
              {composicion.map((parte) => (
                <div key={parte.etiqueta} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0">
                  <span className="text-default flex items-center gap-2.5 text-[0.8125rem]">
                    <span className={cn('size-2.5 shrink-0 rounded-sm', parte.clase)} />
                    {parte.etiqueta}
                  </span>
                  <span className="text-strong font-mono text-[0.8125rem] font-bold tabular">
                    {formatearCLP(parte.monto)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline justify-between gap-3 border-t-2 border-[var(--accent)]/25 pt-4">
              <span className="text-strong text-[0.875rem] font-bold">Precio neto recomendado</span>
              <span className="text-accent font-mono text-[1.25rem] font-bold tabular">
                {formatearCLP(precioNeto)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
