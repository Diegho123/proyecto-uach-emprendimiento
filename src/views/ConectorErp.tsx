import { useState, type ChangeEvent } from 'react';
import { IconSubir } from '@/components/icons';
import {
  Badge,
  CampoSelect,
  Card,
  CardHeader,
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
import { formatearCLP, formatearFecha, formatearUnidades } from '@/lib/format';
import { useAppState } from '@/store/appState';

type EstadoSync = 'inactivo' | 'procesando' | 'listo';

interface ComprobanteDTE {
  documento: string;
  cliente: string;
  fecha: string;
  totalNeto: number;
  unidades: number;
}

const PROVEEDORES = [
  { valor: 'defontana', etiqueta: 'Defontana — reporte de ventas CSV' },
  { valor: 'softland', etiqueta: 'Softland ERP — libro de ventas TXT' },
  { valor: 'sii', etiqueta: 'SII — registro de compras y ventas' },
  { valor: 'bsale', etiqueta: 'Bsale — reporte consolidado' },
] as const;

/**
 * Respuesta de ejemplo del conector. Cuando exista el parser real, esta
 * constante se reemplaza por la lectura del archivo; el resto de la vista
 * no cambia porque ya trabaja sobre `ComprobanteDTE[]`.
 */
const COMPROBANTES_DEMO: ComprobanteDTE[] = [
  { documento: 'Factura 1042', cliente: 'Constructora Austral SpA', fecha: '2026-08-25', totalNeto: 485_000, unidades: 65 },
  { documento: 'Boleta 8921', cliente: 'Cliente mostrador', fecha: '2026-08-25', totalNeto: 38_900, unidades: 8 },
  { documento: 'Boleta 8922', cliente: 'Cliente mostrador', fecha: '2026-08-26', totalNeto: 112_000, unidades: 22 },
  { documento: 'Factura 1043', cliente: 'Comercial del Sur Ltda.', fecha: '2026-08-26', totalNeto: 340_000, unidades: 45 },
  { documento: 'Boleta 8923', cliente: 'Cliente mostrador', fecha: '2026-08-27', totalNeto: 78_500, unidades: 15 },
];

export function ConectorErp() {
  const { setVentasEstimadasMensuales, ventasEstimadasMensuales, precioVentaConsolidado } = useAppState();

  const [proveedor, setProveedor] = useState<string>(PROVEEDORES[0].valor);
  const [archivo, setArchivo] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoSync>('inactivo');
  const [comprobantes, setComprobantes] = useState<ComprobanteDTE[]>([]);

  const procesarArchivo = (evento: ChangeEvent<HTMLInputElement>) => {
    const seleccionado = evento.target.files?.[0];
    if (!seleccionado) return;

    setArchivo(seleccionado.name);
    setEstado('procesando');

    // El retardo simula el mapeo de SKUs que hará el parser real.
    window.setTimeout(() => {
      const volumen = COMPROBANTES_DEMO.reduce((acc, c) => acc + c.unidades, 0);
      setComprobantes(COMPROBANTES_DEMO);
      setVentasEstimadasMensuales(volumen);
      setEstado('listo');
    }, 800);
  };

  const totalNeto = comprobantes.reduce((acc, c) => acc + c.totalNeto, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Datos"
        titulo="Conector con tu ERP"
        descripcion="Trae tus ventas reales desde el sistema que ya usas para facturar. Integra Pyme no reemplaza tu facturación: toma esos datos y recalcula tu punto de equilibrio con el volumen que de verdad estás vendiendo."
      />

      <StatGrid>
        <StatCard
          etiqueta="Volumen sincronizado"
          valor={formatearUnidades(ventasEstimadasMensuales)}
          detalle={`Ingresos proyectados: ${formatearCLP(ventasEstimadasMensuales * precioVentaConsolidado)}`}
          tonoValor="accent"
        />
        <StatCard
          etiqueta="Estado del conector"
          valor={
            estado === 'listo' ? 'Sincronizado' : estado === 'procesando' ? 'Procesando…' : 'Listo para importar'
          }
          detalle={archivo ? `Archivo: ${archivo}` : 'Aún no cargas un archivo'}
          textual
          tonoValor={estado === 'listo' ? 'positive' : 'neutral'}
          indicador={estado === 'listo' ? { texto: 'Al día', tono: 'positive' } : undefined}
        />
        <StatCard
          etiqueta="Documentos procesados"
          valor={comprobantes.length.toString()}
          detalle={comprobantes.length > 0 ? `Monto neto: ${formatearCLP(totalNeto)}` : 'Boletas y facturas del período'}
        />
      </StatGrid>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card>
          <CardHeader eyebrow="Origen" titulo="¿Desde dónde exportas?" />
          <div className="mt-5">
            <CampoSelect value={proveedor} onChange={(e) => setProveedor(e.target.value)}>
              {PROVEEDORES.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.etiqueta}
                </option>
              ))}
            </CampoSelect>
            <p className="text-muted mt-3 text-[0.75rem] leading-relaxed">
              Sigues facturando en tu sistema actual. Acá solo leemos el reporte para calcular márgenes y
              rotación.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Importar"
            titulo="Carga el reporte de ventas"
            descripcion="Formatos aceptados: CSV, TXT o Excel."
          />

          <label className="surface-sunken mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-9 text-center transition-colors hover:border-[var(--accent)]">
            <IconSubir className="text-faint size-7" />
            <div>
              <p className="text-strong text-[0.8125rem] font-semibold">Selecciona tu archivo</p>
              <p className="text-muted mt-1 text-[0.75rem]">o arrástralo hasta aquí</p>
            </div>
            <input type="file" accept=".csv,.txt,.xlsx" onChange={procesarArchivo} className="sr-only" />
          </label>

          {estado === 'procesando' && (
            <p className="text-accent mt-4 text-center text-[0.8125rem] font-semibold">
              Procesando comprobantes y mapeando SKUs…
            </p>
          )}
        </Card>
      </div>

      {comprobantes.length > 0 && (
        <Card>
          <CardHeader
            eyebrow="Resultado"
            titulo="Comprobantes procesados"
            acciones={<Badge tono="positive" punto>{comprobantes.length} documentos</Badge>}
          />

          <div className="mt-4">
            <Tabla anchoMinimo="44rem">
              <TablaCabecera>
                <Th>Documento</Th>
                <Th>Cliente</Th>
                <Th>Fecha</Th>
                <Th numerico>Unidades</Th>
                <Th numerico>Monto neto</Th>
              </TablaCabecera>
              <TablaCuerpo>
                {comprobantes.map((item) => (
                  <Tr key={item.documento}>
                    <Td className="text-accent font-semibold">{item.documento}</Td>
                    <Td enfasis>{item.cliente}</Td>
                    <Td className="text-muted">{formatearFecha(item.fecha)}</Td>
                    <Td numerico>{item.unidades}</Td>
                    <Td numerico enfasis>
                      {formatearCLP(item.totalNeto)}
                    </Td>
                  </Tr>
                ))}
                <Tr className="surface-sunken">
                  <Td colSpan={3} enfasis>
                    Total del período
                  </Td>
                  <Td numerico enfasis>
                    {comprobantes.reduce((acc, c) => acc + c.unidades, 0)}
                  </Td>
                  <Td numerico className="text-positive-600 dark:text-positive-500 font-bold">
                    {formatearCLP(totalNeto)}
                  </Td>
                </Tr>
              </TablaCuerpo>
            </Tabla>
          </div>
        </Card>
      )}
    </div>
  );
}
