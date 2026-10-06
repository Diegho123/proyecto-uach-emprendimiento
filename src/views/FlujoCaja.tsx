import { useMemo, useState } from 'react';
import { IconBasura, IconMas } from '@/components/icons';
import { Button, Card, CampoTexto, PageHeader, StatCard, StatGrid } from '@/components/ui';
import { formatearCLP } from '@/lib/format';
import { idLocal } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useAppState } from '@/store/appState';
import type { CuentaFlujoCaja, TipoCuentaFlujo } from '@/types/domain';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as const;

const doceMeses = (valor: number): number[] => Array<number>(12).fill(valor);

export function FlujoCaja() {
  const {
    precioVentaConsolidado,
    costoVariableConsolidado,
    ventasEstimadasMensuales,
    costoFijoTotal,
  } = useAppState();

  const [saldoInicial, setSaldoInicial] = useState(1_500_000);

  /**
   * Las tres cuentas base salen de la estructura de costos ya cargada; a partir
   * de ahí el usuario las edita mes a mes y agrega las suyas.
   */
  const [cuentas, setCuentas] = useState<CuentaFlujoCaja[]>(() => [
    {
      id: 'ing_ventas',
      tipo: 'ingreso',
      nombre: 'Ingresos por ventas',
      valores: doceMeses(Math.round(precioVentaConsolidado * ventasEstimadasMensuales)),
    },
    {
      id: 'egr_variables',
      tipo: 'egreso',
      nombre: 'Costos variables directos',
      valores: doceMeses(Math.round(costoVariableConsolidado * ventasEstimadasMensuales)),
    },
    {
      id: 'egr_fijos',
      tipo: 'egreso',
      nombre: 'Costos fijos operativos',
      valores: doceMeses(Math.round(costoFijoTotal)),
    },
  ]);

  const agregarCuenta = (tipo: TipoCuentaFlujo) =>
    setCuentas((prev) => [
      ...prev,
      {
        id: idLocal(tipo),
        tipo,
        nombre: tipo === 'ingreso' ? 'Nuevo ingreso' : 'Nuevo egreso',
        valores: doceMeses(0),
      },
    ]);

  const eliminarCuenta = (id: string) => setCuentas((prev) => prev.filter((c) => c.id !== id));

  const renombrar = (id: string, nombre: string) =>
    setCuentas((prev) => prev.map((c) => (c.id === id ? { ...c, nombre } : c)));

  const actualizarValor = (id: string, mes: number, valor: string) =>
    setCuentas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const valores = [...c.valores];
        valores[mes] = Number(valor) || 0;
        return { ...c, valores };
      }),
    );

  const matriz = useMemo(() => {
    const ingresos = cuentas.filter((c) => c.tipo === 'ingreso');
    const egresos = cuentas.filter((c) => c.tipo === 'egreso');

    const sumar = (lista: CuentaFlujoCaja[], mes: number) =>
      lista.reduce((acc, cuenta) => acc + Number(cuenta.valores[mes] || 0), 0);

    const totalIngresos = MESES.map((_, mes) => sumar(ingresos, mes));
    const totalEgresos = MESES.map((_, mes) => sumar(egresos, mes));
    const flujoNeto = totalIngresos.map((ing, mes) => ing - totalEgresos[mes]);

    // El saldo de cada mes arrastra el del anterior: así se ve dónde falta caja.
    const saldoAcumulado: number[] = [];
    flujoNeto.forEach((neto, mes) => {
      saldoAcumulado[mes] = (mes === 0 ? saldoInicial : saldoAcumulado[mes - 1]) + neto;
    });

    const mesEnRojo = saldoAcumulado.findIndex((saldo) => saldo < 0);

    return {
      ingresos,
      egresos,
      totalIngresos,
      totalEgresos,
      flujoNeto,
      saldoAcumulado,
      mesEnRojo,
      cierreAnual: saldoAcumulado[11],
      netoAnual: flujoNeto.reduce((a, b) => a + b, 0),
    };
  }, [cuentas, saldoInicial]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operación"
        titulo="Flujo de caja proyectado"
        descripcion="Proyección de tesorería mes a mes. El saldo acumulado arrastra el del mes anterior, así se ve en qué momento del año podría faltarte caja."
      />

      <StatGrid>
        <StatCard
          etiqueta="Saldo inicial"
          valor={formatearCLP(saldoInicial)}
          detalle="Caja disponible al partir el año"
        />
        <StatCard
          etiqueta="Flujo neto anual"
          valor={formatearCLP(matriz.netoAnual)}
          detalle="Ingresos menos egresos de los 12 meses"
          tonoValor={matriz.netoAnual >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          etiqueta="Saldo de cierre"
          valor={formatearCLP(matriz.cierreAnual)}
          detalle="Caja proyectada a diciembre"
          tonoValor={matriz.cierreAnual >= 0 ? 'accent' : 'negative'}
        />
        <StatCard
          etiqueta="Primer mes en rojo"
          valor={matriz.mesEnRojo === -1 ? 'Ninguno' : MESES[matriz.mesEnRojo]}
          textual
          detalle={
            matriz.mesEnRojo === -1
              ? 'La caja no queda negativa en todo el año'
              : 'Necesitas cubrir caja antes de este mes'
          }
          tonoValor={matriz.mesEnRojo === -1 ? 'positive' : 'negative'}
          indicador={
            matriz.mesEnRojo === -1
              ? { texto: 'Sin alertas', tono: 'positive' }
              : { texto: 'Atención', tono: 'negative' }
          }
        />
      </StatGrid>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <CampoTexto
          etiqueta="Saldo inicial de caja"
          type="number"
          numerico
          value={saldoInicial}
          onChange={(e) => setSaldoInicial(Number(e.target.value) || 0)}
          className="w-52"
        />

        <div className="flex flex-wrap gap-2">
          <Button variante="success" iconoIzquierda={<IconMas className="size-4" />} onClick={() => agregarCuenta('ingreso')}>
            Agregar ingreso
          </Button>
          <Button variante="danger" iconoIzquierda={<IconMas className="size-4" />} onClick={() => agregarCuenta('egreso')}>
            Agregar egreso
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[76rem] border-collapse text-[0.8125rem]">
            <thead>
              <tr className="surface-sunken">
                <th scope="col" className="label-eyebrow sticky left-0 z-20 min-w-[15rem] bg-[var(--surface-sunken)] px-4 py-3 text-left">
                  Cuenta
                </th>
                {MESES.map((mes) => (
                  <th key={mes} scope="col" className="label-eyebrow min-w-[6.5rem] px-2 py-3 text-right">
                    {mes}
                  </th>
                ))}
                <th scope="col" className="label-eyebrow w-16 px-3 py-3 text-center">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>

            <tbody>
              <FilaSeccion titulo="Ingresos operativos" tono="positive" />
              {matriz.ingresos.map((cuenta) => (
                <FilaCuenta
                  key={cuenta.id}
                  cuenta={cuenta}
                  onRenombrar={renombrar}
                  onActualizar={actualizarValor}
                  onEliminar={eliminarCuenta}
                />
              ))}
              <FilaTotal etiqueta="Total ingresos" valores={matriz.totalIngresos} tono="positive" />

              <FilaSeccion titulo="Egresos operativos" tono="negative" />
              {matriz.egresos.map((cuenta) => (
                <FilaCuenta
                  key={cuenta.id}
                  cuenta={cuenta}
                  onRenombrar={renombrar}
                  onActualizar={actualizarValor}
                  onEliminar={eliminarCuenta}
                />
              ))}
              <FilaTotal etiqueta="Total egresos" valores={matriz.totalEgresos} tono="negative" />

              <tr>
                <td colSpan={14} className="h-3" />
              </tr>

              <FilaTotal etiqueta="Flujo neto del mes" valores={matriz.flujoNeto} tono="segunSigno" resaltada />
              <FilaTotal etiqueta="Saldo acumulado" valores={matriz.saldoAcumulado} tono="segunSigno" resaltada destacada />
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function FilaSeccion({ titulo, tono }: { titulo: string; tono: 'positive' | 'negative' }) {
  return (
    <tr>
      <td
        colSpan={14}
        className={cn(
          'label-eyebrow border-y px-4 pt-5 pb-2',
          tono === 'positive' ? 'text-positive-700 dark:text-positive-500' : 'text-negative-700 dark:text-negative-500',
        )}
      >
        {titulo}
      </td>
    </tr>
  );
}

function FilaCuenta({
  cuenta,
  onRenombrar,
  onActualizar,
  onEliminar,
}: {
  cuenta: CuentaFlujoCaja;
  onRenombrar: (id: string, nombre: string) => void;
  onActualizar: (id: string, mes: number, valor: string) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <tr className="border-b transition-colors hover:bg-[var(--surface-sunken)]">
      <td className="surface-panel sticky left-0 z-10 px-4 py-1.5">
        <input
          type="text"
          value={cuenta.nombre}
          onChange={(e) => onRenombrar(cuenta.id, e.target.value)}
          aria-label="Nombre de la cuenta"
          className="text-strong w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-[0.8125rem] font-semibold transition-colors hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
        />
      </td>

      {cuenta.valores.map((valor, mes) => (
        <td key={mes} className="px-1 py-1.5">
          <input
            type="number"
            value={valor === 0 ? '' : valor}
            placeholder="0"
            onChange={(e) => onActualizar(cuenta.id, mes, e.target.value)}
            aria-label={`${cuenta.nombre}, ${MESES[mes]}`}
            className="text-default w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-right font-mono text-[0.75rem] tabular transition-colors placeholder:text-[var(--text-faint)] hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus:bg-[var(--surface-panel)] focus:outline-none"
          />
        </td>
      ))}

      <td className="px-3 py-1.5 text-center">
        <button
          type="button"
          onClick={() => onEliminar(cuenta.id)}
          aria-label={`Eliminar ${cuenta.nombre}`}
          className="text-faint hover:text-negative-600 dark:hover:text-negative-500 cursor-pointer rounded-md p-1.5 transition-colors"
        >
          <IconBasura className="size-4" />
        </button>
      </td>
    </tr>
  );
}

function FilaTotal({
  etiqueta,
  valores,
  tono,
  resaltada,
  destacada,
}: {
  etiqueta: string;
  valores: number[];
  tono: 'positive' | 'negative' | 'segunSigno';
  resaltada?: boolean;
  destacada?: boolean;
}) {
  const color = (valor: number) => {
    if (tono === 'positive') return 'text-positive-600 dark:text-positive-500';
    if (tono === 'negative') return 'text-negative-600 dark:text-negative-500';
    return valor >= 0 ? 'text-strong' : 'text-negative-600 dark:text-negative-500';
  };

  return (
    <tr className={cn('border-b', resaltada && 'surface-sunken', destacada && 'border-y-2 border-[var(--accent)]/25')}>
      <td
        className={cn(
          'sticky left-0 z-10 px-4 py-3 font-bold',
          resaltada ? 'bg-[var(--surface-sunken)]' : 'surface-panel',
          destacada ? 'text-strong text-[0.875rem]' : 'text-default text-[0.8125rem]',
        )}
      >
        {etiqueta}
      </td>
      {valores.map((valor, mes) => (
        <td key={mes} className={cn('px-3 py-3 text-right font-mono font-bold tabular', destacada ? 'text-[0.8125rem]' : 'text-[0.75rem]', color(valor))}>
          {formatearCLP(valor)}
        </td>
      ))}
      <td />
    </tr>
  );
}
