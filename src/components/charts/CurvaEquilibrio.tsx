import { useId, useState } from 'react';
import { formatearCLP, formatearCLPCompacto, formatearNumero } from '@/lib/format';
import type { PuntoCurva } from '@/types/domain';
import { EmptyState } from '@/components/ui';

interface CurvaEquilibrioProps {
  datos: PuntoCurva[];
  puntoEquilibrio: number | null;
  ventasActuales: number;
}

const ANCHO = 760;
const ALTO = 380;
const MARGEN = { arriba: 24, derecha: 24, abajo: 44, izquierda: 68 };

const AREA = {
  ancho: ANCHO - MARGEN.izquierda - MARGEN.derecha,
  alto: ALTO - MARGEN.arriba - MARGEN.abajo,
};

/**
 * Ingresos vs. costos totales. El cruce de ambas líneas es el punto de
 * equilibrio; la banda verde a su derecha es la zona en que se gana plata.
 *
 * SVG a mano en vez de una librería de gráficos: es una sola figura, y así los
 * colores salen de los tokens del tema en lugar de una paleta fija.
 */
export function CurvaEquilibrio({ datos, puntoEquilibrio, ventasActuales }: CurvaEquilibrioProps) {
  const [indiceActivo, setIndiceActivo] = useState<number | null>(null);
  const gradienteId = useId();

  if (datos.length < 2) {
    return (
      <EmptyState
        titulo="Faltan datos para proyectar la curva"
        descripcion="Carga al menos un producto o servicio con precio y volumen para ver el punto de equilibrio."
      />
    );
  }

  const maxUnidades = Math.max(...datos.map((d) => d.unidades), 1);
  const maxMonto = Math.max(...datos.map((d) => Math.max(d.ingresos, d.costos)), 1) * 1.12;

  const x = (unidades: number) => MARGEN.izquierda + (unidades / maxUnidades) * AREA.ancho;
  const y = (monto: number) => ALTO - MARGEN.abajo - (monto / maxMonto) * AREA.alto;

  const trazo = (clave: 'ingresos' | 'costos') =>
    datos.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.unidades)} ${y(d[clave])}`).join(' ');

  // Zona de utilidad: entre ambas curvas, desde el punto de equilibrio a la derecha.
  const zonaUtilidad =
    puntoEquilibrio !== null && puntoEquilibrio <= maxUnidades
      ? [
          ...datos.filter((d) => d.unidades >= puntoEquilibrio).map((d) => `${x(d.unidades)},${y(d.ingresos)}`),
          ...datos
            .filter((d) => d.unidades >= puntoEquilibrio)
            .reverse()
            .map((d) => `${x(d.unidades)},${y(d.costos)}`),
        ].join(' ')
      : null;

  const marcasY = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxMonto);
  const activo = indiceActivo !== null ? datos[indiceActivo] : null;
  const peVisible = puntoEquilibrio !== null && puntoEquilibrio > 0 && puntoEquilibrio <= maxUnidades;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[0.9375rem] font-bold">Curva de rentabilidad</h3>
          <p className="text-muted text-[0.75rem]">
            Dónde los ingresos alcanzan a los costos totales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[0.6875rem] font-bold">
          <Leyenda color="var(--color-positive-500)" texto="Ingresos" />
          <Leyenda color="var(--color-negative-500)" texto="Costos totales" />
          {peVisible && <Leyenda color="var(--accent)" texto="Punto de equilibrio" discontinua />}
        </div>
      </div>

      <div className="surface-sunken relative overflow-x-auto rounded-xl border p-2">
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          className="block h-auto w-full min-w-[38rem]"
          role="img"
          aria-label={`Curva de punto de equilibrio. Se equilibra en ${
            puntoEquilibrio === null ? 'un volumen inalcanzable' : `${formatearNumero(puntoEquilibrio)} unidades`
          }.`}
        >
          <defs>
            <linearGradient id={`${gradienteId}-utilidad`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-positive-500)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--color-positive-500)" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Grilla y eje de montos */}
          {marcasY.map((monto) => (
            <g key={monto}>
              <line
                x1={MARGEN.izquierda}
                y1={y(monto)}
                x2={ANCHO - MARGEN.derecha}
                y2={y(monto)}
                stroke="var(--border-subtle)"
                strokeWidth="1"
                strokeDasharray={monto === 0 ? undefined : '3 5'}
              />
              <text
                x={MARGEN.izquierda - 10}
                y={y(monto) + 4}
                textAnchor="end"
                className="fill-[var(--text-faint)] font-mono text-[10px] font-semibold"
              >
                {formatearCLPCompacto(monto)}
              </text>
            </g>
          ))}

          {zonaUtilidad && <polygon points={zonaUtilidad} fill={`url(#${gradienteId}-utilidad)`} />}

          {/* Eje de volumen */}
          {datos.map((d, i) =>
            i % 2 === 0 ? (
              <text
                key={d.unidades}
                x={x(d.unidades)}
                y={ALTO - MARGEN.abajo + 20}
                textAnchor="middle"
                className="fill-[var(--text-faint)] font-mono text-[10px] font-semibold"
              >
                {formatearNumero(d.unidades)}
              </text>
            ) : null,
          )}

          <path d={trazo('costos')} fill="none" stroke="var(--color-negative-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={trazo('ingresos')} fill="none" stroke="var(--color-positive-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {peVisible && (
            <g>
              <line
                x1={x(puntoEquilibrio)}
                y1={MARGEN.arriba}
                x2={x(puntoEquilibrio)}
                y2={ALTO - MARGEN.abajo}
                stroke="var(--accent)"
                strokeWidth="1.75"
                strokeDasharray="5 4"
              />
              <circle cx={x(puntoEquilibrio)} cy={ALTO - MARGEN.abajo} r="4.5" fill="var(--accent)" />
              <text
                x={x(puntoEquilibrio)}
                y={MARGEN.arriba - 8}
                textAnchor="middle"
                className="fill-[var(--accent)] font-mono text-[10.5px] font-bold"
              >
                {formatearNumero(puntoEquilibrio)} un.
              </text>
            </g>
          )}

          {/* Marcador del volumen real, para comparar con el umbral */}
          {ventasActuales > 0 && ventasActuales <= maxUnidades && (
            <line
              x1={x(ventasActuales)}
              y1={MARGEN.arriba}
              x2={x(ventasActuales)}
              y2={ALTO - MARGEN.abajo}
              stroke="var(--text-faint)"
              strokeWidth="1.25"
              strokeDasharray="2 4"
            />
          )}

          {/* Franjas invisibles: amplían el área sensible al puntero */}
          {datos.map((d, i) => (
            <g key={d.unidades} onMouseEnter={() => setIndiceActivo(i)} onMouseLeave={() => setIndiceActivo(null)}>
              <rect
                x={x(d.unidades) - AREA.ancho / (datos.length * 2)}
                y={MARGEN.arriba}
                width={AREA.ancho / datos.length}
                height={AREA.alto}
                fill="transparent"
              />
              {indiceActivo === i && (
                <>
                  <line
                    x1={x(d.unidades)}
                    y1={MARGEN.arriba}
                    x2={x(d.unidades)}
                    y2={ALTO - MARGEN.abajo}
                    stroke="var(--border-strong)"
                    strokeWidth="1"
                  />
                  <circle cx={x(d.unidades)} cy={y(d.ingresos)} r="4.5" fill="var(--color-positive-500)" stroke="var(--surface-panel)" strokeWidth="2" />
                  <circle cx={x(d.unidades)} cy={y(d.costos)} r="4.5" fill="var(--color-negative-500)" stroke="var(--surface-panel)" strokeWidth="2" />
                </>
              )}
            </g>
          ))}
        </svg>

        {activo && (
          <div
            className="pointer-events-none absolute top-4 z-10 min-w-[11rem] rounded-lg border border-[var(--border-strong)] bg-[var(--surface-panel)] p-3 shadow-pop"
            style={{
              left: `clamp(0.75rem, ${(x(activo.unidades) / ANCHO) * 100}%, calc(100% - 12rem))`,
            }}
          >
            <p className="label-eyebrow mb-2 border-b pb-1.5">{formatearNumero(activo.unidades)} unidades</p>
            <FilaTooltip etiqueta="Ingresos" valor={formatearCLP(activo.ingresos)} color="text-positive-600 dark:text-positive-500" />
            <FilaTooltip etiqueta="Costos" valor={formatearCLP(activo.costos)} color="text-negative-600 dark:text-negative-500" />
            <FilaTooltip
              etiqueta="Resultado"
              valor={formatearCLP(activo.ingresos - activo.costos)}
              color={activo.ingresos >= activo.costos ? 'text-strong' : 'text-negative-600 dark:text-negative-500'}
              destacada
            />
          </div>
        )}
      </div>

      <p className="label-eyebrow text-center">Volumen mensual de unidades vendidas</p>
    </div>
  );
}

function Leyenda({ color, texto, discontinua }: { color: string; texto: string; discontinua?: boolean }) {
  return (
    <span className="text-muted flex items-center gap-1.5">
      <span
        className="h-0.5 w-4 shrink-0 rounded-full"
        style={
          discontinua
            ? { backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)` }
            : { backgroundColor: color }
        }
      />
      {texto}
    </span>
  );
}

function FilaTooltip({
  etiqueta,
  valor,
  color,
  destacada,
}: {
  etiqueta: string;
  valor: string;
  color: string;
  destacada?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-0.5 ${destacada ? 'mt-1 border-t pt-1.5' : ''}`}>
      <span className="text-muted text-[0.6875rem]">{etiqueta}</span>
      <span className={`font-mono text-[0.75rem] font-bold tabular ${color}`}>{valor}</span>
    </div>
  );
}
