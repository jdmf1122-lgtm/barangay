# B-CONNECT: Multi-Agency Incident Reporting, Emergency Dispatch & Governance System

**B-CONNECT** is an integrated emergency incident reporting, dispatch, and municipal oversight platform built for the **Municipality of Roxas, Oriental Mindoro** (covering all 20 Barangays). It connects **Resident Citizens**, the **Municipal Disaster Risk Reduction and Management Office (MDRRMO)**, and the **Local Government Unit (LGU)** through real-time case tracking, automated emergency alerts, geospatial/network graph analytics, and statutory escalation monitoring.

---

## Key Features

### 1. Resident Citizen Portal
- ** Barangay-Scoped Registration & Authentication:** Residents of any of the 20 barangays in Roxas can register and manage their own personal account.
- **Incident & Vehicular Accident Reporting:** Submit incident reports with auto-detected crash/incident classification, Sitio location, date/time, urgency level, and photo evidence uploads.
- **Personal Report Tracker (`My Reports`):** Strictly isolated per account so residents only view and track the real-time status and timeline milestones of their own submitted reports.

### 2. MDRRMO Emergency Operations & Dispatch Hub
- **Real-Time Emergency Incident Queue:** Instant cross-tab (`BroadcastChannel`) and cross-device (`Supabase Realtime`) synchronization of incoming citizen accident reports.
- **Emergency Alarm & Acknowledgment System:** Visual and audio emergency dispatch alerts with automated SMS responder notifications and recurring alert intervals until an officer marks the incident as **Seen & Responded**.
- **Interactive Graph & Geospatial Network (`GraphNetworkView` & `GeospatialGraphMap`):** Visualizes relationships between incidents, barangay hotspots, categories, and responding units across Roxas, Oriental Mindoro.

### 3. LGU Executive Oversight & Auto-Escalation Engine
- **Automated Statutory Escalation (`useEscalationMonitor`):** Continuously monitors unacknowledged emergency incidents and automatically escalates overdue cases to the LGU Executive Office with SMS notification dispatch.
- **LGU Executive Dashboard:** Enables the Municipal Administrator and LGU officers to issue executive directives (`MDRRMO Mobilized`, `Municipal Team Dispatched`, `Under Review`, `Resolved by LGU`), monitor KPIs, and review inter-agency transparency metrics.
- **Governance & Narrative Reports:** Generates Annual Narrative Reports, Standard Operational Reports, CSV exports, and an immutable System Audit Trail.

---

## User Roles & Official Accounts

| Role / Agency | Access Scope | Default / Fixed Credentials |
| :--- | :--- | :--- |
| **Resident Citizen (`RESIDENT`)** | Submit incident reports with photo evidence and track personal filed reports. | Register via the **Resident Register** tab on the login page |
| **MDRRMO (`MDRRMO_ADMIN`)** | Municipal-wide emergency incident queue, triage, dispatch, and incident graph. | **Email:** `mdrrmoroxas@gmail.com`<br>**Password:** `mdrrmo2026` |
| **LGU (`LGU_ADMINISTRATOR`)** | Executive oversight, escalated cases intervention, transparency KPIs, audit logs, and system admin. | **Email:** `lguroxas@gmail.com`<br>**Password:** `lguroxas2026` |

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Maps & Graph Analytics:** Leaflet (`GeospatialGraphMap`), Custom Force/Network Graph Engine (`graphEngine.ts`)
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Realtime Channels, Storage Buckets) + Express/Node.js API Server (`server.ts`)
- **Build Tooling:** Vite 6, `tsx`, `concurrently`

---

## Project Structure

```text
barangay/
├── public/                        # Static assets & official agency logos
├── src/
│   ├── components/
│   │   ├── admin/                 # SystemAdminView (accounts, escalation policy, config)
│   │   ├── audit/                 # AuditTrailView (immutable security & activity logs)
│   │   ├── auth/                  # AuthPage, CreateAccountModal, EditAccountModal
│   │   ├── cases/                 # CaseList, CaseDetailModal, NewCaseModal
│   │   ├── common/                # Header, Sidebar, MobileBottomNav, EmergencyAccidentAlarmModal
│   │   ├── dashboards/            # MdrrmoDashboard, LguDashboard, TransparencyDashboard
│   │   ├── graph/                 # GraphNetworkView, GeospatialGraphMap
│   │   ├── reports/               # AnnualNarrativeReport, StandardReportsView
│   │   └── resident/              # ResidentPortalView (Overview, Submit Report, My Reports)
│   ├── context/                   # AuthContext, CaseContext, NotificationContext, UIContext
│   ├── data/                      # seedData.ts, barangayGeoData.ts (20 Barangays of Roxas)
│   ├── hooks/                     # useAuth, useCases, useNotifications, useEscalationMonitor, useUI
│   ├── utils/                     # incidentClassifier, escalationService, smsService, graphEngine, supabaseClient
│   ├── App.tsx                    # Main role-based router & layout shell
│   └── types.ts                   # Core TypeScript interfaces & constants
├── server.ts                      # Express backend server for admin sync & SMS/API endpoints
├── package.json
└── vite.config.ts
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

### 2. Installation
Clone the repository and install dependencies:

```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure your Supabase and optional backend/SMS credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3001
```

### 4. Running the Application
Start both the Vite frontend client and the Express backend server concurrently:

```bash
npm run dev
```

Or run them individually:

```bash
# Start frontend dev server (http://localhost:3000)
npm run dev:client

# Start backend server
npm run dev:server
```

### 5. Building for Production
Type-check and build the production bundle:

```bash
npm run lint
npm run build
```

---

## Covered Jurisdiction (20 Barangays of Roxas, Oriental Mindoro)

Bagumbayan, Cantil, Dangay, Happy Valley, Libertad, Libtong,Little Tanauan, Mabuhay, Maraska, Odiong, Paclasan, San Aquilino, San Isidro, San Jose, San Mariano, San Miguel, San Rafael, San Vicente, Uyao, and Victoria.
