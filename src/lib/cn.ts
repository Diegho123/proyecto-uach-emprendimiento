/**
 * Une clases condicionalmente. Suficiente para este proyecto: las variantes de
 * Tailwind se resuelven en los propios componentes, no hay conflictos que
 * requieran un merge de clases completo.
 */
export type ClassValue = string | number | null | undefined | false | ClassValue[];

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];

  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }

  return out.join(' ');
}
