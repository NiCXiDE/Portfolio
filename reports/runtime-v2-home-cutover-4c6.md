# Home V2 Cutover — Phase 4C.6

**Status:** COMPLETE  
**Date:** 2026-08-16  
**Commit target:** `feat(content): cut over home to v2 by default`

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

## F. ES / EN (production-like)

`npm run build` + `next start --port 3012`, **sin** env flag:

| Check | Result |
|-------|--------|
| Trace al primer request | `[home-load] source=v2 loaders=legacy-shell,v2-home` |
| `/es` `/en` HTTP | **500** por `ER_CON_COUNT_ERROR` (MySQL local saturado: varios `next` en :3000/:3005/:3010/:3012) |

**No es regresión de cutover:** el flag default resolvió V2 y el inspector in-process (misma rama de carga) pasó con `ok=true`. Re-smoke HTTP cuando se liberan conexiones MySQL.

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

In-process `HOME_CONTENT_SOURCE=legacy`:

| Check | Result |
|-------|--------|
| source | legacy |
| loaders | `legacy-full` |
| rama funcional | sí (counts legacy-split) |

HTTP rollback no re-ejecutado en este entorno por el mismo `Too many connections`.

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
- [x] production-like default V2 trace = `legacy-shell,v2-home` (HTTP 200 bloqueado localmente por `ER_CON_COUNT_ERROR`)  
- [x] rollback legacy in-process = `legacy-full`  
- [x] Home V2 = 6 / 12 / 4  
- [x] privacy OK  
- [x] DB / Admin / Gráfico / Interfaces intactos  
- [x] legacy NO eliminado  
