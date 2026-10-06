import { useCallback, useEffect, useState } from 'react';

export type Tema = 'claro' | 'oscuro';

const CLAVE = 'integra-pyme:tema';

function temaInicial(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'claro' || guardado === 'oscuro') return guardado;
  } catch {
    // Ventana privada o almacenamiento bloqueado: seguimos con el del sistema.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro');
    try {
      localStorage.setItem(CLAVE, tema);
    } catch {
      // La preferencia se pierde al recargar; no es motivo para romper la app.
    }
  }, [tema]);

  const alternar = useCallback(() => {
    setTema((actual) => (actual === 'claro' ? 'oscuro' : 'claro'));
  }, []);

  return { tema, alternar };
}
