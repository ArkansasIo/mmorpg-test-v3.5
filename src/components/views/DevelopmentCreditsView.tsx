import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Crown,
  Sparkles,
  Users,
  Code,
  Heart,
  Terminal,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rocket,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  Cpu,
  Bookmark,
  Compass,
  Star,
  Zap,
} from 'lucide-react';
import { sound } from '../../sound';
import {
  DEVELOPMENT_TEAM_CREDITS,
  SPECIAL_INSPIRATIONS_THANKS,
  DEVELOPMENT_TECH_STACK,
  DEVELOPMENT_HISTORY_LOG,
  TeamMember,
} from '../../data/developmentCreditsData';

interface DevelopmentCreditsViewProps {
  onNavigate?: (route: string) => void;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const DevelopmentCreditsView: React.FC<DevelopmentCreditsViewProps> = ({
  onNavigate,
  isModal,
  onCloseModal,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'inspirations' | 'tech' | 'milestones'>('roster');
  const [isCineRollActive, setIsCineRollActive] = useState(false);
  const [cineSpeed, setCineSpeed] = useState<number>(1);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const cineContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroller for Cine-Roll Mode
  useEffect(() => {
    let animationFrameId: number;
    if (isCineRollActive && cineContainerRef.current) {
      const scrollStep = () => {
        if (cineContainerRef.current) {
          cineContainerRef.current.scrollTop += 1 * cineSpeed;
          // Check if reached bottom
          if (
            cineContainerRef.current.scrollTop + cineContainerRef.current.clientHeight >=
            cineContainerRef.current.scrollHeight - 5
          ) {
            // Loop back to top after a brief delay
            cineContainerRef.current.scrollTop = 0;
          }
        }
        animationFrameId = requestAnimationFrame(scrollStep);
      };
      animationFrameId = requestAnimationFrame(scrollStep);
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isCineRollActive, cineSpeed]);

  return (
    <div id="development-credits-view" className="space-y-6 font-mono text-[#111111]">
      {/* Top Banner & Header */}
      <div className="border-2 border-[#111111] bg-white p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#111111] text-amber-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Award size={12} />
                DEVELOPMENT TEAM CREDITS · CORE ARCHITECTS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-[#111111] border border-[#dedede]">
                Version 2.5.0 · Build #9825-OG
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight uppercase">
              Universe Civilization: Empire at Wars
            </h1>
            <p className="text-xs text-[#555555] max-w-3xl leading-relaxed">
              Honoring the architects, engineers, designers, and creative minds who envisioned and built this browser-based space 4X strategy engine.
            </p>
          </div>

          {/* Lead Developer Spotlight Pill */}
          <div className="p-4 bg-amber-50/80 border-2 border-amber-400 min-w-[280px] space-y-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="text-[10px] font-extrabold uppercase text-amber-900 flex items-center gap-1.5">
                <Crown size={13} className="text-amber-600" />
                Lead Creator & Architect
              </span>
              <span className="text-lg">🚀</span>
            </div>
            <div>
              <div className="text-base font-black text-[#111111]">Stephen</div>
              <div className="text-[11px] text-amber-800 font-bold mt-0.5">
                Game Director & Principal Systems Architect
              </div>
            </div>
            <div className="text-[10px] text-[#555555] italic">
              Engineered the core game systems, 90-class roster, 9 governments, Stargate dialing network, and 90 galaxies atlas.
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-[#eee]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                setIsCineRollActive(!isCineRollActive);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                isCineRollActive
                  ? 'bg-amber-400 text-black border-amber-500 font-extrabold shadow-xs'
                  : 'bg-[#111111] text-white hover:bg-neutral-800 border-[#111111]'
              }`}
            >
              {isCineRollActive ? <Pause size={13} /> : <Play size={13} />}
              <span>{isCineRollActive ? 'Pause Cine-Roll' : '🎬 Roll Cine-Credits'}</span>
            </button>

            {isCineRollActive && (
              <div className="flex items-center gap-1 bg-neutral-100 p-1 border border-[#dedede] text-xs">
                <span className="text-[10px] uppercase font-bold text-[#777777] px-1">Speed:</span>
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => {
                      sound.play('click');
                      setCineSpeed(spd);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase cursor-pointer ${
                      cineSpeed === spd ? 'bg-[#111111] text-white' : 'text-[#666666] hover:text-[#111111]'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    if (cineContainerRef.current) cineContainerRef.current.scrollTop = 0;
                  }}
                  className="px-2 py-0.5 text-[10px] font-bold uppercase text-[#666666] hover:text-[#111111] cursor-pointer"
                  title="Rewind to top"
                >
                  <RotateCcw size={10} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  sound.play('click');
                  onNavigate('dashboard');
                }}
                className="px-3 py-1.5 border border-[#dedede] bg-white hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider text-[#111111] cursor-pointer"
              >
                ← Back to Command Center
              </button>
            )}
            {isModal && onCloseModal && (
              <button
                type="button"
                onClick={() => {
                  sound.play('click');
                  onCloseModal();
                }}
                className="px-3 py-1.5 bg-[#111111] text-white text-xs font-bold uppercase cursor-pointer"
              >
                Close ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cine-Roll Overlay View (If active) */}
      {isCineRollActive && (
        <div className="border-2 border-amber-400 bg-[#09090b] text-neutral-100 p-6 shadow-2xl relative">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest">
              <Sparkles size={14} />
              CINEMATIC CREDITS ROLLER ACTIVE
            </span>
            <span>Auto-Scrolling at {cineSpeed}x Speed</span>
          </div>

          <div
            ref={cineContainerRef}
            className="h-96 overflow-y-auto pr-4 space-y-12 text-center select-none font-mono scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div className="pt-8 space-y-3">
              <div className="text-3xl font-black tracking-widest uppercase text-white">
                UNIVERSE CIVILIZATION
              </div>
              <div className="text-sm font-bold tracking-widest text-amber-400 uppercase">
                EMPIRE AT WARS
              </div>
              <p className="text-xs text-neutral-400 max-w-lg mx-auto leading-relaxed">
                An authentic browser MMORPG space strategy simulation built for Universe Civilization: Empire at War, featuring Stargate, EVE Online, and classic 4X galactic empires.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-xs uppercase tracking-widest text-amber-500 font-bold">
                Created, Directed & Engineered By
              </div>
              <div className="text-2xl font-black text-white">Stephen</div>
              <div className="text-xs text-neutral-400">Lead Systems Architect & Full-Stack Engineer</div>
            </div>

            {DEVELOPMENT_TEAM_CREDITS.map((cat) => (
              <div key={cat.id} className="space-y-6 pt-4">
                <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold border-b border-neutral-800 pb-2 max-w-md mx-auto">
                  {cat.categoryName}
                </div>
                <div className="space-y-6">
                  {cat.members.map((member) => (
                    <div key={member.id} className="space-y-1">
                      <div className="text-base font-bold text-neutral-200">{member.name}</div>
                      <div className="text-xs text-amber-400/90 font-bold">{member.role}</div>
                      <div className="text-[11px] text-neutral-400 max-w-md mx-auto">{member.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-4 pt-6">
              <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold border-b border-neutral-800 pb-2 max-w-md mx-auto">
                Special Thanks & Canonical Inspirations
              </div>
              {SPECIAL_INSPIRATIONS_THANKS.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <div className="text-[11px] text-neutral-400 max-w-md mx-auto">{item.description}</div>
                </div>
              ))}
            </div>

            <div className="py-12 space-y-2">
              <div className="text-xs text-neutral-500">Thank you for commanding among the stars.</div>
              <div className="text-[10px] text-neutral-600">All glyphs locked. Universe online.</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#dedede] bg-white px-4 pt-2 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            sound.play('click');
            setActiveTab('roster');
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'roster'
              ? 'border-[#111111] text-[#111111] bg-neutral-50 font-black'
              : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Users size={14} />
          <span>Core Development Team</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.play('click');
            setActiveTab('inspirations');
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'inspirations'
              ? 'border-[#111111] text-[#111111] bg-neutral-50 font-black'
              : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Heart size={14} />
          <span>Special Thanks & Inspirations</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.play('click');
            setActiveTab('tech');
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'tech'
              ? 'border-[#111111] text-[#111111] bg-neutral-50 font-black'
              : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Code size={14} />
          <span>Engine & Tech Stack</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.play('click');
            setActiveTab('milestones');
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'milestones'
              ? 'border-[#111111] text-[#111111] bg-neutral-50 font-black'
              : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Bookmark size={14} />
          <span>Release Milestones</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CORE DEVELOPMENT TEAM ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="space-y-8">
          {DEVELOPMENT_TEAM_CREDITS.map((category) => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-[#111111] pb-2">
                <span className="text-xl">{category.icon}</span>
                <div>
                  <h2 className="text-sm font-black uppercase text-[#111111] tracking-wide">
                    {category.categoryName}
                  </h2>
                  <p className="text-[11px] text-[#666666]">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.members.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`p-5 bg-white border-2 transition-all flex flex-col justify-between space-y-4 cursor-pointer relative ${
                      member.id === 'stephen'
                        ? 'border-amber-400 ring-1 ring-amber-300 shadow-md bg-amber-50/20'
                        : 'border-[#dedede] hover:border-[#111111]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 bg-neutral-100 border border-[#dedede]">
                            {member.avatar}
                          </span>
                          <div>
                            <div className="text-[9px] font-bold uppercase text-[#777777]">
                              {member.division}
                            </div>
                            <h3 className="text-base font-black text-[#111111] tracking-tight">
                              {member.name}
                            </h3>
                          </div>
                        </div>

                        {member.socialBadge && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-400 text-black shrink-0">
                            {member.socialBadge}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-indigo-950 mb-2">
                        {member.role}
                      </div>

                      <p className="text-xs text-[#555555] leading-relaxed mb-3">
                        {member.bio}
                      </p>

                      {/* Key Contributions List */}
                      <div className="space-y-1 text-[11px] pt-1">
                        <strong className="block text-[10px] uppercase text-[#777777] font-bold mb-1">
                          Key Contributions:
                        </strong>
                        {member.contributions.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[#222222]">
                            <span className="text-amber-500 font-bold">▪</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {member.favoriteShip && (
                      <div className="pt-3 border-t border-[#eee] text-[10px] text-[#666666] flex items-center justify-between">
                        <span className="uppercase font-bold text-[#888888]">Flagship:</span>
                        <strong className="text-[#111111]">{member.favoriteShip}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Lead Architect's Dedication Note */}
          <div className="border-2 border-[#111111] bg-neutral-50 p-6 space-y-3 font-mono">
            <div className="flex items-center gap-2 text-[#111111]">
              <Sparkles size={16} className="text-amber-500" />
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                Director&apos;s Dispatch · Message from Stephen
              </h3>
            </div>
            <p className="text-xs text-[#444444] leading-relaxed italic">
              &ldquo;Universe Civilization: Empire at Wars was designed as an authentic tribute to the golden age of browser space strategy and timeless sci-fi sagas. From the coordinate dialing sequences of ancient Stargates to the ruthless tactical calculations of 90-class fleet engagements and 9 governing constitutions, every line of code was crafted to grant commanders total freedom over their galactic destiny. Thank you for commanding with us.&rdquo;
            </p>
            <div className="text-right text-xs font-bold text-[#111111]">
              — Stephen, Lead Architect & Game Director
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SPECIAL THANKS & INSPIRATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'inspirations' && (
        <div className="space-y-6">
          <div className="border border-[#dedede] bg-white p-6 space-y-4">
            <h3 className="text-sm font-black uppercase text-[#111111] flex items-center gap-2">
              <Heart size={16} className="text-red-600" />
              Sovereign Inspirations & Creative Heritage
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Universe Civilization stands on the shoulders of legendary sci-fi franchises and strategy masterworks that shaped the space MMO genre.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {SPECIAL_INSPIRATIONS_THANKS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border-2 border-[#dedede] bg-neutral-50/50 space-y-2 hover:border-[#111111] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-black uppercase text-[#111111]">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ENGINE & TECH STACK */}
      {/* ========================================================================= */}
      {activeTab === 'tech' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black uppercase text-[#111111] flex items-center gap-2">
              <Code size={16} className="text-indigo-600" />
              Technology Architecture & Engine Specifications
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">
              Universe Civilization is engineered as a high-density, zero-bloat client-side real-time MMORPG strategy suite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEVELOPMENT_TECH_STACK.map((item, idx) => (
              <div key={idx} className="p-4 border border-[#dedede] bg-neutral-50 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">
                  Component #{idx + 1}
                </span>
                <h4 className="text-xs font-black text-[#111111]">{item.tech}</h4>
                <p className="text-xs text-[#666666]">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-neutral-100 border border-[#dedede] text-xs text-[#555555] space-y-1">
            <strong className="block text-[#111111] uppercase font-bold">
              Engineering Principles:
            </strong>
            <p>
              Zero external heavy game engines (pure React & Canvas/SVG architecture), offline-resilient local persistence with optional cloud sync, instantaneous client-side calculations, and responsive multi-resolution tactical viewports.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RELEASE MILESTONES */}
      {/* ========================================================================= */}
      {activeTab === 'milestones' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black uppercase text-[#111111] flex items-center gap-2">
              <Bookmark size={16} />
              Galactic Engine Release Milestones
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">
              Historical timeline of major architecture expansions and version updates.
            </p>
          </div>

          <div className="space-y-4">
            {DEVELOPMENT_HISTORY_LOG.map((ms, idx) => (
              <div
                key={idx}
                className="p-4 border-2 border-[#dedede] bg-neutral-50/50 flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 bg-[#111111] text-amber-400 uppercase">
                      {ms.version}
                    </span>
                    <strong className="text-xs font-bold text-[#111111] uppercase">
                      Codename: {ms.codename}
                    </strong>
                  </div>
                  <span className="text-[10px] text-[#777777] block">{ms.date}</span>

                  <div className="pt-2 space-y-1 text-xs text-[#555555]">
                    {ms.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase px-2 py-1 bg-white border border-[#dedede] text-[#666666] self-start">
                  Milestone Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
