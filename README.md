# Integra Pyme

Sistema de control de márgenes para pymes chilenas. Responde tres preguntas
concretas sin planillas ni tecnicismos:

1. **¿Cuánto tengo que vender para no perder plata?** — punto de equilibrio.
2. **¿Cuánto me queda libre por cada venta?** — margen de contribución.
3. **¿Qué tan cerca del límite estoy?** — colchón de seguridad y estrés.

Funciona para tres rubros, cada uno con su propia forma de costear: restaurante
(recetas), minimarket o ferretería (inventario con capas LIFO) y servicios
(horas-hombre por proyecto).

## Stack

| Capa           | Herramienta                                   |
| -------------- | --------------------------------------------- |
| Build          | Vite 8                                        |
| UI             | React 19 + TypeScript (modo estricto)         |
| Estilos        | Tailwind CSS 4 (configuración en CSS)         |
| Base de datos  | Supabase (Postgres + RLS)                     |
| Runtime        | Node.js ≥ 20.19                               |

## Cómo correrlo

```bash
npm install
npm run dev
```

| Comando             | Qué hace                                   |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo en `localhost:5173` |
| `npm run build`     | Chequeo de tipos y build de producción     |
| `npm run preview`   | Sirve el build para revisarlo              |
| `npm run typecheck` | Solo chequeo de tipos                      |

## Modo demo y modo Supabase

La app arranca **sin credenciales**: carga datos de ejemplo del rubro que elijas
para que veas todo funcionando de inmediato. La barra superior indica en cuál de
los dos modos estás.

Para conectar la base de datos:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ejecuta `supabase/schema.sql` completo en el SQL Editor. Crea las tablas, los
   índices, el trigger de perfiles, las políticas RLS y la función
   `despachar_lifo`. Es idempotente: puedes volver a correrlo sin romper nada.
3. En **Authentication → URL Configuration**, deja:
   - *Site URL*: `http://localhost:5173` (y la URL de producción cuando la
     tengas).
   - *Redirect URLs*: las mismas. Sin esto, los enlaces de confirmación y de
     recuperación de contraseña no vuelven a la app.
4. Copia `.env.example` a `.env` y completa las dos variables. Ambas salen de
   **Project Settings → API Keys**:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...   # o el JWT que empieza con eyJ...
```

La clave pública se llama **Publishable key** (`sb_publishable_…`) en los
proyectos nuevos y **anon / public** (un JWT largo) en los anteriores, donde vive
en la pestaña *Legacy API keys*. Cualquiera de las dos sirve.

Es pública por diseño: la seguridad la dan las políticas RLS, que acotan cada
consulta a los negocios del usuario en sesión.

> **Nunca** pongas la `service_role` ni una `sb_secret_…` en `.env`. Todo lo que
> lleva el prefijo `VITE_` termina dentro del bundle del navegador, y esas claves
> se saltan RLS: publicar una deja la base abierta a cualquiera que mire el
> código fuente de la página. `src/lib/supabase/client.ts` detecta ese caso, se
> niega a conectar y muestra un aviso en pantalla.

### Autenticación

Con Supabase configurado, la app abre en la pantalla de login. Incluye:

| Pantalla              | Qué hace                                                     |
| --------------------- | ------------------------------------------------------------ |
| Iniciar sesión        | Correo y contraseña                                          |
| Crear cuenta          | Nombre, correo y contraseña con medidor de robustez          |
| Recuperar contraseña  | Envía el enlace y no revela si el correo existe              |
| Contraseña nueva      | Se abre sola al volver desde el enlace del correo            |

El nombre que se escribe al registrarse viaja en `raw_user_meta_data` y el
trigger `crear_perfil_al_registrarse` lo copia a `public.perfiles`.

Por defecto Supabase exige confirmar el correo antes de entrar. Para saltarte ese
paso durante el desarrollo, desactiva *Confirm email* en **Authentication →
Sign In / Providers → Email**.

Desde el login también se puede entrar en **modo demo** sin cuenta: usa los datos
de ejemplo y no guarda nada. Es el modo en que corre la app cuando `.env` está
vacío.

### Qué está conectado y qué falta

La capa de persistencia está completa y tipada: cliente, tipos del esquema,
mappers y un repositorio por entidad con altas, bajas y consultas. Lo que
**todavía no** ocurre es que las vistas la llamen: el estado sigue viviendo en
memoria (`src/store/appState.tsx`), así que los cambios se pierden al recargar.

Para activarla falta decidir dos cosas que dependen del proyecto real:
autenticación (todas las políticas RLS cuelgan de `auth.uid()`) y qué negocio
está activo. Con eso resuelto, se reemplazan los mutadores del store por las
llamadas de `src/lib/supabase/repositories` sin tocar los componentes.

Para regenerar los tipos si cambias el esquema:

```bash
npx supabase gen types typescript --project-id <ref> --schema public > src/lib/supabase/database.types.ts
```

## Estructura

```
src/
├── app/            Navegación y preferencia de tema
├── components/
│   ├── ui/         Primitivas del sistema de diseño (Card, Button, Tabla…)
│   ├── layout/     AppShell, barra lateral y superior
│   ├── charts/     Curva de punto de equilibrio (SVG propio)
│   └── brand/      Logo e isotipo
├── data/           Datos de ejemplo por rubro
├── lib/
│   ├── calculations.ts  Motor de cálculo (equilibrio, riesgo, LIFO)
│   ├── format.ts        Formato CLP, porcentajes y fechas
│   └── supabase/        Cliente, tipos, mappers y repositorios
├── modules/        Estructura de costos por rubro
├── store/          Estado de la aplicación y de la sesión
├── styles/         Tokens de diseño y tema claro/oscuro
├── types/          Tipos de dominio
└── views/          Pantallas principales
    └── auth/       Login, registro y recuperación de contraseña
```

## Cómo está pensado el código

- **El dominio manda.** `src/types/domain.ts` es la fuente de verdad. Supabase
  guarda `snake_case` y `src/lib/supabase/mappers.ts` traduce; el resto de la app
  solo ve tipos de dominio en `camelCase`.
- **La persistencia está aislada.** Ningún componente usa el cliente de Supabase
  directamente: todo pasa por `src/lib/supabase/repositories`. Cada repositorio
  devuelve `ResultadoRepo`, que distingue "sin credenciales" de "la consulta
  falló".
- **El cálculo vive en un solo lugar.** `src/lib/calculations.ts` no importa
  React ni Supabase, así que se puede probar suelto. El despacho LIFO además
  existe como función transaccional en Postgres, que es la versión autoritativa
  cuando hay concurrencia.
- **El diseño se define con tokens.** Los colores, tipografías y superficies
  salen de `src/styles/index.css`. El tema oscuro solo redefine variables; los
  componentes no saben en qué tema están.

## Tipografía

- **Bricolage Grotesque** — titulares
- **Plus Jakarta Sans** — interfaz y texto corrido
- **JetBrains Mono** — cifras, SKU y datos tabulares

Se sirven localmente vía `@fontsource`, sin depender de un CDN externo.
# proyecto-uach-emprendimiento
