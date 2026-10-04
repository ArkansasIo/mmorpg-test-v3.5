import React from 'react';
import { Award, Info, Sparkles, Terminal, Settings } from 'lucide-react';
import { sound } from '../sound';

interface FooterProps {
  onNavigate?: (route: string) => void;
  onOpenPatchNotes?: () => void;
  onOpenUpdateInfo?: () => void;
  onOpenCredits?: () => void;
  onOpenSaveManager?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenPatchNotes,
  onOpenUpdateInfo,
  onOpenCredits,
  onOpenSaveManager,
}) => {
  const handleOpenCredits = () => {
    sound.play('click');
    if (onOpenCredits) {
      onOpenCredits();
    } else if (onNavigate) {
      onNavigate('dev-credits');
    }
  };

  const handleOpenUpdate = () => {
    sound.play('click');
    if (onOpenUpdateInfo) {
      onOpenUpdateInfo();
    } else if (onOpenPatchNotes) {
      onOpenPatchNotes();
    }
  };

  const handleOpenPatch = () => {
    sound.play('click');
    if (onOpenPatchNotes) {
      onOpenPatchNotes();
    }
  };

  return (
    <footer
      id="app-footer"
      className="border-t border-[#dedede] bg-white px-4 sm:px-8 py-3 sm:py-3.5 pb-safe flex flex-col lg:flex-row items-center justify-between text-xs text-[#666666] shrink-0 gap-3"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 font-mono font-bold text-[#111111]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>UNIVERSE CIVILIZATION: STELLAR DOMINION</span>
        </div>
        <span className="text-[#cccccc] hidden sm:inline">|</span>
        <span className="font-mono text-[11px] text-[#777777]">
          VER: <strong className="text-[#111111]">v3.5.0-RELEASE</strong>
        </span>
        <span className="text-[#cccccc] hidden sm:inline">|</span>
        <span className="font-mono text-[11px] text-[#777777] hidden sm:inline">
          BUILD: <strong className="text-[#111111]">#60-SYSTEMS-SYNCED</strong>
        </span>
        <span className="text-[#cccccc] hidden md:inline">|</span>
        <span className="font-mono text-[11px] text-[#777777] hidden md:inline">
          UID: <strong className="text-[#111111]">UC-88942-X9</strong>
        </span>
      </div>

      {/* Bottom Right Side Header: Development Team Credit beside Update Info and Patch Info */}
      <div className="flex items-center gap-2 sm:gap-3 font-medium flex-wrap justify-end">
        {/* 0. Account Settings */}
        <button
          type="button"
          id="footer-account-settings-btn"
          onClick={() => {
            sound.play('click');
            if (onNavigate) onNavigate('account-settings');
          }}
          className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 hover:border-[#111111] text-[#222222] font-semibold cursor-pointer text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-2xs"
          title="Open Account Settings & Commander Preferences"
        >
          <Settings size={12} className="text-neutral-700" />
          <span>Account Settings</span>
        </button>

        {/* 1. Development Team Credit */}
        <button
          type="button"
          id="footer-dev-credits-btn"
          onClick={handleOpenCredits}
          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 hover:border-amber-500 text-amber-950 font-bold cursor-pointer text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-2xs group"
          title="View full Development Team Credits (Lead Creator: Stephen)"
        >
          <Award size={13} className="text-amber-600 group-hover:scale-110 transition-transform" />
          <span>Dev Team Credit: <strong className="text-[#111111]">Stephen</strong></span>
        </button>

        {/* 2. Update Info */}
        <button
          type="button"
          id="footer-update-info-btn"
          onClick={handleOpenUpdate}
          className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 hover:border-[#111111] text-[#222222] font-semibold cursor-pointer text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-2xs"
          title="View Version 3.5.0 Master Update Information"
        >
          <Info size={12} className="text-cyan-700" />
          <span>Update Info</span>
          <span className="text-[9px] bg-cyan-100 text-cyan-900 px-1 py-0.2 font-bold">v3.5</span>
        </button>

        {/* 3. Patch Info */}
        <button
          type="button"
          id="footer-patch-info-btn"
          onClick={handleOpenPatch}
          className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 hover:border-[#111111] text-[#222222] font-semibold cursor-pointer text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-2xs"
          title="View Master Patch Notes & Changelog"
        >
          <Sparkles size={12} className="text-amber-600" />
          <span>Patch Info</span>
        </button>

        <span className="text-[#dddddd] hidden lg:inline">|</span>

        {onOpenSaveManager && (
          <button
            type="button"
            onClick={onOpenSaveManager}
            className="hover:text-[#111111] underline cursor-pointer text-[11px] font-mono"
          >
            Save Vault
          </button>
        )}
        {onNavigate && (
          <>
            <button
              type="button"
              onClick={() => onNavigate('codex-doc')}
              className="hover:text-[#111111] underline cursor-pointer text-[11px] font-mono hidden sm:inline"
            >
              Strategy Codex
            </button>
            <button
              type="button"
              onClick={() => onNavigate('cron-jobs')}
              className="hover:text-[#111111] underline cursor-pointer text-[11px] font-mono hidden sm:inline"
            >
              Server Cron
            </button>
          </>
        )}
      </div>
    </footer>
  );
};
