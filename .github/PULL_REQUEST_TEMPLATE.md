# eReturn Change — Required Three-Way Sync Evidence

**Golden rule:** [ER-GOLDEN-SYNC-2026-10-21](../docs/ERETURN_GOLDEN_SYNC_AND_RELEASE_POLICY.md). Do not claim 100% completion just because CI passes, PR merges, or static snapshots agree.

## Scope / existing approved baseline

- Change ID and feature:
- Previous approved behavior, tested SHA, preserved routes/components/screens:
- Changes to tax law, fields, calculations, forms, validations, conditional flows, data, output or SQL:
- Impact on previously solved features / regression risks:

## Actual 3-way sync evidence

- Citizen `eReturn-V2` commit SHA, route, field IDs, observable input/output:
- Controlled Rules SQL project, schema, proposed/migrated rule/field IDs + versions + applicable AY/IY/taxpayer/event:
- Source legal instrument/section/effective date, verification status:
- SQL authorized write (if applicable) and exact read-back/revision/hash:
- Office Management commit SHA and evidence of displaying/editing **that same version**:
- API version, authorized session, response and deterministic calculation/field-dependency trace:
- Round-trip comparison **eReturn ↔ SQL ↔ Office** with exact result and provenance:
- Cross-field downstream effects, decimal precision/rounding, duplicate/credit, year/taxpayer boundary tests:
- If UI-only: evidence that no shared rule/field/API/SQL contract changed:

## Regression, design and release gates

- Old approved regression tests rerun (IDs, results, exact head):
- New tests (positive/negative, boundary, precision, stale version, invalid auth/year):
- EN/BN, accessibility, mobile/desktop 375/768/1280/1920 evidence where applicable:
- Protected data, security, authorization, rollback check:
- Deployed URL + commit SHA + **live JS/CSS and functional smoke**:
- Agent 137 archived originals rerun on upgraded Agent; 32 v2.1; six persisted E2E workflow results **when executing tax-law engine**:

## Honest acceptance decision

- [ ] eReturn UI/fields: evidence-backed PASS
- [ ] Controlled SQL/API version/read-back: evidence-backed PASS or demonstrated N/A (no data change)
- [ ] Office Management read-back: evidence-backed PASS or demonstrated N/A (no data change)
- [ ] Full three-way integration: evidence-backed PASS (if required for this change)
- [ ] No regression of solved features: evidence-backed PASS
- [ ] Controlling law & executable tax calculation approval: evidence-backed PASS (if involved)
- [ ] Public release: independently verified live result (if requested)

**Final status:** PASS / PARTIAL / BLOCKED / FAIL / UNVERIFIED  
**Explicit blockers and next owner:**  
**Do not release unapproved tax calculations. Do not state “100% synced” unless the three-way round trip and all applicable acceptance gates have actual evidence.**
