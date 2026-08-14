# Content v2 encoding repair plan

Generated: 2026-08-14T01:36:36.781Z

Machine-readable plan: [`content-v2-encoding-repair-plan.json`](./content-v2-encoding-repair-plan.json)

## Summary

- **Total repairs:** 139
- **Scalar leaves:** 29
- **JSON leaves:** 110

### By table

- `brand_manuals`: 1
- `brands`: 3
- `graphic_items`: 81
- `named_list_items`: 10
- `testimonials`: 12
- `ui_projects`: 32

### By column

- `brand_manuals.meta`: 1
- `brands.name`: 3
- `graphic_items.alt`: 12
- `graphic_items.detail`: 50
- `graphic_items.href_label`: 9
- `graphic_items.title`: 10
- `named_list_items.label`: 10
- `testimonials.company_name`: 2
- `testimonials.name`: 2
- `testimonials.quote`: 4
- `testimonials.role`: 4
- `ui_projects.duration`: 1
- `ui_projects.meta`: 17
- `ui_projects.summary`: 3
- `ui_projects.title`: 11

## Notes

- Each JSON object field is repaired **per leaf** (`es`, `en`), not as a whole-column replace.
- Apply with `ENCODING_REPAIR_APPROVED=1 npx tsx scripts/repair-legacy-encoding.ts` after backup.
- Do **not** run the repair script without explicit approval and a fresh MySQL dump.
