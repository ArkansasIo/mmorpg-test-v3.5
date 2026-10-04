import React, { useState } from 'react';
import { Users, Smile, ShieldAlert, Scale, Sparkles, Building, Landmark, ChevronRight, Award, Flame } from 'lucide-react';
import { sound } from '../../sound';
import { PlayerProfile, PlayerResources } from '../../types';

interface CivilizationViewProps {
  profile: PlayerProfile;
  resources: PlayerResources;
  onUpdateProfile: (updates: Partial<PlayerProfile>) => void;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
}

interface DemographicJob {
  id: string;
  name: string;
  count: number;
  outputLabel: string;
  happinessImpact: number;
  icon: string;
}

export const CivilizationView: React.FC<CivilizationViewProps> = ({
  profile,
  resources,
  onUpdateProfile,
  onUpdateResources,
}) => {
  const [activeTab, setActiveTab] = useState<'civilization' | 'population' | 'happiness'>('civilization');

  // Civilization Demographics State (Feature 19)
  const [demographics, setDemographics] = useState<DemographicJob[]>([
    { id: 'metallurgists', name: 'Alloy Metallurgists', count: 1850, outputLabel: '+3,700 Metal/hr', happinessImpact: 0, icon: '⚒' },
    { id: 'crystal_chemists', name: 'Silicon Refiners', count: 1200, outputLabel: '+2,400 Crystal/hr', happinessImpact: 0, icon: '💎' },
    { id: 'fusion_operators', name: 'Deuterium Chemists', count: 850, outputLabel: '+1,700 Deuterium/hr', happinessImpact: -2, icon: '⚛' },
    { id: 'research_scholars', name: 'Science Nexus Researchers', count: 620, outputLabel: '+930 Research Pts/hr', happinessImpact: +4, icon: '🔬' },
    { id: 'garrison_enforcers', name: 'Planetary Enforcers', count: 400, outputLabel: '-45% Crime Rate', happinessImpact: -5, icon: '🛡' },
    { id: 'cultural_entertainers', name: 'Holonet Artists & Entertainers', count: 280, outputLabel: '+18% Empire Happiness', happinessImpact: +8, icon: '🎭' },
  ]);

  // Happiness & Stability Parameters (Feature 20)
  const [happinessLevel, setHappinessLevel] = useState<number>(84); // 0-100%
  const [stabilityLevel, setStabilityLevel] = useState<number>(91); // 0-100%
  const [crimeRate, setCrimeRate] = useState<number>(6); // 0-100%

  // Empire Traditions (Feature 18)
  const [unlockedTraditions, setUnlockedTraditions] = useState<string[]>([
    'trad_expansion_1', 'trad_supremacy_1', 'trad_discovery_1'
  ]);

  const TRADITION_TREES = [
    {
      id: 'tree_discovery',
      name: 'Discovery & Enlightenment',
      icon: '🔭',
      description: 'Focuses on rapid research velocity, anomaly scanning, and planetary surveying.',
      nodes: [
        { id: 'trad_discovery_1', name: 'To Boldly Go', cost: 1500, perk: '+20% Science Output & Expedition Speed' },
        { id: 'trad_discovery_2', name: 'Polytechnic Education', cost: 3000, perk: '+15% Leader XP & Research Points' },
        { id: 'trad_discovery_3', name: 'Subspace Sensor Grid', cost: 6000, perk: '+50% Scanner Phalanx Range' },
      ],
    },
    {
      id: 'tree_supremacy',
      name: 'Supremacy & Fleet Warfare',
      icon: '⚔',
      description: 'Strengthens armada combat doctrine, reduces ship upkeep, and unlocks super weapons.',
      nodes: [
        { id: 'trad_supremacy_1', name: 'Master Shipwrights', cost: 1500, perk: '-15% Shipyard Build Time & Cost' },
        { id: 'trad_supremacy_2', name: 'Overwhelming Firepower', cost: 3000, perk: '+10% Fleet Weapon Damage' },
        { id: 'trad_supremacy_3', name: 'Unyielding Defense', cost: 6000, perk: '+25% Planetary Defense Dome HP' },
      ],
    },
    {
      id: 'tree_prosperity',
      name: 'Prosperity & Stellar Economy',
      icon: '🏛',
      description: 'Maximizes resource extraction, trade routes, and imperial vault capacity.',
      nodes: [
        { id: 'trad_prosperity_1', name: 'Standard Construction', cost: 1500, perk: '-20% Building Resource Cost' },
        { id: 'trad_prosperity_2', name: 'Interstellar Corridors', cost: 3000, perk: '+25% Market Trade Volume & Low Tax' },
        { id: 'trad_prosperity_3', name: 'Core Mineral Synthesis', cost: 6000, perk: '+30% Metal & Crystal Production' },
      ],
    },
  ];

  const handleAdoptTradition = (nodeId: string, cost: number) => {
    if (unlockedTraditions.includes(nodeId)) return;
    if ((resources.darkMatter || 0) + (resources.credits || 0) < cost && resources.naquadah < cost * 100) {
      alert('Insufficient imperial prestige or naquadah reserves to enact this tradition.');
      return;
    }
    sound.play('confirm');
    setUnlockedTraditions((prev) => [...prev, nodeId]);
    onUpdateResources({
      naquadah: Math.max(0, resources.naquadah - cost * 50),
    });
  };

  const handleAdjustWorker = (jobId: string, delta: number) => {
    sound.play('click');
    setDemographics((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, count: Math.max(0, job.count + delta) } : job))
    );
  };

  const handleTriggerHappinessEdict = (edict: string, costMetal: number, costDeut: number, hapBoost: number) => {
    if (resources.metal < costMetal || resources.deuterium < costDeut) {
      alert('Insufficient resources to subsidize this imperial edict.');
      return;
    }
    sound.play('confirm');
    onUpdateResources({
      metal: resources.metal - costMetal,
      deuterium: resources.deuterium - costDeut,
    });
    setHappinessLevel((prev) => Math.min(100, prev + hapBoost));
    setStabilityLevel((prev) => Math.min(100, prev + Math.round(hapBoost * 0.75)));
  };

  return (
    <div className="space-y-6" id="civilization-root">
      {/* Header */}
      <div className="p-6 bg-white border border-[#dedede] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#777777] uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4 text-[#111111]" />
            <span>FEATURES 18, 19 & 20 · CIVILIZATION, POPULATION & EMPIRE HAPPINESS</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Civilization & Population Governance</h1>
          <p className="text-xs text-[#555555] mt-1">
            Enact cultural traditions, manage planetary workforce demographics, and balance population happiness to maximize imperial production.
          </p>
        </div>

        {/* Global Stability Meter */}
        <div className="flex items-center gap-4 bg-[#fafafa] p-3 border border-[#dedede]">
          <div>
            <div className="text-[10px] font-mono text-[#777] uppercase">Imperial Stability</div>
            <div className="text-base font-bold text-[#111111]">{stabilityLevel}%</div>
          </div>
          <div className="h-8 w-px bg-[#ddd]" />
          <div>
            <div className="text-[10px] font-mono text-[#777] uppercase">Avg Happiness</div>
            <div className="text-base font-bold text-emerald-600">{happinessLevel}%</div>
          </div>
          <div className="h-8 w-px bg-[#ddd]" />
          <div>
            <div className="text-[10px] font-mono text-[#777] uppercase">Crime Rate</div>
            <div className="text-base font-bold text-blue-600">{crimeRate}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#dedede] bg-white px-4 pt-2 gap-2">
        <button
          onClick={() => { sound.play('click'); setActiveTab('civilization'); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer ${
            activeTab === 'civilization' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          Imperial Traditions & Ethics (Feature 18)
        </button>
        <button
          onClick={() => { sound.play('click'); setActiveTab('population'); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer ${
            activeTab === 'population' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          Workforce Demographics (Feature 19)
        </button>
        <button
          onClick={() => { sound.play('click'); setActiveTab('happiness'); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer ${
            activeTab === 'happiness' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          Planetary Happiness & Edicts (Feature 20)
        </button>
      </div>

      {/* Tab: Civilization Traditions */}
      {activeTab === 'civilization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRADITION_TREES.map((tree) => (
              <div key={tree.id} className="p-5 bg-white border border-[#dedede] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{tree.icon}</span>
                    <h3 className="text-sm font-bold text-[#111111]">{tree.name}</h3>
                  </div>
                  <p className="text-xs text-[#666] mb-4">{tree.description}</p>

                  <div className="space-y-3">
                    {tree.nodes.map((node, nIdx) => {
                      const isUnlocked = unlockedTraditions.includes(node.id);
                      return (
                        <div
                          key={node.id}
                          className={`p-3 border transition-colors ${
                            isUnlocked
                              ? 'border-emerald-500 bg-emerald-50/50'
                              : 'border-[#dedede] bg-[#fafafa]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                              {isUnlocked && <Award className="w-3.5 h-3.5 text-emerald-600" />}
                              Tier {nIdx + 1}: {node.name}
                            </span>
                            {isUnlocked ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 uppercase">
                                ADOPTED
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAdoptTradition(node.id, node.cost)}
                                className="px-2 py-0.5 bg-[#111111] text-white text-[10px] font-bold hover:bg-[#333] cursor-pointer"
                              >
                                ADOPT ({node.cost} pts)
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-[#555]">{node.perk}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Population Demographics */}
      {activeTab === 'population' && (
        <div className="p-6 bg-white border border-[#dedede] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111111]">Empire Population Allocation</h2>
              <p className="text-xs text-[#666]">
                Assign citizens across specialized labor strata to balance resource yields and social stability.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-[#111111] bg-[#fafafa] px-3 py-1.5 border border-[#dedede]">
              Total Workforce: {demographics.reduce((s, j) => s + j.count, 0).toLocaleString()} Pops
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demographics.map((job) => (
              <div key={job.id} className="p-4 border border-[#dedede] bg-[#fafafa]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base">{job.icon}</span>
                  <span className="text-sm font-bold font-mono text-[#111111]">{job.count.toLocaleString()} Pops</span>
                </div>
                <h3 className="text-xs font-bold text-[#111111]">{job.name}</h3>
                <p className="text-[11px] text-[#555] mt-1">{job.outputLabel}</p>
                <div className="flex items-center justify-between border-t border-[#eee] pt-3 mt-3">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleAdjustWorker(job.id, -50)}
                      className="w-7 h-7 bg-white border border-[#ccc] text-xs font-bold hover:bg-[#eee] cursor-pointer"
                    >
                      -50
                    </button>
                    <button
                      onClick={() => handleAdjustWorker(job.id, +50)}
                      className="w-7 h-7 bg-[#111111] text-white text-xs font-bold hover:bg-[#333] cursor-pointer"
                    >
                      +50
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-[#777]">
                    {job.happinessImpact >= 0 ? `+${job.happinessImpact}% Hap` : `${job.happinessImpact}% Hap`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Happiness & Edicts */}
      {activeTab === 'happiness' && (
        <div className="p-6 bg-white border border-[#dedede] space-y-6">
          <h2 className="text-base font-bold text-[#111111]">Imperial Social Welfare Edicts</h2>
          <p className="text-xs text-[#666]">
            Pass temporary emergency or cultural decrees to eliminate unrest and guarantee planetary loyalty.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-[#dedede] bg-[#fafafa] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#111111] mb-1">🎉 Galactic Festive Broadcasts</h3>
                <p className="text-xs text-[#555] mb-3">Air victory parades across the planetary holonet network.</p>
                <span className="text-xs font-mono font-bold text-emerald-600 block mb-3">+15% Happiness (30m)</span>
              </div>
              <button
                onClick={() => handleTriggerHappinessEdict('festive', 25000, 5000, 15)}
                className="w-full py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333] cursor-pointer"
              >
                Enact (25k M / 5k D)
              </button>
            </div>

            <div className="p-4 border border-[#dedede] bg-[#fafafa] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#111111] mb-1">🍞 Food & Nutrient Subsidies</h3>
                <p className="text-xs text-[#555] mb-3">Distribute hydro-farm rations to lower colony strata.</p>
                <span className="text-xs font-mono font-bold text-emerald-600 block mb-3">+10% Stability (1hr)</span>
              </div>
              <button
                onClick={() => handleTriggerHappinessEdict('food', 40000, 10000, 10)}
                className="w-full py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333] cursor-pointer"
              >
                Enact (40k M / 10k D)
              </button>
            </div>

            <div className="p-4 border border-[#dedede] bg-[#fafafa] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#111111] mb-1">🛡 Martial Law & Curfew</h3>
                <p className="text-xs text-[#555] mb-3">Deploy garrison mechs to enforce peace in rebellious sectors.</p>
                <span className="text-xs font-mono font-bold text-blue-600 block mb-3">-80% Crime / -10% Hap</span>
              </div>
              <button
                onClick={() => {
                  sound.play('confirm');
                  setCrimeRate((prev) => Math.max(1, prev - 15));
                  setStabilityLevel((prev) => Math.min(100, prev + 12));
                }}
                className="w-full py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333] cursor-pointer"
              >
                Declare Martial Law
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
