import { useState, type FormEvent } from 'react';
import { IconBasura } from '@/components/icons';
import {
  Button,
  CampoSelect,
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
import { formatearCLP, idLocal } from '@/lib/format';
import { useAppState } from '@/store/appState';
import type { UnidadMedida } from '@/types/domain';

const UNIDADES: { valor: UnidadMedida; etiqueta: string }[] = [
  { valor: 'kg', etiqueta: 'Kilo (kg)' },
  { valor: 'g', etiqueta: 'Gramo (g)' },
  { valor: 'l', etiqueta: 'Litro (l)' },
  { valor: 'ml', etiqueta: 'Mililitro (ml)' },
  { valor: 'un', etiqueta: 'Unidad (un)' },
];

const INICIAL = { nombre: '', proveedor: '', unidad: 'kg' as UnidadMedida, costoPorUnidad: '' };

export function PanelInsumos() {
  const { insumos, agregarInsumo, eliminarInsumo } = useAppState();
  const [formulario, setFormulario] = useState(INICIAL);

  const guardar = (evento: FormEvent) => {
    evento.preventDefault();
    const costo = Number(formulario.costoPorUnidad);
    if (!formulario.nombre.trim() || !costo) return;

    agregarInsumo({
      id: idLocal('ins'),
      nombre: formulario.nombre.trim(),
      proveedor: formulario.proveedor.trim(),
      unidad: formulario.unidad,
      costoPorUnidad: costo,
    });

    setFormulario(INICIAL);
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
      <Card className="h-fit">
        <CardHeader
          eyebrow="Materias primas"
          titulo="Registrar un insumo"
          descripcion="El costo que anotes aquí es el que usarán todas tus recetas."
        />

        <form onSubmit={guardar} className="mt-5 space-y-4">
          <CampoTexto
            etiqueta="Insumo"
            placeholder="Ej. Queso mozzarella"
            value={formulario.nombre}
            onChange={(e) => setFormulario((p) => ({ ...p, nombre: e.target.value }))}
            required
          />
          <CampoTexto
            etiqueta="Proveedor"
            placeholder="Ej. Lácteos del Sur"
            value={formulario.proveedor}
            onChange={(e) => setFormulario((p) => ({ ...p, proveedor: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSelect
              etiqueta="Unidad"
              value={formulario.unidad}
              onChange={(e) => setFormulario((p) => ({ ...p, unidad: e.target.value as UnidadMedida }))}
            >
              {UNIDADES.map((u) => (
                <option key={u.valor} value={u.valor}>
                  {u.etiqueta}
                </option>
              ))}
            </CampoSelect>
            <CampoTexto
              etiqueta="Costo por unidad"
              type="number"
              numerico
              min={0}
              step="any"
              placeholder="1200"
              value={formulario.costoPorUnidad}
              onChange={(e) => setFormulario((p) => ({ ...p, costoPorUnidad: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" variante="primary" className="w-full">
            Agregar insumo
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          eyebrow={`${insumos.length} ${insumos.length === 1 ? 'insumo' : 'insumos'}`}
          titulo="Tu despensa"
          descripcion="Arrastra desde aquí para armar recetas en el paso siguiente."
        />

        <div className="mt-4">
          {insumos.length === 0 ? (
            <EmptyState
              titulo="Todavía no hay insumos"
              descripcion="Registra el primero en el formulario de la izquierda para poder armar recetas."
            />
          ) : (
            <Tabla anchoMinimo="30rem">
              <TablaCabecera>
                <Th>Insumo</Th>
                <Th>Proveedor</Th>
                <Th numerico>Costo unitario</Th>
                <Th className="w-12 text-center">
                  <span className="sr-only">Acciones</span>
                </Th>
              </TablaCabecera>
              <TablaCuerpo>
                {insumos.map((insumo) => (
                  <Tr key={insumo.id}>
                    <Td enfasis>{insumo.nombre}</Td>
                    <Td className="text-muted">{insumo.proveedor || '—'}</Td>
                    <Td numerico>
                      <span className="text-accent font-bold">{formatearCLP(insumo.costoPorUnidad)}</span>
                      <span className="text-faint ml-1 text-[0.6875rem]">/{insumo.unidad}</span>
                    </Td>
                    <Td className="text-center">
                      <button
                        type="button"
                        onClick={() => eliminarInsumo(insumo.id)}
                        aria-label={`Eliminar ${insumo.nombre}`}
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
