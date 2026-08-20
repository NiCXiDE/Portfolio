# Interfaces V2 Decision Matrix — Phase 4E.0B

**Status:** READ-ONLY COMPLETE  
**Date:** 2026-08-19  
**Database:** `portfolio` LIVE (sin writes)  
**Complementa:** `reports/runtime-v2-interfaces-audit-4e0.md`

---

## Corrección 4E.0 — `proxi`

En 4E.0, `proxi` quedó etiquetado como **PRIVACY_EXCLUDED** y también como **unpublished expected**. Eso mezclaba dos ejes distintos.

| Eje | Estado real LIVE |
|-----|------------------|
| **`published` (V2)** | **`false`** → UNPUBLISHED_EXPECTED |
| **`confidential` (manifest)** | **`false`** — no es proyecto confidencial |
| **Motivo unpublished** | Decisión deferred contractual (`proxi-published` en manifest) |
| **Legacy Interfaces** | **Sí** — `ui_projects.proxi` sigue `published=true`, pero **`images: []`** (sin galería) |
| **Home V2** | **No** |

**Conclusión:** `proxi` **no** pertenece al bucket CONFIDENTIAL_PUBLISHED. En 4E.0B:

- Mapping legacy→V2: **UNPUBLISHED_IN_V2** (legacy aún listado, V2 lo excluye por `published=false`)
- **No** requiere exclusion list de confidenciales — `isPublicProject()` ya lo filtra

---

## 1. Tabla privacy/published reconciliada

### A. CONFIDENTIAL_PUBLISHED (4) — `published=true` + `confidential` en manifest

Estos **sí** requieren decisión humana antes del runtime: hoy legacy los muestra; V2 debería ocultarlos.

| id | title ES | title EN | published | status | context | type | areas | client Entity | client.visible | confidential manifest | legacy Interfaces | Home V2 |
|----|----------|----------|-----------|--------|---------|------|-------|---------------|----------------|----------------------|-------------------|---------|
| `aicore-inventariado` | AICORE IT Specialists — inventariado | (same) | true | completed | presale | custom-system | ux-ui | confidential-inventariado-client | **false** | **yes** | **yes** | no |
| `aml-casinos` | Análisis contra el Lavado de Dinero en Casinos Digitales | Anti-Money Laundering… | true | completed | client-work | custom-system | ux-ui | confidential-aml-client | **false** | **yes** | **yes** | no |
| `aml-general` | Análisis contra el Lavado de Dinero | Anti-Money Laundering Analysis | true | completed | client-work | custom-system | ux-ui | confidential-aml-client | **false** | **yes** | **yes** | no |
| `asesor-financiero` | Asesor Financiero | Financial Advisor | true | completed | presale | mobile-app | ux-ui | confidential-asesor-client | **false** | **yes** | **yes** | no |

**Señales estructurales comunes:** client entity `confidential-*`, `visible=false`. Títulos sensibles (AML, inventariado, asesor).

**Nota:** `sessions` también es confidential + published, pero **no** está en legacy `ui_projects` — solo V2/Home/Graphic. Interfaces legacy no lo lista hoy.

### B. UNPUBLISHED_EXPECTED (4) — `published=false` en V2

| id | title ES | published | status | context | type | confidential | legacy Interfaces | Home V2 | Notas |
|----|----------|-----------|--------|---------|------|--------------|-------------------|---------|-------|
| `proxi` | Plataforma B2B - PROXI | **false** | completed | presale | custom-system | no | **yes** (sin imágenes) | no | contractual deferred |
| `confidential-logistics-system` | Sistema de logística (confidencial) | false | completed | client-work | custom-system | **yes** | no | no | nunca en legacy UI |
| `microtime` | MICROTIME | false | ongoing | internal-work | custom-system | no | no | no | ux-ui + graphic |
| `syllabi` | Syllabi | false | completed | other | web-app | no | no | no | 1 resource (logo buhoprofe) |

**Ninguno requiere blacklist adicional** — `isPublicProject()` los excluye.

---

## 2. Lista exacta — 15 public-safe Interfaces V2

Criterio: `area=ux-ui` + `published=true` + `status≠archived` + **no** `confidential` en manifest.

Orden propuesto para listing (categoría legacy → título ES):

| # | id | título ES | type | context | status | areas | main visual | resources | ui_project | ui_list |
|---|-----|-----------|------|---------|--------|-------|-------------|-----------|------------|---------|
| 1 | `apsmm` | Sistema de gestión — APSMM | custom-system | presale | completed | ux-ui, graphic | apsmm-01.png | **3** | yes | — |
| 2 | `casiba` | Sistema CASIBA | custom-system | presale | completed | ux-ui | casiba-01.png | 1 | yes | — |
| 3 | `clearwater` | CLEARWATER informes | custom-system | presale | completed | ux-ui | clearwater-01.png | 1 | yes | — |
| 4 | `mikrobiol` | MIKROBIOL tienda | web-app | presale | completed | ux-ui | mikrobiol-01.png | 1 | yes | — |
| 5 | `cloronor-trading` | Cloronor — Plataforma de inversión | web-app | presale | completed | ux-ui | logo PNG (list) | **0** | — | cloronor-trading |
| 6 | `adapto-pay` | Billetera Digital - ADAPTO PAY | mobile-app | presale | completed | ux-ui | adapto-pay-01.png | **3** | yes | — |
| 7 | `omnigroup` | Omnigroup — backoffice y tótem | custom-system | presale | completed | ux-ui | web-admin.png | **6** | yes | — |
| 8 | `mental-training-tech-24-5` | Mental Training Tech 24.5 | mobile-app | presale | completed | ux-ui | — | **0** | — | — |
| 9 | `templeton-digital-transformation-assessment` | Autodiagnóstico Transformación Digital | custom-system | presale | completed | ux-ui | wordmark only | **0** | — | templeton |
| 10 | `savil` | Savil | mobile-app | presale | completed | ux-ui | app-login.png | **3** | yes | — |
| 11 | `simaas-marketplace` | Marketplace de Frutas y Verduras | web-app | presale | completed | ux-ui | vector-2.svg (list) | **0** | — | simaas |
| 12 | `concitar` | Concitar | web-app | internal-work | completed | ux-ui, graphic | — | **0** | — | — |
| 13 | `taily` | Taily | mobile-app | ongoing | internal-work | ux-ui, graphic | — | **0** | — | — |
| 14 | `repuestos-carlitos` | Landing & Tienda - Repuestos Carlitos | web-app | client-work | completed | ux-ui, graphic | — | **0** | — | carlitos |
| 15 | `cms-portfolio` | CMS del portfolio | custom-system | personal | ongoing | ux-ui | cms-portfolio-01.png | 1 | yes | — |

**Corrección vs 4E.0:** son **7** (no 8) los public-safe **sin** `project_resources`.

---

## 3. Siete Projects sin resources — auditoría visual

| id | A. Legacy visual | B. Assets disk | C. Clasificación |
|----|------------------|----------------|------------------|
| `cloronor-trading` | ui_list: logo `/assets/interfaces/projects/logclor-2019-logo.png` | logo **exists** | **COVER_ONLY_AVAILABLE** |
| `simaas-marketplace` | ui_list: logo `/assets/interfaces/brand/vector-2.svg` | svg **exists** | **COVER_ONLY_AVAILABLE** |
| `templeton-digital-transformation-assessment` | ui_list: **wordmark** "Templeton & Mathews", sin logo | — | **NO_VISUAL_RESOURCE** (wordmark tipográfico) |
| `repuestos-carlitos` | ui_list: sin logo/wordmark | logos gráfico en `/assets/grafico/logos/` existen pero **no son UI screenshots** | **NO_VISUAL_RESOURCE** para Interfaces |
| `concitar` | no ui_project/list | solo logo gráfico `concitar.svg` | **NO_VISUAL_RESOURCE** (identity, no UI) |
| `taily` | no ui_project/list | solo logo gráfico `taily.svg` | **NO_VISUAL_RESOURCE** (identity, no UI) |
| `mental-training-tech-24-5` | no legacy Interfaces | **0** assets interfaces | **NO_VISUAL_RESOURCE** |

**Ninguno** tiene galería legacy en `ui_projects.images[]` — no aplica RESOURCE_ALREADY_IN_LEGACY.

**Nota Home:** concitar/taily/repuestos-carlitos aparecen en Home V2 **sin** `coverPath` V2 — el marquee usa label, no screenshots UI.

---

## 4. Detail readiness (15 Projects)

| Readiness | Projects (n) |
|-----------|----------------|
| **DETAIL_READY** (≥2 resources) | adapto-pay, apsmm, omnigroup, savil **(4)** |
| **LISTING_ONLY_RECOMMENDED** (1 resource) | casiba, clearwater, cms-portfolio, mikrobiol **(4)** |
| **NO_PUBLIC_DETAIL** (0 resources útiles) | cloronor-trading, concitar, mental-training-tech-24-5, repuestos-carlitos, simaas-marketplace, taily, templeton **(7)** |

**Recomendación de auditoría (no implementada):**

- Modal/detail solo para los **4 DETAIL_READY**
- Cards clickeables opcionales para los **4** con 1 screenshot (modal de 1 slide aporta poco → preferir expand inline o sin CTA)
- Los **7** restantes: **listing-only** (tile con cover/logo/wordmark si existe, **sin** abrir modal vacío)

---

## 5. Mapping exacto — 8 `ui_list_items`

| legacy ui_list_item | título ES | → V2 / razón |
|---------------------|-----------|--------------|
| `push-landing` | Landing - PUSH Software | **DISCARDED** — landing promocional; PUSH ya en Entities/Home |
| `orbita-landing` | Landing - Órbita LΔB | **DISCARDED** — landing promocional |
| `ludica-landing` | Landing - Lúdica Tech | **DISCARDED** — landing promocional |
| `b2b` | Plataforma integral B2B | **DISCARDED** — duplica PROXI; list surface deprecated |
| `carlitos` | Landing & Tienda - Repuestos Carlitos | → **`repuestos-carlitos`** (public-safe #14) |
| `simaas` | Marketplace de Frutas y Verduras | → **`simaas-marketplace`** (public-safe #12) |
| `templeton` | Autodiagnóstico Transformación Digital | → **`templeton-digital-transformation-assessment`** (#9) |
| `cloronor-trading` | Sistema trading cripto CLORONOR | → **`cloronor-trading`** (#5) — título V2 difiere ligeramente |

**Verificación humana:** los 4 descartados eran entradas ligeras sin ficha; los 4 promovidos ganan Project pero **3 de 4** siguen sin screenshots UI en V2.

---

## 6. Taxonomy proposal

Sin categorías nuevas. Mapping propuesto `type` + `context` → `UiCategory` legacy:

| Legacy `UiCategory` | Regla V2 |
|---------------------|----------|
| **`preventas`** | `context = presale` |
| **`apps-mobile`** | `type = mobile-app` (cualquier context) |
| **`proyectos-personales`** | `context = personal` |
| **`sistemas-a-medida`** | `type ∈ {custom-system, web-app}` AND `context ∈ {client-work, presale, internal-work}` AND NOT mobile-app |
| **`system-design`** | reservado — 0 filas legacy |

**Casos EXPECTED_TAXONOMY_CHANGE** (no encajan limpio):

| Project | type | context | Propuesta | Notas |
|---------|------|---------|-----------|-------|
| `concitar` | web-app | internal-work | **sistemas-a-medida** o omitir de Interfaces | solo Home+Graphic hoy |
| `taily` | mobile-app | internal-work | **apps-mobile** | sin screenshots |
| `mental-training-tech-24-5` | mobile-app | presale | **apps-mobile** | solo Home |
| `repuestos-carlitos` | web-app | client-work | **sistemas-a-medida** | promovido desde list |

**Prioridad en conflictos:** `mobile-app` > `personal` > `presale` > default sistemas.

---

## 7. Frame gap

### Para qué usa la UI legacy `aspect` / `frame`

| Uso | Componente | Comportamiento |
|-----|------------|----------------|
| **Crop vs contain** | `InterfacesLayer`, `UiProjectDetailModal`, `InterfacesCategoryGrid` | `portrait` → `object-contain`; `landscape` → `object-cover object-top` |
| **Layout side carousel** | Modal / cards `apps-mobile` | `isAllPortraitSlides()` → carousel lateral |
| **Mixed platform badge** | `mixedPlatformLabel()` | Detecta mezcla landscape+portrait → label "Mixto" / "Tótem" |
| **Cover selection** | `coverSlide()` | Prefiere primer slide `landscape` |

### ¿Es necesario?

- **Sin frame:** `normalizeUiSlides()` asume **landscape** para strings sin aspecto
- **Impacto:** screenshots mobile (`savil`, `adapto-pay`, `asesor-financiero`) pueden **recortarse mal** si son portrait reales
- **Omnigroup:** mezcla web + tótem — pierde badge "Mixto" sin frames distintos

### ¿Derivable?

- **Sí, en runtime:** leer dimensiones imagen → inferir portrait si height > width (coste I/O build-time o lazy client)
- **Sí, en migración (futuro):** backfill `project_resources.frame` desde legacy `UiSlide.aspect`

### ¿Omitible?

- **Listing cards:** mayormente landscape container fijo — ** tolerable** con default landscape
- **Modal mobile / omnigroup:** **no omitible** sin regresión visual perceptible

### Projects afectados (public-safe)

| Project | resources | Riesgo frame null |
|---------|-----------|-------------------|
| savil | 3 | **Alto** — mobile portrait |
| adapto-pay | 3 | **Medio** — mix web/mobile |
| omnigroup | 6 | **Alto** — mixed aspects label |
| apsmm, casiba, clearwater, mikrobiol, cms-portfolio | 1–3 | Bajo — mostly landscape web |

---

## 8. Privacy filter strategy (propuesta, sin implementar)

### Opciones comparadas

| | A. ID list explícita | B. Filtro estructural | C. Combinación |
|--|---------------------|----------------------|----------------|
| **Mecanismo** | `INTERFACES_NEVER_RETURN_IDS` | Reglas sobre entities/published | published + structural + lista mínima |
| **Cubre confidential published** | Solo si mantenida a mano | **Sí** — client `visible=false` o `confidential-*` | **Sí** |
| **Cubre proxi** | Solo si listado | **Sí** — `published=false` | **Sí** |
| **Fragilidad** | Alta — IDs nuevos requieren update | Media — edge cases sin client | **Baja** |
| **Schema hoy** | No hay columna `confidential` en `projects` | **Sí** — `project_entities` + `entities.visible` | Mejor fit |

### Recomendación: **C (combinación)**

1. **Base:** `isPublicProject()` (`published=true`, no `archived`) — ya en `visibility.ts`
2. **Estructural Interfaces:** excluir si ∃ link `relation_role=client` con `entity.visible=false` **OR** `entity_id LIKE 'confidential-%'`
3. **Lista mínima explícita** solo para excepciones sin client confidencial (ej. `sessions` si algún día entra en ux-ui listing con otro patrón — hoy tiene client confidencial → cubierto por regla 2)
4. **Opcional futuro:** columna `projects.confidential` en DB — hoy solo vive en manifest

**Ventaja:** los 4 CONFIDENTIAL_PUBLISHED se excluyen **sin** mantener blacklist paralela al manifest.

**Riesgo a validar humanamente:** ¿algún project con client invisible debe seguir listándose? Hoy: **no** en portfolio.

---

## 9. Home consistency

### 15 public-safe en Home V2 (10 overlap)

| id | homeOrder | Mismo Project canónico |
|----|-----------|------------------------|
| adapto-pay | 0 | yes |
| casiba | 1 | yes |
| clearwater | 2 | yes |
| cloronor-trading | 3 | yes |
| mental-training-tech-24-5 | 6 | yes |
| omnigroup | 7 | yes |
| concitar | 8 | yes |
| repuestos-carlitos | 9 | yes |
| templeton-digital-transformation-assessment | 10 | yes |
| taily | 11 | yes |

**No en Home:** apsmm, cms-portfolio, mikrobiol, savil, simaas-marketplace

### Privacy-blocked en Home

| id | confidential | in Home V2 |
|----|--------------|------------|
| aicore-inventariado | yes | **no** |
| aml-casinos | yes | **no** |
| aml-general | yes | **no** |
| asesor-financiero | yes | **no** |
| sessions | yes | **no** |

**Ningún privacy-blocked aparece en Home V2.**

---

## 10. Decisiones humanas requeridas

Antes de 4E.1, necesitás confirmar:

### Privacidad / publicación

1. **¿Ocultar en Interfaces V2 los 4 CONFIDENTIAL_PUBLISHED** (aml×2, aicore-inventariado, asesor-financiero) aunque legacy hoy los muestre? → recomendado **sí**
2. **¿Mantener `proxi` unpublished** en V2 (legacy sigue listándolo sin imágenes)? → recomendado **sí**
3. **¿Aprobar filtro estructural C** (client invisible / confidential-*) vs blacklist pura?

### Resources / detail

4. **¿Los 7 sin resources** entran al listing Interfaces como tiles ligeros (logo/wordmark) **sin modal**, o se excluyen hasta backfill?
   - Sub-decisiones por project: concitar/taily (solo identity), templeton (wordmark), cloronor/simaas (logo)
5. **¿Los 4 con 1 resource** abren modal o solo listing?
6. **¿Backfill `project_resources.frame`** desde legacy aspect (fase DB posterior) o inferencia runtime?

### Superficie / taxonomy

7. **¿Confirmar descarte** de push-landing, orbita-landing, ludica-landing, b2b?
8. **¿Incluir concitar/taily/mental-training en Interfaces** además de Home, sin UI screenshots?

---

## Herramienta

```bash
npx tsx scripts/inspect-interfaces-decision-matrix-4e0b.ts
```

Output: `reports/_interfaces-decision-matrix-4e0b-live.json`

---

**DETENIDO en 4E.0B — no se inició 4E.1.**
