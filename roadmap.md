# Roadmap — Trato MarketPlace

Plan de trabajo priorizado para llevar Trato de demo a producto. Cada item nace de un análisis del código real de este repo (no de una checklist genérica): seguridad, latencia, calidad de código e infraestructura. El estado vigente está en [README.md](./README.md) y el procedimiento de deploy en [DEPLOY.md](./DEPLOY.md).

---

## Estado actual (línea de base)

- **Stack:** Next.js 15.5 + React 19 (web), NestJS 11 (API), Drizzle 0.45 sobre libSQL/Turso, buscador in-process con FTS5, 24 primitivas UI con PageContainer/Section semánticos.
- **Verificado:** build limpio de los 3 workspaces, seed determinista (370 productos), búsqueda con typos/sinónimos/acentos vía FTS5, checkout con batch atómico y stock atómico, ISR por fetch (home 60 s, búsqueda 30 s, ficha 60 s) probado con la API caída.
- **Auditoría de secretos (2026-10-15):** ningún `.env` trackeado ni en HEAD ni en el historial completo (`git log --all -p`); los únicos valores `TURSO_AUTH_TOKEN` en el historial son placeholders de README/DEPLOY.md. Los tokens reales viven solo en `.env`/`apps/api/.env` (gitignored). Detalle completo abajo en [Auditoría de secretos](#auditoría-de-secretos).

---

## Auditoría de secretos

| Verificación | Resultado |
|---|---|
| Archivos `*.env` trackeados en HEAD | Solo `.env.example` (placeholders) |
| `git log --all -p` buscando el token real de Turso | 10 apariciones, **todas placeholders** (`...`, `<token>`) |
| `turso.io` en el historial | Solo URLs de ejemplo (`libsql://<db>-<org>.turso.io`) |
| `JWT_SECRET` con valor real en el historial | Ninguno |
| Tokens reales en el working tree | `.env` y `apps/api/.env` (gitignored, verificado con `git check-ignore`) |
| Credenciales demo (`Demo1234`) en el seed | Esperado y documentado |

**Conclusión: no se subieron keys ni datos sensibles a GitHub.** Las únicas credenciales "expuestas" son la demo (`demo@trato.com` / `Demo1234`, intencional) y el fallback de dev `trato-dev-secret-cambiar-en-produccion` (ver ítem S1).

> Si en el futuro el token de Turso se filtra, se rota con `turso db tokens create trato` (los tokens viejos se invalidan desde el dashboard) — no hace falta reescribir historial si actuás rápido.

---

## Fase 0 — Seguridad (prioridad alta, ~2-3 días)

| # | Item | Problema real (evidencia) | Solución | Esfuerzo |
|---|---|---|---|---|
| S1 | **Fail-fast del `JWT_SECRET`** | `config.ts` tiene fallback `trato-dev-secret-cambiar-en-produccion`: si Vercel se despliega sin la env var, la API arranca firmando tokens con un secreto público | En `src/config.ts`, si `NODE_ENV=production` y `JWT_SECRET` es el default o falta, `throw` al boot. Idem `TURSO_AUTH_TOKEN` en modo remoto | XS |
| S2 | **Rate limiting** | `POST /auth/register`, `/auth/login`, `/orders/checkout` y `/search` son públicos sin límite: un script puede crear usuarios infinitos o forzar logins | `@nestjs/throttler` con límites por ruta (login/register: 5/min; search: 60/min) | S |
| S3 | **Helmet + headers de seguridad** | La API no setea `X-Content-Type-Options`, `Strict-Transport-Security`, etc. | `helmet()` en `main.ts` (1 línea + config) | XS |
| S4 | **Token en localStorage → cookies `httpOnly`** | Hoy el JWT vive en `localStorage` (Zustand persist): un XSS lo roba sin remedio. Migrar a cookie `httpOnly; Secure; SameSite=Lax` seteada por `POST /auth/login`, con endpoint `/auth/me` que lea la cookie, y CSRF double-token | M (toca guard, stores del front y login/register) |
| S5 | **Rate limit / captcha en registro** | El registro público permite granjas de cuentas de vendedor que ensucian el catálogo | Throttler estricto + verificación de email (ver S7) | S |
| S6 | **Sanitizar `description` y atributos** | La descripción se renderiza como texto (`{product.description}`) — seguro hoy, pero el día que se use `dangerouslySetInnerHTML` o un renderer MD, XSS garantizado. Blindar ahora: strip de HTML en el DTO (`class-transformer` transform) | XS |
| S7 | **Verificación de email + recuperación de contraseña** | Hoy `POST /auth/register` crea cuentas activas sin email verificado y no existe reset: cualquiera puede "ser" cualquier email | Tokens de un solo uso (tabla `password_reset_tokens`), envío por Resend/SES | M |
| S8 | **Secrets en Vercel/Render con `@vercel/env`-style + rotación documentada** | Ya verificado que no hay secretos en Git; formalizar el runbook de rotación (Turso tokens, JWT) en DEPLOY.md | XS |

---

## Fase 1 — Latencia y escala (prioridad alta, ~1 semana)

| # | Item | Problema real (evidencia) | Solución | Esfuerzo |
|---|---|---|---|---|
| L1 | **Select recortado para listados** | `productSelection()` trae `description` (~400-900 B) y `attributes` en las ~370 filas de cada `/search` y cada rail de `/home` — decenas de KB de egress por request contra Turso remoto | Segunda proyección `productCardSelection` sin `description`/`attributes`; `toProductSummary` ya no las necesita. El detalle (`findByParam`) sigue trayendo todo | S |
| L2 | **TTL cache in-process** | `CategoriesService.tree()/allRows()` corre 1 query por búsqueda y por cada render de la home; `HomeService.payload()` corre 8; `suggest()` corre 1-2 por keystroke (con debounce de 250 ms) | `TtlCache` propio (Map + expiry, 60 s para categorías, 30 s para home y suggest). En Vercel solo abarca la instancia warm, pero corta la mayoría de los hits | S |
| L3 | **Keyset pagination** | `searchLocally` usa `slice()` sobre 600 candidatos (ok) pero `/products/mine`, `orders` y el listado general usan `orderBy + limit` sin cursor: al crecer, `OFFSET 10000` recorre y descarta | Cursor `(created_at, id)` en las rutas paginadas públicas | M |
| L4 | **Endpoint agregado de la ficha** | `/productos/[slug]` hace 6 fetches SSR (producto, reviews, questions, related, seller, categoría) — 6 round trips de función→función en Vercel por visita | `GET /products/:slug/page` que devuelve `{ product, reviews, questions, related, sellerProducts, category }` en un solo call; la página pasa a 1 fetch | M |
| L5 | **Desnormalizar vendedor en `products`** | `productSelection` hace join con `users` solo para `sellerName/sellerStatus/location` en las cards | Columnas `seller_name`, `seller_location` en `products` (actualizadas al cambiar el perfil); elimina el join de listados | S |
| L6 | **`sync()` selectivo en modo réplica** | Hoy `checkout` llama `db.sync()` que sincroniza TODA la réplica; con miles de escrituras esto compite | `sync()` con `syncInterval` y solo en rutas de lectura sensible (detalle/checkout) | XS |
| L7 | **Compresión de respuestas API** | Las respuestas JSON de `/search` (2-5 KB) viajan sin `Compression` en Vercel/Render | Habilitar brotli/gzip en la plataforma (Vercel lo hace por defecto; en Render, `compression` middleware) | XS |

---

## Fase 2 — Calidad de código y tests (prioridad media, ~1-2 semanas)

| # | Item | Problema real (evidencia) | Solución |
|---|---|---|---|
| C1 | **Tests del buscador** | `scoreProduct` tiene la lógica de negocio más delicada del proyecto (tolerancia, sinónimos, penalización) y no tiene ni un test: un refactor la rompe sin aviso | Vitest con casos fijados: `samsumg`→Samsung, `camara`→Canon, `televisor`→TV, sin match→scan, sinónimos→menos peso |
| C2 | **E2E de API con Supertest** | Los flujos críticos (checkout con stock, registro+login, Q&A con permisos) se probaron a mano una vez | Suite e2e contra la API con DB en memoria (`file::memory:`), corriendo en CI |
| C3 | **CI (GitHub Actions)** | No existe: los builds y tests dependen de la máquina local | Workflow: install → build 3 workspaces → tests → `drizzle-kit migrate` a Turso en deploy |
| C4 | **`strict: true` en la API** | `apps/api/tsconfig.json` tiene `strict: false` (default Nest): nullables implícitos en servicios | Migración gradual: `strictNullChecks` primero por módulo |
| C5 | **ESLint + Prettier en el monorepo** | No hay linter configurado (se decidió saltarlo durante el build); riesgo de drift de estilo | Config compartida en la raíz + `lint-staged` |
| C6 | **Extraer la lógica del scorer a un módulo puro** | `scoreProduct` vive dentro del service inyectado con DB: difícil de testear aislado | `src/modules/search/scorer.ts` puro (sin DI), testeado 100% |
| C7 | **Dead code** | `installmentFor` exporta cuotas duras; `buildFtsMatch` exporta sin uso externo; verificar exports sin uso con `ts-prune` | Limpieza puntual |

---

## Fase 3 — Infraestructura y observabilidad (prioridad media)

| # | Item | Solución |
|---|---|---|
| I1 | **Dockerfiles multi-stage** para `apps/api` (node:20-bookworm-slim, output standalone en web) | Deploy portable a Render/Fly sin render.yaml |
| I2 | **Observabilidad**: Sentry (front + API) y logs estructurados (pino reemplazando el Logger default) | Errores de producción hoy van solo al dashboard de Vercel |
| I3 | **Turso: segunda réplica embebida por región** cuando haya usuarios fuera de AR | Lecturas locales por zona |
| I4 | **Backups**: Turso hace snapshots automáticos; agregar verificación de restore en CI | |

---

## Fase 4 — Producto (prioridad según negocio)

| # | Item | Detalle |
|---|---|---|
| P1 | MercadoPago real (webhooks, estados de pago, preferencias) | Reemplaza el checkout simulado |
| P2 | Mensajería comprador-vendedor (tabla `messages` + WebSocket) | Hoy solo Q&A público |
| P3 | Subida real de imágenes (S3/R2 con validación de tipo/tamaño, generación de variantes) | Reemplaza los SVG del seed |
| P4 | Fichas con variaciones (talle/color como SKUs separados) | El checkout ya soporta stock por producto |
| P5 | Búsqueda semántica (embeddings + índice vectorial de Turso) sobre la descripción | Complementa FTS5, no lo reemplaza |

---

## Riesgos y decisiones técnicas vigentes (para no re-discutirlos)

| Decisión | Estado |
|---|---|
| Búsqueda in-process (sin motor externo) | Elegido por costo $0; FTS5 implementado. Revisar si el catálogo pasa decenas de miles |
| Réplica embebida | Solo en hosts con disco persistente; en Vercel/Render free usar `libsql://` remoto |
| Token en `localStorage` | Conocido; migrar a cookie httpOnly (S4) cuando haya sesión de larga duración |
| Escritor único en Turso | Los picos de checkout serializan; monitorear p95 antes de sharding |

---

## Criterio de priorización

1. **Primero lo que protege** (Fase 0): el deploy es público desde hoy.
2. **Después lo que acelera** (Fase 1): cada item es medible contra `tookMs` de `/search` y el Data Cache de Vercel.
3. **Después lo que sostiene** (Fase 2-3): tests y CI antes de que el refactor sea caro.
4. **Producto al final** (Fase 4): recién cuando la base técnica aguante tráfico real.

> Regla general de esta roadmap: **cada item nace de un hallazgo del propio repo** (audit de secretos, logs de Vercel, contadores de views, build outputs), no de una checklist genérica.
