import { Suspense, lazy } from 'react';
import { Logo } from '@/components/brand/Logo';
import { AvisoConfiguracion } from '@/components/layout/AvisoConfiguracion';
import { AuthProvider, useAuth } from '@/store/authState';
import { Autenticacion } from '@/views/auth/Autenticacion';

// Quien está en el login no necesita el panel ni los módulos por rubro: se
// descargan recién cuando hay sesión (o cuando se entra en modo demo).
const Aplicacion = lazy(() => import('./Aplicacion'));

/** Decide qué mostrar según el estado de la sesión. */
function Raiz() {
  const { estado } = useAuth();

  if (estado === 'cargando') return <Cargando />;
  if (estado === 'sin_sesion' || estado === 'recuperacion') return <Autenticacion />;

  return (
    <Suspense fallback={<Cargando />}>
      <Aplicacion />
    </Suspense>
  );
}

/** Pantalla breve mientras se comprueba la sesión o se descarga la app. */
function Cargando() {
  return (
    <div className="surface-app flex min-h-screen flex-col items-center justify-center gap-5">
      <Logo />
      <div className="surface-sunken h-1 w-40 overflow-hidden rounded-full border">
        <div className="h-full w-1/3 animate-[deslizar_1.1s_ease-in-out_infinite] rounded-full bg-[var(--accent)]" />
      </div>
      <style>{`@keyframes deslizar { 0% { transform: translateX(-100%) } 100% { transform: translateX(320%) } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AvisoConfiguracion />
      <Raiz />
    </AuthProvider>
  );
}
