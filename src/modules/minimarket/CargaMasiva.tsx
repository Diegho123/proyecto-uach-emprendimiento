import { useState } from 'react';
import {
  Button,
  CampoArea,
  Card,
  CardHeader,
  Tabla,
  TablaCabecera,
  TablaCuerpo,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { calcularPuntoReorden } from '@/lib/calculations';
import { formatearCLP, formatearPorcentaje, idLocal } from '@/lib/format';
import { useAppState } from '@/store/appState';
import type { ProductoInventario } from '@/types/domain';

type FilaPlantilla = Omit<ProductoInventario, 'id' | 'puntoReorden'>;

const PLANTILLAS: Record<string, { etiqueta: string; descripcion: string; filas: FilaPlantilla[] }> = {
  ferreteria: {
    etiqueta: 'Ferretería',
    descripcion: 'SKUs críticos de fijaciones, herramientas y gasfitería',
    filas: [
      { sku: 'FER-001', nombre: 'Tornillo Yeso Cartón 6x1 (caja 1000)', costoCompra: 4500, precioVenta: 7990, ventasMensuales: 35, stockActual: 12, leadTimeDias: 3, mermaEsperada: 2 },
      { sku: 'FER-002', nombre: 'Disco Corte Metal 4½"', costoCompra: 650, precioVenta: 1290, ventasMensuales: 180, stockActual: 45, leadTimeDias: 2, mermaEsperada: 1 },
      { sku: 'FER-003', nombre: 'Cinta Teflón ¾ x 10 m', costoCompra: 280, precioVenta: 690, ventasMensuales: 95, stockActual: 30, leadTimeDias: 4, mermaEsperada: 0.5 },
      { sku: 'FER-004', nombre: 'Broca Concreto 6 mm', costoCompra: 1100, precioVenta: 2190, ventasMensuales: 40, stockActual: 8, leadTimeDias: 5, mermaEsperada: 1 },
      { sku: 'FER-005', nombre: 'Guante Cabritilla (par)', costoCompra: 1800, precioVenta: 3490, ventasMensuales: 60, stockActual: 15, leadTimeDias: 3, mermaEsperada: 0 },
      { sku: 'FER-006', nombre: 'Silicona Neutra 280 ml', costoCompra: 2400, precioVenta: 4290, ventasMensuales: 50, stockActual: 10, leadTimeDias: 4, mermaEsperada: 3 },
    ],
  },
  abarrotes: {
    etiqueta: 'Abarrotes',
    descripcion: 'Los básicos de rotación alta de un almacén',
    filas: [
      { sku: 'AB-001', nombre: 'Arroz Grado 1 (1 kg)', costoCompra: 1150, precioVenta: 1590, ventasMensuales: 240, stockActual: 50, leadTimeDias: 2, mermaEsperada: 1.5 },
      { sku: 'AB-002', nombre: 'Aceite Vegetal 900 ml', costoCompra: 1450, precioVenta: 1990, ventasMensuales: 190, stockActual: 35, leadTimeDias: 3, mermaEsperada: 0.5 },
      { sku: 'AB-003', nombre: 'Azúcar Blanca 1 kg', costoCompra: 980, precioVenta: 1350, ventasMensuales: 210, stockActual: 40, leadTimeDias: 2, mermaEsperada: 1 },
      { sku: 'AB-004', nombre: 'Leche Entera 1 L', costoCompra: 820, precioVenta: 1190, ventasMensuales: 300, stockActual: 60, leadTimeDias: 1, mermaEsperada: 2.5 },
    ],
  },
};

const COLUMNAS = 'SKU · Nombre · Costo · Precio · Ventas/mes · Stock · Días de reposición';

export function CargaMasiva() {
  const { importarLoteInventario } = useAppState();

  const [texto, setTexto] = useState('');
  const [previsualizacion, setPrevisualizacion] = useState<ProductoInventario[]>([]);
  const [error, setError] = useState('');

  const conPuntoReorden = (fila: FilaPlantilla): ProductoInventario => ({
    ...fila,
    id: idLocal('inv'),
    puntoReorden: calcularPuntoReorden(fila.ventasMensuales, fila.leadTimeDias),
  });

  const cargarPlantilla = (clave: keyof typeof PLANTILLAS) => {
    setPrevisualizacion(PLANTILLAS[clave].filas.map(conPuntoReorden));
    setError('');
  };

  /** Acepta lo que se pega desde Excel (tabulaciones) o un CSV (comas). */
  const procesarTexto = () => {
    const lineas = texto.trim().split('\n').filter(Boolean);
    if (lineas.length === 0) return;

    const filas: ProductoInventario[] = [];

    for (const linea of lineas) {
      const columnas = (linea.includes('\t') ? linea.split('\t') : linea.split(',')).map((c) => c.trim());
      if (columnas.length < 4) continue;

      const aNumero = (valor: string | undefined, porDefecto: number) => {
        const limpio = Number(String(valor ?? '').replace(/[^0-9.,-]/g, '').replace(',', '.'));
        return Number.isFinite(limpio) && limpio !== 0 ? limpio : porDefecto;
      };

      const ventas = aNumero(columnas[4], 20);
      const leadTime = aNumero(columnas[6], 3);

      filas.push({
        id: idLocal('inv'),
        sku: columnas[0],
        nombre: columnas[1],
        costoCompra: aNumero(columnas[2], 0),
        precioVenta: aNumero(columnas[3], 0),
        ventasMensuales: ventas,
        stockActual: aNumero(columnas[5], 10),
        leadTimeDias: leadTime,
        mermaEsperada: 1,
        puntoReorden: calcularPuntoReorden(ventas, leadTime),
      });
    }

    if (filas.length === 0) {
      setError(`No se reconoció ninguna fila. Usa el orden: ${COLUMNAS}`);
      return;
    }

    setPrevisualizacion(filas);
    setError('');
  };

  const confirmar = () => {
    if (previsualizacion.length === 0) return;
    importarLoteInventario(previsualizacion);
    setPrevisualizacion([]);
    setTexto('');
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {Object.entries(PLANTILLAS).map(([clave, plantilla]) => (
          <Card key={clave} className="flex flex-col gap-3">
            <div>
              <p className="label-eyebrow mb-1.5">Plantilla lista</p>
              <h4 className="text-[0.9375rem] font-bold">{plantilla.etiqueta}</h4>
              <p className="text-muted mt-1 text-[0.75rem]">{plantilla.descripcion}</p>
            </div>
            <Button
              variante="secondary"
              className="mt-auto w-full"
              onClick={() => cargarPlantilla(clave as keyof typeof PLANTILLAS)}
            >
              Previsualizar {plantilla.filas.length} productos
            </Button>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          eyebrow="Desde tu planilla"
          titulo="Pega tus datos de Excel o CSV"
          descripcion={`Una fila por producto, en este orden: ${COLUMNAS}`}
        />

        <div className="mt-5 space-y-3">
          <CampoArea
            rows={4}
            placeholder={'FER-001\tClavo corriente 3"\t1200\t2100\t80\t25\t3'}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setError('');
            }}
          />

          {error && <p className="text-negative-600 dark:text-negative-500 text-[0.75rem] font-semibold">{error}</p>}

          <Button variante="primary" onClick={procesarTexto} disabled={!texto.trim()}>
            Procesar lote
          </Button>
        </div>
      </Card>

      {previsualizacion.length > 0 && (
        <Card>
          <CardHeader
            eyebrow="Revisión previa"
            titulo={`${previsualizacion.length} productos por importar`}
            descripcion="Revisa márgenes y puntos de reorden antes de confirmar."
            acciones={
              <Button variante="success" onClick={confirmar}>
                Confirmar importación
              </Button>
            }
          />

          <div className="mt-4">
            <Tabla anchoMinimo="46rem">
              <TablaCabecera>
                <Th>SKU</Th>
                <Th>Producto</Th>
                <Th numerico>Costo</Th>
                <Th numerico>Precio</Th>
                <Th numerico>Margen</Th>
                <Th numerico>Reorden</Th>
              </TablaCabecera>
              <TablaCuerpo>
                {previsualizacion.map((item) => {
                  const margen =
                    item.precioVenta > 0 ? ((item.precioVenta - item.costoCompra) / item.precioVenta) * 100 : 0;

                  return (
                    <Tr key={item.id}>
                      <Td className="text-accent font-mono text-[0.75rem] font-bold">{item.sku}</Td>
                      <Td enfasis className="max-w-[18rem] truncate">
                        {item.nombre}
                      </Td>
                      <Td numerico>{formatearCLP(item.costoCompra)}</Td>
                      <Td numerico>{formatearCLP(item.precioVenta)}</Td>
                      <Td
                        numerico
                        className={
                          margen >= 25
                            ? 'text-positive-600 dark:text-positive-500 font-bold'
                            : 'text-warning-600 dark:text-warning-500 font-bold'
                        }
                      >
                        {formatearPorcentaje(margen, 0)}
                      </Td>
                      <Td numerico className="text-muted">
                        {item.puntoReorden} un.
                      </Td>
                    </Tr>
                  );
                })}
              </TablaCuerpo>
            </Tabla>
          </div>
        </Card>
      )}
    </div>
  );
}
