# Despliegue en produccion

Guia completa para llevar Trato a las nubes de Vercel (frontend) y Render (API), con Turso como base de datos distribuida y Meilisearch gestionado. Ninguna pieza queda vinculada en local: todo se configura con variables de entorno.

## 1. Arquitectura del despliegue

| Componente | Plataforma | Configuracion |
|---|---|---|
| Frontend (Next.js 15) | **Vercel** | `apps/web/vercel.json` ya define install/build en modo monorepo. Root Directory: `apps/web`. |
| API (NestJS 11) | **Render** (Node web service) | `render.yaml` incluido: servicio `trato-api` (y `trato-web` opcional). |
| Base de datos | **Turso** (libSQL gestionado) | No es un contenedor: es el punto alto de la decision arquitectonica. |
| Buscador | **Meilisearch Cloud** | Recomendado. El plan free de Render no persiste disco para el contenedor. |

## 2. Nada local va a Git

| No se commite is | Por que | Estado |
|---|---|---|
| `apps/api/.env`, `apps/web/.env.local`, `.env` | secretos (JWT, tokens Turso, claves Meilisearch) | ya en `.gitignore` |
| `apps/api/db/` | base SQLite/libSQL local | ya en `.gitignore` |
| `tools/*.exe`, `tools/meili-data/` | binario y datos del buscador local | ya en `.gitignore` |
| `node_modules/`, `dist/`, `.next/`, `coverage/` | artefactos de build | ya en `.gitignore` |
| `package-lock.json`, `drizzle/*.sql`, `src/`, `packages/shared/` | suficientes para compilar y migrar desde cero | s Incluidos |

> Regla: si se te escapo un `.env` en algun commit, hace `git filter-repo` / `git rm --cached` y rota las claves inmediatamente.

## 3. Base de datos — Turso

```bash
# una vez (CLI de Turso)
turso auth login
turso db create trato
turso db show trato --url             # → libsql://trato-<org>.turso.io
turso db tokens create trato          # → token largo

# aplica el DDL (esquema migrado con Drizzle)
turso db shell trato < apps/api/drizzle/0000_ambiguous_lizard.sql
```

Carga inicial (puede correrse desde tu maquina; el `.env` local apunta a la nube):

```bash
# en apps/api/.env: DATABASE_URL=libsql://...turso.io  TURSO_AUTH_TOKEN=...  MEILISEARCH_URL=... (cloud)
npm run seed            # 370 productos indexados directamente en Meilisearch Cloud
```

> Sobre latencia: el plan gratis de Render no tiene disco persistente → el modo de **replica embebida no funciona ahi** (la copia local muere al apagarse). En Render free usá `DATABASE_URL=libsql://...turso.io` directa. La replica embebida (`TURSO_SYNC_URL`) brilla en un host con disco: VPS, Render con disk/Seattle, Fly.io con volumenes, Railway con volumenes — ahi lectura local ~0,1 ms.

## 4. Buscador — Meilisearch Cloud

1. Crea proyecto en Meilisearch Cloud (plan free).
2. Copia `https://<project>.meilisearch.io` y la master key.
3. Cuando la base tenga datos: `npm run search:reindex` (desde local, con `.env` apuntando a la nube) — saca los 370 documentos y configura settings, sinonimos y ranking.

La y sobre falta el motor, la API detecta la caida y el frontend sigue mostrando resultados en modo local (menos relevante y sin facetas del indice, pero leal).

## 5. Vercel multi-service (recomendado)

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
| api | `MEILISEARCH_URL` / `MEILISEARCH_MASTER_KEY` | Meilisearch Cloud |
| api | `WEB_ORIGIN` | `https://<tu-dominio>.vercel.app` |
| web | `API_SERVICE_URL` | **la inyecta el binding, no la definas vos** |
| web | `NEXT_PUBLIC_API_URL` | **no la definas en este modo** (deshabilita el rewrite relativo) |

3. Cómo viajan las llamadas:
   - **Browser**: fetch relativo a `/api/v1/...` → mismo dominio → rewrite → servicio `api`. Sin CORS.
   - **SSR** (Server Components): el binding inyecta la URL interna del servicio en `process.env.API_SERVICE_URL`; `apps/web/src/lib/api.ts` la usa de base (y le agrega `/api/v1`). El binding resuelve en functions, no en build ni en middleware —nuestro SSR es dinámico (`cache:no-store`), así que siempre está disponible.
   - **Local**: `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1` sigue igual.
   - **Port binding dentro de Vercel**: Nest leé `process.env.PORT` (Vercel la inyecta); el `entrypoint` es `dist/main.js`.

4. Test local del deploy sin publicar: `vercel dev` levanta ambos servicios con bindings inyectados.

> La API queda pública solo bajo `/api/` (incluye `/api/docs`). Un servicio interno recibe tráfico solo por rewrite.

## 6. Alternativa: API en Render + Web en Vercel (split)

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
| `MEILISEARCH_URL` / `MEILISEARCH_MASTER_KEY` | Meilisearch Cloud |
| `WEB_ORIGIN` | `https://<tu-web>.vercel.app` (CORS cross-origin) |
| `NEXT_PUBLIC_API_URL` (web en Vercel) | `https://trato-api.onrender.com/api/v1` — se cocina en build |

4. Health check: `GET https://trato-api.onrender.com/api/v1/health` debe devolver `database: ok`, `databaseMode: remote`, `searchEngine: meilisearch`.

Render asigna `PORT` y `main.ts` lo lee via `process.env.PORT`.

## 7. Verificacion de la puesta

```powershell
# 1. infra (multi-service: mismo dominio que la web ▼ | split: dominio de Render ▼)
Invoke-RestMethod https://<tu-dominio>.vercel.app/api/v1/health
Invoke-RestMethod https://trato-api.onrender.com/api/v1/health
# → database: ok · databaseMode: remote · engine: meilisearch

# 2. buscador con fallos
Invoke-RestMethod "https://trato-api.onrender.com/api/v1/search?q=samsumg&perPage=2"
# → engine: meilisearch, resultados en ~ms

# 3. flujo
#   https://<tu-web>.vercel.app             → home SSR
#   /ingresar login demo@trato.com Demo1234
#   /mis-compras                            → ordenes de la base en la nube (no local)
```

## 8. Notas operativas

| Tema | Detalle |
|---|---|
| `NEXT_PUBLIC_*` se cocina en el build | Cambiar requiere redeploy; por eso esta en Settings, no hardcodeado. |
| Primera request en Render free | cold start ~50 segundos; es plan free, no bug. |
| Migraciones SQL versionadas | `npm run db:generate` genera `apps/api/drizzle/xxxx_*.sql`; el push se aplica con `turso db shell <db> < archivo.sql` o `drizzle-kit migrate`. |
| Sin README.md en Vercel/Render | las builds no necesitan el readme. El meta URL relativo de GitHub funciona. |
| Rotar secretos | JWT_SECRET y tokens de Turso se rotan en dashboards, sin tocar el repo. |

Para revertir o probar otra nube: el stack es portable; el punto unico es la base (`libsql://`) y el buscador (`https://`), ambos puntos externos y sin lock-in propietario.
