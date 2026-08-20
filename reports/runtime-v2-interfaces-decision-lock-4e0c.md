# Interfaces decision lock — Phase 4E.0C

**Status:** READ-ONLY COMPLETE  
**Date:** 2026-08-20  
**Reemplaza:** el plan de 4E.1 basado en resources/backfill  
**Complementa:** `runtime-v2-interfaces-audit-4e0.md`, `runtime-v2-interfaces-decision-matrix-4e0b.md`

---

## Decisiones humanas registradas

1. **Pertenencia a Interfaces es explícita**, no derivada de resources/cover.
2. Los 8 contenidos listados **no se muestran en Interfaces** por ahora; **no** se despublican globalmente.
3. **No** backfill de Cloronor ni SIMAAS para listing-only.
4. Admin futuro: toggle “mostrar en Interfaces”. Resources = warning UX, no estado.
5. Landings = **categoría visual normal**, no bloque “Más proyectos”.
6. Alineación izquierda = `VISUAL_ISSUE / LAYOUT_ALIGNMENT` (sin fix ahora).
7. Unicode sospechoso = audit, sin reemplazos.
8. FAQ por capa = backlog.
9. Quitar footer “Exploración” = backlog.
10. Admin backlog = fase posterior.

---

## 1. IDs V2 exactos a ocultar de Interfaces

Resolución por nombre humano → fuente legacy → Project V2 (si existe).

| Pedido humano | Legacy | V2 Project ID | ¿Existe Project? | Notas |
|---------------|--------|---------------|------------------|-------|
| Landing PUSH | `ui_list_items.id = push-landing` | **ninguno** | no | Entity `push`. **No** usar `push-visual-identity` (branding Graphic). |
| Landing Órbita | `ui_list_items.id = orbita-landing` | **ninguno** | no | Entity `orbita-l-b`. |
| Landing Lúdica | `ui_list_items.id = ludica-landing` | **ninguno** | no | Entity `ludica`. |
| Repuestos Carlitos | `ui_list_items.id = carlitos` | **`repuestos-carlitos`** | sí | `published=true`, `showOnHome=true`. |
| Marketplace / SIMAAS | `ui_list_items.id = simaas` | **`simaas-marketplace`** | sí | `published=true`. |
| B2B / equivalente canónico | `ui_list_items.id = b2b` **y** `ui_projects.id = proxi` | **`proxi`** | sí | V2 ya `published=false`. List item `b2b` no tiene Project propio. |
| Templeton Mathews | `ui_list_items.id = templeton` | **`templeton-digital-transformation-assessment`** | sí | `published=true`, `showOnHome=true`. |
| Cloronor Trading | `ui_list_items.id = cloronor-trading` | **`cloronor-trading`** | sí | `published=true`, `showOnHome=true`. |

**Projects V2 a excluir de la superficie Interfaces (sin tocar `published`):**

```
repuestos-carlitos
simaas-marketplace
proxi
templeton-digital-transformation-assessment
cloronor-trading
```

**Sin Project que ocultar:** las tres landings (solo list items + Entities). En V2 no hay fila que “sacar”; simplemente **no crear** Projects de landing ni reutilizar branding Graphic.

---

## 2. ¿Existe ya un equivalente a `showOnInterfaces`?

**No.**

Señales actuales en `projects`:

| Campo | Para qué sirve hoy | ¿Sirve como membresía Interfaces? |
|-------|--------------------|-----------------------------------|
| `published` | visibilidad global pública | No — el usuario quiere published sin listar en Interfaces |
| `status` | ongoing / completed / archived | No |
| `project_areas.area = 'ux-ui'` | dominio (Graphic vs Interfaces) | **No** — es taxonomía de trabajo, no superficie UI |
| `show_on_home` | marquee Home | Patrón correcto, **otro** surface |
| `featured` | highlight genérico; Home usa `showOnHome` | No sobrecargar |
| `case_study_enabled` | case study | No usado como listing |
| `cover` / `project_resources` | visual | **Revocado** como criterio de inclusión |

Runtime: `getPublicProjectsV2({ area: 'ux-ui' })` devolvería todo ux-ui published. Eso **no** es el contrato de Interfaces.

---

## 3. Propuesta mínima de modelo (NO implementar)

Paridad con Home:

```sql
-- conceptual only
ALTER TABLE projects
  ADD COLUMN show_on_interfaces TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN interfaces_order INT NULL,
  ADD INDEX idx_projects_interfaces (show_on_interfaces, interfaces_order);
```

TypeORM: `showOnInterfaces` / `interfacesOrder` junto a `showOnHome` / `homeOrder`.

**Regla de lectura futura:**

```
Interfaces listing =
  published=true
  AND status ≠ archived
  AND showOnInterfaces=true
  AND privacy structural (client visible / no confidential-*)
```

Resources: warning en Admin, nunca auto-set del flag.

Default `0` = nadie entra hasta decisión explícita (alineado a “no elegir por resources”).

No blacklist permanente de IDs. Los 5 Projects de arriba quedarían `showOnInterfaces=false` (o default) **aunque** `published=true` / `showOnHome=true`.

---

## 4. Landings / “Más proyectos” — implementación actual

**No hay categoría `landings`.** No hay `project.type = landing`.

Detección: `InterfacesLayer` calcula `orphanedListItems`:

- fuente: `content.uiList` (`ui_list_items`)
- excluye si `item.id` coincide con un `ui_projects.id`
- excluye si `caption` coincide con un project id
- el resto se renderiza al final

Heading: `dict.interfaces.orphanListHeading` = **“Más proyectos”** / “More projects”.

Layout distinto al resto:

| Categoría normal (`ui_projects`) | Orphan list (`ui_list_items`) |
|----------------------------------|-------------------------------|
| `CATEGORY_META` + icon + SortButtons | h2 suelto, sin sort, sin icono de categoría |
| `ProjectCarousel` + slides | logo SVG / PNG / wordmark / placeholder |
| click → `UiProjectDetailModal` | **sin** detail, **sin** prototype CTA |
| `article` con título + meta | card bordeada, visual “marca”, título abajo |
| ancla `#ui-{category}` + nav jumps | **no** entra al nav de categorías |
| rutas `/interfaces/{category}` | **no** hay `/interfaces/landings` |

Por eso se perciben como bloque especial, no como sección par.

---

## 5. Estrategia para Landings como categoría normal (sin implementar)

Cambio mínimo de **presentación** (legacy, si se tocara UI antes de V2):

- Tratar el orphan list como una sexta entrada de `CATEGORY_META` (mismo `section` / grid / cards / jump nav).
- Reusar el mismo `article` + frame `aspect-[644/362]` (ya existe en orphans).
- Quitar el heading “Más proyectos” o reemplazarlo por label de categoría.
- **No** inventar taxonomía V2 todavía.

Identificadores V2 **posibles** (solo inventario, no decisión):

- `projects.type = 'landing'` (no existe hoy)
- `context` no discrimina landings
- las 3 landings **no tienen Project** — haría falta crear Projects **solo si** se quiere listarlas; hoy la decisión es **no mostrarlas**

Hasta que existan Projects + `showOnInterfaces`, Landings como categoría V2 está vacía — correcto según esta decisión.

---

## 6. Alineación izquierda — `VISUAL_ISSUE / LAYOUT_ALIGNMENT`

**No se modifica.**

Wrappers:

| Capa | Clases | Efecto |
|------|--------|--------|
| `<main>` | `flex w-full flex-col items-center` | centra el bloque |
| Columna | `max-w-6xl … flex-col items-start` | **contenido pegado a la izquierda** del 6xl |
| Hero | `items-center` en mobile, `sm:flex-row sm:items-center`; textos **sin** `text-center` | título/subtítulo a la izquierda del row |
| Nav categorías | `flex w-full flex-wrap` | izq |
| h2 sección | `justify-between` | título izq, sort der |
| Cards | `article max-w-3xl` dentro de columna full | **hueco derecho grande** — sensación de “todo a la izquierda” |
| CMS CTA | `max-w-xl` | izq |

Home usa `max-w-6xl … items-center` en el inner. Interfaces usa `items-start`.

**Se puede centrar sin tocar el grid de cards:** hero (icono+título+subtítulo) y nav de jumps (`w-full` + `justify-center` / `text-center`).

**No centrar a ciegas:** la columna entera (`items-center`) desplazaría también las cards `max-w-3xl`. Si se centra el inner, las cards deberían quedar `self-start` o `w-full` para no “flotar” al centro.

Esperar captura humana antes de cualquier CSS.

---

## 7. Unicode / tildes

### Fixture canónico (`content/interfaces/list.json`) — UTF-8 correcto

| id | String almacenado en JSON | Codepoints no-ASCII |
|----|---------------------------|---------------------|
| orbita-landing | `Landing - Órbita LΔB` | Ó `U+00D3`, Δ `U+0394` (delta griega, **no** A latina) |
| ludica-landing | `Landing - Lúdica Tech` | ú `U+00FA` |
| templeton | `… Autodiagnóstico Transformación …` | ó `U+00F3` ×2 |

Loader `t()` = passthrough `value[locale] ?? value.es`. Mapper no recodifica. HTML Next (UTF-8 por defecto). TypeORM `charset: utf8mb4`. Tablas schema `utf8mb4_unicode_ci`.

### Dónde puede verse “corrupto”

1. **`LΔB` vs `LAB`:** no es mojibake; es letra griega Delta. Si el usuario espera “Órbita LAB”, se ve “raro” sin estar roto.
2. **Mojibake clásico (`Ã“rbita`):** UTF-8 leído como Latin-1. Si aparece **en el browser**, hay que HEX-dump LIVE `ui_list_items.title` (no reconfirmado en esta sesión: el inspector DB quedó colgado).
3. **Falsos positivos en reportes 4E.0B:** `reports/_interfaces-decision-matrix-4e0b-live.json` pasó por PowerShell `Out-File` y muestra `├ôrbita` — corrupción del **archivo de reporte**, no prueba de DB.

**LIVE confirmado (query 4E.0C):**

| Fuente | Órbita / Lúdica / Autodiagnóstico |
|--------|-----------------------------------|
| `content/interfaces/list.json` | UTF-8 correcto (Ó `U+00D3`, ú `U+00FA`, Δ `U+0394`) |
| `ui_list_items.title` LIVE | **ya reemplazado por `??`** (`3F3F` en HEX) — p.ej. `Landing - ??rbita L??B` |
| `ui_projects.title` LIVE | UTF-8 **intacto** (p.ej. `gestión` = `C3B3`) |

La corrupción está **en la fila LIVE de `ui_list_items`**, no en el JSON de repo ni en React. El loader `t()` renderiza lo almacenado: el HTML mostrará `??`.

Causa probable: insert/sync con charset de conexión distinto de `utf8mb4` (los bytes no ASCII se sustituyeron por `?`). No es traducción.

**No reemplazar todavía.** Repair sería re-sync desde `list.json` o UPDATE JSON — requiere fase de write explícita.

---

## 8. Impacto sobre los 15 public-safe de 4E.0B

De los 15, **4** coinciden con “no mostrar ahora”:

| id | Acción Interfaces |
|----|-------------------|
| `repuestos-carlitos` | fuera |
| `simaas-marketplace` | fuera |
| `templeton-digital-transformation-assessment` | fuera |
| `cloronor-trading` | fuera |

`proxi` **no estaba** en los 15 (unpublished). Landings **no estaban** (sin Project).

**11 restantes (candidatos, no auto-list):**

`apsmm`, `casiba`, `clearwater`, `mikrobiol`, `adapto-pay`, `omnigroup`, `mental-training-tech-24-5`, `savil`, `concitar`, `taily`, `cms-portfolio`

Con el nuevo principio, **ninguno entra hasta `showOnInterfaces=true`**. Los 11 no son el listing final.

Confidential published (aml, inventariado, asesor) siguen fuera por privacy, independiente de resources.

---

## 9. Nuevo target de Interfaces

**No** hay target numérico derivado de resources.

Contrato:

```
superficie Interfaces = Projects con membresía explícita
  (futuro showOnInterfaces)
  + published + privacy
```

Hoy, **target operativo = 0** hasta marcar membresía.

Home **no cambia:** Carlitos / Templeton / Cloronor pueden seguir en marquee.

Graphic **no cambia.**

---

## 10. Backlog registrado (sin implementar)

| Ítem | Dónde | Acción futura |
|------|-------|----------------|
| FAQ por capa | `FaqSection` + `dict.faq` único en `SiteChrome` | Home FAQ / Graphic FAQ / Interfaces FAQ |
| Footer “Exploración” | `SiteChrome` · `dict.footer.explore` | quitar columna |
| Admin toggle | no existe | `showOnInterfaces` + warnings por resources |
| Layout alignment | `InterfacesLayer` `items-start` | tras captura humana |
| Landings como categoría | orphan list | mismo grid que Preventas, etc. |

---

## 11. Recomendación del siguiente paso

**No iniciar el 4E.1 antiguo** (adapter + backfill resources).

Siguiente fase sugerida: **`4E.0D` — membership lock** (sigue READ-ONLY o schema-only si se aprueba):

1. Confirmar naming `showOnInterfaces` / `show_on_interfaces`.
2. Confirmar default `false`.
3. Decidir **cuáles de los 11** candidatos reciben `true` en el primer cutover (lista humana, no automática).
4. Recién entonces: adapter + flag runtime (`4E.1` nuevo), **sin** crear resources para forzar inclusión.

---

**DETENIDO. No 4E.1. No writes. No schema aplicado. No flag.**
