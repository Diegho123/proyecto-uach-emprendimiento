import { useState, type FormEvent } from 'react';
import { IconBasura } from '@/components/icons';
import {
  Button,
  CampoTexto,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  ProgressBar,
  StatCard,
  StatGrid,
  Tabla,
  TablaCabecera,
  TablaCuerpo,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { formatearCLP, formatearPorcentaje } from '@/lib/format';
import { useAppState } from '@/store/appState';

export function Mermas() {
  const {
    causalesMerma,
    porcentajeMermaGlobal,
    agregarCausalMerma,
    eliminarCausalMerma,
    costoVariableConsolidado,
    ventasEstimadasMensuales,
  } = useAppState();

  const [motivo, setMotivo] = useState('');
  const [porcentaje, setPorcentaje] = useState('');

  const costoMensualBase = costoVariableConsolidado * ventasEstimadasMensuales;
  const perdidaMensual = costoMensualBase * (porcentajeMermaGlobal / 100);

  const registrar = (evento: FormEvent) => {
    evento.preventDefault();
    const valor = Number(porcentaje);
    if (!motivo.trim() || !valor) return;

    agregarCausalMerma({ motivo: motivo.trim(), porcentaje: valor });
    setMotivo('');
    setPorcentaje('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Análisis"
        titulo="Control de mermas"
        descripcion="Lo que se pierde antes de venderse igual hay que pagarlo. Al registrarlo aquí, el porcentaje se carga al costo variable unitario y deja de aparecer como margen que no existe."
      />

      <StatGrid>
        <StatCard
          etiqueta="Factor de merma activo"
          valor={formatearPorcentaje(porcentajeMermaGlobal)}
          detalle="Suma de todas las causales registradas"
          tonoValor="negative"
        />
        <StatCard
          etiqueta="Costo mensual de la merma"
          valor={formatearCLP(perdidaMensual)}
          detalle="Plata que se pierde antes de llegar a la venta"
        />
        <StatCard
          etiqueta="Recargo aplicado al costeo"
          valor={`+${formatearPorcentaje(porcentajeMermaGlobal)}`}
          detalle="Se suma al costo de cada unidad vendida"
          tonoValor="accent"
        />
      </StatGrid>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)]">
        <Card className="h-fit">
          <CardHeader
            eyebrow="Registro"
            titulo="Agregar una causal"
            descripcion="Cada causal suma al factor global de merma."
          />
          <form onSubmit={registrar} className="mt-5 space-y-4">
            <CampoTexto
              etiqueta="Causal"
              placeholder="Ej. Falla de refrigeración"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
            <CampoTexto
              etiqueta="Incidencia estimada (%)"
              type="number"
              numerico
              step="0.1"
              min="0.1"
              max="50"
              placeholder="2,0"
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value)}
              ayuda="Sobre el costo de adquisición o producción."
              required
            />
            <Button type="submit" variante="primary" className="w-full">
              Agregar causal
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Desglose"
            titulo="Dónde se pierde la plata"
            descripcion="Ordena tus esfuerzos: la causal más cara es la primera que conviene atacar."
          />

          <div className="mt-4">
            {causalesMerma.length === 0 ? (
              <EmptyState
                titulo="Sin causales registradas"
                descripcion="Sin merma declarada, tu costo unitario queda optimista y el margen real será menor al que ves."
              />
            ) : (
              <Tabla anchoMinimo="34rem">
                <TablaCabecera>
                  <Th>Causal</Th>
                  <Th numerico>Incidencia</Th>
                  <Th>Peso relativo</Th>
                  <Th numerico>Impacto mensual</Th>
                  <Th className="w-12 text-center">
                    <span className="sr-only">Acciones</span>
                  </Th>
                </TablaCabecera>
                <TablaCuerpo>
                  {[...causalesMerma]
                    .sort((a, b) => b.porcentaje - a.porcentaje)
                    .map((causal) => {
                      const impacto = costoMensualBase * (causal.porcentaje / 100);
                      const peso =
                        porcentajeMermaGlobal > 0 ? (causal.porcentaje / porcentajeMermaGlobal) * 100 : 0;

                      return (
                        <Tr key={causal.id}>
                          <Td enfasis>{causal.motivo}</Td>
                          <Td numerico className="text-negative-600 dark:text-negative-500 font-bold">
                            {formatearPorcentaje(causal.porcentaje)}
                          </Td>
                          <Td className="w-40">
                            <div className="flex items-center gap-2">
                              <ProgressBar porcentaje={peso} tono="warning" className="flex-1" />
                              <span className="text-faint w-10 shrink-0 text-right font-mono text-[0.6875rem] tabular">
                                {Math.round(peso)}%
                              </span>
                            </div>
                          </Td>
                          <Td numerico>{formatearCLP(impacto)}</Td>
                          <Td className="text-center">
                            <button
                              type="button"
                              onClick={() => eliminarCausalMerma(causal.id)}
                              aria-label={`Eliminar ${causal.motivo}`}
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
      </div>
    </div>
  );
}
