import { useMemo, useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  CampoSelect,
  CampoTexto,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  StatCard,
  StatGrid,
  Tabla,
  TablaCabecera,
  TablaCuerpo,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { capasLIFO, despacharLIFO, type ResultadoDespachoLIFO } from '@/lib/calculations';
import { formatearCLP, formatearFecha, formatearUnidades, idLocal, pluralizar } from '@/lib/format';
import { useAppState } from '@/store/appState';

export function InventarioLIFO() {
  const { inventario, lotesLIFO, setLotesLIFO, agregarLoteLIFO } = useAppState();

  const skusDisponibles = useMemo(() => {
    const desdeInventario = inventario.map((i) => ({ sku: i.sku, nombre: i.nombre }));
    const desdeLotes = lotesLIFO.map((l) => ({ sku: l.sku, nombre: l.producto }));
    const mapa = new Map<string, string>();
    [...desdeInventario, ...desdeLotes].forEach(({ sku, nombre }) => mapa.set(sku, nombre));
    return [...mapa.entries()].map(([sku, nombre]) => ({ sku, nombre }));
  }, [inventario, lotesLIFO]);

  const [sku, setSku] = useState(() => skusDisponibles[0]?.sku ?? '');
  const [ultimoDespacho, setUltimoDespacho] = useState<ResultadoDespachoLIFO | null>(null);
  const [errorDespacho, setErrorDespacho] = useState('');

  const [nuevoLote, setNuevoLote] = useState({
    cantidad: '',
    costoUnitario: '',
    fecha: new Date().toISOString().slice(0, 10),
  });
  const [unidadesADespachar, setUnidadesADespachar] = useState('');

  const capas = capasLIFO(lotesLIFO, sku);
  const stockTotal = capas.reduce((acc, l) => acc + l.cantidadDisponible, 0);
  const valorizacion = capas.reduce((acc, l) => acc + l.cantidadDisponible * l.costoUnitario, 0);
  const costoPromedio = stockTotal > 0 ? valorizacion / stockTotal : 0;
  const capaVigente = capas.find((l) => l.cantidadDisponible > 0);

  const registrarCompra = (evento: FormEvent) => {
    evento.preventDefault();
    const cantidad = Number(nuevoLote.cantidad);
    const costo = Number(nuevoLote.costoUnitario);
    if (!cantidad || !costo) return;

    const nombreProducto = skusDisponibles.find((s) => s.sku === sku)?.nombre ?? 'Producto';

    agregarLoteLIFO({
      id: idLocal('lot'),
      fecha: nuevoLote.fecha,
      sku,
      producto: nombreProducto,
      cantidadComprada: cantidad,
      cantidadDisponible: cantidad,
      costoUnitario: costo,
    });

    setNuevoLote((prev) => ({ ...prev, cantidad: '', costoUnitario: '' }));
  };

  const procesarDespacho = (evento: FormEvent) => {
    evento.preventDefault();
    const unidades = Number(unidadesADespachar);

    const resultado = despacharLIFO(lotesLIFO, sku, unidades);
    if (!resultado) {
      setErrorDespacho(`Stock insuficiente: solo hay ${formatearUnidades(stockTotal)} en las capas registradas.`);
      return;
    }

    setLotesLIFO(resultado.lotesActualizados);
    setUltimoDespacho(resultado);
    setErrorDespacho('');
    setUnidadesADespachar('');
  };

  if (skusDisponibles.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Operación" titulo="Valoración de inventario por capas LIFO" />
        <EmptyState
          titulo="No hay productos en inventario"
          descripcion="Registra productos en Estructura de costos para empezar a controlar sus capas de costo."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operación"
        titulo="Valoración de inventario por capas LIFO"
        descripcion="Cada compra abre una capa de costo. Al despachar se consume primero la más reciente, que es la que refleja lo que te cuesta reponer hoy. Ese costo alimenta el panel y el punto de equilibrio."
        acciones={
          <CampoSelect
            etiqueta="Producto"
            value={sku}
            onChange={(e) => {
              setSku(e.target.value);
              setUltimoDespacho(null);
              setErrorDespacho('');
            }}
            className="w-64"
          >
            {skusDisponibles.map((item) => (
              <option key={item.sku} value={item.sku}>
                {item.sku} — {item.nombre}
              </option>
            ))}
          </CampoSelect>
        }
      />

      <StatGrid>
        <StatCard
          etiqueta="Stock en capas"
          valor={formatearUnidades(stockTotal)}
          detalle={pluralizar(capas.filter((l) => l.cantidadDisponible > 0).length, 'capa con saldo', 'capas con saldo')}
        />
        <StatCard
          etiqueta="Valorización total"
          valor={formatearCLP(valorizacion)}
          detalle="Costo del stock que tienes en bodega"
          tonoValor="accent"
        />
        <StatCard
          etiqueta="Costo promedio en bodega"
          valor={formatearCLP(costoPromedio)}
          detalle="Por unidad remanente"
        />
        <StatCard
          etiqueta="Costo de reposición vigente"
          valor={formatearCLP(capaVigente?.costoUnitario ?? 0)}
          detalle="El que se aplica al punto de equilibrio"
          tonoValor="negative"
          indicador={{ texto: 'LIFO', tono: 'negative' }}
        />
      </StatGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            eyebrow="Entrada"
            titulo="Registrar una compra"
            descripcion="Abre una capa nueva con el costo de esta factura."
          />
          <form onSubmit={registrarCompra} className="mt-5 space-y-4">
            <CampoTexto
              etiqueta="Fecha de la factura"
              type="date"
              value={nuevoLote.fecha}
              onChange={(e) => setNuevoLote((p) => ({ ...p, fecha: e.target.value }))}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                etiqueta="Cantidad"
                type="number"
                numerico
                min={1}
                placeholder="50"
                value={nuevoLote.cantidad}
                onChange={(e) => setNuevoLote((p) => ({ ...p, cantidad: e.target.value }))}
                required
              />
              <CampoTexto
                etiqueta="Costo unitario"
                type="number"
                numerico
                min={1}
                placeholder="5200"
                value={nuevoLote.costoUnitario}
                onChange={(e) => setNuevoLote((p) => ({ ...p, costoUnitario: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" variante="primary" className="w-full">
              Ingresar capa de costo
            </Button>
          </form>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            eyebrow="Salida"
            titulo="Despachar una venta"
            descripcion="Consume la capa más reciente y reconoce ese costo."
          />
          <form onSubmit={procesarDespacho} className="mt-5 space-y-4">
            <CampoTexto
              etiqueta="Unidades a despachar"
              type="number"
              numerico
              min={1}
              max={stockTotal}
              placeholder={`Disponible: ${stockTotal}`}
              value={unidadesADespachar}
              onChange={(e) => {
                setUnidadesADespachar(e.target.value);
                setErrorDespacho('');
              }}
              required
              ayuda={errorDespacho || undefined}
              className={errorDespacho ? '[&_p]:text-negative-600 dark:[&_p]:text-negative-500' : undefined}
            />
            <Button type="submit" variante="danger" className="w-full" disabled={stockTotal === 0}>
              Procesar salida LIFO
            </Button>
          </form>

          {ultimoDespacho && (
            <div className="surface-sunken mt-5 rounded-xl border p-4">
              <p className="label-eyebrow mb-3">Costo de venta reconocido</p>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-muted text-[0.75rem]">
                  {formatearUnidades(ultimoDespacho.unidades)} despachadas
                </span>
                <span className="text-negative-600 dark:text-negative-500 font-mono text-[1.125rem] font-bold tabular">
                  {formatearCLP(ultimoDespacho.cmvTotal)}
                </span>
              </div>
              <p className="text-faint mt-2 text-[0.6875rem]">
                Costo unitario efectivo: <strong>{formatearCLP(ultimoDespacho.costoUnitarioEfectivo)}</strong> —
                consumió {pluralizar(ultimoDespacho.capas.length, 'capa', 'capas')}.
              </p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          eyebrow={sku}
          titulo="Pila de capas"
          descripcion="Ordenadas de la compra más reciente a la más antigua: así se consumen."
        />

        <div className="mt-4">
          {capas.length === 0 ? (
            <EmptyState titulo="Sin capas registradas" descripcion="Registra una compra para abrir la primera." />
          ) : (
            <Tabla anchoMinimo="52rem">
              <TablaCabecera>
                <Th>Orden</Th>
                <Th>Fecha de ingreso</Th>
                <Th numerico>Cantidad inicial</Th>
                <Th numerico>Saldo</Th>
                <Th numerico>Costo unitario</Th>
                <Th numerico>Valorización</Th>
                <Th className="text-center">Estado</Th>
              </TablaCabecera>
              <TablaCuerpo>
                {capas.map((lote, indice) => {
                  const esSiguiente =
                    lote.cantidadDisponible > 0 && capas.slice(0, indice).every((l) => l.cantidadDisponible === 0);

                  return (
                    <Tr key={lote.id}>
                      <Td enfasis>
                        {esSiguiente ? (
                          <Badge tono="accent" punto>
                            Siguiente salida
                          </Badge>
                        ) : (
                          <span className="text-faint">Capa {indice + 1}</span>
                        )}
                      </Td>
                      <Td>{formatearFecha(lote.fecha)}</Td>
                      <Td numerico>{lote.cantidadComprada}</Td>
                      <Td numerico enfasis={lote.cantidadDisponible > 0}>
                        {lote.cantidadDisponible}
                      </Td>
                      <Td numerico>{formatearCLP(lote.costoUnitario)}</Td>
                      <Td numerico enfasis>
                        {formatearCLP(lote.cantidadDisponible * lote.costoUnitario)}
                      </Td>
                      <Td className="text-center">
                        <Badge tono={lote.cantidadDisponible === 0 ? 'neutral' : 'positive'}>
                          {lote.cantidadDisponible === 0 ? 'Agotada' : 'Disponible'}
                        </Badge>
                      </Td>
                    </Tr>
                  );
                })}
              </TablaCuerpo>
            </Tabla>
          )}
        </div>
      </Card>
    </div>
  );
}
