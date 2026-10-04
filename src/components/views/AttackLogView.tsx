import React from 'react';
import { Swords, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { BattleRecord } from '../../types';

interface AttackLogViewProps {
  battles: BattleRecord[];
  onNavigate: (route: string) => void;
}

export const AttackLogView: React.FC<AttackLogViewProps> = ({ battles, onNavigate }) => {
  return (
    <div id="attack-log-view" className="space-y-6">
      <div className="border border-[#dedede] bg-white p-6">
        <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
          MILITARY WAR RECORD · COMBAT ENGAGEMENTS
        </div>
        <h2 className="text-2xl font-bold text-[#111111]">Attack & Campaign Log</h2>
        <p className="text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
          Historical log of all fleet operations, planetary invasions, and resource raids executed across the
          stargate network. Review casualties and booty seized.
        </p>
      </div>

      <div className="border border-[#dedede] bg-white p-6">
        <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4 mb-4">
          <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
            Combat Engagement Archives
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('targets')}
            className="text-xs font-bold text-[#111111] hover:underline"
          >
            Launch Target Operation →
          </button>
        </div>

        {battles.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#777777]">
            <Swords size={28} className="mx-auto text-[#cccccc] mb-2" />
            No battle operations recorded. Select a target from the Attack menu to initiate a campaign.
          </div>
        ) : (
          <div className="divide-y divide-[#eeeeee]">
            {battles.map((b) => (
              <div key={b.id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {b.victory ? (
                      <CheckCircle2 size={18} className="text-[#111111]" />
                    ) : (
                      <AlertCircle size={18} className="text-[#dc2626]" />
                    )}
                    <strong className="text-sm font-bold text-[#111111]">
                      {b.action === 'attack' ? 'Invasion of' : 'Raid on'} {b.targetName}
                    </strong>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                        b.victory
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#fee2e2] text-[#dc2626]'
                      }`}
                    >
                      {b.victory ? 'Victory' : 'Defeat'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#888888]">{b.timestamp}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#fafafa] border border-[#dedede] p-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#777777] block uppercase font-bold">Turns Spent</span>
                    <b className="font-mono text-[#111111]">{b.turnsSpent} Turns</b>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777777] block uppercase font-bold">Naquadah Plundered</span>
                    <b className="font-mono text-[#111111]">+{b.loot.toLocaleString()} NQ</b>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777777] block uppercase font-bold">Your Casualties</span>
                    <b className="font-mono text-[#dc2626]">-{b.attackerCasualties.toLocaleString()} troops</b>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777777] block uppercase font-bold">Enemy Casualties</span>
                    <b className="font-mono text-[#111111]">-{b.defenderCasualties.toLocaleString()} troops</b>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-[#777777]">
                  <span>Attacker Score: {b.attackerScore.toLocaleString()}</span>
                  <span>Defender Score: {b.defenderScore.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
