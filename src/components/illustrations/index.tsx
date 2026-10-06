import type { SVGProps } from 'react';

/**
 * Ilustraciones de perfil.
 *
 * Geométricas y en dos tintas (el acento del tema más neutros), en vez de
 * dibujos multicolor: acompañan la decisión sin competir con los datos, y
 * funcionan igual en tema claro y oscuro.
 */

type Props = SVGProps<SVGSVGElement>;

function Lienzo({ children, ...props }: Props & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

const NEUTRO = 'var(--border-strong)';
const SUAVE = 'var(--surface-sunken)';

/** Restaurante: platos servidos sobre un pase de cocina. */
export function IlustracionRestaurante(props: Props) {
  return (
    <Lienzo {...props}>
      <rect x="18" y="96" width="164" height="8" rx="4" fill={NEUTRO} />

      <ellipse cx="70" cy="96" rx="42" ry="9" fill={SUAVE} />
      <path d="M28 96a42 22 0 0 1 84 0Z" fill="var(--accent)" fillOpacity="0.14" />
      <path d="M34 96a36 18 0 0 1 72 0" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="82" r="11" fill="var(--accent)" fillOpacity="0.85" />
      <circle cx="55" cy="88" r="6" fill="var(--accent)" fillOpacity="0.45" />
      <circle cx="86" cy="88" r="7" fill="var(--accent)" fillOpacity="0.6" />

      {/* Campana de servicio */}
      <path d="M126 96a26 26 0 0 1 52 0Z" fill={SUAVE} stroke={NEUTRO} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="152" cy="66" r="4" fill="var(--accent)" />
      <path d="M120 96h64" stroke={NEUTRO} strokeWidth="3" strokeLinecap="round" />

      {/* Vapor: la operación en marcha */}
      <path d="M64 60c0-6 8-6 8-12M78 54c0-5 6-5 6-10" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.55" />
    </Lienzo>
  );
}

/** Minimarket / ferretería: estantería con rotación de stock. */
export function IlustracionMinimarket(props: Props) {
  return (
    <Lienzo {...props}>
      <rect x="30" y="24" width="140" height="82" rx="8" fill={SUAVE} stroke={NEUTRO} strokeWidth="2.5" />
      <path d="M30 52h140M30 79h140" stroke={NEUTRO} strokeWidth="2.5" />

      {/* Balda superior */}
      <rect x="42" y="32" width="16" height="18" rx="3" fill="var(--accent)" fillOpacity="0.85" />
      <rect x="64" y="36" width="12" height="14" rx="3" fill="var(--accent)" fillOpacity="0.4" />
      <rect x="82" y="30" width="18" height="20" rx="3" fill="var(--accent)" fillOpacity="0.6" />
      <rect x="108" y="36" width="14" height="14" rx="3" fill={NEUTRO} />

      {/* Balda intermedia */}
      <rect x="42" y="60" width="20" height="17" rx="3" fill="var(--accent)" fillOpacity="0.5" />
      <rect x="68" y="63" width="14" height="14" rx="3" fill={NEUTRO} />
      <rect x="90" y="58" width="16" height="19" rx="3" fill="var(--accent)" fillOpacity="0.75" />

      {/* Hueco de quiebre de stock, señalado en el mismo lenguaje de la app */}
      <rect x="130" y="60" width="26" height="17" rx="3" stroke="var(--color-warning-500)" strokeWidth="2" strokeDasharray="4 3" />

      <rect x="42" y="86" width="24" height="14" rx="3" fill={NEUTRO} />
      <rect x="74" y="86" width="30" height="14" rx="3" fill="var(--accent)" fillOpacity="0.35" />
      <rect x="112" y="86" width="20" height="14" rx="3" fill={NEUTRO} />

      <path d="M24 110h152" stroke={NEUTRO} strokeWidth="3" strokeLinecap="round" />
    </Lienzo>
  );
}

/** Servicios: horas del equipo asignadas a proyectos. */
export function IlustracionServicios(props: Props) {
  return (
    <Lienzo {...props}>
      <rect x="26" y="22" width="148" height="86" rx="10" fill={SUAVE} stroke={NEUTRO} strokeWidth="2.5" />
      <path d="M26 42h148" stroke={NEUTRO} strokeWidth="2.5" />
      <circle cx="40" cy="32" r="3" fill={NEUTRO} />
      <circle cx="51" cy="32" r="3" fill={NEUTRO} />

      {/* Barras de asignación: cada una, un proyecto en curso */}
      <rect x="40" y="56" width="62" height="9" rx="4.5" fill="var(--accent)" fillOpacity="0.85" />
      <rect x="40" y="72" width="94" height="9" rx="4.5" fill="var(--accent)" fillOpacity="0.5" />
      <rect x="40" y="88" width="44" height="9" rx="4.5" fill={NEUTRO} />

      <circle cx="146" cy="76" r="18" fill="var(--surface-panel)" stroke="var(--accent)" strokeWidth="2.5" />
      <path d="M146 66v10l7 4" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Lienzo>
  );
}
