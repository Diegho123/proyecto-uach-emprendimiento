import type { SVGProps } from 'react';

/**
 * Íconos de línea, 24×24, trazo 1.75. Se dibujan a mano en vez de traer una
 * librería completa: son pocos y así el bundle no carga cientos sin usar.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-[1.125rem] shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconPanel = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="7.5" height="8.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="5" rx="1.5" />
    <rect x="13.5" y="11" width="7.5" height="10" rx="1.5" />
    <rect x="3" y="14.5" width="7.5" height="6.5" rx="1.5" />
  </Base>
);

export const IconFlujoCaja = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
    <circle cx="12" cy="12" r="2.75" />
    <path d="M6 9.5v5M18 9.5v5" />
  </Base>
);

export const IconInventario = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
    <path d="M3 7.5 12 12l9-4.5M12 12v9" />
  </Base>
);

export const IconMermas = (p: IconProps) => (
  <Base {...p}>
    <path d="M10.3 3.9 2.5 17.3a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9.5v4M12 17.2h.01" />
  </Base>
);

export const IconMargenes = (p: IconProps) => (
  <Base {...p}>
    <path d="M18.5 5.5 5.5 18.5" />
    <circle cx="7.75" cy="7.75" r="2.75" />
    <circle cx="16.25" cy="16.25" r="2.75" />
  </Base>
);

export const IconEscenarios = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3v16.5a1.5 1.5 0 0 0 1.5 1.5H21" />
    <path d="M7 15.5l3.5-4.5 3 2.5L20 7" />
    <path d="M16.5 7H20v3.5" />
  </Base>
);

export const IconMercado = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </Base>
);

export const IconConector = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.5 14.5 5.9 18.1a3.7 3.7 0 0 1-5.2-5.2" transform="translate(3 -1)" />
    <path d="m14.5 9.5 3.6-3.6a3.7 3.7 0 0 1 5.2 5.2" transform="translate(-3 1)" />
    <path d="m9.5 14.5 5-5" />
  </Base>
);

export const IconCostos = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 5.5h16M4 12h16M4 18.5h10" />
    <circle cx="9" cy="5.5" r="1.75" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="12" r="1.75" fill="currentColor" stroke="none" />
  </Base>
);

export const IconSol = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </Base>
);

export const IconLuna = (p: IconProps) => (
  <Base {...p}>
    <path d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a6.8 6.8 0 0 0 10.8 10.8Z" />
  </Base>
);

export const IconCambiar = (p: IconProps) => (
  <Base {...p}>
    <path d="M20.5 11.5a8.5 8.5 0 0 0-15-4.7" />
    <path d="M3.5 12.5a8.5 8.5 0 0 0 15 4.7" />
    <path d="M5.5 3v4h4M18.5 21v-4h-4" />
  </Base>
);

export const IconMenu = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
  </Base>
);

export const IconCerrar = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);

export const IconMas = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const IconBasura = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 6.5h17M9 6.5V4.75A1.25 1.25 0 0 1 10.25 3.5h3.5A1.25 1.25 0 0 1 15 4.75V6.5" />
    <path d="M6 6.5 6.9 19a1.5 1.5 0 0 0 1.5 1.4h7.2a1.5 1.5 0 0 0 1.5-1.4L18 6.5" />
  </Base>
);

export const IconSubir = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5" />
    <path d="M4 16v2.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V16" />
  </Base>
);

export const IconBaseDatos = (p: IconProps) => (
  <Base {...p}>
    <ellipse cx="12" cy="6" rx="8" ry="3.2" />
    <path d="M4 6v12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V6" />
    <path d="M4 12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2" />
  </Base>
);

export const IconOjo = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const IconOjoTachado = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.9 5.7A9.9 9.9 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.3 4.1M6.2 7.9A17 17 0 0 0 2 12s3.6 6.5 10 6.5a9.7 9.7 0 0 0 4-.85" />
    <path d="m10 10a2.8 2.8 0 0 0 4 4M3.5 3.5l17 17" />
  </Base>
);

export const IconCorreo = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="m3.5 7 7.6 5.3a1.6 1.6 0 0 0 1.8 0L20.5 7" />
  </Base>
);

export const IconCandado = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" />
    <path d="M7.75 10.5V7.25a4.25 4.25 0 0 1 8.5 0v3.25" />
  </Base>
);

export const IconUsuario = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Base>
);

export const IconFlechaIzquierda = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Base>
);

export const IconSalir = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.5 21H6a2.5 2.5 0 0 1-2.5-2.5v-13A2.5 2.5 0 0 1 6 3h3.5" />
    <path d="M16 16.5 20.5 12 16 7.5M20 12H9.5" />
  </Base>
);
