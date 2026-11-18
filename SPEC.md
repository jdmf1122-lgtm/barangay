# B-CONNECT — Specification: Hallmark Systematic Redesign & Unslop Plan

**Target System:** B-CONNECT — Multi-Agency Incident Reporting, Emergency Dispatch & Governance System  
**Jurisdiction:** Municipality of Roxas, Oriental Mindoro, Philippines (All 20 Barangays)  
**Date:** 2026-11-17  
**Status:** COMPLETED (WP-01 through WP-08 Complete & Verified)  
**System Contract:** [DESIGN.md](DESIGN.md) · [tokens.css](src/tokens.css) · [base.css](src/base.css)

---

## 1. Executive Summary & Problem Statement

Initial static analysis of the B-CONNECT codebase revealed pervasive AI-generated design slop across 32 files (**305 FAILs, 20 REFLEX, 72 WARNs** under Hallmark audit):
1. **Embossed Neomorphism & Fake 3D**: `src/index.css` and `AuthPage.tsx` relied on 50+ lines of custom soft-UI classes (`.neo-card`, `.neo-sphere-decor`, `.neo-ring-decor`, `.neo-btn-pill`), bloated box-shadows, and hardcoded radial gradient washes.
2. **Transition Misuse & Animation Lag**: Pervasive `transition: all` rules across interactive buttons, cards, and dropdowns, inducing unnecessary browser composite recalculations.
3. **Palette Chaos & Un-tokenized Hex Literals**: Hundreds of arbitrary hardcoded color classes (`bg-[#0a1628]`, `text-[#0c2e1f]`, `ring-[#0f532a]/60`, `drop-shadow-[0_0_15px_rgba(249,115,22,0.25)]`) bypassing CSS variables and theme tokens.
4. **Copy & Typography Tells**: Glued arrows (`Register here →`), middle-dot meta chains (`Community • Service • Progress`), emoji in `<option>` dropdowns, and tiny tracked uppercase small-caps (`MORE THAN A PORTAL`).
5. **Accessibility Gaps**: Lack of `:focus-visible` styling, missing `prefers-reduced-motion` fallbacks, unlabelled SVGs, and mobile horizontal scrollbar overflows (`calc(100vw - 24px)`).

### Core Objective
Execute a comprehensive, phased redesign across all B-CONNECT application views using Hallmark standards for high-density app screens, eliminating all slop while strictly preserving:
- All form fields, handlers, and validation routines.
- `BroadcastChannel` and Supabase Realtime synchronization channels.
- Emergency dispatch audio siren loops and escalation monitor daemons.
- The 20-barangay jurisdictional data structures.
- Offline demo persona authentications.

---

## 2. System Architecture & Role Boundaries

```text
[ Browser Client — B-CONNECT Front-End ]
  │
  ├──► App.tsx (Root Layout Shell & Agency Theme Provider)
  │      │
  │      ├── (Unauthenticated) ──────────────────────────► AuthPage.tsx [WP-01 COMPLETED]
  │      │
  │      └── (Authenticated Shell) ───────────────────────► [WP-02: App Shell & Chrome]
  │             ├── Header.tsx (Agency Badge, Notifications, Role Switcher)
  │             ├── Sidebar.tsx (Collapsible Agency Navigation)
  │             ├── MobileBottomNav.tsx (Responsive Mobile Tab Bar)
  │             └── EmergencyAccidentAlarmModal.tsx (Emergency Siren & Dispatch Modal)
  │
  ├──► [WP-03: Resident Portal] ───► ResidentPortalView.tsx (Submit Report, My Reports, Photo Evidence)
  │
  ├──► [WP-04 & WP-05: MDRRMO] ────► MdrrmoDashboard.tsx (Real-Time Queue, Triage Controls)
  │                                 ├── CaseList.tsx & CaseDetailModal.tsx (Chronology & Docket)
  │                                 ├── NewCaseModal.tsx (Crash Dynamics & Vehicle Capture)
  │                                 └── GraphNetworkView.tsx & GeospatialGraphMap.tsx (Hotspot Graph)
  │
  └──► [WP-06 & WP-07: LGU & Admin] ─► LguDashboard.tsx (Statutory Escalation & Overdue Interventions)
                                    ├── TransparencyDashboard.tsx (DILG Transparency KPIs)
                                    ├── AnnualNarrativeReport.tsx & StandardReportsView.tsx
                                    ├── AuditTrailView.tsx (Immutable System Log Grid)
                                    └── SystemAdminView.tsx (Escalation Policy & Carrier SMS)
```

### Role Scope & Permissions Matrix
| Role | Agency | Default View | Access Scope | Target Work Packages |
| :--- | :--- | :--- | :--- | :--- |
| **`RESIDENT`** | Resident Citizen | `ResidentPortalView` | Submit incidents with photos, track personal filed reports, read public updates. | **WP-03** |
| **`MDRRMO`** | MDRRMO Operations | `MdrrmoDashboard` | Municipal incident queue, audio dispatch siren, crash dynamics, geospatial network graph. | **WP-04, WP-05** |
| **`LGU`** | Municipal LGU Exec | `LguDashboard` | Statutory escalation interventions, executive directives, DILG transparency, narrative reports. | **WP-06, WP-07** |
| **`ADMIN`** | System & IT Admin | `SystemAdminView` | Officer account directory, escalation timing policy daemon, SMS carrier gateway, audit trails. | **WP-07** |

---

## 3. Hallmark App Screen Design Standards

Per Hallmark guidelines for internal application screens (`flow.md` § App screens), the marketing rules step aside and the following engineering principles apply:

1. **Density is the Design**:
   - Control heights: **32px to 40px** with minimum **44px** touch hit targets.
   - Tables and dense data grids take priority over cards. A table may run wider than prose measures.
   - Hairline borders (`var(--rule-hair): 1px`) in `var(--color-rule)` separate data regions cleanly.
2. **Four Data-Loading States for Every Dynamic Region**:
   - **Loading**: Skeleton placeholder in the exact shape of incoming data.
   - **Empty**: Contextual text explaining what belongs here and the primary action button to create/submit it.
   - **Error**: Explicit message stating what broke and a retry action button.
   - **Full**: High-density structured data presentation with tabular numerals.
3. **Restrained Color Hierarchy**:
   - Paper & Ink: `bg-paper` (`#fafbf9`), `bg-paper-2` (`#f2f6f3`), `text-ink` (`#0f1d16`), `text-muted` (`#5c7768`).
   - Accent: Primary action buttons and selected nav items in `var(--color-accent)` (`#0b6638`).
   - Agency Identifiers:
     - MDRRMO Emergency Triage: Amber/Orange (`var(--color-warning)`).
     - LGU Executive Oversight: Municipal Green (`var(--color-accent)`).
     - Overdue Statutory Alerts: Deep Rose/Red (`var(--color-error)`).
4. **Typography & Numbers**:
   - Headings, labels, and table headers: Plus Jakarta Sans in sentence case, normal tracking (no tracked small-caps).
   - Figures, docket codes, timestamps, coordinates, and countdown timers: JetBrains Mono or Plus Jakarta Sans with `font-variant-numeric: tabular-nums`.

---

## 4. Work Package Decomposition

### WP-01: Design Foundation & Public Gateway *(COMPLETED)*
- **Files**: `src/tokens.css`, `src/base.css`, `src/index.css`, `src/components/auth/AuthPage.tsx`, `DESIGN.md`.
- **Accomplishments**: 91 FAILs eliminated (0 FAIL, 0 REFLEX, 0 WARN). Hallmark CSS stamp added. 24/24 interactive handlers preserved. Vite build verified.

---

### WP-02: Application Shell, Navigation & Global Modals
- **Files**:
  - `src/App.tsx`
  - `src/components/common/Header.tsx`
  - `src/components/common/Sidebar.tsx`
  - `src/components/common/MobileBottomNav.tsx`
  - `src/components/common/EmergencyAccidentAlarmModal.tsx`
  - `src/components/common/CreateNotificationModal.tsx`
- **Key Tasks**:
  1. Remove hardcoded background hex values (`#fcfaf8`, `#f5fbf7`) in `App.tsx` and bind to semantic tokens `bg-paper` and `bg-paper-2`.
  2. Redesign `Header.tsx`: standard height (56px), clean agency badge, tokenized notifications popover (fix `width: 100%` viewport overflow).
  3. Redesign `Sidebar.tsx`: high-density 36px navigation rows, active state in `bg-paper-3 text-ink font-semibold`, remove bouncy transitions.
  4. Redesign `MobileBottomNav.tsx`: clean 4-tab mobile bar with safe-area padding (`--sab`).
  5. Unslop `EmergencyAccidentAlarmModal.tsx`: high-visibility emergency dispatch siren dialog with clean high-contrast action buttons, preserving audio alarm loop triggers.
  6. Unslop `CreateNotificationModal.tsx`: sentence-case form labels, eliminate bouncing icon (Reflex 12).
- **Verification Target**: `sloplint` on WP-02 files with 0 FAILs; all navigation and alarm triggers verified.

---

### WP-03: Resident Citizen Portal (`RESIDENT` Scope)
- **Files**:
  - `src/components/resident/ResidentPortalView.tsx`
- **Key Tasks**:
  1. Redesign Overview Tab: replace blurred decorative orbs (Gate 29) with clean civic statistics cards in tabular numerals.
  2. Redesign Submit Report Form: clean photo evidence drag-and-drop zone, Sitio input, crash type selector, and urgent dispatch toggle.
  3. Redesign My Reports Tab: timeline milestone chronology tracker for filed complaints with verified status badges.
  4. Implement explicit loading, empty, and error states.
  5. Remove glued arrows (`View All →`) and eliminate three-period ellipses.
- **Verification Target**: `sloplint` 0 FAILs; report submission and photo upload handlers 100% verified.

---

### WP-04: MDRRMO Emergency Operations & Case Queue
- **Files**:
  - `src/components/dashboards/MdrrmoDashboard.tsx`
  - `src/components/cases/CaseList.tsx`
  - `src/components/cases/CaseDetailModal.tsx`
  - `src/components/cases/NewCaseModal.tsx`
- **Key Tasks**:
  1. Unslop `MdrrmoDashboard.tsx`: real-time emergency queue with high-contrast urgency tags (Critical, Urgent, Standard), eliminating neomorphic cards and hardcoded gradients.
  2. Redesign `CaseList.tsx`: dense operational data table with column headers in sentence case, filter controls for 20 barangays, and search input.
  3. Redesign `CaseDetailModal.tsx`: structured case dossier layout with chronological event log, photo evidence carousel, and agency intervention notes.
  4. Redesign `NewCaseModal.tsx`: structured accident registration modal, vehicle dynamics, road condition inputs, and involved parties list.
- **Verification Target**: `sloplint` 0 FAILs; triage action triggers, status updates, and audio alarm acknowledgment verified.

---

### WP-05: Incident Graph Network & Geospatial Map
- **Files**:
  - `src/components/graph/GraphNetworkView.tsx`
  - `src/components/graph/GeospatialGraphMap.tsx`
  - `src/utils/graphEngine.ts`
- **Key Tasks**:
  1. Unslop `GraphNetworkView.tsx`: replace arbitrary dark canvas hex colors with tokenized slate/paper palettes; format cluster node controls.
  2. Refactor `GeospatialGraphMap.tsx`: clean Leaflet popup markup, accessible marker legends, and high-contrast barangay boundary overlays.
  3. Ensure network simulation parameters run smoothly with `prefers-reduced-motion` detection.
- **Verification Target**: `sloplint` 0 FAILs; Leaflet map tile rendering and force-directed graph node interactivity verified.

---

### WP-06: LGU Executive Oversight & Statutory Escalation Engine
- **Files**:
  - `src/components/dashboards/LguDashboard.tsx`
  - `src/components/dashboards/TransparencyDashboard.tsx`
  - `src/hooks/useEscalationMonitor.ts`
- **Key Tasks**:
  1. Redesign `LguDashboard.tsx`: executive intervention action bar for overdue emergency cases with real-time escalation timer badges.
  2. Redesign `TransparencyDashboard.tsx`: municipal performance indicators, dispute resolution rates, and inter-agency coordination metrics.
  3. Replace invented trend percentage icons with verified empirical metrics (Gate 46a).
  4. Fix TypeScript comparison bug in `TransparencyDashboard.tsx` (TS2367 status comparison).
- **Verification Target**: `sloplint` 0 FAILs; `useEscalationMonitor` SMS trigger and executive directive buttons verified.

---

### WP-07: Governance Reports, Audit Logs & System Administration
- **Files**:
  - `src/components/reports/AnnualNarrativeReport.tsx`
  - `src/components/reports/StandardReportsView.tsx`
  - `src/components/audit/AuditTrailView.tsx`
  - `src/components/admin/SystemAdminView.tsx`
  - `src/components/auth/CreateAccountModal.tsx`
  - `src/components/auth/EditAccountModal.tsx`
- **Key Tasks**:
  1. Redesign `AnnualNarrativeReport.tsx`: formal print-ready civic report layout with official seal headers and executive signature blocks.
  2. Redesign `StandardReportsView.tsx`: clean tabular summaries by barangay and category with CSV export button.
  3. Redesign `AuditTrailView.tsx`: dense security audit log grid with monospace timestamps and IP/Actor badges.
  4. Redesign `SystemAdminView.tsx`: eliminate emoji options in escalation duration select (Gate 30a); style carrier SMS configuration cards.
  5. Refactor `CreateAccountModal.tsx` and `EditAccountModal.tsx`: clean form inputs and accessible validation.
- **Verification Target**: `sloplint` 0 FAILs; CSV download and account management operations verified.

---

### WP-08: Full Platform Sweep, Regression Hardening & Handoff
- **Files**: All files across `src/`
- **Key Tasks**:
  1. Run full codebase Hallmark sweep: `node /home/keil/.gemini/config/skills/hallmark/scripts/sloplint.mjs src --genre modern-minimal --scope app`.
  2. Confirm 0 FAILs across all 32 components.
  3. Execute `npm run lint` (`tsc --noEmit`) and verify 0 TypeScript errors.
  4. Execute `npm run build` (`vite build`) and verify clean production bundle.
  5. Generate final Hallmark handoff report with before/after findings matrix.
- **Verification Target**: Complete platform verification with 0 regressions.

---

## 5. Verification & Testing Strategy

Every work package must produce verifiable runtime proof before being marked complete in [PROGRESS.md](PROGRESS.md):
- **Mechanical Static Linter**: `sloplint.mjs` executing against all modified files.
- **TypeScript Strict Check**: `npm run lint` passing without errors.
- **Production Bundler**: `npm run build` compiling client assets in under 30 seconds.
- **Kept Wiring Assertion**: No dropped form inputs, event handlers, or realtime channels.
