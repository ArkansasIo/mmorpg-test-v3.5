import React, { useState, useEffect } from 'react';
import { ShieldAlert, Key } from 'lucide-react';
import { Sidebar, OGAME_NAV_SECTIONS } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { HudMetrics } from './components/HudMetrics';
import { sound } from './sound';
import {
  BattleRecord,
  CovertMissionRecord,
  DefconLevel,
  GameMessage,
  MarketOrder,
  MothershipModule,
  PlanetColony,
  PlayerProfile,
  PlayerResources,
  PlayerWeapon,
  RankingEntry,
  TargetRealm,
  Technology,
  CronJob,
  CronJobId,
  CronExecutionLog,
  CronConfig,
} from './types';
import {
  INITIAL_ALLIANCES,
  INITIAL_MARKET_ORDERS,
  INITIAL_MESSAGES,
  INITIAL_MOTHERSHIP_MODULES,
  INITIAL_PLANETS,
  INITIAL_PLAYER_WEAPONS,
  INITIAL_PROFILE,
  INITIAL_RANKINGS,
  INITIAL_RESOURCES,
  INITIAL_TECHNOLOGIES,
  MERCENARY_CONTRACTS,
  RACES,
  TARGET_REALMS,
  WEAPON_TYPES,
} from './gameData';
import {
  INITIAL_CRON_JOBS,
  INITIAL_CRON_LOGS,
  DEFAULT_CRON_CONFIG,
} from './cronData';
import {
  calculateColonyMaintenance,
  getEmpireColonialSummary,
} from './utils/colonyCalculations';
import {
  OGameTechnology,
  OGameFacility,
  OGameShip,
  OGameDefense,
  MegastructureProject,
  ExpeditionMission,
  ExpeditionLog,
  ResearchQueueItem,
  FactoryQueueItem,
  ShipyardQueueItem,
  DefenseQueueItem,
  LabSpecialization,
  FleetFormationType,
  FleetFormationPreset,
  ExpeditionMissionType,
  ImperialDecree,
  AdminWorldModifier,
  AdminServerSettings,
  OGameUniverseConfig,
  AdminUserAccount,
  AdminBanRecord,
  AdminPlanetEntry,
  AdminFleetMission,
  AdminDebrisField,
  AdminSupportTicket,
  AdminSecurityAlert,
  AdminGlobalEvent,
} from './types';
import {
  INITIAL_OGAME_TECHNOLOGIES,
  INITIAL_OGAME_FACILITIES,
  INITIAL_OGAME_SHIPS,
  INITIAL_OGAME_DEFENSES,
  INITIAL_MEGASTRUCTURES,
  INITIAL_EXPEDITIONS,
  INITIAL_EXPEDITION_LOGS,
  INITIAL_FLEET_PRESETS,
} from './ogameData';
import {
  INITIAL_IMPERIAL_DECREES,
  INITIAL_WORLD_MODIFIERS,
  DEFAULT_ADMIN_SETTINGS,
} from './adminData';
import {
  DEFAULT_OGAME_UNIVERSE_CONFIG,
  INITIAL_ADMIN_USERS,
  INITIAL_ADMIN_BANS,
  INITIAL_ADMIN_PLANETS,
  INITIAL_ADMIN_FLEET_MISSIONS,
  INITIAL_ADMIN_DEBRIS_FIELDS,
  INITIAL_ADMIN_SUPPORT_TICKETS,
  INITIAL_ADMIN_SECURITY_ALERTS,
  INITIAL_ADMIN_GLOBAL_EVENTS,
} from './data/ogameAdminData';

// Views
import { DashboardView } from './components/views/DashboardView';
import { ResourcesView } from './components/views/ResourcesView';
import { IncomeView } from './components/views/IncomeView';
import { MilitaryScoresView } from './components/views/MilitaryScoresView';
import { CombatView } from './components/views/CombatView';
import { SpyView } from './components/views/SpyView';
import { AttackLogView } from './components/views/AttackLogView';
import { ArmoryView } from './components/views/ArmoryView';
import { TrainingView } from './components/views/TrainingView';
import { TechnologyView } from './components/views/TechnologyView';
import { IntelligenceView } from './components/views/IntelligenceView';
import { MarketView } from './components/views/MarketView';
import { RankingsView } from './components/views/RankingsView';
import { PlanetsView } from './components/views/PlanetsView';
import { MothershipView } from './components/views/MothershipView';
import { AccountView } from './components/views/AccountView';
import { CronSystemView } from './components/views/CronSystemView';
import { TechTreeView } from './components/views/TechTreeView';
import { ResearchLibraryView } from './components/views/ResearchLibraryView';
import { FactoryView } from './components/views/FactoryView';
import { ShipyardView } from './components/views/ShipyardView';
import { DefenseView } from './components/views/DefenseView';
import { ExpeditionView } from './components/views/ExpeditionView';
import { MegastructureView } from './components/views/MegastructureView';
import { UniverseView } from './components/views/UniverseView';
import { Footer } from './components/Footer';
import { TitleScreen } from './components/auth/TitleScreen';
import { PlanetaryPowerView } from './components/views/PlanetaryPowerView';
import { SpaceStationView } from './components/views/SpaceStationView';
import { MoonBaseView } from './components/views/MoonBaseView';
import { BankVaultView } from './components/views/BankVaultView';
import { EveBlueprintsView } from './components/views/EveBlueprintsView';
import { NMSUniverseView } from './components/views/NMSUniverseView';
import { UnitRoster90View } from './components/views/UnitRoster90View';
import { StargateNetworkView } from './components/views/StargateNetworkView';
import { StargateRelicsView } from './components/views/stargate/StargateRelicsView';
import { GateTokensSystemView } from './components/views/stargate/GateTokensSystemView';
import { GateRoomTelemetryView } from './components/views/stargate/GateRoomTelemetryView';
import { TurnSystemView } from './components/views/TurnSystemView';
import { PlanetaryInvasionView } from './components/views/PlanetaryInvasionView';
import { StoreBattlePassView } from './components/views/StoreBattlePassView';
import { AccountProfilesView } from './components/views/AccountProfilesView';
import { CommanderSystemView } from './components/views/CommanderSystemView';
import { ProfileSystemView } from './components/views/ProfileSystemView';
import { MMORPGOgameView } from './components/views/MMORPGOgameView';
import { HyperspaceView } from './components/views/HyperspaceView';
import { StellarEncyclopediaView } from './components/views/StellarEncyclopediaView';
import { StargateNpcRacesView } from './components/views/StargateNpcRacesView';
import { StargateSystemLordsPvEView } from './components/views/StargateSystemLordsPvEView';
import { AdminControlPanelView } from './components/views/AdminControlPanelView';
import { AdminSystemsTerminalView } from './components/views/AdminSystemsTerminalView';
import { ShipFittingView } from './components/views/ShipFittingView';
import { CivilizationView } from './components/views/CivilizationView';
import { GovernmentSystemView } from './components/views/GovernmentSystemView';
import { DevelopmentCreditsView } from './components/views/DevelopmentCreditsView';
import { DiplomacyView } from './components/views/DiplomacyView';
import { MissionsView } from './components/views/MissionsView';
import { GalacticNewsView } from './components/views/GalacticNewsView';
import { CodexDocumentationView } from './components/views/CodexDocumentationView';
import { RouteNotFoundView } from './components/views/RouteNotFoundView';
import { applyThemeToDOM, getActiveThemeId } from './config/themeConfig';
import { AICSystemView } from './components/views/AICSystemView';
import { MasterUpgradesView } from './components/views/MasterUpgradesView';
import { NemesisSystemView } from './components/views/NemesisSystemView';
import { AddWorldsUniverseBossView } from './components/views/AddWorldsUniverseBossView';
import { SocialGuildsView } from './components/views/SocialGuildsView';
import { MilitaryBarracksEnlistmentView } from './components/views/MilitaryBarracksEnlistmentView';
import { BlueprintFabricatorView } from './components/views/BlueprintFabricatorView';
import { ConstructionYardsView } from './components/views/ConstructionYardsView';
import { LiveSystemRouteBar } from './components/LiveSystemRouteBar';
import { PageHeaderCommandDeck } from './components/PageHeaderCommandDeck';
import { WorkforceAcademyView } from './components/views/WorkforceAcademyView';
import {
  WorkforceAcademyState,
  DEFAULT_WORKFORCE_ACADEMY_STATE,
  calculateWorkforceTotals,
  createDefaultUnitExperience,
} from './data/workforceAcademyData';
import { PatchNotesModal } from './components/modals/PatchNotesModal';
import { SaveStateManagerModal } from './components/modals/SaveStateManagerModal';
import { AdminLoginModal } from './components/modals/AdminLoginModal';
import { RootAdminUrlLoginModal } from './components/modals/RootAdminUrlLoginModal';
import { getAdminAuthSession, processUrlAdminLogin } from './config/adminAuthConfig';
import {
  MasterUpgradesState,
  BankVaultUpgradeState,
  ResourceStorageUpgrades,
} from './types';
import {
  calculateBankCapacity,
  calculateBankInterestRate,
  calculateMaxStorageCapacity,
  calculateStorageUpgradeCost,
  DEFAULT_MASTER_UPGRADES_STATE,
} from './utils/upgradeCalculations';
import {
  auth,
  saveUserDataToFirestore,
  loadUserDataFromFirestore,
  logoutUser,
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { BsatStudio } from './bsat/BsatStudio';
import { EnvironmentConfigSystemView } from './components/views/EnvironmentConfigSystemView';

export default function App() {
  // Persistence Loading
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`uc_state_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    loadStored('isLoggedIn', true)
  );

  const handleLogin = (username: string, race: string) => {
    setProfile((prev) => ({ ...prev, username, race: race as any }));
    setIsLoggedIn(true);
    localStorage.setItem('uc_state_isLoggedIn', JSON.stringify(true));
  };

  const handleRegister = (
    username: string,
    race: string,
    gov: string,
    details?: {
      empireName?: string;
      capitalName?: string;
      leaderTitle?: string;
      originSector?: string;
      email?: string;
    }
  ) => {
    setProfile((prev) => ({
      ...prev,
      username,
      displayName: details?.leaderTitle ? `${details.leaderTitle} ${username}` : username,
      race: race as any,
      governmentId: gov,
      empireName: details?.empireName || `${username}'s Imperial Hegemony`,
      capitalName: details?.capitalName || 'Alpha Homeworld',
      leaderTitle: details?.leaderTitle || 'High Commander',
      originSector: details?.originSector || 'U01:G01:S104:P04',
      email: details?.email || `${username.toLowerCase()}@empire.stargate`,
      planetName: details?.capitalName || prev.planetName || 'Homeworld Earth',
    }));
    setIsLoggedIn(true);
    localStorage.setItem('uc_state_isLoggedIn', JSON.stringify(true));
  };

  const handleLogout = () => {
    logoutUser().catch(() => {});
    setIsLoggedIn(false);
    localStorage.setItem('uc_state_isLoggedIn', JSON.stringify(false));
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Hydrate or link profile from Firestore
        const remoteData = await loadUserDataFromFirestore(user.uid);
        const remoteProfile = remoteData?.profile;
        const remoteResources = remoteData?.resources;

        if (remoteProfile) {
          setProfile((prev) => ({
            ...prev,
            ...remoteProfile,
            id: user.uid,
            username: remoteProfile.username || user.displayName || prev.username,
            displayName: remoteProfile.displayName || user.displayName || prev.displayName,
            email: user.email || prev.email,
          }));
        } else {
          setProfile((prev) => ({
            ...prev,
            id: user.uid,
            username: user.displayName || user.email?.split('@')[0] || prev.username,
            displayName: user.displayName || prev.displayName,
            email: user.email || prev.email,
          }));
        }

        if (remoteResources) {
          setResources((prev) => ({
            ...prev,
            ...remoteResources,
          }));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const [profile, setProfile] = useState<PlayerProfile>(() => {
    const loaded = loadStored('profile', INITIAL_PROFILE);
    return { ...INITIAL_PROFILE, ...loaded };
  });
  const [resources, setResources] = useState<PlayerResources>(() => {
    const loaded = loadStored('resources', INITIAL_RESOURCES);
    const merged = { ...INITIAL_RESOURCES, ...loaded };
    if (!merged.totalPopulation || merged.totalPopulation < 14000000) {
      merged.totalPopulation = 14000000;
    }
    if (merged.gateTokens === undefined) merged.gateTokens = 25;
    if (merged.dimensionalTokens === undefined) merged.dimensionalTokens = 12;
    if (merged.raidTokens === undefined) merged.raidTokens = 6;
    return merged;
  });
  const [technologies, setTechnologies] = useState<Technology[]>(() => {
    const loaded = loadStored('technologies', INITIAL_TECHNOLOGIES);
    if (loaded && Array.isArray(loaded)) {
      const existingIds = new Set(loaded.map((t: Technology) => t.id));
      const missing = INITIAL_TECHNOLOGIES.filter((t) => !existingIds.has(t.id));
      if (missing.length > 0) {
        return [...loaded, ...missing];
      }
    }
    return loaded;
  });
  const [playerWeapons, setPlayerWeapons] = useState<PlayerWeapon[]>(() =>
    loadStored('weapons', INITIAL_PLAYER_WEAPONS)
  );
  const [targets, setTargets] = useState<TargetRealm[]>(() =>
    loadStored('targets', TARGET_REALMS)
  );
  const [modules, setModules] = useState<MothershipModule[]>(() =>
    loadStored('modules', INITIAL_MOTHERSHIP_MODULES)
  );
  const [planets, setPlanets] = useState<PlanetColony[]>(() => {
    const loaded = loadStored('planets', INITIAL_PLANETS);
    return loaded.map((p: PlanetColony) => {
      if (p.isHomeworld && (!p.population || p.population.total < 14000000)) {
        return {
          ...p,
          fieldsUsed: p.fieldsUsed || 84,
          fieldsMax: p.fieldsMax || 188,
          population: {
            ...(p.population || INITIAL_PLANETS[0].population!),
            total: 14000000,
            housingCapacity: Math.max(22000000, p.population?.housingCapacity || 22000000),
            strata: {
              ...(p.population?.strata || INITIAL_PLANETS[0].population!.strata),
              militaryRecruits: Math.max(1600000, p.population?.strata?.militaryRecruits || 1600000),
            },
          },
        };
      }
      return p;
    });
  });
  const [activePlanetId, setActivePlanetId] = useState<string>(() =>
    loadStored('active_planet_id', 'pl-homeworld')
  );

  useEffect(() => {
    localStorage.setItem('uc_state_active_planet_id', JSON.stringify(activePlanetId));
  }, [activePlanetId]);
  const [orders, setOrders] = useState<MarketOrder[]>(() =>
    loadStored('orders', INITIAL_MARKET_ORDERS)
  );
  const [battles, setBattles] = useState<BattleRecord[]>(() =>
    loadStored('battles', [])
  );
  const [missions, setMissions] = useState<CovertMissionRecord[]>(() =>
    loadStored('missions', [])
  );
  const [messages, setMessages] = useState<GameMessage[]>(() =>
    loadStored('messages', INITIAL_MESSAGES)
  );
  const [rankings, setRankings] = useState<RankingEntry[]>(() =>
    loadStored('rankings', INITIAL_RANKINGS)
  );

  const [masterUpgrades, setMasterUpgrades] = useState<MasterUpgradesState>(() =>
    loadStored('master_upgrades', DEFAULT_MASTER_UPGRADES_STATE)
  );

  useEffect(() => {
    localStorage.setItem('uc_state_master_upgrades', JSON.stringify(masterUpgrades));
  }, [masterUpgrades]);

  // Active UI Navigation state
  const [activeRoute, setActiveRoute] = useState<string>('dashboard');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    resources: true,
    facilities: true,
    research: true,
    shipyard: true,
    defenses: false,
    fleet: true,
    galaxy: true,
    empire: false,
    merchant: false,
    alliance: false,
    intelligence: false,
    officers: false,
    store: false,
    admin: false,
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState<boolean>(false);
  const [patchNotesTab, setPatchNotesTab] = useState<'update' | 'patch'>('patch');
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState<boolean>(false);
  const [isSaveManagerOpen, setIsSaveManagerOpen] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showRootAdminUrlModal, setShowRootAdminUrlModal] = useState<boolean>(false);
  const [adminSession, setAdminSession] = useState(getAdminAuthSession);
  const [urlLoginNotification, setUrlLoginNotification] = useState<{
    message: string;
    username: string;
    created?: boolean;
  } | null>(null);

  const isAdminUser = profile.role === 'admin' || profile.isAdmin === true || (adminSession && adminSession.isAuthenticated);

  // Auto-Detect and Process Root Admin URL Login & Creation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlResult = processUrlAdminLogin();
      if (urlResult.success && urlResult.session && urlResult.account) {
        sound.play('confirm');
        setAdminSession(urlResult.session);
        setIsLoggedIn(true);
        localStorage.setItem('uc_state_isLoggedIn', JSON.stringify(true));

        setProfile((prev) => ({
          ...prev,
          username: urlResult.account!.username,
          email: urlResult.account!.email,
          role: 'admin',
          isAdmin: true,
        }));

        const targetTab = urlResult.targetTab || 'crown';
        setActiveRoute(targetTab === 'crown' ? 'admin' : `admin-${targetTab}`);

        setUrlLoginNotification({
          message: urlResult.message || `Root Admin [${urlResult.account.username}] authenticated via URL.`,
          username: urlResult.account.username,
          created: urlResult.created,
        });

        // Clean query/hash parameters to prevent exposing secrets in browser history
        try {
          const cleanPath = window.location.pathname;
          window.history.replaceState({}, document.title, cleanPath);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Root Admin URL Login Parser Error:', err);
    }
  }, []);

  const handleRootAdminLoginSuccess = (session: any, account: any) => {
    setAdminSession(session);
    setIsLoggedIn(true);
    localStorage.setItem('uc_state_isLoggedIn', JSON.stringify(true));
    setProfile((prev) => ({
      ...prev,
      username: account.username,
      email: account.email,
      role: 'admin',
      isAdmin: true,
    }));
    setActiveRoute('admin');
    sound.play('confirm');
    setUrlLoginNotification({
      message: `Root Admin "${account.username}" authenticated successfully! Clearance Level 10 Active.`,
      username: account.username,
    });
  };

  useEffect(() => {
    applyThemeToDOM(getActiveThemeId());
  }, []);

  // OGame Space Systems State
  const [ogameTechnologies, setOgameTechnologies] = useState<OGameTechnology[]>(() =>
    loadStored('ogame_technologies', INITIAL_OGAME_TECHNOLOGIES)
  );
  const [researchQueue, setResearchQueue] = useState<ResearchQueueItem[]>(() =>
    loadStored('research_queue', [])
  );
  const [labSpecialization, setLabSpecialization] = useState<LabSpecialization>(() =>
    loadStored('lab_specialization', 'physics')
  );
  const [ogameFacilities, setOgameFacilities] = useState<OGameFacility[]>(() =>
    loadStored('ogame_facilities', INITIAL_OGAME_FACILITIES)
  );
  const [factoryQueue, setFactoryQueue] = useState<FactoryQueueItem[]>(() =>
    loadStored('factory_queue', [])
  );
  const [ogameShips, setOgameShips] = useState<OGameShip[]>(() =>
    loadStored('ogame_ships', INITIAL_OGAME_SHIPS)
  );
  const [shipyardQueue, setShipyardQueue] = useState<ShipyardQueueItem[]>(() =>
    loadStored('shipyard_queue', [])
  );
  const [selectedFormation, setSelectedFormation] = useState<FleetFormationType>(() =>
    loadStored('fleet_formation', 'standard')
  );
  const [fleetPresets, setFleetPresets] = useState<FleetFormationPreset[]>(() =>
    loadStored('fleet_presets', INITIAL_FLEET_PRESETS)
  );
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [ogameDefenses, setOgameDefenses] = useState<OGameDefense[]>(() =>
    loadStored('ogame_defenses', INITIAL_OGAME_DEFENSES)
  );
  const [defenseQueue, setDefenseQueue] = useState<DefenseQueueItem[]>(() =>
    loadStored('defense_queue', [])
  );
  const [activeExpeditions, setActiveExpeditions] = useState<ExpeditionMission[]>(() =>
    loadStored('active_expeditions', INITIAL_EXPEDITIONS)
  );
  const [expeditionLogs, setExpeditionLogs] = useState<ExpeditionLog[]>(() =>
    loadStored('expedition_logs', INITIAL_EXPEDITION_LOGS)
  );
  const [megastructures, setMegastructures] = useState<MegastructureProject[]>(() =>
    loadStored('megastructures', INITIAL_MEGASTRUCTURES)
  );

  // Cron Background Engine State
  const [cronJobs, setCronJobs] = useState<CronJob[]>(() =>
    loadStored('cron_jobs', INITIAL_CRON_JOBS)
  );
  const [cronLogs, setCronLogs] = useState<CronExecutionLog[]>(() =>
    loadStored('cron_logs', INITIAL_CRON_LOGS)
  );
  const [cronConfig, setCronConfig] = useState<CronConfig>(() =>
    loadStored('cron_config', DEFAULT_CRON_CONFIG)
  );
  const [nextTickSeconds, setNextTickSeconds] = useState<number>(() =>
    loadStored('cron_config', DEFAULT_CRON_CONFIG).tickIntervalSeconds || 60
  );
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  // Admin Systems & Imperial Crown State
  const [decrees, setDecrees] = useState<ImperialDecree[]>(() =>
    loadStored('imperial_decrees', INITIAL_IMPERIAL_DECREES)
  );
  const [worldModifiers, setWorldModifiers] = useState<AdminWorldModifier[]>(() =>
    loadStored('admin_world_modifiers', INITIAL_WORLD_MODIFIERS)
  );
  const [serverSettings, setServerSettings] = useState<AdminServerSettings>(() =>
    loadStored('admin_server_settings', DEFAULT_ADMIN_SETTINGS)
  );

  // OGame Clone Admin State
  const [ogameUniverseConfig, setOgameUniverseConfig] = useState<OGameUniverseConfig>(() =>
    loadStored('admin_ogame_universe_config', DEFAULT_OGAME_UNIVERSE_CONFIG)
  );
  const [adminUsers, setAdminUsers] = useState<AdminUserAccount[]>(() =>
    loadStored('admin_ogame_users', INITIAL_ADMIN_USERS)
  );
  const [adminBans, setAdminBans] = useState<AdminBanRecord[]>(() =>
    loadStored('admin_ogame_bans', INITIAL_ADMIN_BANS)
  );
  const [adminPlanets, setAdminPlanets] = useState<AdminPlanetEntry[]>(() =>
    loadStored('admin_ogame_planets', INITIAL_ADMIN_PLANETS)
  );
  const [adminFleetMissions, setAdminFleetMissions] = useState<AdminFleetMission[]>(() =>
    loadStored('admin_ogame_fleets', INITIAL_ADMIN_FLEET_MISSIONS)
  );
  const [adminDebrisFields, setAdminDebrisFields] = useState<AdminDebrisField[]>(() =>
    loadStored('admin_ogame_debris', INITIAL_ADMIN_DEBRIS_FIELDS)
  );
  const [adminSupportTickets, setAdminSupportTickets] = useState<AdminSupportTicket[]>(() =>
    loadStored('admin_ogame_tickets', INITIAL_ADMIN_SUPPORT_TICKETS)
  );
  const [adminSecurityAlerts, setAdminSecurityAlerts] = useState<AdminSecurityAlert[]>(() =>
    loadStored('admin_ogame_security', INITIAL_ADMIN_SECURITY_ALERTS)
  );
  const [adminGlobalEvents, setAdminGlobalEvents] = useState<AdminGlobalEvent[]>(() =>
    loadStored('admin_ogame_events', INITIAL_ADMIN_GLOBAL_EVENTS)
  );

  // Workforce & Specialized Academy State
  const [workforceAcademyState, setWorkforceAcademyState] = useState<WorkforceAcademyState>(() =>
    loadStored('workforce_academy_state', DEFAULT_WORKFORCE_ACADEMY_STATE)
  );

  // Auto-save changes to localStorage and Firestore
  useEffect(() => {
    localStorage.setItem('uc_state_profile', JSON.stringify(profile));
    if (profile?.username) {
      saveUserDataToFirestore(profile.username, profile, resources);
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('uc_state_resources', JSON.stringify(resources));
    if (profile?.username) {
      saveUserDataToFirestore(profile.username, profile, resources);
    }
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('uc_state_technologies', JSON.stringify(technologies));
  }, [technologies]);

  useEffect(() => {
    localStorage.setItem('uc_state_weapons', JSON.stringify(playerWeapons));
  }, [playerWeapons]);

  useEffect(() => {
    localStorage.setItem('uc_state_targets', JSON.stringify(targets));
  }, [targets]);

  useEffect(() => {
    localStorage.setItem('uc_state_modules', JSON.stringify(modules));
  }, [modules]);

  useEffect(() => {
    localStorage.setItem('uc_state_planets', JSON.stringify(planets));
  }, [planets]);

  useEffect(() => {
    localStorage.setItem('uc_state_cron_jobs', JSON.stringify(cronJobs));
  }, [cronJobs]);

  useEffect(() => {
    localStorage.setItem('uc_state_cron_logs', JSON.stringify(cronLogs));
  }, [cronLogs]);

  useEffect(() => {
    localStorage.setItem('uc_state_workforce_academy', JSON.stringify(workforceAcademyState));
  }, [workforceAcademyState]);

  useEffect(() => {
    localStorage.setItem('uc_state_cron_config', JSON.stringify(cronConfig));
  }, [cronConfig]);

  useEffect(() => {
    localStorage.setItem('uc_state_ogame_universe_config', JSON.stringify(ogameUniverseConfig));
  }, [ogameUniverseConfig]);

  useEffect(() => {
    localStorage.setItem('uc_state_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('uc_state_admin_bans', JSON.stringify(adminBans));
  }, [adminBans]);

  useEffect(() => {
    localStorage.setItem('uc_state_admin_planets', JSON.stringify(adminPlanets));
  }, [adminPlanets]);

  useEffect(() => {
    localStorage.setItem('uc_state_admin_fleets', JSON.stringify(adminFleetMissions));
  }, [adminFleetMissions]);

  useEffect(() => {
    localStorage.setItem('uc_state_admin_debris', JSON.stringify(adminDebrisFields));
  }, [adminDebrisFields]);

  useEffect(() => {
    localStorage.setItem('uc_state_admin_tickets', JSON.stringify(adminSupportTickets));
  }, [adminSupportTickets]);

  useEffect(() => {
    localStorage.setItem('uc_state_admin_security', JSON.stringify(adminSecurityAlerts));
  }, [adminSecurityAlerts]);

  useEffect(() => {
    localStorage.setItem('uc_state_admin_events', JSON.stringify(adminGlobalEvents));
  }, [adminGlobalEvents]);

  useEffect(() => {
    localStorage.setItem('uc_state_planets', JSON.stringify(planets));
  }, [planets]);

  useEffect(() => {
    localStorage.setItem('uc_state_battles', JSON.stringify(battles));
  }, [battles]);

  useEffect(() => {
    localStorage.setItem('uc_state_missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('uc_state_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('uc_state_ogame_technologies', JSON.stringify(ogameTechnologies));
  }, [ogameTechnologies]);

  useEffect(() => {
    localStorage.setItem('uc_state_research_queue', JSON.stringify(researchQueue));
  }, [researchQueue]);

  useEffect(() => {
    localStorage.setItem('uc_state_lab_specialization', JSON.stringify(labSpecialization));
  }, [labSpecialization]);

  useEffect(() => {
    localStorage.setItem('uc_state_ogame_facilities', JSON.stringify(ogameFacilities));
  }, [ogameFacilities]);

  useEffect(() => {
    localStorage.setItem('uc_state_factory_queue', JSON.stringify(factoryQueue));
  }, [factoryQueue]);

  useEffect(() => {
    localStorage.setItem('uc_state_ogame_ships', JSON.stringify(ogameShips));
  }, [ogameShips]);

  useEffect(() => {
    localStorage.setItem('uc_state_shipyard_queue', JSON.stringify(shipyardQueue));
  }, [shipyardQueue]);

  useEffect(() => {
    localStorage.setItem('uc_state_fleet_formation', JSON.stringify(selectedFormation));
  }, [selectedFormation]);

  useEffect(() => {
    localStorage.setItem('uc_state_fleet_presets', JSON.stringify(fleetPresets));
  }, [fleetPresets]);

  useEffect(() => {
    localStorage.setItem('uc_state_ogame_defenses', JSON.stringify(ogameDefenses));
  }, [ogameDefenses]);

  useEffect(() => {
    localStorage.setItem('uc_state_defense_queue', JSON.stringify(defenseQueue));
  }, [defenseQueue]);

  useEffect(() => {
    localStorage.setItem('uc_state_active_expeditions', JSON.stringify(activeExpeditions));
  }, [activeExpeditions]);

  useEffect(() => {
    localStorage.setItem('uc_state_expedition_logs', JSON.stringify(expeditionLogs));
  }, [expeditionLogs]);

  useEffect(() => {
    localStorage.setItem('uc_state_megastructures', JSON.stringify(megastructures));
  }, [megastructures]);

  useEffect(() => {
    localStorage.setItem('uc_state_imperial_decrees', JSON.stringify(decrees));
  }, [decrees]);

  useEffect(() => {
    localStorage.setItem('uc_state_admin_world_modifiers', JSON.stringify(worldModifiers));
  }, [worldModifiers]);

  useEffect(() => {
    localStorage.setItem('uc_state_admin_server_settings', JSON.stringify(serverSettings));
  }, [serverSettings]);

  // Derived Calculations
  const currentRace = RACES.find((r) => r.id === profile.race);
  const raceIncomeMod = currentRace?.incomeModifier || 1.0;
  const raceAttackMod = currentRace?.attackModifier || 1.0;
  const raceDefMod = currentRace?.defenseModifier || 1.0;
  const raceCovMod = currentRace?.covertModifier || 1.0;

  const defconMults: Record<number, number> = {
    0: 1.0,
    1: 0.9,
    2: 0.8,
    3: 0.6,
    4: 0.3,
  };
  const defconMult = defconMults[profile.defconLevel] ?? 1.0;

  // Planet bonuses & Colonial Maintenance Costs
  const totalColoniesCount = planets.length;
  const planetIncomeTotal = planets.reduce((sum, p) => sum + (p.incomeBonus || 0), 0);
  const planetMaintenanceTotal = planets.reduce(
    (sum, p) => sum + calculateColonyMaintenance(p, totalColoniesCount),
    0
  );
  const netColonyIncome = Math.max(0, planetIncomeTotal - planetMaintenanceTotal);
  const planetDefTotal = planets.reduce((sum, p) => sum + (p.defenseBonus || 0), 0);

  // Workforce Academy 90-Role totals with Persistent Veterancy & Doctrine
  const workforceTotals = calculateWorkforceTotals(
    workforceAcademyState.unitCounts,
    workforceAcademyState.unitExperience
  );

  // Natural income formula:
  // Base Gross = ((untrained * 20) + ((miners + lifers) * 80) + planetIncomeTotal + workforceTotals.totalMiningYield * 40 + workforceTotals.totalCreditsTax)
  // Deduct colony maintenance cost per level (creates strategic trade-off for rapid expansion)
  const naturalIncomeGross =
    resources.untrainedUnits * 20 +
    (resources.miners + resources.lifers) * 80 +
    planetIncomeTotal +
    workforceTotals.totalMiningYield * 40 +
    workforceTotals.totalCreditsTax;
  const naturalIncomeBase = Math.max(0, naturalIncomeGross - planetMaintenanceTotal);
  const naturalIncome = Math.max(0, Math.round(naturalIncomeBase * raceIncomeMod * defconMult));

  // Equipment & Military Upkeep
  const equipmentUpkeep = playerWeapons.reduce((sum, pw) => {
    const wt = WEAPON_TYPES.find((w) => w.id === pw.weaponTypeId);
    return sum + (wt && wt.upkeep ? wt.upkeep * pw.quantity : 0);
  }, 0);

  const militaryUpkeep = Math.round(
    resources.attackUnits * 0.12 +
    resources.defenseUnits * 0.08 +
    resources.superUnits * 2.5 +
    resources.spies * 0.4 +
    resources.antiSpies * 0.4 +
    workforceTotals.totalCreditsUpkeep +
    equipmentUpkeep
  );

  const netIncome = Math.max(0, naturalIncome - militaryUpkeep);

  // Bank capacity formula from FormulaService.php:
  // naturalIncome * 72 (or minimum 250,000)
  const bankCapacity = Math.max(350000, naturalIncome * 72);

  // Technology multipliers
  const offenseTechLevel = technologies
    .filter((t) => t.category === 'offense')
    .reduce((sum, t) => sum + t.level, 0);
  const defenseTechLevel = technologies
    .filter((t) => t.category === 'defense')
    .reduce((sum, t) => sum + t.level, 0);
  const covertTechLevel = technologies
    .filter((t) => t.category === 'covert')
    .reduce((sum, t) => sum + t.level, 0);
  const antiCovertTechLevel = technologies
    .filter((t) => t.category === 'anti-covert')
    .reduce((sum, t) => sum + t.level, 0);

  const offenseMult = 1.0 + offenseTechLevel * 0.15;
  const defenseMult = 1.0 + defenseTechLevel * 0.15;
  const covertMult = 1.0 + covertTechLevel * 0.15;
  const antiCovertMult = 1.0 + antiCovertTechLevel * 0.15;

  // Mothership power bonuses
  const volleyBayLevel = modules.find((m) => m.key === 'volley_bays')?.level || 1;
  const shieldModLevel = modules.find((m) => m.key === 'shields')?.level || 1;

  // Weapons & offensive equipment power sum
  const totalWeaponPower = playerWeapons.reduce((sum, pw) => {
    const wt = WEAPON_TYPES.find((w) => w.id === pw.weaponTypeId);
    return sum + (wt ? wt.attack * pw.quantity * (pw.durability / 100) : 0);
  }, 0);

  // Armors, shields & defensive equipment power sum
  const totalDefenseEquipmentPower = playerWeapons.reduce((sum, pw) => {
    const wt = WEAPON_TYPES.find((w) => w.id === pw.weaponTypeId);
    return sum + (wt ? wt.defense * pw.quantity * (pw.durability / 100) : 0);
  }, 0);

  // Combat strike power
  const strikePower = Math.round(
    (resources.attackUnits * 5 +
      resources.superUnits * 25 +
      workforceTotals.totalAttack +
      totalWeaponPower * 0.6 +
      volleyBayLevel * 1200) *
      offenseMult *
      raceAttackMod
  );

  // Defense power
  const defensePower = Math.round(
    (resources.defenseUnits * 5 +
      resources.superUnits * 20 +
      workforceTotals.totalDefense +
      totalDefenseEquipmentPower * 0.6 +
      planetDefTotal +
      shieldModLevel * 1500) *
      defenseMult *
      raceDefMod
  );

  // Covert rating
  const covertRating = Math.round(
    (resources.spies * 15 + resources.antiSpies * 10) * covertMult * raceCovMod
  );

  // Keep rankings up to date with user's score
  useEffect(() => {
    const userOverall = Math.round((strikePower + defensePower + covertRating * 10 + 175000) / 4);
    setRankings((prev) =>
      prev.map((r) => {
        if (r.commanderName.includes('(You)')) {
          return {
            ...r,
            overallScore: userOverall,
            attackScore: strikePower,
            defenseScore: defensePower,
            covertScore: covertRating * 10,
            glory: profile.glory,
          };
        }
        return r;
      })
    );
  }, [strikePower, defensePower, covertRating, profile.glory]);

  // Offline catch-up on initial mount
  useEffect(() => {
    if (!cronConfig.offlineCatchup) return;
    try {
      const lastTurnTime = new Date(profile.lastTurnAt).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastTurnTime) / 1000);
      const interval = cronConfig.tickIntervalSeconds || 60;
      if (elapsedSeconds >= interval * 2) {
        const missedTicks = Math.min(50, Math.floor(elapsedSeconds / interval));
        if (missedTicks > 0) {
          const addedIncome = missedTicks * netIncome;
          const addedUnits = missedTicks * resources.unitProduction;

          setResources((prev) => ({
            ...prev,
            attackTurns: Math.min(prev.turnCap || 5000, prev.attackTurns + missedTicks),
            credits: (prev.credits ?? 500000) + 250 * missedTicks,
            naquadah: prev.naquadah + addedIncome,
            untrainedUnits: prev.untrainedUnits + addedUnits,
          }));

          setProfile((prev) => ({
            ...prev,
            lastTurnAt: new Date().toISOString(),
          }));

          const catchupLog: CronExecutionLog = {
            id: `log-${Date.now()}`,
            jobId: 'turn_cron',
            jobName: 'Turn Settlement & Resource Yield',
            timestamp: new Date().toLocaleTimeString(),
            durationMs: 6,
            status: 'success',
            message: `Offline Catch-Up: Processed ${missedTicks} elapsed turn ticks.`,
            details: {
              turnsAdded: missedTicks,
              incomeAdded: addedIncome,
              unitsAdded: addedUnits,
            },
          };
          setCronLogs((prev) => [catchupLog, ...prev.slice(0, 99)]);
          setOfflineNotice(
            `Empire automated cron caught up while away: ${missedTicks} turns processed (+${addedIncome.toLocaleString()} NQ, +${addedUnits} recruits).`
          );
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Background automated Cron heartbeat runner & Queues Progression
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Advance Research Queue
      setResearchQueue((prev) => {
        if (prev.length === 0) return prev;
        const completed: ResearchQueueItem[] = [];
        const nextQueue: ResearchQueueItem[] = [];

        for (const item of prev) {
          if (item.remainingSeconds <= 1) {
            completed.push(item);
          } else {
            nextQueue.push({ ...item, remainingSeconds: item.remainingSeconds - 1 });
          }
        }

        if (completed.length > 0) {
          sound.play('research');
          setOgameTechnologies((techs) =>
            techs.map((t) => {
              const comp = completed.find((c) => c.techId === t.id);
              if (comp) {
                return { ...t, level: comp.targetLevel };
              }
              return t;
            })
          );
          setProfile((p) => ({ ...p, glory: p.glory + 100 }));
        }

        return nextQueue;
      });

      // 2. Advance Factory Queue
      setFactoryQueue((prev) => {
        if (prev.length === 0) return prev;
        const completed: FactoryQueueItem[] = [];
        const nextQueue: FactoryQueueItem[] = [];

        for (const item of prev) {
          if (item.remainingSeconds <= 1) {
            completed.push(item);
          } else {
            nextQueue.push({ ...item, remainingSeconds: item.remainingSeconds - 1 });
          }
        }

        if (completed.length > 0) {
          sound.play('confirm');
          setOgameFacilities((facs) =>
            facs.map((f) => {
              const comp = completed.find((c) => c.facilityId === f.id);
              if (comp) {
                return { ...f, level: comp.targetLevel };
              }
              return f;
            })
          );
        }

        return nextQueue;
      });

      // 3. Advance Shipyard Queue
      setShipyardQueue((prev) => {
        if (prev.length === 0) return prev;
        const completed: ShipyardQueueItem[] = [];
        const nextQueue: ShipyardQueueItem[] = [];

        for (const item of prev) {
          if (item.remainingSeconds <= 1) {
            completed.push(item);
          } else {
            const nextSec = item.remainingSeconds - 1;
            const built = Math.min(
              item.quantity,
              Math.floor(((item.totalTimeSeconds - nextSec) / item.totalTimeSeconds) * item.quantity)
            );
            nextQueue.push({
              ...item,
              remainingSeconds: nextSec,
              completedQuantity: built,
            });
          }
        }

        if (completed.length > 0) {
          sound.play('confirm');
          setOgameShips((ships) =>
            ships.map((s) => {
              const comp = completed.find((c) => c.shipId === s.id);
              if (comp) {
                return { ...s, quantity: s.quantity + comp.quantity };
              }
              return s;
            })
          );
        }

        return nextQueue;
      });

      // 4. Advance Defense Queue
      setDefenseQueue((prev) => {
        if (prev.length === 0) return prev;
        const completed: DefenseQueueItem[] = [];
        const nextQueue: DefenseQueueItem[] = [];

        for (const item of prev) {
          if (item.remainingSeconds <= 1) {
            completed.push(item);
          } else {
            const nextSec = item.remainingSeconds - 1;
            const built = Math.min(
              item.quantity,
              Math.floor(((item.totalTimeSeconds - nextSec) / item.totalTimeSeconds) * item.quantity)
            );
            nextQueue.push({
              ...item,
              remainingSeconds: nextSec,
              completedQuantity: built,
            });
          }
        }

        if (completed.length > 0) {
          sound.play('confirm');
          setOgameDefenses((defs) =>
            defs.map((d) => {
              const comp = completed.find((c) => c.defenseId === d.id);
              if (comp) {
                return { ...d, quantity: d.quantity + comp.quantity };
              }
              return d;
            })
          );
        }

        return nextQueue;
      });

      // 5. Advance Active Expeditions
      setActiveExpeditions((prev) => {
        if (prev.length === 0) return prev;
        const completed: ExpeditionMission[] = [];
        const nextMissions: ExpeditionMission[] = [];

        for (const m of prev) {
          if (m.remainingSeconds <= 1) {
            completed.push(m);
          } else {
            nextMissions.push({ ...m, remainingSeconds: m.remainingSeconds - 1 });
          }
        }

        if (completed.length > 0) {
          sound.play('success');
          completed.forEach((m) => {
            const metalLoot = Math.floor(Math.random() * 25000 + 10000);
            const crystalLoot = Math.floor(Math.random() * 15000 + 5000);
            const deutLoot = Math.floor(Math.random() * 8000 + 2000);

            // Re-integrate fleet ships back to hangar
            setOgameShips((ships) =>
              ships.map((s) => {
                const assigned = m.fleet.find((f) => f.shipId === s.id);
                if (assigned) {
                  return { ...s, quantity: s.quantity + assigned.quantity };
                }
                return s;
              })
            );

            setResources((r) => ({
              ...r,
              metal: (r.metal ?? 0) + metalLoot,
              crystal: (r.crystal ?? 0) + crystalLoot,
              deuterium: (r.deuterium ?? 0) + deutLoot,
            }));

            const newLog: ExpeditionLog = {
              id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              sector: m.targetSector,
              timestamp: new Date().toLocaleTimeString(),
              missionType: m.type,
              status: 'triumph',
              narrative: `Expedition task force returned successfully from ${m.targetSector}. Long-range subspace drills extracted substantial raw mineral pockets from ancient asteroid belts.`,
              loot: {
                metal: metalLoot,
                crystal: crystalLoot,
                deuterium: deutLoot,
              },
            };
            setExpeditionLogs((logs) => [newLog, ...logs.slice(0, 49)]);
          });
        }

        return nextMissions;
      });

      // 6. Advance Megastructures
      setMegastructures((prev) =>
        prev.map((proj) => {
          if (!proj.isConstructing) return proj;
          if (proj.constructionRemainingSeconds <= 1) {
            sound.play('success');
            const nextStageNum = proj.currentStage + 1;
            return {
              ...proj,
              isConstructing: false,
              currentStage: nextStageNum,
              constructionRemainingSeconds: 0,
              stages: proj.stages.map((st) =>
                st.stageNumber === nextStageNum ? { ...st, completed: true } : st
              ),
            };
          }
          return {
            ...proj,
            constructionRemainingSeconds: proj.constructionRemainingSeconds - 1,
          };
        })
      );

      // 7. Advance Cron Heartbeat Timer
      if (cronConfig.autoTickEnabled) {
        setNextTickSeconds((prev) => {
          if (prev <= 1) {
            handleRunCronJob('turn_cron', true);
            return cronConfig.tickIntervalSeconds;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cronConfig.autoTickEnabled, cronConfig.tickIntervalSeconds, netIncome, resources.unitProduction, cronJobs]);

  // Execute Individual Cron Job
  const handleRunCronJob = (jobId: CronJobId, isAuto: boolean = false, multiplier: number = 1) => {
    const job = cronJobs.find((j) => j.id === jobId);
    if (!job || (!job.enabled && isAuto)) return;

    const mult = Math.max(1, multiplier);
    const start = performance.now();
    let logMessage = '';
    let logDetails: CronExecutionLog['details'] = {};

    if (jobId === 'turn_cron') {
      const metalMineLevel = ogameFacilities.find((f) => f.id === 'metal_mine')?.level || 1;
      const crystalMineLevel = ogameFacilities.find((f) => f.id === 'crystal_mine')?.level || 1;
      const deutMineLevel = ogameFacilities.find((f) => f.id === 'deuterium_synthesizer')?.level || 1;
      const solarLevel = ogameFacilities.find((f) => f.id === 'solar_plant')?.level || 1;
      const fusionLevel = ogameFacilities.find((f) => f.id === 'fusion_reactor')?.level || 0;

      // Authentic Base Production Formulas
      const baseMetal = Math.round(30 * metalMineLevel * Math.pow(1.1, metalMineLevel)) + 30;
      const baseCrystal = Math.round(20 * crystalMineLevel * Math.pow(1.1, crystalMineLevel)) + 15;
      const baseDeut = Math.round(10 * deutMineLevel * Math.pow(1.1, deutMineLevel) * 1.36);

      // Authentic Energy Formulas
      const energyProduced = Math.round(20 * solarLevel * Math.pow(1.1, solarLevel)) + Math.round(30 * fusionLevel * Math.pow(1.05, fusionLevel)) + 100;
      const energyNeededMetal = Math.round(10 * metalMineLevel * Math.pow(1.1, metalMineLevel));
      const energyNeededCrystal = Math.round(10 * crystalMineLevel * Math.pow(1.1, crystalMineLevel));
      const energyNeededDeut = Math.round(20 * deutMineLevel * Math.pow(1.1, deutMineLevel));
      const totalEnergyNeeded = Math.max(1, energyNeededMetal + energyNeededCrystal + energyNeededDeut);

      const energyRatio = Math.min(1.0, Math.max(0.0, energyProduced / totalEnergyNeeded));

      const metalAdded = Math.round(baseMetal * energyRatio) * mult;
      const crystalAdded = Math.round(baseCrystal * energyRatio) * mult;
      const deutAdded = Math.round(baseDeut * energyRatio) * mult;
      const incomeAdded = netIncome * mult;
      const recruitsAdded = resources.unitProduction * mult;

      // Dynamic Planetary Food, Water & Population Simulation
      let popGrowthTotal = 0;
      let totalFoodProduced = 0;
      let totalFoodConsumed = 0;
      let totalWaterProduced = 0;
      let totalWaterConsumed = 0;

      setPlanets((prevPlanets) => {
        const updated = prevPlanets.map((p) => {
          const lf = p.lifeSupportFacilities || {
            hydroponicsDomes: 4,
            bioFarms: 3,
            geneticCropLabs: 2,
            deepAquiferPumps: 3,
            moistureCondensers: 2,
            desalinationPlants: 2,
            subsurfaceCisterns: 2,
            atmosphereScrubbers: 2,
          };
          const pop = p.population || {
            total: 2500000,
            growthRatePerHour: 15000,
            housingCapacity: 5000000,
            happiness: 85,
            unrest: 10,
            strata: {
              farmers: 500000,
              hydrologists: 400000,
              miners: 600000,
              industrialWorkers: 500000,
              scientists: 200000,
              administrators: 100000,
              militaryRecruits: 200000,
            },
            livingStandard: 'utopian',
            rationingLevel: 'abundant',
          };

          // Food Output per turn:
          const geneticMult = 1 + (lf.geneticCropLabs || 0) * 0.15;
          const farmerBonus = Math.round((pop.strata?.farmers || 0) * 0.00008);
          const foodPerTurn = Math.round(((lf.hydroponicsDomes || 4) * 28 + (lf.bioFarms || 3) * 42 + farmerBonus + 30) * Math.max(0.25, energyRatio) * geneticMult);

          // Food Consumed per turn:
          const rationingMult = pop.rationingLevel === 'abundant' ? 1.2 : pop.rationingLevel === 'standard' ? 1.0 : pop.rationingLevel === 'strict_rationing' ? 0.65 : 0.35;
          const foodConsPerTurn = Math.round((pop.total * 0.000008 + 15) * rationingMult);

          // Water Output per turn:
          const hydrologistBonus = Math.round((pop.strata?.hydrologists || 0) * 0.00007);
          const waterPerTurn = Math.round(((lf.deepAquiferPumps || 3) * 32 + (lf.moistureCondensers || 2) * 20 + (lf.desalinationPlants || 2) * 38 + hydrologistBonus + 35) * Math.max(0.25, energyRatio));

          // Water Consumed per turn:
          const waterConsPerTurn = Math.round(pop.total * 0.000009 + 18);

          // Apply Multiplier
          const batchFoodProd = foodPerTurn * mult;
          const batchFoodCons = foodConsPerTurn * mult;
          const batchWaterProd = waterPerTurn * mult;
          const batchWaterCons = waterConsPerTurn * mult;

          totalFoodProduced += batchFoodProd;
          totalFoodConsumed += batchFoodCons;
          totalWaterProduced += batchWaterProd;
          totalWaterConsumed += batchWaterCons;

          const curFood = p.foodStockpile ?? 25000;
          const capFood = p.foodCapacity ?? 100000;
          const newFood = Math.max(0, Math.min(capFood, curFood + batchFoodProd - batchFoodCons));

          const curWater = p.waterStockpile ?? 30000;
          const capWater = p.waterCapacity ?? 120000;
          const newWater = Math.max(0, Math.min(capWater, curWater + batchWaterProd - batchWaterCons));

          // Population Dynamics
          let popDelta = 0;
          let newHappiness = pop.happiness;
          let newUnrest = pop.unrest;

          if (newFood <= 0 || newWater <= 0) {
            // Crisis! Famine or severe drought
            popDelta = -Math.max(5 * mult, Math.round(pop.total * 0.00008 * mult));
            newHappiness = Math.max(10, newHappiness - 2 * mult);
            newUnrest = Math.min(95, newUnrest + 3 * mult);
          } else {
            if (pop.total < pop.housingCapacity) {
              const baseGrowth = Math.max(5, Math.round(pop.total * 0.000035 * mult));
              const hapFactor = newHappiness / 100;
              const growthRatMult = pop.rationingLevel === 'abundant' ? 1.25 : pop.rationingLevel === 'standard' ? 1.0 : pop.rationingLevel === 'strict_rationing' ? 0.4 : -0.2;
              popDelta = Math.round(baseGrowth * hapFactor * growthRatMult);
            }
            if (pop.rationingLevel === 'abundant') {
              newHappiness = Math.min(100, newHappiness + 0.1 * mult);
              newUnrest = Math.max(0, newUnrest - 0.1 * mult);
            }
          }

          const newTotalPop = Math.max(1000, pop.total + popDelta);
          popGrowthTotal += popDelta;

          return {
            ...p,
            foodStockpile: newFood,
            foodProductionRate: foodPerTurn * 360,
            foodConsumptionRate: foodConsPerTurn * 360,
            waterStockpile: newWater,
            waterProductionRate: waterPerTurn * 360,
            waterConsumptionRate: waterConsPerTurn * 360,
            population: {
              ...pop,
              total: newTotalPop,
              happiness: Math.round(newHappiness),
              unrest: Math.round(newUnrest),
            },
          };
        });

        // Compute aggregate totals across colonies
        const empMaxFood = updated.reduce((s, pl) => s + (pl.foodCapacity || 100000), 0);
        const empMaxWater = updated.reduce((s, pl) => s + (pl.waterCapacity || 120000), 0);
        const empFood = updated.reduce((s, pl) => s + (pl.foodStockpile || 0), 0);
        const empWater = updated.reduce((s, pl) => s + (pl.waterStockpile || 0), 0);
        const empPop = updated.reduce((s, pl) => s + (pl.population?.total || 0), 0);

        setResources((prev) => ({
          ...prev,
          attackTurns: Math.min(prev.turnCap || 5000, prev.attackTurns + mult),
          credits: (prev.credits ?? 500000) + 250 * mult,
          naquadah: prev.naquadah + incomeAdded,
          untrainedUnits: prev.untrainedUnits + recruitsAdded + (popGrowthTotal > 0 ? Math.round(popGrowthTotal * 0.1) : 0),
          metal: (prev.metal ?? 50000) + metalAdded,
          crystal: (prev.crystal ?? 30000) + crystalAdded,
          deuterium: (prev.deuterium ?? 15000) + deutAdded,
          energy: energyProduced - totalEnergyNeeded,
          food: empFood,
          maxFood: empMaxFood,
          water: empWater,
          maxWater: empMaxWater,
          totalPopulation: empPop,
        }));

        return updated;
      });

      // Advance Workforce Unit Combat XP & Veterancy over time
      setWorkforceAcademyState((prevState) => {
        const currentExp = { ...(prevState.unitExperience || createDefaultUnitExperience()) };
        let anyChanged = false;

        // Active deployed units gain persistent combat XP each turn
        Object.entries(prevState.unitCounts).forEach(([unitId, count]: [string, any]) => {
          if (count > 0) {
            const exp = currentExp[unitId] || {
              unitId,
              xp: 0,
              currentRank: 0,
              highestRankReached: 0,
              totalCombatBattles: 0,
              totalMissionsCompleted: 0,
              activeDoctrineId: 'balanced_standard',
            };

            // Drill modifier: drill readiness score accelerates XP gain
            const drillBonus = 1 + Math.min(1.0, (prevState.academyDrillScore || 0) / 4000);
            const xpGained = Math.round((2 + Math.min(5, Math.floor(Number(count) / 250))) * mult * drillBonus);

            currentExp[unitId] = {
              ...exp,
              xp: exp.xp + xpGained,
              totalMissionsCompleted: exp.totalMissionsCompleted + mult,
            };
            anyChanged = true;
          }
        });

        if (!anyChanged) return prevState;
        return {
          ...prevState,
          unitExperience: currentExp,
        };
      });

      setProfile((prev) => ({
        ...prev,
        lastTurnAt: new Date().toISOString(),
      }));

      logMessage = `Turn production cycle completed (${mult} ${mult === 1 ? 'turn' : 'turns'}, Power Efficiency: ${Math.round(energyRatio * 100)}%).`;
      logDetails = {
        turnsAdded: mult,
        incomeAdded: incomeAdded,
        unitsAdded: recruitsAdded,
        metalMined: metalAdded,
        crystalMined: crystalAdded,
        deuteriumMined: deutAdded,
        energyBalance: energyProduced - totalEnergyNeeded,
        upkeepDeducted: militaryUpkeep * mult,
      };
    } else if (jobId === 'daily_cron') {
      const interest = Math.round(resources.bankedNaquadah * 0.02);
      setResources((prev) => ({
        ...prev,
        credits: (prev.credits ?? 500000) + 15000,
        bankedNaquadah: prev.bankedNaquadah + interest,
      }));
      setProfile((prev) => ({
        ...prev,
        glory: prev.glory + 50,
      }));
      logMessage = `Midnight settlement: Bank vault +${interest.toLocaleString()} NQ (2% interest), +15,000 Galactic Credits, +50 Glory.`;
      logDetails = {
        interestAccrued: interest,
        creditsAdded: 15000,
      };
    } else if (jobId === 'market_cron') {
      setOrders((prev) =>
        prev.map((o) => {
          const delta = Math.round((Math.random() * 0.1 - 0.05) * o.pricePerUnit);
          const newPrice = Math.max(10, o.pricePerUnit + delta);
          return {
            ...o,
            pricePerUnit: newPrice,
            totalCost: newPrice * o.quantity,
          };
        })
      );
      logMessage = 'Commodity exchange index updated with dynamic supply & demand variance.';
      logDetails = {
        marketFluctuation: 'Trinium +2.4%, Deuterium -1.1%, Naquadah +0.8%',
      };
    } else if (jobId === 'target_regen_cron') {
      setTargets((prev) =>
        prev.map((t) => ({
          ...t,
          estimatedUnits: Math.min(3000, Math.round(t.estimatedUnits * 1.1 + 20)),
          estimatedNaquadah: Math.min(250000, Math.round(t.estimatedNaquadah * 1.15 + 8000)),
        }))
      );
      logMessage = 'Reinforced garrisons and restored pillageable treasuries across rival NPC systems.';
      logDetails = {
        targetsRegenerated: targets.length,
      };
    } else if (jobId === 'events_cron') {
      const eventPool = [
        {
          name: 'Solar Flare Surge',
          reward: 15000,
          text: 'Subspace coronal mass ejection harvested by orbital collector: +15,000 Naquadah.',
        },
        {
          name: 'Ancient Probe Intercept',
          reward: 25000,
          text: 'Ancient deep space telemetry probe excavated: +25,000 Naquadah and planetary schematics.',
        },
        {
          name: 'Trade Guild Caravan',
          reward: 12000,
          text: 'Interstellar merchant convoy made landfall at planetary spaceport: +12,000 Naquadah tariffs.',
        },
      ];
      const ev = eventPool[Math.floor(Math.random() * eventPool.length)];
      setResources((prev) => ({
        ...prev,
        naquadah: prev.naquadah + ev.reward,
      }));
      logMessage = ev.text;
      logDetails = {
        eventsFired: ev.name,
        incomeAdded: ev.reward,
      };
    }

    const duration = Math.max(1, Math.round(performance.now() - start));

    // Update job metadata
    setCronJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              runCount: j.runCount + 1,
              lastRunAt: new Date().toISOString(),
              nextRunAt: new Date(Date.now() + j.intervalSeconds * 1000).toISOString(),
              lastExecutionMs: duration,
              status: 'success',
              lastResultSummary: logMessage,
            }
          : j
      )
    );

    // Append log
    const newLog: CronExecutionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      jobId,
      jobName: job.name,
      timestamp: new Date().toLocaleTimeString(),
      durationMs: duration,
      status: 'success',
      message: logMessage,
      details: logDetails,
    };
    setCronLogs((prev) => [newLog, ...prev.slice(0, 99)]);

    if (cronConfig.soundOnTick && !isAuto) {
      sound.play('confirm');
    }
  };

  // Run all enabled cron jobs
  const handleRunAllCronJobs = () => {
    cronJobs.forEach((j) => {
      if (j.enabled) {
        handleRunCronJob(j.id);
      }
    });
  };

  // Full Empire Systems Synchronization (Universal Systems Pulse)
  const handleUpdateAllSystems = () => {
    handleRunAllCronJobs();
  };

  // Toggle cron job active state
  const handleToggleCronJob = (jobId: CronJobId) => {
    setCronJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, enabled: !j.enabled } : j))
    );
  };

  // Clear execution logs
  const handleClearCronLogs = () => {
    setCronLogs([]);
  };

  // Update cron configuration
  const handleUpdateCronConfig = (newConfig: Partial<CronConfig>) => {
    setCronConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.tickIntervalSeconds) {
        setNextTickSeconds(newConfig.tickIntervalSeconds);
      }
      return updated;
    });
  };

  // Turn Settlement logic (triggered by UI button or keyboard shortcut)
  const handleProcessTurn = (count: number = 1) => {
    handleRunCronJob('turn_cron', false, count);
  };

  // Bank Deposit
  const handleDeposit = (amount: number) => {
    if (amount <= 0) return { success: false, message: 'Invalid deposit amount.' };
    if (amount > resources.naquadah) {
      return { success: false, message: 'Insufficient Naquadah in balance.' };
    }
    const space = Math.max(0, bankCapacity - resources.bankedNaquadah);
    if (space <= 0) {
      return { success: false, message: 'Your bank vault is currently at maximum capacity.' };
    }
    const actual = Math.min(amount, space);
    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - actual,
      bankedNaquadah: prev.bankedNaquadah + actual,
    }));
    return {
      success: true,
      message: `Deposited ${actual.toLocaleString()} Naquadah into ${currentRace?.bankName || 'Vault'}.`,
    };
  };

  // Bank Withdraw
  const handleWithdraw = (amount: number) => {
    if (amount <= 0) return { success: false, message: 'Invalid withdrawal amount.' };
    if (amount > resources.bankedNaquadah) {
      return { success: false, message: 'Insufficient Naquadah stored in vault.' };
    }
    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah + amount,
      bankedNaquadah: prev.bankedNaquadah - amount,
    }));
    return {
      success: true,
      message: `Withdrew ${amount.toLocaleString()} Naquadah from vault.`,
    };
  };

  // Set DefCon
  const handleSetDefcon = (level: DefconLevel) => {
    const cost = Number(level) * 5000;
    if (resources.naquadah < cost) {
      return {
        success: false,
        message: `Setting DefCon ${level} requires ${cost.toLocaleString()} Naquadah.`,
      };
    }
    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - cost,
    }));
    setProfile((prev) => ({
      ...prev,
      defconLevel: level,
    }));
    return {
      success: true,
      message: `DefCon level successfully adjusted to Level ${level}.`,
    };
  };

  // Execute Combat / Raid
  const handleExecuteAttack = (targetId: string, turns: number, action: 'attack' | 'raid') => {
    const tgt = targets.find((t) => t.id === targetId);
    if (!tgt) return { success: false, message: 'Target not found.' };
    if (resources.attackTurns < turns) {
      return { success: false, message: 'Insufficient attack turns.' };
    }

    // Attacker score vs Defender score
    const targetDefBase = tgt.estimatedUnits * 5 * (1 + tgt.defenseLevel * 0.2);
    const attackerBattleScore = strikePower * turns;
    const defenderBattleScore = Math.round(targetDefBase);

    const victory = attackerBattleScore > defenderBattleScore;

    // Plunder calculation: 10% on raid, 18% on full attack
    const lootRatio = action === 'raid' ? 0.1 : 0.18;
    const loot = victory ? Math.round(tgt.estimatedNaquadah * lootRatio * (turns / 2)) : 0;

    // Casualties
    const attCasRatio = victory ? 0.02 : 0.06;
    const defCasRatio = victory ? 0.07 : 0.03;
    const attackerCasualties = Math.max(1, Math.round(resources.attackUnits * attCasRatio));
    const defenderCasualties = Math.max(1, Math.round(tgt.estimatedUnits * defCasRatio));

    // Update resources and targets
    setResources((prev) => ({
      ...prev,
      attackTurns: prev.attackTurns - turns,
      naquadah: prev.naquadah + loot,
      attackUnits: Math.max(0, prev.attackUnits - attackerCasualties),
    }));

    setTargets((prev) =>
      prev.map((t) => {
        if (t.id === targetId) {
          return {
            ...t,
            estimatedUnits: Math.max(50, t.estimatedUnits - defenderCasualties),
            estimatedNaquadah: Math.max(10000, t.estimatedNaquadah - loot),
          };
        }
        return t;
      })
    );

    // Update Glory
    setProfile((prev) => ({
      ...prev,
      glory: prev.glory + (victory ? 25 * turns : 5),
    }));

    // Combat wear & tear on weapons, armors and shields
    setPlayerWeapons((prev) =>
      prev.map((pw) => ({
        ...pw,
        durability: Math.max(15, Math.round(pw.durability - (victory ? 1.5 : 3.5) * turns)),
      }))
    );

    const battleRecord: BattleRecord = {
      id: `bat-${Date.now()}`,
      targetId: tgt.id,
      targetName: tgt.commanderName,
      action,
      turnsSpent: turns,
      victory,
      attackerScore: attackerBattleScore,
      defenderScore: defenderBattleScore,
      loot,
      attackerCasualties,
      defenderCasualties,
      timestamp: 'Just now',
    };

    setBattles((prev) => [battleRecord, ...prev]);

    return {
      success: true,
      message: victory ? 'Attack mission victorious!' : 'Invasion repelled by enemy forces.',
      battle: battleRecord,
    };
  };

  // Covert Espionage & Sabotage
  const handleExecuteMission = (
    targetId: string,
    type: 'recon' | 'spy' | 'sabotage',
    agents: number
  ) => {
    const tgt = targets.find((t) => t.id === targetId);
    if (!tgt) return { success: false, message: 'Target not found.' };
    if (resources.spies < agents) {
      return { success: false, message: 'Insufficient spies available.' };
    }

    const enemyCounterScore = tgt.antiCovertLevel * 45;
    const missionScore = agents * 18 * raceCovMod;
    const success = missionScore >= enemyCounterScore || Math.random() > 0.25;

    let lostAgents = 0;
    if (!success) {
      lostAgents = Math.max(1, Math.round(agents * 0.3));
    }

    setResources((prev) => ({
      ...prev,
      spies: Math.max(0, prev.spies - lostAgents),
    }));

    let resultText = '';
    let intelData = undefined;

    if (success) {
      intelData = {
        defenseUnits: tgt.estimatedUnits,
        attackUnits: Math.round(tgt.estimatedUnits * 0.75),
        naquadah: tgt.estimatedNaquadah,
      };

      if (type === 'sabotage') {
        resultText = `Saboteurs infiltrated ${tgt.commanderName}'s armory, destroying weapon batteries and weakening defense grids!`;
        setTargets((prev) =>
          prev.map((t) =>
            t.id === targetId ? { ...t, defenseLevel: Math.max(1, t.defenseLevel - 1) } : t
          )
        );
      } else {
        resultText = `Reconnaissance scan of ${tgt.commanderName} succeeded! Vital garrison telemetry acquired.`;
      }
    } else {
      resultText = `Espionage probe detected by ${tgt.commanderName}'s counter-intelligence sweep. ${lostAgents} agents captured.`;
    }

    const missionRecord: CovertMissionRecord = {
      id: `mis-${Date.now()}`,
      targetId: tgt.id,
      targetName: tgt.commanderName,
      type,
      agentsSent: agents,
      success,
      detected: !success,
      resultText,
      intel: intelData,
      timestamp: 'Just now',
    };

    setMissions((prev) => [missionRecord, ...prev]);

    return {
      success: true,
      message: resultText,
      mission: missionRecord,
    };
  };

  // Buy Weapon
  const handleBuyWeapon = (weaponTypeId: string, quantity: number) => {
    const wt = WEAPON_TYPES.find((w) => w.id === weaponTypeId);
    if (!wt) return { success: false, message: 'Weapon type not found.' };
    const totalCost = wt.price * quantity;
    if (resources.naquadah < totalCost) {
      return { success: false, message: `Need ${totalCost.toLocaleString()} Naquadah.` };
    }

    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - totalCost,
    }));

    setPlayerWeapons((prev) => {
      const existing = prev.find((p) => p.weaponTypeId === weaponTypeId);
      if (existing) {
        return prev.map((p) =>
          p.weaponTypeId === weaponTypeId
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      } else {
        return [
          ...prev,
          {
            id: `pw-${Date.now()}`,
            weaponTypeId,
            quantity,
            durability: 100,
          },
        ];
      }
    });

    return {
      success: true,
      message: `Purchased ${quantity}x ${wt.name} for ${totalCost.toLocaleString()} Naquadah.`,
    };
  };

  // Repair Weapon
  const handleRepairWeapon = (weaponTypeId: string) => {
    const pw = playerWeapons.find((p) => p.weaponTypeId === weaponTypeId);
    if (!pw) return { success: false, message: 'Weapon not in inventory.' };
    const cost = pw.quantity * 25;
    if (resources.naquadah < cost) {
      return { success: false, message: `Repair requires ${cost.toLocaleString()} Naquadah.` };
    }

    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - cost,
    }));

    setPlayerWeapons((prev) =>
      prev.map((p) =>
        p.weaponTypeId === weaponTypeId ? { ...p, durability: 100 } : p
      )
    );

    return {
      success: true,
      message: `Weapon system repaired back to 100% operational condition.`,
    };
  };

  // Repair All Weapons, Armors & Shields
  const handleRepairAllWeapons = () => {
    const damaged = playerWeapons.filter((p) => p.durability < 100);
    if (damaged.length === 0) {
      return { success: false, message: 'All equipped military systems are already at 100% operational integrity.' };
    }
    const totalCost = damaged.reduce(
      (sum, p) => sum + Math.max(10, Math.round(p.quantity * 25 * ((100 - p.durability) / 100))),
      0
    );
    if (resources.naquadah < totalCost) {
      return { success: false, message: `Repair all requires ${totalCost.toLocaleString()} Naquadah.` };
    }
    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - totalCost,
    }));
    setPlayerWeapons((prev) =>
      prev.map((p) => ({ ...p, durability: 100 }))
    );
    return {
      success: true,
      message: `All damaged military systems restored to 100% integrity for ${totalCost.toLocaleString()} Naquadah.`,
    };
  };

  // Train Units
  const handleTrainUnits = (
    type: 'attack' | 'defense' | 'miners' | 'spies' | 'antiSpies' | 'superUnits',
    count: number
  ) => {
    const reqPop = type === 'superUnits' ? count * 5 : count;
    if (resources.untrainedUnits < reqPop) {
      return { success: false, message: 'Insufficient untrained civilians available.' };
    }

    setResources((prev) => {
      const updated = { ...prev, untrainedUnits: prev.untrainedUnits - reqPop };
      if (type === 'attack') updated.attackUnits += count;
      if (type === 'defense') updated.defenseUnits += count;
      if (type === 'miners') updated.miners += count;
      if (type === 'spies') updated.spies += count;
      if (type === 'antiSpies') updated.antiSpies += count;
      if (type === 'superUnits') updated.superUnits += count;
      return updated;
    });

    return {
      success: true,
      message: `Successfully trained ${count} units into active division.`,
    };
  };

  // Upgrade Unit Production
  const handleUpgradeProduction = () => {
    const cost = resources.unitProduction * 5000 + 10000;
    if (resources.naquadah < cost) {
      return { success: false, message: `Upgrade costs ${cost.toLocaleString()} Naquadah.` };
    }

    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - cost,
      unitProduction: prev.unitProduction + 2,
    }));

    return {
      success: true,
      message: `Cloning academy expanded: +2 additional population generated each turn!`,
    };
  };

  // Upgrade Technology
  const handleUpgradeTech = (techId: string) => {
    const tech = technologies.find((t) => t.id === techId);
    if (!tech) return { success: false, message: 'Technology not found.' };

    const cost = Math.round(tech.baseCost * Math.pow(tech.costGrowth, tech.level));
    if (resources.naquadah < cost) {
      return { success: false, message: `Need ${cost.toLocaleString()} Naquadah.` };
    }

    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - cost,
    }));

    setTechnologies((prev) =>
      prev.map((t) => (t.id === techId ? { ...t, level: t.level + 1 } : t))
    );

    return {
      success: true,
      message: `Breakthrough: ${tech.name} research elevated to Level ${tech.level + 1}!`,
    };
  };

  // Upgrade Mothership Module
  const handleUpgradeModule = (key: string) => {
    const mod = modules.find((m) => m.key === key);
    if (!mod) return { success: false, message: 'Module not found.' };

    const cost = Math.round(mod.baseCost * Math.pow(1.3, mod.level));
    if (resources.naquadah < cost) {
      return { success: false, message: `Need ${cost.toLocaleString()} Naquadah.` };
    }

    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - cost,
    }));

    setModules((prev) =>
      prev.map((m) => (m.key === key ? { ...m, level: m.level + 1 } : m))
    );

    return {
      success: true,
      message: `${mod.name} upgraded to Level ${mod.level + 1}.`,
    };
  };

  // Explore Sector
  const handleExploreSector = () => {
    if (resources.attackTurns < 1) {
      return { success: false, message: 'Requires 1 Attack Turn to deploy exploration probe.' };
    }

    const lootReward = Math.round(15000 + Math.random() * 45000);
    setResources((prev) => ({
      ...prev,
      attackTurns: prev.attackTurns - 1,
      naquadah: prev.naquadah + lootReward,
    }));

    return {
      success: true,
      message: `Sector exploration complete: salvaged ancient cargo containing ${lootReward.toLocaleString()} Naquadah!`,
      reward: lootReward,
    };
  };

  // Imperial Master & Storage Upgrades Handler
  const handleMasterUpgradeKey = (
    key: string,
    cost: { metal: number; crystal: number; deuterium: number; naquadah: number }
  ) => {
    if (
      (resources.metal || 0) < cost.metal ||
      (resources.crystal || 0) < cost.crystal ||
      (resources.deuterium || 0) < cost.deuterium ||
      (resources.naquadah || 0) < cost.naquadah
    ) {
      return { success: false, message: 'Insufficient resources to complete imperial upgrade.' };
    }

    setResources((prev) => ({
      ...prev,
      metal: Math.max(0, (prev.metal || 0) - cost.metal),
      crystal: Math.max(0, (prev.crystal || 0) - cost.crystal),
      deuterium: Math.max(0, (prev.deuterium || 0) - cost.deuterium),
      naquadah: Math.max(0, (prev.naquadah || 0) - cost.naquadah),
    }));

    setMasterUpgrades((prev) => {
      const updated = { ...prev };
      if (key.startsWith('storage.')) {
        const field = key.replace('storage.', '') as keyof ResourceStorageUpgrades;
        updated.storage = {
          ...updated.storage,
          [field]: ((updated.storage as any)[field] || 0) + 1,
        };
      } else if (key.startsWith('bank.')) {
        const field = key.replace('bank.', '') as keyof BankVaultUpgradeState;
        updated.bank = {
          ...updated.bank,
          [field]: ((updated.bank as any)[field] || 0) + 1,
        };
      } else {
        (updated as any)[key] = ((updated as any)[key] || 0) + 1;
      }
      return updated;
    });

    sound.play('confirm');
    return { success: true, message: `Imperial upgrade [${key}] advanced to next level!` };
  };

  // Upgrade Planet
  const handleUpgradePlanet = (planetId: string) => {
    const pl = planets.find((p) => p.id === planetId);
    if (!pl) return { success: false, message: 'Planet not found.' };

    const cost = pl.level * 35000 + 20000;
    if (resources.naquadah < cost) {
      return { success: false, message: `Need ${cost.toLocaleString()} Naquadah.` };
    }

    const newLevel = pl.level + 1;
    const newMaintenance = calculateColonyMaintenance(
      { ...pl, level: newLevel },
      planets.length
    );

    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - cost,
    }));

    setPlanets((prev) =>
      prev.map((p) =>
        p.id === planetId
          ? {
              ...p,
              level: newLevel,
              incomeBonus: (p.incomeBonus || 0) + 6500,
              defenseBonus: (p.defenseBonus || 0) + 12000,
              maintenanceCost: newMaintenance,
            }
          : p
      )
    );

    return {
      success: true,
      message: `${pl.name} expanded to Tier ${newLevel}! Gross Output: +6,500 NQ, Maintenance: ${newMaintenance.toLocaleString()} NQ/turn.`,
    };
  };

  const handleColonizePlanet = (coordinate: string, biome: string, name: string) => {
    if ((resources.deuterium ?? 0) < 10000 || (resources.crystal ?? 0) < 15000) {
      return { success: false, message: 'Requires 10,000 Deuterium and 15,000 Crystal.' };
    }

    setResources((prev) => ({
      ...prev,
      deuterium: (prev.deuterium ?? 0) - 10000,
      crystal: (prev.crystal ?? 0) - 15000,
      totalPopulation: (prev.totalPopulation || 14000000) + 1200000,
      untrainedUnits: (prev.untrainedUnits || 0) + 100,
    }));

    const newMaint = calculateColonyMaintenance(
      { level: 1, isHomeworld: false } as PlanetColony,
      planets.length + 1
    );

    const newColony: PlanetColony = {
      id: `pl-${Date.now()}`,
      name,
      coordinate,
      biome,
      level: 1,
      incomeBonus: 8500,
      defenseBonus: 15000,
      maintenanceCost: newMaint,
      jumpGateLevel: 0,
      fieldsUsed: 14,
      fieldsMax: 165,
      hasMoon: true,
      moonName: `${name} Lunar Outpost`,
      foodStockpile: 20000,
      foodCapacity: 60000,
      foodProductionRate: 5000,
      foodConsumptionRate: 3000,
      waterStockpile: 25000,
      waterCapacity: 75000,
      waterProductionRate: 6500,
      waterConsumptionRate: 3800,
      population: {
        total: 1200000,
        growthRatePerHour: 8000,
        housingCapacity: 4000000,
        happiness: 85,
        unrest: 8,
        strata: {
          farmers: 200000,
          hydrologists: 200000,
          miners: 300000,
          industrialWorkers: 250000,
          scientists: 100000,
          administrators: 50000,
          militaryRecruits: 100000,
        },
        livingStandard: 'utopian',
        rationingLevel: 'abundant',
      },
      lunarBase: {
        level: 1,
        sensorPhalanxLevel: 1,
        jumpGateLevel: 0,
        moonFieldsUsed: 4,
        moonFieldsMax: 16,
      },
    };

    setPlanets((prev) => [...prev, newColony]);
    setProfile((p) => ({ ...p, glory: p.glory + 250 }));

    return {
      success: true,
      message: `Planetary colony established at ${coordinate} (${biome})! Tier 1 Maintenance: ${newMaint.toLocaleString()} NQ/turn. Seeded with 1.2M Citizens, 165 Fields, and Attached Moon.`,
    };
  };

  // Direct Conscript Recruits Mobilization Handler
  const handleConscriptRecruits = (count: number, planetId?: string) => {
    const foodCost = Math.round(count * 4.5);
    const waterCost = Math.round(count * 4.5);
    const nqCost = Math.round(count * 25);

    if ((resources.food ?? 0) < foodCost) {
      return {
        success: false,
        message: `Insufficient Food reserves! Mobilizing ${count} recruits requires ${foodCost} kg Food rations.`,
      };
    }
    if ((resources.water ?? 0) < waterCost) {
      return {
        success: false,
        message: `Insufficient Water reserves! Mobilizing ${count} recruits requires ${waterCost} kL Water rations.`,
      };
    }
    if (resources.naquadah < nqCost) {
      return {
        success: false,
        message: `Insufficient Naquadah! Requires ${nqCost.toLocaleString()} NQ for military gear & transport.`,
      };
    }

    setResources((prev) => ({
      ...prev,
      untrainedUnits: (prev.untrainedUnits || 0) + count,
      naquadah: prev.naquadah - nqCost,
      food: Math.max(0, (prev.food || 0) - foodCost),
      water: Math.max(0, (prev.water || 0) - waterCost),
    }));

    const targetId = planetId || activePlanetId || 'pl-homeworld';
    setPlanets((prev) =>
      prev.map((p) => {
        if (p.id !== targetId) return p;
        return {
          ...p,
          foodStockpile: Math.max(0, (p.foodStockpile || 35000) - foodCost),
          waterStockpile: Math.max(0, (p.waterStockpile || 48000) - waterCost),
          population: {
            ...p.population!,
            strata: {
              ...p.population!.strata,
              militaryRecruits: (p.population?.strata?.militaryRecruits || 1600000) + count,
            },
          },
        };
      })
    );

    sound.play('confirm');
    return {
      success: true,
      message: `Mobilized ${count.toLocaleString()} Conscript Recruits into untrained reserves.`,
    };
  };

  // Market: Hire Mercenary
  const handleHireMercenary = (contractId: string) => {
    const contract = MERCENARY_CONTRACTS.find((c) => c.id === contractId);
    if (!contract) return { success: false, message: 'Contract not found.' };
    if (resources.naquadah < contract.cost) {
      return { success: false, message: `Need ${contract.cost.toLocaleString()} Naquadah.` };
    }

    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - contract.cost,
      attackUnits: prev.attackUnits + Math.round(contract.attackPower / 5),
      defenseUnits: prev.defenseUnits + Math.round(contract.defensePower / 5),
    }));

    return {
      success: true,
      message: `Enlisted ${contract.name}. Troops deployed to defense lines.`,
    };
  };

  // Market: Fulfill Order
  const handleFulfillOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };
    if (resources.naquadah < order.totalCost) {
      return { success: false, message: `Need ${order.totalCost.toLocaleString()} Naquadah.` };
    }

    setResources((prev) => ({
      ...prev,
      naquadah: prev.naquadah - order.totalCost,
      superUnits: prev.superUnits + (order.resourceType === 'super-weapon' ? 3 : 1),
    }));

    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    return {
      success: true,
      message: `Completed order transaction with ${order.sellerName}.`,
    };
  };

  // Subspace Message
  const handleSendMessage = (recipient: string, subject: string, body: string) => {
    const newMsg: GameMessage = {
      id: `msg-${Date.now()}`,
      sender: profile.displayName,
      recipient,
      subject,
      body,
      timestamp: 'Just now',
      read: true,
    };
    setMessages((prev) => [newMsg, ...prev]);
  };

  const handleMarkMessageRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
    );
  };

  // Change Race & Faction
  const handleChangeRace = (raceId: string) => {
    const r = RACES.find((item) => item.id === raceId);
    if (!r) return { success: false, message: 'Race not found.' };
    setProfile((prev) => ({ ...prev, race: r.id }));
    return { success: true, message: `Civilization race updated to ${r.name}.` };
  };

  const handleChangeGovernment = (govId: string) => {
    setProfile((prev) => ({ ...prev, governmentId: govId }));
    return { success: true, message: 'Governance doctrine established.' };
  };

  const handleToggleVacation = () => {
    const isVacation = !!profile.vacationUntil;
    setProfile((prev) => ({
      ...prev,
      vacationUntil: isVacation ? null : new Date(Date.now() + 86400000 * 3).toISOString(),
    }));
    return {
      success: true,
      message: isVacation ? 'Vacation mode disengaged.' : 'Vacation sanctuary shield activated.',
    };
  };

  const handleAscend = () => {
    if (profile.glory < 1000 || profile.reputation < 500) {
      return {
        success: false,
        message: 'Ascension requires at least 1,000 Glory and 500 Reputation.',
      };
    }
    setProfile((prev) => ({
      ...prev,
      ascended: true,
      rankName: 'Ancient Ascended Being',
    }));
    return {
      success: true,
      message: 'Cosmic Ascension achieved! Your civilization now walks with the Ancients.',
    };
  };

  // --- OGame Space System Handlers ---

  const handleStartResearch = (techId: string) => {
    const tech = ogameTechnologies.find((t) => t.id === techId);
    if (!tech) return;

    const mult = Math.pow(tech.costMultiplier, tech.level);
    const metal = Math.round(tech.baseCost.metal * mult);
    const crystal = Math.round(tech.baseCost.crystal * mult);
    const deuterium = Math.round(tech.baseCost.deuterium * mult);

    if (
      (resources.metal ?? 0) < metal ||
      (resources.crystal ?? 0) < crystal ||
      (resources.deuterium ?? 0) < deuterium
    ) {
      sound.play('warning');
      return;
    }

    const specBonus =
      ['energy', 'quantum', 'physics'].includes(tech.category) && labSpecialization === 'physics'
        ? 0.85
        : 1.0;
    const duration = Math.max(
      5,
      Math.round(tech.baseTimeSeconds * Math.pow(1.3, tech.level) * specBonus)
    );

    setResources((r) => ({
      ...r,
      metal: (r.metal ?? 0) - metal,
      crystal: (r.crystal ?? 0) - crystal,
      deuterium: (r.deuterium ?? 0) - deuterium,
    }));

    const newItem: ResearchQueueItem = {
      id: `res-${Date.now()}`,
      techId: tech.id,
      techName: tech.name,
      targetLevel: tech.level + 1,
      startedAt: Date.now(),
      durationSeconds: duration,
      remainingSeconds: duration,
      metalCost: metal,
      crystalCost: crystal,
      deuteriumCost: deuterium,
    };

    setResearchQueue((prev) => [...prev, newItem]);
    sound.play('confirm');
  };

  const handleCancelResearch = (queueId: string) => {
    const item = researchQueue.find((q) => q.id === queueId);
    if (item) {
      setResources((r) => ({
        ...r,
        metal: (r.metal ?? 0) + Math.round(item.metalCost * 0.8),
        crystal: (r.crystal ?? 0) + Math.round(item.crystalCost * 0.8),
        deuterium: (r.deuterium ?? 0) + Math.round(item.deuteriumCost * 0.8),
      }));
    }
    setResearchQueue((prev) => prev.filter((q) => q.id !== queueId));
    sound.play('warning');
  };

  const handleInstantCompleteResearch = (queueId: string) => {
    const item = researchQueue.find((q) => q.id === queueId);
    if (!item) return;

    setOgameTechnologies((techs) =>
      techs.map((t) => (t.id === item.techId ? { ...t, level: item.targetLevel } : t))
    );
    setResearchQueue((prev) => prev.filter((q) => q.id !== queueId));
    setProfile((p) => ({ ...p, glory: p.glory + 150 }));
    sound.play('research');
  };

  const handleUpgradeFacility = (facilityId: string) => {
    const facility = ogameFacilities.find((f) => f.id === facilityId);
    if (!facility) return;

    const mult = Math.pow(facility.costMultiplier, facility.level);
    const metal = Math.round(facility.baseCost.metal * mult);
    const crystal = Math.round(facility.baseCost.crystal * mult);
    const deuterium = Math.round(facility.baseCost.deuterium * mult);

    if (
      (resources.metal ?? 0) < metal ||
      (resources.crystal ?? 0) < crystal ||
      (resources.deuterium ?? 0) < deuterium
    ) {
      sound.play('warning');
      return;
    }

    const naniteLevel = ogameFacilities.find((f) => f.id === 'nanite_factory')?.level || 0;
    const speedDiv = Math.pow(2, naniteLevel);
    const duration = Math.max(
      5,
      Math.round(((facility.baseBuildTimeSeconds || 20) * Math.pow(1.3, facility.level)) / speedDiv)
    );

    setResources((r) => ({
      ...r,
      metal: (r.metal ?? 0) - metal,
      crystal: (r.crystal ?? 0) - crystal,
      deuterium: (r.deuterium ?? 0) - deuterium,
    }));

    const newItem: FactoryQueueItem = {
      id: `fac-${Date.now()}`,
      facilityId: facility.id,
      facilityName: facility.name,
      targetLevel: facility.level + 1,
      startedAt: Date.now(),
      durationSeconds: duration,
      remainingSeconds: duration,
      metalCost: metal,
      crystalCost: crystal,
      deuteriumCost: deuterium,
    };

    setFactoryQueue((prev) => [...prev, newItem]);
    sound.play('confirm');
  };

  const handleCancelFactoryUpgrade = (queueId: string) => {
    const item = factoryQueue.find((q) => q.id === queueId);
    if (item) {
      setResources((r) => ({
        ...r,
        metal: (r.metal ?? 0) + Math.round((item.metalCost ?? 0) * 0.8),
        crystal: (r.crystal ?? 0) + Math.round((item.crystalCost ?? 0) * 0.8),
        deuterium: (r.deuterium ?? 0) + Math.round((item.deuteriumCost ?? 0) * 0.8),
      }));
    }
    setFactoryQueue((prev) => prev.filter((q) => q.id !== queueId));
    sound.play('warning');
  };

  const handleBuildShips = (shipId: string, quantity: number) => {
    const ship = ogameShips.find((s) => s.id === shipId);
    if (!ship || quantity <= 0) return;

    const metalTotal = ship.cost.metal * quantity;
    const crystalTotal = ship.cost.crystal * quantity;
    const deutTotal = ship.cost.deuterium * quantity;

    if (
      (resources.metal ?? 0) < metalTotal ||
      (resources.crystal ?? 0) < crystalTotal ||
      (resources.deuterium ?? 0) < deutTotal
    ) {
      sound.play('warning');
      return;
    }

    const naniteLevel = ogameFacilities.find((f) => f.id === 'nanite_factory')?.level || 0;
    const speedDiv = Math.pow(2, naniteLevel);
    const duration = Math.max(5, Math.round((ship.buildTimeSeconds * quantity) / speedDiv));

    setResources((r) => ({
      ...r,
      metal: (r.metal ?? 0) - metalTotal,
      crystal: (r.crystal ?? 0) - crystalTotal,
      deuterium: (r.deuterium ?? 0) - deutTotal,
    }));

    const newItem: ShipyardQueueItem = {
      id: `ship-${Date.now()}`,
      shipId: ship.id,
      shipName: ship.name,
      quantity,
      completedQuantity: 0,
      totalTimeSeconds: duration,
      remainingSeconds: duration,
      startedAt: Date.now(),
    };

    setShipyardQueue((prev) => [...prev, newItem]);
    sound.play('confirm');
  };

  const handleCancelShipyardQueue = (queueId: string) => {
    handleBatchCancelShipyardQueue([queueId]);
  };

  const handleBatchCancelShipyardQueue = (queueIds: string[]) => {
    if (!queueIds || queueIds.length === 0) return;

    let refundMetal = 0;
    let refundCrystal = 0;
    let refundDeut = 0;

    const itemsToCancel = shipyardQueue.filter((q) => queueIds.includes(q.id));
    itemsToCancel.forEach((item) => {
      const ship = ogameShips.find((s) => s.id === item.shipId);
      if (ship) {
        const remainingHulls = Math.max(0, item.quantity - item.completedQuantity);
        refundMetal += Math.round(ship.cost.metal * remainingHulls * 0.85);
        refundCrystal += Math.round(ship.cost.crystal * remainingHulls * 0.85);
        refundDeut += Math.round((ship.cost.deuterium || 0) * remainingHulls * 0.85);
      }
    });

    if (refundMetal > 0 || refundCrystal > 0 || refundDeut > 0) {
      setResources((r) => ({
        ...r,
        metal: (r.metal ?? 0) + refundMetal,
        crystal: (r.crystal ?? 0) + refundCrystal,
        deuterium: (r.deuterium ?? 0) + refundDeut,
      }));
    }

    setShipyardQueue((prev) => prev.filter((q) => !queueIds.includes(q.id)));
    sound.play('warning');
  };

  const handleAccelerateShipyardQueue = (queueIds: string[], instant: boolean = true) => {
    if (!queueIds || queueIds.length === 0) return;

    if (instant) {
      const targetItems = shipyardQueue.filter((q) => queueIds.includes(q.id));
      if (targetItems.length === 0) return;

      // Add completed ships to active fleet hangar
      setOgameShips((ships) =>
        ships.map((s) => {
          const matchingBatches = targetItems.filter((item) => item.shipId === s.id);
          if (matchingBatches.length > 0) {
            const added = matchingBatches.reduce(
              (sum, item) => sum + Math.max(0, item.quantity - item.completedQuantity),
              0
            );
            return { ...s, quantity: s.quantity + added };
          }
          return s;
        })
      );

      // Remove finished items from queue
      setShipyardQueue((prev) => prev.filter((q) => !queueIds.includes(q.id)));
      sound.play('success');
    } else {
      // Overclock time by 75%
      setShipyardQueue((prev) =>
        prev.map((q) => {
          if (queueIds.includes(q.id)) {
            const newRemaining = Math.max(1, Math.floor(q.remainingSeconds * 0.25));
            return { ...q, remainingSeconds: newRemaining };
          }
          return q;
        })
      );
      sound.play('confirm');
    }
  };

  const handleBuildDefenses = (defenseId: string, quantity: number) => {
    const def = ogameDefenses.find((d) => d.id === defenseId);
    if (!def || quantity <= 0) return;

    const metalTotal = def.cost.metal * quantity;
    const crystalTotal = def.cost.crystal * quantity;
    const deutTotal = def.cost.deuterium * quantity;

    if (
      (resources.metal ?? 0) < metalTotal ||
      (resources.crystal ?? 0) < crystalTotal ||
      (resources.deuterium ?? 0) < deutTotal
    ) {
      sound.play('warning');
      return;
    }

    const duration = Math.max(4, Math.round(def.buildTimeSeconds * quantity));

    setResources((r) => ({
      ...r,
      metal: (r.metal ?? 0) - metalTotal,
      crystal: (r.crystal ?? 0) - crystalTotal,
      deuterium: (r.deuterium ?? 0) - deutTotal,
    }));

    const newItem: DefenseQueueItem = {
      id: `def-${Date.now()}`,
      defenseId: def.id,
      defenseName: def.name,
      quantity,
      completedQuantity: 0,
      totalTimeSeconds: duration,
      remainingSeconds: duration,
      startedAt: Date.now(),
    };

    setDefenseQueue((prev) => [...prev, newItem]);
    sound.play('confirm');
  };

  const handleCancelDefenseQueue = (queueId: string) => {
    setDefenseQueue((prev) => prev.filter((q) => q.id !== queueId));
    sound.play('warning');
  };

  const handleSavePreset = (preset: FleetFormationPreset) => {
    setFleetPresets((prev) => {
      const exists = prev.some((p) => p.id === preset.id);
      if (exists) {
        return prev.map((p) => (p.id === preset.id ? preset : p));
      }
      return [preset, ...prev];
    });
    setSelectedFormation(preset.formation);
    setActivePresetId(preset.id);
    sound.play('confirm');
  };

  const handleDeletePreset = (presetId: string) => {
    setFleetPresets((prev) => prev.filter((p) => p.id !== presetId));
    if (activePresetId === presetId) {
      setActivePresetId(null);
    }
    sound.play('warning');
  };

  const handleLaunchExpedition = (
    type: ExpeditionMissionType,
    targetSector: string,
    durationSeconds: number,
    fleet: { shipId: string; shipName: string; quantity: number }[]
  ) => {
    setOgameShips((ships) =>
      ships.map((s) => {
        const assigned = fleet.find((f) => f.shipId === s.id);
        if (assigned) {
          return { ...s, quantity: Math.max(0, s.quantity - assigned.quantity) };
        }
        return s;
      })
    );

    const newMission: ExpeditionMission = {
      id: `exp-${Date.now()}`,
      name: `${type.toUpperCase().replace('_', ' ')} MISSION`,
      targetSector,
      type,
      durationSeconds,
      remainingSeconds: durationSeconds,
      startedAt: Date.now(),
      fleet,
      status: 'en_route',
    };

    setActiveExpeditions((prev) => [...prev, newMission]);
    sound.play('confirm');
  };

  const handleClaimLoot = (logId: string) => {
    sound.play('confirm');
  };

  const handleStartMegastructureStage = (projectId: string) => {
    const project = megastructures.find((p) => p.id === projectId);
    if (!project || project.isConstructing) return;

    const nextStage = project.stages.find((s) => !s.completed);
    if (!nextStage) return;

    if (
      (resources.metal ?? 0) < nextStage.cost.metal ||
      (resources.crystal ?? 0) < nextStage.cost.crystal ||
      (resources.deuterium ?? 0) < nextStage.cost.deuterium
    ) {
      sound.play('warning');
      return;
    }

    setResources((r) => ({
      ...r,
      metal: (r.metal ?? 0) - nextStage.cost.metal,
      crystal: (r.crystal ?? 0) - nextStage.cost.crystal,
      deuterium: (r.deuterium ?? 0) - nextStage.cost.deuterium,
    }));

    setMegastructures((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              isConstructing: true,
              constructionRemainingSeconds: nextStage.durationSeconds,
            }
          : p
      )
    );
    sound.play('confirm');
  };

  // Admin Systems & Imperial Crown Handlers
  const handleToggleDecree = (decreeId: string) => {
    setDecrees((prev) =>
      prev.map((d) =>
        d.id === decreeId
          ? {
              ...d,
              active: !d.active,
              activatedAt: !d.active ? new Date().toISOString() : null,
            }
          : d
      )
    );
    sound.play('confirm');
  };

  const handleAddDecree = (newDecree: ImperialDecree) => {
    setDecrees((prev) => [newDecree, ...prev]);
    sound.play('confirm');
  };

  const handleUpdateWorldModifier = (modifierId: string, value: number) => {
    setWorldModifiers((prev) =>
      prev.map((m) => (m.id === modifierId ? { ...m, multiplier: value } : m))
    );
  };

  const handleUpdateServerSettings = (settings: Partial<AdminServerSettings>) => {
    setServerSettings((prev) => ({ ...prev, ...settings }));
  };

  const handleInstantFinishBuildings = () => {
    setFactoryQueue([]);
    setMegastructures((prev) =>
      prev.map((m) => ({
        ...m,
        isConstructing: false,
        currentStage: Math.min(m.totalStages, m.currentStage + 1),
      }))
    );
    sound.play('confirm');
  };

  const handleInstantFinishResearch = () => {
    researchQueue.forEach((item) => {
      setOgameTechnologies((prev) =>
        prev.map((tech) =>
          tech.id === item.techId
            ? { ...tech, level: item.targetLevel }
            : tech
        )
      );
    });
    setResearchQueue([]);
    sound.play('confirm');
  };

  const handleInstantFinishShipyard = () => {
    shipyardQueue.forEach((item) => {
      setOgameShips((prev) =>
        prev.map((s) =>
          s.id === item.shipId ? { ...s, quantity: s.quantity + item.quantity } : s
        )
      );
    });
    setShipyardQueue([]);
    sound.play('confirm');
  };

  const handleUnlockAllTechs = () => {
    setOgameTechnologies((prev) =>
      prev.map((t) => ({ ...t, level: Math.max(t.level, 15) }))
    );
    setTechnologies((prev) =>
      prev.map((t) => ({ ...t, level: Math.max(t.level, 20) }))
    );
    sound.play('confirm');
  };

  const handleSpawnArmada = () => {
    setOgameShips((prev) =>
      prev.map((s) => {
        if (s.id === 'battleship') return { ...s, quantity: s.quantity + 50 };
        if (s.id === 'battlecruiser') return { ...s, quantity: s.quantity + 20 };
        if (s.id === 'destroyer') return { ...s, quantity: s.quantity + 500 };
        if (s.id === 'deathstar') return { ...s, quantity: s.quantity + 5 };
        if (s.id === 'bomber') return { ...s, quantity: s.quantity + 40 };
        if (s.id === 'heavy_fighter') return { ...s, quantity: s.quantity + 1000 };
        return s;
      })
    );
    sound.play('confirm');
  };

  const handleExportState = (): string => {
    const backup = {
      profile,
      resources,
      technologies,
      playerWeapons,
      targets,
      modules,
      planets,
      ogameTechnologies,
      ogameFacilities,
      ogameShips,
      ogameDefenses,
      fleetPresets,
      decrees,
      worldModifiers,
      serverSettings,
      cronJobs,
      cronConfig,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  };

  const handleImportState = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.resources) setResources(parsed.resources);
      if (parsed.technologies) setTechnologies(parsed.technologies);
      if (parsed.ogameTechnologies) setOgameTechnologies(parsed.ogameTechnologies);
      if (parsed.ogameFacilities) setOgameFacilities(parsed.ogameFacilities);
      if (parsed.ogameShips) setOgameShips(parsed.ogameShips);
      if (parsed.ogameDefenses) setOgameDefenses(parsed.ogameDefenses);
      if (parsed.fleetPresets) setFleetPresets(parsed.fleetPresets);
      if (parsed.decrees) setDecrees(parsed.decrees);
      if (parsed.worldModifiers) setWorldModifiers(parsed.worldModifiers);
      if (parsed.serverSettings) setServerSettings(parsed.serverSettings);
      sound.play('confirm');
      return true;
    } catch {
      sound.play('warning');
      return false;
    }
  };

  const handleBroadcastMessage = (message: string) => {
    setServerSettings((prev) => ({
      ...prev,
      globalBroadcastMessage: message,
      globalBroadcastActive: true,
    }));
  };

  // OGame Clones Admin Action Handlers
  const handleUpdateUniverseConfig = (updates: Partial<OGameUniverseConfig>) => {
    setOgameUniverseConfig((prev) => ({ ...prev, ...updates }));
    sound.play('confirm');
  };

  const handleUpdateAdminUser = (userId: string, updates: Partial<AdminUserAccount>) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    sound.play('confirm');
  };

  const handleBanUser = (ban: AdminBanRecord) => {
    setAdminBans((prev) => [ban, ...prev]);
    setAdminUsers((prev) =>
      prev.map((u) =>
        u.id === ban.userId || u.username === ban.username
          ? { ...u, status: 'banned', banReason: ban.reason }
          : u
      )
    );
    sound.play('confirm');
  };

  const handleUnbanUser = (banId: string) => {
    const targetBan = adminBans.find((b) => b.id === banId);
    setAdminBans((prev) =>
      prev.map((b) => (b.id === banId ? { ...b, active: false } : b))
    );
    if (targetBan) {
      setAdminUsers((prev) =>
        prev.map((u) =>
          u.id === targetBan.userId || u.username === targetBan.username
            ? { ...u, status: 'active', banReason: null }
            : u
        )
      );
    }
    sound.play('confirm');
  };

  const handleUpdatePlanetAdmin = (planetId: string, updates: Partial<AdminPlanetEntry>) => {
    setAdminPlanets((prev) =>
      prev.map((p) => (p.id === planetId ? { ...p, ...updates } : p))
    );
    sound.play('confirm');
  };

  const handleSpawnMoon = (planetId: string, moonName: string, diameter: number) => {
    setAdminPlanets((prev) =>
      prev.map((p) =>
        p.id === planetId
          ? {
              ...p,
              hasMoon: true,
              moonName: moonName || `${p.name} Moon`,
              moonDiameterKm: diameter || 6840,
              lunarBaseLevel: 1,
              phalanxLevel: 1,
              jumpGateLevel: 0,
            }
          : p
      )
    );
    sound.play('confirm');
  };

  const handleTerraformPlanet = (planetId: string, extraFields: number) => {
    setAdminPlanets((prev) =>
      prev.map((p) =>
        p.id === planetId ? { ...p, maxFields: p.maxFields + extraFields } : p
      )
    );
    sound.play('confirm');
  };

  const handleRecallFleetMission = (missionId: string) => {
    setAdminFleetMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, status: 'returning' } : m
      )
    );
    sound.play('confirm');
  };

  const handleTeleportFleetMission = (missionId: string) => {
    setAdminFleetMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, status: 'completed' } : m
      )
    );
    sound.play('confirm');
  };

  const handleSpawnDebris = (coords: string, metal: number, crystal: number) => {
    const newField: AdminDebrisField = {
      id: `deb-${Date.now()}`,
      coordinates: coords,
      metal,
      crystal,
      createdAt: new Date().toISOString(),
      spawnedByAdmin: true,
    };
    setAdminDebrisFields((prev) => [newField, ...prev]);
    sound.play('confirm');
  };

  const handleClearDebris = (debrisId: string) => {
    setAdminDebrisFields((prev) => prev.filter((d) => d.id !== debrisId));
    sound.play('confirm');
  };

  const handleClearAllDebris = () => {
    setAdminDebrisFields([]);
    sound.play('confirm');
  };

  const handleReplySupportTicket = (ticketId: string, message: string) => {
    setAdminSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'awaiting_user',
              messages: [
                ...t.messages,
                {
                  id: `rep-${Date.now()}`,
                  sender: profile.displayName || profile.username || 'Admin Support Archon',
                  senderRole: 'admin',
                  message,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : t
      )
    );
    sound.play('confirm');
  };

  const handleUpdateTicketStatus = (ticketId: string, status: AdminSupportTicket['status']) => {
    setAdminSupportTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
    sound.play('confirm');
  };

  const handleResolveSecurityAlert = (alertId: string) => {
    setAdminSecurityAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
    sound.play('confirm');
  };

  const handleToggleGlobalEvent = (eventId: string) => {
    setAdminGlobalEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, active: !e.active } : e))
    );
    sound.play('confirm');
  };

  const handleRecalculateHighscores = () => {
    setAdminUsers((prev) =>
      prev.map((u) => ({
        ...u,
        rankPoints: Math.round(u.rankPoints * (1 + (Math.random() * 0.05 - 0.02))),
        fleetUnits: Math.round(u.fleetUnits * (1 + (Math.random() * 0.05 - 0.02))),
      }))
    );
    sound.play('confirm');
  };

  const handlePurgeInactives = () => {
    setAdminUsers((prev) => prev.filter((u) => u.status !== 'inactive'));
    sound.play('confirm');
  };

  const handleFlushCache = () => {
    sound.play('confirm');
  };

  const handleResetUniverseSeason = () => {
    setAdminUsers(INITIAL_ADMIN_USERS);
    setAdminBans(INITIAL_ADMIN_BANS);
    setAdminPlanets(INITIAL_ADMIN_PLANETS);
    setAdminFleetMissions(INITIAL_ADMIN_FLEET_MISSIONS);
    setAdminDebrisFields(INITIAL_ADMIN_DEBRIS_FIELDS);
    setAdminSupportTickets(INITIAL_ADMIN_SUPPORT_TICKETS);
    setAdminSecurityAlerts(INITIAL_ADMIN_SECURITY_ALERTS);
    setAdminGlobalEvents(INITIAL_ADMIN_GLOBAL_EVENTS);
    setOgameUniverseConfig(DEFAULT_OGAME_UNIVERSE_CONFIG);
    sound.play('confirm');
  };

  // Reset demo state
  const handleResetGame = () => {
    localStorage.clear();
    setProfile(INITIAL_PROFILE);
    setResources(INITIAL_RESOURCES);
    setTechnologies(INITIAL_TECHNOLOGIES);
    setPlayerWeapons(INITIAL_PLAYER_WEAPONS);
    setTargets(TARGET_REALMS);
    setModules(INITIAL_MOTHERSHIP_MODULES);
    setPlanets(INITIAL_PLANETS);
    setOrders(INITIAL_MARKET_ORDERS);
    setBattles([]);
    setMissions([]);
    setMessages(INITIAL_MESSAGES);
    setRankings(INITIAL_RANKINGS);
    setOgameTechnologies(INITIAL_OGAME_TECHNOLOGIES);
    setResearchQueue([]);
    setLabSpecialization('physics');
    setOgameFacilities(INITIAL_OGAME_FACILITIES);
    setFactoryQueue([]);
    setOgameShips(INITIAL_OGAME_SHIPS);
    setShipyardQueue([]);
    setSelectedFormation('standard');
    setFleetPresets(INITIAL_FLEET_PRESETS);
    setOgameDefenses(INITIAL_OGAME_DEFENSES);
    setDefenseQueue([]);
    setActiveExpeditions(INITIAL_EXPEDITIONS);
    setExpeditionLogs(INITIAL_EXPEDITION_LOGS);
    setMegastructures(INITIAL_MEGASTRUCTURES);
    setDecrees(INITIAL_IMPERIAL_DECREES);
    setWorldModifiers(INITIAL_WORLD_MODIFIERS);
    setServerSettings(DEFAULT_ADMIN_SETTINGS);
    setCronJobs(INITIAL_CRON_JOBS);
    setCronLogs(INITIAL_CRON_LOGS);
    setActiveRoute('dashboard');
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleToggleSound = () => {
    const res = sound.toggle();
    setSoundEnabled(res);
  };

  const handleNavigate = (route: string) => {
    setActiveRoute(route);
    setMobileMenuOpen(false);
  };

  if (!isLoggedIn) {
    return (
      <TitleScreen
        profile={profile}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onQuickStart={() => {
          setIsLoggedIn(true);
          localStorage.setItem('uc_state_isLoggedIn', JSON.stringify(true));
        }}
        onRootAdminLogin={handleRootAdminLoginSuccess}
      />
    );
  }

  return (
    <div id="app-root" className="flex min-h-screen bg-white text-[#111111] font-sans antialiased overflow-x-hidden">
      {/* Left Sidebar (Desktop Rail & Collapsible + Mobile Slide-over Drawer) */}
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        profile={profile}
        openGroups={openGroups}
        onToggleGroup={toggleGroup}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div id="main-content-wrapper" className="flex-1 flex flex-col min-w-0 bg-[#ffffff] w-full">
        {/* Root Admin URL Login Live Notification Banner */}
        {urlLoginNotification && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black px-4 py-2 text-xs font-mono font-bold flex items-center justify-between border-b-2 border-amber-600 shadow-md z-40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping shrink-0" />
              <span>SOVEREIGN ROOT ADMIN URL ACCESS: {urlLoginNotification.message}</span>
              <span className="px-1.5 py-0.5 bg-black text-amber-300 text-[10px] uppercase font-black tracking-wider">
                CLEARANCE LEVEL 10
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUrlLoginNotification(null)}
              className="p-1 hover:bg-black/15 text-black font-black text-xs cursor-pointer ml-2"
              title="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )}

        {/* Topbar */}
        <Topbar
          activeRoute={activeRoute}
          profile={profile}
          resources={resources}
          planets={planets}
          activePlanetId={activePlanetId}
          onSelectPlanet={setActivePlanetId}
          cronAutoTickEnabled={cronConfig.autoTickEnabled}
          nextTickSeconds={nextTickSeconds}
          netIncome={netIncome}
          bankCapacity={bankCapacity}
          onProcessTurn={handleProcessTurn}
          onResetGame={handleResetGame}
          onNavigate={handleNavigate}
          onOpenPatchNotes={() => {
            setPatchNotesTab('patch');
            setIsPatchNotesOpen(true);
          }}
          onOpenUpdateInfo={() => {
            setPatchNotesTab('update');
            setIsPatchNotesOpen(true);
          }}
          onOpenCredits={() => setIsCreditsModalOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
          onUpdatePlanets={setPlanets}
          onColonizePlanet={handleColonizePlanet}
          onUpdateAllSystems={handleUpdateAllSystems}
        />

        {/* Live System 8-Step Route Navigation Bar (Feature 40) */}
        <LiveSystemRouteBar
          activeRoute={activeRoute}
          onNavigate={handleNavigate}
        />

        {/* Scrollable Stage Area */}
        <main id="main-content-scroll" className="flex-1 overflow-y-auto p-3 xs:p-4 sm:p-6 md:p-8 pb-safe bg-[#f7f8fa]">
          <div id="main-content-inner" className="max-w-7xl 2xl:max-w-[1536px] mx-auto space-y-5 sm:space-y-6 transition-all duration-150">
            {/* Offline Catch-up Notification Banner */}
            {offlineNotice && (
              <div className="p-3.5 sm:p-4 border border-[#111111] bg-[#111111] text-white flex items-center justify-between text-xs shadow-xs rounded-none">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                    <span className="absolute w-4 h-4 rounded-full bg-[#22c55e]/40 animate-ping" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#22c55e] block">
                      OFFLINE RECOVERY SYNC
                    </span>
                    <span className="font-semibold text-white/95 text-xs sm:text-[13px]">{offlineNotice}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOfflineNotice(null)}
                  className="px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider uppercase border border-white/20 hover:border-white text-white/90 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer transition-colors shrink-0"
                >
                  DISMISS
                </button>
              </div>
            )}

            {/* Global Imperial Broadcast Banner */}
            {serverSettings.globalBroadcastActive && serverSettings.globalBroadcastMessage && (
              <div className="p-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-[#111111] border-2 border-amber-500 font-mono text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-[#111111] text-amber-400 font-bold text-[10px] tracking-wider uppercase shadow-2xs">
                    👑 IMPERIAL BROADCAST
                  </span>
                  <span className="font-bold tracking-tight text-neutral-950 text-xs sm:text-[13px]">
                    {serverSettings.globalBroadcastMessage}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setServerSettings((prev) => ({ ...prev, globalBroadcastActive: false }))
                  }
                  className="px-2.5 py-1 bg-black/10 hover:bg-[#111111] text-[#111111] hover:text-white text-[10px] font-bold uppercase transition-colors cursor-pointer shrink-0"
                >
                  DISMISS
                </button>
              </div>
            )}

            {/* Top HUD Metrics Grid */}
            <HudMetrics
              resources={resources}
              netIncome={netIncome}
              militaryUpkeep={militaryUpkeep}
              defconLevel={profile.defconLevel}
              onNavigate={setActiveRoute}
            />

            {/* Global Page Header & Sibling Sub-Pages Command Deck */}
            <PageHeaderCommandDeck
              activeRoute={activeRoute}
              onNavigate={setActiveRoute}
              profile={profile}
              resources={resources}
              onProcessTurn={handleProcessTurn}
              onUpdateAllSystems={handleUpdateAllSystems}
              planetsCount={planets.length}
            />

            {/* View Routers */}
            {(activeRoute === 'env-config' || activeRoute === 'server-config') && (
              <div className="w-full">
                <EnvironmentConfigSystemView />
              </div>
            )}

            {activeRoute === 'admin-terminal' && isAdminUser && (
              <div className="w-full">
                <AdminSystemsTerminalView />
              </div>
            )}

            {activeRoute === 'bsat' && (
              <div className="w-full">
                <BsatStudio onClose={() => setActiveRoute('dashboard')} />
              </div>
            )}

            {activeRoute === 'dashboard' && (
              <DashboardView
                profile={profile}
                resources={resources}
                onNavigate={setActiveRoute}
                naturalIncome={naturalIncome}
                bankCapacity={bankCapacity}
                planets={planets}
                onUpdateAllSystems={handleUpdateAllSystems}
              />
            )}

            {activeRoute === 'commander-hq' && (
              <CommanderSystemView
                profile={profile}
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
              />
            )}

            {(activeRoute === 'player-profile' ||
              activeRoute === 'account-info' ||
              activeRoute === 'account-settings' ||
              activeRoute === 'account-profiles' ||
              activeRoute === 'account') && (
              <ProfileSystemView
                profile={profile}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onChangeRace={handleChangeRace}
                onChangeGovernment={handleChangeGovernment}
                onToggleVacation={handleToggleVacation}
                onAscend={handleAscend}
                onLogout={handleLogout}
                onNavigate={setActiveRoute}
                initialTab={
                  activeRoute === 'account-settings'
                    ? 'settings'
                    : activeRoute === 'account-profiles'
                    ? 'slots'
                    : 'dossier'
                }
              />
            )}

            {activeRoute === 'resources' && (
              <ResourcesView
                profile={profile}
                resources={resources}
                bankCapacity={bankCapacity}
                onDeposit={handleDeposit}
                onWithdraw={handleWithdraw}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'income' && (
              <IncomeView
                profile={profile}
                resources={resources}
                naturalIncome={naturalIncome}
                planets={planets}
                onUpdateResources={(updates) => setResources((prev) => ({ ...prev, ...updates }))}
                onUpdatePlanets={setPlanets}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'military-stats' && (
              <MilitaryScoresView
                profile={profile}
                resources={resources}
                onSetDefcon={handleSetDefcon}
                strikePower={strikePower}
                defensePower={defensePower}
                covertRating={covertRating}
              />
            )}

            {activeRoute === 'nemesis-system' && (
              <NemesisSystemView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                profile={profile}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'targets' && (
              <CombatView
                profile={profile}
                resources={resources}
                targets={targets}
                fleetPresets={fleetPresets}
                selectedFormation={selectedFormation}
                onSelectFormation={setSelectedFormation}
                onExecuteAttack={handleExecuteAttack}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'spy' && (
              <SpyView
                profile={profile}
                resources={resources}
                targets={targets}
                defaultMode="recon"
                onExecuteMission={handleExecuteMission}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'sabotage' && (
              <SpyView
                profile={profile}
                resources={resources}
                targets={targets}
                defaultMode="sabotage"
                onExecuteMission={handleExecuteMission}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'attack-log' && (
              <AttackLogView battles={battles} onNavigate={setActiveRoute} />
            )}

            {(activeRoute === 'weapons' ||
              activeRoute === 'armors' ||
              activeRoute === 'shields' ||
              activeRoute === 'weapon-market' ||
              activeRoute === 'repair') && (
              <ArmoryView
                resources={resources}
                weapons={WEAPON_TYPES}
                inventory={playerWeapons}
                activeRoute={activeRoute}
                onBuyWeapon={handleBuyWeapon}
                onRepairWeapon={handleRepairWeapon}
                onRepairAll={handleRepairAllWeapons}
              />
            )}

            {(activeRoute === 'units' ||
              activeRoute === 'miners' ||
              activeRoute === 'super-units' ||
              activeRoute === 'unit-production') && (
              <TrainingView
                resources={resources}
                activeRoute={activeRoute}
                onTrainUnits={handleTrainUnits}
                onUpgradeProduction={handleUpgradeProduction}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'military-barracks' && (
              <MilitaryBarracksEnlistmentView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onNavigate={setActiveRoute}
              />
            )}

            {(activeRoute === 'workforce-academy' ||
              activeRoute === 'academy-enlistment' ||
              activeRoute === 'academy-wings' ||
              activeRoute === 'workforce-roster' ||
              activeRoute === 'academy-drills') && (
              <WorkforceAcademyView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                academyState={workforceAcademyState}
                onUpdateAcademyState={setWorkforceAcademyState}
                onNavigate={setActiveRoute}
                initialTab={
                  activeRoute === 'workforce-roster'
                    ? 'roster'
                    : activeRoute === 'academy-wings'
                    ? 'wings'
                    : activeRoute === 'academy-drills'
                    ? 'drills'
                    : 'enlistment'
                }
              />
            )}

            {(activeRoute === 'tech-offense' ||
              activeRoute === 'tech-defense' ||
              activeRoute === 'tech-covert' ||
              activeRoute === 'tech-anti-covert') && (
              <TechnologyView
                resources={resources}
                technologies={technologies}
                activeBranchFilter={
                  activeRoute === 'tech-offense'
                    ? 'offense'
                    : activeRoute === 'tech-defense'
                    ? 'defense'
                    : activeRoute === 'tech-covert'
                    ? 'covert'
                    : 'anti-covert'
                }
                onUpgradeTech={handleUpgradeTech}
              />
            )}

            {activeRoute === 'tech-tree' && (
              <TechTreeView
                technologies={ogameTechnologies}
                resources={resources}
                researchQueue={researchQueue}
                onStartResearch={handleStartResearch}
                onCancelResearch={handleCancelResearch}
              />
            )}

            {activeRoute === 'universe' && (
              <UniverseView
                resources={resources}
                planets={planets}
                onColonizePlanet={handleColonizePlanet}
                onNavigate={setActiveRoute}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'add-worlds-bosses' && (
              <AddWorldsUniverseBossView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onNavigate={setActiveRoute}
              />
            )}

            {(activeRoute === 'tech-library' || activeRoute === 'research') && (
              <ResearchLibraryView
                technologies={ogameTechnologies}
                resources={resources}
                researchQueue={researchQueue}
                labSpecialization={labSpecialization}
                onSelectLabSpecialization={setLabSpecialization}
                onStartResearch={handleStartResearch}
                onCancelResearch={handleCancelResearch}
                onInstantCompleteResearch={handleInstantCompleteResearch}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'factories' && (
              <FactoryView
                facilities={ogameFacilities}
                resources={resources}
                factoryQueue={factoryQueue}
                onUpgradeFacility={handleUpgradeFacility}
                onCancelFactoryUpgrade={handleCancelFactoryUpgrade}
              />
            )}

            {activeRoute === 'shipyard' && (
              <ShipyardView
                ships={ogameShips}
                resources={resources}
                shipyardQueue={shipyardQueue}
                selectedFormation={selectedFormation}
                onSelectFormation={setSelectedFormation}
                fleetPresets={fleetPresets}
                activePresetId={activePresetId}
                onSelectPreset={setActivePresetId}
                onSavePreset={handleSavePreset}
                onDeletePreset={handleDeletePreset}
                onBuildShips={handleBuildShips}
                onCancelShipyardQueue={handleCancelShipyardQueue}
                onBatchCancelShipyardQueue={handleBatchCancelShipyardQueue}
                onAccelerateShipyardQueue={handleAccelerateShipyardQueue}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'defenses' && (
              <DefenseView
                defenses={ogameDefenses}
                resources={resources}
                defenseQueue={defenseQueue}
                onBuildDefenses={handleBuildDefenses}
                onCancelDefenseQueue={handleCancelDefenseQueue}
              />
            )}

            {activeRoute === 'expeditions' && (
              <ExpeditionView
                ships={ogameShips}
                resources={resources}
                activeMissions={activeExpeditions}
                expeditionLogs={expeditionLogs}
                maxExpeditionSlots={3}
                fleetPresets={fleetPresets}
                selectedFormation={selectedFormation}
                onSelectFormation={setSelectedFormation}
                onSavePreset={handleSavePreset}
                onLaunchExpedition={handleLaunchExpedition}
                onClaimLoot={handleClaimLoot}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'megastructures' && (
              <MegastructureView
                projects={megastructures}
                resources={resources}
                onStartStage={handleStartMegastructureStage}
              />
            )}

            {(activeRoute === 'master-upgrades' || activeRoute === 'storage-upgrades') && (
              <MasterUpgradesView
                resources={resources}
                upgradesState={masterUpgrades}
                onUpgradeKey={handleMasterUpgradeKey}
                onNavigate={setActiveRoute}
                initialCategory={activeRoute === 'storage-upgrades' ? 'storage' : 'all'}
              />
            )}

            {(activeRoute === 'spy-log' ||
              activeRoute === 'enemy-intelligence' ||
              activeRoute === 'intel-codex') && (
              <IntelligenceView
                missions={missions}
                onNavigate={setActiveRoute}
                defaultTab={
                  activeRoute === 'enemy-intelligence'
                    ? 'enemy-intelligence'
                    : activeRoute === 'intel-codex'
                    ? 'intel-codex'
                    : 'spy-log'
                }
              />
            )}

            {(activeRoute === 'resource-exchange' ||
              activeRoute === 'mercenary-market') && (
              <MarketView
                resources={resources}
                orders={orders}
                mercenaries={MERCENARY_CONTRACTS}
                onHireMercenary={handleHireMercenary}
                onFulfillOrder={handleFulfillOrder}
              />
            )}

            {(activeRoute === 'guilds' ||
              activeRoute === 'alliances' ||
              activeRoute === 'friends' ||
              activeRoute === 'messages' ||
              activeRoute === 'direct-messages' ||
              activeRoute === 'player-trade') && (
              <SocialGuildsView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                profile={profile}
                defaultSubTab={
                  activeRoute === 'friends'
                    ? 'friends'
                    : activeRoute === 'messages' || activeRoute === 'direct-messages'
                    ? 'messages'
                    : activeRoute === 'player-trade'
                    ? 'trade'
                    : 'guilds'
                }
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'rankings' && (
              <RankingsView
                rankings={rankings}
                alliances={INITIAL_ALLIANCES}
                messages={messages}
                defaultTab="rankings"
                onSendMessage={handleSendMessage}
                onMarkMessageRead={handleMarkMessageRead}
              />
            )}

            {(activeRoute === 'planet-list' ||
              activeRoute === 'planet-bonuses' ||
              activeRoute === 'planet-defenses' ||
              activeRoute === 'life-support' ||
              activeRoute === 'population' ||
              activeRoute === 'hazards' ||
              activeRoute === 'plunge' ||
              activeRoute === 'colonial-plunge') && (
              <PlanetsView
                resources={resources}
                planets={planets}
                onUpgradePlanet={handleUpgradePlanet}
                onUpdatePlanets={setPlanets}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onNavigate={setActiveRoute}
                defaultPlanetId={activePlanetId}
                defaultSubTab={
                  activeRoute === 'planet-defenses'
                    ? 'defenses'
                    : activeRoute === 'planet-bonuses'
                    ? 'governance'
                    : activeRoute === 'life-support'
                    ? 'life-support'
                    : activeRoute === 'population'
                    ? 'population'
                    : activeRoute === 'hazards'
                    ? 'hazards'
                    : activeRoute === 'plunge' || activeRoute === 'colonial-plunge'
                    ? 'plunge'
                    : 'overview'
                }
              />
            )}

            {(activeRoute === 'aic-system' || activeRoute === 'power-grid') && (
              <AICSystemView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onNavigate={setActiveRoute}
                initialTab={activeRoute === 'power-grid' ? 'power-grid' : 'production'}
              />
            )}

            {activeRoute === 'planet-power' && (
              <PlanetaryPowerView
                resources={resources}
                planets={planets}
                onUpgradePlanet={handleUpgradePlanet}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'space-stations' && (
              <SpaceStationView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'blueprint-fabricator' && (
              <BlueprintFabricatorView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'construction-yards' && (
              <ConstructionYardsView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'moon-bases' && (
              <MoonBaseView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'bank-vault' && (
              <BankVaultView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'eve-blueprints' && (
              <EveBlueprintsView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'nms-universe' && (
              <NMSUniverseView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'unit-roster-90' && (
              <UnitRoster90View
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'stargate-network' && (
              <StargateNetworkView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                profile={profile}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'stargate-telemetry' && (
              <GateRoomTelemetryView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'gate-tokens' && (
              <GateTokensSystemView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                profile={profile}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'stargate-relics' && (
              <StargateRelicsView
                resources={resources}
                profile={profile}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'stargate-system-lords' && (
              <StargateSystemLordsPvEView
                profile={profile}
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'stargate-npc-races' && (
              <StargateNpcRacesView
                playerProfile={profile}
                resources={resources}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'planetary-invasion' && (
              <PlanetaryInvasionView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                profile={profile}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onNavigate={setActiveRoute}
              />
            )}

            {(activeRoute === 'ship' ||
              activeRoute === 'modules' ||
              activeRoute === 'exploration') && (
              <MothershipView
                resources={resources}
                modules={modules}
                profile={profile}
                activeRoute={activeRoute}
                onUpgradeModule={handleUpgradeModule}
                onExploreSector={handleExploreSector}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onNavigate={setActiveRoute}
              />
            )}

            {(activeRoute === 'race' ||
              activeRoute === 'vacation' ||
              activeRoute === 'ascension') && (
              <ProfileSystemView
                profile={profile}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onChangeRace={handleChangeRace}
                onChangeGovernment={handleChangeGovernment}
                onToggleVacation={handleToggleVacation}
                onAscend={handleAscend}
                onLogout={handleLogout}
                initialTab={
                  activeRoute === 'vacation'
                    ? 'security'
                    : 'heritage'
                }
              />
            )}

            {(activeRoute === 'admin' ||
              activeRoute === 'admin-dashboard' ||
              activeRoute === 'turn-system' ||
              activeRoute === 'admin-crown' ||
              activeRoute === 'admin-empire-history' ||
              activeRoute === 'empire-history' ||
              activeRoute === 'admin-universe' ||
              activeRoute === 'admin-users' ||
              activeRoute === 'admin-bans' ||
              activeRoute === 'admin-planets' ||
              activeRoute === 'admin-fleets' ||
              activeRoute === 'admin-debris' ||
              activeRoute === 'admin-tickets' ||
              activeRoute === 'admin-security' ||
              activeRoute === 'admin-events' ||
              activeRoute === 'admin-cheats' ||
              activeRoute === 'admin-operations' ||
              activeRoute === 'cron-jobs' ||
              activeRoute === 'cron-logs' ||
              activeRoute === 'cron-cli' ||
              activeRoute === 'admin-maintenance') &&
              (isAdminUser ? (
                <AdminControlPanelView
                  profile={profile}
                  resources={resources}
                  decrees={decrees}
                  worldModifiers={worldModifiers}
                  serverSettings={serverSettings}
                  cronJobs={cronJobs}
                  cronLogs={cronLogs}
                  cronConfig={cronConfig}
                  nextTickSeconds={nextTickSeconds}
                  grossIncome={naturalIncome}
                  netIncome={netIncome}
                  upkeepTotal={militaryUpkeep}
                  universeConfig={ogameUniverseConfig}
                  adminUsers={adminUsers}
                  adminBans={adminBans}
                  adminPlanets={adminPlanets}
                  adminFleetMissions={adminFleetMissions}
                  adminDebrisFields={adminDebrisFields}
                  adminSupportTickets={adminSupportTickets}
                  adminSecurityAlerts={adminSecurityAlerts}
                  adminGlobalEvents={adminGlobalEvents}
                  onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                  onProcessTurn={handleProcessTurn}
                  onUpdateAllSystems={handleUpdateAllSystems}
                  onToggleDecree={handleToggleDecree}
                  onAddDecree={handleAddDecree}
                  onUpdateWorldModifier={handleUpdateWorldModifier}
                  onUpdateServerSettings={handleUpdateServerSettings}
                  onInstantFinishBuildings={handleInstantFinishBuildings}
                  onInstantFinishResearch={handleInstantFinishResearch}
                  onInstantFinishShipyard={handleInstantFinishShipyard}
                  onUnlockAllTechs={handleUnlockAllTechs}
                  onSpawnArmada={handleSpawnArmada}
                  onExportState={handleExportState}
                  onImportState={handleImportState}
                  onFactoryReset={handleResetGame}
                  onBroadcastMessage={handleBroadcastMessage}
                  onUpdateCronConfig={handleUpdateCronConfig}
                  onRunCronJob={handleRunCronJob}
                  onRunAllCronJobs={handleRunAllCronJobs}
                  onToggleCronJob={handleToggleCronJob}
                  onClearCronLogs={handleClearCronLogs}
                  onUpdateUniverseConfig={handleUpdateUniverseConfig}
                  onUpdateAdminUser={handleUpdateAdminUser}
                  onBanUser={handleBanUser}
                  onUnbanUser={handleUnbanUser}
                  onUpdatePlanet={handleUpdatePlanetAdmin}
                  onSpawnMoon={handleSpawnMoon}
                  onTerraformPlanet={handleTerraformPlanet}
                  onRecallFleetMission={handleRecallFleetMission}
                  onTeleportFleetMission={handleTeleportFleetMission}
                  onSpawnDebris={handleSpawnDebris}
                  onClearDebris={handleClearDebris}
                  onClearAllDebris={handleClearAllDebris}
                  onReplySupportTicket={handleReplySupportTicket}
                  onUpdateTicketStatus={handleUpdateTicketStatus}
                  onResolveSecurityAlert={handleResolveSecurityAlert}
                  onToggleGlobalEvent={handleToggleGlobalEvent}
                  onRecalculateHighscores={handleRecalculateHighscores}
                  onPurgeInactives={handlePurgeInactives}
                  onFlushCache={handleFlushCache}
                  onResetUniverseSeason={handleResetUniverseSeason}
                  initialTab={
                    activeRoute === 'admin-empire-history' || activeRoute === 'empire-history'
                      ? 'empire-history'
                      : activeRoute === 'admin-universe'
                      ? 'universe'
                      : activeRoute === 'admin-users'
                      ? 'users'
                      : activeRoute === 'admin-bans'
                      ? 'bans'
                      : activeRoute === 'admin-planets'
                      ? 'planets'
                      : activeRoute === 'admin-fleets'
                      ? 'fleets'
                      : activeRoute === 'admin-debris'
                      ? 'debris'
                      : activeRoute === 'admin-tickets'
                      ? 'tickets'
                      : activeRoute === 'admin-security'
                      ? 'security'
                      : activeRoute === 'admin-events'
                      ? 'events'
                      : activeRoute === 'admin-cheats'
                      ? 'cheats'
                      : activeRoute === 'admin-operations'
                      ? 'operations'
                      : activeRoute === 'cron-jobs'
                      ? 'scheduler'
                      : activeRoute === 'cron-logs'
                      ? 'logs'
                      : activeRoute === 'cron-cli'
                      ? 'cli'
                      : activeRoute === 'admin-maintenance'
                      ? 'maintenance'
                      : activeRoute === 'turn-system'
                      ? 'turn-system'
                      : 'crown'
                  }
                />
              ) : activeRoute === 'turn-system' ? (
                <div className="space-y-6">
                  <TurnSystemView
                    resources={resources}
                    onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                    onProcessTurn={handleProcessTurn}
                    onUpdateAllSystems={handleUpdateAllSystems}
                  />
                </div>
              ) : activeRoute === 'cron-jobs' || activeRoute === 'cron-logs' || activeRoute === 'cron-cli' ? (
                <CronSystemView
                  jobs={cronJobs}
                  logs={cronLogs}
                  config={cronConfig}
                  nextTickSeconds={nextTickSeconds}
                  resources={resources}
                  grossIncome={naturalIncome}
                  netIncome={netIncome}
                  upkeepTotal={militaryUpkeep}
                  onUpdateConfig={handleUpdateCronConfig}
                  onRunJob={handleRunCronJob}
                  onRunAllJobs={handleRunAllCronJobs}
                  onToggleJob={handleToggleCronJob}
                  onClearLogs={handleClearCronLogs}
                />
              ) : (
                <div className="border-2 border-red-600 bg-white p-8 max-w-3xl mx-auto my-8 font-mono shadow-xl space-y-6">
                  <div className="flex items-center gap-3 text-red-600 border-b border-red-200 pb-4">
                    <ShieldAlert size={32} />
                    <div>
                      <h2 className="text-xl font-extrabold uppercase tracking-wider text-[#111111]">
                        Access Restricted — Admin Clearance Required
                      </h2>
                      <span className="text-xs font-bold text-red-600 uppercase">
                        Sovereign Admin Mainframe & Overseer Control Panel
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#333333] leading-relaxed">
                    You are currently logged in as a <strong>Standard User Account</strong> (<code>{profile.displayName || profile.username}</code>).
                    Admin Systems (Universe Configuration, Player Accounts Inspector, Imperial Decrees, Bans, Cron Engine, and Database Operations) are strictly reserved for verified <strong>Admin Account Users</strong>.
                  </p>

                  <div className="p-4 bg-neutral-100 border border-neutral-300 space-y-2 text-xs">
                    <div className="font-bold text-[#111111] uppercase flex items-center justify-between">
                      <span>Active User Profile</span>
                      <span className="px-2 py-0.5 bg-neutral-800 text-white text-[10px]">Standard User</span>
                    </div>
                    <div>Account Name: <strong>{profile.username}</strong></div>
                    <div>Sovereign Title: <strong>{profile.title || 'Fleet Commander'}</strong></div>
                    <div>Role Status: <strong>{profile.role || 'user'} (Standard)</strong></div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      id="btn-[#111111]-admin-auth-prompt"
                      onClick={() => {
                        sound.play('click');
                        setShowAdminLoginModal(true);
                      }}
                      className="px-6 py-3 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Key size={16} className="text-amber-400" />
                      <span>Authenticate as Admin Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.play('click');
                        setActiveRoute('dashboard');
                      }}
                      className="px-6 py-3 border border-[#dedede] bg-white text-[#111111] text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      Return to Command Dashboard
                    </button>
                  </div>
                </div>
              ))}

            {(activeRoute === 'store-battlepass' || activeRoute === 'commander-gacha') && (
              <StoreBattlePassView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                defaultTab={activeRoute === 'commander-gacha' ? 'commander-gotcha' : 'battlepass'}
              />
            )}

            {activeRoute === 'mmorpg-ogame' && (
              <MMORPGOgameView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'hyperspace-systems' && (
              <HyperspaceView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'stellar-encyclopedia' && (
              <StellarEncyclopediaView />
            )}

            {activeRoute === 'ship-fitting' && (
              <ShipFittingView
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'civilization' && (
              <CivilizationView
                profile={profile}
                resources={resources}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
              />
            )}

            {activeRoute === 'government-system' && (
              <GovernmentSystemView
                profile={profile}
                resources={resources}
                onChangeGovernment={handleChangeGovernment}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'dev-credits' && (
              <DevelopmentCreditsView onNavigate={setActiveRoute} />
            )}

            {activeRoute === 'diplomacy' && (
              <DiplomacyView
                profile={profile}
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'missions' && (
              <MissionsView
                profile={profile}
                resources={resources}
                onUpdateResources={(res) => setResources((prev) => ({ ...prev, ...res }))}
                onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
                onNavigate={setActiveRoute}
              />
            )}

            {activeRoute === 'galactic-news' && (
              <GalacticNewsView />
            )}

            {activeRoute === 'codex-doc' && (
              <CodexDocumentationView />
            )}

            {(() => {
              const registeredRoutes = new Set(OGAME_NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.id)));
              registeredRoutes.add('admin');
              return !registeredRoutes.has(activeRoute) ? (
                <RouteNotFoundView route={activeRoute} onNavigate={setActiveRoute} />
              ) : null;
            })()}
          </div>
        </main>
        <Footer
          onNavigate={setActiveRoute}
          onOpenPatchNotes={() => {
            setPatchNotesTab('patch');
            setIsPatchNotesOpen(true);
          }}
          onOpenUpdateInfo={() => {
            setPatchNotesTab('update');
            setIsPatchNotesOpen(true);
          }}
          onOpenCredits={() => setIsCreditsModalOpen(true)}
          onOpenSaveManager={() => setIsSaveManagerOpen(true)}
        />
      </div>

      {/* Global Modals */}
      <PatchNotesModal
        isOpen={isPatchNotesOpen}
        onClose={() => setIsPatchNotesOpen(false)}
        initialTab={patchNotesTab}
        onOpenCredits={() => {
          setIsPatchNotesOpen(false);
          setIsCreditsModalOpen(true);
        }}
      />

      {/* Development Team Credits Modal */}
      {isCreditsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl w-full my-auto">
            <DevelopmentCreditsView
              isModal={true}
              onCloseModal={() => setIsCreditsModalOpen(false)}
              onNavigate={(route) => {
                setIsCreditsModalOpen(false);
                setActiveRoute(route);
              }}
            />
          </div>
        </div>
      )}

      <SaveStateManagerModal
        isOpen={isSaveManagerOpen}
        onClose={() => setIsSaveManagerOpen(false)}
        profile={profile}
        resources={resources}
        onImportState={handleImportState}
      />

      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onAuthSuccess={(session) => {
          setAdminSession(session);
          setShowAdminLoginModal(false);
        }}
      />

      <RootAdminUrlLoginModal
        isOpen={showRootAdminUrlModal}
        onClose={() => setShowRootAdminUrlModal(false)}
        onAuthSuccess={(session, account) => {
          handleRootAdminLoginSuccess(session, account);
          setShowRootAdminUrlModal(false);
        }}
      />
    </div>
  );
}
