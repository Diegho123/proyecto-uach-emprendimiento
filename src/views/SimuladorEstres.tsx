import { useState } from 'react';
import { Badge, Button, Card, CardHeader, Deslizador, PageHeader, StatCard, StatGrid } from '@/components/ui';
import {
  margenContribucionUnitario,
  puntoEquilibrioUnidades,
  resultadoOperacional,
} from '@/lib/calculations';
import { formatearCLP, formatearNumero, formatearPorcentaje, formatearUnidades, pluralizar } from '@/lib/format';
import { useAppState } from '@/store/appState';

interface Preajuste {
  clave: string;
  etiqueta: string;
  descripcion: string;
  demanda: number;
  costoVariable: number;
  costoFijo: number;
}

const PREAJUSTES: Preajuste[] = [
  {
    clave: 'inflacion',
    etiqueta: 'Shock inflacionario',
    descripcion: 'Insumos +12%, fijos +8%, ventas −5%',
    demanda: -5,
    costoVariable: 12,
    costoFijo: 8,
  },
  {
    clave: 'recesion',
    etiqueta: 'Caída de demanda',
    descripcion: 'Ventas −25%, costos sin cambio',
    demanda: -25,
    costoVariable: 0,
    costoFijo: 0,
  },
  {
    clave: 'expansion',
    etiqueta: 'Expansión',
    descripcion: 'Ventas +20%, insumos −3%',
    demanda: 20,
    costoVariable: -3,
    costoFijo: 0,
  },
];

export function SimuladorEstres() {
  const {
    precioVentaConsolidado,
    costoVariableConsolidado,
    costoFijoTotal,
    ventasEstimadasMensuales,
  } = useAppState();

  const [demanda, setDemanda] = useState(0);
  const [varCostoVariable, setVarCostoVariable] = useState(0);
  const [varCostoFijo, setVarCostoFijo] = useState(0);

  const precio = precioVentaConsolidado;

  // Escenario base: la operación tal como está hoy.
  const margenBase = margenContribucionUnitario(precio, costoVariableConsolidado);
  const equilibrioBase = puntoEquilibrioUnidades(costoFijoTotal, margenBase);
  const resultadoBase = resultadoOperacional(
    ventasEstimadasMensuales,
    precio,
    costoVariableConsolidado,
    costoFijoTotal,
  );

  // Escenario estresado: mismas fórmulas con los supuestos movidos.
  const ventasEstresadas = Math.max(0, Math.round(ventasEstimadasMensuales * (1 + demanda / 100)));
  const costoVarEstresado = Math.round(costoVariableConsolidado * (1 + varCostoVariable / 100));
  const costoFijoEstresado = Math.round(costoFijoTotal * (1 + varCostoFijo / 100));

  const margenEstresado = margenContribucionUnitario(precio, costoVarEstresado);
  const equilibrioEstresado = puntoEquilibrioUnidades(costoFijoEstresado, margenEstresado);
  const resultadoEstresado = resultadoOperacional(
    ventasEstresadas,
    precio,
    costoVarEstresado,
    costoFijoEstresado,
  );

  const delta = resultadoEstresado - resultadoBase;
  const deltaEquilibrio =
    equilibrioEstresado !== null && equilibrioBase !== null ? equilibrioEstresado - equilibrioBase : null;
  const resiste = equilibrioEstresado !== null && ventasEstresadas >= equilibrioEstresado;

  const aplicar = (preajuste: Preajuste) => {
    setDemanda(preajuste.demanda);
    setVarCostoVariable(preajuste.costoVariable);
    setVarCostoFijo(preajuste.costoFijo);
  };

  const restablecer = () => {
    setDemanda(0);
    setVarCostoVariable(0);
    setVarCostoFijo(0);
  };

  const precioMinimoSugerido =
    ventasEstresadas > 0 ? Math.ceil(costoFijoEstresado / ventasEstresadas + costoVarEstresado) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Análisis"
        titulo="Simulador de estrés"
        descripcion="Qué pasa con tu negocio si suben los costos o caen las ventas. Sirve para saber cuánto aguantas antes de tener que subir precios o renegociar."
        acciones={
          <Badge tono={resiste ? 'positive' : 'negative'} punto>
            {resiste ? 'Resiste el escenario' : 'Entra en déficit'}
          </Badge>
        }
      />

      <div className="flex flex-wrap gap-2">
        {PREAJUSTES.map((preajuste) => {
          const activo =
            demanda === preajuste.demanda &&
            varCostoVariable === preajuste.costoVariable &&
            varCostoFijo === preajuste.costoFijo;

          return (
            <Button
              key={preajuste.clave}
              variante={activo ? 'primary' : 'secondary'}
              tamano="sm"
              onClick={() => aplicar(preajuste)}
              title={preajuste.descripcion}
            >
              {preajuste.etiqueta}
            </Button>
          );
        })}
        <Button variante="ghost" tamano="sm" onClick={restablecer}>
          Restablecer
        </Button>
      </div>

      <StatGrid>
        <StatCard
          etiqueta="Punto de equilibrio simulado"
          valor={equilibrioEstresado === null ? 'Inalcanzable' : formatearUnidades(equilibrioEstresado)}
          detalle={
            deltaEquilibrio === null
              ? 'Sin margen de contribución en este escenario'
              : `Base: ${formatearUnidades(equilibrioBase ?? 0)} (${deltaEquilibrio >= 0 ? '+' : ''}${formatearNumero(deltaEquilibrio)} un.)`
          }
          tonoValor={
            equilibrioEstresado === null
              ? 'negative'
              : deltaEquilibrio !== null && deltaEquilibrio > 0
                ? 'negative'
                : 'positive'
          }
        />
        <StatCard
          etiqueta="Resultado simulado"
          valor={formatearCLP(resultadoEstresado)}
          detalle={`Impacto vs. hoy: ${delta >= 0 ? '+' : ''}${formatearCLP(delta)}`}
          tonoValor={resultadoEstresado >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          etiqueta="Margen de contribución"
          valor={formatearCLP(margenEstresado)}
          detalle={`Base: ${formatearCLP(margenBase)} por unidad`}
          tonoValor="accent"
        />
        <StatCard
          etiqueta="Volumen simulado"
          valor={formatearUnidades(ventasEstresadas)}
          detalle={`Base: ${formatearUnidades(ventasEstimadasMensuales)}`}
        />
      </StatGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            eyebrow="Supuestos"
            titulo="Mueve las variables"
            descripcion="El precio de venta se mantiene fijo para aislar el efecto de cada palanca."
          />

          <div className="mt-6 space-y-6">
            <Deslizador
              etiqueta="Variación del volumen de ventas"
              valorMostrado={`${demanda > 0 ? '+' : ''}${demanda}% · ${formatearUnidades(ventasEstresadas)}`}
              min={-50}
              max={50}
              paso={5}
              valor={demanda}
              onChange={setDemanda}
              tonoValor={demanda >= 0 ? 'positive' : 'negative'}
            />
            <Deslizador
              etiqueta="Variación de costos variables"
              valorMostrado={`${varCostoVariable > 0 ? '+' : ''}${varCostoVariable}% · ${formatearCLP(costoVarEstresado)}`}
              min={-30}
              max={50}
              paso={2}
              valor={varCostoVariable}
              onChange={setVarCostoVariable}
              tonoValor={varCostoVariable <= 0 ? 'positive' : 'negative'}
            />
            <Deslizador
              etiqueta="Variación de costos fijos"
              valorMostrado={`${varCostoFijo > 0 ? '+' : ''}${varCostoFijo}% · ${formatearCLP(costoFijoEstresado)}`}
              min={-20}
              max={40}
              paso={2}
              valor={varCostoFijo}
              onChange={setVarCostoFijo}
              tonoValor={varCostoFijo <= 0 ? 'positive' : 'negative'}
            />
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader eyebrow="Diagnóstico" titulo="Cómo aguanta tu operación" />
            <p className="text-default mt-4 text-[0.875rem] leading-relaxed">
              {equilibrioEstresado === null
                ? 'En este escenario cada venta pierde plata: el costo variable supera al precio. Ningún volumen lo compensa.'
                : resiste
                  ? `Tu negocio absorbe el escenario y mantiene un margen de ${formatearPorcentaje(
                      resultadoEstresado > 0 ? (resultadoEstresado / (precio * ventasEstresadas || 1)) * 100 : 0,
                    )}. Te quedan ${pluralizar(ventasEstresadas - equilibrioEstresado, 'unidad', 'unidades')} de colchón sobre el nuevo punto de equilibrio.`
                  : `Bajo estos supuestos entras en déficit por ${formatearCLP(Math.abs(resultadoEstresado))} al mes. Te faltarían ${pluralizar(equilibrioEstresado - ventasEstresadas, 'unidad', 'unidades')} para volver al equilibrio.`}
            </p>
          </div>

          <div className="surface-sunken mt-6 rounded-xl border p-4">
            <p className="label-eyebrow mb-2">Qué hacer</p>
            <p
              className={`text-[0.875rem] font-semibold ${
                resiste ? 'text-positive-700 dark:text-positive-500' : 'text-negative-700 dark:text-negative-500'
              }`}
            >
              {resiste
                ? 'Tu estructura de costos resiste. No necesitas ajustes.'
                : `Sube el precio a ${formatearCLP(precioMinimoSugerido)} como mínimo, o renegocia costos fijos.`}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
