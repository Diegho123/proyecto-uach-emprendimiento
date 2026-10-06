import { useEffect, useState } from 'react';
import { CurvaEquilibrio } from '@/components/charts/CurvaEquilibrio';
import {
  Badge,
  Card,
  CardHeader,
  Deslizador,
  PageHeader,
  ProgressBar,
  StatCard,
  StatGrid,
} from '@/components/ui';
import {
  clasificarRiesgo,
  generarCurvaEquilibrio,
  margenContribucionUnitario,
  puntoEquilibrioUnidades,
  resultadoOperacional,
} from '@/lib/calculations';
import { formatearCLP, formatearPorcentaje, formatearUnidades, pluralizar } from '@/lib/format';
import { useAppState } from '@/store/appState';

export function Panel() {
  const {
    precioVentaConsolidado,
    costoVariableConsolidado,
    costoFijoTotal,
    ventasEstimadasMensuales,
  } = useAppState();

  // La simulación arranca en los valores reales y el usuario los mueve desde ahí.
  const [precioSimulado, setPrecioSimulado] = useState(precioVentaConsolidado);
  const [volumenSimulado, setVolumenSimulado] = useState(ventasEstimadasMensuales);

  useEffect(() => setPrecioSimulado(precioVentaConsolidado), [precioVentaConsolidado]);
  useEffect(() => setVolumenSimulado(ventasEstimadasMensuales), [ventasEstimadasMensuales]);

  const precio = precioSimulado || 0;
  const volumen = volumenSimulado || 0;
  const costoVariable = costoVariableConsolidado || 0;
  const costoFijo = costoFijoTotal || 0;

  const margenUnitario = margenContribucionUnitario(precio, costoVariable);
  const equilibrio = puntoEquilibrioUnidades(costoFijo, margenUnitario);
  const resultado = resultadoOperacional(volumen, precio, costoVariable, costoFijo);

  const ingresos = precio * volumen;
  const margenFinal = ingresos > 0 ? (resultado / ingresos) * 100 : 0;
  const margenSobrePrecio = precio > 0 ? (margenUnitario / precio) * 100 : 0;

  const riesgo = clasificarRiesgo(volumen, equilibrio);
  const cubierto = equilibrio !== null && volumen >= equilibrio;
  const avanceHaciaEquilibrio = equilibrio && equilibrio > 0 ? (volumen / equilibrio) * 100 : 0;

  const topeCurva = Math.max(volumen * 1.35, (equilibrio ?? 0) * 1.35, 40);
  const curva = generarCurvaEquilibrio(costoFijo, costoVariable, precio, topeCurva);

  const sinDatos = precioVentaConsolidado === 0 && ventasEstimadasMensuales === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel"
        titulo="Cómo va tu mes"
        descripcion="Cuánto tienes que vender para no perder plata, cuánto te queda libre por venta y en qué resultado terminas."
        acciones={
          <Badge tono={riesgo.nivel === 'bajo' ? 'positive' : riesgo.nivel === 'medio' ? 'warning' : 'negative'} punto>
            Riesgo {riesgo.nivel} · {riesgo.puntaje}/10
          </Badge>
        }
      />

      {sinDatos && (
        <Card tone="sunken" className="border-dashed">
          <p className="text-strong text-[0.8125rem] font-semibold">Todavía no hay volumen que proyectar</p>
          <p className="text-muted mt-1 text-[0.75rem]">
            Ve a <strong>Estructura de costos</strong> y carga al menos un producto o servicio con precio y
            ventas estimadas.
          </p>
        </Card>
      )}

      <StatGrid>
        <StatCard
          etiqueta="Punto de equilibrio"
          valor={equilibrio === null ? 'Inalcanzable' : formatearUnidades(equilibrio)}
          detalle={
            equilibrio === null
              ? 'Cada venta cuesta más de lo que deja: revisa precio o costo variable.'
              : 'Mínimo mensual para no perder plata'
          }
          tonoValor={equilibrio === null ? 'negative' : 'neutral'}
          indicador={
            equilibrio === null
              ? { texto: 'Sin margen', tono: 'negative' }
              : cubierto
                ? { texto: 'Cubierto', tono: 'positive' }
                : { texto: 'Déficit', tono: 'negative' }
          }
        />

        <StatCard
          etiqueta="Margen de contribución"
          valor={formatearCLP(margenUnitario)}
          detalle="Lo que deja cada venta para pagar los costos fijos"
          tonoValor="accent"
          indicador={{ texto: formatearPorcentaje(margenSobrePrecio, 0), tono: 'accent' }}
        />

        <StatCard
          etiqueta="Resultado del mes"
          valor={formatearCLP(resultado)}
          detalle={`Margen final: ${formatearPorcentaje(margenFinal)}`}
          tonoValor={resultado >= 0 ? 'positive' : 'negative'}
          indicador={{ texto: resultado >= 0 ? 'Ganancia' : 'Pérdida', tono: resultado >= 0 ? 'positive' : 'negative' }}
        />

        <StatCard
          etiqueta="Costos fijos mensuales"
          valor={formatearCLP(costoFijo)}
          detalle="Se pagan vendas mucho o poco"
        />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <Card padding="lg">
          <CurvaEquilibrio datos={curva} puntoEquilibrio={equilibrio} ventasActuales={volumen} />
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              eyebrow="Simulador"
              titulo="Mueve los supuestos"
              descripcion="Los valores parten de tu operación actual."
            />
            <div className="mt-5 space-y-5">
              <Deslizador
                etiqueta="Precio de venta promedio"
                valorMostrado={formatearCLP(precio)}
                min={Math.max(100, Math.floor(precioVentaConsolidado * 0.4))}
                max={Math.max(5000, Math.ceil(precioVentaConsolidado * 2.5))}
                paso={Math.max(50, Math.round(precioVentaConsolidado * 0.02))}
                valor={precio}
                onChange={setPrecioSimulado}
              />
              <Deslizador
                etiqueta="Volumen mensual estimado"
                valorMostrado={formatearUnidades(volumen)}
                min={Math.max(1, Math.floor(ventasEstimadasMensuales * 0.2))}
                max={Math.max(100, Math.ceil(ventasEstimadasMensuales * 2.5))}
                paso={Math.max(1, Math.round(ventasEstimadasMensuales * 0.05))}
                valor={volumen}
                onChange={setVolumenSimulado}
              />
            </div>
          </Card>

          <Card className="flex-1">
            <CardHeader eyebrow="Diagnóstico" titulo={cubierto ? 'Operación cubierta' : 'Bajo el umbral'} />

            <p className="text-default mt-3 text-[0.8125rem] leading-relaxed">
              {equilibrio === null
                ? 'Con este precio y este costo variable, cada venta pierde plata. Sube el precio o baja el costo por unidad antes de mirar el volumen.'
                : cubierto
                  ? `Estás vendiendo ${pluralizar(volumen - equilibrio, 'unidad', 'unidades')} por sobre tu punto de equilibrio. ${riesgo.mensaje}`
                  : `Te faltan ${pluralizar(equilibrio - volumen, 'unidad', 'unidades')} al mes para dejar de perder plata.`}
            </p>

            {equilibrio !== null && (
              <div className="mt-5 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="label-eyebrow">Avance hacia el equilibrio</span>
                  <span className="text-strong font-mono text-[0.75rem] font-bold tabular">
                    {formatearPorcentaje(Math.min(avanceHaciaEquilibrio, 999), 0)}
                  </span>
                </div>
                <ProgressBar
                  porcentaje={avanceHaciaEquilibrio}
                  tono={cubierto ? 'positive' : avanceHaciaEquilibrio > 70 ? 'warning' : 'accent'}
                />
                <p className="text-faint text-[0.6875rem]">
                  Colchón de seguridad: {formatearPorcentaje(riesgo.colchonPorcentaje, 0)} — cuánto pueden caer
                  tus ventas antes de perder plata.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
