import { IconBasura } from '@/components/icons';
import {
  Badge,
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
import { formatearCLP, formatearPorcentaje } from '@/lib/format';
import { useAppState } from '@/store/appState';

export function TablaInventario() {
  const { inventario, eliminarProductoInventario } = useAppState();

  const enQuiebre = inventario.filter((item) => item.stockActual <= item.puntoReorden).length;

  return (
    <Card>
      <CardHeader
        eyebrow={`${inventario.length} ${inventario.length === 1 ? 'producto' : 'productos'}`}
        titulo="Inventario activo"
        descripcion="Cuando el stock baja del punto de reorden, hay que pedir antes de quedarse sin producto."
        acciones={
          enQuiebre > 0 ? (
            <Badge tono="negative" punto>
              {enQuiebre} por reponer
            </Badge>
          ) : inventario.length > 0 ? (
            <Badge tono="positive" punto>
              Stock al día
            </Badge>
          ) : undefined
        }
      />

      <div className="mt-4">
        {inventario.length === 0 ? (
          <EmptyState
            titulo="Sin productos en inventario"
            descripcion="Da de alta productos desde el catálogo o usa la carga masiva para subir tu lista completa."
          />
        ) : (
          <Tabla anchoMinimo="62rem">
            <TablaCabecera>
              <Th>SKU</Th>
              <Th>Producto</Th>
              <Th numerico>Costo</Th>
              <Th numerico>Precio</Th>
              <Th numerico>Margen</Th>
              <Th numerico>Ventas/mes</Th>
              <Th numerico>Stock</Th>
              <Th numerico>Reorden</Th>
              <Th className="text-center">Estado</Th>
              <Th className="w-12 text-center">
                <span className="sr-only">Acciones</span>
              </Th>
            </TablaCabecera>
            <TablaCuerpo>
              {inventario.map((item) => {
                const critico = item.stockActual <= item.puntoReorden;
                const margen =
                  item.precioVenta > 0 ? ((item.precioVenta - item.costoCompra) / item.precioVenta) * 100 : 0;

                return (
                  <Tr key={item.id}>
                    <Td className="text-accent font-mono text-[0.75rem] font-bold">{item.sku}</Td>
                    <Td enfasis className="max-w-[16rem] truncate">
                      {item.nombre}
                    </Td>
                    <Td numerico>{formatearCLP(item.costoCompra)}</Td>
                    <Td numerico enfasis>
                      {formatearCLP(item.precioVenta)}
                    </Td>
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
                    <Td numerico>{item.ventasMensuales}</Td>
                    <Td numerico enfasis>
                      {item.stockActual}
                    </Td>
                    <Td numerico className="text-muted">
                      {item.puntoReorden}
                    </Td>
                    <Td className="text-center">
                      <Badge tono={critico ? 'negative' : 'positive'} punto>
                        {critico ? 'Pedir' : 'Óptimo'}
                      </Badge>
                    </Td>
                    <Td className="text-center">
                      <button
                        type="button"
                        onClick={() => eliminarProductoInventario(item.id)}
                        aria-label={`Eliminar ${item.nombre}`}
                        className="text-faint hover:text-negative-600 dark:hover:text-negative-500 cursor-pointer rounded-md p-1.5 transition-colors"
                      >
                        <IconBasura className="size-4" />
                      </button>
                    </Td>
                  </Tr>
                );
              })}
            </TablaCuerpo>
          </Tabla>
        )}
      </div>
    </Card>
  );
}
