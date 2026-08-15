# Home Readiness + Shadow Comparison — Phase 4C.0 / 4C.0B

**Status:** AUDIT ONLY — no DB/UI/flag/cutover · **data patch NOT applied**  
**Date:** 2026-08-15  
**Database:** `portfolio` (LIVE)  
**Tooling:** `scripts/inspect-home-readiness-4c0b.ts` (READ-ONLY)  
**4B:** unchanged

---

## 4C.0B amendments (authoritative over prior 4C.0 notes)

1. **Templeton corrected:** legacy Home chip `Templeton & Matthews` maps to existing Project `templeton-digital-transformation-assessment` (not a missing `templeton-matthews` project).
2. **`homeOrder` is order-only.** Discarded proposal `homeOrder < 10 = past` / `>= 10 = current`.
3. **Past/current sections** should derive from `Project.status` (see §E), not from encoded `homeOrder`.
4. **SIMAAS** resolves to `simaas-marketplace` (published/completed) — prior “no mapping” was wrong.

---

## A. Home legacy actual

**Loader:** `loadPortfolioContent()` → `HomeLayer`  
**Section order (`homeLayout`):** `companies` → `past_projects` → `current_projects` → `testimonials`

| Block | Source | Count |
|-------|--------|------:|
| Companies marquee | `named_list_items` kind=`company` | **18** |
| Past projects marquee | kind=`past_project` | **16** |
| Current projects marquee | kind=`current_project` | **6** |
| Testimonials | `testimonials` `!hidden` | **4** |

Ordering: `named_list_items.sort_order ASC`. Most chips are text-only (no logo/hub).

---

## B. Home V2 actual (4B readers)

| Reader | Count | Notes |
|--------|------:|-------|
| `getHomeEntitiesV2()` | **6** | aicore, apsmm, citf, ludica, orbita-l-b, push — all `homeOrder=null` |
| `getHomeProjectsV2()` | **0** | no project has `show_on_home=1` |
| `getPublicTestimonialsV2()` | **4** | Entity metadata resolved |

---

## C. Templeton resolution (exact)

| Field | Value |
|-------|--------|
| Legacy Home item | `named_list_items` id=34 · kind=`past_project` · label=`Templeton & Matthews` · sort_order=15 |
| Project V2 real | **`templeton-digital-transformation-assessment`** |
| Slug | `sistema-de-autodiagnostico-transformacion-digital` |
| Title (public) | Sistema de Autodiagnóstico Transformación Digital |
| published | **true** |
| status | **completed** |
| showOnHome | false |
| Entity client | `templeton-mathews` (visible company; spelling **Mathews**) |
| Also linked | `aicore` as intermediary |
| migration_map | `ui_list_items:templeton` → project `templeton-digital-transformation-assessment` |
| Entity map | `decision_manifest:templeton-mathews` → entity `templeton-mathews` |

**Conclusion:** 4C.0 “project missing / templeton-matthews” was an **audit error**. Do **not** create another Project.  
Legacy chip → **REPLACE** with `templeton-digital-transformation-assessment`.

---

## D. Matriz legacy projects → V2

### D.1 Past projects (16)

| # | Legacy label | Project V2 | published | status | showOnHome | V2 section | Recommendation |
|--:|--------------|------------|-----------|--------|------------|------------|----------------|
| 0 | Adapto Pay | `adapto-pay` | true | completed | false | past | **REPLACE** · showOnHome=true · past |
| 1 | Asesor Financiero | `asesor-financiero` | true | completed | false | past | **REPLACE** + **NEEDS_REVIEW** · do not enable Home yet |
| 2 | Athenas | — | — | — | — | — | **DISCARD** (forbidden/deferred) |
| 3 | Casiba | `casiba` | true | completed | false | past | **REPLACE** · showOnHome=true · past |
| 4 | Clearwater | `clearwater` | true | completed | false | past | **REPLACE** · showOnHome=true · past |
| 5 | Cloronor | `cloronor-trading` | true | completed | false | past | **REPLACE** · showOnHome=true · past |
| 6 | EXPEDICIÓN POLO | `expedicion-polo` | true | completed | false | past | **REPLACE** · showOnHome=true · past |
| 7 | fiserv. | — | — | — | — | — | **DISCARD** |
| 8 | Inspector | — | — | — | — | — | **DISCARD** (forbidden/deferred) |
| 9 | Juegos Provinciales Tecnológicos | `juegos-provinciales` | true | completed | false | past | **REPLACE** · showOnHome=true · past |
| 10 | La Estación | — | — | — | — | — | **DISCARD** / no V2 project |
| 11 | Mental Tech Training | `mental-training-tech-24-5` | true | completed | false | past | **REPLACE** · showOnHome=true · past |
| 12 | omni group | `omnigroup` | true | completed | false | past | **REPLACE** · showOnHome=true · past |
| 13 | proxi | `proxi` | **false** | completed | false | past | **BLOCKED** (published=false; do not propose showOnHome) |
| 14 | SIMAAS | `simaas-marketplace` | true | completed | false | past | **REPLACE** candidate · see OPTIONAL |
| 15 | Templeton & Matthews | `templeton-digital-transformation-assessment` | true | completed | false | past | **REPLACE** · see Templeton Home eval |

### D.2 Current projects (6)

| # | Legacy label | Project V2 | published | status | showOnHome | V2 section | Recommendation |
|--:|--------------|------------|-----------|--------|------------|------------|----------------|
| 0 | Concitar | `concitar` | true | **completed** | false | **past** | **REPLACE** + **NEEDS_HUMAN_DECISION** (section) |
| 1 | MICROTIME | `microtime` | **false** | ongoing | false | current | **BLOCKED** (published=false) |
| 2 | Repuestos Carlitos | `repuestos-carlitos` | true | **completed** | false | **past** | **REPLACE** + **NEEDS_HUMAN_DECISION** (section) |
| 3 | Sessions | `sessions` | true | **completed** | false | **past** | **REPLACE** + **NEEDS_REVIEW** confidential · no Home yet |
| 4 | Syllabi | `syllabi` | **false** | completed | false | past | **BLOCKED** (published=false) + section conflict moot |
| 5 | Taily | `taily` | true | **ongoing** | false | **current** | **REPLACE** · showOnHome=true · current |

---

## E. Conflicts: legacy section vs V2 status

| Project | Legacy section | V2 status | Conflict |
|---------|----------------|-----------|----------|
| `concitar` | current | completed | **LEGACY_CURRENT_BUT_V2_COMPLETED** |
| `repuestos-carlitos` | current | completed | **LEGACY_CURRENT_BUT_V2_COMPLETED** |
| `sessions` | current | completed | **LEGACY_CURRENT_BUT_V2_COMPLETED** (+ confidential review) |
| `syllabi` | current | completed | same + **published=false** → BLOCKED |

No reverse conflicts (legacy past + V2 ongoing) among resolved items.

**Do not change `status` to imitate legacy marquees.**

---

## F. Recommended past/current rule (future Home)

**Recommend:**

| Home section | Rule |
|--------------|------|
| **CURRENT** | `showOnHome=true` AND `published=true` AND `status=ongoing` |
| **PAST** | `showOnHome=true` AND `published=true` AND `status=completed` |
| **excluded** | `status=archived` · `published=false` · `showOnHome=false` |

`homeOrder` sorts **within** the section only. Adapter filters by `status`, then sorts by `homeOrder` (nulls last / id tiebreak per 4B).

### Does this match “what we want to show”?

For the **approved safe REPLACE set**, after status filtering:

- **CURRENT** shrinks to essentially **`taily`** only (MicroTime stays off until published).
- **Concitar** and **Repuestos Carlitos** move to **PAST** under this rule.

That is a **real visual change** vs legacy current marquee.

| Item | Decision needed |
|------|-----------------|
| Concitar / Repuestos Carlitos stay visually “current”? | **NEEDS_HUMAN_DECISION** — either accept PAST (status wins) or later change `status`→`ongoing` (separate human write; **not** in this patch) |
| Invent dual-flag / homeOrder bands? | **Rejected** |

Until human says otherwise: **treat status as source of truth** for section.

---

## G. Re-evaluation of 11 + Templeton (+ SIMAAS note)

Confidential NEEDS_REVIEW projects stay **off** Home (`asesor-financiero`, `sessions`).

| projectId | published | status | safe public | showOnHome | section | homeOrder (in section) |
|-----------|-----------|--------|-------------|------------|---------|------------------------:|
| adapto-pay | true | completed | yes | **true** | past | 0 |
| casiba | true | completed | yes | **true** | past | 1 |
| clearwater | true | completed | yes | **true** | past | 2 |
| cloronor-trading | true | completed | yes | **true** | past | 3 |
| expedicion-polo | true | completed | yes | **true** | past | 4 |
| juegos-provinciales | true | completed | yes | **true** | past | 5 |
| mental-training-tech-24-5 | true | completed | yes | **true** | past | 6 |
| omnigroup | true | completed | yes | **true** | past | 7 |
| concitar | true | completed | yes | **true** | **past** (not current) | 8 |
| repuestos-carlitos | true | completed | yes | **true** | **past** (not current) | 9 |
| taily | true | ongoing | yes | **true** | **current** | 0 |

### Templeton Home eval

| Field | Value |
|-------|--------|
| published | true |
| status | completed → **past** |
| safe public | **SAFE_PUBLIC** (client Entity visible; public title sanitized; not `confidential-*`) |
| Replace legacy chip? | **Yes** |
| recommended showOnHome | **true** (parity) — **not auto-applied** |
| recommended section | past |
| recommended homeOrder | **10** (after the 10 past items above) |

### SIMAAS

`simaas-marketplace`: published/completed/safe. Legacy past chip. **OPTIONAL** showOnHome (not in core 11; include if full past-chip parity desired). Suggested past homeOrder **11** if approved.

---

## H. Entities — homeOrder candidate (confirmed)

Among the 6 Home Entities, first appearance in legacy company marquee order:

| entityId | proposed homeOrder | Confirmed vs legacy |
|----------|-------------------:|---------------------|
| aicore | 0 | yes (first Home Entity in company list) |
| apsmm | 1 | yes |
| citf | 2 | yes |
| ludica | 3 | yes |
| orbita-l-b | 4 | yes |
| push | 5 | yes |

Interleaved non-Home chips (bind, FabLab, gov…) are **DISCARD** for Entity Home — order above is among survivors only.

---

## I. DTO / adapter gap (unchanged intent)

Still recommend `HomeContentV2` in 4C.2:

- Entities → company marquee DTO  
- Projects → **split by `status`**, sort by `homeOrder` within section  
- Testimonials → map `entity` → legacy `company` shape  

Do **not** warp 4B DTOs. Do **not** encode section in `homeOrder`.

---

## J. Data patch propuesto (conceptual — **NOT executed**)

### ENTITY — homeOrder only

```sql
UPDATE entities SET home_order = 0 WHERE id = 'aicore';
UPDATE entities SET home_order = 1 WHERE id = 'apsmm';
UPDATE entities SET home_order = 2 WHERE id = 'citf';
UPDATE entities SET home_order = 3 WHERE id = 'ludica';
UPDATE entities SET home_order = 4 WHERE id = 'orbita-l-b';
UPDATE entities SET home_order = 5 WHERE id = 'push';
```

### PROJECT — showOnHome + homeOrder only (section = status at read time)

```sql
-- PAST (status already completed — DO NOT touch status)
UPDATE projects SET show_on_home = 1, home_order = 0  WHERE id = 'adapto-pay' AND published = 1;
UPDATE projects SET show_on_home = 1, home_order = 1  WHERE id = 'casiba' AND published = 1;
UPDATE projects SET show_on_home = 1, home_order = 2  WHERE id = 'clearwater' AND published = 1;
UPDATE projects SET show_on_home = 1, home_order = 3  WHERE id = 'cloronor-trading' AND published = 1;
UPDATE projects SET show_on_home = 1, home_order = 4  WHERE id = 'expedicion-polo' AND published = 1;
UPDATE projects SET show_on_home = 1, home_order = 5  WHERE id = 'juegos-provinciales' AND published = 1;
UPDATE projects SET show_on_home = 1, home_order = 6  WHERE id = 'mental-training-tech-24-5' AND published = 1;
UPDATE projects SET show_on_home = 1, home_order = 7  WHERE id = 'omnigroup' AND published = 1;
UPDATE projects SET show_on_home = 1, home_order = 8  WHERE id = 'concitar' AND published = 1;
UPDATE projects SET show_on_home = 1, home_order = 9  WHERE id = 'repuestos-carlitos' AND published = 1;
UPDATE projects SET show_on_home = 1, home_order = 10 WHERE id = 'templeton-digital-transformation-assessment' AND published = 1;

-- CURRENT (status already ongoing)
UPDATE projects SET show_on_home = 1, home_order = 0  WHERE id = 'taily' AND published = 1;
```

**Section derivation:** `status=ongoing` → current marquee; `status=completed` → past marquee.  
**Not stored** in `homeOrder`.

### OPTIONAL (human)

- `simaas-marketplace` → showOnHome + past homeOrder=11  
- `asesor-financiero` / `sessions` → only after confidential OK  
- Later: flip Concitar / Repuestos `status` to `ongoing` **only if** human wants them in CURRENT (separate decision; not this patch)

### NO CHANGE

- `published` (MicroTime, Syllabi, proxi, logistics, …)  
- `status`  
- `pageEnabled`  
- confidential Home enablement without review  

---

## K. Definitive lists (pre-apply)

### F — showOnHome=true (recommended)

`adapto-pay`, `casiba`, `clearwater`, `cloronor-trading`, `expedicion-polo`, `juegos-provinciales`, `mental-training-tech-24-5`, `omnigroup`, `concitar`, `repuestos-carlitos`, `templeton-digital-transformation-assessment`, `taily`

### G — homeOrder by section

**Past:** 0…10 as in SQL above (Templeton=10).  
**Current:** `taily`=0.

### H — Entity.homeOrder

aicore=0 … push=5 (table §H).

---

## L. Plan 4C.1–4C.6 (still not started)

| Step | Action |
|------|--------|
| **4C.1** | Apply **approved** Entity.homeOrder + Project.showOnHome/homeOrder only |
| **4C.2** | `HomeContentV2` adapter — section from `status`, order from `homeOrder` |
| **4C.3** | Shadow validation legacy vs V2 |
| **4C.4** | Feature flag Home only |
| **4C.5** | Local visual compare |
| **4C.6** | Home cutover |

**Files 4C real would touch:** DB flags (4C.1); `src/lib/content-v2/home.ts`; flag wiring; `HomeLayer` only at 4C.4+.

---

## Explicit non-actions (4C.0 / 4C.0B)

No UPDATE/INSERT/DELETE · no feature flag · no UI · no Admin · no 4B code changes · no commit required for audit-only report · **data patch not applied**
