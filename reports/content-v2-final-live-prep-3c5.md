# Content Model V2 — Final Live Prep (3C.5)

**Status:** PREPARED — awaiting human approval for content apply live  
**Frozen:** 2026-08-15 (backup stamp `20260815-0411`)

## Backup final

| Field | Value |
|-------|-------|
| Path | `backups/portfolio-v2-final-pre-live-20260815-0411.sql` |
| Size | 75621 bytes |
| CREATE TABLE | 27 |
| Restore DB | `portfolio_v2_final_restore_test` |
| Restore | OK |
| Unicode HEX | OK (`Lúdica` / `Órbita` — no `3F` substitution) |

Restore-test matched LIVE baseline (legacy + V2=0 + schema flags; FK absent as expected).

## Guard live (enabled in code; apply NOT run)

- Rehearsal: `portfolio_v2_apply_test` ∧ `V2_REHEARSAL_APPROVED=1`
- Live: `portfolio` ∧ `V2_APPLY_APPROVED=1`
- No cross-unlock

## Live order

A backup+restore → B preflight → **C content apply** → D post-apply → **E FK live** → F post-FK → G post backup → H cutover later

## Explicit non-actions (this gate)

- Content apply live **NOT executed**
- FK live **NOT executed**
- LIVE V2 remains **0**
- TEMP unchanged
