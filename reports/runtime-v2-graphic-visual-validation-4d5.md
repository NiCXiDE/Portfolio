# 4D.5 — Graphic V2 visual + functional validation

Fecha: 2026-08-19  
Branch: `refactor/content-model-v2`  
HEAD al momento de la revisión: `76fbb7c` (4D.4 `cd93dfc` ancestro)  
Entorno: `next start` · puerto **3020** · DB `portfolio` LIVE  
Flags: `GRAPHIC_CONTENT_SOURCE=v2` · `HOME_CONTENT_SOURCE` unset → Home V2

Clasificación de este documento: **observación**. Sin fixes automáticos. Sin cutover. Sin 4D.6.

## Entorno

| | |
|---|---|
| Graphic loader | `v2-graphic` |
| Home loader | `legacy-shell,v2-home` |
| HTTP `/es` `/en` `/es/grafico` `/en/grafico` `/es/grafico/manuals` `/en/grafico/manuals` | 200 |
| Runtime errors | no |
| DB | entities 33 · projects 31 · pieces 52 / 49 published · migration_map 130 |

## Revisión humana (Nico)

Resultado general: **TODO OK salvo Seyier.**

| Área | Resultado |
|---|---|
| ES/EN | OK |
| Main Graphic | OK |
| Secciones V2 (visual-identity, illustration-artwork, campaigns-communication, print) | OK |
| Bass Series | OK |
| Personal (sin sección) | OK |
| Manual CITF + PDF | OK |
| Details (muestra) | OK (resto) |
| Routing / filtros existentes | OK |
| Privacy | OK |
| Console/runtime | sin errores reportados |

## Hallazgo

**Seyier en `/es/grafico/logos`** aparece 4 veces (`seyier`, `seyier-inicio`, `seyier-portada`, `seyier-overlay`).

Clasificación:

- `UX_ISSUE`
- `CONTENT_MODEL_ADJUSTMENT`

No es contenido perdido ni duplicado accidental de archivos. Es el split 4D.3C (1 gallery → 4 Pieces) **revocado** por revisión visual.

Hallazgo Seyier (`UX_ISSUE` + `CONTENT_MODEL_ADJUSTMENT`): **resuelto en 4D.5B** — ver `reports/runtime-v2-seyier-resource-fix-4d5b.md`.

Siguiente paso: revalidación visual opcional bajo V2 flag; **no** cutover default ni 4D.6.
