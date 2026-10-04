import React, { useState } from 'react';
import { Handshake, Globe2, ShieldCheck, Swords, Send, ScrollText, Users, Building2, ChevronRight, Award } from 'lucide-react';
import { sound } from '../../sound';
import { PlayerProfile, PlayerResources } from '../../types';

interface DiplomacyViewProps {
  profile: PlayerProfile;
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
  onNavigate: (route: string) => void;
}

interface DiplomaticFaction {
  id: string;
  name: string;
  leader: string;
  race: string;
  relationStatus: 'Hostile' | 'Cold War' | 'Neutral' | 'Cordial' | 'Allied';
  relationScore: number; // -100 to +100
  pacts: string[];
  powerRating: number;
  description: string;
}

export const DiplomacyView: React.FC<DiplomacyViewProps> = ({
  profile,
  resources,
  onUpdateResources,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'factions' | 'treaties' | 'federation'>('factions');

  const [factions, setFactions] = useState<DiplomaticFaction[]>([
    {
      id: 'asgard_high_council',
      name: 'High Council of Othala',
      leader: 'Supreme Commander Thor',
      race: 'Asgard',
      relationStatus: 'Cordial',
      relationScore: 75,
      pacts: ['Non-Aggression Pact', 'Scientific Exchange Protocol'],
      powerRating: 98000,
      description: 'Advanced benevolent precursors providing scientific research subsidies in exchange for naquadah.',
    },
    {
      id: 'lucian_alliance_cartel',
      name: 'Lucian Space Syndicate',
      leader: 'Netan of Ko-Rath',
      race: 'Tau\'ri / Mercenary',
      relationStatus: 'Hostile',
      relationScore: -85,
      pacts: [],
      powerRating: 64000,
      description: 'Aggressive warlord syndicate frequently raiding outer mineral outposts and transport freighters.',
    },
    {
      id: 'tokra_resistance',
      name: 'Tok\'ra Covert High Directorate',
      leader: 'Garshaw of Belote',
      race: 'Goa\'uld Symbiote',
      relationStatus: 'Allied',
      relationScore: 92,
      pacts: ['Defensive Coalition', 'Espionage Data Link', 'Trade Agreement'],
      powerRating: 42000,
      description: 'Underground resistance sharing invaluable counter-intelligence and sabotage coordinates.',
    },
    {
      id: 'tollan_curia',
      name: 'Tollan Planetary Curia',
      leader: 'High Chancellor Travell',
      race: 'Tollan',
      relationStatus: 'Neutral',
      relationScore: 15,
      pacts: ['Trade Agreement'],
      powerRating: 88000,
      description: 'Isolationist technocracy possessing impervious planetary ion cannons and phase-shift tech.',
    },
  ]);

  const [federationVault, setFederationVault] = useState<{ metal: number; crystal: number; deuterium: number }>({
    metal: 1250000,
    crystal: 820000,
    deuterium: 410000,
  });

  const handleImproveRelations = (factionId: string) => {
    sound.play('confirm');
    setFactions((prev) =>
      prev.map((f) => {
        if (f.id === factionId) {
          const newScore = Math.min(100, f.relationScore + 15);
          const newStatus =
            newScore >= 80 ? 'Allied' : newScore >= 40 ? 'Cordial' : newScore >= -20 ? 'Neutral' : newScore >= -60 ? 'Cold War' : 'Hostile';
          return { ...f, relationScore: newScore, relationStatus: newStatus };
        }
        return f;
      })
    );
  };

  const handleSignPact = (factionId: string, pactName: string) => {
    sound.play('confirm');
    setFactions((prev) =>
      prev.map((f) => {
        if (f.id === factionId && !f.pacts.includes(pactName)) {
          return { ...f, pacts: [...f.pacts, pactName], relationScore: Math.min(100, f.relationScore + 10) };
        }
        return f;
      })
    );
  };

  const handleContributeVault = (metalAmt: number, crystalAmt: number, deutAmt: number) => {
    if (resources.metal < metalAmt || resources.crystal < crystalAmt || resources.deuterium < deutAmt) {
      alert('Insufficient resources to deposit into Federation Vault.');
      return;
    }
    sound.play('confirm');
    onUpdateResources({
      metal: resources.metal - metalAmt,
      crystal: resources.crystal - crystalAmt,
      deuterium: resources.deuterium - deutAmt,
    });
    setFederationVault((prev) => ({
      metal: prev.metal + metalAmt,
      crystal: prev.crystal + crystalAmt,
      deuterium: prev.deuterium + deutAmt,
    }));
  };

  return (
    <div className="space-y-6" id="diplomacy-root">
      {/* Header */}
      <div className="p-6 bg-white border border-[#dedede] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#777777] uppercase tracking-wider mb-1">
            <Handshake className="w-4 h-4 text-[#111111]" />
            <span>FEATURES 21 & 22 · DIPLOMACY, TREATIES & ALLIANCE FEDERATIONS</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Galactic Diplomacy & Treaties</h1>
          <p className="text-xs text-[#555555] mt-1">
            Form diplomatic coalitions, sign bilateral research pacts, manage ambassadorial envoys, and fund the shared Federation vault.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('alliances')}
            className="px-4 py-2 border border-[#111111] text-xs font-bold uppercase hover:bg-[#fafafa] cursor-pointer"
          >
            Alliance Roster
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#dedede] bg-white px-4 pt-2 gap-2">
        <button
          onClick={() => { sound.play('click'); setActiveTab('factions'); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer ${
            activeTab === 'factions' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          Foreign Embassies & Factions (Feature 21)
        </button>
        <button
          onClick={() => { sound.play('click'); setActiveTab('treaties'); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer ${
            activeTab === 'treaties' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          Active Bilateral Treaties
        </button>
        <button
          onClick={() => { sound.play('click'); setActiveTab('federation'); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer ${
            activeTab === 'federation' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          Federation Vault & Armada (Feature 22)
        </button>
      </div>

      {/* Tab: Foreign Embassies */}
      {activeTab === 'factions' && (
        <div className="space-y-4">
          {factions.map((f) => (
            <div key={f.id} className="p-5 bg-white border border-[#dedede] flex flex-col lg:flex-row justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-[#111111]">{f.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs ${
                      f.relationStatus === 'Allied'
                        ? 'bg-emerald-100 text-emerald-800'
                        : f.relationStatus === 'Cordial'
                        ? 'bg-blue-100 text-blue-800'
                        : f.relationStatus === 'Neutral'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {f.relationStatus} ({f.relationScore > 0 ? `+${f.relationScore}` : f.relationScore})
                  </span>
                </div>
                <div className="text-xs text-[#666]">
                  <strong>Leader:</strong> {f.leader} · <strong>Species:</strong> {f.race} · <strong>Military Index:</strong> {f.powerRating.toLocaleString()}
                </div>
                <p className="text-xs text-[#555]">{f.description}</p>

                {/* Active Pacts */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {f.pacts.length > 0 ? (
                    f.pacts.map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-[#f0f0f0] text-[10px] font-mono text-[#333] border border-[#ddd]">
                        ✓ {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#999] italic">No active treaties signed.</span>
                  )}
                </div>
              </div>

              {/* Diplomatic Actions */}
              <div className="flex flex-col justify-center gap-2 min-w-[200px]">
                <button
                  onClick={() => handleImproveRelations(f.id)}
                  className="px-3 py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch Envoy (+15)
                </button>
                <button
                  onClick={() => handleSignPact(f.id, 'Trade Agreement')}
                  className="px-3 py-1.5 border border-[#ccc] text-xs font-bold text-[#333] hover:bg-[#fafafa] cursor-pointer"
                >
                  Propose Trade Pact
                </button>
                <button
                  onClick={() => handleSignPact(f.id, 'Scientific Exchange Protocol')}
                  className="px-3 py-1.5 border border-[#ccc] text-xs font-bold text-[#333] hover:bg-[#fafafa] cursor-pointer"
                >
                  Propose Research Pact
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Treaties */}
      {activeTab === 'treaties' && (
        <div className="p-6 bg-white border border-[#dedede] space-y-4">
          <h2 className="text-base font-bold text-[#111111]">Active Bilateral Treaties & Galactic Accords</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-[#dedede] bg-[#fafafa]">
              <h3 className="text-xs font-bold text-[#111111] mb-1">📜 Tau\'ri - Asgard Scientific Concordat</h3>
              <p className="text-xs text-[#555] mb-3">Both realms share physics telemetry and hyperspace telemetry.</p>
              <span className="text-xs font-mono font-bold text-emerald-600">+25% Lab Research Speed</span>
            </div>
            <div className="p-4 border border-[#dedede] bg-[#fafafa]">
              <h3 className="text-xs font-bold text-[#111111] mb-1">🛡 Tok\'ra Anti-Goa\'uld Coalition</h3>
              <p className="text-xs text-[#555] mb-3">Mutual defense treaty against System Lord mothership incursions.</p>
              <span className="text-xs font-mono font-bold text-blue-600">+30% Infiltration Counter-Spies</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Federation Vault */}
      {activeTab === 'federation' && (
        <div className="p-6 bg-white border border-[#dedede] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111111]">Alliance Federation Shared Vault</h2>
              <p className="text-xs text-[#666]">
                Pooled collective stockpile used to fund alliance megastructures and emergency relief armadas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-[#dedede] bg-[#fafafa]">
              <span className="text-[10px] font-mono text-[#777] uppercase">Vault Metal Stock</span>
              <div className="text-xl font-bold text-[#111111] mt-1">{federationVault.metal.toLocaleString()} M</div>
            </div>
            <div className="p-4 border border-[#dedede] bg-[#fafafa]">
              <span className="text-[10px] font-mono text-[#777] uppercase">Vault Crystal Stock</span>
              <div className="text-xl font-bold text-[#111111] mt-1">{federationVault.crystal.toLocaleString()} C</div>
            </div>
            <div className="p-4 border border-[#dedede] bg-[#fafafa]">
              <span className="text-[10px] font-mono text-[#777] uppercase">Vault Deuterium Stock</span>
              <div className="text-xl font-bold text-[#111111] mt-1">{federationVault.deuterium.toLocaleString()} D</div>
            </div>
          </div>

          <div className="p-4 border border-[#dedede] bg-[#fafafa]">
            <h3 className="text-xs font-bold text-[#111111] uppercase mb-3">Deposit Resources to Alliance Vault</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleContributeVault(50000, 25000, 10000)}
                className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333] cursor-pointer"
              >
                Deposit 50k M / 25k C / 10k D
              </button>
              <button
                onClick={() => handleContributeVault(200000, 100000, 50000)}
                className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333] cursor-pointer"
              >
                Deposit 200k M / 100k C / 50k D
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
