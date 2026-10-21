# NBR eReturn Public — Complete Taxpayer-Facing Application Reconstruction

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-emerald.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

An independent, production-grade frontend reconstruction of the **Bangladesh National Board of Revenue (NBR) citizen-facing eReturn online filing application**, built from authenticated desktop reference observations, historical system mapping (ER-1 through ER-6B), and the Workstream B benchmark register.

---

## 1. Project Mission & Identity

This application reconstructs the complete citizen tax preparation experience for Bangladeshi taxpayers filing under Universal Self-Assessment and Normal schemes under the Income Tax Act.

### What This Application IS:
- A responsive, bilingual (English & বাংলা) taxpayer application.
- The 7-stage return preparation workflow: **Assessment → Income → Rebate → Expenditure → Assets & Liabilities → Tax & Payment → Return View → Submission**.
- 13 statutory heads and sub-branches of income with repeatable multi-entry subforms.
- IT-10BB statement of lifestyle expenditures.
- IT-10B statement of assets, liabilities, and net wealth reconciliation.
- Taxpayer account records (TIN Certificate, Acknowledgement Slip, Challan History, Certificate Status, Return History).
- Corporate features: Audited Financial Statements with a 3-level note hierarchy.
- A decoupled, typed **Calculation Adapter Boundary** respecting the canonical Rules Engine (`FINAL_2026_09_30`, 366 rules, SHA-256 verified).

### What This Application IS NOT:
- The NBR Office Management system.
- An eLedger application.
- A live tax-payment gateway (banking charges and fund transfers are strictly outside project boundary).
- An arbitrary redesign unrelated to the official NBR eReturn system.

---

## 2. Reference Environments & Evidence Baseline

| Environment | URI | Observed Context |
| :--- | :--- | :--- |
| Historical Staging | `https://staging.etaxnbr.gov.bd` | Official NBR staging baseline |
| Authenticated Browser Audit | `http://103.92.85.227:42001/#/user-panel/home` | Authenticated desktop reference inspection (October 2026) |

---

## 3. Route & Evidence Mapping

All routes use HashRouter format (`#/user-panel/...`) matching the authenticated reference domain without requiring specialized server redirect routing on GitHub Pages or static hosts.

| Route | Feature Area | Reference Evidence / Observed Spec |
| :--- | :--- | :--- |
| `#/user-panel/home` | Citizen Dashboard | Top metrics, 7-stage return tracker, quick tax records |
| `#/user-panel/assessment` | Step 1: Assessment Info | Scheme, AY, Income Year From/To, Resident status, 7 Heads, 4 Additional, Voluntary Disclosure |
| `#/user-panel/income` | Step 2: Income Hub | Summary of active income heads, gross & net aggregation |
| `#/user-panel/employment` | Head: Employment | 4 choices: Govt iBAS++, Govt Non-iBAS++, Private/Other, Autonomous/Corp |
| `#/user-panel/financial-assets` | Head: Financial Assets | 7 choices: Sanchayapatra, Shares, FDR, Savings Bank, Mudaraba, Debentures, Other |
| `#/user-panel/rent` | Head: Rent Property | Multi-property entries (Residential, Commercial, Land, Factory, etc.), repair allowances |
| `#/user-panel/agriculture` | Head: Agriculture | 5 categories: Crops, Tea/Rubber, Fisheries, Livestock/Poultry, Other; 60% standard cost |
| `#/user-panel/business` | Head: Business / Profession | 11 categories: Retail, Wholesale, Manufacturing, Services, IT, etc.; Turnover & Profit |
| `#/user-panel/capital-gain` | Head: Capital Gains | 13 asset options: Land, Apartment, Listed Shares, Machinery, Motor Vehicles, etc. |
| `#/user-panel/income-from-other-sources` | Head: Other Sources | 11 categories: Dividends, Royalties, Winnings, Director Remuneration, etc. |
| `#/user-panel/firm-etc` | Head: Partnership Firm | Firm name, TIN, share percentage, profit share, partner salary |
| `#/user-panel/aop` | Head: Association of Persons | AoP name, registration/TIN, share percentage, distributed income |
| `#/user-panel/foreign-income` | Head: Foreign Income | Standard ISO country selector, foreign currency, BDT conversion, tax credit |
| `#/user-panel/spouse-income` | Head: Spouse / Minor | 3 relations: Spouse, Daughter, Son; Income attribution |
| `#/user-panel/tax-exempted-income` | Exemption: Sixth Schedule | 11 exemption options; statutory caveat notice |
| `#/user-panel/voluntary-disclosure-income` | Special: First Schedule | Add-row table, income head, particulars, AY, amount, declaration |
| `#/user-panel/rebate` | Step 3: Tax Rebate | Schedule 24D; 12 investment categories; R-002 adapter boundary |
| `#/user-panel/expenditure` | Step 4: Expenditure (IT-10BB) | 9 lifestyle expense lines, subtotals, total |
| `#/user-panel/assets-liabilities` | Step 5: IT-10B Assets & Liabilities | Assets, liabilities, net wealth growth, source of funds reconciliation |
| `#/user-panel/tax-payment` | Step 6: Tax & Payment | Slab tax, minimum tax, withholding TDS/AIT, challans, payment disclaimer |
| `#/user-panel/return-view` | Step 7: Return Preview | Official IT-11GA Return of Income form rendering with Parts I-IV & print CSS |
| `#/user-panel/submission` | Final Submission | Completeness checklist, declaration affirmation, local test filing |
| `#/user-panel/tin-certificate` | Tax Records: TIN Certificate | Pixel-accurate official TIN Certificate layout with print support |
| `#/user-panel/acknowledgement` | Tax Records: Acknowledgement | Official eReturn Acknowledgement Slip with tracking token |
| `#/user-panel/challan-history` | Tax Records: Challan History | Observed 9-column challan table and receipt modal |
| `#/user-panel/certificate-request` | Tax Records: Cert Request | Online request for clearance and return certificates |
| `#/user-panel/certificate-status` | Tax Records: Cert Status | Observed 13-column status tracking table |
| `#/user-panel/return-history` | Tax Records: Return History | Historical return records table |
| `#/user-panel/revised-return` | Special: Revised Return | Section 180 amended return workflow with changed schedules |
| `#/user-panel/audited-accounts` | Special: Audited Accounts | Empty state banner, 5 business types, 3-level note hierarchy |
| `#/user-panel/profile` | Account: Taxpayer Profile | Synthetic profile, editable addresses, eTIN sync simulation |
| `#/user-panel/change-password` | Account: Change Password | Password change with visibility toggles and feedback |

---

## 4. Workstream B 47-Item Gap Register

The application includes an in-app viewer (`Gap Register (47)`) tracking all 47 benchmark items:
- **MATCH (16)**: Faithfully reconstructed features matching authenticated reference audit.
- **CONFLICT (10)**: Authenticated reference defects repaired in the public frontend (e.g. separating help buttons from checkbox labels, correcting the `Recipient's username` label, preventing unconfirmed data purge).
- **NOT VERIFIED (10)**: Backend protocol and live database behaviors explicitly tracked without fabricating live APIs.
- **PARTIAL (9)**: Multi-category statutory rules where frontend UI is complete and adapter contracts are defined.
- **MISSING (2)**: Unresolved legal calculation mappings (**R-002** AY 2026-27 legal rebate and **T-004** statutory delay/surcharge mapping).

---

## 5. Calculation Architecture & Legal Boundary (Prompt Section 22)

```
Taxpayer Input ──────> Form Validation ──────> Calculation Adapter ──────> Display & Print
(User Entered)          (Zod / Sanitized)       ┌─────────────────────┐       (IT-11GA Form)
                                                │ - Pure Aggregation  │
                                                │ - Gated Rules Engine│
                                                │   [FINAL_2026_09_30]│
                                                └─────────────────────┘
```

The application strictly separates:
1. **Taxpayer Input**: Preserved during session transitions.
2. **Form Validation**: Non-statutory input integrity.
3. **Pure Aggregation**: Local mathematical addition of declared line items.
4. **Legal Calculation Adapter**:
   - Canonical Registry: `FINAL_2026_09_30`
   - Rule count: 366
   - Registry SHA-256: `34902bac07a459a4f0c051b90bfe3b4c492f2465d06c661bab18ab7f36252184`
   - Gated status displayed transparently when legal certification is pending.

---

## 6. Build and Test Instructions

### Prerequisites
- Node.js 18+ / 20+ / 22+
- npm or bun

### Setup & Run
```bash
# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Run automated acceptance test suite
npm test

# Typecheck and lint
npm run lint

# Compile production build
npm run build
```

---

## 7. Development Tools & Session Management

- **Language Toggle**: Instant toggle between English and বাংলা (including numbers converted to ০-৯).
- **Draft JSON Export**: Download complete session return draft (`eReturn_Draft_TIN_AY.json`).
- **Draft JSON Import**: Upload existing draft JSON to resume preparation.
- **Reset to Blank**: Clear session to test clean empty states.
- **Load Verified Fixture**: Restore complete multi-head test data.
