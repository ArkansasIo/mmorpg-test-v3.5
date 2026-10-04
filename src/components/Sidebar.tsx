import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Boxes,
  Building2,
  FlaskConical,
  Rocket,
  Shield,
  Swords,
  Orbit,
  Crown,
  Scale,
  Users,
  Eye,
  Award,
  GraduationCap,
  Gem,
  Terminal,
  Volume2,
  VolumeX,
  LogOut,
  Cloud,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PanelLeftClose,
  PanelLeftOpen,
  FolderOpen,
  FolderClosed,
  X,
  Menu,
} from 'lucide-react';
import { sound } from '../sound';
import { PlayerProfile, Race } from '../types';
import { RACES } from '../gameData';
import { getAdminAuthSession } from '../config/adminAuthConfig';
import { auth, loginWithGoogle } from '../firebase';

export interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  profile: PlayerProfile;
  openGroups: Record<string, boolean>;
  onToggleGroup: (group: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  badge?: string;
}

export interface OGameNavSection {
  id: string;
  label: string;
  ogameName: string;
  icon: React.ElementType;
  defaultRoute: string;
  items: NavItem[];
}

export const OGAME_NAV_SECTIONS: OGameNavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    ogameName: 'OVERVIEW',
    icon: Globe,
    defaultRoute: 'dashboard',
    items: [
      { id: 'dashboard', label: 'Empire Overview' },
      { id: 'civilization', label: 'Civilization & Population' },
      { id: 'government-system', label: '🏛️ 9 Government Systems' },
      { id: 'missions', label: 'Missions & Chapter Quests' },
      { id: 'codex-doc', label: 'Strategic Codex & GDD' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    ogameName: 'RESOURCES',
    icon: Boxes,
    defaultRoute: 'resources',
    items: [
      { id: 'resources', label: 'Resource Vault & Reserves' },
      { id: 'income', label: 'Resource Income & Mines' },
      { id: 'storage-upgrades', label: 'Storage Silos & Warehouses' },
      { id: 'power-grid', label: 'Power Grid & Energy Network' },
      { id: 'aic-system', label: 'Automated Industry (AIC)' },
      { id: 'factories', label: 'Mines & Nanite Factories' },
    ],
  },
  {
    id: 'facilities',
    label: 'Facilities',
    ogameName: 'FACILITIES',
    icon: Building2,
    defaultRoute: 'master-upgrades',
    items: [
      { id: 'master-upgrades', label: 'Master Facilities Hub' },
      { id: 'blueprint-fabricator', label: '📐 Blueprint Fabricator (45 Types)' },
      { id: 'construction-yards', label: '🏗️ Construction Yards & Fields' },
      { id: 'shipyard', label: 'Orbital Shipyard Drydocks' },
      { id: 'tech-library', label: 'Research Laboratories' },
      { id: 'megastructures', label: 'Stellar Megastructures' },
      { id: 'repair', label: 'Alliance Depot & Repair' },
      { id: 'space-stations', label: 'Orbital Starbases' },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    ogameName: 'RESEARCH',
    icon: FlaskConical,
    defaultRoute: 'tech-tree',
    items: [
      { id: 'tech-tree', label: 'Master Tech Tree' },
      { id: 'eve-blueprints', label: 'EVE Blueprints & ME/TE' },
      { id: 'tech-offense', label: 'Weapons Technology' },
      { id: 'tech-defense', label: 'Shield & Armor Tech' },
      { id: 'tech-covert', label: 'Covert Espionage Tech' },
      { id: 'tech-anti-covert', label: 'Anti-Covert Counter-Sensors' },
    ],
  },
  {
    id: 'shipyard',
    label: 'Shipyard',
    ogameName: 'SHIPYARD',
    icon: Rocket,
    defaultRoute: 'shipyard',
    items: [
      { id: 'unit-roster-90', label: '90-Class Unit & Ship Roster' },
      { id: 'ship-fitting', label: 'Ship Fitting & 6-Type Armor' },
      { id: 'unit-production', label: 'Ship Production Lines' },
      { id: 'units', label: 'Fleet Combat Units' },
      { id: 'super-units', label: 'Titan & Flagship Vessels' },
      { id: 'miners', label: 'Industrial Miners & Transports' },
      { id: 'hyperspace-systems', label: 'Hyperspace & Motherships' },
      { id: 'ship', label: 'Mothership Nexus Overview' },
      { id: 'modules', label: 'Mothership Modular Subsystems' },
    ],
  },
  {
    id: 'military-barracks-section',
    label: 'Military Barracks',
    ogameName: 'BARRACKS',
    icon: Swords,
    defaultRoute: 'military-barracks',
    items: [
      { id: 'military-barracks', label: '⚔️ 90 Ground Troop Classes' },
      { id: 'academy-enlistment', label: 'Imperial Enlistment Facilities' },
      { id: 'academy-drills', label: 'Readiness Drills & Auto-Draft' },
    ],
  },
  {
    id: 'workforce',
    label: 'Workforce & Academy',
    ogameName: 'WORKFORCE',
    icon: GraduationCap,
    defaultRoute: 'workforce-academy',
    items: [
      { id: 'workforce-academy', label: 'Workforce & Academy Hub' },
      { id: 'workforce-roster', label: '90-Role Imperial Roster' },
      { id: 'academy-wings', label: '6 Specialized Wings' },
      { id: 'academy-enlistment', label: 'Enlistment Terminal' },
    ],
  },
  {
    id: 'defenses',
    label: 'Defenses',
    ogameName: 'DEFENSES',
    icon: Shield,
    defaultRoute: 'defenses',
    items: [
      { id: 'defenses', label: 'Planetary Defense Grid' },
      { id: 'shields', label: 'Shield Domes & Deflectors' },
      { id: 'weapons', label: 'Ground Defense Batteries' },
      { id: 'armors', label: 'Hardened Fortifications' },
    ],
  },
  {
    id: 'fleet',
    label: 'Fleet Movement',
    ogameName: 'FLEET',
    icon: Swords,
    defaultRoute: 'targets',
    items: [
      { id: 'targets', label: 'Fleet Dispatch & Targets' },
      { id: 'expeditions', label: 'Deep Space Expeditions' },
      { id: 'nemesis-system', label: '👑 Nemesis Warlord System' },
      { id: 'spy', label: 'Espionage Probes & Scans' },
      { id: 'sabotage', label: 'Covert Sabotage Ops' },
      { id: 'attack-log', label: 'Combat Reports & Attack Log' },
      { id: 'military-stats', label: 'Military Fleet Scores' },
    ],
  },
  {
    id: 'galaxy',
    label: 'Galaxy',
    ogameName: 'GALAXY',
    icon: Orbit,
    defaultRoute: 'universe',
    items: [
      { id: 'universe', label: '30 Universes & 90 Galaxies' },
      { id: 'nms-universe', label: 'NMS Procedural Universe' },
      { id: 'planetary-invasion', label: '1-999,999 Procedural Planets' },
      { id: 'add-worlds-bosses', label: 'Galaxy & Arc Bosses' },
      { id: 'exploration', label: 'Deep Space Reconnaissance' },
      { id: 'stargate-network', label: 'Stargate & Jump Gates' },
      { id: 'stargate-telemetry', label: '📡 Gate Room Telemetry (1,000 Events)' },
      { id: 'gate-tokens', label: '⚡ Gate Tokens & Anomalies' },
      { id: 'stargate-relics', label: '🏺 Relics & Ancient Artifacts' },
      { id: 'stargate-system-lords', label: '👑 System Lords & PvE Raids' },
      { id: 'stargate-npc-races', label: '27 Stargate Alien Races' },
    ],
  },
  {
    id: 'empire',
    label: 'Empire & Colonies',
    ogameName: 'EMPIRE',
    icon: Crown,
    defaultRoute: 'planet-list',
    items: [
      { id: 'planet-list', label: 'Colonial World Nexus' },
      { id: 'planet-bonuses', label: 'All Worlds Comparison Matrix' },
      { id: 'planet-power', label: 'Colonial Power Grid' },
      { id: 'planet-defenses', label: 'Colonial Defenses Grid' },
      { id: 'moon-bases', label: 'Moon Bases & Sensor Phalanx' },
      { id: 'life-support', label: '🌾 Food & Water Life Support' },
      { id: 'population', label: '👥 Population & Rationing' },
      { id: 'hazards', label: '⚠️ Planetary Hazards' },
      { id: 'colonial-plunge', label: '📉 Colonial Plunge System' },
      { id: 'stellar-encyclopedia', label: 'A-Z Planetary Encyclopedia' },
    ],
  },
  {
    id: 'merchant',
    label: 'Merchant & Trader',
    ogameName: 'MERCHANT',
    icon: Scale,
    defaultRoute: 'resource-exchange',
    items: [
      { id: 'resource-exchange', label: 'Resource Exchange Market' },
      { id: 'bank-vault', label: 'Imperial Bank & Vault' },
      { id: 'weapon-market', label: 'Procurement Catalog' },
      { id: 'mercenary-market', label: 'Mercenary Guild Market' },
      { id: 'player-trade', label: 'Player Trade Exchange' },
    ],
  },
  {
    id: 'alliance',
    label: 'Alliance & Social',
    ogameName: 'ALLIANCE',
    icon: Users,
    defaultRoute: 'guilds',
    items: [
      { id: 'guilds', label: 'Guilds & Alliances' },
      { id: 'friends', label: 'Friends List & Allies' },
      { id: 'messages', label: 'Personal Messages & Comms' },
      { id: 'player-trade', label: 'Player Trade Exchange' },
      { id: 'alliances', label: 'Alliance Headquarters' },
      { id: 'mmorpg-ogame', label: 'MMORPG Guilds & Raids' },
      { id: 'diplomacy', label: 'Diplomacy & Treaties' },
      { id: 'galactic-news', label: 'Holonet News Network' },
      { id: 'rankings', label: 'Galactic Leaderboards' },
    ],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    ogameName: 'INTELLIGENCE',
    icon: Eye,
    defaultRoute: 'spy-log',
    items: [
      { id: 'spy-log', label: 'Espionage Reports & Intercepts' },
      { id: 'enemy-intelligence', label: 'Enemy Intelligence Dossier' },
      { id: 'intel-codex', label: 'Strategic Intel Codex' },
    ],
  },
  {
    id: 'officers',
    label: 'Officers & Casino',
    ogameName: 'OFFICERS',
    icon: Award,
    defaultRoute: 'commander-hq',
    items: [
      { id: 'commander-hq', label: 'Commander HQ & Officers' },
      { id: 'commander-gacha', label: '👑 72 Commanders Gotcha' },
      { id: 'player-profile', label: 'Sovereign Realm Dossier' },
      { id: 'race', label: 'Race & Government Faction' },
      { id: 'vacation', label: 'Sanctuary / Vacation Shield' },
      { id: 'ascension', label: 'Ascension Chamber' },
    ],
  },
  {
    id: 'store',
    label: 'Shop & Dark Matter',
    ogameName: 'SHOP',
    icon: Gem,
    defaultRoute: 'store-battlepass',
    items: [
      { id: 'store-battlepass', label: 'Store & Battle Pass' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin Systems',
    ogameName: 'ADMIN',
    icon: Terminal,
    defaultRoute: 'admin-dashboard',
    items: [
      { id: 'admin-dashboard', label: 'Admin Control Panel' },
      { id: 'env-config', label: '⚙️ Environment & Setup Suite', badge: 'EXE' },
      { id: 'bsat', label: '⚡ BSAT Studio (.BAT/.SH)', badge: 'DEV' },
      { id: 'turn-system', label: 'Turn Engine (6 Turns/Min)' },
      { id: 'admin-empire-history', label: '📜 Empire History Chronicle' },
      { id: 'admin-universe', label: 'Universe & Physics Config' },
      { id: 'admin-users', label: 'Player Accounts Inspector' },
      { id: 'admin-crown', label: 'Imperial Crown & Decrees' },
      { id: 'admin-bans', label: 'Bans & Sanctions Registry' },
      { id: 'admin-planets', label: 'Planets & Moon Spawner' },
      { id: 'admin-fleets', label: 'Fleet Radar & Interception' },
      { id: 'admin-debris', label: 'Galaxy Debris & Spatial' },
      { id: 'admin-tickets', label: 'Support Ticket Desk' },
      { id: 'admin-security', label: 'Anti-Cheat & Security Logs' },
      { id: 'admin-events', label: 'Global Events & Happy Hour' },
      { id: 'admin-cheats', label: 'God Mode & Cheats Console' },
      { id: 'admin-operations', label: 'Server Ops & Modifiers' },
      { id: 'cron-jobs', label: 'Cron Scheduler' },
      { id: 'cron-cli', label: 'Server Crontab CLI' },
      { id: 'admin-maintenance', label: 'Database & Season Reset' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  onNavigate,
  profile,
  openGroups,
  onToggleGroup,
  soundEnabled,
  onToggleSound,
  onLogout,
  isCollapsed: propIsCollapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const currentRace: Race | undefined = RACES.find((r) => r.id === profile.race);
  const [authUser, setAuthUser] = useState(auth.currentUser);

  // Collapsed rail mode state with localStorage persistence
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ogame_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed;

  // Floating flyout menu state in collapsed mode
  const [activeFlyout, setActiveFlyout] = useState<{ id: string; top: number } | null>(null);
  const flyoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setAuthUser(user);
    });
    return () => unsub();
  }, []);

  const handleItemClick = (routeId: string) => {
    sound.play('click');
    onNavigate(routeId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleToggleCollapse = () => {
    sound.play('click');
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('ogame_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleFlyoutMouseEnter = (secId: string, event: React.MouseEvent<HTMLElement>) => {
    if (!isCollapsed) return;
    if (flyoutTimeoutRef.current) {
      clearTimeout(flyoutTimeoutRef.current);
      flyoutTimeoutRef.current = null;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setActiveFlyout({ id: secId, top: Math.max(10, Math.min(rect.top, window.innerHeight - 350)) });
  };

  const handleFlyoutMouseLeave = () => {
    if (!isCollapsed) return;
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 220);
  };

  const handleExpandAll = () => {
    sound.play('click');
    OGAME_NAV_SECTIONS.forEach((sec) => {
      if (!openGroups[sec.id]) {
        onToggleGroup(sec.id);
      }
    });
  };

  const handleCollapseAll = () => {
    sound.play('click');
    OGAME_NAV_SECTIONS.forEach((sec) => {
      if (openGroups[sec.id]) {
        onToggleGroup(sec.id);
      }
    });
  };

  const adminSession = getAdminAuthSession();
  const isAdminUser = profile.role === 'admin' || profile.isAdmin === true || (adminSession && adminSession.isAuthenticated);

  return (
    <>
      {/* Mobile Drawer Backdrop (iPhone 15, iPad portrait) */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          sound.play('click');
          if (onCloseMobile) onCloseMobile();
        }}
        aria-hidden="true"
      />

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto ${
          isCollapsed ? 'w-16' : 'w-64 sm:w-72 lg:w-64'
        } bg-white border-r border-[#dedede] flex flex-col shrink-0 min-h-screen select-none transition-all duration-200 font-sans transform ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div
          id="sidebar-brand"
          className={`h-16 border-b border-[#dedede] px-3 flex items-center justify-between cursor-pointer bg-[#fafafa]`}
        >
          <div
            className="flex items-center gap-2.5 overflow-hidden flex-1"
            onClick={() => handleItemClick('dashboard')}
            title="Return to Empire Overview"
          >
            <div className="w-8 h-8 bg-[#111111] text-amber-400 font-black flex items-center justify-center text-xs tracking-wider shrink-0 border border-neutral-700 shadow-2xs">
              UC
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden min-w-0">
                <strong className="block text-xs font-black tracking-wider text-[#111111] uppercase leading-tight truncate">
                  UNIVERSE CIVILIZATION
                </strong>
                <small className="block text-[9px] text-amber-600 font-bold tracking-widest uppercase truncate">
                  Empire at War
                </small>
              </div>
            )}
          </div>

          {/* Action buttons (Close on Mobile, Rail Collapse on Desktop) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="sidebar-mobile-close-btn"
              onClick={() => {
                sound.play('click');
                if (onCloseMobile) onCloseMobile();
              }}
              title="Close navigation menu"
              className="p-1.5 hover:bg-neutral-200 text-[#444444] hover:text-[#111111] transition-colors cursor-pointer border border-transparent hover:border-[#dedede] lg:hidden"
            >
              <X size={18} />
            </button>

            <button
              type="button"
              id="sidebar-collapse-toggle-btn"
              onClick={handleToggleCollapse}
              title={isCollapsed ? 'Expand navigation menu' : 'Collapse navigation menu (Rail View)'}
              className="hidden lg:flex p-1.5 hover:bg-neutral-200 text-[#444444] hover:text-[#111111] transition-colors cursor-pointer border border-transparent hover:border-[#dedede]"
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>
        </div>

        {/* Commander Profile Chip */}
        <div
          id="sidebar-profile-box"
          className={`m-2 p-2 border border-[#dedede] bg-[#fafafa] flex items-center gap-2.5 cursor-pointer hover:border-[#111111] transition-colors ${
            isCollapsed ? 'justify-center p-1.5' : ''
          }`}
          onClick={() => handleItemClick('account-info')}
          title={`Commander ${profile.displayName || profile.username || 'Stephen'} (${currentRace?.name || "Tau'ri"})`}
        >
          <div className="w-8 h-8 bg-[#111111] text-white flex items-center justify-center text-xs font-bold shrink-0 border border-neutral-800">
            {getInitials(profile.displayName || profile.username || 'Stephen')}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#888888] font-bold">
                  COMMANDER
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Online" />
              </div>
              <strong className="block text-xs font-bold text-[#111111] truncate tracking-wide font-mono hover:text-amber-600 transition-colors">
                {profile.displayName || profile.username || 'Commander Stephen'}
              </strong>
              <span className="block text-[10px] text-[#666666] truncate font-mono">
                {currentRace?.name || "Tau'ri"} · Rank {profile.rankLevel || 1}
              </span>
            </div>
          )}
        </div>

        {/* Accordion Quick Expand / Collapse All (Expanded mode only) */}
        {!isCollapsed && (
          <div className="px-3 py-1 flex items-center justify-between text-[10px] text-[#777777] font-mono border-b border-[#eee] bg-neutral-50/50">
            <span className="font-bold uppercase tracking-wider text-[#999]">Empire Navigation</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className="hover:text-[#111111] underline cursor-pointer text-[9px]"
                title="Expand all sub-menus"
              >
                Expand All
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="hover:text-[#111111] underline cursor-pointer text-[9px]"
                title="Collapse all sub-menus"
              >
                Collapse All
              </button>
            </div>
          </div>
        )}

        {/* Main OGame Categorized Navigation List */}
        <nav id="sidebar-nav" className="flex-1 overflow-y-auto px-1.5 py-1.5 space-y-1">
          {OGAME_NAV_SECTIONS.map((sec) => {
            if (sec.id === 'admin' && !isAdminUser) return null;

            const IconComponent = sec.icon;
            const isOpen = !!openGroups[sec.id];
            const hasActiveChild = sec.items.some((item) => item.id === activeRoute);
            const isDirectActive = activeRoute === sec.defaultRoute;

            // =========================================================================
            // COLLAPSED RAIL MODE
            // =========================================================================
            if (isCollapsed) {
              return (
                <div
                  key={sec.id}
                  className="relative flex justify-center py-0.5"
                  onMouseEnter={(e) => handleFlyoutMouseEnter(sec.id, e)}
                  onMouseLeave={handleFlyoutMouseLeave}
                >
                  <button
                    type="button"
                    id={`nav-rail-btn-${sec.id}`}
                    onClick={() => handleItemClick(sec.defaultRoute)}
                    title={`${sec.label} (Click to open, hover for sub-menu)`}
                    className={`w-11 h-11 flex items-center justify-center transition-all cursor-pointer relative border ${
                      hasActiveChild || isDirectActive
                        ? 'bg-[#111111] text-amber-400 border-[#111111] shadow-xs'
                        : 'bg-white text-[#555555] hover:bg-[#f5f5f5] hover:text-[#111111] border-transparent hover:border-[#dedede]'
                    }`}
                  >
                    <IconComponent size={17} />
                    {hasActiveChild && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse ring-1 ring-white" />
                    )}
                  </button>
                </div>
              );
            }

            // =========================================================================
            // EXPANDED OGAME MODE
            // =========================================================================
            return (
              <div key={sec.id} className="border border-transparent hover:border-[#dedede] transition-colors rounded-none mb-0.5">
                {/* Main Section Header Row */}
                <div
                  className={`w-full flex items-center justify-between text-xs transition-colors border-l-2 ${
                    hasActiveChild
                      ? 'border-amber-500 bg-[#fafafa] font-bold text-[#111111]'
                      : isDirectActive
                      ? 'border-[#111111] bg-[#f5f5f5] font-bold text-[#111111]'
                      : 'border-transparent text-[#333333] hover:bg-[#f8f8f8] hover:text-[#111111]'
                  }`}
                >
                  {/* Main Link (Direct click jumps to OGame primary page) */}
                  <button
                    type="button"
                    id={`nav-group-main-${sec.id}`}
                    onClick={() => {
                      handleItemClick(sec.defaultRoute);
                      if (!isOpen) {
                        onToggleGroup(sec.id);
                      }
                    }}
                    className="flex-1 flex items-center gap-2.5 px-2.5 py-2 text-left truncate cursor-pointer"
                    title={`Open ${sec.label}`}
                  >
                    <IconComponent
                      size={15}
                      className={`shrink-0 ${hasActiveChild ? 'text-amber-600' : 'text-[#666666]'}`}
                    />
                    <span className="truncate font-mono text-[11px] font-bold uppercase tracking-wide">
                      {sec.label}
                    </span>
                  </button>

                  {/* Accordion Expand/Collapse Toggle Chevron */}
                  <button
                    type="button"
                    id={`nav-group-toggle-${sec.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.play('click');
                      onToggleGroup(sec.id);
                    }}
                    title={isOpen ? `Collapse ${sec.label} sub-menu` : `Expand ${sec.label} sub-menu`}
                    className="p-2 text-[#888888] hover:text-[#111111] hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    {isOpen ? (
                      <ChevronDown size={14} className="text-[#111111]" />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                </div>

                {/* Collapsible Sub-menu Items */}
                {isOpen && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-neutral-200 ml-3.5 my-0.5">
                    {sec.items.map((item) => {
                      const isCurrent = activeRoute === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          id={`subnav-item-${item.id}`}
                          onClick={() => handleItemClick(item.id)}
                          className={`w-full text-left px-2.5 py-1.5 text-[11px] font-mono block truncate transition-colors cursor-pointer border-l-2 ${
                            isCurrent
                              ? 'border-[#111111] text-[#111111] font-bold bg-[#f0f0f0]'
                              : 'border-transparent text-[#666666] hover:text-[#111111] hover:border-neutral-400 hover:bg-[#fafafa]'
                          }`}
                          title={item.label}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Floating Flyout Sub-menu (Rendered outside normal tree during collapsed rail mode) */}
        {isCollapsed && activeFlyout && (() => {
          const activeSection = OGAME_NAV_SECTIONS.find((s) => s.id === activeFlyout.id);
          if (!activeSection) return null;
          if (activeSection.id === 'admin' && !isAdminUser) return null;

          const SectionIcon = activeSection.icon;

          return (
            <div
              id="sidebar-floating-flyout"
              style={{ top: `${activeFlyout.top}px` }}
              className="fixed left-16 z-50 w-64 bg-white border-2 border-[#111111] shadow-2xl p-2.5 space-y-1 font-mono text-xs animate-in fade-in zoom-in-95 duration-100"
              onMouseEnter={() => {
                if (flyoutTimeoutRef.current) {
                  clearTimeout(flyoutTimeoutRef.current);
                  flyoutTimeoutRef.current = null;
                }
              }}
              onMouseLeave={handleFlyoutMouseLeave}
            >
              {/* Flyout Header */}
              <div className="p-2 bg-[#111111] text-white flex items-center justify-between border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <SectionIcon size={14} className="text-amber-400" />
                  <strong className="text-xs font-bold uppercase tracking-wider text-white">
                    {activeSection.label}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleItemClick(activeSection.defaultRoute);
                    setActiveFlyout(null);
                  }}
                  className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                >
                  Go →
                </button>
              </div>

              {/* Sub-menu Item List */}
              <div className="max-h-72 overflow-y-auto space-y-0.5 py-1">
                {activeSection.items.map((item) => {
                  const isCurrent = activeRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleItemClick(item.id);
                        setActiveFlyout(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-[11px] block truncate transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-100 text-amber-950 font-bold border-l-2 border-amber-600'
                          : 'text-[#444444] hover:bg-neutral-100 hover:text-[#111111]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Sidebar Footer Controls */}
        <div id="sidebar-footer" className="border-t border-[#dedede] p-2.5 bg-[#fafafa] text-xs text-[#444444] space-y-2 pb-safe">
          {/* Sound toggle & System Status */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between'}`}>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {!isCollapsed && (
                <span className="text-[10px] font-mono font-medium text-[#444444]">
                  6 Turns/Min
                </span>
              )}
            </div>
            <button
              type="button"
              id="sound-toggle-btn"
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
              className="text-[#666666] hover:text-[#111111] p-1.5 hover:bg-neutral-200 transition-colors cursor-pointer border border-transparent hover:border-[#dedede]"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>

          {/* Cloud Sync & Google Auth */}
          {!isCollapsed ? (
            <div className="border border-[#e5e5e5] bg-white p-2 space-y-1 font-mono text-[10px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-[#555555]">
                  <Cloud size={11} className={authUser ? 'text-emerald-600' : 'text-neutral-400'} />
                  <span>CLOUD SYNC</span>
                </span>
                <span className={authUser ? 'text-emerald-600 font-bold' : 'text-neutral-500'}>
                  {authUser ? 'ONLINE' : 'LOCAL'}
                </span>
              </div>
              {!authUser ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      sound.play('confirm');
                      await loginWithGoogle();
                    } catch (e) {
                      sound.play('warning');
                    }
                  }}
                  className="w-full py-1 px-2 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-[10px] tracking-wider uppercase transition-colors cursor-pointer text-center"
                >
                  Sign In (Sync DB)
                </button>
              ) : (
                <div className="text-[9px] text-[#777777] truncate">
                  {authUser.email}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <span
                title={`Cloud status: ${authUser ? 'Online (' + authUser.email + ')' : 'Local'}`}
                className="p-1 text-[#666]"
              >
                <Cloud size={14} className={authUser ? 'text-emerald-600' : 'text-neutral-400'} />
              </span>
            </div>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              type="button"
              id="sidebar-logout-btn"
              onClick={() => {
                sound.play('click');
                onLogout();
              }}
              className={`w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-mono font-bold text-[#b91c1c] border border-[#fecaca] bg-[#fef2f2] hover:bg-[#b91c1c] hover:text-white transition-colors cursor-pointer ${
                isCollapsed ? 'p-1.5' : ''
              }`}
              title="Log out of commander realm"
            >
              <LogOut size={13} />
              {!isCollapsed && <span>LOGOUT</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
