import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wrench,
  Shield,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  DollarSign,
  Search,
  Filter,
  Package,
  Compass,
  Database,
  Crosshair,
  Award,
  ChevronRight,
  Plus,
  Flame,
  Pickaxe,
  TrendingUp,
  RefreshCw,
  BookOpen,
  Info,
  Radio,
  FileCode,
  Building,
  Atom,
  Sliders,
  X,
  FastForward,
  Copy,
} from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources } from '../../types';
import {
  INITIAL_EVE_BLUEPRINTS,
  EveBlueprint,
  BlueprintType,
  TechTier,
  EveFaction,
  EveShipClass,
  IndustryJob,
  IndustryFacility,
  EVE_DECRYPTORS,
  DecryptorItem,
  EVE_DATACORES,
  DatacoreItem,
  EVE_ANCIENT_RELICS,
  AncientRelicItem,
  EVE_FACILITIES,
  calculateManufacturingCost,
  calculateManufacturingTime,
  calculateMEResearchCostAndTime,
  calculateTEResearchCostAndTime,
  calculateCopyCostAndTime,
  calculateInventionProbability,
} from '../../blueprintSystemsData';

interface EveBlueprintsViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
  onNavigate?: (route: string) => void;
}

export const EveBlueprintsView: React.FC<EveBlueprintsViewProps> = ({
  resources,
  onUpdateResources,
  onNavigate,
}) => {
  // Persistence state
  const loadBlueprints = (): EveBlueprint[] => {
    try {
      const saved = localStorage.getItem('uc_state_eve_blueprints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_EVE_BLUEPRINTS;
    } catch {
      return INITIAL_EVE_BLUEPRINTS;
    }
  };

  const loadJobs = (): IndustryJob[] => {
    try {
      const saved = localStorage.getItem('uc_state_eve_industry_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  };

  const [blueprints, setBlueprints] = useState<EveBlueprint[]>(loadBlueprints);
  const [industryJobs, setIndustryJobs] = useState<IndustryJob[]>(loadJobs);
  const [activeTab, setActiveTab] = useState<
    'hangar' | 'jobs' | 'invention' | 'reverse_eng' | 'market' | 'facilities' | 'codex'
  >('hangar');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Selected Facility
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(() => {
    return localStorage.getItem('uc_selected_eve_facility') || 'fac_station';
  });

  // Filters for Blueprint Hangar
  const [typeFilter, setTypeFilter] = useState<BlueprintType | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<TechTier | 'all'>('all');
  const [originFilter, setOriginFilter] = useState<'all' | 'bpo' | 'bpc'>('all');
  const [factionFilter, setFactionFilter] = useState<EveFaction | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected for Invention Console
  const [selectedInventionBpId, setSelectedInventionBpId] = useState<string>('bp_rifter');
  const [selectedDecryptorId, setSelectedDecryptorId] = useState<string>('dec_parity');
  const [inventionRolling, setInventionRolling] = useState(false);

  // Selected for Reverse Engineering Console
  const [selectedRelicId, setSelectedRelicId] = useState<string>('relic_intact');
  const [selectedReverseTargetId, setSelectedReverseTargetId] = useState<string>('bp_tengu_t3');
  const [reverseEngRolling, setReverseEngRolling] = useState(false);

  // Interactive Action Modals
  const [activeModalBlueprint, setActiveModalBlueprint] = useState<EveBlueprint | null>(null);
  const [activeModalType, setActiveModalType] = useState<
    'manufacture' | 'me_research' | 'te_research' | 'copy' | null
  >(null);
  const [manufacturingRunsInput, setManufacturingRunsInput] = useState<number>(1);
  const [copyRunsInput, setCopyRunsInput] = useState<number>(10);
  const [copyCountInput, setCopyCountInput] = useState<number>(1);

  // Market filter
  const [marketEmpireFilter, setMarketEmpireFilter] = useState<
    'all' | 'Caldari' | 'Minmatar' | 'Gallente' | 'Amarr' | 'Upwell' | 'Pirate'
  >('all');

  const selectedFacility =
    EVE_FACILITIES.find((f) => f.id === selectedFacilityId) || EVE_FACILITIES[0];

  const saveBlueprints = (updated: EveBlueprint[]) => {
    setBlueprints(updated);
    try {
      localStorage.setItem('uc_state_eve_blueprints', JSON.stringify(updated));
    } catch {}
  };

  const saveJobs = (updated: IndustryJob[]) => {
    setIndustryJobs(updated);
    try {
      localStorage.setItem('uc_state_eve_industry_jobs', JSON.stringify(updated));
    } catch {}
  };

  const triggerFeedback = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Job progress ticker simulation (1 second per tick)
  useEffect(() => {
    const timer = setInterval(() => {
      setIndustryJobs((prevJobs) => {
        let changed = false;
        const updated = prevJobs.map((job) => {
          if (job.status === 'active' && job.timeRemainingSeconds > 0) {
            changed = true;
            const newRemaining = Math.max(0, job.timeRemainingSeconds - 1);
            const progress = Math.min(
              100,
              Math.round(((job.totalDurationSeconds - newRemaining) / job.totalDurationSeconds) * 100)
            );
            return {
              ...job,
              timeRemainingSeconds: newRemaining,
              progressPercent: progress,
              status: (newRemaining === 0 ? 'completed' : 'active') as any,
            };
          }
          return job;
        });
        if (changed) {
          try {
            localStorage.setItem('uc_state_eve_industry_jobs', JSON.stringify(updated));
          } catch {}
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filtered blueprints in Hangar
  const filteredBlueprints = blueprints.filter((bp) => {
    const matchesType = typeFilter === 'all' || bp.type === typeFilter;
    const matchesTier = tierFilter === 'all' || bp.techLevel === tierFilter;
    const matchesOrigin =
      originFilter === 'all' || (originFilter === 'bpo' ? bp.isOriginal : !bp.isOriginal);
    const matchesFaction = factionFilter === 'all' || bp.faction === factionFilter;
    const matchesSearch =
      bp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.outputItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bp.shipClass && bp.shipClass.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesTier && matchesOrigin && matchesFaction && matchesSearch;
  });

  // =========================================================
  // MANUFACTURING JOB CREATION
  // =========================================================
  const handleOpenManufactureModal = (bp: EveBlueprint) => {
    sound.play('click');
    setActiveModalBlueprint(bp);
    setManufacturingRunsInput(1);
    setActiveModalType('manufacture');
  };

  const handleStartManufacturing = () => {
    if (!activeModalBlueprint) return;
    sound.play('click');

    const runs = Math.max(1, manufacturingRunsInput);
    if (!activeModalBlueprint.isOriginal && runs > activeModalBlueprint.runsRemaining) {
      sound.play('warning');
      triggerFeedback(
        `Job rejected: BPC only has ${activeModalBlueprint.runsRemaining} runs remaining.`,
        'warning'
      );
      return;
    }

    const cost = calculateManufacturingCost(activeModalBlueprint, runs, selectedFacility);
    const duration = calculateManufacturingTime(activeModalBlueprint, runs, selectedFacility);

    // Resource validation
    if (
      (resources.metal || 0) < cost.metal ||
      (resources.crystal || 0) < cost.crystal ||
      (resources.deuterium || 0) < cost.deuterium ||
      (cost.naquadah > 0 && (resources.naquadah || 0) < cost.naquadah) ||
      (cost.trinium > 0 && (resources.trinium || 0) < cost.trinium)
    ) {
      sound.play('warning');
      triggerFeedback(
        `Insufficient materials for ${runs}x fabrication runs: Required ${cost.metal.toLocaleString()} Metal, ${cost.crystal.toLocaleString()} Crystal, ${cost.deuterium.toLocaleString()} Deut.`,
        'warning'
      );
      return;
    }

    // Deduct resources
    onUpdateResources({
      metal: (resources.metal || 0) - cost.metal,
      crystal: (resources.crystal || 0) - cost.crystal,
      deuterium: (resources.deuterium || 0) - cost.deuterium,
      naquadah: Math.max(0, (resources.naquadah || 0) - cost.naquadah),
      trinium: Math.max(0, (resources.trinium || 0) - cost.trinium),
    });

    // If BPC, decrement runs
    let updatedBlueprints = [...blueprints];
    if (!activeModalBlueprint.isOriginal) {
      const remaining = activeModalBlueprint.runsRemaining - runs;
      if (remaining <= 0) {
        // Consumed entirely
        updatedBlueprints = updatedBlueprints.filter((b) => b.id !== activeModalBlueprint.id);
      } else {
        updatedBlueprints = updatedBlueprints.map((b) =>
          b.id === activeModalBlueprint.id ? { ...b, runsRemaining: remaining } : b
        );
      }
      saveBlueprints(updatedBlueprints);
    }

    const newJob: IndustryJob = {
      id: `job-mfg-${Date.now()}`,
      type: 'manufacturing',
      blueprintId: activeModalBlueprint.id,
      blueprintName: activeModalBlueprint.name,
      runs: runs,
      progressPercent: 0,
      timeRemainingSeconds: duration,
      totalDurationSeconds: duration,
      status: 'active',
      installedAt: new Date().toLocaleTimeString(),
      facilityId: selectedFacility.id,
      outputDetails: `${runs}x ${activeModalBlueprint.outputItem.name} (${activeModalBlueprint.outputItem.category})`,
    };

    saveJobs([...industryJobs, newJob]);
    sound.play('confirm');
    setActiveModalType(null);
    triggerFeedback(
      `Manufacturing Job installed: ${runs}x ${activeModalBlueprint.outputItem.name} queued at ${selectedFacility.name}. Duration: ${duration}s.`
    );
  };

  // =========================================================
  // RESEARCH JOBS (ME & TE)
  // =========================================================
  const handleStartMEResearch = (bpId: string) => {
    sound.play('click');
    const bp = blueprints.find((b) => b.id === bpId);
    if (!bp) return;

    if (!bp.isOriginal) {
      sound.play('warning');
      triggerFeedback('Blueprint Copies (BPC) cannot be researched. Only Blueprint Originals (BPO) qualify for laboratory research.', 'warning');
      return;
    }

    if (bp.materialEfficiency >= 10) {
      sound.play('warning');
      triggerFeedback(`${bp.name} is already at maximum Material Efficiency (ME 10 / 10% maximum savings).`, 'warning');
      return;
    }

    const { metalCost, crystalCost, timeSeconds } = calculateMEResearchCostAndTime(bp.materialEfficiency);

    if ((resources.metal || 0) < metalCost || (resources.crystal || 0) < crystalCost) {
      sound.play('warning');
      triggerFeedback(`Insufficient materials: Requires ${metalCost.toLocaleString()} Metal & ${crystalCost.toLocaleString()} Crystal for ME +${bp.materialEfficiency + 1}.`, 'warning');
      return;
    }

    onUpdateResources({
      metal: (resources.metal || 0) - metalCost,
      crystal: (resources.crystal || 0) - crystalCost,
    });

    const newJob: IndustryJob = {
      id: `job-me-${Date.now()}`,
      type: 'me_research',
      blueprintId: bp.id,
      blueprintName: bp.name,
      runs: 1,
      targetLevel: bp.materialEfficiency + 1,
      progressPercent: 0,
      timeRemainingSeconds: timeSeconds,
      totalDurationSeconds: timeSeconds,
      status: 'active',
      installedAt: new Date().toLocaleTimeString(),
      facilityId: selectedFacility.id,
      outputDetails: `Material Efficiency (ME +${bp.materialEfficiency + 1}) for ${bp.name}`,
    };

    saveJobs([...industryJobs, newJob]);
    sound.play('confirm');
    triggerFeedback(`Installed ME Research Job: ${bp.name} (ME +${bp.materialEfficiency + 1}) queued in laboratory.`);
  };

  const handleStartTEResearch = (bpId: string) => {
    sound.play('click');
    const bp = blueprints.find((b) => b.id === bpId);
    if (!bp) return;

    if (!bp.isOriginal) {
      sound.play('warning');
      triggerFeedback('Blueprint Copies (BPC) cannot be researched. Only Blueprint Originals (BPO) qualify for laboratory research.', 'warning');
      return;
    }

    if (bp.timeEfficiency >= 20) {
      sound.play('warning');
      triggerFeedback(`${bp.name} is already at maximum Time Efficiency (TE 20 / 20% maximum speed boost).`, 'warning');
      return;
    }

    const { metalCost, crystalCost, timeSeconds } = calculateTEResearchCostAndTime(bp.timeEfficiency);

    if ((resources.metal || 0) < metalCost || (resources.crystal || 0) < crystalCost) {
      sound.play('warning');
      triggerFeedback(`Insufficient materials: Requires ${metalCost.toLocaleString()} Metal & ${crystalCost.toLocaleString()} Crystal for TE +${bp.timeEfficiency + 2}.`, 'warning');
      return;
    }

    onUpdateResources({
      metal: (resources.metal || 0) - metalCost,
      crystal: (resources.crystal || 0) - crystalCost,
    });

    const newJob: IndustryJob = {
      id: `job-te-${Date.now()}`,
      type: 'te_research',
      blueprintId: bp.id,
      blueprintName: bp.name,
      runs: 1,
      targetLevel: bp.timeEfficiency + 2,
      progressPercent: 0,
      timeRemainingSeconds: timeSeconds,
      totalDurationSeconds: timeSeconds,
      status: 'active',
      installedAt: new Date().toLocaleTimeString(),
      facilityId: selectedFacility.id,
      outputDetails: `Time Efficiency (TE +${bp.timeEfficiency + 2}) for ${bp.name}`,
    };

    saveJobs([...industryJobs, newJob]);
    sound.play('confirm');
    triggerFeedback(`Installed TE Research Job: ${bp.name} (TE +${bp.timeEfficiency + 2}) queued in laboratory.`);
  };

  // =========================================================
  // COPYING JOBS (BPO -> BPC)
  // =========================================================
  const handleOpenCopyModal = (bp: EveBlueprint) => {
    sound.play('click');
    setActiveModalBlueprint(bp);
    setCopyRunsInput(Math.min(bp.maxRunsPerCopy, 10));
    setCopyCountInput(1);
    setActiveModalType('copy');
  };

  const handleStartCopying = () => {
    if (!activeModalBlueprint) return;
    sound.play('click');

    const runsPerCopy = Math.min(activeModalBlueprint.maxRunsPerCopy, Math.max(1, copyRunsInput));
    const copyCount = Math.max(1, Math.min(10, copyCountInput));
    const { metalCost, crystalCost, timeSeconds } = calculateCopyCostAndTime(
      activeModalBlueprint,
      runsPerCopy,
      copyCount
    );

    if ((resources.metal || 0) < metalCost || (resources.crystal || 0) < crystalCost) {
      sound.play('warning');
      triggerFeedback(`Insufficient materials for copying: Requires ${metalCost.toLocaleString()} Metal & ${crystalCost.toLocaleString()} Crystal.`, 'warning');
      return;
    }

    onUpdateResources({
      metal: (resources.metal || 0) - metalCost,
      crystal: (resources.crystal || 0) - crystalCost,
    });

    const newJob: IndustryJob = {
      id: `job-copy-${Date.now()}`,
      type: 'copying',
      blueprintId: activeModalBlueprint.id,
      blueprintName: activeModalBlueprint.name,
      runs: copyCount,
      progressPercent: 0,
      timeRemainingSeconds: timeSeconds,
      totalDurationSeconds: timeSeconds,
      status: 'active',
      installedAt: new Date().toLocaleTimeString(),
      facilityId: selectedFacility.id,
      outputDetails: `${copyCount}x BPC Copies (${runsPerCopy} runs each) of ${activeModalBlueprint.name}`,
    };

    saveJobs([...industryJobs, newJob]);
    sound.play('confirm');
    setActiveModalType(null);
    triggerFeedback(`Copying Job initialized: ${copyCount}x BPC Copies queued. Duration: ${timeSeconds}s.`);
  };

  // =========================================================
  // CRYPTOGRAPHIC INVENTION CONSOLE (T1 BPC -> T2 BPC)
  // =========================================================
  const handleStartInvention = () => {
    sound.play('click');
    const sourceBp = blueprints.find((b) => b.id === selectedInventionBpId);
    if (!sourceBp) return;

    if (!sourceBp.inventionOutputId) {
      sound.play('warning');
      triggerFeedback(`${sourceBp.name} does not have a recognized Tech II invention path.`, 'warning');
      return;
    }

    const selectedDecryptor = EVE_DECRYPTORS.find((d) => d.id === selectedDecryptorId);
    const finalChance = calculateInventionProbability(sourceBp.inventionChance || 50, selectedDecryptor);

    // Cost check: Datacores and Crystal
    const costCrystal = 45000;
    const costDeut = 25000;
    if ((resources.crystal || 0) < costCrystal || (resources.deuterium || 0) < costDeut) {
      sound.play('warning');
      triggerFeedback(`Invention requires ${costCrystal.toLocaleString()} Crystal & ${costDeut.toLocaleString()} Deuterium for laboratory compute.`, 'warning');
      return;
    }

    onUpdateResources({
      crystal: (resources.crystal || 0) - costCrystal,
      deuterium: (resources.deuterium || 0) - costDeut,
    });

    setInventionRolling(true);
    sound.play('research');

    setTimeout(() => {
      setInventionRolling(false);
      const roll = Math.floor(Math.random() * 100) + 1;
      const isSuccess = roll <= finalChance;

      if (isSuccess) {
        sound.play('confirm');
        // Find or build T2 target blueprint
        const baseT2 = INITIAL_EVE_BLUEPRINTS.find((b) => b.id === sourceBp.inventionOutputId);
        const meBonus = selectedDecryptor ? selectedDecryptor.meModifier : 0;
        const teBonus = selectedDecryptor ? selectedDecryptor.teModifier : 0;
        const runsBonus = selectedDecryptor ? selectedDecryptor.runsModifier : 0;

        const newT2Bpc: EveBlueprint = {
          id: `bpc-${sourceBp.inventionOutputId}-${Date.now()}`,
          name: baseT2 ? baseT2.name : `${sourceBp.name} Tech II BPC`,
          type: sourceBp.type,
          techLevel: 'T2',
          faction: sourceBp.faction,
          shipClass: baseT2?.shipClass || sourceBp.shipClass,
          description: baseT2 ? baseT2.description : `Cryptographically invented Tech II prototype from ${sourceBp.name}.`,
          materialEfficiency: Math.max(0, Math.min(10, 2 + meBonus)),
          timeEfficiency: Math.max(0, Math.min(20, 4 + teBonus)),
          runsRemaining: Math.max(1, (baseT2?.runsRemaining || 5) + runsBonus),
          maxRunsPerCopy: Math.max(1, (baseT2?.maxRunsPerCopy || 5) + runsBonus),
          isOriginal: false,
          baseBuildCost: baseT2 ? baseT2.baseBuildCost : { ...sourceBp.baseBuildCost, metal: sourceBp.baseBuildCost.metal * 2.5 },
          baseBuildTimeSeconds: baseT2 ? baseT2.baseBuildTimeSeconds : sourceBp.baseBuildTimeSeconds * 2,
          outputItem: baseT2 ? baseT2.outputItem : sourceBp.outputItem,
        };

        saveBlueprints([newT2Bpc, ...blueprints]);
        triggerFeedback(`INVENTION SUCCESS (Roll: ${roll}% ≤ ${finalChance}%): High-grade ${newT2Bpc.name} delivered to your Hangar!`, 'success');
      } else {
        sound.play('warning');
        triggerFeedback(`INVENTION FAILED (Roll: ${roll}% > ${finalChance}%): Cryptographic decryption decoherence. Experimental materials vaporized.`, 'warning');
      }
    }, 1800);
  };

  // =========================================================
  // REVERSE ENGINEERING (ANCIENT RELICS -> T3 BPCs)
  // =========================================================
  const handleStartReverseEngineering = () => {
    sound.play('click');
    const relic = EVE_ANCIENT_RELICS.find((r) => r.id === selectedRelicId) || EVE_ANCIENT_RELICS[0];
    const targetBp = INITIAL_EVE_BLUEPRINTS.find((b) => b.id === selectedReverseTargetId);
    if (!targetBp) return;

    const costNaquadah = 30000;
    const costDeut = 40000;
    if ((resources.naquadah || 0) < costNaquadah || (resources.deuterium || 0) < costDeut) {
      sound.play('warning');
      triggerFeedback(`Reverse engineering Sleeper relics requires ${costNaquadah.toLocaleString()} Naquadah & ${costDeut.toLocaleString()} Deuterium.`, 'warning');
      return;
    }

    onUpdateResources({
      naquadah: Math.max(0, (resources.naquadah || 0) - costNaquadah),
      deuterium: (resources.deuterium || 0) - costDeut,
    });

    setReverseEngRolling(true);
    sound.play('research');

    setTimeout(() => {
      setReverseEngRolling(false);
      const roll = Math.floor(Math.random() * 100) + 1;
      const isSuccess = roll <= relic.baseSuccessRate;

      if (isSuccess) {
        sound.play('confirm');
        const newT3Bpc: EveBlueprint = {
          ...targetBp,
          id: `bpc-${targetBp.id}-${Date.now()}`,
          isOriginal: false,
          runsRemaining: 5,
        };
        saveBlueprints([newT3Bpc, ...blueprints]);
        triggerFeedback(`REVERSE ENGINEERING SUCCESS (Roll: ${roll}% ≤ ${relic.baseSuccessRate}%): Sleeper matrix decoded! ${targetBp.name} synthesized!`, 'success');
      } else {
        sound.play('warning');
        triggerFeedback(`REVERSE ENGINEERING FAILED (Roll: ${roll}% > ${relic.baseSuccessRate}%): Relic neural structure fractured during scan.`, 'warning');
      }
    }, 1800);
  };

  // =========================================================
  // DELIVER OR COMPLETE INDUSTRY JOB
  // =========================================================
  const handleDeliverJob = (jobId: string) => {
    sound.play('confirm');
    const job = industryJobs.find((j) => j.id === jobId);
    if (!job) return;

    if (job.type === 'me_research') {
      const updated = blueprints.map((b) =>
        b.id === job.blueprintId && b.isOriginal
          ? { ...b, materialEfficiency: Math.min(10, (b.materialEfficiency || 0) + 1) }
          : b
      );
      saveBlueprints(updated);
      triggerFeedback(`Delivered ME Research: ${job.blueprintName} elevated to ME ${job.targetLevel || 10}!`);
    } else if (job.type === 'te_research') {
      const updated = blueprints.map((b) =>
        b.id === job.blueprintId && b.isOriginal
          ? { ...b, timeEfficiency: Math.min(20, (b.timeEfficiency || 0) + 2) }
          : b
      );
      saveBlueprints(updated);
      triggerFeedback(`Delivered TE Research: ${job.blueprintName} elevated to TE ${job.targetLevel || 20}!`);
    } else if (job.type === 'copying') {
      const originalBp = blueprints.find((b) => b.id === job.blueprintId);
      if (originalBp) {
        const newBpc: EveBlueprint = {
          ...originalBp,
          id: `bpc-${originalBp.id}-${Date.now()}`,
          name: `${originalBp.name.replace(' BPO', '')} BPC Copy`,
          isOriginal: false,
          runsRemaining: Math.min(originalBp.maxRunsPerCopy, 10),
        };
        saveBlueprints([newBpc, ...blueprints]);
        triggerFeedback(`Delivered Copying Job: BPC added to your Hangar with ${newBpc.runsRemaining} runs.`);
      }
    } else if (job.type === 'manufacturing') {
      triggerFeedback(`Delivered Manufacturing Output: ${job.outputDetails} assembled and placed in fleet reserve!`);
    }

    // Remove job from list
    saveJobs(industryJobs.filter((j) => j.id !== jobId));
  };

  const handleInstantFinishJob = (jobId: string) => {
    sound.play('confirm');
    setIndustryJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, timeRemainingSeconds: 0, progressPercent: 100, status: 'completed' } : j))
    );
    triggerFeedback('Job accelerated via compute overclock! Ready for immediate delivery.');
  };

  const handleCancelJob = (jobId: string) => {
    sound.play('click');
    saveJobs(industryJobs.filter((j) => j.id !== jobId));
    triggerFeedback('Industry Job aborted. Materials partially salvaged.', 'info');
  };

  // =========================================================
  // MARKET BPO PURCHASE
  // =========================================================
  const handleBuyMarketBPO = (bp: EveBlueprint) => {
    sound.play('click');
    const price = bp.marketSeedPrice || 500000;
    if ((resources.naquadah || 0) < price) {
      sound.play('warning');
      triggerFeedback(`Insufficient Naquadah: Seed price is ${price.toLocaleString()} Naquadah.`, 'warning');
      return;
    }

    onUpdateResources({
      naquadah: (resources.naquadah || 0) - price,
    });

    const newBpo: EveBlueprint = {
      ...bp,
      id: `bpo-${bp.id}-${Date.now()}`,
      isOriginal: true,
      materialEfficiency: 0, // Unresearched seed
      timeEfficiency: 0,
    };

    saveBlueprints([newBpo, ...blueprints]);
    sound.play('confirm');
    triggerFeedback(`Purchased unresearched ${bp.name} from Navy Seed Market for ${price.toLocaleString()} Naquadah!`);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. HEADER & TOP INDUSTRY HUD
         ======================================================== */}
      <div className="border border-[#111111] bg-white p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCode className="w-6 h-6 text-[#111111]" />
              <span className="text-xl font-bold tracking-tight">EVE ONLINE BLUEPRINT & INDUSTRY SYSTEMS</span>
              <span className="px-2 py-0.5 text-[10px] font-mono border border-[#111111] bg-[#f8fafc] font-bold">
                NEW EDEN SPEC v5.0
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-1 max-w-3xl">
              Authentic EVE Online industrial manufacturing pipeline. Research Material & Time Efficiency (ME/TE), produce Blueprint Copies (BPC), execute cryptanalytic invention, reverse-engineer Sleeper relics, and assemble supercapital dreadnoughts and titans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate && onNavigate('tech-library')}
              className="px-3 py-1.5 border border-[#111111] bg-[#f8fafc] hover:bg-[#111111] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              Research Laboratories →
            </button>
            <button
              onClick={() => onNavigate && onNavigate('shipyard')}
              className="px-3 py-1.5 border border-[#111111] bg-[#f8fafc] hover:bg-[#111111] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              Orbital Drydocks →
            </button>
          </div>
        </div>

        {/* Industrial HUD Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-[#e2e8f0]">
          <div className="bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
            <div className="text-[10px] text-[#666666] uppercase font-bold">Blueprints Owned</div>
            <div className="text-base font-bold font-mono text-[#111111]">
              {blueprints.length} Total ({blueprints.filter((b) => b.isOriginal).length} BPO)
            </div>
          </div>
          <div className="bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
            <div className="text-[10px] text-[#666666] uppercase font-bold">Active Industry Jobs</div>
            <div className="text-base font-bold font-mono text-[#111111]">
              {industryJobs.filter((j) => j.status === 'active').length} In Progress
            </div>
          </div>
          <div className="bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
            <div className="text-[10px] text-[#666666] uppercase font-bold">Ready to Deliver</div>
            <div className="text-base font-bold font-mono text-emerald-600">
              {industryJobs.filter((j) => j.status === 'completed').length} Jobs Ready
            </div>
          </div>
          <div className="bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
            <div className="text-[10px] text-[#666666] uppercase font-bold">Current Facility</div>
            <div className="text-xs font-bold text-[#111111] truncate">{selectedFacility.name}</div>
          </div>
          <div className="bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
            <div className="text-[10px] text-[#666666] uppercase font-bold">Facility ME Bonus</div>
            <div className="text-base font-bold font-mono text-emerald-600">
              -{Math.round((1 - selectedFacility.materialMultiplier) * 100)}% Mat Cost
            </div>
          </div>
          <div className="bg-[#f8fafc] p-2.5 border border-[#e2e8f0]">
            <div className="text-[10px] text-[#666666] uppercase font-bold">Facility TE Bonus</div>
            <div className="text-base font-bold font-mono text-emerald-600">
              -{Math.round((1 - selectedFacility.timeMultiplier) * 100)}% Duration
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 border text-xs font-bold flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : feedback.type === 'warning'
              ? 'bg-amber-50 border-amber-400 text-amber-800'
              : 'bg-blue-50 border-blue-400 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================
          2. NAVIGATION TABS
         ======================================================== */}
      <div className="flex flex-wrap gap-1 border-b border-[#111111] bg-white p-1">
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('hangar');
          }}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'hangar' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#f1f5f9]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Blueprint Hangar ({blueprints.length})
        </button>
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('jobs');
          }}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'jobs' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#f1f5f9]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Active Industry Jobs ({industryJobs.length})
        </button>
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('invention');
          }}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'invention' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#f1f5f9]'
          }`}
        >
          <Atom className="w-3.5 h-3.5" />
          Cryptographic Invention (T1 → T2)
        </button>
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('reverse_eng');
          }}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reverse_eng' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#f1f5f9]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Reverse Engineering (T3 Cruisers)
        </button>
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('market');
          }}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'market' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#f1f5f9]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Empire BPO Seed Market
        </button>
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('facilities');
          }}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'facilities' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#f1f5f9]'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          Upwell Citadels & Facilities
        </button>
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('codex');
          }}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'codex' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-[#f1f5f9]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Industry Codex & Formulas
        </button>
      </div>

      {/* ========================================================
          TAB 1: BLUEPRINT HANGAR (VAULT)
         ======================================================== */}
      {activeTab === 'hangar' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="border border-[#111111] bg-white p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search blueprints, hulls, stats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#cbd5e1] focus:border-[#111111] focus:outline-none"
                />
              </div>

              {/* BPO / BPC Origin Filter */}
              <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
                {(['all', 'bpo', 'bpc'] as const).map((orig) => (
                  <button
                    key={orig}
                    onClick={() => {
                      sound.play('click');
                      setOriginFilter(orig);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      originFilter === orig
                        ? 'bg-[#111111] text-white'
                        : 'border border-[#e2e8f0] text-[#666666] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    {orig === 'all' ? 'All Formats' : orig.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Type & Tier Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#e2e8f0]">
              <span className="text-[10px] text-[#64748b] font-bold uppercase mr-1">Category:</span>
              {(['all', 'ship', 'module', 'drone', 'subsystem', 'capital_component', 'structure', 'ammunition'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    sound.play('click');
                    setTypeFilter(t);
                  }}
                  className={`px-2 py-0.5 text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                    typeFilter === t
                      ? 'bg-[#111111] text-white'
                      : 'border border-[#cbd5e1] text-[#475569] hover:bg-[#f8fafc]'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}

              <span className="text-[10px] text-[#64748b] font-bold uppercase ml-3 mr-1">Tier:</span>
              {(['all', 'T1', 'T2', 'T3', 'Faction', 'Capital'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    sound.play('click');
                    setTierFilter(tier);
                  }}
                  className={`px-2 py-0.5 text-[11px] font-bold transition-colors cursor-pointer ${
                    tierFilter === tier
                      ? 'bg-[#111111] text-white'
                      : 'border border-[#cbd5e1] text-[#475569] hover:bg-[#f8fafc]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Blueprints Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBlueprints.map((bp) => {
              const isBpo = bp.isOriginal;
              const borderAccent = isBpo
                ? 'border-blue-500/80 shadow-[2px_2px_0px_#3b82f6]'
                : bp.techLevel === 'T2'
                ? 'border-amber-500/80 shadow-[2px_2px_0px_#f59e0b]'
                : bp.techLevel === 'T3'
                ? 'border-purple-500/80 shadow-[2px_2px_0px_#a855f7]'
                : bp.techLevel === 'Faction'
                ? 'border-emerald-500/80 shadow-[2px_2px_0px_#10b981]'
                : bp.techLevel === 'Capital'
                ? 'border-rose-600/80 shadow-[2px_2px_0px_#e11d48]'
                : 'border-cyan-500/80 shadow-[2px_2px_0px_#06b6d4]';

              const mfgCost = calculateManufacturingCost(bp, 1, selectedFacility);
              const mfgTime = calculateManufacturingTime(bp, 1, selectedFacility);

              return (
                <div
                  key={bp.id}
                  className={`border bg-white p-4 space-y-3 transition-all flex flex-col justify-between ${borderAccent}`}
                >
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase text-white ${
                              isBpo ? 'bg-blue-600' : 'bg-cyan-700'
                            }`}
                          >
                            {isBpo ? 'BPO ORIGINAL' : 'BPC COPY'}
                          </span>
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#f1f5f9] text-[#111111] border border-[#cbd5e1]">
                            {bp.techLevel}
                          </span>
                          {bp.faction && (
                            <span className="text-[10px] text-[#64748b] font-bold">
                              {bp.faction}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#111111] mt-1">{bp.name}</h4>
                      </div>

                      <div className="text-right text-[10px] font-mono">
                        <span className="text-[#64748b]">Runs: </span>
                        <span className="font-bold text-[#111111]">
                          {isBpo ? '∞ Infinite' : `${bp.runsRemaining} Left`}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#475569] line-clamp-2 leading-relaxed">
                      {bp.description}
                    </p>

                    {/* ME & TE Metrics with Visual Bars */}
                    <div className="grid grid-cols-2 gap-2 p-2 bg-[#f8fafc] border border-[#e2e8f0] text-xs font-mono">
                      <div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#64748b]">Material Efficiency</span>
                          <span className="font-bold text-blue-700">ME {bp.materialEfficiency}%</span>
                        </div>
                        <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-blue-600 h-full"
                            style={{ width: `${(bp.materialEfficiency / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#64748b]">Time Efficiency</span>
                          <span className="font-bold text-emerald-700">TE {bp.timeEfficiency}%</span>
                        </div>
                        <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-emerald-600 h-full"
                            style={{ width: `${(bp.timeEfficiency / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Output Stats Summary */}
                    <div className="p-2 border border-[#e2e8f0] bg-[#ffffff] space-y-1">
                      <div className="text-[10px] font-bold text-[#64748b] uppercase">Output Item:</div>
                      <div className="text-xs font-bold text-[#111111]">{bp.outputItem.name}</div>
                      <div className="text-[10px] text-[#475569] font-mono">{bp.outputItem.statSummary}</div>
                    </div>

                    {/* Build Costs Preview */}
                    <div className="text-[10px] font-mono text-[#64748b] flex flex-wrap gap-x-2">
                      <span>Metal: {mfgCost.metal.toLocaleString()}</span>
                      <span>Crystal: {mfgCost.crystal.toLocaleString()}</span>
                      <span>Deut: {mfgCost.deuterium.toLocaleString()}</span>
                      <span className="text-emerald-700 font-bold">Time: {mfgTime}s</span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="mt-3 pt-3 border-t border-[#e2e8f0] flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleOpenManufactureModal(bp)}
                      className="px-2.5 py-1 bg-[#111111] text-white text-[11px] font-bold hover:bg-[#333333] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Wrench className="w-3 h-3" /> Manufacture
                    </button>

                    {isBpo && (
                      <>
                        <button
                          onClick={() => handleStartMEResearch(bp.id)}
                          className="px-2 py-1 border border-[#cbd5e1] bg-[#f8fafc] hover:bg-[#111111] hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          +ME Research
                        </button>
                        <button
                          onClick={() => handleStartTEResearch(bp.id)}
                          className="px-2 py-1 border border-[#cbd5e1] bg-[#f8fafc] hover:bg-[#111111] hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          +TE Research
                        </button>
                        <button
                          onClick={() => handleOpenCopyModal(bp)}
                          className="px-2 py-1 border border-[#cbd5e1] bg-[#f8fafc] hover:bg-[#111111] hover:text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy BPC
                        </button>
                      </>
                    )}

                    {bp.inventionOutputId && (
                      <button
                        onClick={() => {
                          setSelectedInventionBpId(bp.id);
                          setActiveTab('invention');
                        }}
                        className="px-2 py-1 border border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Atom className="w-3 h-3" /> Invent T2
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: ACTIVE INDUSTRY JOBS DECK
         ======================================================== */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="border border-[#111111] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  ACTIVE INDUSTRY INSTALLATIONS & JOBS DECK
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Real-time status of all active manufacturing, ME research, TE research, copying, and reverse engineering jobs across empire stations.
                </p>
              </div>

              <span className="text-xs font-mono font-bold bg-[#f8fafc] px-3 py-1 border border-[#cbd5e1]">
                Total Jobs: {industryJobs.length}
              </span>
            </div>

            {industryJobs.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748b]">
                No industrial jobs currently active. Select a blueprint from the Hangar to commence manufacturing or laboratory research.
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {industryJobs.map((job) => {
                  const isDone = job.status === 'completed' || job.timeRemainingSeconds <= 0;
                  return (
                    <div
                      key={job.id}
                      className={`p-4 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isDone
                          ? 'border-emerald-500 bg-emerald-50/40'
                          : 'border-[#e2e8f0] bg-[#f8fafc]'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase text-white ${
                              job.type === 'manufacturing'
                                ? 'bg-[#111111]'
                                : job.type === 'me_research'
                                ? 'bg-blue-600'
                                : job.type === 'te_research'
                                ? 'bg-emerald-600'
                                : 'bg-purple-600'
                            }`}
                          >
                            {job.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-[#111111]">{job.blueprintName}</span>
                          <span className="text-[10px] text-[#64748b] font-mono">
                            Installed at {job.installedAt}
                          </span>
                        </div>

                        <div className="text-xs text-[#475569]">{job.outputDetails}</div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isDone ? 'bg-emerald-600' : 'bg-[#111111]'
                            }`}
                            style={{ width: `${job.progressPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-[#64748b]">
                          <span>Status: {isDone ? 'COMPLETED (Ready for Delivery)' : 'Fabricating...'}</span>
                          <span>
                            {isDone ? '0s' : `${job.timeRemainingSeconds}s remaining`} ({job.progressPercent}%)
                          </span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <button
                            onClick={() => handleDeliverJob(job.id)}
                            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#065f46]"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Deliver Output
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleInstantFinishJob(job.id)}
                              className="px-3 py-1.5 bg-[#111111] text-white text-xs font-bold hover:bg-[#333333] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <FastForward className="w-3.5 h-3.5" /> Instant Finish
                            </button>
                            <button
                              onClick={() => handleCancelJob(job.id)}
                              className="px-3 py-1.5 border border-[#cbd5e1] bg-white text-[#666666] text-xs font-bold hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: CRYPTOGRAPHIC INVENTION CONSOLE (T1 -> T2)
         ======================================================== */}
      {activeTab === 'invention' && (
        <div className="space-y-6">
          <div className="border border-[#111111] bg-white p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <Atom className="w-5 h-5 text-amber-500" />
                CRYPTOGRAPHIC INVENTION CONSOLE (TECH I → TECH II)
              </h3>
              <p className="text-xs text-[#666666] mt-0.5 max-w-3xl">
                Synthesize high-grade Tech II blueprint copies by submitting base Tech I blueprints to cryptographic decryption matrices. Combine specialized science Datacores and Decryptor items to modulate success probabilities, ME/TE ratings, and maximum fabrication runs.
              </p>
            </div>

            {/* Invention Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 border-t border-[#e2e8f0]">
              {/* Step 1: Base Blueprint Selector */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
                  1. Select Source Blueprint
                </span>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {blueprints
                    .filter((b) => b.techLevel === 'T1' && b.inventionOutputId)
                    .map((bp) => (
                      <div
                        key={bp.id}
                        onClick={() => setSelectedInventionBpId(bp.id)}
                        className={`p-3 border text-xs cursor-pointer transition-all ${
                          selectedInventionBpId === bp.id
                            ? 'border-[#111111] bg-[#f8fafc] font-bold shadow-[2px_2px_0px_#111111]'
                            : 'border-[#e2e8f0] bg-white hover:border-[#94a3b8]'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{bp.name}</span>
                          <span className="text-[10px] font-mono text-[#64748b]">
                            Base: {bp.inventionChance || 50}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Step 2: Decryptor Selector */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
                  2. Optional Cryptographic Decryptor
                </span>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {EVE_DECRYPTORS.map((dec) => (
                    <div
                      key={dec.id}
                      onClick={() => setSelectedDecryptorId(dec.id)}
                      className={`p-3 border text-xs cursor-pointer transition-all ${
                        selectedDecryptorId === dec.id
                          ? 'border-[#111111] bg-[#f8fafc] shadow-[2px_2px_0px_#111111]'
                          : 'border-[#e2e8f0] bg-white hover:border-[#94a3b8]'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span>{dec.name}</span>
                        <span
                          className={`text-[11px] font-mono ${
                            dec.probabilityBonus >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {dec.probabilityBonus >= 0 ? `+${dec.probabilityBonus}%` : `${dec.probabilityBonus}%`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748b] mt-1">{dec.description}</p>
                      <div className="mt-1.5 text-[10px] font-mono text-[#475569] flex gap-2">
                        <span>ME: {dec.meModifier >= 0 ? `+${dec.meModifier}` : dec.meModifier}</span>
                        <span>TE: {dec.teModifier >= 0 ? `+${dec.teModifier}` : dec.teModifier}</span>
                        <span>Runs: +{dec.runsModifier}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Probabilities & Execution */}
              <div className="space-y-4 bg-[#f8fafc] p-4 border border-[#111111]">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
                  3. Decryption Calculations & Run
                </span>

                {(() => {
                  const source = blueprints.find((b) => b.id === selectedInventionBpId);
                  const dec = EVE_DECRYPTORS.find((d) => d.id === selectedDecryptorId);
                  const chance = calculateInventionProbability(source?.inventionChance || 50, dec);

                  return (
                    <div className="space-y-3">
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-[#64748b]">Base Blueprint:</span>
                          <span className="font-bold text-[#111111]">{source?.name || 'None'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748b]">Base Success Odds:</span>
                          <span>{source?.inventionChance || 50}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748b]">Decryptor Modifier:</span>
                          <span className={dec && dec.probabilityBonus >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700'}>
                            {dec ? (dec.probabilityBonus >= 0 ? `+${dec.probabilityBonus}%` : `${dec.probabilityBonus}%`) : '0%'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748b]">Science Skill Bonus:</span>
                          <span className="text-emerald-700 font-bold">+10%</span>
                        </div>
                        <div className="pt-2 border-t border-[#cbd5e1] flex justify-between text-sm">
                          <span className="font-bold text-[#111111]">Final Success Rate:</span>
                          <span className="font-bold text-emerald-700 font-mono">{chance}%</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white border border-[#cbd5e1] text-xs font-mono space-y-1">
                        <div className="text-[10px] text-[#64748b] uppercase font-bold">Projected T2 Output:</div>
                        <div className="font-bold text-[#111111]">
                          ME {Math.max(0, 2 + (dec?.meModifier || 0))}% • TE {Math.max(0, 4 + (dec?.teModifier || 0))}%
                        </div>
                        <div className="text-[11px] text-[#475569]">
                          Fabrication Runs: {(source?.runsRemaining || 5) + (dec?.runsModifier || 0)} Runs
                        </div>
                      </div>

                      <button
                        disabled={inventionRolling || !source}
                        onClick={handleStartInvention}
                        className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          inventionRolling
                            ? 'bg-amber-500 text-white cursor-wait animate-pulse'
                            : 'bg-[#111111] text-white hover:bg-[#333333]'
                        }`}
                      >
                        {inventionRolling ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Executing Quantum Decryption...
                          </>
                        ) : (
                          <>
                            <Atom className="w-4 h-4" />
                            Initiate Invention Job (-45k Crystal)
                          </>
                        )}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: REVERSE ENGINEERING (T3 STRATEGIC CRUISERS)
         ======================================================== */}
      {activeTab === 'reverse_eng' && (
        <div className="space-y-6">
          <div className="border border-[#111111] bg-white p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-600" />
                REVERSE ENGINEERING FACILITY (TECH III STRATEGIC CRUISERS & SUBSYSTEMS)
              </h3>
              <p className="text-xs text-[#666666] mt-0.5 max-w-3xl">
                Scan ancient Sleeper and Talocan artifacts to extract modular Tech III hulls and subsystem blueprints (Tengu, Loki, Proteus, Legion). Intact relics yield the highest reconstruction fidelity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-[#e2e8f0]">
              {/* Relic Selection */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
                  1. Choose Ancient Relic
                </span>
                <div className="space-y-2">
                  {EVE_ANCIENT_RELICS.map((relic) => (
                    <div
                      key={relic.id}
                      onClick={() => setSelectedRelicId(relic.id)}
                      className={`p-3 border text-xs cursor-pointer transition-all ${
                        selectedRelicId === relic.id
                          ? 'border-[#111111] bg-[#f8fafc] font-bold shadow-[2px_2px_0px_#111111]'
                          : 'border-[#e2e8f0] bg-white hover:border-[#94a3b8]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{relic.name}</span>
                        <span className="font-mono text-purple-700 font-bold">{relic.baseSuccessRate}% Rate</span>
                      </div>
                      <p className="text-[11px] text-[#64748b] mt-1">{relic.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target T3 Subsystem or Hull */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
                  2. Target Modular Blueprint
                </span>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {INITIAL_EVE_BLUEPRINTS.filter((b) => b.techLevel === 'T3').map((bp) => (
                    <div
                      key={bp.id}
                      onClick={() => setSelectedReverseTargetId(bp.id)}
                      className={`p-3 border text-xs cursor-pointer transition-all ${
                        selectedReverseTargetId === bp.id
                          ? 'border-[#111111] bg-[#f8fafc] font-bold shadow-[2px_2px_0px_#111111]'
                          : 'border-[#e2e8f0] bg-white hover:border-[#94a3b8]'
                      }`}
                    >
                      <div className="font-bold text-[#111111]">{bp.name}</div>
                      <div className="text-[10px] text-[#64748b] mt-0.5">{bp.outputItem.statSummary}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution */}
              <div className="space-y-4 bg-[#f8fafc] p-4 border border-[#111111]">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
                  3. Reverse Synthesis
                </span>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Consumes 30,000 Naquadah & 40,000 Deuterium in high-energy scanning spectrometers.
                </p>

                <button
                  disabled={reverseEngRolling}
                  onClick={handleStartReverseEngineering}
                  className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    reverseEngRolling
                      ? 'bg-purple-600 text-white cursor-wait animate-pulse'
                      : 'bg-[#111111] text-white hover:bg-[#333333]'
                  }`}
                >
                  {reverseEngRolling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning Sleeper Geometry...
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4" />
                      Commence Reverse Engineering
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: EMPIRE BPO SEED MARKET
         ======================================================== */}
      {activeTab === 'market' && (
        <div className="space-y-4">
          <div className="border border-[#111111] bg-white p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  EMPIRE NAVY BPO SEED MARKET & CONTRACTS
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Official NPC market seeds providing unresearched Blueprint Originals (BPO) with infinite production runs for Naquadah.
                </p>
              </div>

              {/* Empire Filter */}
              <div className="flex flex-wrap gap-1">
                {(['all', 'Caldari', 'Minmatar', 'Gallente', 'Amarr', 'Upwell', 'Pirate'] as const).map((emp) => (
                  <button
                    key={emp}
                    onClick={() => {
                      sound.play('click');
                      setMarketEmpireFilter(emp);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                      marketEmpireFilter === emp
                        ? 'bg-[#111111] text-white'
                        : 'border border-[#cbd5e1] text-[#475569] hover:bg-[#f8fafc]'
                    }`}
                  >
                    {emp}
                  </button>
                ))}
              </div>
            </div>

            {/* Market Seed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {INITIAL_EVE_BLUEPRINTS.filter((bp) => bp.isOriginal)
                .filter((bp) => marketEmpireFilter === 'all' || bp.faction === marketEmpireFilter)
                .map((bp) => {
                  const seedPrice = bp.marketSeedPrice || 500000;
                  const canAffordSeed = (resources.naquadah || 0) >= seedPrice;

                  return (
                    <div
                      key={bp.id}
                      className="border border-[#e2e8f0] bg-white p-4 space-y-3 flex flex-col justify-between hover:border-[#111111] transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="px-1.5 py-0.5 bg-blue-600 text-white font-bold">BPO SEED</span>
                          <span className="text-[#64748b]">{bp.faction || 'Empire'}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#111111]">{bp.name}</h4>
                        <p className="text-[11px] text-[#475569] line-clamp-2">{bp.description}</p>
                        <div className="text-[10px] font-mono text-[#64748b]">
                          Output: {bp.outputItem.name} ({bp.outputItem.statSummary})
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
                        <div className="font-mono font-bold text-xs text-[#111111]">
                          {seedPrice.toLocaleString()} Naquadah
                        </div>
                        <button
                          disabled={!canAffordSeed}
                          onClick={() => handleBuyMarketBPO(bp)}
                          className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                            canAffordSeed
                              ? 'bg-[#111111] text-white hover:bg-[#333333]'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Purchase BPO
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: UPWELL CITADELS & INDUSTRIAL FACILITIES
         ======================================================== */}
      {activeTab === 'facilities' && (
        <div className="space-y-6">
          <div className="border border-[#111111] bg-white p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <Building className="w-5 h-5" />
                UPWELL CITADELS & INDUSTRIAL DOCK SELECTION
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Select your active manufacturing installation. Upwell engineering complexes (Raitaru, Azbel, Sotiyo) apply significant reductions to manufacturing time, raw material costs, and research job durations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {EVE_FACILITIES.map((fac) => {
                const isSelected = selectedFacilityId === fac.id;
                return (
                  <div
                    key={fac.id}
                    onClick={() => {
                      sound.play('click');
                      setSelectedFacilityId(fac.id);
                      localStorage.setItem('uc_selected_eve_facility', fac.id);
                      triggerFeedback(`Active industrial complex switched to ${fac.name}.`, 'info');
                    }}
                    className={`p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#111111] bg-[#ffffff] shadow-[3px_3px_0px_#111111]'
                        : 'border-[#e2e8f0] bg-[#f8fafc] hover:border-[#94a3b8]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#111111]">{fac.name}</div>
                          <div className="text-[10px] text-[#64748b]">{fac.location}</div>
                        </div>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#111111] text-white">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#475569] leading-relaxed">{fac.description}</p>

                      <div className="p-2 bg-white border border-[#e2e8f0] text-[10px] font-mono space-y-1">
                        <div className="text-emerald-700 font-bold">{fac.specializationBonus}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex justify-between text-xs font-mono text-[#64748b]">
                      <span>Time: {Math.round(fac.timeMultiplier * 100)}%</span>
                      <span>Materials: {Math.round(fac.materialMultiplier * 100)}%</span>
                      <span>Tax: {Math.round(fac.costMultiplier * 100)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: EVE ONLINE INDUSTRY CODEX & FORMULAS
         ======================================================== */}
      {activeTab === 'codex' && (
        <div className="space-y-6">
          <div className="border border-[#111111] bg-white p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                EVE ONLINE INDUSTRY CODEX & MATHEMATICAL MECHANICS
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Comprehensive reference documentation detailing exact formulas for Material Efficiency, Time Efficiency, Invention rates, and Capital sub-assembly requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#e2e8f0] text-xs leading-relaxed text-[#334155]">
              <div className="space-y-3 p-4 border border-[#e2e8f0] bg-[#f8fafc]">
                <h4 className="font-bold text-[#111111] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" /> Material Efficiency (ME) Formula
                </h4>
                <p>
                  Every level of ME reduces raw mineral and composite resource requirements by 1%, up to a hard cap of ME 10 (10% total material discount):
                </p>
                <div className="p-2.5 bg-white border border-[#cbd5e1] font-mono text-[11px] text-[#111111]">
                  Required Mineral = BaseCost × (1 - ME × 0.01) × FacilityMultiplier × Runs
                </div>
                <p className="text-[11px] text-[#64748b]">
                  Only BPOs can be researched for ME. BPCs inherit the ME level they were copied with.
                </p>
              </div>

              <div className="space-y-3 p-4 border border-[#e2e8f0] bg-[#f8fafc]">
                <h4 className="font-bold text-[#111111] flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Time Efficiency (TE) Formula
                </h4>
                <p>
                  TE reduces manufacturing duration by 1% per point, progressing up to TE 20 (20% reduction):
                </p>
                <div className="p-2.5 bg-white border border-[#cbd5e1] font-mono text-[11px] text-[#111111]">
                  Duration = BaseTime × (1 - TE × 0.01) × FacilityTimeMultiplier × Runs
                </div>
                <p className="text-[11px] text-[#64748b]">
                  Researching TE accelerates batch cycle times, essential for high-volume drone and ammo manufacturing lines.
                </p>
              </div>

              <div className="space-y-3 p-4 border border-[#e2e8f0] bg-[#f8fafc]">
                <h4 className="font-bold text-[#111111] flex items-center gap-1.5">
                  <Atom className="w-4 h-4" /> Invention & Decryptor Cryptanalysis
                </h4>
                <p>
                  Invention converts Tech I blueprints into advanced Tech II BPCs. The final probability calculation incorporates decryptor modifiers and empire science skills:
                </p>
                <div className="p-2.5 bg-white border border-[#cbd5e1] font-mono text-[11px] text-[#111111]">
                  Invention Chance % = BaseChance × (1 + DecryptorBonus × 0.01) + SkillBonus%
                </div>
                <p className="text-[11px] text-[#64748b]">
                  Decryptors also modify the resulting Tech II BPC's ME, TE, and maximum production run count.
                </p>
              </div>

              <div className="space-y-3 p-4 border border-[#e2e8f0] bg-[#f8fafc]">
                <h4 className="font-bold text-[#111111] flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Supercapitals & Capital Component Sub-Assemblies
                </h4>
                <p>
                  Dreadnoughts, Carriers, and Titans cannot be built from raw ore directly; they require intermediate Capital Components:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  <li>Capital Armor Plates & Capital Shield Emitters</li>
                  <li>Capital Core Temperature Regulators & Propulsion Engines</li>
                  <li>Capital Jump Drives & Capital Capacitor Batteries</li>
                  <li>Capital Doomsday Mounts (Titan exclusive)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MANUFACTURING & COPYING MODAL DIALOGS
         ======================================================== */}
      {activeModalType && activeModalBlueprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="border border-[#111111] bg-white w-full max-w-lg p-5 space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-[#e2e8f0] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">
                  {activeModalType === 'manufacture' ? 'INSTALL MANUFACTURING JOB' : 'INSTALL COPYING JOB'}
                </span>
                <h3 className="text-sm font-bold text-[#111111] mt-0.5">{activeModalBlueprint.name}</h3>
              </div>
              <button
                onClick={() => setActiveModalType(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeModalType === 'manufacture' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111111]">Production Runs:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setManufacturingRunsInput((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 border border-[#cbd5e1] font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={activeModalBlueprint.isOriginal ? 100 : activeModalBlueprint.runsRemaining}
                      value={manufacturingRunsInput}
                      onChange={(e) => setManufacturingRunsInput(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border border-[#cbd5e1] py-1 text-xs font-mono font-bold"
                    />
                    <button
                      onClick={() =>
                        setManufacturingRunsInput((prev) =>
                          activeModalBlueprint.isOriginal || prev < activeModalBlueprint.runsRemaining
                            ? prev + 1
                            : prev
                        )
                      }
                      className="w-7 h-7 border border-[#cbd5e1] font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {(() => {
                  const runs = Math.max(1, manufacturingRunsInput);
                  const cost = calculateManufacturingCost(activeModalBlueprint, runs, selectedFacility);
                  const duration = calculateManufacturingTime(activeModalBlueprint, runs, selectedFacility);

                  return (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] text-xs font-mono space-y-1.5">
                        <div className="text-[10px] text-[#64748b] font-bold uppercase">Required Materials:</div>
                        <div className="flex justify-between">
                          <span>Metal Ore:</span>
                          <span className={resources.metal >= cost.metal ? 'font-bold' : 'text-rose-700 font-bold'}>
                            {cost.metal.toLocaleString()} (Owned: {resources.metal?.toLocaleString()})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Crystal Silicon:</span>
                          <span className={resources.crystal >= cost.crystal ? 'font-bold' : 'text-rose-700 font-bold'}>
                            {cost.crystal.toLocaleString()} (Owned: {resources.crystal?.toLocaleString()})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deuterium:</span>
                          <span className={resources.deuterium >= cost.deuterium ? 'font-bold' : 'text-rose-700 font-bold'}>
                            {cost.deuterium.toLocaleString()} (Owned: {resources.deuterium?.toLocaleString()})
                          </span>
                        </div>
                        {cost.naquadah > 0 && (
                          <div className="flex justify-between">
                            <span>Naquadah:</span>
                            <span className={resources.naquadah >= cost.naquadah ? 'font-bold' : 'text-rose-700 font-bold'}>
                              {cost.naquadah.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-[#e2e8f0] flex justify-between font-bold">
                          <span>Job Duration:</span>
                          <span className="text-emerald-700">{duration} seconds</span>
                        </div>
                      </div>

                      <button
                        onClick={handleStartManufacturing}
                        className="w-full py-2.5 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] transition-colors cursor-pointer"
                      >
                        Confirm & Install Fabrication Job
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeModalType === 'copy' && (
              <div className="space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#111111]">Runs per Copy (Max {activeModalBlueprint.maxRunsPerCopy}):</span>
                    <input
                      type="number"
                      min={1}
                      max={activeModalBlueprint.maxRunsPerCopy}
                      value={copyRunsInput}
                      onChange={(e) =>
                        setCopyRunsInput(
                          Math.max(1, Math.min(activeModalBlueprint.maxRunsPerCopy, parseInt(e.target.value) || 1))
                        )
                      }
                      className="w-20 text-center border border-[#cbd5e1] py-1 font-mono font-bold"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#111111]">Number of Copies (1 - 10):</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={copyCountInput}
                      onChange={(e) => setCopyCountInput(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center border border-[#cbd5e1] py-1 font-mono font-bold"
                    />
                  </div>
                </div>

                {(() => {
                  const runsPerCopy = Math.min(activeModalBlueprint.maxRunsPerCopy, Math.max(1, copyRunsInput));
                  const copyCount = Math.max(1, Math.min(10, copyCountInput));
                  const { metalCost, crystalCost, timeSeconds } = calculateCopyCostAndTime(
                    activeModalBlueprint,
                    runsPerCopy,
                    copyCount
                  );

                  return (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] text-xs font-mono space-y-1">
                        <div className="flex justify-between">
                          <span>Metal Cost:</span>
                          <span>{metalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Crystal Cost:</span>
                          <span>{crystalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>Copy Duration:</span>
                          <span>{timeSeconds} seconds</span>
                        </div>
                      </div>

                      <button
                        onClick={handleStartCopying}
                        className="w-full py-2.5 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] transition-colors cursor-pointer"
                      >
                        Confirm & Install Copying Job
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
