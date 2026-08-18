# Home V2 Cutover — Phase 4C.6

**Status:** COMPLETE — **`4C_HOME_CUTOVER_COMPLETE`**  
**Date:** 2026-08-16  
**Commit:** `b8d192b` — `feat(content): cut over home to v2 by default`

---

## A. Default anterior

`HOME_CONTENT_SOURCE` unset → **legacy** (4C.4–4C.5)

## B. Default nuevo

`HOME_CONTENT_SOURCE` unset → **v2**

| Valor env | Resultado |
|-----------|-----------|
| (unset) | **v2** |
| `v2` | v2 |
| `legacy` | legacy (rollback) |
| inválido / `""` | legacy (fallback seguro) |

## C. Rollback mechanism

Set `HOME_CONTENT_SOURCE=legacy` → rama `legacy-full` intacta.

No se eliminó:

- named_list_items / loaders legacy
- `src/lib/content.ts`
- DTOs / brands / graphic / ui_projects / ui_list_items

## D. Tests flag

`scripts/test-home-flag-4c4.ts`:

- unset → v2  
- v2 → v2  
- legacy → legacy  
- invalid → legacy  

Pass: 10/10

## E. Default no-env smoke (in-process)

`scripts/inspect-home-cutover-4c6.ts` **sin** `HOME_CONTENT_SOURCE`:

| Check | Result |
|-------|--------|
| resolved | v2 |
| loaders | `legacy-shell,v2-home` |
| no `legacy-full` | yes |
| ok | **true** |

## F. ES / EN (production-like) — clean HTTP smoke

### Incidente previo (no regresión)

Primer intento HTTP con **múltiples** `next` simultáneos (:3000/:3005/:3010/:3012) → `/es`/`/en` **500** por `ER_CON_COUNT_ERROR`. Causa: saturación del entorno local, no del cutover.

### Clean smoke (post-cleanup)

Cerrados solo procesos Next de este Portfolio:

| Puerto | PID | Proceso |
|--------|-----|---------|
| 3000 | 27448 | `next` start-server (dev) |
| 3005 | 13680 | `next start --port 3005` |
| 3010 | 18668 | `next start --port 3010` |
| 3012 | 30624 | `next start --port 3012` |

Puertos confirmados **FREE**. Sin KILL MySQL / sin tocar Docker.

**UNA** instancia: `next start --port 3010`, **sin** `HOME_CONTENT_SOURCE`:

| Check | Result |
|-------|--------|
| source / loaders | **v2** · `legacy-shell,v2-home` |
| `/es` cold | **200** |
| `/es` warm | **200** |
| `/en` cold | **200** |
| `/en` warm | **200** |

## G. Home counts (default V2)

| Surface | Count |
|---------|-------|
| Entities | **6** |
| Featured Projects | **12** |
| Current (UI) | **0** |
| Testimonials | **4** |

Presentes: Taily, Concitar, Repuestos Carlitos, Templeton.  
Marquee 100 px/s · hrefs marquee deshabilitados · current section ausente.

## H. Privacy (default V2)

| Check | Result |
|-------|--------|
| forbidden alias hits | **0** |
| Syllabi / MicroTime / PROXI / confidential logistics | no en Home V2 |

## I. Rollback legacy smoke

In-process + **clean HTTP** (`HOME_CONTENT_SOURCE=legacy`, una sola instancia :3010):

| Check | Result |
|-------|--------|
| source | **legacy** |
| loaders | **legacy-full** |
| `/es` | **200** |
| `/en` | **200** |

## J. Páginas / superficies todavía legacy

| Área | Fuente |
|------|--------|
| **Home** | **V2 DEFAULT** |
| Gráfico | legacy |
| Interfaces | legacy |
| `/marcas` | legacy |
| Admin | legacy |
| bio / settings shell | legacy tables |

## K. Pendientes posteriores (no 4C.6)

- 4D / cleanup legacy (NO ahora)
- Admin UX/QOL
- Entity / Project pages
- Backlog estético Home (spacing Testimonials, box Empresas+Featured, jerarquía)

---

## Criterio de éxito

- [x] sin env → Home V2  
- [x] explicit legacy → Home legacy  
- [x] no double-read  
- [x] production-like default V2 HTTP = **200** ES/EN (cold+warm) tras clean smoke  
- [x] rollback legacy HTTP = **200** ES/EN · `legacy-full`  
- [x] Home V2 = 6 / 12 / 4  
- [x] privacy OK  
- [x] DB / Admin / Gráfico / Interfaces intactos  
- [x] legacy NO eliminado  

**Clasificación final:** `4C_HOME_CUTOVER_COMPLETE`
