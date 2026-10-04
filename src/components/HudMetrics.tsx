import React from 'react';
import { PlayerResources } from '../types';
import { TrendingUp, ShieldAlert, Users, Landmark, ChevronRight, Activity } from 'lucide-react';
import { sound } from '../sound';

interface HudMetricsProps {
  resources: PlayerResources;
  netIncome?: number;
  militaryUpkeep?: number;
  defconLevel?: number;
  onNavigate?: (route: string) => void;
}

export const HudMetrics: React.FC<HudMetricsProps> = ({
  resources,
  netIncome = 18500,
  militaryUpkeep = 2400,
  defconLevel = 0,
  onNavigate,
}) => {
  const totalWorkforce = (resources.miners ?? 0) + (resources.lifers ?? 0);
  const totalMilitary = (resources.attackUnits ?? 0) + (resources.defenseUnits ?? 0) + (resources.superUnits ?? 0);

  const handleCardClick = (route: string) => {
    if (onNavigate) {
      sound.play('click');
      onNavigate(route);
    }
  };

  return (
    <div
      id="hud-metrics-grid"
      className="grid grid-cols-2 md:grid-cols-4 border border-[#dedede] bg-white divide-y md:divide-y-0 md:divide-x divide-[#dedede] shadow-2xs"
    >
      {/* 1. Net Colonial Revenue */}
      <div
        onClick={() => handleCardClick('income')}
        className="p-3 sm:p-4 hover:bg-neutral-50/80 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <TrendingUp size={12} className="text-emerald-600" />
            <span>Colonial Revenue</span>
          </span>
          <ChevronRight size={12} className="text-neutral-400 group-hover:text-emerald-600 transition-colors" />
        </div>
        <strong className="block text-xl sm:text-2xl font-bold tracking-tight text-[#111111] my-0.5 font-mono">
          +{netIncome.toLocaleString()}{' '}
          <span className="text-xs text-emerald-700 font-semibold">NQ/t</span>
        </strong>
        <div className="flex items-center justify-between text-[10px] text-[#777777] font-mono mt-1">
          <span>Gross yield - upkeep</span>
          <span className="text-emerald-700 font-bold group-hover:underline">View Mines →</span>
        </div>
      </div>

      {/* 2. Fleet Maintenance */}
      <div
        onClick={() => handleCardClick('military-stats')}
        className="p-3 sm:p-4 hover:bg-neutral-50/80 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <ShieldAlert size={12} className="text-rose-600" />
            <span>Fleet Maintenance</span>
          </span>
          <ChevronRight size={12} className="text-neutral-400 group-hover:text-rose-600 transition-colors" />
        </div>
        <strong className="block text-xl sm:text-2xl font-bold tracking-tight text-[#111111] my-0.5 font-mono">
          -{militaryUpkeep.toLocaleString()}{' '}
          <span className="text-xs text-rose-700 font-semibold">NQ/t</span>
        </strong>
        <div className="flex items-center justify-between text-[10px] text-[#777777] font-mono mt-1">
          <span>{totalMilitary.toLocaleString()} combat units</span>
          <span className="text-rose-700 font-bold group-hover:underline">Fleet Stats →</span>
        </div>
      </div>

      {/* 3. Workforce & Recruits */}
      <div
        onClick={() => handleCardClick('units')}
        className="p-3 sm:p-4 hover:bg-neutral-50/80 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <Users size={12} className="text-blue-600" />
            <span>Workforce & Recruits</span>
          </span>
          <ChevronRight size={12} className="text-neutral-400 group-hover:text-blue-600 transition-colors" />
        </div>
        <strong className="block text-xl sm:text-2xl font-bold tracking-tight text-[#111111] my-0.5 font-mono">
          {(resources.untrainedUnits ?? 0).toLocaleString()}{' '}
          <span className="text-xs text-blue-700 font-semibold">
            (+{resources.unitProduction ?? 10}/t)
          </span>
        </strong>
        <div className="flex items-center justify-between text-[10px] text-[#777777] font-mono mt-1">
          <span>{totalWorkforce.toLocaleString()} total miners</span>
          <span className="text-blue-700 font-bold group-hover:underline">Train Forces →</span>
        </div>
      </div>

      {/* 4. Imperial Bank Vault */}
      <div
        onClick={() => handleCardClick('bank-vault')}
        className="p-3 sm:p-4 hover:bg-neutral-50/80 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <Landmark size={12} className="text-amber-600" />
            <span>Bank Security Vault</span>
          </span>
          <ChevronRight size={12} className="text-neutral-400 group-hover:text-amber-600 transition-colors" />
        </div>
        <strong className="block text-xl sm:text-2xl font-bold tracking-tight text-[#111111] my-0.5 font-mono">
          {(resources?.bankedNaquadah ?? 0).toLocaleString()}{' '}
          <span className="text-xs text-amber-700 font-semibold">NQ</span>
        </strong>
        <div className="flex items-center justify-between text-[10px] text-[#777777] font-mono mt-1">
          <span>Protected from raids · 2% int</span>
          <span className="text-amber-700 font-bold group-hover:underline">Vault Access →</span>
        </div>
      </div>
    </div>
  );
};
