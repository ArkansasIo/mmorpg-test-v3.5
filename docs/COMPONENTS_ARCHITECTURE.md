# Components Architecture Manual
## Universe Civilization: Empire at War

This document details the frontend component hierarchy, layout architecture, mobile responsiveness strategies, and modal interaction patterns used across Universe Civilization: Empire at War.

---

## 1. Application Layout Hierarchy

```
App.tsx
├── TitleScreen.tsx (Shown if !isAuthenticated)
└── Authenticated Layout
    ├── Topbar.tsx (Persistent Header)
    │   ├── Mobile Navigation Hamburger Button
    │   ├── Colony Dropdown Selector [U:G:S:P]
    │   ├── Multi-Resource Status Ribbon (Horizontally Scrollable)
    │   ├── Turn Engine Real-Time Clock & Status
    │   └── Tactile Turn Action Controls (+1, +10, +50, +All)
    ├── LiveSystemRouteBar.tsx (Breadcrumb & Path Identifier)
    ├── Main Content View Container
    │   ├── Sidebar.tsx (Persistent Navigation)
    │   │   ├── Brand Header (UC Logo & Rail Collapse Trigger)
    │   │   ├── Collapsed Rail Mode (64px) with Hover/Click Flyouts
    │   │   ├── Expanded Accordion Mode (260px) with Grouped Sub-Menus
    │   │   └── Mobile Slide-Over Drawer (iPhone & iPad Viewports)
    │   └── View Component (e.g. DashboardView, ShipyardView, etc.)
    │       └── View-specific sub-tabs and controls
    ├── HudMetrics.tsx (Floating Tactical Metric Indicators)
    └── Footer.tsx (Persistent Bottom Status Bar)
        ├── DEFCON & Engine Status Tickers
        ├── Development Team Credits Access Button
        └── Mobile Bottom Quick Navigation Bar
```

---

## 2. Navigation Architecture (`Sidebar.tsx`)

The navigation system provides three distinct viewing modes tailored to modern user interfaces:

### A. Desktop Expanded Mode (260px Width)
- Displays all 15 top-level strategic sections:
  1. **Overview** (`dashboard`, `turn-system`, `civilization`, `government-system`, `missions`, `codex-doc`)
  2. **Resources** (`resources`, `income`, `storage-upgrades`, `power-grid`, `aic-system`, `factories`)
  3. **Facilities** (`master-upgrades`, `shipyard`, `tech-library`, `megastructures`, `repair`, `space-stations`)
  4. **Research** (`tech-tree`, `eve-blueprints`, `tech-offense`, `tech-defense`, `tech-covert`, `tech-anti-covert`)
  5. **Shipyard** (`unit-roster-90`, `ship-fitting`, `unit-production`, `units`, `super-units`, `miners`, `hyperspace-systems`, `ship`, `modules`)
  6. **Defenses** (`defenses`, `shields`, `weapons`, `armors`)
  7. **Fleet Movement** (`targets`, `expeditions`, `nemesis-system`, `spy`, `sabotage`, `attack-log`, `military-stats`)
  8. **Galaxy** (`universe`, `nms-universe`, `planetary-invasion`, `add-worlds-bosses`, `exploration`, `stargate-network`, `stargate-relics`, `stargate-system-lords`, `stargate-npc-races`)
  9. **Empire & Colonies** (`planet-list`, `planet-bonuses`, `planet-power`, `planet-defenses`, `moon-bases`, `life-support`, `population`, `hazards`, `colonial-plunge`, `stellar-encyclopedia`)
  10. **Merchant & Trader** (`resource-exchange`, `bank-vault`, `weapon-market`, `mercenary-market`)
  11. **Alliance & Social** (`alliances`, `mmorpg-ogame`, `diplomacy`, `messages`, `galactic-news`, `rankings`)
  12. **Intelligence & Covert** (`espionage`, `counter-intel`, `infiltrate`, `probes`)
  13. **Officers & Command** (`officer-recruit`, `gacha-store`, `officer-inventory`, `officer-synergy`, `ascension`)
  14. **Shop & Black Market** (`store-credits`, `battlepass`, `black-market`, `boosters`)
  15. **Game Master Admin** (`admin-panel`, `admin-universe`, `admin-players`, `admin-logs`)
- Accordion click behavior: Clicking the parent header navigates to the default primary route and toggles the sub-menu expansion.
- Active items feature high-contrast inverted styling (`bg-[#111111] text-white`).

### B. Desktop Collapsed Rail Mode (64px Width)
- Minimizes the navigation bar to save horizontal workspace.
- Renders only the section icon with an indicator badge for the active section.
- **Smart Flyout Menu**: Hovering or clicking on an icon renders a portal-like flyout menu positioned alongside the button displaying all child routes.

### C. Mobile Responsive Drawer (iOS & Android)
- Automatically hides the sidebar behind a slide-over drawer triggered by the hamburger icon in `Topbar.tsx`.
- Includes a dark translucent backdrop (`bg-black/60`).
- Closes automatically upon route selection or backdrop dismissal.
- Full viewport height with `overscroll-contain` to prevent unwanted iOS Safari rubber-banding.

---

## 3. Persistent Header (`Topbar.tsx`)

- **Colony Selector Dropdown**:
  - Displays currently selected colony name and astronomical coordinates (e.g. `[1:204:8]`).
  - Dropdown lists all owned colonies with used building fields vs max capacity.
  - Allows 1-click switching of active building and production queues.
- **Resource Ribbon**:
  - Displays 9 economic indicators: Credits, Metal, Crystal, Deuterium, Food, Water, Population, Energy, and Naquadah.
  - Implements smooth horizontal touch scrolling (`overflow-x-auto no-scrollbar`) for compact mobile screens.
  - Visual warning states for capped storage reservoirs (>90% capacity).
- **Turn Console & Quick Execution**:
  - Displays turns remaining and rate of replenishment (default: 6 turns / minute).
  - Quick action buttons to burn 1, 10, 50, or all available turns into instantaneous planetary yields.

---

## 4. Modal Subsystem (`src/components/modals/`)

1. **`PatchNotesModal.tsx`**:
   - Opens from Topbar or Footer version tag.
   - Categorized change logs highlighting latest features, gameplay balance adjustments, and bug fixes.
2. **`SaveStateManagerModal.tsx`**:
   - Local JSON save file serialization.
   - Provides 1-click clipboard export, file download, and import validation with fallback state recovery.
3. **`AdminLoginModal.tsx`**:
   - Access control gate to administrative sandbox tools.
   - Pin-code / password verification.

---

## 5. View Component Organization (`src/components/views/`)

Each view component is constructed as a self-contained module following standard patterns:
- **Header Banner**: High-contrast title, description, and metric summary badges.
- **Sub-Tab Navigation**: In-view tab strip for complex systems (e.g., Shipyard tabs for Assembly, Faction Units, Fitting, and Queues).
- **Action Feedback**: Visual notifications when construction starts, upgrades complete, or resources are insufficient.
- **Sound Integration**: Tactile audio cues (`sound.play('click')`, `sound.play('confirm')`, `sound.play('warning')`).
- **Responsive Layout**: Tailwind flex and grid utilities (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) ensuring seamless reflow across iPhone 15, iPad 9, and widescreen monitors.
