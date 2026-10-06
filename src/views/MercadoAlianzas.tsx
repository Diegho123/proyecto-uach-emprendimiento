import { useState } from 'react';
import { Badge, Button, Card, PageHeader, ProgressBar, StatCard, StatGrid } from '@/components/ui';
import { formatearCLP, formatearNumero, formatearPorcentaje, pluralizar } from '@/lib/format';

interface Alianza {
  id: string;
  rubro: string;
  titulo: string;
  proveedor: string;
  metaMinima: number;
  unidadesComprometidas: number;
  ahorroPorcentaje: number;
  precioAlianza: number;
  precioIndividual: number;
  participantes: number;
  unido: boolean;
}

/**
 * Indicadores de referencia. Cuando exista un proveedor de datos (mindicador.cl
 * o el Banco Central), esto se reemplaza por una consulta real; la forma del
 * dato ya es la definitiva.
 */
const INDICADORES = [
  { etiqueta: 'UF', valor: 37_950, formato: 'clp', detalle: 'Indexación de arriendos' },
  { etiqueta: 'Dólar observado', valor: 945, formato: 'clp', detalle: 'Insumos importados' },
  { etiqueta: 'UTM', valor: 65_967, formato: 'clp', detalle: 'Impuestos y patentes' },
  { etiqueta: 'IPC mensual', valor: 0.4, formato: 'pct', detalle: 'Presión inflacionaria' },
  { etiqueta: 'Tasa de política monetaria', valor: 5.75, formato: 'pct', detalle: 'Costo de financiamiento' },
] as const;

const ALIANZAS_INICIALES: Alianza[] = [
  {
    id: 'ali_1',
    rubro: 'Gastronomía',
    titulo: 'Compra conjunta de packaging biodegradable',
    proveedor: 'EcoEnvases Chile',
    metaMinima: 10_000,
    unidadesComprometidas: 7_400,
    ahorroPorcentaje: 28,
    precioAlianza: 145,
    precioIndividual: 201,
    participantes: 8,
    unido: false,
  },
  {
    id: 'ali_2',
    rubro: 'Ferretería',
    titulo: 'Lote de tornillería y fijaciones por pallet',
    proveedor: 'Distribuidora Metálica Sur',
    metaMinima: 50,
    unidadesComprometidas: 32,
    ahorroPorcentaje: 22,
    precioAlianza: 18_500,
    precioIndividual: 23_700,
    participantes: 5,
    unido: true,
  },
  {
    id: 'ali_3',
    rubro: 'Abarrotes',
    titulo: 'Consolidación de carga de harina y granos',
    proveedor: 'Molino Central',
    metaMinima: 100,
    unidadesComprometidas: 92,
    ahorroPorcentaje: 19,
    precioAlianza: 14_200,
    precioIndividual: 17_500,
    participantes: 12,
    unido: false,
  },
];

export function MercadoAlianzas() {
  const [alianzas, setAlianzas] = useState(ALIANZAS_INICIALES);

  const alternarParticipacion = (id: string) =>
    setAlianzas((prev) =>
      prev.map((alianza) =>
        alianza.id === id
          ? {
              ...alianza,
              unido: !alianza.unido,
              participantes: alianza.unido ? alianza.participantes - 1 : alianza.participantes + 1,
            }
          : alianza,
      ),
    );

  const abiertas = alianzas.filter((a) => a.unidadesComprometidas < a.metaMinima).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Análisis"
        titulo="Mercado y alianzas"
        descripcion="Los indicadores que mueven tus costos, y compras conjuntas con otras pymes para conseguir precios de volumen que solo no alcanzarías."
      />

      <section className="space-y-3">
        <h3 className="label-eyebrow">Indicadores del mes</h3>
        <StatGrid>
          {INDICADORES.map((indicador) => (
            <StatCard
              key={indicador.etiqueta}
              etiqueta={indicador.etiqueta}
              valor={
                indicador.formato === 'clp'
                  ? formatearCLP(indicador.valor)
                  : `+${formatearPorcentaje(indicador.valor)}`
              }
              detalle={indicador.detalle}
              tonoValor={indicador.formato === 'pct' ? 'negative' : 'neutral'}
            />
          ))}
        </StatGrid>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-[1rem] font-bold">Compras en escala</h3>
          <span className="text-muted text-[0.8125rem]">
            {abiertas} {abiertas === 1 ? 'convocatoria abierta' : 'convocatorias abiertas'}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {alianzas.map((alianza) => {
            const avance = (alianza.unidadesComprometidas / alianza.metaMinima) * 100;
            const completa = avance >= 100;

            return (
              <Card key={alianza.id} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge tono="neutral">{alianza.rubro}</Badge>
                  <Badge tono="positive">−{alianza.ahorroPorcentaje}% en costo</Badge>
                </div>

                <div className="min-h-[4.25rem]">
                  <h4 className="text-[0.9375rem] leading-snug font-bold">{alianza.titulo}</h4>
                  <p className="text-muted mt-1.5 text-[0.75rem]">
                    Proveedor: <span className="text-default font-semibold">{alianza.proveedor}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2 text-[0.75rem]">
                    <span className="text-muted">Avance de la meta</span>
                    <span className="text-strong font-mono font-bold tabular">
                      {formatearNumero(alianza.unidadesComprometidas)} / {formatearNumero(alianza.metaMinima)}
                    </span>
                  </div>
                  <ProgressBar porcentaje={avance} tono={completa ? 'positive' : 'accent'} />
                </div>

                <div className="grid grid-cols-2 gap-3 border-y py-3">
                  <div>
                    <p className="label-eyebrow mb-1">Precio en alianza</p>
                    <p className="text-positive-600 dark:text-positive-500 font-mono text-[0.9375rem] font-bold tabular">
                      {formatearCLP(alianza.precioAlianza)}
                    </p>
                  </div>
                  <div>
                    <p className="label-eyebrow mb-1">Comprando solo</p>
                    <p className="text-faint font-mono text-[0.9375rem] font-bold tabular line-through">
                      {formatearCLP(alianza.precioIndividual)}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <span className="text-muted text-[0.75rem]">
                    {pluralizar(alianza.participantes, 'pyme unida', 'pymes unidas')}
                  </span>
                  <Button
                    variante={alianza.unido ? 'success' : 'primary'}
                    tamano="sm"
                    onClick={() => alternarParticipacion(alianza.id)}
                  >
                    {alianza.unido ? 'Ya estás dentro' : 'Unirme'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
