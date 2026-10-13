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

## 5. API en Render

El blueprint `render.yaml` ya tiene el servicio. Import asi:

1. Render → New → **Blueprint** → conecta el repo.
2. Render detecta `render.yaml`, crea `trato-api` y `trato-web`. Si no queres la web en Render, borra el bloque `trato-web` del archivo.
3. Configura las env vars (estan como `sync: false`):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `libsql://trato-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | token del paso 3 |
| `TURSO_SYNC_URL` | vacio (salvo replica embebida) |
| `TURSO_SYNC_INTERVAL` | `60000` |
| `JWT_SECRET` | genera una cadena fuerte |
| `MEILISEARCH_URL` | `https://<project>.meilisearch.io` |
| `MEILISEARCH_MASTER_KEY` | master key del cloud |
| `WEB_ORIGIN` | `https://<tu-web>.vercel.app` (CORS) |

4. Health check automatico: `GET /api/v1/health` debe devolver `database: ok`, `databaseMode: remote`, `searchEngine: meilisearch`.

Render asigna `PORT` (10000) y nuestro `main.ts` ya lo lee via `process.env.PORT`. No hay que definirlo.

## 6. Web en Vercel

```bash
# automatico: vercel.json dentro de apps/web define install/build para monorepo
```

1. Vercel → Add project → importa el repo.
2. **Root Directory: `apps/web`.** Vercel lee `apps/web/vercel.json` -> install y build corren con `cd ../..` correctamente.
3. Variables (`Settings → Environment Variables`):

| Variable | Valor | Nota |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://trato-api.onrender.com/api/v1` | se fija en build; cambiarla requiere redeploy |

4. Queda CORS cubierto si `WEB_ORIGIN` en la API coincide con el dominio de Vercel.

> Alternativa Render para la web: el bloque `trato-web` de `render.yaml` ya la sirve con SSR (`next start`). Preferi Vercel para Next por el edge network y la integracion con `App Router`.

## 7. Verificacion de la puesta

```powershell
# 1. infra
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
