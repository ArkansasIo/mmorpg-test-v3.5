import React, { useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCw,
  Terminal,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Volume2,
  VolumeX,
  Trash2,
  Copy,
  Check,
  TrendingUp,
  Shield,
  Crosshair,
  Users,
} from 'lucide-react';
import { sound } from '../../sound';
import { CronJob, CronExecutionLog, CronConfig, CronJobId, PlayerResources } from '../../types';

interface CronSystemViewProps {
  jobs: CronJob[];
  logs: CronExecutionLog[];
  config: CronConfig;
  nextTickSeconds: number;
  resources: PlayerResources;
  grossIncome: number;
  netIncome: number;
  upkeepTotal: number;
  onUpdateConfig: (newConfig: Partial<CronConfig>) => void;
  onRunJob: (jobId: CronJobId) => void;
  onRunAllJobs: () => void;
  onToggleJob: (jobId: CronJobId) => void;
  onClearLogs: () => void;
}

type TabType = 'scheduler' | 'logs' | 'economics' | 'server-cli';

export const CronSystemView: React.FC<CronSystemViewProps> = ({
  jobs,
  logs,
  config,
  nextTickSeconds,
  resources,
  grossIncome,
  netIncome,
  upkeepTotal,
  onUpdateConfig,
  onRunJob,
  onRunAllJobs,
  onToggleJob,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('scheduler');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (snippet: string, key: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(key);
    sound.play('confirm');
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'all') return true;
    return l.jobId === logFilter;
  });

  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(((config.tickIntervalSeconds - nextTickSeconds) / config.tickIntervalSeconds) * 100))
  );

  return (
    <div id="cron-system-view" className="space-y-6">
      {/* View Header */}
      <div className="border border-[#dedede] bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
              AUTOMATION & OPERATIONS · BACKGROUND CRON ENGINE
            </div>
            <h2 className="text-2xl font-bold text-[#111111]">Empire Cron Job Scheduling System</h2>
            <p className="text-xs text-[#666666] mt-1 max-w-2xl leading-relaxed">
              Automated background tick processing for turn settlement, resource taxation, military upkeep audits,
              bank vault interest accrual, market rebalancing, and enemy target realm fleet regeneration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.play('confirm');
                onUpdateConfig({ autoTickEnabled: !config.autoTickEnabled });
              }}
              className={`px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                config.autoTickEnabled
                  ? 'bg-[#111111] text-white hover:bg-[#333333]'
                  : 'bg-[#dc2626] text-white hover:bg-[#b91c1c]'
              }`}
            >
              {config.autoTickEnabled ? <Pause size={13} /> : <Play size={13} />}
              <span>{config.autoTickEnabled ? 'Pause Auto-Tick' : 'Resume Auto-Tick'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.play('confirm');
                onRunAllJobs();
              }}
              className="px-3.5 py-2 border border-[#111111] text-[#111111] bg-white hover:bg-[#f5f5f5] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw size={13} />
              <span>Run All Ticks Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Tick Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Next Tick Countdown */}
        <div className="border border-[#dedede] bg-white p-4">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-[#111111]" />
              <span>Next Turn Tick</span>
            </div>
            <span
              className={`px-1.5 py-0.2 border text-[9px] ${
                config.autoTickEnabled ? 'border-[#16a34a] text-[#16a34a]' : 'border-[#dc2626] text-[#dc2626]'
              }`}
            >
              {config.autoTickEnabled ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-mono font-bold text-[#111111]">
              00:{nextTickSeconds.toString().padStart(2, '0')}
            </strong>
            <span className="text-[10px] text-[#888888]">/ {config.tickIntervalSeconds}s interval</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-[#eeeeee] h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                config.autoTickEnabled ? 'bg-[#111111]' : 'bg-[#aaaaaa]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tick Frequency Selector */}
        <div className="border border-[#dedede] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
            <Sliders size={12} className="text-[#111111]" />
            <span>Tick Frequency</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <select
              value={config.tickIntervalSeconds}
              onChange={(e) => onUpdateConfig({ tickIntervalSeconds: parseInt(e.target.value, 10) })}
              className="border border-[#cccccc] px-2 py-1 bg-white text-xs font-mono font-bold text-[#111111] w-full"
            >
              <option value={15}>15s · Blitz (Dev / Fast Test)</option>
              <option value={30}>30s · Accelerated Simulation</option>
              <option value={60}>60s · Default Standard Tick</option>
              <option value={300}>5m · Tactical Strategy</option>
              <option value={600}>10m · Classic MMO Pacing</option>
              <option value={1800}>30m · Hardcore Turn Mode</option>
            </select>
          </div>
          <div className="text-[10px] text-[#666666] mt-1">Controls automated heartbeat interval</div>
        </div>

        {/* Total Registered Jobs */}
        <div className="border border-[#dedede] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
            <Activity size={12} className="text-[#111111]" />
            <span>Active Cron Daemons</span>
          </div>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-mono font-bold text-[#111111]">
              {jobs.filter((j) => j.enabled).length} / {jobs.length}
            </strong>
            <span className="text-[10px] text-[#666666]">Enabled Tasks</span>
          </div>
          <div className="text-[10px] text-[#888888] mt-1">
            Total executions logged: {jobs.reduce((sum, j) => sum + j.runCount, 0).toLocaleString()}
          </div>
        </div>

        {/* Net Yield per Tick */}
        <div className="border border-[#dedede] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
            <TrendingUp size={12} className="text-[#111111]" />
            <span>Net Yield / Tick</span>
          </div>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-mono font-bold text-[#111111]">
              +{netIncome.toLocaleString()}
            </strong>
            <span className="text-[10px] text-[#666666]">NQ</span>
          </div>
          <div className="text-[10px] text-[#888888] mt-1">
            Gross: +{grossIncome.toLocaleString()} | Upkeep: -{upkeepTotal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border border-[#dedede] bg-white">
        <div className="flex flex-wrap border-b border-[#dedede] bg-[#fafafa]">
          <button
            type="button"
            onClick={() => setActiveTab('scheduler')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-r border-[#dedede] flex items-center gap-1.5 ${
              activeTab === 'scheduler'
                ? 'bg-white text-[#111111] border-b-2 border-b-[#111111] -mb-[1px]'
                : 'text-[#666666] hover:text-[#111111] hover:bg-white/50'
            }`}
          >
            <Clock size={13} />
            <span>Cron Task Manager ({jobs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-r border-[#dedede] flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-white text-[#111111] border-b-2 border-b-[#111111] -mb-[1px]'
                : 'text-[#666666] hover:text-[#111111] hover:bg-white/50'
            }`}
          >
            <Terminal size={13} />
            <span>Execution Logs ({logs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('economics')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-r border-[#dedede] flex items-center gap-1.5 ${
              activeTab === 'economics'
                ? 'bg-white text-[#111111] border-b-2 border-b-[#111111] -mb-[1px]'
                : 'text-[#666666] hover:text-[#111111] hover:bg-white/50'
            }`}
          >
            <TrendingUp size={13} />
            <span>Turn Settlement Formula</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('server-cli')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-r border-[#dedede] flex items-center gap-1.5 ${
              activeTab === 'server-cli'
                ? 'bg-white text-[#111111] border-b-2 border-b-[#111111] -mb-[1px]'
                : 'text-[#666666] hover:text-[#111111] hover:bg-white/50'
            }`}
          >
            <Server size={13} />
            <span>Server Crontab CLI Reference</span>
          </button>
        </div>

        {/* Tab 1: Cron Scheduler */}
        {activeTab === 'scheduler' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#666666] mb-2">
              <span>All registered automated tasks executing on scheduled heartbeat triggers:</span>
              <span className="font-mono text-[11px] text-[#888888]">Engine: Universal Civilization Cron v2.4</span>
            </div>

            <div className="divide-y divide-[#eeeeee] border border-[#dedede]">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-[#fafafa] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#111111]">{job.name}</h4>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 border border-[#dedede] bg-[#f5f5f5] text-[#555555]">
                        {job.id}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 border font-bold uppercase ${
                          job.enabled
                            ? 'border-[#16a34a] text-[#16a34a] bg-[#f0fdf4]'
                            : 'border-[#cccccc] text-[#888888] bg-[#f5f5f5]'
                        }`}
                      >
                        {job.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <p className="text-xs text-[#555555] leading-relaxed">{job.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#666666] pt-1">
                      <div>
                        Schedule: <strong className="text-[#111111]">{job.schedule}</strong>
                      </div>
                      <div>
                        Executions: <strong className="text-[#111111]">{job.runCount}</strong>
                      </div>
                      <div>
                        Avg Latency: <strong className="text-[#111111]">{job.lastExecutionMs}ms</strong>
                      </div>
                      <div>
                        Last Run: <strong className="text-[#111111]">{job.lastRunAt ? new Date(job.lastRunAt).toLocaleTimeString() : 'Never'}</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 inline-block mt-1 font-mono">
                      Last Outcome: {job.lastResultSummary}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        sound.play('confirm');
                        onToggleJob(job.id);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
                        job.enabled
                          ? 'border-[#dedede] text-[#666666] hover:border-[#111111] hover:text-[#111111]'
                          : 'border-[#16a34a] text-[#16a34a] hover:bg-[#f0fdf4]'
                      }`}
                    >
                      {job.enabled ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.play('confirm');
                        onRunJob(job.id);
                      }}
                      className="px-3 py-1.5 bg-[#111111] text-white hover:bg-[#333333] text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <RotateCw size={11} />
                      <span>Execute Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Execution Logs */}
        {activeTab === 'logs' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#777777] uppercase">Filter by Daemon:</span>
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="border border-[#cccccc] px-2 py-1 text-xs bg-white"
                >
                  <option value="all">All Cron Jobs</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={onClearLogs}
                className="px-3 py-1 border border-[#dedede] text-xs font-bold text-[#dc2626] hover:bg-[#fff5f5] transition-colors flex items-center gap-1.5 self-start"
              >
                <Trash2 size={12} />
                <span>Clear Output Terminal</span>
              </button>
            </div>

            <div className="bg-[#111111] text-[#e0e0e0] font-mono text-xs p-4 rounded-none border border-[#222222] max-h-96 overflow-y-auto space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-[#666666] py-8 text-center">
                  [SYSTEM] No execution records logged matching current filter.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="border-b border-[#222222] pb-2 last:border-b-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#888888]">[{log.timestamp}]</span>
                      <span
                        className={`text-[10px] px-1 uppercase font-bold ${
                          log.status === 'success'
                            ? 'text-[#22c55e]'
                            : log.status === 'warning'
                            ? 'text-[#f59e0b]'
                            : 'text-[#ef4444]'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="text-[#60a5fa] font-bold">{log.jobName}</span>
                      <span className="text-[#aaaaaa] ml-auto text-[11px]">{log.durationMs}ms</span>
                    </div>

                    <div className="text-[#cccccc] pl-2">{log.message}</div>

                    {log.details && (
                      <div className="text-[11px] text-[#86efac] pl-4">
                        {log.details.turnsAdded !== undefined && `+${log.details.turnsAdded} Turns `}
                        {log.details.incomeAdded !== undefined && `+${log.details.incomeAdded.toLocaleString()} NQ `}
                        {log.details.unitsAdded !== undefined && `+${log.details.unitsAdded} Recruits `}
                        {log.details.upkeepDeducted !== undefined && `-${log.details.upkeepDeducted.toLocaleString()} Upkeep `}
                        {log.details.interestAccrued !== undefined && `+${log.details.interestAccrued.toLocaleString()} Bank Vault Yield `}
                        {log.details.targetsRegenerated !== undefined && `${log.details.targetsRegenerated} NPC Fleets Reinforced `}
                        {log.details.marketFluctuation !== undefined && `Exchange: ${log.details.marketFluctuation}`}
                        {log.details.eventsFired !== undefined && `Event: ${log.details.eventsFired}`}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Turn Settlement Economics */}
        {activeTab === 'economics' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Turn Settlement & Upkeep Mathematics</h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Detailed breakdown of production, worker taxation, and military upkeep calculations computed on every turn tick.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Sources */}
              <div className="border border-[#dedede] p-5 bg-white space-y-3">
                <div className="flex items-center gap-2 border-b border-[#eeeeee] pb-2">
                  <TrendingUp size={16} className="text-[#16a34a]" />
                  <h4 className="font-bold text-sm text-[#111111]">Revenue Generation</h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                    <span className="text-[#666666]">Base Sovereign Territory Allowance:</span>
                    <strong className="font-mono text-[#111111]">+1,000 NQ</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                    <span className="text-[#666666]">Industrial Miners ({resources.miners.toLocaleString()} personnel):</span>
                    <strong className="font-mono text-[#111111]">
                      +{(resources.miners * 12).toLocaleString()} NQ
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                    <span className="text-[#666666]">Planetary Mine Extraction Bonus:</span>
                    <strong className="font-mono text-[#111111]">+650 NQ</strong>
                  </div>
                  <div className="flex justify-between py-1.5 pt-2 text-sm border-t border-[#dedede] font-bold">
                    <span>Total Gross Income:</span>
                    <span className="font-mono text-[#16a34a]">+{grossIncome.toLocaleString()} NQ</span>
                  </div>
                </div>
              </div>

              {/* Upkeep Deductions */}
              <div className="border border-[#dedede] p-5 bg-white space-y-3">
                <div className="flex items-center gap-2 border-b border-[#eeeeee] pb-2">
                  <Shield size={16} className="text-[#dc2626]" />
                  <h4 className="font-bold text-sm text-[#111111]">Military & Fleet Upkeep Deductions</h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                    <span className="text-[#666666]">Troop Deployment Rations:</span>
                    <strong className="font-mono text-[#111111]">
                      -{Math.round((resources.attackUnits + resources.defenseUnits) * 0.1).toLocaleString()} NQ
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                    <span className="text-[#666666]">Super Units & Spec Ops Support:</span>
                    <strong className="font-mono text-[#111111]">
                      -{(resources.superUnits * 2).toLocaleString()} NQ
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                    <span className="text-[#666666]">Weapons, Armors & Deflectors Maintenance:</span>
                    <strong className="font-mono text-[#111111]">-65 NQ</strong>
                  </div>
                  <div className="flex justify-between py-1.5 pt-2 text-sm border-t border-[#dedede] font-bold">
                    <span>Total Upkeep Deductions:</span>
                    <span className="font-mono text-[#dc2626]">-{upkeepTotal.toLocaleString()} NQ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Calculation Summary */}
            <div className="bg-[#fafafa] border border-[#111111] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">
                  NET CASHFLOW PER CRON TICK
                </div>
                <div className="text-2xl font-mono font-bold text-[#111111] mt-0.5">
                  +{netIncome.toLocaleString()} Naquadah
                </div>
                <div className="text-xs text-[#666666] mt-0.5">
                  Untrained population yield: +{resources.unitProduction} recruits per tick
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.play('confirm');
                    onRunJob('turn_cron');
                  }}
                  className="px-4 py-2 bg-[#111111] text-white hover:bg-[#333333] text-xs font-bold transition-colors"
                >
                  Settle 1 Tick Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Server Crontab Reference */}
        {activeTab === 'server-cli' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Production Crontab Configuration</h3>
              <p className="text-xs text-[#666666] mt-0.5">
                For headless Linux server deployments, run these commands via <code className="font-mono bg-[#eeeeee] px-1">crontab -e</code> to
                automate game ticks on a dedicated VM, container, or cloud host.
              </p>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-[#dedede] p-4 bg-[#fafafa] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-bold text-[#111111]">{job.name}</strong>
                      <span className="font-mono text-[10px] text-[#666666] ml-2">({job.schedule})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(job.commandSnippet, job.id)}
                      className="px-2.5 py-1 border border-[#cccccc] bg-white hover:bg-[#eeeeee] text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedSnippet === job.id ? <Check size={11} className="text-[#16a34a]" /> : <Copy size={11} />}
                      <span>{copiedSnippet === job.id ? 'Copied' : 'Copy Crontab Entry'}</span>
                    </button>
                  </div>

                  <div className="bg-[#111111] text-[#e0e0e0] font-mono text-xs p-3 overflow-x-auto select-all">
                    {job.commandSnippet}
                  </div>
                </div>
              ))}

              {/* Master System Crontab Snippet */}
              <div className="border border-[#111111] p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-xs font-bold text-[#111111]">Complete Server crontab file</strong>
                    <div className="text-[11px] text-[#666666]">Full drop-in crontab for Ubuntu / Debian / RHEL servers</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `# Universe Civilization: Empire at Wars Master Crontab\nPATH=/usr/local/bin:/usr/bin:/bin\n\n# 1. Turn Tick (Every minute)\n* * * * * php /var/www/mmo/cron/turn.php >> /var/log/mmo/turn.log 2>&1\n\n# 2. Daily Settlement (Midnight UTC)\n0 0 * * * php /var/www/mmo/cron/daily_settlement.php >> /var/log/mmo/daily.log 2>&1\n\n# 3. Market Fluctuation (Every 5 minutes)\n*/5 * * * * php /var/www/mmo/cron/market_fluctuation.php >> /var/log/mmo/market.log 2>&1\n\n# 4. NPC Target Regeneration (Every 3 minutes)\n*/3 * * * * php /var/www/mmo/cron/npc_regeneration.php >> /var/log/mmo/npc.log 2>&1\n\n# 5. Galaxy Phenomena (Every 10 minutes)\n*/10 * * * * php /var/www/mmo/cron/galaxy_events.php >> /var/log/mmo/events.log 2>&1\n`,
                        'all_crontab'
                      )
                    }
                    className="px-3 py-1 bg-[#111111] text-white hover:bg-[#333333] text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedSnippet === 'all_crontab' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSnippet === 'all_crontab' ? 'Copied' : 'Copy Full Crontab'}</span>
                  </button>
                </div>

                <pre className="bg-[#111111] text-[#e0e0e0] font-mono text-[11px] p-4 overflow-x-auto leading-relaxed">
{`# Universe Civilization: Empire at Wars Master Crontab
PATH=/usr/local/bin:/usr/bin:/bin

# 1. Turn Tick (Every minute)
* * * * * php /var/www/mmo/cron/turn.php >> /var/log/mmo/turn.log 2>&1

# 2. Daily Settlement (Midnight UTC)
0 0 * * * php /var/www/mmo/cron/daily_settlement.php >> /var/log/mmo/daily.log 2>&1

# 3. Market Fluctuation (Every 5 minutes)
*/5 * * * * php /var/www/mmo/cron/market_fluctuation.php >> /var/log/mmo/market.log 2>&1

# 4. NPC Target Regeneration (Every 3 minutes)
*/3 * * * * php /var/www/mmo/cron/npc_regeneration.php >> /var/log/mmo/npc.log 2>&1

# 5. Galaxy Phenomena (Every 10 minutes)
*/10 * * * * php /var/www/mmo/cron/galaxy_events.php >> /var/log/mmo/events.log 2>&1`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
