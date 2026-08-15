# Content Model V2 — Rehearsal Final (3C.3 CLOSED)

**Status:** APPROVED AND CLOSED  
**Phase:** 3C.3 rehearsal apply + idempotency  
**Frozen at:** 2026-08-15T06:57:00-03:00  
**Confidential data:** none in plaintext (paths/labels omitted)

---

## FIRST APPLY

| Field | Value |
|-------|-------|
| exit | `0` |
| database | `portfolio_v2_apply_test` |
| mode | rehearsal-apply (`V2_REHEARSAL_APPROVED=1`) |
| live apply | **NOT executed** |

### Actual TEMP (post-commit)

| Metric | Count |
|--------|------:|
| entities | 33 |
| projects | 31 |
| pieces | 48 |
| project_resources | 26 |
| piece_resources | 2 |
| piece_src_mappings | 60 |
| project_entities | 43 |
| piece_entities | 17 |
| project_areas | 37 |
| project_roles | 67 |
| piece_tags | 49 |
| migration_map | 125 |
| tags | 11 |

**Metric note:** `piece_resources` = table rows (`kind: piece_resource`).  
`piece_src_mappings` = `kind: piece_src` materialised on `pieces.src_path` (60/60 matched). Not table rows.

### Integrity

| Check | Result |
|-------|--------|
| orphans (all V2 relations) | 0 |
| canonical testimonials | 4/4 (`facundo→push`, `ezequiel→aicore`, `joaquin→ludica`, `matias→orbita-l-b`) |
| confidentiality (labels / migration_map sources) | OK (sha256 fingerprints; no forbidden aliases) |
| Syllabi `published` | false |
| buhoprofe as Piece | absent |
| buhoprofe as ProjectResource on Syllabi | present |
| tag catalog additions | `tdt` + `cover` (PRE 9 → POST 11; no extras) |
| Project.context / roles / areas / Piece categories | all valid |
| cover tags | 12 pieces |
| tdt tags | 2 pieces |

### Legacy TEMP (unchanged except tags)

| Table | Count |
|-------|------:|
| graphic_items | 47 |
| ui_projects | 13 |
| brands | 7 |
| brand_manuals | 1 |
| named_list_items | 40 |
| ui_list_items | 8 |
| tags | 11 |

(Global testimonials count is not a baseline; only the 4 canonical IDs are validated.)

---

## IDEMPOTENCY (second rerun)

| Field | Value |
|-------|-------|
| exit | `1` |
| database | `portfolio_v2_apply_test` |
| abort | `assertV2Empty` — `V2 table "entities" must be empty … (found 33)` |
| writes | none (abort before `buildProposedPlan` / transaction) |
| duplicates | none — TEMP counts identical to first apply |

---

## LIVE (during/after rehearsal)

| Check | Result |
|-------|--------|
| V2 tables | all `0` |
| apply live | **NOT executed** |
| schema content apply | not run |
| seed / sync / reset | not run |

---

## Explicit non-actions (3C.3)

- No further content rehearsals
- TEMP not reset
- LIVE not modified for content
- `fk_testimonials_entity` still **pending** (column + index name exist; FOREIGN KEY constraint absent)

---

## Appendix — 3C.4 PRE-LIVE GATE (proposals only; not executed)

See companion chat approval package for:

1. Minimal idempotent SQL for `fk_testimonials_entity` (`ON DELETE SET NULL`)
2. TEMP-only FK rehearsal runner (guarded; not run yet)
3. LIVE READ-ONLY preflight snapshot
4. Final Unicode-safe backup procedure (`portfolio-v2-final-pre-live-YYYYMMDD-HHMM.sql`)
5. Live apply guard design (`database===portfolio` ∧ `V2_APPLY_APPROVED=1`; rehearsal env must not unlock live)
6. Ordered live runbook A→K

**Next gate requires explicit human approval before any of: FK TEMP, final backup, schema live, `--apply` live.**
