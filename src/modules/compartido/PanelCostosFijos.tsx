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
import { formatearCLP, formatearPorcentaje, idLocal } from '@/lib/format';
import { useAppState } from '@/store/appState';

/**
 * Costos fijos: los que se pagan igual, vendas mucho o poco. Son el número que
 * el punto de equilibrio tiene que cubrir.
 */
export function PanelCostosFijos() {
  const { costosFijos, agregarCostoFijo, eliminarCostoFijo, costoFijoTotal } = useAppState();

  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');

  const guardar = (evento: FormEvent) => {
    evento.preventDefault();
    const valor = Number(monto);
    if (!nombre.trim() || !valor) return;

    agregarCostoFijo({ id: idLocal('cf'), nombre: nombre.trim(), monto: valor });
    setNombre('');
    setMonto('');
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)]">
      <Card className="h-fit">
        <CardHeader
          eyebrow="Costos fijos"
          titulo="Agregar un gasto mensual"
          descripcion="Arriendo, sueldos base, servicios, seguros."
        />
        <form onSubmit={guardar} className="mt-5 space-y-4">
          <CampoTexto
            etiqueta="Concepto"
            placeholder="Ej. Arriendo del local"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <CampoTexto
            etiqueta="Monto mensual"
            type="number"
            numerico
            min={1}
            placeholder="650000"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />
          <Button type="submit" variante="primary" className="w-full">
            Agregar costo fijo
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Estructura"
          titulo="Gastos que se pagan sí o sí"
          acciones={
            <div className="text-right">
              <p className="label-eyebrow">Total mensual</p>
              <p className="text-negative-600 dark:text-negative-500 mt-1 font-mono text-[1.125rem] font-bold tabular">
                {formatearCLP(costoFijoTotal)}
              </p>
            </div>
          }
        />

        <div className="mt-4">
          {costosFijos.length === 0 ? (
            <EmptyState
              titulo="Sin costos fijos registrados"
              descripcion="Sin ellos, el punto de equilibrio da cero y el resultado que ves será más optimista que la realidad."
            />
          ) : (
            <Tabla anchoMinimo="30rem">
              <TablaCabecera>
                <Th>Concepto</Th>
                <Th numerico>Monto mensual</Th>
                <Th numerico>Peso</Th>
                <Th className="w-12 text-center">
                  <span className="sr-only">Acciones</span>
                </Th>
              </TablaCabecera>
              <TablaCuerpo>
                {[...costosFijos]
                  .sort((a, b) => b.monto - a.monto)
                  .map((costo) => (
                    <Tr key={costo.id}>
                      <Td enfasis>{costo.nombre}</Td>
                      <Td numerico className="text-negative-600 dark:text-negative-500 font-bold">
                        {formatearCLP(costo.monto)}
                      </Td>
                      <Td numerico className="text-faint">
                        {formatearPorcentaje(costoFijoTotal > 0 ? (costo.monto / costoFijoTotal) * 100 : 0, 0)}
                      </Td>
                      <Td className="text-center">
                        <button
                          type="button"
                          onClick={() => eliminarCostoFijo(costo.id)}
                          aria-label={`Eliminar ${costo.nombre}`}
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
