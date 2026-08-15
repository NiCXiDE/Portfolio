# Content Model V2 — Pre-Live Gate (3C.4)

**Status:** PREPARED — awaiting approval  
**Do not execute** FK TEMP, final backup, schema live, or `--apply` live until authorized.

---

## 1. Schema inspection (`testimonials.entity_id` → `entities.id`)

Observed on both `portfolio` and `portfolio_v2_apply_test`:

| Item | State |
|------|--------|
| `testimonials.entity_id` | `VARCHAR(64) NULL` present |
| `entities.id` | `VARCHAR(64) NOT NULL` PK |
| Index `KEY fk_testimonials_entity (entity_id)` | **exists** (non-unique) |
| Constraint `FOREIGN KEY fk_testimonials_entity` | **absent** |
| Other FKs on `testimonials` | none |

`SHOW CREATE TABLE` shows only `PRIMARY KEY` + `KEY fk_testimonials_entity (entity_id)` — the index name was reserved for the FK but the constraint was never applied.

---

## 2. Minimal idempotent SQL (proposal only)

```sql
-- db/schema-v2-fk-testimonials-only.sql (proposed)
-- testimonials.entity_id -> entities.id ON DELETE SET NULL
-- Idempotent: no-op if FOREIGN KEY already exists.
-- Note: existing KEY named fk_testimonials_entity is reused by InnoDB when adding the constraint.

SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'testimonials'
    AND CONSTRAINT_NAME = 'fk_testimonials_entity'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @ddl = IF(
  @fk_exists = 0,
  'ALTER TABLE testimonials ADD CONSTRAINT fk_testimonials_entity FOREIGN KEY (entity_id) REFERENCES entities (id) ON DELETE SET NULL',
  'SELECT ''fk_testimonials_entity already present'' AS status'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

---

## 3. TEMP FK rehearsal runner (proposal — NOT executed)

### Intent

Rehearse **only** `fk_testimonials_entity` on `portfolio_v2_apply_test` (entities already populated by 3C.3).

### Guarded PowerShell

```powershell
$prevDb = $env:DATABASE_NAME
$prevFlag = $env:V2_FK_TESTIMONIALS_REHEARSAL_APPROVED

try {
  $env:DATABASE_NAME = "portfolio_v2_apply_test"
  $env:V2_FK_TESTIMONIALS_REHEARSAL_APPROVED = "1"
  # Proposed: npm run db:apply-fk-testimonials-rehearsal
  npx tsx scripts/apply-fk-testimonials-rehearsal.ts
  Write-Output "FK_REHEARSAL_EXIT=$LASTEXITCODE"
}
finally {
  if ($null -ne $prevDb) { $env:DATABASE_NAME = $prevDb }
  else { Remove-Item Env:DATABASE_NAME -ErrorAction SilentlyContinue }
  if ($null -ne $prevFlag) { $env:V2_FK_TESTIMONIALS_REHEARSAL_APPROVED = $prevFlag }
  else { Remove-Item Env:V2_FK_TESTIMONIALS_REHEARSAL_APPROVED -ErrorAction SilentlyContinue }
}
```

### Runner behaviour (to implement when approved)

1. Resolve effective DB; **ABORT** unless `=== "portfolio_v2_apply_test"`.
2. Require `V2_FK_TESTIMONIALS_REHEARSAL_APPROVED=1`.
3. Preflight: `COUNT(*)` of `testimonials.entity_id` not in `entities` = **0**.
4. Preflight: FOREIGN KEY `fk_testimonials_entity` must **not** already exist (or treat as success no-op).
5. Execute the idempotent SQL above against TEMP only.
6. Post-check: constraint exists; `DELETE_RULE = SET NULL`; invalid refs still 0.
7. Never accept `portfolio` / live; never use `V2_REHEARSAL_APPROVED` or `V2_APPLY_APPROVED`.

**Status:** command/runner proposed only — **not created/executed in this gate commit.**

---

## 4. LIVE preflight (READ-ONLY) — 2026-08-15

Database: `portfolio`

### Legacy

| Table | Count | Expected |
|-------|------:|--------:|
| graphic_items | 47 | 47 |
| ui_projects | 13 | 13 |
| brands | 7 | 7 |
| brand_manuals | 1 | 1 |
| named_list_items | 40 | 40 |
| ui_list_items | 8 | 8 |
| tags | 9 | 9 |

Legacy tags present: `bass-series`, `evento`, `fan-art`, `grime`, `impreso`, `nsfw`, `pixel-art`, `tattoo`, `vector`.

Canonical testimonials present: `facundo`, `ezequiel`, `joaquin`, `matias` (`entity_id` still NULL on LIVE — expected pre-apply).

### V2

All zero: entities, projects, pieces, project_resources, piece_resources, project_entities, piece_entities, project_areas, project_roles, piece_tags, migration_map.

### Schema

| Item | LIVE |
|------|------|
| `projects.context` | present |
| `piece_entities` | present |
| `testimonials.entity_id` | present |
| `fk_testimonials_entity` FOREIGN KEY | **pending** |
| Index named `fk_testimonials_entity` | present (no constraint) |

---

## 5. Final LIVE backup procedure (NOT run yet)

Name pattern: `backups/portfolio-v2-final-pre-live-YYYYMMDD-HHMM.sql`  
Do **not** reuse prior backups as the final gate artifact.

```powershell
New-Item -ItemType Directory -Force -Path backups | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$out = "backups/portfolio-v2-final-pre-live-$stamp.sql"
$restoreDb = "portfolio_v2_final_pre_live_restore_$stamp"

docker compose up -d
docker exec portfolio-mysql sh -c "mysqldump -uroot -proot --default-character-set=utf8mb4 --single-transaction --routines --triggers portfolio > /tmp/portfolio-final-pre-live.sql"
docker cp portfolio-mysql:/tmp/portfolio-final-pre-live.sql $out
docker exec portfolio-mysql rm -f /tmp/portfolio-final-pre-live.sql

# size > 0
Get-Item $out | Select-Object FullName, Length
# CREATE TABLE count
(Select-String -Path $out -Pattern "^CREATE TABLE").Count

# restore-test on isolated DB
docker exec portfolio-mysql mysql -uroot -proot --default-character-set=utf8mb4 -e "CREATE DATABASE \`$restoreDb\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
docker cp $out portfolio-mysql:/tmp/portfolio-final-restore.sql
docker exec portfolio-mysql sh -c "mysql -uroot -proot --default-character-set=utf8mb4 $restoreDb < /tmp/portfolio-final-restore.sql"
docker exec portfolio-mysql rm -f /tmp/portfolio-final-restore.sql

# baseline on restore DB (expect same legacy counts as LIVE)
docker exec portfolio-mysql mysql -uroot -proot --default-character-set=utf8mb4 -e "
SELECT 'graphic_items' t, COUNT(*) c FROM \`$restoreDb\`.graphic_items
UNION ALL SELECT 'ui_projects', COUNT(*) FROM \`$restoreDb\`.ui_projects
UNION ALL SELECT 'brands', COUNT(*) FROM \`$restoreDb\`.brands
UNION ALL SELECT 'brand_manuals', COUNT(*) FROM \`$restoreDb\`.brand_manuals
UNION ALL SELECT 'named_list_items', COUNT(*) FROM \`$restoreDb\`.named_list_items
UNION ALL SELECT 'tags', COUNT(*) FROM \`$restoreDb\`.tags
UNION ALL SELECT 'ui_list_items', COUNT(*) FROM \`$restoreDb\`.ui_list_items
UNION ALL SELECT 'entities', COUNT(*) FROM \`$restoreDb\`.entities;
"
# Unicode spot-check (HEX must not be 3F for accented brands)
docker exec portfolio-mysql mysql -uroot -proot --default-character-set=utf8mb4 -e "SELECT id, HEX(name) FROM \`$restoreDb\`.brands WHERE id IN ('ludica','orbita-l-b');"
```

Drop the restore-test DB after verification (manual, when approved).

---

## 6. Live apply guard (design only — not enabled)

Current code: `--apply` whitelist is **exclusively** `portfolio_v2_apply_test` + `V2_REHEARSAL_APPROVED=1`.

**Target final behaviour (when authorized to implement):**

```
effectiveDatabase === "portfolio"
  AND process.env.V2_APPLY_APPROVED === "1"
  → live apply path

effectiveDatabase === "portfolio_v2_apply_test"
  AND process.env.V2_REHEARSAL_APPROVED === "1"
  → rehearsal path (unchanged)

else → ABORT
```

Hard rules:

- `V2_REHEARSAL_APPROVED=1` must **never** unlock `portfolio`.
- Live path still runs: `assertV2Empty`, `assertLegacyBaseline`, canonical testimonials, tag catalog preflight, single transaction, full rollback on error.
- Prefer clearing `V2_REHEARSAL_APPROVED` when running live (defense in depth).

**Status:** designed; **not implemented/enabled** in this gate.

---

## 7. Ordered live runbook

| Step | Action |
|------|--------|
| A | Final backup + restore-test + baseline + Unicode check |
| B | LIVE preflight READ-ONLY (legacy + V2=0 + schema flags) |
| C | Schema/FK per final decision (`fk_testimonials_entity`; prefer TEMP FK rehearsal first) |
| D | Content `--apply` live (after guards enabled + `V2_APPLY_APPROVED=1`) |
| E | Post-apply verification |
| F | Proposed vs Actual |
| G | Orphans = 0 |
| H | Semantic + privacy |
| I | Legacy verification |
| J | Backup post-migration |
| K | Only then evaluate runtime / cutover |

No frontend / cutover in this phase.
