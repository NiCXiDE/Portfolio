# Content Model V2 — Dry Run Report

Generado: 2026-08-15T04:51:43.117Z
Modo: **dry-run** (read-only, sin writes en V2)
Source: **mysql**

## Resumen ejecutivo

| Métrica | Valor |
|---------|------:|
| Proposed Entities | 33 |
| Proposed Projects | 31 |
| Standalone Pieces | 30 |
| Pieces en Projects | 18 |
| Proposed piece_entities | 17 |
| ProjectResources | 26 |
| PieceResources | 62 |
| Lanes AUTO / MANUAL / DEFERRED / DISCARDED | 0 / 112 / 14 / 10 |
| Confianza alta / media / baja | 30 / 38 / 0 |
| Notas del manifesto (aplicadas) | 143 |

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
testimonials: 5
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
piece_entities: 0 → 0
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
- pageEnabled sugerido: sí — Decisión humana (pageEnabled=true).
- confianza: alta
- decisión humana: no

### AICORE IT Specialists (`aicore`)
- type: **company** (known)
- slug: `aicore-it-specialists`
- relaciones legacy: 2
- pageEnabled sugerido: sí — Decisión humana (pageEnabled=true).
- confianza: alta
- decisión humana: no

### Clúster de Innovación Tecnológica Formosa (`citf`)
- type: **institution** (known)
- slug: `cluster-de-innovacion-tecnologica-formosa`
- relaciones legacy: 7
- pageEnabled sugerido: sí — Decisión humana (pageEnabled=true).
- confianza: alta
- decisión humana: no

### Seyier (`seyier`)
- type: **personal_brand** (known)
- slug: `seyier`
- relaciones legacy: 1
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### APSMM (`apsmm`)
- type: **association** (known)
- slug: `apsmm`
- relaciones legacy: 2
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Lúdica Tech (`ludica`)
- type: **company** (known)
- slug: `ludica-tech`
- relaciones legacy: 2
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Órbita LΔB (`orbita-l-b`)
- type: **company** (known)
- slug: `orbita-l-b`
- relaciones legacy: 2
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### ADAPTO PAY (`adapto-pay`)
- type: **company** (known)
- slug: `adapto-pay`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### CLEARWATER (`clearwater`)
- type: **company** (known)
- slug: `clearwater`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### MIKROBIOL (`mikrobiol`)
- type: **company** (known)
- slug: `mikrobiol`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### CASIBA (`casiba`)
- type: **company** (known)
- slug: `casiba`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### PROXI (`proxi`)
- type: **company** (known)
- slug: `proxi`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Omnigroup (`omnigroup`)
- type: **company** (known)
- slug: `omnigroup`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Savil (`savil`)
- type: **company** (known)
- slug: `savil`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Cliente confidencial Inventariado (`confidential-inventariado-client`)
- type: **other** (known)
- slug: `cliente-confidencial-inventariado`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Cliente confidencial AML (`confidential-aml-client`)
- type: **other** (known)
- slug: `cliente-confidencial-aml`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Cliente privado Asesor Financiero (`confidential-asesor-client`)
- type: **person** (known)
- slug: `cliente-privado-asesor-financiero`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Cliente privado Sessions (`confidential-sessions-client`)
- type: **other** (known)
- slug: `cliente-privado-sessions`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Cliente confidencial Logística (`confidential-logistics-client`)
- type: **other** (known)
- slug: `cliente-confidencial-logistica`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Futulab (`futulab`)
- type: **company** (known)
- slug: `futulab`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Summit Holding (`summit-holding`)
- type: **other** (known)
- slug: `summit-holding`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Magic Cell (`magic-cell`)
- type: **company** (known)
- slug: `magic-cell`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Brigado Crew (`brigado-crew`)
- type: **other** (known)
- slug: `brigado-crew`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Templeton & Mathews (`templeton-mathews`)
- type: **company** (known)
- slug: `templeton-mathews`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Repuestos Carlitos (`repuestos-carlitos`)
- type: **company** (known)
- slug: `repuestos-carlitos`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### La Estación (`la-estacion`)
- type: **company** (known)
- slug: `la-estacion`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### EPICA (`epica`)
- type: **company** (known)
- slug: `epica`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Gobierno de Formosa (`gobierno-formosa`)
- type: **institution** (known)
- slug: `gobierno-de-formosa`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Instituto de Asistencia Social (`instituto-asistencia-social`)
- type: **institution** (known)
- slug: `instituto-de-asistencia-social`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Red de Clubes Digitales (`red-clubes-digitales`)
- type: **organization** (known)
- slug: `red-de-clubes-digitales`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Secretaría de Ciencia y Tecnología de Formosa (`secretaria-cyt-formosa`)
- type: **institution** (known)
- slug: `secretaria-de-ciencia-y-tecnologia-de-formosa`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Subsecretaría de Empleo de Formosa (`subsecretaria-empleo-formosa`)
- type: **institution** (known)
- slug: `subsecretaria-de-empleo-de-formosa`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

### Cloronor (`cloronor`)
- type: **company** (known)
- slug: `cloronor`
- relaciones legacy: 0
- pageEnabled sugerido: no — Decisión humana (pageEnabled=false).
- confianza: alta
- decisión humana: no

## Proposed Projects

### AICORE IT Specialists — inventariado (`aicore-inventariado`)
- slug: `aicore-it-specialists-inventariado`
- areas: ux-ui
- type: custom-system
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui, visual-direction
- fuentes: ui_projects:sha256:ab7c1f3f5c8db8e3760f874bceaef8e76980f030240c973880b6616ef85a9846
- pieces: 0 | resources: 1
- confianza: alta
- entities:
  - AICORE IT Specialists → **employer** (alta)
  - Cliente confidencial Inventariado → **client** (alta)

### Análisis contra el Lavado de Dinero (`aml-general`)
- slug: `analisis-contra-el-lavado-de-dinero`
- areas: ux-ui
- type: custom-system
- status: completed
- context: client-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:aml-general
- pieces: 0 | resources: 1
- confianza: alta
- entities:
  - AICORE IT Specialists → **employer** (alta)
  - Cliente confidencial AML → **client** (alta)

### Análisis contra el Lavado de Dinero en Casinos Digitales (`aml-casinos`)
- slug: `analisis-contra-el-lavado-de-dinero-en-casinos-digitales`
- areas: ux-ui
- type: custom-system
- status: completed
- context: client-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:aml-casinos
- pieces: 0 | resources: 1
- confianza: alta
- entities:
  - AICORE IT Specialists → **employer** (alta)
  - Cliente confidencial AML → **client** (alta)

### Billetera Digital - ADAPTO PAY (`adapto-pay`)
- slug: `billetera-digital-adapto-pay`
- areas: ux-ui
- type: mobile-app
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:adapto-pay
- pieces: 0 | resources: 3
- confianza: alta
- entities:
  - ADAPTO PAY → **client** (alta)
  - AICORE IT Specialists → **employer** (alta)

### Generación de Informes para compra e inversión - CLEARWATER (`clearwater`)
- slug: `generacion-de-informes-para-compra-e-inversion-clearwater`
- areas: ux-ui
- type: custom-system
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:clearwater
- pieces: 0 | resources: 1
- confianza: alta
- entities:
  - CLEARWATER → **client** (alta)
  - AICORE IT Specialists → **employer** (alta)

### Tienda de Insumos Medicinales - MIKROBIOL (`mikrobiol`)
- slug: `tienda-de-insumos-medicinales-mikrobiol`
- areas: ux-ui
- type: web-app
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:mikrobiol
- pieces: 0 | resources: 1
- confianza: alta
- entities:
  - MIKROBIOL → **client** (alta)
  - AICORE IT Specialists → **employer** (alta)

### Sistema de Gestión de Unidades de Tratamiento de Aire - CASIBA (`casiba`)
- slug: `sistema-de-gestion-de-unidades-de-tratamiento-de-aire-casiba`
- areas: ux-ui
- type: custom-system
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:casiba
- pieces: 0 | resources: 1
- confianza: alta
- entities:
  - CASIBA → **client** (alta)
  - AICORE IT Specialists → **employer** (alta)

### Plataforma integral de ventas y pedidos B2B - PROXI (`proxi`)
- slug: `plataforma-integral-de-ventas-y-pedidos-b2b-proxi`
- areas: ux-ui
- type: custom-system
- status: completed
- context: presale
- published: no
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:proxi
- pieces: 0 | resources: 0
- confianza: alta
- entities:
  - PROXI → **client** (alta)
  - AICORE IT Specialists → **employer** (alta)

### Sistema de gestión — APSMM (`apsmm`)
- slug: `sistema-de-gestion-apsmm`
- areas: ux-ui, graphic
- type: custom-system
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui, graphic-design
- fuentes: ui_projects:apsmm, graphic_items:apsmm
- pieces: 1 | resources: 3
- confianza: alta
- entities:
  - APSMM → **client** (alta)
  - PUSH Software → **employer** (alta)

### Omnigroup — backoffice y tótem (`omnigroup`)
- slug: `omnigroup-backoffice-y-totem`
- areas: ux-ui
- type: custom-system
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:omnigroup
- pieces: 0 | resources: 6
- confianza: alta
- entities:
  - Omnigroup → **client** (alta)
  - AICORE IT Specialists → **employer** (alta)

### Savil (`savil`)
- slug: `savil`
- areas: ux-ui
- type: mobile-app
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:savil
- pieces: 0 | resources: 3
- confianza: alta
- entities:
  - Savil → **client** (alta)

### Asesor Financiero (`asesor-financiero`)
- slug: `asesor-financiero`
- areas: ux-ui
- type: mobile-app
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:sha256:904f5aa089bb1e02e8400f56db2437ef53d331dee115a391d144839aa77c202e
- pieces: 0 | resources: 3
- confianza: alta
- entities:
  - Cliente privado Asesor Financiero → **client** (alta)

### Sistema de gestión de contenido del portfolio (`cms-portfolio`)
- slug: `sistema-de-gestion-de-contenido-del-portfolio`
- areas: ux-ui
- type: custom-system
- status: ongoing
- context: personal
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_projects:cms-portfolio
- pieces: 0 | resources: 1
- confianza: alta

### EXPEDICIÓN POLO (`expedicion-polo`)
- slug: `expedicion-polo`
- areas: graphic
- type: event
- status: completed
- context: client-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: graphic-design, visual-direction
- fuentes: graphic_items:expedicion-polo
- pieces: 1 | resources: 0
- confianza: alta
- entities:
  - Clúster de Innovación Tecnológica Formosa → **responsible** (alta)

### Juegos Provinciales Tecnológicos (`juegos-provinciales`)
- slug: `juegos-provinciales-tecnologicos`
- areas: graphic
- type: event
- status: completed
- context: client-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: graphic-design, visual-direction
- fuentes: graphic_items:juegos-provinciales
- pieces: 1 | resources: 0
- confianza: alta
- entities:
  - Gobierno de Formosa → **client** (alta)

### Identidad visual CITF 2025 (`citf-identity-2025`)
- slug: `identidad-visual-citf-2025`
- areas: graphic
- type: branding
- status: completed
- context: client-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: branding, graphic-design, visual-direction
- fuentes: graphic_items:itf, graphic_items:banner-cluster, brand_manuals:citf
- pieces: 2 | resources: 0
- confianza: alta
- entities:
  - Clúster de Innovación Tecnológica Formosa → **brand-owner** (alta)

### Identidad visual Seyier (`seyier-visual-identity`)
- slug: `identidad-visual-seyier`
- areas: graphic
- type: branding
- status: completed
- context: other
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: branding, graphic-design, visual-direction
- fuentes: graphic_items:seyier
- pieces: 1 | resources: 0
- confianza: alta
- entities:
  - Seyier → **brand-owner** (alta)

### Identidad visual PUSH (`push-visual-identity`)
- slug: `identidad-visual-push`
- areas: graphic
- type: branding
- status: ongoing
- context: internal-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: branding, graphic-design, visual-direction
- fuentes: graphic_items:push, graphic_items:banner-push
- pieces: 2 | resources: 0
- confianza: alta
- entities:
  - PUSH Software → **brand-owner** (alta)

### Identidad visual Futulab (`futulab-visual-identity`)
- slug: `identidad-visual-futulab`
- areas: graphic
- type: branding
- status: ongoing
- context: client-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: branding, graphic-design, visual-direction
- fuentes: graphic_items:futulab
- pieces: 1 | resources: 0
- confianza: alta
- entities:
  - Futulab → **brand-owner** (alta)

### Bass Series (`bass-series`)
- slug: `bass-series`
- areas: graphic
- type: other
- status: ongoing
- context: personal
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: graphic-design
- fuentes: graphic_items:twenty-twenty-two-spotify, graphic_items:twenty-twenty-3, graphic_items:bass2k24, graphic_items:bass2025, graphic_items:bass2026
- pieces: 5 | resources: 0
- confianza: alta

### Syllabi (`syllabi`)
- slug: `syllabi`
- areas: ux-ui
- type: web-app
- status: completed
- context: other
- published: no
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: named_list_items:syllabi
- pieces: 0 | resources: 1
- confianza: alta

### MICROTIME (`microtime`)
- slug: `microtime`
- areas: ux-ui, graphic
- type: custom-system
- status: ongoing
- context: internal-work
- published: no
- lane: MANUAL_DECISION_MIGRATED
- roles: ui, graphic-design
- fuentes: named_list_items:microtime, graphic_items:microtime
- pieces: 1 | resources: 0
- confianza: alta
- entities:
  - PUSH Software → **employer** (alta)

### Sessions (`sessions`)
- slug: `sessions`
- areas: ux-ui, graphic
- type: custom-system
- status: completed
- context: client-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui, graphic-design
- fuentes: named_list_items:sessions, graphic_items:sessions
- pieces: 1 | resources: 0
- confianza: alta
- entities:
  - PUSH Software → **employer** (alta)
  - Cliente privado Sessions → **client** (alta)

### Concitar (`concitar`)
- slug: `concitar`
- areas: ux-ui, graphic
- type: web-app
- status: completed
- context: internal-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui, graphic-design
- fuentes: named_list_items:concitar, graphic_items:concitar
- pieces: 1 | resources: 0
- confianza: alta
- entities:
  - PUSH Software → **employer** (alta)

### Taily (`taily`)
- slug: `taily`
- areas: ux-ui, graphic
- type: mobile-app
- status: ongoing
- context: internal-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui, graphic-design
- fuentes: named_list_items:taily, graphic_items:taily
- pieces: 1 | resources: 0
- confianza: alta
- entities:
  - PUSH Software → **employer** (alta)

### Marketplace de Frutas y Verduras (`simaas-marketplace`)
- slug: `marketplace-de-frutas-y-verduras`
- areas: ux-ui
- type: web-app
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_list_items:simaas
- pieces: 0 | resources: 0
- confianza: alta
- entities:
  - Órbita LΔB → **intermediary** (alta)

### Sistema de Autodiagnóstico Transformación Digital (`templeton-digital-transformation-assessment`)
- slug: `sistema-de-autodiagnostico-transformacion-digital`
- areas: ux-ui
- type: custom-system
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_list_items:templeton
- pieces: 0 | resources: 0
- confianza: alta
- entities:
  - Templeton & Mathews → **client** (alta)
  - AICORE IT Specialists → **intermediary** (alta)

### Sistema de logística (confidencial) (`confidential-logistics-system`)
- slug: `sistema-de-logistica-confidencial`
- areas: ux-ui
- type: custom-system
- status: completed
- context: client-work
- published: no
- lane: MANUAL_DECISION_MIGRATED
- roles: 
- fuentes: ui_projects:sha256:d17f3254ce9d0ac30defba16843c78525410304a91d5df7c634d90a3f6a21b75
- pieces: 0 | resources: 0
- confianza: alta
- entities:
  - AICORE IT Specialists → **employer** (alta)
  - Cliente confidencial Logística → **client** (alta)

### Landing & Tienda - Repuestos Carlitos (`repuestos-carlitos`)
- slug: `landing-tienda-repuestos-carlitos`
- areas: ux-ui, graphic
- type: web-app
- status: completed
- context: client-work
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui, graphic-design
- fuentes: ui_list_items:carlitos
- pieces: 0 | resources: 0
- confianza: alta
- entities:
  - PUSH Software → **employer** (alta)
  - Repuestos Carlitos → **client** (alta)

### Mental Training Tech 24.5 (`mental-training-tech-24-5`)
- slug: `mental-training-tech-24-5`
- areas: ux-ui
- type: mobile-app
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: 
- fuentes: named_list_items:mental-training-tech-24-5
- pieces: 0 | resources: 0
- confianza: alta
- entities:
  - AICORE IT Specialists → **employer** (alta)

### Cloronor — Plataforma de inversión (`cloronor-trading`)
- slug: `cloronor-plataforma-de-inversion`
- areas: ux-ui
- type: web-app
- status: completed
- context: presale
- published: sí
- lane: MANUAL_DECISION_MIGRATED
- roles: ux, ui
- fuentes: ui_list_items:cloronor-trading
- pieces: 0 | resources: 0
- confianza: alta
- entities:
  - Cloronor → **client** (alta)
  - AICORE IT Specialists → **intermediary** (alta)

## Standalone Pieces

| ID | Título | Categoría | Origin | Tags | Conf |
|----|--------|-----------|--------|------|------|
| fablab | FabLab | visual-identity | client |  | alta |
| labcom | labcom | visual-identity | client |  | alta |
| summit-holding | Summit Holding | visual-identity | client | vector | alta |
| magic-cell | MAGIC CELL | visual-identity | client | vector | alta |
| brigado-crew | Brigado Crew / JBC | campaigns-communication | client | impreso | alta |
| banner-samsung | Banner Samsung | print | client | impreso | alta |
| banner-alfaj-metro | Banner Alfaj / Metro | print | client | impreso | alta |
| tdt | TDT — The Dream Team | visual-identity | personal | tdt, vector | alta |
| nick-tdt-beach | Nick TDT Beach | illustration-artwork | personal | tdt, pixel-art | alta |
| mantis | Mantis by Magnetude | illustration-artwork | personal |  | alta |
| marauda-type-logo-ayala | Marauda type logo — Ayala | illustration-artwork | personal | vector, fan-art | alta |
| banana-thinking | Banana thinking illustration | illustration-artwork | personal |  | alta |
| demon-no-scape | Demon illustration — No Scape | illustration-artwork | personal |  | alta |
| grime-marauda | Grime — Marauda | illustration-artwork | personal | grime | alta |
| grime-pawn | Grime pawn — Ayala | illustration-artwork | personal | grime | alta |
| nicoide-not-impostor | Nicoide was not an Impostor | illustration-artwork | personal | fan-art, pixel-art | alta |
| nicoide-geometry-dash | NICOIDE — Geometry Dash wordmark | illustration-artwork | personal | fan-art | alta |
| we-are-barely-world | We Are Barely Alive — Mario world parody | illustration-artwork | personal | fan-art | alta |
| sad-machine-makenix | Sad Machine - Makenix Remix | illustration-artwork | personal | fan-art | alta |
| kadaver-jez-ebel | KADAVER - Jez_ebel bootleg | illustration-artwork | personal | fan-art, cover | alta |
| ive-no-idea | I've No Idea But I Love It | illustration-artwork | personal | fan-art, cover | alta |
| barely-alive | This Is Barely Alive '24 Update | illustration-artwork | personal | fan-art, cover | alta |
| speeditious | Speeditious | illustration-artwork | personal | cover | alta |
| rockcito | Rockcito To Wake Up | illustration-artwork | personal | cover | alta |
| cover-emoji | Cover | illustration-artwork | personal | cover | alta |
| reggaeton | Reggaeton Rukistrukis | illustration-artwork | personal | cover | alta |
| odyssey-plant-head | Odyssey — plant head figure | illustration-artwork | personal | nsfw | alta |
| penguin-knife | Penguin tattoo concept | illustration-artwork | personal | vector, tattoo | alta |
| maxi-boo | maxi-boo | illustration-artwork | personal | fan-art | alta |
| ux-and-x | ux-and-x | illustration-artwork | personal |  | alta |

## Proposed piece_entities

| pieceId | entityId | entityName | role | primary | sort |
|---------|----------|------------|------|---------|------|
| fablab | citf | Clúster de Innovación Tecnológica Formosa | responsible | sí | 0 |
| labcom | citf | Clúster de Innovación Tecnológica Formosa | responsible | sí | 0 |
| summit-holding | summit-holding | Summit Holding | brand-owner | sí | 0 |
| magic-cell | magic-cell | Magic Cell | brand-owner | sí | 0 |
| brigado-crew | brigado-crew | Brigado Crew | brand-owner | sí | 0 |
| banner-samsung | citf | Clúster de Innovación Tecnológica Formosa | responsible | sí | 0 |
| banner-samsung | red-clubes-digitales | Red de Clubes Digitales | other | no | 1 |
| banner-alfaj-metro | citf | Clúster de Innovación Tecnológica Formosa | responsible | sí | 0 |
| itf | citf | Clúster de Innovación Tecnológica Formosa | brand-owner | sí | 0 |
| banner-cluster | citf | Clúster de Innovación Tecnológica Formosa | brand-owner | sí | 0 |
| push | push | PUSH Software | brand-owner | sí | 0 |
| banner-push | push | PUSH Software | brand-owner | sí | 0 |
| futulab | futulab | Futulab | brand-owner | sí | 0 |
| apsmm | apsmm | APSMM | client | sí | 0 |
| seyier | seyier | Seyier | brand-owner | sí | 0 |
| expedicion-polo | citf | Clúster de Innovación Tecnológica Formosa | responsible | sí | 0 |
| juegos-provinciales | gobierno-formosa | Gobierno de Formosa | client | sí | 0 |

## Project ↔ Entity relationships requiring review

_Ninguna relación marcada para revisión._

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
| 35 | current_project | Concitar | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 1 | company | AICORE IT Specialists | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 19 | past_project | Adapto Pay | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 2 | company | Asociación de Profesionales de Salud de la Marina Mercante | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 36 | current_project | MICROTIME | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 20 | past_project | Asesor Financiero | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 21 | past_project | [deferred-confidential] | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 37 | current_project | Repuestos Carlitos | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 3 | company | bind | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 38 | current_project | Sessions | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 4 | company | Cloronor | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 22 | past_project | Casiba | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 39 | current_project | Syllabi | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 5 | company | Clúster de Innovación Tecnológica Formosa | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 23 | past_project | Clearwater | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 40 | current_project | Taily | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 24 | past_project | Cloronor | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 6 | company | Empresa Provincial de Innovación y Conocimiento Abierto | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 25 | past_project | EXPEDICIÓN POLO | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 7 | company | FabLab | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 8 | company | [deferred] | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 26 | past_project | [deferred] | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 27 | past_project | [deferred-confidential] | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 9 | company | Gobierno de Formosa | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 10 | company | Instituto de Asistencia Social | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 28 | past_project | Juegos Provinciales Tecnológicos | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 29 | past_project | La Estación | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 11 | company | Labcom | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 30 | past_project | Mental Tech Training | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 12 | company | Lúdica Tech | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 31 | past_project | omni group | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 13 | company | Ministerio de Economia, Hacienda y Finanzas | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 32 | past_project | proxi | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 14 | company | Órbita LΔB | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 33 | past_project | SIMAAS | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 15 | company | PUSH Software | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 16 | company | Red de Clubes Digitales | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 34 | past_project | Templeton & Matthews | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 17 | company | Secretaría de Ciencia y Tecnología de Formosa | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |
| 18 | company | Subsecretaría de Empleo de Formosa | home_text_only | DISCARDED:named_list_runtime | Entity/Project.showOnHome |

## Testimonials

### Barberis Facundo (`facundo`)
- entity propuesta: push (PUSH Software)
- redundante tras link: company_brand_id (reemplazado por entity_id); company_name (si coincide con Entity.name)
- conservar override: company_logo_path — override si difiere del logo Entity; company_href — override de URL pública

### Yas Silveira (`yas`)
- entity propuesta: — (—)
- redundante tras link: —
- conservar override: —

### Maranga Ezequiel (`ezequiel`)
- entity propuesta: aicore (AICORE IT Specialists)
- redundante tras link: company_brand_id (reemplazado por entity_id); company_name (si coincide con Entity.name)
- conservar override: company_logo_path — override si difiere del logo Entity; company_href — override de URL pública

### Amarilla Joaquín (`joaquin`)
- entity propuesta: ludica (Lúdica Tech)
- redundante tras link: company_brand_id (reemplazado por entity_id); company_name (si coincide con Entity.name)
- conservar override: company_logo_path — override si difiere del logo Entity; company_href — override de URL pública

### Mendoza Matías (`matias`)
- entity propuesta: orbita-l-b (Órbita LΔB)
- redundante tras link: company_brand_id (reemplazado por entity_id); company_name (si coincide con Entity.name)
- conservar override: company_logo_path — override si difiere del logo Entity; company_href — override de URL pública

## brand_manuals

### Manual de Marca 2025 CITF
- A: Piece (category=manual) dentro de Project de identidad CITF existente (p.ej. itf logo / cluster).
- B: Project nuevo de identidad "Manual de Marca CITF 2025" con Piece manual.
- C: Piece manual independiente sin Project.
- **Recomendación B**: Permite distinguir manuales por año (2025 vs futuro 2026) sin inventar datos del 2026.

## Deferred

- `yas` (other): **testimonial:yas entity mapping** — Nuevo testimonial post-freeze (yas); entity mapping pendiente de decisión humana — no inventar link
- `cloronor-landing` (project): **Cloronor landing** — Landing Cloronor pendiente de modelado; trading ya en manifest
- `sha256:de76f827893389a0a02cdf1a3322100c0c474b28ffe203e2fa8eaab0150487b8` (project): **[deferred-confidential]** — Fuente confidencial deferred; no crear Entity/Project público
- `sha256:98fe442255035a1459bb5b86fda03d7c34c23d512b1b5bf3a5ecb7a802601895` (project): **[deferred-confidential]** — Fuente confidencial deferred; no crear Entity/Project público
- `fiserv` (entity): **[deferred]** — Entity vs Project ambiguo hasta confirmación humana
- `microtime-published` (published): **Microtime published** — published=false temporal hasta autorización
- `proxi-published` (published): **Proxi published** — published=false hasta revisión contractual
- `syllabi-published` (published): **Syllabi published** — published=false hasta autorización de publicación
- `microtime-ux-role` (role): **Microtime UX role** — Rol UX pendiente; no inferir
- `juegos-client-validation` (validation): **Juegos Provinciales client** — Relación Gobierno de Formosa → client es provisional; validar en Admin
- `second-simaas` (project): **Segundo SIMAAS (eventos/foros)** — No crear segundo Project SIMAAS aún
- `simaas-aicore-later` (relation): **SIMAAS ↔ AICORE** — No modelar AICORE en SIMAAS en esta etapa
- `orbita-case-by-case` (relation): **Órbita relations** — Relaciones Órbita case-by-case; no resolver client automáticamente
- `logistics-personal-roles` (role): **Confidential logistics UX/UI roles** — Roles personales no inferir; dejar vacío hasta decisión

## Discarded

- `bind` (entity): **bind** — No migrar Entity; label home sin decisión de entidad
- `ministerio-economia` (home_label): **Ministerio de Economia, Hacienda y Finanzas** — No migrar Entity ni label como entidad estructural
- `cloronor-store` (project): **Cloronor store** — No crear Project store; trading migrado aparte; landing diferida
- `named-list-runtime` (named_list): **named_list runtime Home** — named_list_items DEPRECATED post-cutover; Home = Entity/Project.showOnHome + published + status
- `entity-labcom` (entity): **Labcom** — Piece standalone → CITF via piece_entities; no Entity Labcom
- `entity-fablab` (entity): **FabLab** — Piece standalone → CITF; no Entity ni Project FabLab
- `entity-nsxide` (entity): **NSXIDE** — Alias/tag de Bass Series; no Entity
- `buhoprofe-branding-authorship` (authorship): **buhoprofe branding** — No Piece de branding del usuario; solo ProjectResource contextual de Syllabi
- `invent-citf-2026` (invention): **Identidad / manual CITF 2026** — No inventar identidad 2026
- `invent-push-2027` (invention): **Manual / identidad PUSH 2027** — No inventar identidad futura

## migration_map preview (NO insertado)

Total mappings propuestos: 125

| source | target |
|--------|--------|
| brands:push | entity:push |
| brands:aicore | entity:aicore |
| brands:citf | entity:citf |
| brands:seyier | entity:seyier |
| brands:apsmm | entity:apsmm |
| brands:ludica | entity:ludica |
| brands:orbita-l-b | entity:orbita-l-b |
| decision_manifest:adapto-pay | entity:adapto-pay |
| decision_manifest:clearwater | entity:clearwater |
| decision_manifest:mikrobiol | entity:mikrobiol |
| decision_manifest:casiba | entity:casiba |
| decision_manifest:proxi | entity:proxi |
| decision_manifest:omnigroup | entity:omnigroup |
| decision_manifest:savil | entity:savil |
| decision_manifest:confidential-inventariado-client | entity:confidential-inventariado-client (source_id fingerprint avoids accidental plaintext; not a cryptographic secret store) |
| decision_manifest:confidential-aml-client | entity:confidential-aml-client (source_id fingerprint avoids accidental plaintext; not a cryptographic secret store) |
| decision_manifest:confidential-asesor-client | entity:confidential-asesor-client (source_id fingerprint avoids accidental plaintext; not a cryptographic secret store) |
| decision_manifest:confidential-sessions-client | entity:confidential-sessions-client (source_id fingerprint avoids accidental plaintext; not a cryptographic secret store) |
| decision_manifest:confidential-logistics-client | entity:confidential-logistics-client (source_id fingerprint avoids accidental plaintext; not a cryptographic secret store) |
| decision_manifest:futulab | entity:futulab |
| decision_manifest:summit-holding | entity:summit-holding |
| decision_manifest:magic-cell | entity:magic-cell |
| decision_manifest:brigado-crew | entity:brigado-crew |
| decision_manifest:templeton-mathews | entity:templeton-mathews |
| decision_manifest:repuestos-carlitos | entity:repuestos-carlitos |
| decision_manifest:la-estacion | entity:la-estacion |
| decision_manifest:epica | entity:epica |
| decision_manifest:gobierno-formosa | entity:gobierno-formosa |
| decision_manifest:instituto-asistencia-social | entity:instituto-asistencia-social |
| decision_manifest:red-clubes-digitales | entity:red-clubes-digitales |
| decision_manifest:secretaria-cyt-formosa | entity:secretaria-cyt-formosa |
| decision_manifest:subsecretaria-empleo-formosa | entity:subsecretaria-empleo-formosa |
| decision_manifest:cloronor | entity:cloronor |
| ui_projects:sha256:ab7c1f3f5c8db8e3760f874bceaef8e76980f030240c973880b6616ef85a9846 | project:aicore-inventariado (source_id fingerprint avoids accidental plaintext; not a cryptographic secret store) |
| ui_projects:aml-general | project:aml-general |
| ui_projects:aml-casinos | project:aml-casinos |
| ui_projects:adapto-pay | project:adapto-pay |
| ui_projects:clearwater | project:clearwater |
| ui_projects:mikrobiol | project:mikrobiol |
| ui_projects:casiba | project:casiba |
| ui_projects:proxi | project:proxi |
| ui_projects:apsmm | project:apsmm |
| graphic_items:apsmm | project:apsmm |
| ui_projects:omnigroup | project:omnigroup |
| ui_projects:savil | project:savil |
| ui_projects:sha256:904f5aa089bb1e02e8400f56db2437ef53d331dee115a391d144839aa77c202e | project:asesor-financiero (source_id fingerprint avoids accidental plaintext; not a cryptographic secret store) |
| ui_projects:cms-portfolio | project:cms-portfolio |
| graphic_items:expedicion-polo | project:expedicion-polo |
| graphic_items:juegos-provinciales | project:juegos-provinciales |
| graphic_items:itf | project:citf-identity-2025 |
| graphic_items:banner-cluster | project:citf-identity-2025 |
| brand_manuals:citf | project:citf-identity-2025 |
| graphic_items:seyier | project:seyier-visual-identity |
| graphic_items:push | project:push-visual-identity |
| graphic_items:banner-push | project:push-visual-identity |
| graphic_items:futulab | project:futulab-visual-identity |
| graphic_items:twenty-twenty-two-spotify | project:bass-series |
| graphic_items:twenty-twenty-3 | project:bass-series |
| graphic_items:bass2k24 | project:bass-series |
| graphic_items:bass2025 | project:bass-series |
| graphic_items:bass2026 | project:bass-series |
| named_list_items:syllabi | project:syllabi |
| named_list_items:microtime | project:microtime |
| graphic_items:microtime | project:microtime |
| named_list_items:sessions | project:sessions |
| graphic_items:sessions | project:sessions |
| named_list_items:concitar | project:concitar |
| graphic_items:concitar | project:concitar |
| named_list_items:taily | project:taily |
| graphic_items:taily | project:taily |
| ui_list_items:simaas | project:simaas-marketplace |
| ui_list_items:templeton | project:templeton-digital-transformation-assessment |
| ui_projects:sha256:d17f3254ce9d0ac30defba16843c78525410304a91d5df7c634d90a3f6a21b75 | project:confidential-logistics-system (source_id fingerprint avoids accidental plaintext; not a cryptographic secret store) |
| ui_list_items:carlitos | project:repuestos-carlitos |
| named_list_items:mental-training-tech-24-5 | project:mental-training-tech-24-5 |
| ui_list_items:cloronor-trading | project:cloronor-trading |
| graphic_items:fablab | piece:fablab (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:labcom | piece:labcom (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:summit-holding | piece:summit-holding (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:magic-cell | piece:magic-cell (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:brigado-crew | piece:brigado-crew (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:banner-samsung | piece:banner-samsung (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:banner-alfaj-metro | piece:banner-alfaj-metro (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:tdt | piece:tdt (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:nick-tdt-beach | piece:nick-tdt-beach (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:mantis | piece:mantis (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:marauda-type-logo-ayala | piece:marauda-type-logo-ayala (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:banana-thinking | piece:banana-thinking (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:demon-no-scape | piece:demon-no-scape (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:grime-marauda | piece:grime-marauda (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:grime-pawn | piece:grime-pawn (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:nicoide-not-impostor | piece:nicoide-not-impostor (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:nicoide-geometry-dash | piece:nicoide-geometry-dash (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:we-are-barely-world | piece:we-are-barely-world (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:sad-machine-makenix | piece:sad-machine-makenix (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:kadaver-jez-ebel | piece:kadaver-jez-ebel (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:ive-no-idea | piece:ive-no-idea (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:barely-alive | piece:barely-alive (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:speeditious | piece:speeditious (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:rockcito | piece:rockcito (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:cover-emoji | piece:cover-emoji (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:reggaeton | piece:reggaeton (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:odyssey-plant-head | piece:odyssey-plant-head (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:penguin-knife | piece:penguin-knife (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:maxi-boo | piece:maxi-boo (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:ux-and-x | piece:ux-and-x (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:itf | piece:itf (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:banner-cluster | piece:banner-cluster (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:push | piece:push (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:banner-push | piece:banner-push (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:futulab | piece:futulab (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:apsmm | piece:apsmm (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:seyier | piece:seyier (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:expedicion-polo | piece:expedicion-polo (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:juegos-provinciales | piece:juegos-provinciales (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:microtime | piece:microtime (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:sessions | piece:sessions (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:concitar | piece:concitar (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:taily | piece:taily (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:twenty-twenty-two-spotify | piece:twenty-twenty-two-spotify (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:twenty-twenty-3 | piece:twenty-twenty-3 (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:bass2k24 | piece:bass2k24 (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:bass2025 | piece:bass2025 (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:bass2026 | piece:bass2026 (lane=MANUAL_DECISION_MIGRATED) |
| graphic_items:buhoprofe | resource:buhoprofe-project-resource (asProjectResourceOnly → syllabi; contextual asset, not branding authorship) |

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
- **Título:** Lúdica Tech
- **Clasificación:** Entity candidata
- **Destino:** entities:ludica
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Nombre/sitio sugieren empresa; requiere confirmación.
- **Observaciones:**
  - type sugerido: company
  - slug sugerido: ludica-tech
  - logo: /assets/inicio/testimonials/logos/ludica-tech-Vector.svg
  - web: https://www.ludicatech.com.ar/
  - relaciones legacy: 2 (named_list_items:1, testimonials:1)
  - pageEnabled sugerido: sí (solo propuesta)

### brands:orbita-l-b
- **Título:** Órbita LΔB
- **Clasificación:** Entity candidata
- **Destino:** entities:orbita-l-b
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** Nombre/sitio sugieren empresa; requiere confirmación.
- **Observaciones:**
  - type sugerido: company
  - slug sugerido: orbita-l-b
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
- **Título:** Clúster de Innovación Tecnológica Formosa
- **Clasificación:** Entity candidata
- **Destino:** entities:citf
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** Decisión humana preaprobada.
- **Observaciones:**
  - type sugerido: institution
  - slug sugerido: cluster-de-innovacion-tecnologica-formosa
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
- **Título:** Sistema de gestión — APSMM
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:apsmm
- **Confianza:** alta
- **Decisión humana:** no
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: sistema-de-gestion-apsmm
  - status: completed (Sin match en named_list; default completed para sistemas entregados.)
  - type: custom-system
  - area: ux-ui
  - roles: ui
  - client: APSMM
  - brandId: apsmm
  - resources (screenshots): 3 → project_resources (NO pieces)

### ui_projects:aml-casinos
- **Título:** Análisis contra el Lavado de Dinero en Casinos Digitales
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:aml-casinos
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: analisis-contra-el-lavado-de-dinero-en-casinos-digitales
  - status: completed (Sin match en named_list; default completed para sistemas entregados.)
  - type: custom-system
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: AICORE
  - brandId: —
  - resources (screenshots): 1 → project_resources (NO pieces)

### ui_projects:aml-general
- **Título:** Análisis contra el Lavado de Dinero
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:aml-general
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: analisis-contra-el-lavado-de-dinero
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
- **Título:** Generación de Informes para compra e inversión - CLEARWATER
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:clearwater
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: generacion-de-informes-para-compra-e-inversion-clearwater
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
- **Título:** Sistema de Gestión de Unidades de Tratamiento de Aire - CASIBA
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:casiba
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: sistema-de-gestion-de-unidades-de-tratamiento-de-aire-casiba
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
- **Título:** Sistema de gestión de contenido del portfolio
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:cms-portfolio
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: sistema-de-gestion-de-contenido-del-portfolio
  - status: ongoing (Categoría proyectos-personales; sin match en home lists.)
  - type: personal
  - area: ux-ui
  - roles: PENDIENTE DE REVISIÓN
  - client: Personal
  - brandId: —
  - resources (screenshots): 1 → project_resources (NO pieces)

### ui_projects:omnigroup
- **Título:** Omnigroup — backoffice y tótem
- **Clasificación:** Project (ux-ui)
- **Destino:** projects:omnigroup
- **Confianza:** media
- **Decisión humana:** sí
- **Razón:** ui_projects son candidatos fuertes a Project con area ux-ui.
- **Observaciones:**
  - slug: omnigroup-backoffice-y-totem
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
- **Título:** AICORE IT Specialists — inventariado
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
- **Título:** Odyssey — plant head figure
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
- **Título:** Juegos Provinciales Tecnológicos
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
- **Título:** Marauda type logo — Ayala
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
- **Título:** EXPEDICIÓN POLO
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
- **Título:** Demon illustration — No Scape
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
- **Título:** Grime — Marauda
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
- **Título:** futulΔb
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
  - brandId=citf (Clúster de Innovación Tecnológica Formosa); considerar vincular Entity sin crear Project artificial.

### graphic_items:grime-pawn
- **Título:** Grime pawn — Ayala
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
  - brandId=citf (Clúster de Innovación Tecnológica Formosa); considerar vincular Entity sin crear Project artificial.

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
- **Título:** NICOIDE — Geometry Dash wordmark
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
- **Título:** We Are Barely Alive — Mario world parody
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
- **Título:** Asociación de Profesionales de Salud de la Marina Mercante
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
  - brandId=citf (Clúster de Innovación Tecnológica Formosa); considerar vincular Entity sin crear Project artificial.

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
- **Título:** TDT — The Dream Team
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

## Decisiones humanas (notas del manifesto aplicado)

- MANUAL entity push
- MANUAL entity aicore
- MANUAL entity citf
- MANUAL entity seyier
- MANUAL entity apsmm
- MANUAL entity ludica
- MANUAL entity orbita-l-b
- MANUAL entity adapto-pay
- MANUAL entity clearwater
- MANUAL entity mikrobiol
- MANUAL entity casiba
- MANUAL entity proxi
- MANUAL entity omnigroup
- MANUAL entity savil
- MANUAL entity confidential-inventariado-client
- MANUAL entity confidential-aml-client
- MANUAL entity confidential-asesor-client
- MANUAL entity confidential-sessions-client
- MANUAL entity confidential-logistics-client
- MANUAL entity futulab
- MANUAL entity summit-holding
- MANUAL entity magic-cell
- MANUAL entity brigado-crew
- MANUAL entity templeton-mathews
- MANUAL entity repuestos-carlitos
- MANUAL entity la-estacion
- MANUAL entity epica
- MANUAL entity gobierno-formosa
- MANUAL entity instituto-asistencia-social
- MANUAL entity red-clubes-digitales
- MANUAL entity secretaria-cyt-formosa
- MANUAL entity subsecretaria-empleo-formosa
- MANUAL entity cloronor
- MANUAL piece itf
- MANUAL piece banner-cluster
- MANUAL piece push
- MANUAL piece banner-push
- MANUAL piece futulab
- MANUAL piece apsmm
- MANUAL piece seyier
- MANUAL piece expedicion-polo
- MANUAL piece juegos-provinciales
- MANUAL piece microtime
- MANUAL piece sessions
- MANUAL piece concitar
- MANUAL piece taily
- MANUAL piece twenty-twenty-two-spotify
- MANUAL piece twenty-twenty-3
- MANUAL piece bass2k24
- MANUAL piece bass2025
- MANUAL piece bass2026
- MANUAL piece fablab
- MANUAL piece labcom
- MANUAL piece summit-holding
- MANUAL piece magic-cell
- MANUAL piece brigado-crew
- MANUAL piece banner-samsung
- MANUAL piece banner-alfaj-metro
- MANUAL piece tdt
- MANUAL piece nick-tdt-beach
- MANUAL piece mantis
- MANUAL piece marauda-type-logo-ayala
- MANUAL piece banana-thinking
- MANUAL piece demon-no-scape
- MANUAL piece grime-marauda
- MANUAL piece grime-pawn
- MANUAL piece nicoide-not-impostor
- MANUAL piece nicoide-geometry-dash
- MANUAL piece we-are-barely-world
- MANUAL piece sad-machine-makenix
- MANUAL piece kadaver-jez-ebel
- MANUAL piece ive-no-idea
- MANUAL piece barely-alive
- MANUAL piece speeditious
- MANUAL piece rockcito
- MANUAL piece cover-emoji
- MANUAL piece reggaeton
- MANUAL piece odyssey-plant-head
- MANUAL piece penguin-knife
- MANUAL piece maxi-boo
- MANUAL piece ux-and-x
- DISCARDED piece buhoprofe (resource-only → project_resource on syllabi)
- MANUAL project aicore-inventariado (confidential)
- MANUAL project aml-general (confidential)
- MANUAL project aml-casinos (confidential)
- MANUAL project adapto-pay
- MANUAL project clearwater
- MANUAL project mikrobiol
- MANUAL project casiba
- MANUAL project proxi
- MANUAL project apsmm
- MANUAL project omnigroup
- MANUAL project savil
- MANUAL project asesor-financiero (confidential)
- MANUAL project cms-portfolio
- MANUAL project expedicion-polo
- MANUAL project juegos-provinciales
- MANUAL project citf-identity-2025
- MANUAL project seyier-visual-identity
- MANUAL project push-visual-identity
- MANUAL project futulab-visual-identity
- MANUAL project bass-series
- MANUAL project syllabi
- MANUAL project microtime
- MANUAL project sessions (confidential)
- MANUAL project concitar
- MANUAL project taily
- MANUAL project simaas-marketplace
- MANUAL project templeton-digital-transformation-assessment
- MANUAL project confidential-logistics-system (confidential)
- MANUAL project repuestos-carlitos
- MANUAL project mental-training-tech-24-5
- MANUAL project cloronor-trading
- DISCARDED bind
- DISCARDED ministerio-economia
- DISCARDED cloronor-store
- DISCARDED named-list-runtime
- DISCARDED entity-labcom
- DISCARDED entity-fablab
- DISCARDED entity-nsxide
- DISCARDED buhoprofe-branding-authorship
- DISCARDED invent-citf-2026
- DISCARDED invent-push-2027
- DEFERRED yas
- DEFERRED cloronor-landing
- DEFERRED [deferred-confidential:sha256:de76f827893]
- DEFERRED [deferred-confidential:sha256:98fe4422550]
- DEFERRED [deferred:[deferred]-label]
- DEFERRED microtime-published
- DEFERRED proxi-published
- DEFERRED syllabi-published
- DEFERRED microtime-ux-role
- DEFERRED juegos-client-validation
- DEFERRED second-simaas
- DEFERRED simaas-aicore-later
- DEFERRED orbita-case-by-case
- DEFERRED logistics-personal-roles
- RESOURCE_ONLY piece buhoprofe → project syllabi
- source_id fingerprint avoids accidental plaintext; not a cryptographic secret store
- MANUAL testimonial facundo → push
- MANUAL testimonial ezequiel → aicore
- MANUAL testimonial joaquin → ludica
- MANUAL testimonial matias → orbita-l-b
