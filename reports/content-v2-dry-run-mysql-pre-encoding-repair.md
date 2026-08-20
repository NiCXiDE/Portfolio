# Content Model V2 — Dry Run Report

Generado: 2026-08-13T21:41:22.926Z
Modo: **dry-run** (read-only, sin writes en V2)
Source: **mysql**

## Resumen ejecutivo

| Métrica | Valor |
|---------|------:|
| Proposed Entities | 7 |
| Proposed Projects | 16 |
| Standalone Pieces | 44 |
| Pieces en Projects | 17 |
| ProjectResources | 25 |
| PieceResources | 63 |
| Confianza alta / media / baja | 30 / 38 / 0 |
| Decisiones humanas | 73 |

## Verificación de seguridad

- Legacy counts unchanged: **SÍ**
- V2 untouched (0 filas): **SÍ**
- migration_map before/after: 0 / 0

### Legacy counts
```
graphic_items: 47
ui_projects: 13
brands: 7
brand_manuals: 1
testimonials: 4
named_list_items: 40
tags: 9
ui_list_items: 8
```

### V2 counts (before → after)
```
entities: 0 → 0
projects: 0 → 0
project_areas: 0 → 0
project_roles: 0 → 0
project_entities: 0 → 0
pieces: 0 → 0
piece_resources: 0 → 0
project_resources: 0 → 0
piece_tags: 0 → 0
migration_map: 0 → 0
```

## Proposed Entities

### PUSH Software (`push`)
- type: **company** (known)
- slug: `push-software`
- relaciones legacy: 2
- pageEnabled sugerido: sí — Tiene logo, URL y múltiples relaciones legacy.
- confianza: alta
- decisión humana: no

### AICORE IT Specialists (`aicore`)
- type: **company** (known)
- slug: `aicore-it-specialists`
- relaciones legacy: 2
- pageEnabled sugerido: sí — Tiene logo, URL y múltiples relaciones legacy. 8 projects propuestos.
- confianza: alta
- decisión humana: no

### L??dica Tech (`ludica`)
- type: **company** (inferred)
- slug: `l-dica-tech`
- relaciones legacy: 2
- pageEnabled sugerido: sí — Tiene logo, URL y múltiples relaciones legacy.
- confianza: media
- decisión humana: sí

### ??rbita L??B (`orbita-l-b`)
- type: **company** (inferred)
- slug: `rbita-l-b`
- relaciones legacy: 2
- pageEnabled sugerido: sí — Tiene logo, URL y múltiples relaciones legacy.
- confianza: media
- decisión humana: sí

### APSMM (`apsmm`)
- type: **association** (inferred)
- slug: `apsmm`
- relaciones legacy: 2
- pageEnabled sugerido: no — pageEnabled debe decidirse manualmente; entidad puede existir sin página pública.
- confianza: media
- decisión humana: sí

### Cl??ster de Innovaci??n Tecnol??gica Formosa (`citf`)
- type: **institution** (known)
- slug: `cl-ster-de-innovaci-n-tecnol-gica-formosa`
- relaciones legacy: 7
- pageEnabled sugerido: no — pageEnabled debe decidirse manualmente; entidad puede existir sin página pública.
- confianza: alta
- decisión humana: no

### Seyier (`seyier`)
- type: **personal_brand** (known)
- slug: `seyier`
- relaciones legacy: 1
- pageEnabled sugerido: no — pageEnabled debe decidirse manualmente; entidad puede existir sin página pública.
- confianza: alta
- decisión humana: no

## Proposed Projects

### AICORE IT Specialists ??? inventariado (`aicore-inventariado`)
- slug: `aicore-it-specialists-inventariado`
- areas: ux-ui
- type: presale
- status: archived
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:aicore-inventariado
- pieces: 0 | resources: 1
- confianza: media
- entities:
  - AICORE IT Specialists → **client** (alta)
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### An??lisis contra el Lavado de Dinero (`aml-general`)
- slug: `an-lisis-contra-el-lavado-de-dinero`
- areas: ux-ui
- type: custom-system
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:aml-general
- pieces: 0 | resources: 1
- confianza: media
- entities:
  - AICORE IT Specialists → **client** (alta)
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### An??lisis contra el Lavado de Dinero en Casinos Digitales (`aml-casinos`)
- slug: `an-lisis-contra-el-lavado-de-dinero-en-casinos-digitales`
- areas: ux-ui
- type: custom-system
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:aml-casinos
- pieces: 0 | resources: 1
- confianza: media
- entities:
  - AICORE IT Specialists → **client** (alta)
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### Asesor Financiero (`asesor-financiero`)
- slug: `asesor-financiero`
- areas: ux-ui
- type: mobile-app
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:asesor-financiero
- pieces: 0 | resources: 3
- confianza: media
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### Billetera Digital - ADAPTO PAY (`adapto-pay`)
- slug: `billetera-digital-adapto-pay`
- areas: ux-ui
- type: presale
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:adapto-pay
- pieces: 0 | resources: 3
- confianza: media
- entities:
  - ADAPTO PAY → **client** (media)
  - AICORE IT Specialists → **collaborator** (alta)
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### EXPEDICI??N POLO (`expedicion-polo`)
- slug: `expedici-n-polo`
- areas: graphic
- type: event
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: graphic_items:expedicion-polo
- pieces: 1 | resources: 0
- confianza: alta
- entities:
  - Cl??ster de Innovaci??n Tecnol??gica Formosa → **client** (media)
- notas: section=eventos → Project.type=event (regla fuerte aprobada).; Galería con 0 recursos → pieces/resources, no Project por galería sola.

### Generaci??n de Informes para compra e inversi??n - CLEARWATER (`clearwater`)
- slug: `generaci-n-de-informes-para-compra-e-inversi-n-clearwater`
- areas: ux-ui
- type: custom-system
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:clearwater
- pieces: 0 | resources: 1
- confianza: media
- entities:
  - CLEARWATER → **client** (media)
  - AICORE IT Specialists → **collaborator** (alta)
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### Juegos Provinciales Tecnol??gicos (`juegos-provinciales`)
- slug: `juegos-provinciales-tecnol-gicos`
- areas: graphic
- type: event
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: graphic_items:juegos-provinciales
- pieces: 12 | resources: 0
- confianza: alta
- entities:
  - Gobierno de Formosa → **client** (media)
- notas: section=eventos → Project.type=event (regla fuerte aprobada).; Galería con 11 recursos → pieces/resources, no Project por galería sola.

### Omnigroup ??? backoffice y t??tem (`omnigroup`)
- slug: `omnigroup-backoffice-y-t-tem`
- areas: ux-ui
- type: presale
- status: archived
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:omnigroup
- pieces: 0 | resources: 6
- confianza: media
- entities:
  - Omnigroup → **client** (media)
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### Plataforma integral de ventas y pedidos B2B - PROXI (`proxi`)
- slug: `plataforma-integral-de-ventas-y-pedidos-b2b-proxi`
- areas: ux-ui
- type: custom-system
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:proxi
- pieces: 0 | resources: 0
- confianza: media
- entities:
  - PROXI → **client** (media)
  - AICORE IT Specialists → **collaborator** (alta)
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### Savil (`savil`)
- slug: `savil`
- areas: ux-ui
- type: mobile-app
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:savil
- pieces: 0 | resources: 3
- confianza: media
- entities:
  - Savil → **client** (media)
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### Seyier — identidad visual (`seyier-visual-identity`)
- slug: `seyier-identidad-visual`
- areas: graphic
- type: visual-identity
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: graphic_items:seyier
- pieces: 4 | resources: 0
- confianza: alta
- entities:
  - Seyier → **brand-owner** (alta)
- notas: Proyecto de identidad visual completo (logo + pantallas).

### Sistema de gesti??n ??? APSMM (`apsmm`)
- slug: `sistema-de-gesti-n-apsmm`
- areas: ux-ui
- type: custom-system
- status: completed
- roles: ui
- fuentes: ui_projects:apsmm
- pieces: 0 | resources: 3
- confianza: alta
- entities:
  - APSMM → **client** (alta)
- notas: Coincidencia "\bui\b|\binterfaz\b|\binterface\b" → ui

### Sistema de gesti??n de contenido del portfolio (`cms-portfolio`)
- slug: `sistema-de-gesti-n-de-contenido-del-portfolio`
- areas: ux-ui
- type: personal
- status: ongoing
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:cms-portfolio
- pieces: 0 | resources: 1
- confianza: media
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA (`casiba`)
- slug: `sistema-de-gesti-n-de-unidades-de-tratamiento-de-aire-casiba`
- areas: ux-ui
- type: custom-system
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:casiba
- pieces: 0 | resources: 1
- confianza: media
- entities:
  - CASIBA → **client** (media)
  - AICORE IT Specialists → **collaborator** (alta)
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

### Tienda de Insumos Medicinales - MIKROBIOL (`mikrobiol`)
- slug: `tienda-de-insumos-medicinales-mikrobiol`
- areas: ux-ui
- type: custom-system
- status: completed
- roles: PENDIENTE DE REVISIÓN
- fuentes: ui_projects:mikrobiol
- pieces: 0 | resources: 1
- confianza: media
- entities:
  - MIKROBIOL → **client** (media)
  - AICORE IT Specialists → **collaborator** (alta)
- notas: Sin evidencia textual de rol UX/UI/branding/etc.

## Standalone Pieces

| ID | Título | Categoría | Origin | Tags | Conf |
|----|--------|-----------|--------|------|------|
| banner-push | Banner PUSH | print | client | impreso | media |
| odyssey-plant-head | Odyssey ??? plant head figure | illustration-artwork | other | nsfw | media |
| mantis | Mantis by Magnetude | illustration-artwork | personal |  | alta |
| kadaver-jez-ebel | KADAVER - Jez_ebel bootleg | illustration-artwork | other | cover | alta |
| buhoprofe | Buho Profe | visual-identity | client |  | media |
| banner-cluster | Banner Cluster | print | client | impreso | media |
| nick-tdt-beach | Nick TDT Beach | illustration-artwork | other | pixel-art | media |
| marauda-type-logo-ayala | Marauda type logo ??? Ayala | illustration-artwork | personal | vector, fan-art | alta |
| ive-no-idea | I've No Idea But I Love It | illustration-artwork | other | cover | alta |
| banana-thinking | Banana thinking illustration | illustration-artwork | personal |  | alta |
| summit-holding | Summit Holding | visual-identity | client | vector | media |
| penguin-knife | Penguin tattoo concept | illustration-artwork | other | vector, tattoo | media |
| banner-samsung | Banner Samsung | print | client | impreso | media |
| barely-alive | This Is Barely Alive '24 Update | illustration-artwork | other | cover | alta |
| demon-no-scape | Demon illustration ??? No Scape | illustration-artwork | personal |  | alta |
| speeditious | Speeditious | illustration-artwork | other | cover | alta |
| banner-alfaj-metro | Banner Alfaj / Metro | print | client | impreso | media |
| push | PUSH Software | visual-identity | client |  | media |
| grime-marauda | Grime ??? Marauda | illustration-artwork | personal | grime | alta |
| brigado-crew | Brigado Crew / JBC | print | client | impreso | media |
| rockcito | Rockcito To Wake Up | illustration-artwork | other | cover | alta |
| microtime | Microtime | visual-identity | client | vector | media |
| futulab | futul??b | visual-identity | client | vector | media |
| grime-pawn | Grime pawn ??? Ayala | illustration-artwork | personal | grime | alta |
| cover-emoji | Cover | illustration-artwork | other | cover | alta |
| fablab | FabLab | visual-identity | client |  | media |
| nicoide-not-impostor | Nicoide was not an Impostor | illustration-artwork | personal | fan-art, pixel-art | alta |
| bass2k24 | Bass2k24 | illustration-artwork | other | bass-series, cover | alta |
| bass2025 | 2025 IN BASS | illustration-artwork | other | bass-series, cover | alta |
| nicoide-geometry-dash | NICOIDE ??? Geometry Dash wordmark | illustration-artwork | personal | fan-art | alta |
| labcom | labcom | visual-identity | client |  | media |
| we-are-barely-world | We Are Barely Alive ??? Mario world parody | illustration-artwork | personal | fan-art | alta |
| twenty-twenty-two-spotify | Twenty Twenty Two | illustration-artwork | other | bass-series, cover | alta |
| sessions | sessions | visual-identity | client |  | media |
| sad-machine-makenix | Sad Machine - Makenix Remix | illustration-artwork | personal | fan-art | alta |
| concitar | CONCITAR | visual-identity | client |  | media |
| twenty-twenty-3 | Twenty Twenty 3 | illustration-artwork | other | bass-series, cover | alta |
| apsmm | Asociaci??n de Profesionales de Salud de la Marina Mercante | visual-identity | client |  | media |
| bass2026 | BASS 2026 | illustration-artwork | other | bass-series, cover | alta |
| reggaeton | Reggaeton Rukistrukis | illustration-artwork | other | cover | alta |
| itf | ITF Cluster | visual-identity | client |  | media |
| taily | Taily | visual-identity | client |  | media |
| tdt | TDT ??? The Dream Team | visual-identity | client | vector | media |
| magic-cell | MAGIC CELL | visual-identity | client | vector | media |

## Project ↔ Entity relationships requiring review

- **Billetera Digital - ADAPTO PAY** ↔ **ADAPTO PAY**: rol `client` — ui_projects.client="ADAPTO PAY" (cliente final) (media)
- **Billetera Digital - ADAPTO PAY** ↔ **AICORE IT Specialists**: rol `collaborator` — Colaboraci??n con @aicore - noviembre 2024 (alta)
- **Generaci??n de Informes para compra e inversi??n - CLEARWATER** ↔ **CLEARWATER**: rol `client` — ui_projects.client="CLEARWATER" (cliente final) (media)
- **Generaci??n de Informes para compra e inversi??n - CLEARWATER** ↔ **AICORE IT Specialists**: rol `collaborator` — Colaboraci??n con @aicore - enero 2024 (alta)
- **Tienda de Insumos Medicinales - MIKROBIOL** ↔ **MIKROBIOL**: rol `client` — ui_projects.client="MIKROBIOL" (cliente final) (media)
- **Tienda de Insumos Medicinales - MIKROBIOL** ↔ **AICORE IT Specialists**: rol `collaborator` — Colaboraci??n con @aicore - octubre 2024 (alta)
- **Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA** ↔ **CASIBA**: rol `client` — ui_projects.client="CASIBA" (cliente final) (media)
- **Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA** ↔ **AICORE IT Specialists**: rol `collaborator` — Colaboraci??n con @aicore - septiembre 2024 (alta)
- **Plataforma integral de ventas y pedidos B2B - PROXI** ↔ **PROXI**: rol `client` — ui_projects.client="PROXI" (cliente final) (media)
- **Plataforma integral de ventas y pedidos B2B - PROXI** ↔ **AICORE IT Specialists**: rol `collaborator` — Colaboraci??n con @aicore - enero 2024 (alta)
- **Omnigroup ??? backoffice y t??tem** ↔ **Omnigroup**: rol `client` — ui_projects.client="Omnigroup" (media)
- **Savil** ↔ **Savil**: rol `client` — ui_projects.client="Savil" (media)
- **Juegos Provinciales Tecnol??gicos** ↔ **Gobierno de Formosa**: rol `client` — Campa??a de difusi??n para el Gobierno de Formosa: gaming, rob??tica y m??sica en vivo. Polo Cient??fico, Tecnol??gico y de Innovaci??n ?? 21 de junio. (media)
- **EXPEDICI??N POLO** ↔ **Cl??ster de Innovaci??n Tecnol??gica Formosa**: rol `client` — graphic_items.brandId=citf (media)

## Mapping categorías gráficas legacy → propuesta

- `banners` → **print**
- `illustration` → **illustration-artwork**
- `personal` → **illustration-artwork**
- `covers` → **illustration-artwork**
- `logos` → **visual-identity**
- `eventos` → **campaigns-communication**

Reglas adicionales:
- `eventos` → Project.type=event
- `personal` → origin=personal
- `fan-art`, `cover` → tags
- `manual` → Piece bajo identidad visual

## Tags

### Catálogo y uso
| slug | label | usos |
|------|-------|-----:|
| nsfw | NSFW | 1 |
| pixel-art | Pixel art | 2 |
| vector | Vector | 8 |
| fan-art | Fan art | 5 |
| grime | Grime | 2 |
| tattoo | Tattoo | 1 |
| bass-series | Bass series | 5 |
| impreso | Impreso | 5 |
| evento | Evento | 2 |

Sin uso en catálogo: —
Slugs en piezas ausentes del catálogo: —

## named_list_items

| ID | kind | label | clasificación | target | home replacement |
|----|------|-------|---------------|--------|------------------|
| 35 | current_project | Concitar | project_candidate | projects:concitar (nuevo?) | Project.showOnHome + status=ongoing |
| 1 | company | AICORE IT Specialists | entity_existing | entities:aicore | Entity.showOnHome + homeOrder |
| 19 | past_project | Adapto Pay | project_candidate | projects:adapto-pay (nuevo?) | Project.showOnHome + status=completed |
| 2 | company | Asociaci??n de Profesionales de Salud de la Marina Mercante | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 36 | current_project | MICROTIME | project_candidate | projects:microtime (nuevo?) | Project.showOnHome + status=ongoing |
| 20 | past_project | Asesor Financiero | project_existing | projects:asesor-financiero | Project.showOnHome + status=completed |
| 21 | past_project | [deferred-confidential] | project_candidate | projects:[deferred-confidential] (nuevo?) | Project.showOnHome + status=completed |
| 37 | current_project | Repuestos Carlitos | project_candidate | projects:repuestos-carlitos (nuevo?) | Project.showOnHome + status=ongoing |
| 3 | company | bind | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 38 | current_project | Sessions | project_candidate | projects:sessions (nuevo?) | Project.showOnHome + status=ongoing |
| 4 | company | Cloronor | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 22 | past_project | Casiba | project_candidate | projects:casiba (nuevo?) | Project.showOnHome + status=completed |
| 39 | current_project | Syllabi | project_candidate | projects:syllabi (nuevo?) | Project.showOnHome + status=ongoing |
| 5 | company | Cl??ster de Innovaci??n Tecnol??gica Formosa | entity_existing | entities:citf | Entity.showOnHome + homeOrder |
| 23 | past_project | Clearwater | project_candidate | projects:clearwater (nuevo?) | Project.showOnHome + status=completed |
| 40 | current_project | Taily | project_candidate | projects:taily (nuevo?) | Project.showOnHome + status=ongoing |
| 24 | past_project | Cloronor | project_candidate | projects:cloronor (nuevo?) | Project.showOnHome + status=completed |
| 6 | company | Empresa Provincial de Innovaci??n y Conocimiento Abierto | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 25 | past_project | EXPEDICI??N POLO | project_existing | projects:expedicion-polo | Project.showOnHome + status=completed |
| 7 | company | FabLab | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 8 | company | FISERV. | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 26 | past_project | fiserv. | project_candidate | projects:fiserv (nuevo?) | Project.showOnHome + status=completed |
| 27 | past_project | [deferred-confidential] | project_candidate | projects:[deferred-confidential] (nuevo?) | Project.showOnHome + status=completed |
| 9 | company | Gobierno de Formosa | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 10 | company | Instituto de Asistencia Social | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 28 | past_project | Juegos Provinciales Tecnol??gicos | project_existing | projects:juegos-provinciales | Project.showOnHome + status=completed |
| 29 | past_project | La Estaci??n | project_candidate | projects:la-estaci-n (nuevo?) | Project.showOnHome + status=completed |
| 11 | company | Labcom | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 30 | past_project | Mental Tech Training | project_candidate | projects:mental-tech-training (nuevo?) | Project.showOnHome + status=completed |
| 12 | company | L??dica Tech | entity_existing | entities:ludica | Entity.showOnHome + homeOrder |
| 31 | past_project | omni group | project_candidate | projects:omni-group (nuevo?) | Project.showOnHome + status=completed |
| 13 | company | Ministerio de Economia, Hacienda y Finanzas | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 32 | past_project | proxi | project_candidate | projects:proxi (nuevo?) | Project.showOnHome + status=completed |
| 14 | company | ??rbita L??B | entity_existing | entities:orbita-l-b | Entity.showOnHome + homeOrder |
| 33 | past_project | SIMAAS | project_candidate | projects:simaas (nuevo?) | Project.showOnHome + status=completed |
| 15 | company | PUSH Software | entity_existing | entities:push | Entity.showOnHome + homeOrder |
| 16 | company | Red de Clubes Digitales | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 34 | past_project | Templeton & Matthews | project_candidate | projects:templeton-matthews (nuevo?) | Project.showOnHome + status=completed |
| 17 | company | Secretar??a de Ciencia y Tecnolog??a de Formosa | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |
| 18 | company | Subsecretar??a de Empleo de Formosa | home_text_only | nueva Entity o texto | Entity.showOnHome (si se crea) o mantener listado |

## Testimonials

### Barberis Facundo (`facundo`)
- entity propuesta: push (PUSH Software)
- redundante tras link: company_brand_id (reemplazado por entity_id); company_name (si coincide con Entity.name)
- conservar override: company_logo_path — override si difiere del logo Entity; company_href — override de URL pública

### Maranga Ezequiel (`ezequiel`)
- entity propuesta: aicore (AICORE IT Specialists)
- redundante tras link: company_brand_id (reemplazado por entity_id); company_name (si coincide con Entity.name)
- conservar override: company_logo_path — override si difiere del logo Entity; company_href — override de URL pública

### Amarilla Joaqu??n (`joaquin`)
- entity propuesta: ludica (L??dica Tech)
- redundante tras link: company_brand_id (reemplazado por entity_id); company_name (si coincide con Entity.name)
- conservar override: company_logo_path — override si difiere del logo Entity; company_href — override de URL pública

### Mendoza Mat??as (`matias`)
- entity propuesta: orbita-l-b (??rbita L??B)
- redundante tras link: company_brand_id (reemplazado por entity_id); company_name (si coincide con Entity.name)
- conservar override: company_logo_path — override si difiere del logo Entity; company_href — override de URL pública

## brand_manuals

### Manual de Marca 2025 CITF
- A: Piece (category=manual) dentro de Project de identidad CITF existente (p.ej. itf logo / cluster).
- B: Project nuevo de identidad "Manual de Marca CITF 2025" con Piece manual.
- C: Piece manual independiente sin Project.
- **Recomendación B**: Permite distinguir manuales por año (2025 vs futuro 2026) sin inventar datos del 2026.

## migration_map preview (NO insertado)

Total mappings propuestos: 170

| source | target |
|--------|--------|
| brands:push | entity:push |
| brands:aicore | entity:aicore |
| brands:ludica | entity:ludica |
| brands:orbita-l-b | entity:orbita-l-b |
| brands:apsmm | entity:apsmm |
| brands:citf | entity:citf |
| brands:seyier | entity:seyier |
| ui_projects:apsmm | project:apsmm |
| ui_projects:apsmm | resource:apsmm-screen-1 (project_resource) |
| ui_projects:apsmm | resource:apsmm-screen-2 (project_resource) |
| ui_projects:apsmm | resource:apsmm-screen-3 (project_resource) |
| ui_projects:aml-casinos | project:aml-casinos |
| ui_projects:aml-casinos | resource:aml-casinos-screen-1 (project_resource) |
| ui_projects:aml-general | project:aml-general |
| ui_projects:aml-general | resource:aml-general-screen-1 (project_resource) |
| ui_projects:adapto-pay | project:adapto-pay |
| ui_projects:adapto-pay | resource:adapto-pay-screen-1 (project_resource) |
| ui_projects:adapto-pay | resource:adapto-pay-screen-2 (project_resource) |
| ui_projects:adapto-pay | resource:adapto-pay-screen-3 (project_resource) |
| ui_projects:clearwater | project:clearwater |
| ui_projects:clearwater | resource:clearwater-screen-1 (project_resource) |
| ui_projects:mikrobiol | project:mikrobiol |
| ui_projects:mikrobiol | resource:mikrobiol-screen-1 (project_resource) |
| ui_projects:casiba | project:casiba |
| ui_projects:casiba | resource:casiba-screen-1 (project_resource) |
| ui_projects:proxi | project:proxi |
| ui_projects:cms-portfolio | project:cms-portfolio |
| ui_projects:cms-portfolio | resource:cms-portfolio-screen-1 (project_resource) |
| ui_projects:omnigroup | project:omnigroup |
| ui_projects:omnigroup | resource:omnigroup-screen-1 (project_resource) |
| ui_projects:omnigroup | resource:omnigroup-screen-2 (project_resource) |
| ui_projects:omnigroup | resource:omnigroup-screen-3 (project_resource) |
| ui_projects:omnigroup | resource:omnigroup-screen-4 (project_resource) |
| ui_projects:omnigroup | resource:omnigroup-screen-5 (project_resource) |
| ui_projects:omnigroup | resource:omnigroup-screen-6 (project_resource) |
| ui_projects:savil | project:savil |
| ui_projects:savil | resource:savil-screen-1 (project_resource) |
| ui_projects:savil | resource:savil-screen-2 (project_resource) |
| ui_projects:savil | resource:savil-screen-3 (project_resource) |
| ui_projects:asesor-financiero | project:asesor-financiero |
| ui_projects:asesor-financiero | resource:asesor-financiero-screen-1 (project_resource) |
| ui_projects:asesor-financiero | resource:asesor-financiero-screen-2 (project_resource) |
| ui_projects:asesor-financiero | resource:asesor-financiero-screen-3 (project_resource) |
| ui_projects:aicore-inventariado | project:aicore-inventariado |
| ui_projects:aicore-inventariado | resource:aicore-inventariado-screen-1 (project_resource) |
| graphic_items:banner-push | piece:banner-push |
| graphic_items:banner-push | resource:banner-push-src |
| graphic_items:odyssey-plant-head | piece:odyssey-plant-head |
| graphic_items:odyssey-plant-head | resource:odyssey-plant-head-src |
| graphic_items:mantis | piece:mantis |
| graphic_items:mantis | resource:mantis-src |
| graphic_items:kadaver-jez-ebel | piece:kadaver-jez-ebel |
| graphic_items:kadaver-jez-ebel | resource:kadaver-jez-ebel-src |
| graphic_items:buhoprofe | piece:buhoprofe |
| graphic_items:buhoprofe | resource:buhoprofe-src |
| graphic_items:juegos-provinciales | project:juegos-provinciales |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-cover |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-src |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-related |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-1 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-0 |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-2 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-1 |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-3 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-2 |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-4 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-3 |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-5 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-4 |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-6 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-5 |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-7 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-6 |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-8 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-7 |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-9 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-8 |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-10 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-9 |
| graphic_items:juegos-provinciales | piece:juegos-provinciales-deliverable-11 |
| graphic_items:juegos-provinciales | resource:juegos-provinciales-g-10 |
| graphic_items:seyier | project:seyier-visual-identity |
| graphic_items:seyier | piece:seyier-logo |
| graphic_items:seyier | piece:seyier-screen-1 |
| graphic_items:seyier | piece:seyier-screen-2 |
| graphic_items:seyier | piece:seyier-screen-3 |
| graphic_items:banner-cluster | piece:banner-cluster |
| graphic_items:banner-cluster | resource:banner-cluster-src |
| graphic_items:nick-tdt-beach | piece:nick-tdt-beach |
| graphic_items:nick-tdt-beach | resource:nick-tdt-beach-src |
| graphic_items:marauda-type-logo-ayala | piece:marauda-type-logo-ayala |
| graphic_items:marauda-type-logo-ayala | resource:marauda-type-logo-ayala-src |
| graphic_items:ive-no-idea | piece:ive-no-idea |
| graphic_items:ive-no-idea | resource:ive-no-idea-src |
| graphic_items:expedicion-polo | project:expedicion-polo |
| graphic_items:expedicion-polo | piece:expedicion-polo-cover |
| graphic_items:expedicion-polo | resource:expedicion-polo-src |
| graphic_items:expedicion-polo | resource:expedicion-polo-related |
| graphic_items:banana-thinking | piece:banana-thinking |
| graphic_items:banana-thinking | resource:banana-thinking-src |
| graphic_items:summit-holding | piece:summit-holding |
| graphic_items:summit-holding | resource:summit-holding-src |
| graphic_items:penguin-knife | piece:penguin-knife |
| graphic_items:penguin-knife | resource:penguin-knife-src |
| graphic_items:banner-samsung | piece:banner-samsung |
| graphic_items:banner-samsung | resource:banner-samsung-src |
| graphic_items:barely-alive | piece:barely-alive |
| graphic_items:barely-alive | resource:barely-alive-src |
| graphic_items:demon-no-scape | piece:demon-no-scape |
| graphic_items:demon-no-scape | resource:demon-no-scape-src |
| graphic_items:speeditious | piece:speeditious |
| graphic_items:speeditious | resource:speeditious-src |
| graphic_items:banner-alfaj-metro | piece:banner-alfaj-metro |
| graphic_items:banner-alfaj-metro | resource:banner-alfaj-metro-src |
| graphic_items:push | piece:push |
| graphic_items:push | resource:push-src |
| graphic_items:grime-marauda | piece:grime-marauda |
| graphic_items:grime-marauda | resource:grime-marauda-src |
| graphic_items:brigado-crew | piece:brigado-crew |
| graphic_items:brigado-crew | resource:brigado-crew-src |
| graphic_items:rockcito | piece:rockcito |
| graphic_items:rockcito | resource:rockcito-src |
| graphic_items:microtime | piece:microtime |
| graphic_items:microtime | resource:microtime-src |
| graphic_items:futulab | piece:futulab |
| graphic_items:futulab | resource:futulab-src |
| graphic_items:grime-pawn | piece:grime-pawn |
| graphic_items:grime-pawn | resource:grime-pawn-src |
| graphic_items:cover-emoji | piece:cover-emoji |
| graphic_items:cover-emoji | resource:cover-emoji-src |
| graphic_items:fablab | piece:fablab |
| graphic_items:fablab | resource:fablab-src |
| graphic_items:nicoide-not-impostor | piece:nicoide-not-impostor |
| graphic_items:nicoide-not-impostor | resource:nicoide-not-impostor-src |
| graphic_items:bass2k24 | piece:bass2k24 |
| graphic_items:bass2k24 | resource:bass2k24-src |
| graphic_items:bass2025 | piece:bass2025 |
| graphic_items:bass2025 | resource:bass2025-src |
| graphic_items:nicoide-geometry-dash | piece:nicoide-geometry-dash |
| graphic_items:nicoide-geometry-dash | resource:nicoide-geometry-dash-src |
| graphic_items:labcom | piece:labcom |
| graphic_items:labcom | resource:labcom-src |
| graphic_items:we-are-barely-world | piece:we-are-barely-world |
| graphic_items:we-are-barely-world | resource:we-are-barely-world-src |
| graphic_items:twenty-twenty-two-spotify | piece:twenty-twenty-two-spotify |
| graphic_items:twenty-twenty-two-spotify | resource:twenty-twenty-two-spotify-src |
| graphic_items:sessions | piece:sessions |
| graphic_items:sessions | resource:sessions-src |
| graphic_items:sad-machine-makenix | piece:sad-machine-makenix |
| graphic_items:sad-machine-makenix | resource:sad-machine-makenix-src |
| graphic_items:concitar | piece:concitar |
| graphic_items:concitar | resource:concitar-src |
| graphic_items:twenty-twenty-3 | piece:twenty-twenty-3 |
| graphic_items:twenty-twenty-3 | resource:twenty-twenty-3-src |
| graphic_items:apsmm | piece:apsmm |
| graphic_items:apsmm | resource:apsmm-src |
| graphic_items:bass2026 | piece:bass2026 |
| graphic_items:bass2026 | resource:bass2026-src |
| graphic_items:reggaeton | piece:reggaeton |
| graphic_items:reggaeton | resource:reggaeton-src |
| graphic_items:itf | piece:itf |
| graphic_items:itf | resource:itf-src |
| graphic_items:taily | piece:taily |
| graphic_items:taily | resource:taily-src |
| graphic_items:tdt | piece:tdt |
| graphic_items:tdt | resource:tdt-src |
| graphic_items:magic-cell | piece:magic-cell |
| graphic_items:magic-cell | resource:magic-cell-src |
| brand_manuals:citf | project:citf-manual-2025 (Recomendación B — pendiente confirmación humana) |
| brand_manuals:citf | piece:citf-manual |

## Inventario registro por registro

### brands:push
- **Título:** PUSH Software
- **Clasificación:** Entity candidata
- **Destino:** entities:push
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Decisión humana preaprobada.
- **Observaciones:**
  - type sugerido: company
  - slug sugerido: push-software
  - logo: /assets/inicio/testimonials/logos/PUSH-vector.svg
  - web: https://www.pushsoftware.com.ar/
  - relaciones legacy: 2 (named_list_items:1, testimonials:1)
  - pageEnabled sugerido: sí (solo propuesta)

### brands:aicore
- **Título:** AICORE IT Specialists
- **Clasificación:** Entity candidata
- **Destino:** entities:aicore
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Decisión humana preaprobada.
- **Observaciones:**
  - type sugerido: company
  - slug sugerido: aicore-it-specialists
  - logo: /assets/inicio/testimonials/logos/aicore-Vector.svg
  - web: https://aicore.com.ar/es
  - relaciones legacy: 2 (named_list_items:1, testimonials:1)
  - pageEnabled sugerido: sí (solo propuesta)

### brands:ludica
- **Título:** L??dica Tech
- **Clasificación:** Entity candidata
- **Destino:** entities:ludica
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Nombre/sitio sugieren empresa; requiere confirmación.
- **Observaciones:**
  - type sugerido: company
  - slug sugerido: l-dica-tech
  - logo: /assets/inicio/testimonials/logos/ludica-tech-Vector.svg
  - web: https://www.ludicatech.com.ar/
  - relaciones legacy: 2 (named_list_items:1, testimonials:1)
  - pageEnabled sugerido: sí (solo propuesta)

### brands:orbita-l-b
- **Título:** ??rbita L??B
- **Clasificación:** Entity candidata
- **Destino:** entities:orbita-l-b
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Nombre/sitio sugieren empresa; requiere confirmación.
- **Observaciones:**
  - type sugerido: company
  - slug sugerido: rbita-l-b
  - logo: /assets/inicio/testimonials/logos/orbitalab-Vector.svg
  - web: https://www.instagram.com/orbitalab.ar/
  - relaciones legacy: 2 (named_list_items:1, testimonials:1)
  - pageEnabled sugerido: sí (solo propuesta)

### brands:apsmm
- **Título:** APSMM
- **Clasificación:** Entity candidata
- **Destino:** entities:apsmm
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Nombre sugiere asociación; no hay decisión explícita registrada.
- **Observaciones:**
  - type sugerido: association
  - slug sugerido: apsmm
  - logo: /assets/grafico/logos/apsmm.png
  - web: —
  - relaciones legacy: 2 (graphic_items:1, ui_projects:1)
  - pageEnabled sugerido: no (solo propuesta)

### brands:citf
- **Título:** Cl??ster de Innovaci??n Tecnol??gica Formosa
- **Clasificación:** Entity candidata
- **Destino:** entities:citf
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Decisión humana preaprobada.
- **Observaciones:**
  - type sugerido: institution
  - slug sugerido: cl-ster-de-innovaci-n-tecnol-gica-formosa
  - logo: /assets/grafico/logos/vector-52.svg
  - web: —
  - relaciones legacy: 7 (graphic_items:5, brand_manuals:1, named_list_items:1)
  - pageEnabled sugerido: no (solo propuesta)

### brands:seyier
- **Título:** Seyier
- **Clasificación:** Entity candidata
- **Destino:** entities:seyier
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Decisión humana preaprobada.
- **Observaciones:**
  - type sugerido: personal_brand
  - slug sugerido: seyier
  - logo: /assets/grafico/logos/seyier.svg
  - web: —
  - relaciones legacy: 1 (graphic_items:1)
  - pageEnabled sugerido: no (solo propuesta)

### ui_projects:apsmm
- **Título:** Sistema de gesti??n ??? APSMM
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:apsmm
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: sistema-de-gesti-n-apsmm
  - status: completed (Sin match en named_list; default completed para sistemas entregados.)
  - type: custom-system
  - area: ux-ui
  - roles: ui
  - client: APSMM
  - brandId: apsmm
  - resources (screenshots): 3 → project_resources (NO pieces)

### ui_projects:aml-casinos
- **Título:** An??lisis contra el Lavado de Dinero en Casinos Digitales
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:aml-casinos
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: an-lisis-contra-el-lavado-de-dinero-en-casinos-digitales
  - status: completed (Sin match en named_list; default completed para sistemas entregados.)
  - type: custom-system
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: AICORE
  - brandId: —
  - resources (screenshots): 1 → project_resources (NO pieces)

### ui_projects:aml-general
- **Título:** An??lisis contra el Lavado de Dinero
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:aml-general
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: an-lisis-contra-el-lavado-de-dinero
  - status: completed (Sin match en named_list; default completed para sistemas entregados.)
  - type: custom-system
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: AICORE
  - brandId: —
  - resources (screenshots): 1 → project_resources (NO pieces)

### ui_projects:adapto-pay
- **Título:** Billetera Digital - ADAPTO PAY
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:adapto-pay
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: billetera-digital-adapto-pay
  - status: completed (Coincide con named_list_items past_project "Adapto Pay".)
  - type: presale
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: ADAPTO PAY
  - brandId: —
  - resources (screenshots): 3 → project_resources (NO pieces)

### ui_projects:clearwater
- **Título:** Generaci??n de Informes para compra e inversi??n - CLEARWATER
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:clearwater
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: generaci-n-de-informes-para-compra-e-inversi-n-clearwater
  - status: completed (Coincide con named_list_items past_project "Clearwater".)
  - type: custom-system
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: CLEARWATER
  - brandId: —
  - resources (screenshots): 1 → project_resources (NO pieces)

### ui_projects:mikrobiol
- **Título:** Tienda de Insumos Medicinales - MIKROBIOL
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:mikrobiol
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: tienda-de-insumos-medicinales-mikrobiol
  - status: completed (Sin match en named_list; default completed para sistemas entregados.)
  - type: custom-system
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: MIKROBIOL
  - brandId: —
  - resources (screenshots): 1 → project_resources (NO pieces)

### ui_projects:casiba
- **Título:** Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:casiba
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: sistema-de-gesti-n-de-unidades-de-tratamiento-de-aire-casiba
  - status: completed (Coincide con named_list_items past_project "Casiba".)
  - type: custom-system
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: CASIBA
  - brandId: —
  - resources (screenshots): 1 → project_resources (NO pieces)

### ui_projects:proxi
- **Título:** Plataforma integral de ventas y pedidos B2B - PROXI
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:proxi
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: plataforma-integral-de-ventas-y-pedidos-b2b-proxi
  - status: completed (Coincide con named_list_items past_project "proxi".)
  - type: custom-system
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: PROXI
  - brandId: —
  - resources (screenshots): 0 → project_resources (NO pieces)

### ui_projects:cms-portfolio
- **Título:** Sistema de gesti??n de contenido del portfolio
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:cms-portfolio
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: sistema-de-gesti-n-de-contenido-del-portfolio
  - status: ongoing (Categoría proyectos-personales; sin match en home lists.)
  - type: personal
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: Personal
  - brandId: —
  - resources (screenshots): 1 → project_resources (NO pieces)

### ui_projects:omnigroup
- **Título:** Omnigroup ??? backoffice y t??tem
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:omnigroup
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: omnigroup-backoffice-y-t-tem
  - status: archived (Preventa; probablemente no activa.)
  - type: presale
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: Omnigroup
  - brandId: —
  - resources (screenshots): 6 → project_resources (NO pieces)

### ui_projects:savil
- **Título:** Savil
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:savil
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: savil
  - status: completed (Sin match en named_list; default completed para sistemas entregados.)
  - type: mobile-app
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: Savil
  - brandId: —
  - resources (screenshots): 3 → project_resources (NO pieces)

### ui_projects:asesor-financiero
- **Título:** Asesor Financiero
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:asesor-financiero
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: asesor-financiero
  - status: completed (Coincide con named_list_items past_project "Asesor Financiero".)
  - type: mobile-app
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: Demo
  - brandId: —
  - resources (screenshots): 3 → project_resources (NO pieces)

### ui_projects:aicore-inventariado
- **Título:** AICORE IT Specialists ??? inventariado
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:aicore-inventariado
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: aicore-it-specialists-inventariado
  - status: archived (Preventa; probablemente no activa.)
  - type: presale
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: AICORE IT Specialists
  - brandId: —
  - resources (screenshots): 1 → project_resources (NO pieces)

### graphic_items:banner-push
- **Título:** Banner PUSH
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:banner-push
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: banners
  - tags: ["impreso"]
  - brandId: —
  - src: /assets/grafico/banners/banner-push.jpg
  - gallery count: 0
  - categoría gráfica: print
  - origin: client
  - tags propuestos: impreso

### graphic_items:odyssey-plant-head
- **Título:** Odyssey ??? plant head figure
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:odyssey-plant-head
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: illustration
  - tags: ["nsfw"]
  - brandId: —
  - src: /assets/grafico/illustration/odyssey-plant-head.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: nsfw

### graphic_items:mantis
- **Título:** Mantis by Magnetude
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:mantis
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: personal
  - tags: []
  - brandId: —
  - src: /assets/grafico/personal/mantis.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: personal
  - tags propuestos: —

### graphic_items:kadaver-jez-ebel
- **Título:** KADAVER - Jez_ebel bootleg
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:kadaver-jez-ebel
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: []
  - brandId: —
  - src: /assets/grafico/covers/kadaver-jez-ebel-bootleg.jpg
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: cover

### graphic_items:buhoprofe
- **Título:** Buho Profe
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:buhoprofe
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: []
  - brandId: —
  - src: /assets/grafico/logos/buhoprofe-1.svg
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: —

### graphic_items:juegos-provinciales
- **Título:** Juegos Provinciales Tecnol??gicos
- **Clasificación:** A. Project (+ Pieces)
- **Destino:** projects:juegos-provinciales
- **Confianza:** alta
- **Decisión humana:** sí
- **Razón:** section=eventos → candidato fuerte a Project.type=event.
- **Observaciones:**
  - section: eventos
  - tags: ["evento"]
  - brandId: —
  - src: /assets/grafico/eventos/juegos-provinciales/cover-1x1.png
  - gallery count: 11
  - categoría gráfica propuesta: campaigns-communication / Project.type=event
  - origin: client
  - section=eventos → Project.type=event (regla fuerte aprobada).
  - Galería con 11 recursos → pieces/resources, no Project por galería sola.

### graphic_items:seyier
- **Título:** Seyier
- **Clasificación:** A. Project (identidad visual)
- **Destino:** projects:seyier-visual-identity
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Seyier completo → Project de identidad visual con Pieces.
- **Observaciones:**
  - section: logos
  - brandId: seyier
  - gallery count: 3
  - Pieces propuestas: 4

### graphic_items:banner-cluster
- **Título:** Banner Cluster
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:banner-cluster
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: banners
  - tags: ["impreso"]
  - brandId: citf
  - src: /assets/grafico/banners/banner-cluster.jpg
  - gallery count: 0
  - categoría gráfica: print
  - origin: client
  - tags propuestos: impreso

### graphic_items:nick-tdt-beach
- **Título:** Nick TDT Beach
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:nick-tdt-beach
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: illustration
  - tags: ["pixel-art"]
  - brandId: —
  - src: /assets/grafico/illustration/nick-tdt-beach.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: pixel-art

### graphic_items:marauda-type-logo-ayala
- **Título:** Marauda type logo ??? Ayala
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:marauda-type-logo-ayala
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: personal
  - tags: ["vector","fan-art"]
  - brandId: —
  - src: /assets/grafico/personal/marauda-type-logo-ayala.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: personal
  - tags propuestos: vector, fan-art

### graphic_items:ive-no-idea
- **Título:** I've No Idea But I Love It
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:ive-no-idea
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: []
  - brandId: —
  - src: /assets/grafico/covers/ive-no-idea-but-i-love-it.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: cover

### graphic_items:expedicion-polo
- **Título:** EXPEDICI??N POLO
- **Clasificación:** A. Project (+ Pieces)
- **Destino:** projects:expedicion-polo
- **Confianza:** alta
- **Decisión humana:** sí
- **Razón:** section=eventos → candidato fuerte a Project.type=event.
- **Observaciones:**
  - section: eventos
  - tags: ["evento"]
  - brandId: citf
  - src: /assets/grafico/eventos/expedicion-polo/cover-1x1.png
  - gallery count: 0
  - categoría gráfica propuesta: campaigns-communication / Project.type=event
  - origin: client
  - section=eventos → Project.type=event (regla fuerte aprobada).
  - Galería con 0 recursos → pieces/resources, no Project por galería sola.

### graphic_items:banana-thinking
- **Título:** Banana thinking illustration
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:banana-thinking
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: personal
  - tags: []
  - brandId: —
  - src: /assets/grafico/personal/banana-thinking.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: personal
  - tags propuestos: —

### graphic_items:summit-holding
- **Título:** Summit Holding
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:summit-holding
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: ["vector"]
  - brandId: —
  - src: /assets/grafico/logos/summit-holding.png
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: vector

### graphic_items:penguin-knife
- **Título:** Penguin tattoo concept
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:penguin-knife
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: illustration
  - tags: ["vector","tattoo"]
  - brandId: —
  - src: /assets/grafico/illustration/penguin-knife.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: vector, tattoo

### graphic_items:banner-samsung
- **Título:** Banner Samsung
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:banner-samsung
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: banners
  - tags: ["impreso"]
  - brandId: —
  - src: /assets/grafico/banners/banner-samsung.jpg
  - gallery count: 0
  - categoría gráfica: print
  - origin: client
  - tags propuestos: impreso

### graphic_items:barely-alive
- **Título:** This Is Barely Alive '24 Update
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:barely-alive
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: []
  - brandId: —
  - src: /assets/grafico/covers/this-is-barely-alive-24-update.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: cover

### graphic_items:demon-no-scape
- **Título:** Demon illustration ??? No Scape
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:demon-no-scape
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: personal
  - tags: []
  - brandId: —
  - src: /assets/grafico/personal/demon-no-scape.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: personal
  - tags propuestos: —

### graphic_items:speeditious
- **Título:** Speeditious
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:speeditious
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: []
  - brandId: —
  - src: /assets/grafico/covers/speeditious.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: cover

### graphic_items:banner-alfaj-metro
- **Título:** Banner Alfaj / Metro
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:banner-alfaj-metro
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: banners
  - tags: ["impreso"]
  - brandId: —
  - src: /assets/grafico/banners/banner-alfaj-metro.jpg
  - gallery count: 0
  - categoría gráfica: print
  - origin: client
  - tags propuestos: impreso

### graphic_items:push
- **Título:** PUSH Software
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:push
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: []
  - brandId: —
  - src: /assets/grafico/logos/push-software.svg
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: —
  - Logo PUSH podría vincularse a Entity push o a futuro Project de identidad; mantener como Piece por ahora.

### graphic_items:grime-marauda
- **Título:** Grime ??? Marauda
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:grime-marauda
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: personal
  - tags: ["grime"]
  - brandId: —
  - src: /assets/grafico/personal/grime-marauda.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: personal
  - tags propuestos: grime

### graphic_items:brigado-crew
- **Título:** Brigado Crew / JBC
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:brigado-crew
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: banners
  - tags: ["impreso"]
  - brandId: —
  - src: /assets/grafico/banners/brigado-crew/post-instagram.png
  - gallery count: 0
  - categoría gráfica: print
  - origin: client
  - tags propuestos: impreso

### graphic_items:rockcito
- **Título:** Rockcito To Wake Up
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:rockcito
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: []
  - brandId: —
  - src: /assets/grafico/covers/rockcito-to-wake-up.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: cover

### graphic_items:microtime
- **Título:** Microtime
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:microtime
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: ["vector"]
  - brandId: —
  - src: /assets/grafico/logos/microtime.png
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: vector

### graphic_items:futulab
- **Título:** futul??b
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:futulab
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: ["vector"]
  - brandId: citf
  - src: /assets/grafico/logos/futulab.png
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: vector
  - brandId=citf (Cl??ster de Innovaci??n Tecnol??gica Formosa); considerar vincular Entity sin crear Project artificial.

### graphic_items:grime-pawn
- **Título:** Grime pawn ??? Ayala
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:grime-pawn
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: personal
  - tags: ["grime"]
  - brandId: —
  - src: /assets/grafico/personal/grime-pawn.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: personal
  - tags propuestos: grime

### graphic_items:cover-emoji
- **Título:** Cover
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:cover-emoji
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: []
  - brandId: —
  - src: /assets/grafico/covers/cover.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: cover

### graphic_items:fablab
- **Título:** FabLab
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:fablab
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: []
  - brandId: citf
  - src: /assets/grafico/logos/fab-lab.svg
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: —
  - brandId=citf (Cl??ster de Innovaci??n Tecnol??gica Formosa); considerar vincular Entity sin crear Project artificial.

### graphic_items:nicoide-not-impostor
- **Título:** Nicoide was not an Impostor
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:nicoide-not-impostor
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: personal
  - tags: ["fan-art","pixel-art"]
  - brandId: —
  - src: /assets/grafico/personal/nicoide-not-impostor.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: personal
  - tags propuestos: fan-art, pixel-art

### graphic_items:bass2k24
- **Título:** Bass2k24
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:bass2k24
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: ["bass-series"]
  - brandId: —
  - src: /assets/grafico/covers/bass-2-k24.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: bass-series, cover

### graphic_items:bass2025
- **Título:** 2025 IN BASS
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:bass2025
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: ["bass-series"]
  - brandId: —
  - src: /assets/grafico/covers/bass-2025.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: bass-series, cover

### graphic_items:nicoide-geometry-dash
- **Título:** NICOIDE ??? Geometry Dash wordmark
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:nicoide-geometry-dash
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: personal
  - tags: ["fan-art"]
  - brandId: —
  - src: /assets/grafico/personal/nicoide-geometry-dash.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: personal
  - tags propuestos: fan-art

### graphic_items:labcom
- **Título:** labcom
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:labcom
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: []
  - brandId: —
  - src: /assets/grafico/logos/labcom.svg
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: —

### graphic_items:we-are-barely-world
- **Título:** We Are Barely Alive ??? Mario world parody
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:we-are-barely-world
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: personal
  - tags: ["fan-art"]
  - brandId: —
  - src: /assets/grafico/personal/we-are-barely-world.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: personal
  - tags propuestos: fan-art

### graphic_items:twenty-twenty-two-spotify
- **Título:** Twenty Twenty Two
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:twenty-twenty-two-spotify
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: ["bass-series"]
  - brandId: —
  - src: /assets/grafico/covers/twenty-twenty-two-spotify.jpg
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: bass-series, cover

### graphic_items:sessions
- **Título:** sessions
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:sessions
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: []
  - brandId: —
  - src: /assets/grafico/logos/sessions.svg
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: —

### graphic_items:sad-machine-makenix
- **Título:** Sad Machine - Makenix Remix
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:sad-machine-makenix
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: personal
  - tags: ["fan-art"]
  - brandId: —
  - src: /assets/grafico/personal/sad-machine-makenix-remix.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: personal
  - tags propuestos: fan-art

### graphic_items:concitar
- **Título:** CONCITAR
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:concitar
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: []
  - brandId: —
  - src: /assets/grafico/logos/concitar.svg
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: —

### graphic_items:twenty-twenty-3
- **Título:** Twenty Twenty 3
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:twenty-twenty-3
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: ["bass-series"]
  - brandId: —
  - src: /assets/grafico/covers/twenty-twenty-3.jpg
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: bass-series, cover

### graphic_items:apsmm
- **Título:** Asociaci??n de Profesionales de Salud de la Marina Mercante
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:apsmm
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: []
  - brandId: apsmm
  - src: /assets/grafico/logos/apsmm.png
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: —
  - brandId=apsmm (APSMM); considerar vincular Entity sin crear Project artificial.

### graphic_items:bass2026
- **Título:** BASS 2026
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:bass2026
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: ["bass-series"]
  - brandId: —
  - src: /assets/grafico/covers/bass-2026.jpg
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: bass-series, cover

### graphic_items:reggaeton
- **Título:** Reggaeton Rukistrukis
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:reggaeton
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: covers
  - tags: []
  - brandId: —
  - src: /assets/grafico/covers/reggaeton-rukistrukis-1.png
  - gallery count: 0
  - categoría gráfica: illustration-artwork
  - origin: other
  - tags propuestos: cover

### graphic_items:itf
- **Título:** ITF Cluster
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:itf
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: []
  - brandId: citf
  - src: /assets/grafico/logos/vector-52.svg
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: —
  - brandId=citf (Cl??ster de Innovaci??n Tecnol??gica Formosa); considerar vincular Entity sin crear Project artificial.

### graphic_items:taily
- **Título:** Taily
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:taily
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: []
  - brandId: —
  - src: /assets/grafico/logos/taily.svg
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: —

### graphic_items:tdt
- **Título:** TDT ??? The Dream Team
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:tdt
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: ["vector"]
  - brandId: —
  - src: /assets/grafico/logos/tdt-isotype.svg
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: vector

### graphic_items:magic-cell
- **Título:** MAGIC CELL
- **Clasificación:** B. Piece sin Project
- **Destino:** pieces:magic-cell
- **Confianza:** media
- **Decisión humana:** no
- **Razón:** Entregable aislado sin hub de proyecto profesional.
- **Observaciones:**
  - section: logos
  - tags: ["vector"]
  - brandId: —
  - src: /assets/grafico/logos/magic-cell.svg
  - gallery count: 0
  - categoría gráfica: visual-identity
  - origin: client
  - tags propuestos: vector

### brand_manuals:citf
- **Título:** Manual de Marca 2025 CITF
- **Clasificación:** Piece manual (alternativas A/B/C)
- **Destino:** projects:citf-manual-2025
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Permite distinguir manuales por año (2025 vs futuro 2026) sin inventar datos del 2026.
- **Observaciones:**
  - A: Piece (category=manual) dentro de Project de identidad CITF existente (p.ej. itf logo / cluster).
  - B: Project nuevo de identidad "Manual de Marca CITF 2025" con Piece manual.
  - C: Piece manual independiente sin Project.

## Decisiones humanas necesarias

- Entity "??rbita L??B" (orbita-l-b): confirmar type=company
- Entity "APSMM" (apsmm): confirmar type=association
- Entity "L??dica Tech" (ludica): confirmar type=company
- Relación Billetera Digital - ADAPTO PAY ↔ ADAPTO PAY: rol client (ui_projects.client="ADAPTO PAY" (cliente final))
- Relación Billetera Digital - ADAPTO PAY ↔ AICORE IT Specialists: rol collaborator (Colaboraci??n con @aicore - noviembre 2024)
- Relación EXPEDICI??N POLO ↔ Cl??ster de Innovaci??n Tecnol??gica Formosa: rol client (graphic_items.brandId=citf)
- Relación Generaci??n de Informes para compra e inversi??n - CLEARWATER ↔ AICORE IT Specialists: rol collaborator (Colaboraci??n con @aicore - enero 2024)
- Relación Generaci??n de Informes para compra e inversi??n - CLEARWATER ↔ CLEARWATER: rol client (ui_projects.client="CLEARWATER" (cliente final))
- Relación Juegos Provinciales Tecnol??gicos ↔ Gobierno de Formosa: rol client (Campa??a de difusi??n para el Gobierno de Formosa: gaming, rob??tica y m??sica en vivo. Polo Cient??fico, Tecnol??gico y de Innovaci??n ?? 21 de junio.)
- Relación Omnigroup ??? backoffice y t??tem ↔ Omnigroup: rol client (ui_projects.client="Omnigroup")
- Relación Plataforma integral de ventas y pedidos B2B - PROXI ↔ AICORE IT Specialists: rol collaborator (Colaboraci??n con @aicore - enero 2024)
- Relación Plataforma integral de ventas y pedidos B2B - PROXI ↔ PROXI: rol client (ui_projects.client="PROXI" (cliente final))
- Relación Savil ↔ Savil: rol client (ui_projects.client="Savil")
- Relación Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA ↔ AICORE IT Specialists: rol collaborator (Colaboraci??n con @aicore - septiembre 2024)
- Relación Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA ↔ CASIBA: rol client (ui_projects.client="CASIBA" (cliente final))
- Relación Tienda de Insumos Medicinales - MIKROBIOL ↔ AICORE IT Specialists: rol collaborator (Colaboraci??n con @aicore - octubre 2024)
- Relación Tienda de Insumos Medicinales - MIKROBIOL ↔ MIKROBIOL: rol client (ui_projects.client="MIKROBIOL" (cliente final))
- brand_manual citf: elegir alternativa B (Permite distinguir manuales por año (2025 vs futuro 2026) sin inventar datos del 2026.)
- brand_manuals:citf — Manual de Marca 2025 CITF: Permite distinguir manuales por año (2025 vs futuro 2026) sin inventar datos del 2026.
- brands:apsmm — APSMM: Nombre sugiere asociación; no hay decisión explícita registrada.
- brands:ludica — L??dica Tech: Nombre/sitio sugieren empresa; requiere confirmación.
- brands:orbita-l-b — ??rbita L??B: Nombre/sitio sugieren empresa; requiere confirmación.
- graphic_items:apsmm — Asociaci??n de Profesionales de Salud de la Marina Mercante: Entregable aislado sin hub de proyecto profesional.
- graphic_items:expedicion-polo — EXPEDICI??N POLO: section=eventos → candidato fuerte a Project.type=event.
- graphic_items:fablab — FabLab: Entregable aislado sin hub de proyecto profesional.
- graphic_items:futulab — futul??b: Entregable aislado sin hub de proyecto profesional.
- graphic_items:itf — ITF Cluster: Entregable aislado sin hub de proyecto profesional.
- graphic_items:juegos-provinciales — Juegos Provinciales Tecnol??gicos: section=eventos → candidato fuerte a Project.type=event.
- graphic_items:push — PUSH Software: Entregable aislado sin hub de proyecto profesional.
- named_list_items #10 "Instituto de Asistencia Social": Organización solo en home list; no está en brands.
- named_list_items #11 "Labcom": Organización solo en home list; no está en brands.
- named_list_items #13 "Ministerio de Economia, Hacienda y Finanzas": Organización solo en home list; no está en brands.
- named_list_items #16 "Red de Clubes Digitales": Organización solo en home list; no está en brands.
- named_list_items #17 "Secretar??a de Ciencia y Tecnolog??a de Formosa": Organización solo en home list; no está en brands.
- named_list_items #18 "Subsecretar??a de Empleo de Formosa": Organización solo en home list; no está en brands.
- named_list_items #19 "Adapto Pay": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #2 "Asociaci??n de Profesionales de Salud de la Marina Mercante": Organización solo en home list; no está en brands.
- named_list_items #21 "[deferred-confidential]": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #22 "Casiba": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #23 "Clearwater": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #24 "Cloronor": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #26 "fiserv.": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #27 "[deferred-confidential]": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #29 "La Estaci??n": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #3 "bind": Organización solo en home list; no está en brands.
- named_list_items #30 "Mental Tech Training": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #31 "omni group": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #32 "proxi": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #33 "SIMAAS": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #34 "Templeton & Matthews": Proyecto anterior en home sin fuente legacy directa.
- named_list_items #35 "Concitar": Proyecto actual en home sin registro ui/graphic equivalente.
- named_list_items #36 "MICROTIME": Proyecto actual en home sin registro ui/graphic equivalente.
- named_list_items #37 "Repuestos Carlitos": Proyecto actual en home sin registro ui/graphic equivalente.
- named_list_items #38 "Sessions": Proyecto actual en home sin registro ui/graphic equivalente.
- named_list_items #39 "Syllabi": Proyecto actual en home sin registro ui/graphic equivalente.
- named_list_items #4 "Cloronor": Organización solo en home list; no está en brands.
- named_list_items #40 "Taily": Proyecto actual en home sin registro ui/graphic equivalente.
- named_list_items #6 "Empresa Provincial de Innovaci??n y Conocimiento Abierto": Organización solo en home list; no está en brands.
- named_list_items #7 "FabLab": Organización solo en home list; no está en brands.
- named_list_items #8 "FISERV.": Organización solo en home list; no está en brands.
- named_list_items #9 "Gobierno de Formosa": Organización solo en home list; no está en brands.
- ui_projects:adapto-pay — Billetera Digital - ADAPTO PAY: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:aicore-inventariado — AICORE IT Specialists ??? inventariado: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:aml-casinos — An??lisis contra el Lavado de Dinero en Casinos Digitales: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:aml-general — An??lisis contra el Lavado de Dinero: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:asesor-financiero — Asesor Financiero: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:casiba — Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:clearwater — Generaci??n de Informes para compra e inversi??n - CLEARWATER: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:cms-portfolio — Sistema de gesti??n de contenido del portfolio: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:mikrobiol — Tienda de Insumos Medicinales - MIKROBIOL: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:omnigroup — Omnigroup ??? backoffice y t??tem: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:proxi — Plataforma integral de ventas y pedidos B2B - PROXI: ui_projects son candidatos fuertes a Project con area ux-ui.
- ui_projects:savil — Savil: ui_projects son candidatos fuertes a Project con area ux-ui.
