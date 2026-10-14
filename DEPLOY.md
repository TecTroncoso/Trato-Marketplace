# Despliegue en produccion

Guia completa para llevar Trato a producción con Vercel (frontend + API en un solo proyecto) y Turso como base de datos distribuida. Todo el stack entra en planes gratuitos. La búsqueda corre in-process dentro de la API: no hay ningún servicio de búsqueda que desplegar ni mantener.

## 1. Arquitectura del despliegue

| Componente | Plataforma | Configuracion |
|---|---|---|
| Frontend (Next.js 15) | **Vercel** | Root Directory en la raíz; `vercel.json` define los servicios y rewrites. |
| API (NestJS 11) | **Vercel** (mismo proyecto, público bajo `/api/`) o **Render** | `vercel.json` (multi-service) o `render.yaml` (split). |
| Base de datos | **Turso** (libSQL gestionado) | `libsql://<db>-<org>.turso.io` + token. |
| Buscador | **No aplica** | In-process: vive dentro de la API y lee de la misma base. Cero sync, cero costo. |

## 2. Nada local va a Git

| No se commitea | Por que | Estado |
|---|---|---|
| `apps/api/.env`, `apps/web/.env.local`, `.env` | secretos (JWT, tokens Turso) | ya en `.gitignore` |
| `apps/api/db/` | base SQLite/libSQL local | ya en `.gitignore` |
| `node_modules/`, `dist/`, `.next/`, `coverage/` | artefactos de build | ya en `.gitignore` |
| `package-lock.json`, `drizzle/*.sql`, `src/`, `packages/shared/` | suficientes para compilar y migrar desde cero | ✔ incluidos |

> Regla: si se te escapo un `.env` en algun commit, hace `git filter-repo` / `git rm --cached` y rota las claves inmediatamente.

## 3. Base de datos — Turso

```bash
# una vez (CLI de Turso)
turso auth login
turso db create trato
turso db show trato --url             # → libsql://trato-<org>.turso.io
turso db tokens create trato          # → token largo

# aplica el DDL (esquema migrado con Drizzle) — opción A: desde el repo
npm run db:push                       # con DATABASE_URL apuntando a Turso
npm run seed                          # 370 productos, usuarios, ordenes

# opción B: aplicar el SQL versionado a mano
turso db shell trato < apps/api/drizzle/0000_ambiguous_lizard.sql
```

Puede correrse desde tu máquina; el `.env` local apunta a la nube solo durante el push/seed:

```bash
# en apps/api/.env (temporal): DATABASE_URL=libsql://...turso.io  TURSO_AUTH_TOKEN=...
npm run db:push
npm run seed
npm run db:fts        # crea el índice FTS5 y sus triggers en Turso
npm run db:info        # verifica: mode remote + tablas + conteos
```

> Sobre latencia: el plan gratis de Render no tiene disco persistente → el modo de **replica embebida no funciona ahi** (la copia local muere al apagarse). En Vercel/Render free usá `DATABASE_URL=libsql://...turso.io` directa. La replica embebida (`TURSO_SYNC_URL`) brilla en un host con disco: VPS, Render con disk, Fly.io con volumenes — ahi la lectura es local (~0,1 ms) y las escrituras van al primario.

## 4. Vercel multi-service (recomendado)

Los dos servicios conviven en **un solo proyecto** de Vercel con **un solo dominio**: la web en `/` y la API bajo `/api/(.*)`. Desaparece CORS y no hace falta publicar la API aparte. El archivo `vercel.json` de la raiz ya viene listo:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "api": {
      "root": "apps/api",
      "framework": "nestjs",
      "buildCommand": "npm run build",
      "entrypoint": "src/main.ts"
    },
    "web": {
      "root": "apps/web",
      "framework": "nextjs",
      "buildCommand": "npm run build",
      "bindings": [
        { "type": "service", "service": "api", "format": "url", "env": "API_SERVICE_URL" }
      ]
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": { "service": "api" } },
    { "source": "/(.*)", "destination": { "service": "web" } }
  ]
}
```

1. Vercel → Add project → importa el repo (Root Directory: **raíz** — no `apps/web`).
2. **Framework: Services.** En el paso "New Project", el dropdown *Application Preset* debe decir `Services` (no `Next.js` — por eso avisa "Possible configuration mismatch"). Si ya creaste el proyecto, cambialo en Settings → Build and Deployment → Framework Preset → **Services** y redesplegá.
3. Env vars (Settings → Environment Variables):

| Servicio | Variable | Nota |
|---|---|---|
| api | `DATABASE_URL` | `libsql://trato-<org>.turso.io` |
| api | `TURSO_AUTH_TOKEN` | token de Turso |
| api | `TURSO_SYNC_URL` | vacío (sin disco persistente) |
| api | `JWT_SECRET` / `JWT_EXPIRES_IN` | cadena fuerte / `7d` |
| api | `WEB_ORIGIN` | `https://<tu-dominio>.vercel.app` |
| web | `API_SERVICE_URL` | **la inyecta el binding, no la definas vos** |
| web | `NEXT_PUBLIC_API_URL` | **no la definas en este modo** (deshabilita el rewrite relativo) |

4. Cómo viajan las llamadas:
   - **Browser**: fetch relativo a `/api/v1/...` → mismo dominio → rewrite → servicio `api`. Sin CORS.
   - **SSR** (Server Components): el binding inyecta la URL interna del servicio en `process.env.API_SERVICE_URL`; `apps/web/src/lib/api.ts` la usa de base (y le agrega `/api/v1`). El binding resuelve en functions, no en build ni en middleware —nuestro SSR es dinámico (`cache:no-store`), así que siempre está disponible.
   - **Local**: `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1` sigue igual.
   - **Port binding dentro de Vercel**: Nest lee `process.env.PORT` (Vercel la inyecta); el `entrypoint` es `src/main.ts`.

5. Test local del deploy sin publicar: `vercel dev` levanta ambos servicios con bindings inyectados.

> La API queda pública solo bajo `/api/` (incluye `/api/docs`). Un servicio interno recibe tráfico solo por rewrite.

## 5. Alternativa: API en Render + Web en Vercel (split)

Si preferís Render para la API o tu plan no habilita services:

El blueprint `render.yaml` ya tiene los servicios (`trato-api` y `trato-web`, este último opcional si la web queda en Vercel):

1. Render → New → **Blueprint** → conecta el repo.
2. Render lee `render.yaml` y crea ambos servicios.
3. Env vars (estan como `sync: false` en el blueprint):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `libsql://trato-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | token de Turso |
| `TURSO_SYNC_URL` | vacio |
| `TURSO_SYNC_INTERVAL` | `60000` |
| `JWT_SECRET` | cadena fuerte |
| `WEB_ORIGIN` | `https://<tu-web>.vercel.app` (CORS cross-origin) |
| `NEXT_PUBLIC_API_URL` (web en Vercel) | `https://trato-api.onrender.com/api/v1` — se cocina en build |

- Health check: `GET https://trato-api.onrender.com/api/v1/health` debe devolver `database: ok`, `databaseMode: remote`, `schema: ok`, `searchFts: true`.

Render asigna `PORT` y `main.ts` lo lee via `process.env.PORT`.

## 6. Verificacion de la puesta

```powershell
# 1. infra (multi-service: mismo dominio que la web | split: dominio de Render)
Invoke-RestMethod https://<tu-dominio>.vercel.app/api/v1/health
# → status: ok · database: ok · schema: ok · databaseMode: remote · databaseUrlSource: env

# 2. buscador (in-process, tolerante a typos)
Invoke-RestMethod "https://<tu-dominio>.vercel.app/api/v1/search?q=samsumg&perPage=2"
# → total 21, resultados Samsung en ~ms

# 3. flujo
#   https://<tu-dominio>.vercel.app            → home SSR
#   /ingresar login demo@trato.com Demo1234
#   /mis-compras                               → ordenes de la base en la nube (no local)
```

## 7. Notas operativas

| Tema | Detalle |
|---|---|
| `/health` con `schema: "missing"` | La base de datos responde pero está vacía: aplicá el esquema y los datos (`npm run db:push` y `npm run seed`) con la **misma** `DATABASE_URL` que usa el deploy. Es el error `no such table: categories`. |
| `/health` con `databaseUrlSource: "default"` | Falta `DATABASE_URL` en las env vars: la API cayó al archivo local, que en serverless no persiste. |
| `NEXT_PUBLIC_*` se cocina en el build | Cambiar requiere redeploy; por eso esta en Settings, no hardcodeado. |
| Primera request en Render free | cold start ~50 segundos; es plan free, no bug. |
| Migraciones SQL versionadas | `npm run db:generate` genera `apps/api/drizzle/xxxx_*.sql`; el push se aplica con `turso db shell <db> < archivo.sql` o `drizzle-kit migrate`. |
| Escalado del buscador | Cuando el catálogo crezca a decenas de miles, habilitar **FTS5** en Turso (misma base, índice invertido) antes de considerar un motor externo — así se mantiene todo gratis. |
| Rotar secretos | JWT_SECRET y tokens de Turso se rotan en dashboards, sin tocar el repo. |

Para revertir o probar otra nube: el stack es portable; el punto unico es la base (`libsql://`) y nada mas — el buscador viaja dentro de la API.
