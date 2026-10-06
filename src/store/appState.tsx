import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { causalesMermaDemo, datosPorPerfil, lotesLifoDemo } from '@/data';
import { costoReposicionLIFO } from '@/lib/calculations';
import type {
  CausalMerma,
  CostoFijo,
  CostoVariable,
  Insumo,
  LoteLIFO,
  PerfilNegocio,
  ProductoCatalogo,
  ProductoInventario,
  Receta,
  Recurso,
  Servicio,
} from '@/types/domain';

interface AppState {
  // Identidad del negocio
  perfil: PerfilNegocio | null;
  nombreNegocio: string;

  // Parámetros operativos
  margenObjetivoPorcentaje: number;
  setMargenObjetivoPorcentaje: (valor: number) => void;

  // Merma: el porcentaje global es la suma de las causales registradas
  causalesMerma: CausalMerma[];
  porcentajeMermaGlobal: number;
  agregarCausalMerma: (causal: Omit<CausalMerma, 'id'>) => void;
  eliminarCausalMerma: (id: string) => void;

  // Catálogos por rubro
  insumos: Insumo[];
  recetas: Receta[];
  catalogoMayorista: ProductoCatalogo[];
  inventario: ProductoInventario[];
  lotesLIFO: LoteLIFO[];
  recursos: Recurso[];
  servicios: Servicio[];
  costosVariables: CostoVariable[];
  costosFijos: CostoFijo[];

  // Mutadores
  agregarInsumo: (insumo: Insumo) => void;
  eliminarInsumo: (id: string) => void;
  agregarReceta: (receta: Receta) => void;
  eliminarReceta: (id: string) => void;
  agregarProductoInventario: (producto: ProductoInventario) => void;
  importarLoteInventario: (productos: ProductoInventario[]) => void;
  eliminarProductoInventario: (id: string) => void;
  setLotesLIFO: (lotes: LoteLIFO[]) => void;
  agregarLoteLIFO: (lote: LoteLIFO) => void;
  agregarServicio: (servicio: Servicio) => void;
  eliminarServicio: (id: string) => void;
  agregarCostoVariable: (costo: CostoVariable) => void;
  eliminarCostoVariable: (id: string) => void;
  agregarCostoFijo: (costo: CostoFijo) => void;
  eliminarCostoFijo: (id: string) => void;

  // Cifras consolidadas que alimentan el panel y las simulaciones
  ventasEstimadasMensuales: number;
  setVentasEstimadasMensuales: (valor: number) => void;
  precioVentaConsolidado: number;
  costoVariableConsolidado: number;
  costoFijoTotal: number;

  // Ciclo de vida
  elegirPerfil: (perfil: PerfilNegocio) => void;
  reiniciarNegocio: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

/** Consolidado ponderado por volumen de una lista de líneas de venta. */
interface LineaVenta {
  precioVenta: number;
  costoUnitario: number;
  volumen: number;
}

function consolidar(lineas: LineaVenta[]): { volumen: number; precio: number; costo: number } {
  const volumen = lineas.reduce((acc, l) => acc + l.volumen, 0);
  if (volumen === 0) return { volumen: 0, precio: 0, costo: 0 };

  const ingresos = lineas.reduce((acc, l) => acc + l.precioVenta * l.volumen, 0);
  const costos = lineas.reduce((acc, l) => acc + l.costoUnitario * l.volumen, 0);

  return { volumen, precio: ingresos / volumen, costo: costos / volumen };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilNegocio | null>(null);
  const [nombreNegocio, setNombreNegocio] = useState('');

  const [margenObjetivoPorcentaje, setMargenObjetivoPorcentaje] = useState(40);
  const [causalesMerma, setCausalesMerma] = useState<CausalMerma[]>([]);

  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [catalogoMayorista, setCatalogoMayorista] = useState<ProductoCatalogo[]>([]);
  const [inventario, setInventario] = useState<ProductoInventario[]>([]);
  const [lotesLIFO, setLotesLIFO] = useState<LoteLIFO[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [costosVariables, setCostosVariables] = useState<CostoVariable[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostoFijo[]>([]);

  /**
   * El volumen puede venir de los catálogos o sobrescribirse desde el conector
   * ERP. `null` significa "usa el volumen que se deduce de los catálogos".
   */
  const [volumenManual, setVolumenManual] = useState<number | null>(null);

  // El factor de merma nunca se guarda aparte: siempre es la suma de causales.
  const porcentajeMermaGlobal = useMemo(
    () => Number(causalesMerma.reduce((acc, c) => acc + c.porcentaje, 0).toFixed(2)),
    [causalesMerma],
  );

  const elegirPerfil = useCallback((perfilElegido: PerfilNegocio) => {
    const datos = datosPorPerfil[perfilElegido];

    setPerfil(perfilElegido);
    setNombreNegocio(datos.nombreNegocio);
    setVolumenManual(null);
    setCausalesMerma(causalesMermaDemo.map((c) => ({ ...c })));

    setInsumos((datos.insumos ?? []).map((i) => ({ ...i })));
    setRecetas((datos.recetas ?? []).map((r) => ({ ...r })));
    setCatalogoMayorista((datos.catalogoMayorista ?? []).map((c) => ({ ...c })));
    setInventario((datos.inventario ?? []).map((i) => ({ ...i })));
    setRecursos((datos.recursos ?? []).map((r) => ({ ...r })));
    setServicios((datos.servicios ?? []).map((s) => ({ ...s })));
    setCostosVariables(datos.costosVariables.map((c) => ({ ...c })));
    setCostosFijos(datos.costosFijos.map((c) => ({ ...c })));

    // Las capas LIFO solo tienen sentido donde hay reventa de stock.
    setLotesLIFO(perfilElegido === 'minimarket' ? lotesLifoDemo.map((l) => ({ ...l })) : []);
  }, []);

  const reiniciarNegocio = useCallback(() => {
    setPerfil(null);
    setNombreNegocio('');
    setVolumenManual(null);
    setCausalesMerma([]);
    setInsumos([]);
    setRecetas([]);
    setCatalogoMayorista([]);
    setInventario([]);
    setLotesLIFO([]);
    setRecursos([]);
    setServicios([]);
    setCostosVariables([]);
    setCostosFijos([]);
    setMargenObjetivoPorcentaje(40);
  }, []);

  /**
   * Consolidación reactiva. En minimarket el costo unitario usa el costo de
   * reposición de la capa LIFO vigente en vez del costo histórico de compra:
   * es el que refleja lo que cuesta reponer hoy lo que se vende hoy.
   */
  const { volumenCatalogo, precioVentaConsolidado, costoVariableConsolidado } = useMemo(() => {
    const otrosVariables = costosVariables.reduce((acc, cv) => acc + Number(cv.costoPorUnidad || 0), 0);
    const factorMerma = 1 + porcentajeMermaGlobal / 100;

    let lineas: LineaVenta[] = [];

    if (perfil === 'restaurant') {
      lineas = recetas.map((r) => ({
        precioVenta: r.precioVenta,
        costoUnitario: r.costoTotal,
        volumen: r.ventasEstimadas,
      }));
    } else if (perfil === 'minimarket') {
      lineas = inventario.map((item) => ({
        precioVenta: item.precioVenta,
        costoUnitario: costoReposicionLIFO(lotesLIFO, item.sku) ?? item.costoCompra,
        volumen: item.ventasMensuales,
      }));
    } else if (perfil === 'services') {
      lineas = servicios.map((s) => ({
        precioVenta: s.precioVenta,
        costoUnitario: s.costoTotal,
        volumen: s.ventasMensuales,
      }));
    }

    const { volumen, precio, costo } = consolidar(lineas);

    return {
      volumenCatalogo: volumen,
      precioVentaConsolidado: Math.round(precio),
      costoVariableConsolidado: Math.round(costo * factorMerma + otrosVariables),
    };
  }, [perfil, recetas, inventario, servicios, lotesLIFO, costosVariables, porcentajeMermaGlobal]);

  const costoFijoTotal = useMemo(
    () => costosFijos.reduce((acc, cf) => acc + Number(cf.monto || 0), 0),
    [costosFijos],
  );

  const ventasEstimadasMensuales = volumenManual ?? volumenCatalogo;

  // Si el catálogo cambia, el volumen manual del ERP deja de ser representativo.
  useEffect(() => {
    setVolumenManual(null);
  }, [perfil]);

  const value = useMemo<AppState>(
    () => ({
      perfil,
      nombreNegocio,

      margenObjetivoPorcentaje,
      setMargenObjetivoPorcentaje,

      causalesMerma,
      porcentajeMermaGlobal,
      agregarCausalMerma: (causal) =>
        setCausalesMerma((prev) => [...prev, { ...causal, id: `mer_${Date.now().toString(36)}` }]),
      eliminarCausalMerma: (id) => setCausalesMerma((prev) => prev.filter((c) => c.id !== id)),

      insumos,
      recetas,
      catalogoMayorista,
      inventario,
      lotesLIFO,
      recursos,
      servicios,
      costosVariables,
      costosFijos,

      agregarInsumo: (insumo) => setInsumos((prev) => [...prev, insumo]),
      eliminarInsumo: (id) => {
        setInsumos((prev) => prev.filter((i) => i.id !== id));
        // Las recetas guardan una copia del insumo, así que no quedan colgadas.
      },
      agregarReceta: (receta) => setRecetas((prev) => [...prev, receta]),
      eliminarReceta: (id) => setRecetas((prev) => prev.filter((r) => r.id !== id)),

      agregarProductoInventario: (producto) => setInventario((prev) => [...prev, producto]),
      importarLoteInventario: (productos) => setInventario((prev) => [...prev, ...productos]),
      eliminarProductoInventario: (id) => setInventario((prev) => prev.filter((p) => p.id !== id)),

      setLotesLIFO,
      agregarLoteLIFO: (lote) => setLotesLIFO((prev) => [lote, ...prev]),

      agregarServicio: (servicio) => setServicios((prev) => [...prev, servicio]),
      eliminarServicio: (id) => setServicios((prev) => prev.filter((s) => s.id !== id)),

      agregarCostoVariable: (costo) => setCostosVariables((prev) => [...prev, costo]),
      eliminarCostoVariable: (id) => setCostosVariables((prev) => prev.filter((c) => c.id !== id)),
      agregarCostoFijo: (costo) => setCostosFijos((prev) => [...prev, costo]),
      eliminarCostoFijo: (id) => setCostosFijos((prev) => prev.filter((c) => c.id !== id)),

      ventasEstimadasMensuales,
      setVentasEstimadasMensuales: (valor) => setVolumenManual(valor),
      precioVentaConsolidado,
      costoVariableConsolidado,
      costoFijoTotal,

      elegirPerfil,
      reiniciarNegocio,
    }),
    [
      perfil,
      nombreNegocio,
      margenObjetivoPorcentaje,
      causalesMerma,
      porcentajeMermaGlobal,
      insumos,
      recetas,
      catalogoMayorista,
      inventario,
      lotesLIFO,
      recursos,
      servicios,
      costosVariables,
      costosFijos,
      ventasEstimadasMensuales,
      precioVentaConsolidado,
      costoVariableConsolidado,
      costoFijoTotal,
      elegirPerfil,
      reiniciarNegocio,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const contexto = useContext(AppStateContext);
  if (!contexto) throw new Error('useAppState debe usarse dentro de un AppStateProvider');
  return contexto;
}
