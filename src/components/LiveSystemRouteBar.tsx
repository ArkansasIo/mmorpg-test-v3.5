import React from 'react';
import { Globe, Pickaxe, Coins, Atom, Wrench, Rocket, Swords, Crown, ChevronRight, Activity, GraduationCap } from 'lucide-react';
import { sound } from '../sound';

interface LiveSystemRouteBarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export const LiveSystemRouteBar: React.FC<LiveSystemRouteBarProps> = ({ activeRoute, onNavigate }) => {
  const STEPS = [
    { id: 'overview', label: '1. Planet', icon: Globe, route: 'dashboard' },
    { id: 'buildings', label: '2. Production', icon: Pickaxe, route: 'factories' },
    { id: 'resources', label: '3. Resources', icon: Coins, route: 'resources' },
    { id: 'research', label: '4. Research', icon: Atom, route: 'tech-tree' },
    { id: 'shipyard', label: '5. Shipyard', icon: Wrench, route: 'shipyard' },
    { id: 'workforce', label: '6. Academy', icon: GraduationCap, route: 'workforce-academy' },
    { id: 'fleet', label: '7. Fleet', icon: Rocket, route: 'targets' },
    { id: 'combat', label: '8. Combat', icon: Swords, route: 'combat' },
    { id: 'universe', label: '9. Expansion', icon: Crown, route: 'universe' },
  ];

  return (
    <div
      className="bg-[#fafafa] border-b border-[#dedede] px-3 sm:px-4 py-2 flex items-center justify-between overflow-x-auto no-scrollbar scroll-smooth gap-3 text-xs font-mono select-none"
      id="live-system-route-bar"
    >
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mr-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>EMPIRE CYCLE:</span>
        </span>
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive =
            activeRoute === step.route ||
            (step.id === 'overview' && (activeRoute === 'dashboard' || activeRoute === 'overview')) ||
            (step.id === 'buildings' && (activeRoute === 'factories' || activeRoute === 'buildings')) ||
            (step.id === 'resources' && activeRoute === 'resources') ||
            (step.id === 'research' && (activeRoute === 'tech-tree' || activeRoute === 'research')) ||
            (step.id === 'shipyard' && activeRoute === 'shipyard') ||
            (step.id === 'workforce' && (activeRoute === 'workforce-academy' || activeRoute === 'academy-enlistment' || activeRoute === 'workforce-roster' || activeRoute === 'academy-wings' || activeRoute === 'academy-drills')) ||
            (step.id === 'fleet' && (activeRoute === 'targets' || activeRoute === 'fleet')) ||
            (step.id === 'combat' && (activeRoute === 'combat' || activeRoute === 'attack-log')) ||
            (step.id === 'universe' && (activeRoute === 'universe' || activeRoute === 'galaxy'));

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => {
                  sound.play('click');
                  onNavigate(step.route);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-xs transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#111111] text-amber-400 border-[#111111] shadow-2xs'
                    : 'bg-white text-[#555555] border-[#e0e0e0] hover:bg-[#eaeaea] hover:text-[#111111] hover:border-[#cccccc]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-[#777777]'}`} />
                <span>{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-3 h-3 text-[#bbbbbb] shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="hidden lg:flex items-center gap-2 text-[10px] text-[#777777] font-mono shrink-0">
        <Activity size={12} className="text-emerald-500 animate-pulse" />
        <span>SYS CLOCK: 6 TURNS/MIN</span>
      </div>
    </div>
  );
};
