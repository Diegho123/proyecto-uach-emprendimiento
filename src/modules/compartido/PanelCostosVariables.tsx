import { useState, type FormEvent } from 'react';
import { IconBasura } from '@/components/icons';
import {
  Button,
  CampoTexto,
  Card,
  CardHeader,
  EmptyState,
  Tabla,
  TablaCabecera,
  TablaCuerpo,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { formatearCLP, idLocal } from '@/lib/format';
import { useAppState } from '@/store/appState';

/**
 * Costos variables indirectos: suben con cada venta pero no son parte del
 * producto (bolsas, comisiones de tarjeta, despacho). Se suman al costo
 * unitario y bajan el margen de contribución.
 */
export function PanelCostosVariables() {
  const { costosVariables, agregarCostoVariable, eliminarCostoVariable } = useAppState();

  const [nombre, setNombre] = useState('');
  const [costo, setCosto] = useState('');

  const total = costosVariables.reduce((acc, cv) => acc + cv.costoPorUnidad, 0);

  const guardar = (evento: FormEvent) => {
    evento.preventDefault();
    const valor = Number(costo);
    if (!nombre.trim() || !valor) return;

    agregarCostoVariable({ id: idLocal('cv'), nombre: nombre.trim(), costoPorUnidad: valor });
    setNombre('');
    setCosto('');
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)]">
      <Card className="h-fit">
        <CardHeader
          eyebrow="Costos variables"
          titulo="Agregar un costo por venta"
          descripcion="Packaging, comisión de tarjeta, despacho."
        />
        <form onSubmit={guardar} className="mt-5 space-y-4">
          <CampoTexto
            etiqueta="Concepto"
            placeholder="Ej. Comisión Transbank"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <CampoTexto
            etiqueta="Costo por unidad vendida"
            type="number"
            numerico
            min={1}
            placeholder="250"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            required
          />
          <Button type="submit" variante="primary" className="w-full">
            Agregar costo variable
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Estructura"
          titulo="Costos que suben con cada venta"
          descripcion="No son parte del producto, pero se pagan igual en cada transacción."
          acciones={
            <div className="text-right">
              <p className="label-eyebrow">Extra por venta</p>
              <p className="text-warning-600 dark:text-warning-500 mt-1 font-mono text-[1.125rem] font-bold tabular">
                {formatearCLP(total)}
              </p>
            </div>
          }
        />

        <div className="mt-4">
          {costosVariables.length === 0 ? (
            <EmptyState
              titulo="Sin costos variables adicionales"
              descripcion="Si cobras con tarjeta o entregas en bolsas, ese costo también sale de tu margen."
            />
          ) : (
            <Tabla anchoMinimo="26rem">
              <TablaCabecera>
                <Th>Concepto</Th>
                <Th numerico>Costo por venta</Th>
                <Th className="w-12 text-center">
                  <span className="sr-only">Acciones</span>
                </Th>
              </TablaCabecera>
              <TablaCuerpo>
                {costosVariables.map((costoVar) => (
                  <Tr key={costoVar.id}>
                    <Td enfasis>{costoVar.nombre}</Td>
                    <Td numerico className="text-warning-600 dark:text-warning-500 font-bold">
                      {formatearCLP(costoVar.costoPorUnidad)}
                    </Td>
                    <Td className="text-center">
                      <button
                        type="button"
                        onClick={() => eliminarCostoVariable(costoVar.id)}
                        aria-label={`Eliminar ${costoVar.nombre}`}
                        className="text-faint hover:text-negative-600 dark:hover:text-negative-500 cursor-pointer rounded-md p-1.5 transition-colors"
                      >
                        <IconBasura className="size-4" />
                      </button>
                    </Td>
                  </Tr>
                ))}
              </TablaCuerpo>
            </Tabla>
          )}
        </div>
      </Card>
    </section>
  );
}
