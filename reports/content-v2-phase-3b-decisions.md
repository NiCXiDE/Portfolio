# Content Model V2 — Decisiones humanas Fase 3B

Estado: **registrado / no aplicado**.  
No INSERT/UPDATE/ALTER/--apply sobre MySQL. Schema V2 aún sin `projects.context`.

Generado: 2026-08-14 (registro post 3B.1 + 3B.2).

---

## Pendiente de schema (parche posterior)

### `Project.type` (naturaleza del producto)

Ejemplos conceptuales: `custom-system` | `mobile-app` | `web-app` | `landing` | `branding` | `event` | `other`

### `Project.context` (**nuevo**, no existe en `schema-v2.sql` hoy)

Catálogo conceptual aprobado:

- `client-work`
- `internal-work` (trabajo interno de organización; **no** usar `internal-product`)
- `presale`
- `demo`
- `personal`
- `other`

Separar producto (`type`) vs contexto en el que se realizó.

### `piece_entities` (**nuevo**, pendiente de schema)

Tabla de relación Piece ↔ Entity (análoga a `project_entities`):

- `piece_id`, `entity_id`, `relation_role`
- orden/principal si el modelo lo requiere
- FKs + editable desde Admin

Justifica Pieces profesionales sin Project artificial (Summit, Magic Cell, FabLab→CITF, banners, Brigado, etc.).

### Roles personales (no usar `ux-ui` como role)

`ux` | `ui` | `visual-direction` | `frontend` | `graphic-design` | `branding` | `other`

Presentación pública: si hay `ux` + `ui` → renderizar **UX/UI**.  
No agregar `frontend` sin decisión humana explícita.

### Relation roles relevantes

- En trabajo full-time AICORE con cliente final distinto: **AICORE = employer** (no collaborator/client).
- Copy público sugerido: “Realizado como parte del equipo de AICORE IT Specialists” (sin exponer necesariamente el término técnico).

---

## 3B.1 — Entities (aprobado)

| id | type | showOnHome | pageEnabled | notas |
|---|---|---|---|---|
| citf | institution | true | true | Hub puede agrupar pieces/manuals existentes; no inventar |
| aicore | company | true | true | Página por recurrencia |
| push | company | true | **true** | Identidad + recurrencia Projects PUSH (3B.4) |
| apsmm | association | true | false | named_list APSMM → resolver contra Entity (no duplicar) |
| ludica | company | true | false | |
| orbita-l-b | company | true | false | |
| seyier | personal_brand | false | false | |

---

## Entities nuevas (aprobadas conceptualmente; NO insertar aún)

Denominaciones genéricas para confidenciales — **no** guardar nombre real en metadata/notes/migration_map.

| denominación provisional | type | visible | pageEnabled | showOnHome |
|---|---|---|---|---|
| ADAPTO PAY | company | true | false | false |
| CLEARWATER | company | true | false | false |
| MIKROBIOL | company | true | false | false |
| CASIBA | company | true | false | false |
| PROXI | company | false | false | false |
| Omnigroup | company | true | false | false |
| Savil | company | true | false | false |
| Cliente confidencial Inventariado | other | false | false | false |
| Cliente confidencial AML | other | false | false | false |
| Cliente privado Asesor Financiero | person | false | false | false |

AML General y AML Casinos comparten la misma Entity confidencial AML.

---

## 3B.2 — UX/UI Projects (aprobado)

| id | type | context | status | areas | roles | relations | published notes |
|---|---|---|---|---|---|---|---|
| aicore-inventariado | custom-system | presale | completed | ux-ui | ux, ui, visual-direction | AICORE employer; Cliente confidencial Inventariado client | |
| aml-general | custom-system | client-work | completed | ux-ui | ux, ui | AICORE employer; Cliente confidencial AML client | ~6 meses; fecha exacta no forzar |
| aml-casinos | custom-system | client-work | completed | ux-ui | ux, ui | AICORE employer; Cliente confidencial AML client | ~6 meses |
| adapto-pay | mobile-app | presale | completed | ux-ui | ux, ui | ADAPTO PAY client; AICORE employer | |
| clearwater | custom-system | presale | completed | ux-ui | ux, ui | CLEARWATER client; AICORE employer | |
| mikrobiol | web-app | presale | completed | ux-ui | ux, ui | MIKROBIOL client; AICORE employer | |
| casiba | custom-system | presale | completed | ux-ui | ux, ui | CASIBA client; AICORE employer | |
| proxi | custom-system | presale | completed | ux-ui | ux, ui | PROXI client; AICORE employer | **published=false** hasta revisión |
| apsmm | custom-system | presale | completed | ux-ui, graphic | ux, ui, graphic-design | APSMM client; PUSH employer | logo APSMM voluntario ≠ branding completo |
| omnigroup | custom-system | presale | completed | ux-ui | ux, ui | Omnigroup client; AICORE employer | no archived por desconocer producción |
| savil | mobile-app | presale | completed | ux-ui | ux, ui | Savil client | sin PUSH/AICORE |
| asesor-financiero | mobile-app | presale | completed | ux-ui | ux, ui | Cliente privado Asesor Financiero client | `Demo` ≠ Entity |
| cms-portfolio | custom-system | personal | ongoing | ux-ui | ux, ui | ninguna | sin frontend como role |

### PUSH

APSMM confirma al menos: PUSH → employer. Mantener pendiente reevaluación de `push.pageEnabled`.

---

## 3B.3 — CITF / Graphic (aprobado)

### Expedición Polo → Project `expedicion-polo`
- type=`event` · context=`client-work` · status=`completed`
- areas: graphic · roles: graphic-design, visual-direction
- CITF = entidad principal/responsable (ecosistema Clúster + Sec. CyT Formosa; sin inventar contrato extra)
- Admin debe permitir agregar Pieces faltantes (publicidad, gigantografías, pantallas, monolitos, impresos, digitales, etc.)
- Cover actual ≠ totalidad del trabajo

### Juegos Provinciales → Project `juegos-provinciales`
- type=`event` · context=`client-work` · status=`completed`
- areas: graphic · roles: graphic-design, visual-direction
- Gallery 11 → **Pieces** del Project (no solo ProjectResources)
- Cover/thumbnail → ProjectResource cuando corresponda
- Relación provisional **Gobierno de Formosa → client** (PENDIENTE validación; editable en Admin; no hardcodear)

### CITF Identidad 2025 → Project `citf-identity-2025` (nuevo conceptual)
- type=`branding` · context=`client-work` · status=`completed`
- areas: graphic · roles: branding, graphic-design, visual-direction
- CITF → brand-owner / entidad principal
- Pieces: `itf`, manual `brand_manuals:citf` (cover+PDF = PieceResources), `banner-cluster` (print por evidencia `impreso`)
- **NO** Project separado `citf-manual-2025`
- No inventar identidad 2026

### FabLab
- Piece standalone relacionada CITF · category=`visual-identity` · role graphic-design
- NO Project ni Entity independientes por ahora

### Futulab
- Entity Futulab (company; pageEnabled=false; showOnHome=false)
- Project `futulab-visual-identity` · branding · client-work · **ongoing**
- roles: branding, graphic-design, visual-direction
- graphic `futulab` → Piece del Project
- CITF ecosistema opcional; no inventar employer

### Reglas transversales
- Atribución gráfica ecosistema Clúster → CITF / entidad del Clúster; **no** PUSH employer salvo indicación explícita
- Órbita: no resolver como client automáticamente (fue intermediario histórico)
- **CMS V2:** Project↔Entity relationships deben ser editables (add/remove/change role/principal)

---

## 3B.4 — Resto graphic (aprobado)

### Projects
| id | type | context | status | areas | roles | relations | notes |
|---|---|---|---|---|---|---|---|
| seyier-visual-identity | branding | other | completed | graphic | branding, graphic-design, visual-direction | Seyier brand-owner | voluntario; logo+3 gallery → Pieces |
| push-visual-identity | branding | internal-work | ongoing | graphic | branding, graphic-design, visual-direction | PUSH brand-owner | pieces: push, banner-push (print); no manual |
| syllabi | web-app | other | completed | ux-ui | ux, ui | — | **published=false**; buhoprofe ≠ logo design propio (solo vectorización) → ProjectResource contextual |
| microtime | custom-system | internal-work | ongoing | ux-ui, graphic | ui, graphic-design; **ux pendiente** | PUSH employer | published=false temporal |
| sessions | custom-system | client-work | completed | ux-ui, graphic | ux, ui, graphic-design | PUSH employer; Cliente privado Sessions client | colaborativo |
| concitar | web-app | internal-work | completed | ux-ui, graphic | ux, ui, graphic-design | PUSH employer | no adjudicar arquitectura inicial Tech Lead |
| taily | mobile-app | internal-work | ongoing | ux-ui, graphic | ux, ui, graphic-design | PUSH employer | graphic taily → Piece; decisiones colaborativas |
| bass-series | other | personal | ongoing | graphic | graphic-design | — | pieces: twenty-twenty-two-spotify, twenty-twenty-3, bass2k24/25/26; NSXIDE = alias/tag no Entity |

### Pieces / Entities
- **apsmm** graphic → Piece del Project APSMM (3B.2); no branding Project
- **summit-holding** → Piece standalone visual-identity; Entity Summit Holding (other); piece_entities; sin Órbita
- **magic-cell** → Piece standalone; Entity Magic Cell (company)
- **tdt** + **nick-tdt-beach** → Pieces personales + tag `tdt`; no Project
- **labcom** → Piece standalone visual-identity → CITF via piece_entities; published=false; no Entity/Project Labcom
- **banner-samsung** / **banner-alfaj-metro** → Piece print; piece_entities → CITF (no Samsung client auto)
- **brigado-crew** → Piece digital campaigns-communication (NO print); Entity Brigado Crew (other)
- Covers/fan/personal listados en 3B.4 P → Pieces standalone; `personal`=origin; `fan-art`=tag
- Home `current_project` deja de ser fuente estructural → Project.status + showOnHome / Entity.showOnHome

### Entities conceptuales añadidas en 3B.4
Futulab (ya 3B.3), Summit Holding, Magic Cell, Brigado Crew, Cliente privado Sessions; push.pageEnabled=true.

---

## 3B.5 — cierre (aprobado)

### Testimonials
facundo→push · ezequiel→aicore · joaquin→ludica · matias→orbita-l-b  
`entity_id` estructural; company/logo/href no 2ª fuente si solo repiten Entity.

### Home
`named_list_items` DEPRECATED post-cutover. Home = Entity/Project.showOnHome + published + status.

### Entities institucionales
EPICA (company) · Gobierno de Formosa (institution) · IAS (institution) · Red de Clubes Digitales (organization) · Sec. CyT Formosa (institution) · Subsecretaría de Empleo (institution).  
No fusionar con CITF. No migrar Ministerio Economía ni bind. Educación genérica diferida.

### Projects / Entities finales 3B.5
| id | notas |
|---|---|
| simaas-marketplace | web-app · presale · completed · Órbita intermediary; sin Entity SIMAAS; sin AICORE auto; 2º SIMAAS eventos diferido |
| templeton-digital-transformation-assessment | Entity Templeton & **Mathews** (1 t); AICORE **intermediary** (no employer) |
| confidential-logistics-system | published=false; AICORE employer; Cliente confidencial Logística; roles UX/UI **no inferir** |
| repuestos-carlitos | completed; Entity Repuestos Carlitos; PUSH employer; web-app + graphic |
| mental-training-tech-24-5 | mobile-app; AICORE employer; nombre correcto Mental Training Tech 24.5 |
| La Estación | Entity + Piece(s) comunicación; no Project |

### Confidential source_ids
Proyectos/aliases sensibles: no persistir en slug/title/notes/migration_map/Admin. Preferir `sha256:<hash>` determinístico en migration_map.source_id.
