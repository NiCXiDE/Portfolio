# Content Model V2 — Freeze audit (Fase 3C.1)

Estado: **auditoría / propuesta**. Sin ALTER/INSERT/UPDATE/--apply.  
Generado tras cierre Fase 3B.

---

## A. Schema actual relevante (resumen)

Tablas V2 en `db/schema-v2.sql` + TypeORM `src/db/entities-v2.ts`:

| Tabla | Notas |
|---|---|
| `entities` | type VARCHAR; visible, page_enabled, show_on_home |
| `projects` | type VARCHAR nullable; status; published/show_on_home; partial dates; **sin `context`** |
| `project_areas` | PK (project_id, area) — multi-area OK |
| `project_roles` | PK (project_id, role) — multi-role OK |
| `project_entities` | PK (project_id, entity_id, relation_role) — M:N editable a nivel datos |
| `pieces` | project_id nullable; category/origin VARCHAR; published |
| `piece_resources` / `project_resources` | media OK |
| `piece_tags` | OK |
| `migration_map` | source_table + source_id VARCHAR(128) + target |
| `testimonials.entity_id` | columna additive + FK (ya en schema) |
| **`piece_entities`** | **NO EXISTE** |

Enums TS actuales (`entities-v2.ts`):

- EntityType: company | institution | association | brand | personal_brand | person | organization | collective | other
- ProjectStatus: ongoing | completed | archived
- ProjectArea: graphic | ux-ui
- ProjectRole: ux | ui | **ux-ui** | graphic-design | branding | visual-direction | frontend | other
- ProjectEntityRelationRole: client | employer | collaborator | brand-owner | other (**sin intermediary**)
- PieceCategory: identity | illustration | campaigns | print | manual | other (≠ strings humanos `visual-identity` / `campaigns-communication`)
- PieceOrigin: personal | client | other (falta client-work / internal-work alineados a context Piece)

V2 counts verificados: entities/projects/pieces/migration_map/project_entities = **0**.

---

## B. Gaps exactos vs decisiones 3B

| # | Decisión 3B | Schema hoy | Gap |
|---|---|---|---|
| A | `Project.context` | ausente | **ADD COLUMN** + catálogo TS |
| B | `piece_entities` | ausente | **CREATE TABLE** + FKs + TypeORM |
| C | relationRole `intermediary` | no en unión TS | extender catálogo (VARCHAR ya flexible en SQL) |
| D | roles sin `ux-ui` como role | TS incluye `ux-ui` | deprecar/quitar de ProjectRole; area `ux-ui` se mantiene |
| E | Project.type usados | VARCHAR libre | documentar catálogo app-level (custom-system, mobile-app, web-app, branding, event, other, …) |
| F | Entity types | `organization` ya existe | OK; `brand` vs personal_brand OK |
| G | confidential records | no flag en projects | **no** tabla NDA; usar published=false + ids genéricos + hashing en map |
| H | migration_map hashing | source_id texto plano | política migrador + validación longitud (sha256: + 64 hex cabe en 128) |
| I | Admin edit Project↔Entity | datos OK | gap = **Admin UI** (no schema) |
| J | Admin edit Piece↔Entity | falta tabla | schema B + Admin |
| K | published/showOnHome/pageEnabled | presentes | OK; reglas runtime Home |
| L | multi-area | OK | OK |
| M | multi-role | OK | OK (sin ux-ui role) |
| N | partial dates | OK | OK |
| O | resources | OK | OK |
| P | testimonials.entity_id | OK | OK; legacy company_* deprecar en lectura |
| Q | Projects sin 1:1 legacy | permitido (id libre) | decision manifest + migration_map synthetic sources |
| R | Projects desde named_list/graphic | — | solo vía manifest |
| S | Piece reassignment project_id | OK (nullable FK) | Admin |
| T | named_list deprecated runtime | tablas legacy siguen | cutover: app deja de leer named_list; no DROP aún |

Piece category naming: decisiones hablan `visual-identity` / `campaigns-communication`; schema usa `identity` / `campaigns`. **Normalizar en manifest** a valores de schema (o ampliar VARCHAR catalog).

---

## C. Cambios SQL necesarios (propuesta; no aplicar)

```sql
-- 1) Project.context
ALTER TABLE projects
  ADD COLUMN context VARCHAR(32) NULL AFTER type;
-- valores app: client-work | internal-work | presale | demo | personal | other

-- 2) piece_entities
CREATE TABLE IF NOT EXISTS piece_entities (
  piece_id VARCHAR(128) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  relation_role VARCHAR(32) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (piece_id, entity_id, relation_role),
  INDEX idx_piece_entities_entity (entity_id),
  CONSTRAINT fk_piece_entities_piece
    FOREIGN KEY (piece_id) REFERENCES pieces (id) ON DELETE CASCADE,
  CONSTRAINT fk_piece_entities_entity
    FOREIGN KEY (entity_id) REFERENCES entities (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Opcional mínimo: índice en `projects(context)` — no requerido.

**No** agregar: phases, employer history, NDA table, credits table.

Actualizar `db/schema-v2-fks.sql` con FKs de `piece_entities`.

---

## D. Cambios TypeORM necesarios

- `ProjectRow.context: ProjectContext | null`
- `ProjectContext` union
- Quitar `ux-ui` de `ProjectRole` (o marcar deprecated y bloquear en migrador)
- Añadir `intermediary` a `ProjectEntityRelationRole` (y PieceEntityRelationRole)
- `PieceEntityRow` + `PieceEntityEntity` schema
- Alinear `PieceCategory` con valores usados en migración (`identity` vs alias)
- Extender `PieceOrigin` si se guarda origin=client-work (o mapear a `client`)
- Incluir en `portfolioV2Entities` / safety V2_TABLES

---

## E. Enums / catalogs necesarios (app-level)

| Catalog | Valores |
|---|---|
| Project.context | client-work, internal-work, presale, demo, personal, other |
| Project.type (doc) | custom-system, mobile-app, web-app, landing, branding, event, other |
| Project.status | ongoing, completed, archived |
| Project.area | graphic, ux-ui |
| Project.role | ux, ui, visual-direction, frontend, graphic-design, branding, other |
| Entity.type | (existente + uso de organization/institution/company/other/person/personal_brand/association) |
| relation_role | client, employer, collaborator, brand-owner, **intermediary**, other |
| Piece.category | identity, illustration, campaigns, print, manual, other |
| Piece.origin | personal, client, other |

---

## F. Diseño `piece_entities`

Espejo de `project_entities` + `sort_order` / `is_primary` ligeros para Admin:

- Justifica Summit, Magic Cell, FabLab→CITF, Labcom→CITF, banners→CITF/Red Clubes, Brigado, La Estación
- No obliga Project artificial
- Editable: add/remove/change role (mismo patrón Admin que project_entities)

---

## G. migration_map + confidential

Problema: `source_id` hoy puede ser `aml-casinos`, `[deferred-confidential]`, etc.

Estrategia propuesta:

1. Decision manifest marca `confidential: true` + `legacySourceKey` **solo en código privado del repo** (no en UI pública).
2. Al escribir `migration_map`:
   - `source_id = 'sha256:' + sha256(legacySourceKey)` (hex 64)
   - `target_id` / `projects.id` / `slug` = ids **genéricos** (`confidential-logistics-system`, etc.)
   - `notes` sin alias
3. Idempotencia: mismo key → mismo hash → mismo map row.
4. Dry-run reports públicos: mostrar solo id genérico + `confidential: true`, nunca alias.
5. Compatibilidad: `source_id` VARCHAR(128) alcanza (`sha256:`+64=71).
6. **No** hace falta ALTER de migration_map si se adopta convención de prefijo.

Legacy rows confidential candidatos: aml-*, aicore-inventariado client entity, confidential-logistics (si hubo ui id), [deferred-confidential]/[deferred-confidential] si se migran.

---

## H. Decision manifest (propuesta)

**No parsear Markdown.** Fuente canónica tipada:

`scripts/migrate-v2/decisions.ts` (o `decisions.json` generado desde TS)

Contenido mínimo:

```ts
export const migrationDecisions = {
  version: 1,
  entities: Array<{ id, name, type, visible, pageEnabled, showOnHome, ... }>,
  projects: Array<{
    id, title, type, context, status, published, areas, roles,
    entities: Array<{ entityId, relationRole }>,
    pieces?: string[], // graphic_item ids
    sources?: Array<{ table, id, confidential? }>,
    notes?: string, // internal only
  }>,
  pieces: Array<{ id, projectId?, category, origin, entityLinks?, published?, discard? }>,
  testimonials: Array<{ id, entityId }>,
  discard: { namedListLabels: string[], brands?: string[], ... },
  deferred: Array<{ kind, label, reason }>,
};
```

El MD `reports/content-v2-phase-3b-decisions.md` queda **humano/histórico**; el migrador solo lee `decisions.ts`.

Soporta dry-run / apply / validate / no dual-write.

---

## I. Entities nuevas derivadas de 3B (conceptual)

**Legacy brands elevados:** push, aicore, citf, seyier, apsmm, ludica, orbita-l-b  

**Nuevas:** ADAPTO PAY, CLEARWATER, MIKROBIOL, CASIBA, PROXI, Omnigroup, Savil, Futulab, Summit Holding, Magic Cell, Brigado Crew, Templeton & Mathews, Repuestos Carlitos, La Estación, EPICA, Gobierno de Formosa, IAS, Red de Clubes Digitales, Sec. CyT Formosa, Subsecretaría de Empleo  

**Privadas/other:** Cliente confidencial Inventariado, Cliente confidencial AML, Cliente privado Asesor Financiero, Cliente privado Sessions, Cliente confidencial Logística  

---

## J. Projects nuevos derivados de 3B

Desde ui_projects (ajustados): 13 UX/UI (con type/context/roles/relations humanos)  

Gráfico / reconstruidos: expedicion-polo, juegos-provinciales, citf-identity-2025, seyier-visual-identity, push-visual-identity, futulab-visual-identity, bass-series, syllabi, microtime, sessions, concitar, taily, simaas-marketplace, templeton-digital-transformation-assessment, confidential-logistics-system, repuestos-carlitos, mental-training-tech-24-5  

---

## K. Legacy a descartar (deliberado)

- named_list como runtime Home (toda la tabla post-cutover)
- bind (no migrar Entity)
- Ministerio de Economía (no Entity aún)
- Labels Home sin decisión (fiserv ambiguo hasta confirmar, etc. → ver deferred)
- Segundo SIMAAS (eventos/foros) — no crear aún
- AICORE en SIMAAS segunda etapa — no modelar
- Manual/identidad CITF 2026 / PUSH 2027 — no inventar
- Entity Labcom / FabLab — no
- Entity NSXIDE — no
- buhoprofe como Piece branding del usuario — no (resource contextual Syllabi)

---

## L. Deferred

- Cloronor Entity+Project(s) trading/store + employer
- FISERV Entity vs Project
- [deferred-confidential] / [deferred-confidential] confidential pattern
- Microtime UX role final + published
- Proxi published contractual
- Syllabi published authorization
- Juegos client Gobierno validación
- Órbita relations case-by-case
- Mental Training client Entity
- Confidential-logistics roles UX/UI explícitos
- Educación Entity exacta
- SIMAAS-eventos second project
- push pageEnabled already true; more PUSH projects discovery

---

## M. Riesgos

1. Classifier actual aún propone collaborator/client AICORE ≠ employer/intermediary humanos.  
2. Dual source MD vs code si no se congela manifest.  
3. Filtrar confidential en reports/Admin.  
4. Piece category string mismatch.  
5. Home vacía si showOnHome no se setea en apply.  
6. `project_entities` PK incluye relation_role → misma entity dos roles OK; Admin debe soportarlo.  
7. Over-migration de named_list indeterminados.

---

## N. Orden de implementación recomendado

1. Congelar `decisions.ts` desde 3B (sin apply)  
2. Schema patch: `context` + `piece_entities` + FKs + TypeORM enums  
3. Actualizar dry-run para consumir manifest (report-only)  
4. Admin: CRUD relations Project/Piece↔Entity  
5. Migrator apply guarded (ENCODING-style approval)  
6. Cutover Home readers off named_list  
7. Confidential hashing + report redaction  
8. Deferred backlog humano  

---

## O–Q

- **O:** No MySQL writes en esta fase  
- **P:** V2 sigue en 0  
- **Q:** `--apply` NO ejecutado  
