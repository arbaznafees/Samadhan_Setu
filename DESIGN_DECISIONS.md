# Design System & Architectural Decisions: Samadhan Setu Jharkhand

**Version:** 2.1.0  
**Status:** APPROVED  
**Scope:** Complete UI/UX Redesign, Design Token System, and Role-Isolated Layout Architecture

---

## 1. Executive Summary & Vision

Samadhan Setu Jharkhand is evolving from a single monolithic dark-navy landing page with role tabs into **four genuinely distinct, production-grade web application experiences** alongside an accessible public portal.

### Core Architectural Principles
1. **Light-Theme First & Civic Dignity:** Transition from dark gaming/tech aesthetic to a crisp, high-trust civic visual standard (crisp neutral backgrounds, authoritative deep navy, purposeful gold accents).
2. **Strict Persona Separation:** Zero role tabs or multi-role bleed in authenticated sessions. Once logged in, users interact *exclusively* with their dedicated application shell tailored to their functional workflow. Persona isolation is enforced at the routing/middleware level (unauthorized role paths return redirect/403).
3. **Four Real Products, One Cohesive Language:** Citizen (Mobile-first PWA), HEI (Project & Research Management), Industry (CSR / Deal Flow & R&D), and Government (Dense BI & Analytics Operations).
4. **Accessible & Predictable Tokens:** Strict contrast ratios (WCAG 2.1 AA compliant), explicit color ratios, unified typography scales with multilingual font fallbacks, keyboard focus rings, and atomic component primitives.

---

## 2. Color System & Design Tokens

### 2.1 The 70-20-10 Palette Ratio
To preserve institutional trust and avoid looking like an athletic team, the color balance is strictly governed:
* **70% Neutrals & Base Whites:** Clean canvas, crisp cards, subtle borders, high readability.
* **20% Deep Institutional Navy:** Page headers, sidebars (strictly capped at 260px max width), navigation anchors, primary text, dark buttons.
* **10% Warm Gold / Amber Accent:** Action triggers, active state indicators, focus rings, key status badges (strictly accent-only, never full background flood).

```
┌─────────────────────────────────────────────────────────────┐
│ 70% Base Neutrals (White / Slate Tint / Soft Gray)           │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ 20% Deep Navy (Nav / Sidebars / High-Contrast Text)  │  │
│   │                                                      │  │
│   │   ┌──────────────────────────────────────────────┐   │  │
│   │   │ 10% Gold Accent (Active Dots, CTAs, Rings)   │   │  │
│   │   └──────────────────────────────────────────────┘   │  │
│   └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2 Base Neutrals & Surfaces
| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `surface-base` | `#FFFFFF` | Primary card background, modal surface, clean inputs |
| `surface-subtle` | `#F8FAFC` | Page background, table header hover, dashboard canvas |
| `surface-sunken` | `#F1F5F9` | Secondary card fills, subtle segment switchers, skeleton base |
| `border-subtle` | `#E2E8F0` | Card borders, table dividers, input borders |
| `border-strong` | `#CBD5E1` | Active input borders, modal outlines, header dividers |
| `text-primary` | `#0F172A` | Primary headings, table text, high-emphasis content |
| `text-secondary` | `#475569` | Supporting body text, form field labels, metadata |
| `text-muted` | `#94A3B8` | Placeholder text, disabled labels, timestamp hints |

---

### 2.3 Primary Navy Palette
| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `navy-sidebar` | `#001733` | Deepest navy for HEI/Industry/Govt sidebar background (Max 260px) |
| `navy-primary` | `#002147` | Institutional primary — Topbars, Primary CTA buttons, Brand titles |
| `navy-interactive`| `#0A3161` | Button hover states, active navigation pills |
| `navy-subtle` | `#E6EDF5` | Navy tint for subtle badges, secondary button background |
| `navy-border` | `#B3C9E2` | Border accents for navy badge containers |

---

### 2.4 Secondary Accent: Gold / Sunburst
*Rule: Never use as large background fills. Use for actionable focus, active nav pills, star ratings, and accent highlights.*

| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `gold-accent` | `#FED65B` | Primary gold highlight, active nav indicator dot, CTA border |
| `gold-hover` | `#E8BE40` | Hover state for gold actionable elements |
| `gold-surface` | `#FEF9E7` | Extremely subtle gold background tint for featured items |
| `gold-text` | `#854D0E` | High-contrast accessible amber text on gold surfaces |
| `gold-border` | `#FDE68A` | Light gold accent border |

---

### 2.5 Semantic Status Tokens (Exact Values)
Standardized across all reports, proposals, solutions, and audit logs.

| State | Status Name | Badge Fill | Border | Text Hex | Icon/Dot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Submitted** | Grievance / Proposal logged | `#E0F2FE` | `#BAE6FD` | `#0369A1` | `#0284C7` (Sky) |
| **Assigned** | Allocated to HEI / Dept | `#EEF2FF` | `#C7D2FE` | `#3730A3` | `#4F46E5` (Indigo) |
| **In-Progress** | Under active R&D / work | `#FEF3C7` | `#FDE68A` | `#92400E` | `#D97706` (Amber) |
| **Resolved** | Completed & verified | `#D1FAE5` | `#A7F3D0` | `#065F46` | `#059669` (Emerald) |
| **Duplicate** | AI flagged / grouped | `#FFE4E6` | `#FECDD3` | `#9F1239` | `#E11D48` (Rose) |
| **Funded** | CSR / Industry matched | `#CCFBF1` | `#99F6E4` | `#115E59` | `#0D9488` (Teal) |
| **Rejected / Closed** | Ineligible or closed | `#F1F5F9` | `#E2E8F0` | `#334155` | `#64748B` (Slate) |

---

## 3. Typography Hierarchy & Multilingual Font Stacks

### 3.1 Font Families & Multilingual Fallbacks
To support English, Hindi, and regional scripts without rendering system default fallbacks, the font stack integrates **Noto Sans Devanagari**:
* **Display & Headings:** `Poppins`, `"Noto Sans Devanagari"`, sans-serif (`font-heading`, `font-poppins`).
* **Body & Data Tables:** `Inter`, `"Noto Sans Devanagari"`, sans-serif (`font-sans`, `font-inter`).
* **Code & Track IDs:** `JetBrains Mono`, `ui-monospace`, monospace (e.g. `JH-GR-2026-0891`).

### 3.2 Type Scale
| Level | Font | Weight | Size (Desktop / Mobile) | Line Height | Tracking | Tailwind Equivalent | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Poppins | Bold (700) | `2.25rem (36px)` / `1.875rem` | 1.2 | `-0.02em` | `text-3xl md:text-4xl font-bold font-heading` | Public Hero, Main Portal Welcome |
| **H1** | Poppins | SemiBold (600) | `1.75rem (28px)` / `1.5rem` | 1.25 | `-0.015em` | `text-2xl md:text-3xl font-semibold font-heading` | Page Title in App Shells |
| **H2** | Poppins | SemiBold (600) | `1.375rem (22px)` / `1.25rem` | 1.3 | `-0.01em` | `text-xl md:text-2xl font-semibold font-heading` | Section Headers, Modal Titles |
| **H3** | Poppins | Medium (500) | `1.125rem (18px)` / `1.0625rem` | 1.35 | `0` | `text-lg font-medium font-heading` | Card Titles, Drawer Headers |
| **H4** | Inter | SemiBold (600) | `1.0rem (16px)` | 1.4 | `0` | `text-base font-semibold font-sans` | Widget Subheads, Metric Labels |
| **Body Large** | Inter | Regular (400) | `1.0625rem (17px)` | 1.5 | `0` | `text-[17px] leading-relaxed font-sans` | Article lead, Citizen intro copy |
| **Body Base** | Inter | Regular (400) | `0.9375rem (15px)` | 1.5 | `0` | `text-[15px] leading-normal font-sans` | Standard body text, form fields |
| **Body Small** | Inter | Regular (400) | `0.8125rem (13px)` | 1.45 | `0` | `text-xs md:text-sm font-sans text-slate-600` | Data table cells, list metadata |
| **Caption / Badge** | Inter | Medium (500) | `0.6875rem (11px)` / `0.75rem` | 1.3 | `+0.02em` | `text-xs font-medium uppercase tracking-wider` | Status badges, timestamps |
| **Button Text** | Inter | SemiBold (600) | `0.875rem (14px)` | 1.0 | `0` | `text-sm font-semibold` | Action buttons, tabs |
| **Monospace ID**| Mono | Medium (500) | `0.8125rem (13px)` | 1.2 | `0` | `font-mono text-xs font-medium` | Tracking IDs, Hash references |

---

## 4. Layout Architecture & Role-Specific Shells

```
                                  ┌───────────────────────────────┐
                                  │   PUBLIC MARKETING & LOOKUP   │
                                  │ (Clean Nav + Hero + Tracking) │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                       ┌─────────────────────┐
                                       │ AUTH / RBAC ROUTER  │
                                       └──────────┬──────────┘
             ┌──────────────────────┬─────────────┴──────────────┬──────────────────────┐
             │                      │                            │                      │
             ▼                      ▼                            ▼                      ▼
    ┌─────────────────┐   ┌───────────────────┐        ┌───────────────────┐   ┌───────────────────┐
    │  CITIZEN SHELL  │   │     HEI SHELL     │        │  INDUSTRY SHELL   │   │    GOVT SHELL     │
    ├─────────────────┤   ├───────────────────┤        ├───────────────────┤   ├───────────────────┤
    │ Mobile-First    │   │ Academic Research │        │ Deal-Flow / CRM   │   │ BI & Operations   │
    │ Bottom Nav Bar  │   │ Sidebar (<=260px) │        │ Sidebar (<=260px) │   │ Sidebar (<=260px) │
    │ Card-based Feed │   │ Problem Intake    │        │ Solution Explorer │   │ Dense Multi-Tier  │
    │ Camera/Audio    │   │ Solution Builder  │        │ CSR Funding Cart  │   │ KPI Stat Strips   │
    │ Tracking Steps  │   │ Team Collaboration│        │ Milestone Release │   │ Map & Live Grid   │
    └─────────────────┘   └───────────────────┘        └───────────────────┘   └───────────────────┘
```

### 4.1 Strict Persona Isolation Rule & Sidebar Dimension Cap
* **Enforced Persona Isolation:** A user authenticated with a specific role will only ever access that role's route tree. Attempts to access other shells directly via URL trigger immediate redirect to the authorized shell or login with a 403 authorization boundary.
* **Sidebar Dimension Cap:** HEI, Industry, and Govt sidebars are **strictly capped at `260px` maximum width** (`w-[260px] max-w-[260px] shrink-0`) to maintain the 20% navy-to-neutral ratio regardless of future navigation items.
* **Zero Role Tabs in App Navigation:** Role switching is strictly an administrative simulation capability for demo/debug modes; never a visible tab in the production user experience.

---

### 4.2 Experience 1: Public Marketing & Tracking Portal (`/`)
* **Purpose:** Public awareness, civic transparency, zero-login grievance status tracker, role login gateway.
* **Layout Structure:**
  * **Top Header:** Clean white bar with Jharkhand Government Emblem + Samadhan Setu brand mark, quick track input, and "Sign In / Register" CTA button.
  * **Hero Section:** Light neutral backdrop (`#F8FAFC`), crisp high-contrast typography, dual primary actions: *"File a Citizen Grievance"* (Gold accent trigger) and *"Explore Open Problems"* (Navy button).
  * **Public Live Stats:** 4-metric counter strip (Grievances Solved, HEIs Active, Industry CSR Committed, Avg Resolution Time).
  * **Universal Tracking Lookup:** Direct input box for reference ID `JH-GR-XXXX` rendering a clean modal progress stepper without requiring full login.
  * **Footer:** Institutional disclosures, helpline numbers, department directory.

---

### 4.3 Experience 2: Citizen Experience (`/citizen/*`)
* **Purpose:** High accessibility, low cognitive load, multilingual Hindi/English support, rapid voice/photo complaint filing, clear milestone tracking.
* **Layout Structure:**
  * **Mobile-First PWA Shell:**
    * **Top Header:** Simplified mobile top bar: User avatar, location selector (District/Panchayat), Language switcher (`EN / हिं`), Notification bell.
    * **Bottom Navigation Bar (Mobile):** 4 sticky tabs:
      1. `Home` (Recent activity, summary status)
      2. `File Grievance` (Floating gold-bordered camera/audio button)
      3. `My Reports` (Card feed of submitted items)
      4. `Profile` (Language toggle, contact info)
    * **Desktop View:** Responsive centered single-column layout (max-width `768px` or `1024px`) with sticky top nav.
  * **Key Views:**
    * **Report Feed:** Stack of high-contrast cards with clear status chips, photo thumbnail, problem summary, and live status progress bar.
    * **Grievance Submission Flow:** Stepper form with AI duplicate detection warning, instant voice note recorder, geolocation autofill, photo upload.
    * **Grievance Detail & Milestone Stepper:** Visual timeline (Submitted ➔ Verified ➔ Assigned to HEI ➔ Prototype Built ➔ Resolved on Ground).

---

### 4.4 Experience 3: HEI Portal (Higher Education Institutions) (`/hei/*`)
* **Purpose:** Academic research coordination, team assignment, solution blueprint submission, prototype tracking.
* **Layout Structure (Project Management / Linear Style):**
  * **Left Sidebar (Navy `#001733`, Fixed 260px):**
    * University Logo + Department selector
    * `Assigned Problem Statements` (Inbox with urgency flags)
    * `Active Research & Projects` (Kanban / List of projects under development)
    * `Solution Proposals` (Drafting, submitted, approved)
    * `Faculty & Student Team` (Member roster, workload allocation)
    * `Lab & Equipment Grants` (Equipment requests, CSR funding links)
    * `Settings`
  * **Top Bar:** Institution Profile, Academic Term selector, global problem search, notification drawer.
  * **Main Canvas:**
    * Structured Kanban / Table view for problem solving stages (Triage ➔ Literature Review ➔ Field Testing ➔ Prototype Ready ➔ Verified).
    * Solution Builder Markdown & Blueprint editor with file attachment uploads.

---

### 4.5 Experience 4: Industry / CSR Portal (`/industry/*`)
* **Purpose:** R&D problem discovery, corporate CSR matching, proposal evaluation, funding milestone disbursement.
* **Layout Structure (Deal-Flow / CRM Style):**
  * **Left Sidebar (Navy `#001733`, Fixed 260px):**
    * Company Brand + CSR Budget meter
    * `Browse Solutions & Innovations` (Marketplace of HEI prototypes)
    * `CSR Problem Statements` (Open municipal challenges seeking funding)
    * `My Active Commitments` (Funded projects & milestones)
    * `Financial Disbursals` (Escrow / release schedule)
    * `Impact & ESG Reports` (Audited resolution reports for CSR filing)
  * **Top Bar:** ESG Portfolio balance, District filter, Tax Certificate download button.
  * **Main Canvas:**
    * Deal cards with "Fund This Project" or "Request Pilot Demo" actions.
    * Milestone verification screen (inspect photo proofs from HEI before releasing tranche payment).

---

### 4.6 Experience 5: Government Administration Portal (`/govt/*`)
* **Purpose:** Statewide monitoring, department triage, duplicate resolution, KPI enforcement, SLA tracking.
* **Layout Structure (Dense BI & Operations Dashboard):**
  * **Left Sidebar (Navy `#001733`, Fixed 260px):**
    * State Emblem + Department / District Switcher
    * `Overview & Live Command` (Real-time statewide KPIs)
    * `Grievance Triage & Assignment` (AI duplicate clusters, manual override)
    * `Department Performance` (District & HEI SLA scorecards)
    * `GIS & Heatmap` (Geospatial clustering of civic issues)
    * `Audit Logs & Escalations` (Overdue SLA items)
  * **Top KPI Strip (4-Card Metric Row):**
    * Total Open Grievances, SLA Breach % (Red indicator), HEI Response Rate, Total CSR Capital Committed.
  * **Main Canvas:**
    * Dense, sortable, multi-filtered data grid with bulk actions (Assign, Merge Duplicate, Escalate).
    * Integrated drawer showing AI duplicate similarity score, clustering rationale, and direct merged-view actions.

---

## 5. Component Library & Visual Primitives

### 5.1 Keyboard Accessibility Focus-Visible Token
Standardized across all interactive components (buttons, inputs, navigation links, tabs, table action buttons):
```css
/* Standard Focus Ring Token */
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED65B] focus-visible:ring-offset-2
```

---

### 5.2 Button Hierarchy
```tsx
// Primary Action (Navy Solid with crisp text)
<button className="bg-[#002147] hover:bg-[#0A3161] text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED65B] focus-visible:ring-offset-2">
  Submit Report
</button>

// Accent CTA (Gold Highlight - used for primary conversion / submission)
<button className="bg-[#FED65B] hover:bg-[#E8BE40] text-[#002147] px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm border border-[#FDE68A] transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002147] focus-visible:ring-offset-2">
  File Grievance Now
</button>

// Secondary / Outline (Subtle border, neutral hover)
<button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED65B] focus-visible:ring-offset-2">
  Export CSV
</button>

// Ghost / Text Action
<button className="text-slate-600 hover:text-[#002147] hover:bg-slate-100 px-3 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED65B] focus-visible:ring-offset-2">
  View Details
</button>
```

---

### 5.3 Status Badges & Pill Indicators
* **Dimensions:** `px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5`
* **Structure:** Dot indicator (`w-1.5 h-1.5 rounded-full`) + Label text.
* **Variant Classes:**
  * `Submitted`: `bg-sky-50 text-sky-700 border border-sky-200` (Dot: `bg-sky-500`)
  * `Assigned`: `bg-indigo-50 text-indigo-700 border border-indigo-200` (Dot: `bg-indigo-500`)
  * `In Progress`: `bg-amber-50 text-amber-800 border border-amber-200` (Dot: `bg-amber-500`)
  * `Resolved`: `bg-emerald-50 text-emerald-700 border border-emerald-200` (Dot: `bg-emerald-500`)
  * `Duplicate`: `bg-rose-50 text-rose-700 border border-rose-200` (Dot: `bg-rose-500`)
  * `Funded`: `bg-teal-50 text-teal-700 border border-teal-200` (Dot: `bg-teal-500`)
  * `Rejected / Closed`: `bg-slate-100 text-slate-700 border border-slate-200` (Dot: `bg-slate-500`)

---

### 5.4 Loading & Skeleton State Tokens
To match the neutral canvas rather than rendering generic external spinners:
* **Skeleton Base Class:** `bg-[#F1F5F9] animate-pulse rounded-md`
* **Skeleton Card:** `bg-white border border-slate-200 rounded-xl p-5 shadow-sm` containing pulse bars in `#F1F5F9`.
* **Skeleton Table Rows:** Alternating `#F1F5F9` subtle rows with animated shimmer highlight.

---

### 5.5 Surface Cards & Elevation Tokens
* **Standard Content Card:** `bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow`
* **Interactive Metric Card (KPI):** `bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm` containing:
  * Top label in `text-xs font-medium text-slate-500 uppercase tracking-wider`
  * Value in `text-2xl font-bold font-heading text-slate-900 mt-1`
  * Trend pill in `text-xs font-semibold px-2 py-0.5 rounded-md` (Green `+12%` / Red `-4%`)
* **AI Duplicate Alert Banner:** `bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900` with direct "Compare with existing grievance" button.

---

### 5.6 Data Tables (Govt / HEI / Industry)
* **Container:** `bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm`
* **Header:** `bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4`
* **Rows:** `border-b border-slate-100 hover:bg-slate-50/60 transition-colors py-3 px-4 text-sm text-slate-800`
* **Pagination Footer:** `bg-white border-t border-slate-200 py-3 px-4 flex items-center justify-between text-xs text-slate-500`

---

### 5.7 Sidebar Navigation Item Primitive
* **Default State:** `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED65B]`
* **Active State:** `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0A3161] border-l-4 border-[#FED65B] shadow-sm` (Features the signature gold accent bar on the left edge).

---

### 5.8 Stepper / Tracking Milestone Timeline (Citizen)
* **Vertical / Horizontal Stepper:**
  * **Completed Step:** Solid Emerald circle (`bg-emerald-600 text-white`) with Check icon + solid connector line (`bg-emerald-500`).
  * **Active Step:** Navy circle with pulsating Gold outer ring (`ring-4 ring-[#FED65B]/40 bg-[#002147] text-white`) + dashed connector.
  * **Pending Step:** Soft slate circle (`bg-slate-100 text-slate-400 border border-slate-300`).

---

### 5.9 Spacing, Border Radius, and Shadow Tokens
* **Spacing Standard:** Base 4px grid (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`, `64px`).
* **Radius Tokens:**
  * `sm`: `0.375rem (6px)` — Badge, small button
  * `md`: `0.5rem (8px)` — Standard input, button, table row
  * `lg`: `0.75rem (12px)` — Card, modal, dropdown container
  * `xl`: `1.0rem (16px)` — Large dashboard widget, hero banner
  * `full`: `9999px` — Status pill, avatar
* **Shadow Tokens:**
  * `shadow-subtle`: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`
  * `shadow-card`: `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)`
  * `shadow-elevated`: `0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`
  * `shadow-modal`: `0 20px 35px -5px rgba(0, 33, 71, 0.15), 0 10px 10px -5px rgba(0, 33, 71, 0.04)`

---

## 6. Iconography & Empty State Assets

### 6.1 Icon Library Choice
* **Library:** `lucide-react` (installed and active).
* **Stroke Width:** Strict `1.75px` across all navigation and cards for clean, crisp rendering (use `2px` only for 14px badges).
* **Sizes:**
  * `14px` (`w-3.5 h-3.5`): Status badge indicators, micro buttons
  * `18px` (`w-4.5 h-4.5`): Navigation sidebar items, table row actions
  * `20px` (`w-5 h-5`): Standard button icons, form validation icons
  * `24px` (`w-6 h-6`): Top bar actions, mobile bottom nav items
  * `40px` (`w-10 h-10`): Empty state focal icons

### 6.2 Empty States & Zero-Data Illustrations
* **Rule:** Avoid heavy colored cartoon illustrations. Use **light, dual-tone geometric icons inside rounded neutral containers** with subtle gold/navy accents.
* **Standard Empty State Recipe:**
  1. Centered container (`py-12 px-4 text-center`)
  2. Soft circular backdrop (`w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200`)
  3. Lucide focal icon in `text-slate-400` with subtle `#FED65B` accent badge
  4. Heading in `text-base font-semibold text-slate-800`
  5. Descriptive paragraph in `text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4`
  6. Primary Action CTA Button (e.g. *"Submit First Report"*, *"Assign Research Team"*)

---

## 7. Routing & Directory Blueprint

```
frontend/src/
├── app/
│   ├── (public)/                     # Public Portal & Shared Auth
│   │   ├── layout.tsx                # Public topbar + footer shell
│   │   ├── page.tsx                  # Public marketing & track lookup
│   │   ├── track/page.tsx            # Standalone tracking lookup
│   │   └── auth/
│   │       ├── login/page.tsx        # Role-based login
│   │       └── register/page.tsx     # Citizen & Institutional onboarding
│   ├── citizen/                      # 1. Citizen Mobile-First Shell
│   │   ├── layout.tsx                # Mobile bottom nav + desktop container
│   │   ├── page.tsx                  # My Reports feed
│   │   ├── report/page.tsx           # Multi-step grievance filing
│   │   └── track/[id]/page.tsx       # Detail & milestone timeline
│   ├── hei/                          # 2. HEI Project Management Shell (Sidebar <= 260px)
│   │   ├── layout.tsx                # Navy sidebar + academic topbar
│   │   ├── page.tsx                  # Problem statements inbox
│   │   ├── projects/page.tsx         # Active R&D Kanban
│   │   ├── proposals/page.tsx        # Solution builder & submission
│   │   └── team/page.tsx             # Faculty & student management
│   ├── industry/                     # 3. Industry CSR & R&D Shell (Sidebar <= 260px)
│   │   ├── layout.tsx                # Navy sidebar + CSR topbar
│   │   ├── page.tsx                  # Browse Solutions marketplace
│   │   ├── commitments/page.tsx      # Funded projects & milestone release
│   │   └── impact/page.tsx           # ESG & CSR audit reports
│   └── govt/                         # 4. Government BI Dashboard Shell (Sidebar <= 260px)
│       ├── layout.tsx                # Dense sidebar + KPI strip shell
│       ├── page.tsx                  # Real-time state overview
│       ├── triage/page.tsx           # Duplicate clusters & assignment
│       ├── performance/page.tsx      # District/HEI SLA scorecards
│       └── analytics/page.tsx        # GIS heatmaps & data grid
├── components/
│   ├── ui/                           # Reusable atomic primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Timeline.tsx
│   │   ├── Skeleton.tsx
│   │   └── EmptyState.tsx
│   ├── layout/                       # Dedicated shell navigation
│   │   ├── PublicNavbar.tsx
│   │   ├── CitizenBottomNav.tsx
│   │   ├── CitizenHeader.tsx
│   │   ├── HeiSidebar.tsx
│   │   ├── IndustrySidebar.tsx
│   │   ├── GovtSidebar.tsx
│   │   └── AuthGuard.tsx
│   └── modules/                      # Feature components (DuplicateBanner, VoiceRecorder, etc.)
└── styles/
    └── globals.css                   # CSS variable tokens & font bindings
```

---

## 8. Summary of Approval Checklist

- [x] Light theme standard with `#FFFFFF` / `#F8FAFC` base
- [x] Navy `#002147` (20%) + Gold `#FED65B` (10%) + Neutral (70%) ratio
- [x] Exact hex codes for all 7 semantic status states
- [x] Multilingual font fallback: `Poppins` & `Inter` extended with `"Noto Sans Devanagari"`
- [x] Standard keyboard accessibility token: `focus-visible:ring-2 focus-visible:ring-[#FED65B] focus-visible:ring-offset-2`
- [x] Sidebar width capped at max `260px` across HEI/Industry/Govt shells
- [x] Standard loading/skeleton token using `surface-sunken` (`#F1F5F9`) base
- [x] 4 distinct role shells defined (Mobile PWA, Project Management, Deal Flow CRM, Dense BI)
- [x] Persona isolation enforced at routing/middleware level
- [x] Component tokens for buttons, cards, tables, badges, steppers, and sidebars
- [x] Lucide-react iconography rules and empty state guidelines
