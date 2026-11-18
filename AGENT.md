# B-CONNECT — Agent Rules & Governance Protocol

## Before any task

Read [SPEC.md](SPEC.md), [PROGRESS.md](PROGRESS.md), and [DESIGN.md](DESIGN.md) in full. If instructions conflict with any chat prompt, the files win — flag the conflict immediately and pause.

---

## Core Purpose

**B-CONNECT** is the integrated emergency incident reporting, dispatch, and municipal oversight platform for the **Municipality of Roxas, Oriental Mindoro**, covering all 20 Barangays.

The system connects four official user roles:
1. **Resident Citizens (`RESIDENT`)**: File verified vehicular crash, accident, and community incident reports with photo uploads, and track real-time docket milestones in *My Reports*.
2. **MDRRMO (`MDRRMO_ADMIN` / `MDRRMO`)**: Municipal Disaster Risk Reduction & Management Office operating the real-time emergency dispatch queue, siren alarms, triage, and geospatial graph analytics.
3. **LGU Executive (`LGU_ADMINISTRATOR` / `LGU`)**: Municipal Administrator and Mayor's Executive Staff monitoring statutory escalation timeouts, issuing executive directives, and tracking DILG transparency metrics.
4. **System Administrator (`ADMIN`)**: Municipal IT and Node Administrator configuring escalation timeout policies, carrier SMS dispatch templates, and managing system audit trails.

---

## Active Phase: Hallmark Multi-Screen Unslop & Systematic Redesign

The design foundation and public gateway ([WP-01](file:///home/keil/barangay/src/components/auth/AuthPage.tsx)) are complete (0 FAILs, 24/24 handlers kept, production build verified). The active phase executes the systematic redesign of the internal application screens ([WP-02 through WP-08](file:///home/keil/barangay/SPEC.md)), eliminating all AI-generated slop patterns while preserving 100% of functional wiring, Supabase realtime synchronization, and emergency audio alarms.

---

## Hard Rules

- **Work Package Scope**: Implement exactly **one work package per session** (from [SPEC.md](SPEC.md) and [PROGRESS.md](PROGRESS.md)). Stop cleanly at its boundary. Never modify out-of-scope modules autonomously.
- **Approved Tech Stack**:
  - **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion 12, Lucide React, Leaflet.
  - **Backend**: Express + Node.js (`server.ts` with TypeScript execution via TSX).
  - **Database & Realtime**: Supabase (PostgreSQL, Supabase Auth, Realtime Channels, Storage).
  - **Styling Architecture**: Semantic tokens declared in [src/tokens.css](file:///home/keil/barangay/src/tokens.css) and reset in [src/base.css](file:///home/keil/barangay/src/base.css) via [DESIGN.md](file:///home/keil/barangay/DESIGN.md).
- **Hallmark Floor Invariants (Non-Waivable)**:
  - **Zero Literal Colors**: Every color must resolve to a token from `tokens.css` (`bg-paper`, `text-ink`, `border-rule`, `bg-accent`, `text-error`, etc.). No arbitrary hex literals (`bg-[#0a1628]`, `text-[#0c2e1f]`).
  - **Never `transition: all`**: Always specify explicit transitions (`transition-colors`, `transition-opacity`, `transition-transform`). Never animate `width`, `height`, `top`, or `left`.
  - **Accessible Focus**: Every interactive button, input, tab, and select must carry instant `:focus-visible:ring-2 focus-visible:ring-focus`.
  - **Motion Discipline**: Support `prefers-reduced-motion: reduce`. Motion is state-driven, never ambient decoration (no bouncing badges or spinning floating spheres).
  - **No Hand-Drawn Slop**: No card-inside-a-card (Gate 4), no blurred orbs or fake glass (Gate 29), no emoji in select options (Gate 30a), no glued arrows (Gate 63: `→`), and no tracked uppercase small caps (Gate 67).
  - **Tabular Figures**: Every numeric statistic, case docket number, timestamp, and countdown must use `font-variant-numeric: tabular-nums` or `num` utility.
- **System & Domain Invariants**:
  - **Preserve Wiring & State**: Never drop or alter form handlers, context hooks (`useCases`, `useAuth`, `useUI`, `useNotifications`), Supabase realtime subscriptions, or Leaflet map layers.
  - **Official Fixed Credentials**: Maintain fixed credential availability (`mdrrmoroxas@gmail.com` / `mdrrmo2026`, `lguroxas@gmail.com` / `lguroxas2026`) and instant demo persona access for evaluation and thesis defense.
  - **Dual-Mode Offline Fallback**: Always maintain offline/demo state fallbacks so evaluators and municipal personnel can operate the platform without live backend dependencies.

---

## Definition of Done for a Work Package

1. `npm run build` (`vite build`) bundles cleanly with 0 compilation errors.
2. `node /home/keil/.gemini/config/skills/hallmark/scripts/sloplint.mjs <target-files> --genre modern-minimal --scope app` reports **0 FAILs**.
3. All interactive handlers, forms, and test IDs within target files are fully preserved and accounted for.
4. Deliverables specified in [SPEC.md](SPEC.md) for the work package are fully implemented.
5. [PROGRESS.md](PROGRESS.md) is updated with deliverable summaries and checked-off checklists (`[x]`).
6. Git status is clean and reflects only files belonging to the assigned work package.

---

## Do Not

- Touch or modify components outside the assigned work package scope.
- Re-introduce neomorphic styling, 3D radial gradients, or arbitrary box-shadows.
- Hardcode Supabase service role keys or sensitive credentials in client bundles.
- Drop or rename existing component props, test IDs, or Supabase realtime channels.
- Mark any deliverable complete without verifiable build and sloplint evidence.
