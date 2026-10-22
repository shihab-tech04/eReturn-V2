# eReturn UX/UI source audit — 2026-10-23
Status: **SOURCE AUDIT COMPLETE FOR LISTED FILES, LIVE SCREEN/PARITY AUDIT INCOMPLETE**. No new legal or backend certification.

## Evidence boundary
- Baseline main: `34a180f262fd18dbe754e989550aaf2161fd4a66`, 34 page and main-workspace TSX files (the two submission experiences are separate).
- Connected Chrome **Chat read-only** accessed existing Dashboard, original Submission and Guided Submission step 1 and step 3. It cannot navigate, click, set viewports or generate current screen screenshots in this mode. Other page layouts are source-inspected, **not visually inspected against the original NBR site**.
- Automated source inventory: 197 direct field/component tags, 37 existing help-tooltip uses, 324 extractable JSX literals or paired translations, and 17 files containing native alert calls. Counts are code-pattern indicators, not a11y compliance or exhaustive rendered-field counts (shared child components expand at runtime).

## Navigation/screen matrix (screen screenshots and text/field QA still OPEN)
Dashboard/Workspace, Assessment, Income hub, Employment, Financial Assets, Rent, Agriculture, Business, Capital Gain, Other Sources, Firm, AOP, Foreign Income, Spouse/Minor, Tax Exempt, Voluntary Disclosure, Rebate, Expenditure, Assets & Liabilities, Tax/Payment, Return Preview, Original Submission, 3-step Guided Submission/edit flows, TIN Certificate, Acknowledgement, Challan History, Certificate Request, Certificate Status, Return History/Records, Revised Return, Audited Accounts, Profile, Change Password.

## Findings
| Priority | Gap/observation | Status |
|---|---|---|
| P0 | No certified filing/caller ownership, official tax calculation, real payment or acknowledgement | EXISTING FAIL-CLOSED; NOT UX-REPAIRABLE WITHOUT API/LEGAL ACCEPTANCE |
| P0 | Change Password source can falsely show success without authenticated API | Independently repaired draft PR #27; not present in this baseline |
| P1 | No consistent field-level contextual explanation and self-guided support across routes | THIS PR: shared bilingual detail drawer, contextual launcher and inline help in reused form controls |
| P1 | Current help popovers differ in placement/pattern; tiny tooltip overlay can clip at 375px | THIS PR: replace existing field-tooltip invocations with accessible drawer |
| P1 | Audited Accounts Back/active parent navigation mismatch | Repaired independently in draft PR #25; needs coordinated safe integration |
| P1 | 17 page/workspace TSX files contain native alert calls | OPEN; replace with unified accessible feedback after context-specific testing |
| P1 | 324 static text/translation-pair candidates require full actual DOM/EN-BN visual parity review | OPEN; regex evidence not an exhaustive text audit |
| P1 | Official NBR reference Workstream B/C conditional screen coverage incomplete | OPEN; requires authenticated interactive original-browser session |
| P1 | Full responsive semantics, keyboard, screen-reader and contrast testing beyond route smoke | OPEN; new Help UI has focused Playwright suite but no full audit conclusion |
| P1 | Real generative AI inside the browser drawer | NOT CONNECTED; deploy only curated local Q&A until approved privacy-safe authenticated AI endpoint exists |
| P2 | Input/component semantics, searchable options, native alerts, document preview, error recovery across 34 pages | SOURCE-REVIEWED; per-state interaction tests OPEN |

## Safe implementation contract
- Preserve the approved Sobaike-styled shell and all 33 established application routes; retain all EN/BN functional forms and context state.
- Never alter rates, formulas, credits, ownership, SQL API or Rules Engine gate to satisfy UX.
- Field help reads **labels only**; do not send or persist taxpayer inputs, passwords or TIN.
- Chat-style Q&A is rule-based and explicitly discloses that live AI is unavailable; it must not claim personal tax advice, entitlement, official status or filing.
- External-release decision requires exact-commit browser/TypeScript/unit/build tests, independent UI comparison, recovery backup, post-deploy smoke and rollback. This document does not certify live pixel parity.
