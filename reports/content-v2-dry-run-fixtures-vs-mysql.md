# Content V2 — Dry Run Fixtures vs MySQL

Generado: 2026-08-13T21:41:22.943Z
Fixtures report: 2026-08-13T10:11:32.467Z
MySQL report: 2026-08-13T21:41:22.926Z

## A. Resumen de conteos

| Métrica | Fixtures | MySQL |
|---------|--------:|------:|
| proposedEntities | 7 | 7 |
| proposedProjects | 16 | 16 |
| standalonePieces | 44 | 44 |
| piecesInProjects | 17 | 17 |
| projectResources | 25 | 25 |
| pieceResources | 63 | 63 |

## B. proposedEntities (por id)

- Mismos: 7
- Solo fixtures: —
- Solo MySQL: —

## C. proposedProjects (por id)

- Mismos: 16
- Solo fixtures: —
- Solo MySQL: —

## D. Pieces y recursos

- standalonePieces: fixtures=44, mysql=44
  - solo fixtures: —
  - solo MySQL: —
- piecesInProjects: fixtures=17, mysql=17
  - solo fixtures: —
  - solo MySQL: —

## E. Decisiones humanas y clasificación

### humanDecisions
- Solo en fixtures: `Entity "Lúdica Tech" (ludica): confirmar type=company`, `Entity "Órbita LΔB" (orbita-l-b): confirmar type=company`, `Relación Billetera Digital - ADAPTO PAY ↔ AICORE IT Specialists: rol collaborator (Colaboración con @aicore - noviembre 2024)`, `Relación EXPEDICIÓN POLO ↔ Clúster de Innovación Tecnológica Formosa: rol client (graphic_items.brandId=citf)`, `Relación Generación de Informes para compra e inversión - CLEARWATER ↔ AICORE IT Specialists: rol collaborator (Colaboración con @aicore - enero 2024)`, `Relación Generación de Informes para compra e inversión - CLEARWATER ↔ CLEARWATER: rol client (ui_projects.client="CLEARWATER" (cliente final))`, `Relación Juegos Provinciales Tecnológicos ↔ Gobierno de Formosa: rol client (Campaña de difusión para el Gobierno de Formosa: gaming, robótica y música en vivo. Polo Científico, Tecnológico y de Innovación · 21 de junio.)`, `Relación Omnigroup — backoffice y tótem ↔ Omnigroup: rol client (ui_projects.client="Omnigroup")`, `Relación Plataforma integral de ventas y pedidos B2B - PROXI ↔ AICORE IT Specialists: rol collaborator (Colaboración con @aicore - enero 2024)`, `Relación Sistema de Gestión de Unidades de Tratamiento de Aire - CASIBA ↔ AICORE IT Specialists: rol collaborator (Colaboración con @aicore - septiembre 2024)`, `Relación Sistema de Gestión de Unidades de Tratamiento de Aire - CASIBA ↔ CASIBA: rol client (ui_projects.client="CASIBA" (cliente final))`, `Relación Tienda de Insumos Medicinales - MIKROBIOL ↔ AICORE IT Specialists: rol collaborator (Colaboración con @aicore - octubre 2024)`, `brands:ludica — Lúdica Tech: Nombre/sitio sugieren empresa; requiere confirmación.`, `brands:orbita-l-b — Órbita LΔB: Nombre/sitio sugieren empresa; requiere confirmación.`, `graphic_items:apsmm — Asociación de Profesionales de Salud de la Marina Mercante: Entregable aislado sin hub de proyecto profesional.`, `graphic_items:expedicion-polo — EXPEDICIÓN POLO: section=eventos → candidato fuerte a Project.type=event.`, `graphic_items:futulab — futulΔb: Entregable aislado sin hub de proyecto profesional.`, `graphic_items:juegos-provinciales — Juegos Provinciales Tecnológicos: section=eventos → candidato fuerte a Project.type=event.`, `named_list_items #17 "Secretaría de Ciencia y Tecnología de Formosa": Organización solo en home list; no está en brands.`, `named_list_items #18 "Subsecretaría de Empleo de Formosa": Organización solo en home list; no está en brands.`, `named_list_items #2 "Asociación de Profesionales de Salud de la Marina Mercante": Organización solo en home list; no está en brands.`, `named_list_items #29 "La Estación": Proyecto anterior en home sin fuente legacy directa.`, `named_list_items #6 "Empresa Provincial de Innovación y Conocimiento Abierto": Organización solo en home list; no está en brands.`, `ui_projects:aicore-inventariado — AICORE IT Specialists — inventariado: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:aml-casinos — Análisis contra el Lavado de Dinero en Casinos Digitales: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:aml-general — Análisis contra el Lavado de Dinero: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:casiba — Sistema de Gestión de Unidades de Tratamiento de Aire - CASIBA: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:clearwater — Generación de Informes para compra e inversión - CLEARWATER: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:cms-portfolio — Sistema de gestión de contenido del portfolio: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:omnigroup — Omnigroup — backoffice y tótem: ui_projects son candidatos fuertes a Project con area ux-ui.`
- Solo en MySQL: `Entity "??rbita L??B" (orbita-l-b): confirmar type=company`, `Entity "L??dica Tech" (ludica): confirmar type=company`, `Relación Billetera Digital - ADAPTO PAY ↔ AICORE IT Specialists: rol collaborator (Colaboraci??n con @aicore - noviembre 2024)`, `Relación EXPEDICI??N POLO ↔ Cl??ster de Innovaci??n Tecnol??gica Formosa: rol client (graphic_items.brandId=citf)`, `Relación Generaci??n de Informes para compra e inversi??n - CLEARWATER ↔ AICORE IT Specialists: rol collaborator (Colaboraci??n con @aicore - enero 2024)`, `Relación Generaci??n de Informes para compra e inversi??n - CLEARWATER ↔ CLEARWATER: rol client (ui_projects.client="CLEARWATER" (cliente final))`, `Relación Juegos Provinciales Tecnol??gicos ↔ Gobierno de Formosa: rol client (Campa??a de difusi??n para el Gobierno de Formosa: gaming, rob??tica y m??sica en vivo. Polo Cient??fico, Tecnol??gico y de Innovaci??n ?? 21 de junio.)`, `Relación Omnigroup ??? backoffice y t??tem ↔ Omnigroup: rol client (ui_projects.client="Omnigroup")`, `Relación Plataforma integral de ventas y pedidos B2B - PROXI ↔ AICORE IT Specialists: rol collaborator (Colaboraci??n con @aicore - enero 2024)`, `Relación Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA ↔ AICORE IT Specialists: rol collaborator (Colaboraci??n con @aicore - septiembre 2024)`, `Relación Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA ↔ CASIBA: rol client (ui_projects.client="CASIBA" (cliente final))`, `Relación Tienda de Insumos Medicinales - MIKROBIOL ↔ AICORE IT Specialists: rol collaborator (Colaboraci??n con @aicore - octubre 2024)`, `brands:ludica — L??dica Tech: Nombre/sitio sugieren empresa; requiere confirmación.`, `brands:orbita-l-b — ??rbita L??B: Nombre/sitio sugieren empresa; requiere confirmación.`, `graphic_items:apsmm — Asociaci??n de Profesionales de Salud de la Marina Mercante: Entregable aislado sin hub de proyecto profesional.`, `graphic_items:expedicion-polo — EXPEDICI??N POLO: section=eventos → candidato fuerte a Project.type=event.`, `graphic_items:futulab — futul??b: Entregable aislado sin hub de proyecto profesional.`, `graphic_items:juegos-provinciales — Juegos Provinciales Tecnol??gicos: section=eventos → candidato fuerte a Project.type=event.`, `named_list_items #17 "Secretar??a de Ciencia y Tecnolog??a de Formosa": Organización solo en home list; no está en brands.`, `named_list_items #18 "Subsecretar??a de Empleo de Formosa": Organización solo en home list; no está en brands.`, `named_list_items #2 "Asociaci??n de Profesionales de Salud de la Marina Mercante": Organización solo en home list; no está en brands.`, `named_list_items #29 "La Estaci??n": Proyecto anterior en home sin fuente legacy directa.`, `named_list_items #6 "Empresa Provincial de Innovaci??n y Conocimiento Abierto": Organización solo en home list; no está en brands.`, `ui_projects:aicore-inventariado — AICORE IT Specialists ??? inventariado: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:aml-casinos — An??lisis contra el Lavado de Dinero en Casinos Digitales: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:aml-general — An??lisis contra el Lavado de Dinero: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:casiba — Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:clearwater — Generaci??n de Informes para compra e inversi??n - CLEARWATER: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:cms-portfolio — Sistema de gesti??n de contenido del portfolio: ui_projects son candidatos fuertes a Project con area ux-ui.`, `ui_projects:omnigroup — Omnigroup ??? backoffice y t??tem: ui_projects son candidatos fuertes a Project con area ux-ui.`

### classificationDiffs (0)
_Sin diferencias de clasificación en claves compartidas._
