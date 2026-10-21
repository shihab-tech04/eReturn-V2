# eReturn-V2 — Repository Agent Instructions

This repository is **exclusively** the new Bangladesh NBR public eReturn reconstruction (individual and corporate). It is a separate product from eLedger, TaxPay, Office Audit, HRIS and all other NBR applications. **Do not import their APIs, SQL migrations, business workflows, data, authentication or UI** unless the user explicitly approves a new scoped integration.

## Source of statutory calculations

- Reuse **one** authorized tax Rules Engine: the `Bangladesh-NBR-eReturn` SQL project (`ijcbllgjhhkcnbuygwdn`) and its controlled `nbr-rules-api`/`nbr-tax-engine` services.
- The administrative frontend is `shihab-tech04/NBR-Officemanagment-UI-V2` → Administration & Requests → Rules & Calculation. Preserve its separate Golden UI and scope.
- Do not create a competing rules database, copy 366 canonical rules backward into unsupported historical years, hardcode guesses for statutory rates, or claim inherited draft rules are approved.
- Treat `FINAL_2026_09_30` 366-rule registry (SHA-256 `34902bac07a459a4f0c051b90bfe3b4c492f2465d06c661bab18ab7f36252184`) as immutable. Extend through versioned overlays and sourced approval.
- **Required cross-repo specification:** https://github.com/shihab-tech04/eReturn-V2/issues/1 and https://github.com/shihab-tech04/NBR-Officemanagment-UI-V2/blob/feat/rules-year-comparison-ereturn-contract-20261021/docs/ERETURN_V2_RULES_INTEGRATION_CONTRACT.md
- Design the taxpayer-side `RulesEnginePort`/adapter early; preserve exact AY/IY, taxpayer class, event dates, source field IDs, approved rule version/hash, decimal-string calculations, failure states and trace evidence.
- Independent law + numerical + authorization + API/SQL readback + regression certification is mandatory before enabling actual statutory calculation claims. An incomplete Rules Engine must remain fail-closed; do not fabricate a working endpoint or success.
- Never execute real tax filing, payments or taxpayer-data modifications merely for testing.

## Project Golden UI

Preserve approved eReturn reconstruction design, reusable components, bilingual parity, keyboard accessibility, mobile layouts and official evidence provenance. No unrequested redesign, fake data or banners.

This file is the persistent coding boundary for parallel GitHub/AI work on **eReturn-V2 only**. It does not alter other repositories or ChatGPT Project settings.
