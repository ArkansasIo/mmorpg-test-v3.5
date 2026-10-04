import React from 'react';
import { MegastructureProject, PlayerResources } from '../../types';
import { sound } from '../../sound';

interface MegastructureViewProps {
  projects: MegastructureProject[];
  resources: PlayerResources;
  onStartStage: (projectId: string) => void;
}

export const MegastructureView: React.FC<MegastructureViewProps> = ({
  projects,
  resources,
  onStartStage,
}) => {
  const canAffordStage = (project: MegastructureProject): boolean => {
    const nextStage = project.stages.find((s) => !s.completed);
    if (!nextStage) return false;
    return (
      (resources.metal ?? 0) >= nextStage.cost.metal &&
      (resources.crystal ?? 0) >= nextStage.cost.crystal &&
      (resources.deuterium ?? 0) >= nextStage.cost.deuterium
    );
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border border-[#111111] bg-white p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-wider">STELLAR MEGASTRUCTURE FORGE</span>
              <span className="px-2 py-0.5 text-[10px] font-mono border border-[#111111] bg-[#f8fafc]">
                GAME SPEC §30
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-1 max-w-2xl">
              Star-spanning macro-engineering endgame projects. Construct Dyson swarms around stellar coronas,
              encircle colonies with orbital fortress rings, and ignite galactic wormhole gateways.
            </p>
          </div>

          <div className="border border-[#111111] bg-[#f8fafc] p-2.5 text-xs font-mono min-w-[180px]">
            <div className="text-[10px] text-[#666666]">ENDGAME MASTERY</div>
            <div className="font-bold text-[#111111] mt-0.5">
              {projects.filter((p) => p.currentStage >= p.totalStages).length} / {projects.length} Completed
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const nextStage = project.stages.find((s) => !s.completed);
          const isFullyComplete = project.currentStage >= project.totalStages;
          const affordable = canAffordStage(project);

          return (
            <div
              key={project.id}
              className="border border-[#111111] bg-white p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-[#111111] pb-3">
                  <div>
                    <div className="text-2xl mb-1">{project.icon}</div>
                    <h3 className="text-base font-bold text-[#111111]">{project.name}</h3>
                    <div className="text-[11px] font-mono text-[#666666]">{project.subtitle}</div>
                  </div>

                  <span className="px-2 py-0.5 text-xs font-mono font-bold border border-[#111111] bg-[#f8fafc]">
                    Stage {project.currentStage} / {project.totalStages}
                  </span>
                </div>

                <p className="text-xs text-[#444444] leading-relaxed mt-3 mb-3">
                  {project.description}
                </p>

                {/* Grand Benefit */}
                <div className="p-2.5 border border-[#e2e8f0] bg-[#f8fafc] text-xs font-mono mb-4">
                  <div className="text-[10px] text-[#666666] uppercase">ENDGAME BENEFIT</div>
                  <div className="font-bold text-[#22c55e] mt-0.5">{project.grandBenefit}</div>
                </div>

                {/* Stage Steps */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="font-bold text-[#111111] text-[11px] uppercase tracking-wider">
                    Construction Milestones:
                  </div>
                  {project.stages.map((stage) => (
                    <div
                      key={stage.stageNumber}
                      className={`p-2 border flex items-center justify-between ${
                        stage.completed
                          ? 'border-[#22c55e] bg-[#f0fdf4] text-[#166534]'
                          : project.isConstructing && stage.stageNumber === project.currentStage + 1
                          ? 'border-[#2563eb] bg-[#eff6ff] text-[#1e40af]'
                          : 'border-[#e2e8f0] bg-white text-[#666666]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{stage.name}</div>
                        <div className="text-[10px] opacity-80">{stage.effectDescription}</div>
                      </div>
                      <span className="font-bold text-xs">
                        {stage.completed ? '✓ READY' : project.isConstructing && stage.stageNumber === project.currentStage + 1 ? 'BUILDING' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Construction Action Bar */}
              <div className="pt-3 border-t border-[#e2e8f0] space-y-2">
                {isFullyComplete ? (
                  <div className="w-full py-2.5 text-xs font-mono font-bold text-center bg-[#f0fdf4] border border-[#22c55e] text-[#166534]">
                    MEGASTRUCTURE FULLY ACTIVATED & OPERATIONAL
                  </div>
                ) : project.isConstructing ? (
                  <div className="space-y-1.5 p-2 bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex justify-between text-xs font-mono">
                      <span>Forging Milestone...</span>
                      <span className="font-bold">{formatSeconds(project.constructionRemainingSeconds)}</span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] h-2 overflow-hidden">
                      <div className="bg-[#2563eb] h-full w-2/3 animate-pulse" />
                    </div>
                  </div>
                ) : nextStage ? (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="text-[11px] text-[#666666]">
                      Next Stage Cost: M {nextStage.cost.metal.toLocaleString()} | C{' '}
                      {nextStage.cost.crystal.toLocaleString()} | D{' '}
                      {nextStage.cost.deuterium.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      disabled={!affordable}
                      onClick={() => {
                        sound.play('confirm');
                        onStartStage(project.id);
                      }}
                      className={`w-full py-2.5 font-bold transition-colors cursor-pointer border ${
                        !affordable
                          ? 'border-[#cccccc] bg-[#f8fafc] text-[#888888] cursor-not-allowed'
                          : 'border-[#111111] bg-[#111111] text-white hover:bg-black'
                      }`}
                    >
                      {affordable ? `Construct Stage ${nextStage.stageNumber}` : 'Insufficient Resources'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
