import React, { useState } from 'react';
import { User, Shield, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { sound } from '../../sound';
import { Government, PlayerProfile, Race } from '../../types';
import { GOVERNMENTS, RACES } from '../../gameData';

interface AccountViewProps {
  profile: PlayerProfile;
  onChangeRace: (raceId: string) => { success: boolean; message: string };
  onChangeGovernment: (govId: string) => { success: boolean; message: string };
  onToggleVacation: () => { success: boolean; message: string };
  onAscend: () => { success: boolean; message: string };
  onLogout?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  profile,
  onChangeRace,
  onChangeGovernment,
  onToggleVacation,
  onAscend,
  onLogout,
}) => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentRace = RACES.find((r) => r.id === profile.race);
  const currentGov = GOVERNMENTS.find((g) => g.id === profile.governmentId);

  const handleSelectRace = (raceId: string) => {
    const res = onChangeRace(raceId);
    if (res.success) {
      sound.play('confirm');
      setFeedback({ type: 'success', text: res.message });
    } else {
      sound.play('warning');
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleSelectGov = (govId: string) => {
    const res = onChangeGovernment(govId);
    if (res.success) {
      sound.play('confirm');
      setFeedback({ type: 'success', text: res.message });
    } else {
      sound.play('warning');
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleVacation = () => {
    const res = onToggleVacation();
    if (res.success) {
      sound.play('confirm');
      setFeedback({ type: 'success', text: res.message });
    }
  };

  const handleAscension = () => {
    const res = onAscend();
    if (res.success) {
      sound.play('success');
      setFeedback({ type: 'success', text: res.message });
    } else {
      sound.play('warning');
      setFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <div id="account-view" className="space-y-6">
      <div className="border border-[#dedede] bg-white p-6">
        <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
          REALM GOVERNANCE · CITIZEN DOCTRINE & SPECIES
        </div>
        <h2 className="text-2xl font-bold text-[#111111]">Race, Faction & Ascension</h2>
        <p className="text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
          Manage your civilization's racial traits, supreme governance doctrine, defensive sanctuary
          protocols, or undertake the sacred rite of Cosmic Ascension.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 border text-xs font-semibold flex justify-between items-center ${
            feedback.type === 'success'
              ? 'bg-[#fafafa] border-[#111111] text-[#111111] border-l-4'
              : 'bg-[#fff5f5] border-[#dc2626] text-[#dc2626] border-l-4'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Race Selector */}
      <div className="border border-[#dedede] bg-white p-6">
        <div className="border-b border-[#eeeeee] pb-4 mb-4">
          <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
            Sovereign Race Selection
          </h3>
          <p className="text-xs text-[#777777] mt-0.5">
            Active Race: <b className="text-[#111111]">{currentRace?.name}</b> ({currentRace?.bonusLabel})
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {RACES.map((r) => {
            const isSelected = profile.race === r.id;
            return (
              <div
                key={r.id}
                onClick={() => handleSelectRace(r.id)}
                className={`border p-4 cursor-pointer transition-colors flex flex-col justify-between ${
                  isSelected ? 'border-2 border-[#111111] bg-[#f9f9f9]' : 'border-[#dedede] hover:border-[#888888]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm font-bold text-[#111111]">{r.name}</strong>
                    {isSelected && <Check size={14} className="text-[#111111]" />}
                  </div>
                  <span className="text-[11px] font-bold text-[#111111] block mb-2">{r.bonusLabel}</span>
                  <p className="text-[11px] text-[#666666] leading-relaxed">{r.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#eeeeee] text-[10px] text-[#888888]">
                  Bank: {r.bankName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Government Doctrine */}
      <div className="border border-[#dedede] bg-white p-6">
        <div className="border-b border-[#eeeeee] pb-4 mb-4">
          <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
            Governance Structure
          </h3>
          <p className="text-xs text-[#777777] mt-0.5">
            Active Doctrine: <b className="text-[#111111]">{currentGov?.name}</b>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GOVERNMENTS.map((gov) => {
            const isSelected = profile.governmentId === gov.id;
            return (
              <div
                key={gov.id}
                onClick={() => handleSelectGov(gov.id)}
                className={`border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected ? 'border-2 border-[#111111] bg-[#f9f9f9] shadow-xs' : 'border-[#dedede] hover:border-[#888888] bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{gov.icon || '🏛️'}</span>
                      <strong className="text-xs font-bold text-[#111111] uppercase tracking-wide">{gov.name}</strong>
                    </div>
                    {isSelected && <Check size={14} className="text-[#111111]" />}
                  </div>
                  <p className="text-xs text-[#666666] mb-2">{gov.description}</p>
                  {gov.specialPerk && (
                    <div className="p-1.5 bg-amber-50 border border-amber-200 text-[10px] text-amber-900 mb-2">
                      ⭐ {gov.specialPerk}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] bg-white border border-[#eeeeee] p-1.5 text-center font-mono">
                  <span>Econ: ×{gov.economyModifier}</span>
                  <span>Fleet: ×{gov.militaryModifier}</span>
                  <span>Labs: ×{gov.researchModifier}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vacation & Ascension Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vacation Mode */}
        <div className="border border-[#dedede] bg-white p-6 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#eeeeee] pb-3">
            <Shield size={18} className="text-[#111111]" />
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              Vacation Shielding
            </h3>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Placing your realm in Vacation Mode creates an absolute stargate quarantine. Rival commanders
            cannot attack or spy on you, and your turns freeze until deactivated.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleVacation}
              className={`w-full py-2.5 text-xs font-bold uppercase transition-colors ${
                profile.vacationUntil
                  ? 'bg-[#111111] text-white hover:bg-[#333333]'
                  : 'border border-[#111111] text-[#111111] hover:bg-[#f5f5f5]'
              }`}
            >
              {profile.vacationUntil ? 'Quarantine Active (Click to Disengage)' : 'Enter Vacation Mode →'}
            </button>
          </div>
        </div>

        {/* Ascension Rite */}
        <div className="border border-[#dedede] bg-white p-6 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#eeeeee] pb-3">
            <Sparkles size={18} className="text-[#111111]" />
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              Higher Plain Ascension
            </h3>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Ascend into pure energy form like the Ancients. Requires 1,000+ Glory and 500+ Reputation.
            Ascending permanently brands your realm as an Ancient Ascended entity with cosmic privileges.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAscension}
              disabled={profile.ascended}
              className="w-full py-2.5 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {profile.ascended ? 'Realm Already Ascended ★' : 'Commence Ascension Rite →'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Logout Card */}
      {onLogout && (
        <div className="border border-[#dedede] bg-[#fafafa] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">Session & Account Control</h3>
            <p className="text-xs text-[#666666] mt-0.5">
              Securely terminate your current session and return to the MMORPG Title Screen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.play('warning');
              onLogout();
            }}
            className="px-6 py-2.5 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-500 transition-colors cursor-pointer"
          >
            Log Out Commander →
          </button>
        </div>
      )}
    </div>
  );
};
