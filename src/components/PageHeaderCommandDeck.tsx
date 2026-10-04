import React from 'react';
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
  Gem,
  Terminal,
  ChevronRight,
  Clock,
  Zap,
  Activity,
  Compass,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { sound } from '../sound';
import { PlayerProfile, PlayerResources } from '../types';
import { OGAME_NAV_SECTIONS, OGameNavSection } from './Sidebar';

interface PageHeaderCommandDeckProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  profile: PlayerProfile;
  resources: PlayerResources;
  onProcessTurn?: (turns: number) => void;
  onUpdateAllSystems?: () => void;
  planetsCount?: number;
}

export const PageHeaderCommandDeck: React.FC<PageHeaderCommandDeckProps> = ({
  activeRoute,
  onNavigate,
  profile,
  resources,
  onProcessTurn,
  onUpdateAllSystems,
  planetsCount = 1,
}) => {
  // Find current section
  const currentSection: OGameNavSection | undefined = OGAME_NAV_SECTIONS.find((sec) =>
    sec.items.some((item) => item.id === activeRoute)
  );

  const activeItem = currentSection?.items.find((item) => item.id === activeRoute);

  const SectionIcon = currentSection?.icon || Compass;

  const handleTurnClick = (count: number) => {
    sound.play('click');
    if (onProcessTurn) {
      onProcessTurn(count);
    }
  };

  return (
    <div
      id="page-header-command-deck"
      className="border border-[#dedede] bg-white shadow-xs overflow-hidden transition-all duration-200"
    >
      {/* Top Banner: Breadcrumb, Sector Telemetry, and Rapid Turn Controls */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-neutral-50 via-white to-neutral-50 border-b border-[#eeeeee] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xs bg-[#111111] text-white flex items-center justify-center shrink-0 shadow-xs">
            <SectionIcon size={18} className="text-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#666666]">
              <span>UNIVERSE COMMAND</span>
              <ChevronRight size={10} className="text-[#999999]" />
              <span className="text-[#111111] font-semibold">
                {currentSection ? currentSection.label : 'DOMINION SECTOR'}
              </span>
              {activeItem && (
                <>
                  <ChevronRight size={10} className="text-[#999999]" />
                  <span className="text-amber-600 font-bold">{activeItem.label}</span>
                </>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#111111] mt-0.5 flex items-center gap-2">
              <span>{activeItem ? activeItem.label : 'Strategic Control Console'}</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold uppercase rounded-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </h1>
          </div>
        </div>

        {/* Telemetry Status & Rapid Chrono Turn Engine Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto font-mono text-xs">
          {/* Quick World & Turn Metrics */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xs text-[11px]">
            <span className="text-[#777777] flex items-center gap-1">
              <Clock size={11} className="text-amber-500" />
              Turns:
            </span>
            <strong className="text-[#111111] font-bold font-mono">
              {resources.attackTurns ?? 100} / 100
            </strong>
            <span className="text-[#888888] text-[9px]">(+6/min)</span>
          </div>

          {/* Quick Advance Turn Actions */}
          {onProcessTurn && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleTurnClick(1)}
                className="px-2 py-1.5 bg-white hover:bg-[#111111] hover:text-white border border-[#cccccc] hover:border-[#111111] text-[10px] font-bold uppercase transition-colors cursor-pointer rounded-xs"
                title="Execute 1 Empire Turn"
              >
                +1 Turn
              </button>
              <button
                type="button"
                onClick={() => handleTurnClick(5)}
                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-500 hover:text-white border border-amber-300 hover:border-amber-600 text-amber-900 text-[10px] font-bold uppercase transition-colors cursor-pointer rounded-xs"
                title="Execute 5 Empire Turns"
              >
                +5 Turns
              </button>
              <button
                type="button"
                onClick={() => handleTurnClick(10)}
                className="px-2.5 py-1.5 bg-[#111111] hover:bg-[#333333] text-amber-400 text-[10px] font-bold uppercase transition-colors cursor-pointer rounded-xs shadow-2xs"
                title="Execute 10 Empire Turns"
              >
                ⚡ +10 Turns
              </button>
            </div>
          )}

          {/* Universal UPDATE ALL SYSTEMS Action Button */}
          <button
            type="button"
            id="deck-update-all-systems-btn"
            onClick={() => {
              sound.play('confirm');
              if (onUpdateAllSystems) {
                onUpdateAllSystems();
              } else if (onProcessTurn) {
                onProcessTurn(1);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-mono text-[10px] font-extrabold uppercase rounded-xs border border-emerald-500/50 shadow-2xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Synchronize & Update All Imperial Systems (Mines, Factories, Shipyards, R&D Labs, Gate Relays, Bank Vault)"
          >
            <RotateCw size={11} className="text-emerald-200" />
            <span className="hidden sm:inline">UPDATE ALL SYSTEMS</span>
            <span className="sm:hidden">UPDATE ALL</span>
          </button>

          {/* Turn Engine Link Shortcut */}
          <button
            type="button"
            onClick={() => {
              sound.play('click');
              onNavigate('turn-system');
            }}
            className="p-1.5 bg-white hover:bg-neutral-100 border border-[#cccccc] text-[#444444] rounded-xs cursor-pointer"
            title="Open Turn Engine Matrix"
          >
            <Zap size={14} className="text-amber-500" />
          </button>
        </div>
      </div>

      {/* Sibling Subpages Navigation Ribbon */}
      {currentSection && currentSection.items.length > 1 && (
        <div className="px-3 sm:px-4 py-2 bg-white border-t border-[#f0f0f0] overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-1.5 min-w-max text-xs">
            <span className="text-[10px] font-bold uppercase font-mono text-[#888888] mr-1 shrink-0 flex items-center gap-1">
              <span>{currentSection.ogameName} DIRECTIVES:</span>
            </span>

            {currentSection.items.map((item, index) => {
              const isActive = item.id === activeRoute;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!isActive) {
                      sound.play('click');
                      onNavigate(item.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xs transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#111111] text-white shadow-xs font-bold'
                      : 'bg-[#f5f5f5] text-[#444444] hover:bg-[#e8e8e8] hover:text-[#111111] border border-[#e5e5e5]'
                  }`}
                >
                  <span
                    className={`text-[9.5px] font-mono ${
                      isActive ? 'text-amber-400 font-bold' : 'text-[#888888]'
                    }`}
                  >
                    0{index + 1}.
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
