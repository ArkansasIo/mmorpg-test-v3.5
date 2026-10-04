import React, { useState, useEffect } from 'react';
import {
  Factory,
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Shield,
  Flame,
  Droplet,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Play,
  Pause,
  Clock,
  Coins,
  CreditCard,
  Hammer,
  Truck,
  Wind,
  HeartPulse,
  Bomb,
  ShieldAlert,
  Battery,
  BatteryCharging,
  Maximize2,
  RotateCw,
  Activity,
  Gauge,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { sound } from '../../sound';
import {
  PlayerResources,
  AICProductionLine,
  AICRemoteMiningOutpost,
  AICManufacturedItem,
  AICCraftingQueueItem,
  PowerGridState,
  PowerGridSource,
  GridOverclockMode,
  AICConveyorTier,
} from '../../types';
import {
  INITIAL_AIC_LINES,
  INITIAL_AIC_OUTPOSTS,
  INITIAL_AIC_ITEMS,
  INITIAL_POWER_GRID,
} from '../../data/aicData';

export type AICTab = 'production' | 'logistics' | 'crafting' | 'power-grid' | 'grid-settings';

interface AICSystemViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
  onNavigate?: (route: string) => void;
  initialTab?: AICTab;
}

export const AICSystemView: React.FC<AICSystemViewProps> = ({
  resources,
  onUpdateResources,
  onNavigate,
  initialTab = 'production',
}) => {
  const [activeTab, setActiveTab] = useState<AICTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // AIC Production Lines State
  const [productionLines, setProductionLines] = useState<AICProductionLine[]>(() => {
    const saved = localStorage.getItem('uc_aic_production_lines');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_AIC_LINES;
  });

  // Remote Mining Outposts State
  const [outposts, setOutposts] = useState<AICRemoteMiningOutpost[]>(() => {
    const saved = localStorage.getItem('uc_aic_outposts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_AIC_OUTPOSTS;
  });

  // Manufactured Items State
  const [manufacturedItems, setManufacturedItems] = useState<AICManufacturedItem[]>(() => {
    const saved = localStorage.getItem('uc_aic_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_AIC_ITEMS;
  });

  // Crafting Queue State
  const [craftingQueue, setCraftingQueue] = useState<AICCraftingQueueItem[]>(() => {
    const saved = localStorage.getItem('uc_aic_craft_queue');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Power Grid State
  const [powerGrid, setPowerGrid] = useState<PowerGridState>(() => {
    const saved = localStorage.getItem('uc_power_grid_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_POWER_GRID;
  });

  // UI Notices
  const [notice, setNotice] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);
  const [craftCategoryFilter, setCraftCategoryFilter] = useState<'all' | 'gear' | 'explosives' | 'healing'>('all');
  const [isSimulatingFlow, setIsSimulatingFlow] = useState(true);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('uc_aic_production_lines', JSON.stringify(productionLines));
  }, [productionLines]);

  useEffect(() => {
    localStorage.setItem('uc_aic_outposts', JSON.stringify(outposts));
  }, [outposts]);

  useEffect(() => {
    localStorage.setItem('uc_aic_items', JSON.stringify(manufacturedItems));
  }, [manufacturedItems]);

  useEffect(() => {
    localStorage.setItem('uc_aic_craft_queue', JSON.stringify(craftingQueue));
  }, [craftingQueue]);

  useEffect(() => {
    localStorage.setItem('uc_power_grid_state', JSON.stringify(powerGrid));
  }, [powerGrid]);

  // Crafting Queue Progress Tick Engine
  useEffect(() => {
    const timer = setInterval(() => {
      setCraftingQueue((prevQueue) => {
        if (prevQueue.length === 0) return prevQueue;

        const updated = [...prevQueue];
        const current = { ...updated[0] };
        current.remainingSec = Math.max(0, current.remainingSec - 1);

        if (current.remainingSec <= 0) {
          // Item finished!
          sound.play('confirm');
          setManufacturedItems((prevItems) =>
            prevItems.map((it) =>
              it.id === current.itemId
                ? { ...it, stockQuantity: it.stockQuantity + current.quantity }
                : it
            )
          );
          setNotice({
            type: 'success',
            text: `Fabrication Complete: +${current.quantity}x ${current.itemName} delivered to armory stockpile!`,
          });
          updated.shift(); // Remove finished queue item
          return updated;
        }

        updated[0] = current;
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate Aggregates
  const totalPowerGenerated = powerGrid.sources.reduce((sum, s) => sum + (s.status === 'online' ? s.currentOutputMW : 0), 0);
  const totalFactoryPowerDraw = productionLines.reduce((sum, l) => sum + (l.status === 'running' ? l.powerDrawMW : 0), 0);
  const totalRemoteOutpostPowerDraw = outposts.reduce((sum, o) => sum + (o.status === 'active' ? o.requiredPowerMW : 0), 0);
  const totalBaselineGridDemand = 32000 + totalFactoryPowerDraw + totalRemoteOutpostPowerDraw;
  const powerSurplusMW = totalPowerGenerated - totalBaselineGridDemand;
  const gridCapacityPercent = Math.min(100, Math.round((totalBaselineGridDemand / Math.max(1, totalPowerGenerated)) * 100));

  // Handlers: Production Line Management
  const handleUpgradeLine = (lineId: string) => {
    const line = productionLines.find((l) => l.id === lineId);
    if (!line) return;

    const cost = line.upgradeCost;
    const credits = cost.credits || 0;
    const metal = cost.metal || 0;
    const crystal = cost.crystal || 0;
    const naquadah = cost.naquadah || 0;

    if (
      (resources.credits ?? 500000) < credits ||
      resources.metal < metal ||
      resources.crystal < crystal ||
      resources.naquadah < naquadah
    ) {
      sound.play('warning');
      setNotice({
        type: 'warning',
        text: `Insufficient funds/materials for ${line.name} upgrade! Need ${credits.toLocaleString()} GC, ${metal.toLocaleString()} Metal, ${crystal.toLocaleString()} Crystal.`,
      });
      return;
    }

    // Deduct
    onUpdateResources({
      credits: (resources.credits ?? 500000) - credits,
      metal: resources.metal - metal,
      crystal: resources.crystal - crystal,
      naquadah: resources.naquadah - naquadah,
    });

    setProductionLines((prev) =>
      prev.map((l) => {
        if (l.id === lineId) {
          return {
            ...l,
            tier: l.tier + 1,
            ratePerMin: Math.round(l.ratePerMin * 1.35),
            powerDrawMW: Math.round(l.powerDrawMW * 1.2),
            upgradeCost: {
              credits: Math.round((l.upgradeCost.credits || 30000) * 1.45),
              metal: Math.round((l.upgradeCost.metal || 20000) * 1.45),
              crystal: Math.round((l.upgradeCost.crystal || 15000) * 1.45),
              naquadah: Math.round((l.upgradeCost.naquadah || 3000) * 1.45),
            },
          };
        }
        return l;
      })
    );

    sound.play('research');
    setNotice({
      type: 'success',
      text: `Upgraded ${line.name} to Tier ${line.tier + 1}! Throughput increased by +35%.`,
    });
  };

  const handleToggleSprinkler = (lineId: string) => {
    sound.play('click');
    setProductionLines((prev) =>
      prev.map((l) => {
        if (l.id === lineId) {
          const next = !l.sprinklerBoostActive;
          return {
            ...l,
            sprinklerBoostActive: next,
            efficiencyPercent: next ? Math.min(100, l.efficiencyPercent + 12) : Math.max(80, l.efficiencyPercent - 12),
          };
        }
        return l;
      })
    );
  };

  const handleUpgradeConveyorTier = (lineId: string, nextTier: AICConveyorTier) => {
    const tierCosts: Record<AICConveyorTier, { credits: number; metal: number; crystal: number }> = {
      basic_belt: { credits: 5000, metal: 5000, crystal: 2000 },
      mag_belt: { credits: 20000, metal: 15000, crystal: 10000 },
      flux_tube: { credits: 50000, metal: 35000, crystal: 25000 },
      quantum_shunt: { credits: 120000, metal: 80000, crystal: 60000 },
    };

    const cost = tierCosts[nextTier];
    if ((resources.credits ?? 500000) < cost.credits || resources.metal < cost.metal || resources.crystal < cost.crystal) {
      sound.play('warning');
      setNotice({
        type: 'warning',
        text: `Insufficient resources to construct ${nextTier.replace('_', ' ').toUpperCase()}!`,
      });
      return;
    }

    onUpdateResources({
      credits: (resources.credits ?? 500000) - cost.credits,
      metal: resources.metal - cost.metal,
      crystal: resources.crystal - cost.crystal,
    });

    setProductionLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, conveyorTier: nextTier, efficiencyPercent: 100 } : l))
    );

    sound.play('research');
    setNotice({
      type: 'success',
      text: `Upgraded conveyor connection to ${nextTier.replace('_', ' ').toUpperCase()}! Zero bottleneck latency achieved.`,
    });
  };

  // Handlers: Remote Mining Logistics
  const handleDeployCargoDrone = (outpostId: string) => {
    const costCredits = 15000;
    const costMetal = 12000;
    const costCrystal = 8000;

    if ((resources.credits ?? 500000) < costCredits || resources.metal < costMetal || resources.crystal < costCrystal) {
      sound.play('warning');
      setNotice({
        type: 'warning',
        text: `Need ${costCredits.toLocaleString()} GC, ${costMetal.toLocaleString()} Metal to manufacture an Automated Heavy Drone!`,
      });
      return;
    }

    onUpdateResources({
      credits: (resources.credits ?? 500000) - costCredits,
      metal: resources.metal - costMetal,
      crystal: resources.crystal - costCrystal,
    });

    setOutposts((prev) =>
      prev.map((o) =>
        o.id === outpostId
          ? {
              ...o,
              cargoDronesCount: o.cargoDronesCount + 2,
              yieldPerHour: Math.round(o.yieldPerHour * 1.18),
            }
          : o
      )
    );

    sound.play('confirm');
    setNotice({
      type: 'success',
      text: `Dispatched 2x Heavy Cargo Drones to ${outpostId}! Sector extraction yield +18%.`,
    });
  };

  const handleBuildRelayPylon = (outpostId: string) => {
    const costCredits = 25000;
    const costMetal = 20000;
    const costCrystal = 15000;

    if ((resources.credits ?? 500000) < costCredits || resources.metal < costMetal || resources.crystal < costCrystal) {
      sound.play('warning');
      setNotice({
        type: 'warning',
        text: `Need ${costCredits.toLocaleString()} GC and ${costMetal.toLocaleString()} Metal for Sub-Station High-Voltage Relay!`,
      });
      return;
    }

    onUpdateResources({
      credits: (resources.credits ?? 500000) - costCredits,
      metal: resources.metal - costMetal,
      crystal: resources.crystal - costCrystal,
    });

    setOutposts((prev) =>
      prev.map((o) =>
        o.id === outpostId
          ? {
              ...o,
              powerRelayPylons: o.powerRelayPylons + 4,
              powerReceivedMW: o.powerReceivedMW + 400,
              efficiencyPercent: 100,
              status: 'active',
            }
          : o
      )
    );

    sound.play('research');
    setNotice({
      type: 'success',
      text: `Constructed 4x High-Voltage Power Relay Pylons. Full gigawatt transmission restored!`,
    });
  };

  const handleCollectRemoteYield = (outpost: AICRemoteMiningOutpost) => {
    const yieldAmount = Math.round(outpost.yieldPerHour / 2); // 30 min haul
    const resKey = outpost.resourceTarget === 'rare_alloys' ? 'metal' : outpost.resourceTarget;

    const currentVal = resources[resKey] || 0;
    onUpdateResources({
      [resKey]: currentVal + yieldAmount,
    });

    sound.play('trade');
    setNotice({
      type: 'success',
      text: `Freight Hauler Arrived! Deposited +${yieldAmount.toLocaleString()} ${outpost.resourceTarget.toUpperCase()} into main hub silos.`,
    });
  };

  // Handlers: Factory Floor Crafting
  const handleStartCrafting = (item: AICManufacturedItem, quantity: number = 1) => {
    const cost = item.craftingCost;
    const totalCredits = (cost.credits || 0) * quantity;
    const totalMetal = (cost.metal || 0) * quantity;
    const totalCrystal = (cost.crystal || 0) * quantity;
    const totalDeuterium = (cost.deuterium || 0) * quantity;
    const totalNaquadah = (cost.naquadah || 0) * quantity;

    if (
      (resources.credits ?? 500000) < totalCredits ||
      resources.metal < totalMetal ||
      resources.crystal < totalCrystal ||
      resources.deuterium < totalDeuterium ||
      resources.naquadah < totalNaquadah
    ) {
      sound.play('warning');
      setNotice({
        type: 'warning',
        text: `Insufficient raw materials/credits to manufacture ${quantity}x ${item.name}!`,
      });
      return;
    }

    onUpdateResources({
      credits: (resources.credits ?? 500000) - totalCredits,
      metal: resources.metal - totalMetal,
      crystal: resources.crystal - totalCrystal,
      deuterium: resources.deuterium - totalDeuterium,
      naquadah: resources.naquadah - totalNaquadah,
    });

    const newQueueItem: AICCraftingQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      quantity,
      completedQuantity: 0,
      durationSec: item.craftingTimeSec * quantity,
      remainingSec: item.craftingTimeSec * quantity,
      startedAt: Date.now(),
    };

    setCraftingQueue((prev) => [...prev, newQueueItem]);
    sound.play('confirm');
    setNotice({
      type: 'info',
      text: `Molecular Lattice Fabricator engaged: ${quantity}x ${item.name} queued for assembly (${item.craftingTimeSec * quantity}s).`,
    });
  };

  const handleInstantRushCraft = (queueId: string) => {
    const qItem = craftingQueue.find((q) => q.id === queueId);
    if (!qItem) return;

    const rushCostCredits = Math.max(2500, qItem.remainingSec * 150);
    if ((resources.credits ?? 500000) < rushCostCredits) {
      sound.play('warning');
      setNotice({
        type: 'warning',
        text: `Need ${rushCostCredits.toLocaleString()} Galactic Credits (GC) to instant-rush fabrication!`,
      });
      return;
    }

    onUpdateResources({
      credits: (resources.credits ?? 500000) - rushCostCredits,
    });

    setManufacturedItems((prev) =>
      prev.map((it) =>
        it.id === qItem.itemId ? { ...it, stockQuantity: it.stockQuantity + qItem.quantity } : it
      )
    );

    setCraftingQueue((prev) => prev.filter((q) => q.id !== queueId));
    sound.play('research');
    setNotice({
      type: 'success',
      text: `Overcharged Nanite Emitters! Rushed +${qItem.quantity}x ${qItem.itemName} straight to stockpile.`,
    });
  };

  const handleSellManufacturedStock = (item: AICManufacturedItem, quantity: number = 1) => {
    if (item.stockQuantity < quantity) {
      sound.play('warning');
      setNotice({
        type: 'warning',
        text: `Insufficient stock of ${item.name} to sell on galactic market!`,
      });
      return;
    }

    const earningsCredits = item.sellValueCredits * quantity;

    onUpdateResources({
      credits: (resources.credits ?? 500000) + earningsCredits,
    });

    setManufacturedItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, stockQuantity: it.stockQuantity - quantity } : it))
    );

    sound.play('trade');
    setNotice({
      type: 'success',
      text: `Sold ${quantity}x ${item.name} to Galactic Coalition merchants for +${earningsCredits.toLocaleString()} Galactic Credits (GC)!`,
    });
  };

  const handleToggleAutoReplenish = (itemId: string) => {
    sound.play('click');
    setManufacturedItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, autoCraftEnabled: !it.autoCraftEnabled } : it))
    );
  };

  // Handlers: Power Grid & Settings
  const handleUpgradePowerSource = (sourceId: string) => {
    const src = powerGrid.sources.find((s) => s.id === sourceId);
    if (!src) return;

    const cost = src.upgradeCost;
    if (
      (resources.credits ?? 500000) < cost.credits ||
      resources.metal < cost.metal ||
      resources.crystal < cost.crystal ||
      resources.deuterium < cost.deuterium ||
      resources.naquadah < cost.naquadah
    ) {
      sound.play('warning');
      setNotice({
        type: 'warning',
        text: `Insufficient materials for ${src.name} upgrade! Need ${cost.credits.toLocaleString()} GC.`,
      });
      return;
    }

    onUpdateResources({
      credits: (resources.credits ?? 500000) - cost.credits,
      metal: resources.metal - cost.metal,
      crystal: resources.crystal - cost.crystal,
      deuterium: resources.deuterium - cost.deuterium,
      naquadah: resources.naquadah - cost.naquadah,
    });

    setPowerGrid((prev) => {
      const updatedSources = prev.sources.map((s) => {
        if (s.id === sourceId) {
          const nextLevel = s.level + 1;
          return {
            ...s,
            level: nextLevel,
            currentOutputMW: Math.round(s.baseOutputMW * nextLevel * 1.25),
            upgradeCost: {
              credits: Math.round(s.upgradeCost.credits * 1.5),
              metal: Math.round(s.upgradeCost.metal * 1.4),
              crystal: Math.round(s.upgradeCost.crystal * 1.4),
              deuterium: Math.round(s.upgradeCost.deuterium * 1.4),
              naquadah: Math.round(s.upgradeCost.naquadah * 1.4),
            },
          };
        }
        return s;
      });

      const nextGen = updatedSources.reduce((sum, s) => sum + (s.status === 'online' ? s.currentOutputMW : 0), 0);
      return {
        ...prev,
        sources: updatedSources,
        totalGenerationMW: nextGen,
        batteryStorageMaxMWh: Math.round(prev.batteryStorageMaxMWh * 1.15),
      };
    });

    sound.play('research');
    setNotice({
      type: 'success',
      text: `Expanded ${src.name} to Level ${src.level + 1}! Power generation +25%.`,
    });
  };

  const handleSetOverclock = (mode: GridOverclockMode) => {
    sound.play('confirm');
    setPowerGrid((prev) => {
      const multiplier = mode === 'overclock_125' ? 1.25 : mode === 'danger_150' ? 1.5 : 1.0;
      const updatedSources = prev.sources.map((s) => ({
        ...s,
        currentOutputMW: Math.round(s.baseOutputMW * s.level * (s.status === 'online' ? multiplier : 0)),
      }));
      const nextGen = updatedSources.reduce((sum, s) => sum + s.currentOutputMW, 0);

      return {
        ...prev,
        totalGenerationMW: nextGen,
        settings: {
          ...prev.settings,
          overclockMode: mode,
        },
      };
    });

    setNotice({
      type: mode === 'danger_150' ? 'warning' : 'info',
      text: `Power Grid Overclock adjusted to [${mode.toUpperCase().replace('_', ' ')}]. Generation multiplied.`,
    });
  };

  const handlePurchaseEmergencyGridPower = () => {
    const subsidyCostCredits = 50000;
    if ((resources.credits ?? 500000) < subsidyCostCredits) {
      sound.play('warning');
      setNotice({
        type: 'warning',
        text: `Need ${subsidyCostCredits.toLocaleString()} Galactic Credits (GC) to purchase orbital power transmission!`,
      });
      return;
    }

    onUpdateResources({
      credits: (resources.credits ?? 500000) - subsidyCostCredits,
    });

    setPowerGrid((prev) => ({
      ...prev,
      batteryStorageCurrentMWh: Math.min(prev.batteryStorageMaxMWh, prev.batteryStorageCurrentMWh + 35000),
      gridStatus: 'optimal',
    }));

    sound.play('trade');
    setNotice({
      type: 'success',
      text: `Interstellar Subsidies Dispatched: Injected +35,000 MWh emergency capacitor reserves into planetary microgrid!`,
    });
  };

  const filteredItems = manufacturedItems.filter((it) =>
    craftCategoryFilter === 'all' ? true : it.category === craftCategoryFilter
  );

  return (
    <div id="aic-system-container" className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HERO HEADER & METRIC SUMMARY RIBBON */}
      {/* ========================================================================= */}
      <div className="border border-[#dedede] bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider">
                Industrial Core
              </span>
              <span className="text-xs text-[#777777] font-mono">AIC v4.8 · Microgrid Sync</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#111111] uppercase flex items-center gap-2">
              <Factory className="text-amber-600 w-6 h-6" />
              <span>Automated Industry Complex (AIC) & Power Grid Matrix</span>
            </h1>
            <p className="text-xs text-[#666666] mt-1 max-w-3xl leading-relaxed">
              Construct interconnected conveyor lines, cryo-sprinklers, and automated harvesters. Manage remote sector mining outposts with drone haulers and high-voltage power relay pylons. Manufacture military gear, tactical explosives, and auto-usable trauma meds straight from the factory floor.
            </p>
          </div>

          {/* Quick Credit & Energy Metric Badges */}
          <div className="flex flex-wrap gap-2">
            <div className="px-4 py-2 bg-[#fafafa] border border-[#dedede] font-mono">
              <span className="text-[9px] uppercase font-bold text-[#777777] block flex items-center gap-1">
                <CreditCard size={10} className="text-amber-500" />
                <span>Galactic Treasury:</span>
              </span>
              <strong className="text-base text-amber-900 font-bold">
                {(resources.credits ?? 500000).toLocaleString()}{' '}
                <span className="text-xs text-amber-600">GC</span>
              </strong>
            </div>

            <div className="px-4 py-2 bg-[#fafafa] border border-[#dedede] font-mono">
              <span className="text-[9px] uppercase font-bold text-[#777777] block flex items-center gap-1">
                <Zap size={10} className="text-amber-600" />
                <span>Grid Power Balance:</span>
              </span>
              <strong className={`text-base font-bold ${powerSurplusMW >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {powerSurplusMW >= 0 ? `+${powerSurplusMW.toLocaleString()}` : powerSurplusMW.toLocaleString()} MW
              </strong>
            </div>
          </div>
        </div>

        {/* Global Feedback Notice */}
        {notice && (
          <div
            className={`mt-4 p-3 border text-xs flex items-center justify-between transition-all ${
              notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : notice.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-600" />
              ) : notice.type === 'warning' ? (
                <AlertTriangle size={16} className="text-amber-600" />
              ) : (
                <Activity size={16} className="text-blue-600" />
              )}
              <span className="font-medium">{notice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-bold underline ml-4 hover:opacity-75 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-[#eeeeee] pt-4">
          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('production');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'production'
                ? 'bg-[#111111] text-white'
                : 'bg-[#f5f5f5] text-[#111111] hover:bg-[#eaeaea]'
            }`}
          >
            <Factory size={13} />
            <span>Automated Production Lines ({productionLines.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('logistics');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logistics'
                ? 'bg-[#111111] text-white'
                : 'bg-[#f5f5f5] text-[#111111] hover:bg-[#eaeaea]'
            }`}
          >
            <Truck size={13} />
            <span>Remote Mining Logistics ({outposts.length} Outposts)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('crafting');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'crafting'
                ? 'bg-[#111111] text-white'
                : 'bg-[#f5f5f5] text-[#111111] hover:bg-[#eaeaea]'
            }`}
          >
            <Hammer size={13} />
            <span>Factory Floor Crafting ({manufacturedItems.length} Recipes)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('power-grid');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'power-grid'
                ? 'bg-[#111111] text-white'
                : 'bg-[#f5f5f5] text-[#111111] hover:bg-[#eaeaea]'
            }`}
          >
            <Zap size={13} />
            <span>Power Grid Systems ({powerGrid.sources.length} Dynamos)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('grid-settings');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'grid-settings'
                ? 'bg-[#111111] text-white'
                : 'bg-[#f5f5f5] text-[#111111] hover:bg-[#eaeaea]'
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Microgrid Settings & Overclocking</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB CONTENT: AUTOMATED PRODUCTION LINES */}
      {/* ========================================================================= */}
      {activeTab === 'production' && (
        <div className="space-y-6">
          {/* Schematic Diagram Banner */}
          <div className="border border-[#dedede] bg-[#fafafa] p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-base text-[#111111] flex items-center gap-2">
                  <Cpu className="text-amber-600 w-5 h-5" />
                  <span>Continuous Conveyor & Refinement Schematic</span>
                </h3>
                <p className="text-xs text-[#666666] mt-1">
                  Harvester bucket-wheels feed crude crust through high-velocity mag-belts, treated with cryo-coolant sprinklers, smelted in arc furnaces, and fed to nanite assemblers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimulatingFlow(!isSimulatingFlow)}
                  className={`px-3 py-1.5 border text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5 ${
                    isSimulatingFlow ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-[#111111] border-[#dedede]'
                  }`}
                >
                  <Activity size={13} className={isSimulatingFlow ? 'animate-spin' : ''} />
                  <span>{isSimulatingFlow ? 'BELT SIM ACTIVE' : 'BELT SIM PAUSED'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Connected Production Lines Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {productionLines.map((line) => {
              const isSprinklerActive = line.sprinklerBoostActive;
              return (
                <div
                  key={line.id}
                  className="border border-[#dedede] bg-white p-5 flex flex-col justify-between hover:border-[#111111] transition-all shadow-sm"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-neutral-100 border border-[#dedede] text-sm">
                          {line.type === 'harvester' ? '🚜' : line.type === 'conveyor' ? '🛤️' : line.type === 'sprinkler' ? '🚿' : line.type === 'smelter' ? '🔥' : line.type === 'refinery' ? '🧪' : '🤖'}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-[#111111]">{line.name}</h4>
                          <span className="text-[10px] font-mono text-[#777777] uppercase">
                            Type: {line.type} · Conveyor: {line.conveyorTier.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-[#111111] text-white font-mono text-xs font-bold">
                        Tier {line.tier}
                      </span>
                    </div>

                    <p className="text-xs text-[#666666] leading-relaxed mb-4">
                      {line.description}
                    </p>

                    {/* Operational Metrics */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-[#fafafa] border border-[#eeeeee] font-mono text-xs text-center mb-4">
                      <div>
                        <span className="text-[9px] text-[#777777] block uppercase">Throughput</span>
                        <strong className="text-emerald-700 font-bold">
                          +{line.ratePerMin.toLocaleString()} kg/min
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#777777] block uppercase">Power Draw</span>
                        <span className="text-amber-700 font-bold">{line.powerDrawMW} MW</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#777777] block uppercase">Efficiency</span>
                        <span className="text-blue-700 font-bold">{line.efficiencyPercent}%</span>
                      </div>
                    </div>

                    {/* Conveyor Routing & Sprinkler Ribbon */}
                    <div className="p-3 bg-neutral-50 border border-[#eeeeee] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#666666] flex items-center gap-1 font-mono text-[11px]">
                          <span>In: <strong className="text-[#111111]">{line.inputResource}</strong></span>
                          <ArrowRight size={12} className="text-[#999999]" />
                          <span>Out: <strong className="text-emerald-800">{line.outputResource}</strong></span>
                        </span>
                      </div>

                      {/* Conveyor Tier Selector */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#eeeeee]">
                        <span className="text-[10px] font-bold text-[#777777] uppercase">Conveyor Belt:</span>
                        <div className="flex gap-1">
                          {(['basic_belt', 'mag_belt', 'flux_tube', 'quantum_shunt'] as const).map((tier) => (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => handleUpgradeConveyorTier(line.id, tier)}
                              className={`px-1.5 py-0.5 text-[9px] font-mono border cursor-pointer ${
                                line.conveyorTier === tier
                                  ? 'bg-[#111111] text-white border-[#111111] font-bold'
                                  : 'bg-white text-[#555555] border-[#dedede] hover:border-[#111111]'
                              }`}
                            >
                              {tier.split('_')[0].toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[#eeeeee] flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpgradeLine(line.id)}
                      className="flex-1 py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-emerald-700 transition-colors cursor-pointer font-mono"
                    >
                      Upgrade (+1 Tier) · {(line.upgradeCost.credits || 0) / 1000}k GC | {(line.upgradeCost.metal || 0) / 1000}k M
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSprinkler(line.id)}
                      className={`px-3 py-2 text-xs font-bold border cursor-pointer flex items-center gap-1 font-mono transition-colors ${
                        isSprinklerActive
                          ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                          : 'bg-white text-[#777777] border-[#dedede] hover:border-cyan-500'
                      }`}
                    >
                      <Droplet size={13} className={isSprinklerActive ? 'text-cyan-600 fill-cyan-600' : ''} />
                      <span>{isSprinklerActive ? 'Cryo-Mist: ON' : 'Cryo-Mist: OFF'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT: REMOTE MINING LOGISTICS & POWER RELAY */}
      {/* ========================================================================= */}
      {activeTab === 'logistics' && (
        <div className="space-y-6">
          <div className="border border-[#dedede] bg-[#fafafa] p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-base text-[#111111] flex items-center gap-2">
                  <Truck className="text-amber-600 w-5 h-5" />
                  <span>Planetary & Asteroid Remote Logistics Outposts</span>
                </h3>
                <p className="text-xs text-[#666666] mt-1">
                  Transmit gigawatt microwave power via sub-station relays to remote mining sectors and haul concentrated ores back with cargo drone swarms.
                </p>
              </div>
              <div className="px-3 py-1.5 bg-white border border-[#dedede] font-mono text-xs">
                <span className="text-[#777777] block text-[9px] uppercase">Active Outposts:</span>
                <strong className="text-emerald-700 font-bold">{outposts.length} Outposts Operational</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {outposts.map((outpost) => {
              const isLowPower = outpost.powerReceivedMW < outpost.requiredPowerMW;
              return (
                <div
                  key={outpost.id}
                  className="border border-[#dedede] bg-white p-5 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2.5 mb-3">
                      <div>
                        <h4 className="font-bold text-sm text-[#111111]">{outpost.sectorName}</h4>
                        <span className="text-[10px] font-mono text-[#777777]">
                          Coords: {outpost.coordinates} · Dist: {outpost.distanceKm} km
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 font-mono text-xs font-bold uppercase ${
                          isLowPower ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {isLowPower ? 'Power Deficit' : 'Online · 100%'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-[#fafafa] border border-[#eeeeee] font-mono text-xs text-center mb-4">
                      <div>
                        <span className="text-[9px] text-[#777777] block uppercase">Target Ore</span>
                        <strong className="text-amber-800 font-bold uppercase">{outpost.resourceTarget}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#777777] block uppercase">Yield Rate</span>
                        <strong className="text-emerald-700 font-bold">
                          +{outpost.yieldPerHour.toLocaleString()}/h
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#777777] block uppercase">Cargo Drones</span>
                        <span className="text-blue-700 font-bold">{outpost.cargoDronesCount} Active</span>
                      </div>
                    </div>

                    {/* Power Relay & Hauler Status */}
                    <div className="p-3 bg-neutral-50 border border-[#eeeeee] space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-[#666666]">Sub-Station Power Relay:</span>
                        <strong className={isLowPower ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                          {outpost.powerReceivedMW} MW / {outpost.requiredPowerMW} MW ({outpost.powerRelayPylons} Pylons)
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#666666]">Freight Hauler Shuttle:</span>
                        <span className="text-[#111111] uppercase font-bold text-[11px]">
                          {outpost.freightHaulerStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[#eeeeee] flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCollectRemoteYield(outpost)}
                      className="flex-1 py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Receive Freight Load (+{Math.round(outpost.yieldPerHour / 2).toLocaleString()})
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeployCargoDrone(outpost.id)}
                      className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-bold font-mono border border-[#dedede] cursor-pointer"
                    >
                      +2 Drones (15k GC)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBuildRelayPylon(outpost.id)}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold font-mono border border-amber-300 cursor-pointer"
                    >
                      +4 Pylons (25k GC)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB CONTENT: FACTORY FLOOR CRAFTING (GEAR, EXPLOSIVES, HEALING) */}
      {/* ========================================================================= */}
      {activeTab === 'crafting' && (
        <div className="space-y-6">
          <div className="border border-[#dedede] bg-[#fafafa] p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-base text-[#111111] flex items-center gap-2">
                  <Hammer className="text-amber-600 w-5 h-5" />
                  <span>Factory Floor Military & Consumable Manufacturing</span>
                </h3>
                <p className="text-xs text-[#666666] mt-1">
                  Fabricate high-tier combat exosuits, tactical seismic charges, and auto-usable nanite trauma med-packs. Sell surplus goods for Galactic Credits.
                </p>
              </div>

              {/* Category Filter Buttons */}
              <div className="flex gap-1 bg-white p-1 border border-[#dedede]">
                {(['all', 'gear', 'explosives', 'healing'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      sound.play('click');
                      setCraftCategoryFilter(cat);
                    }}
                    className={`px-3 py-1 text-xs font-bold uppercase font-mono cursor-pointer transition-colors ${
                      craftCategoryFilter === cat ? 'bg-[#111111] text-white' : 'text-[#666666] hover:text-[#111111]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Crafting Queue Strip */}
          {craftingQueue.length > 0 && (
            <div className="border border-amber-300 bg-amber-50/60 p-4 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                  <span>Active Assembly Lines ({craftingQueue.length} In Progress)</span>
                </span>
                <span className="text-[11px] font-mono text-amber-800">
                  Next Completion in: {craftingQueue[0].remainingSec}s
                </span>
              </h4>

              <div className="space-y-2">
                {craftingQueue.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3 bg-white border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-amber-600 text-white font-bold text-[10px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <strong className="text-[#111111] block">{q.quantity}x {q.itemName}</strong>
                        <span className="text-[10px] text-[#777777]">
                          Time Remaining: {q.remainingSec}s / {q.durationSec}s
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInstantRushCraft(q.id)}
                      className="px-3 py-1.5 bg-[#111111] hover:bg-amber-600 text-white text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles size={12} />
                      <span>Instant Rush ({Math.max(2500, q.remainingSec * 150).toLocaleString()} GC)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recipe Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const cost = item.craftingCost;
              return (
                <div
                  key={item.id}
                  className="border border-[#dedede] bg-white p-5 flex flex-col justify-between hover:border-[#111111] transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-[#111111]">{item.name}</h4>
                          <span className="text-[10px] font-mono text-[#777777] uppercase">
                            Tier {item.tier} · Category: {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-800 block">
                          Stock: {item.stockQuantity}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#666666] leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Combat Effect */}
                    <div className="p-2.5 bg-neutral-50 border border-[#eeeeee] text-xs font-mono text-indigo-900 mb-3">
                      <strong className="text-[10px] uppercase text-[#777777] block">Tactical Combat Effect:</strong>
                      <span>{item.combatEffect}</span>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="p-2.5 bg-[#fafafa] border border-[#eeeeee] font-mono text-[11px] text-[#555555] space-y-1">
                      <div className="flex justify-between">
                        <span>Crafting Cost:</span>
                        <span className="text-[#111111] font-bold">
                          {cost.credits ? `${cost.credits} GC ` : ''}
                          {cost.metal ? `${cost.metal} M ` : ''}
                          {cost.crystal ? `${cost.crystal} C ` : ''}
                          {cost.deuterium ? `${cost.deuterium} D ` : ''}
                          {cost.naquadah ? `${cost.naquadah} NQ` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Market Value:</span>
                        <span className="text-amber-800 font-bold">+{item.sellValueCredits.toLocaleString()} GC</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Auto-Replenish Switch */}
                  <div className="mt-4 pt-3 border-t border-[#eeeeee] space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartCrafting(item, 1)}
                        className="flex-1 py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Craft 1x ({item.craftingTimeSec}s)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartCrafting(item, 5)}
                        className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-bold font-mono border border-[#dedede] cursor-pointer"
                      >
                        5x
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <button
                        type="button"
                        onClick={() => handleSellManufacturedStock(item, 1)}
                        className="text-amber-800 hover:underline font-bold cursor-pointer"
                      >
                        Sell 1x (+{item.sellValueCredits} GC)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAutoReplenish(item.id)}
                        className={`text-[10px] uppercase font-bold cursor-pointer ${
                          item.autoCraftEnabled ? 'text-emerald-700' : 'text-[#888888]'
                        }`}
                      >
                        Auto-Refill: {item.autoCraftEnabled ? 'ON (≥' + item.autoReplenishThreshold + ')' : 'OFF'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB CONTENT: POWER GRID SYSTEMS (GENERATION & DYNAMOS) */}
      {/* ========================================================================= */}
      {activeTab === 'power-grid' && (
        <div className="space-y-6">
          <div className="border border-[#dedede] bg-[#fafafa] p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-base text-[#111111] flex items-center gap-2">
                  <Zap className="text-amber-600 w-5 h-5" />
                  <span>Planetary Microgrid Power Generation Core</span>
                </h3>
                <p className="text-xs text-[#666666] mt-1">
                  Manage primary energy plants, Tokamak fusion reactors, Dyson collectors, and superconducting capacitor banks.
                </p>
              </div>
              <div className="flex gap-2 font-mono text-xs">
                <div className="px-3 py-1.5 bg-white border border-[#dedede]">
                  <span className="text-[#777777] block text-[9px] uppercase">Total Generation:</span>
                  <strong className="text-emerald-700 font-bold">{totalPowerGenerated.toLocaleString()} MW</strong>
                </div>
                <div className="px-3 py-1.5 bg-white border border-[#dedede]">
                  <span className="text-[#777777] block text-[9px] uppercase">Grid Demand:</span>
                  <strong className="text-amber-800 font-bold">{totalBaselineGridDemand.toLocaleString()} MW</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Battery Capacity Ribbon */}
          <div className="border border-[#dedede] bg-white p-5 space-y-3">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-xs font-bold text-[#111111] uppercase flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-emerald-600" />
                <span>Superconducting Magnetic Energy Storage (SMES) Capacitor Bank</span>
              </span>
              <span className="text-xs text-emerald-700 font-bold">
                {powerGrid.batteryStorageCurrentMWh.toLocaleString()} / {powerGrid.batteryStorageMaxMWh.toLocaleString()} MWh (85.6%)
              </span>
            </div>
            <div className="w-full h-3 bg-[#eeeeee] overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{
                  width: `${Math.round((powerGrid.batteryStorageCurrentMWh / powerGrid.batteryStorageMaxMWh) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Power Generation Dynamos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {powerGrid.sources.map((src) => (
              <div
                key={src.id}
                className="border border-[#dedede] bg-white p-5 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{src.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-[#111111]">{src.name}</h4>
                        <span className="text-[10px] font-mono text-[#777777] uppercase">
                          Type: {src.type} · Efficiency: {src.efficiencyPercent}%
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-[#111111] text-white font-mono text-xs font-bold">
                      Lvl {src.level}/{src.maxLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#fafafa] border border-[#eeeeee] font-mono text-xs text-center mb-3">
                    <div>
                      <span className="text-[9px] text-[#777777] block uppercase">Current Output</span>
                      <strong className="text-emerald-700 font-bold">
                        +{src.currentOutputMW.toLocaleString()} MW
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#777777] block uppercase">Fuel Feed</span>
                      <span className="text-[#555555] text-[10px]">{src.fuelConsumptionPerMin || 'None'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpgradePowerSource(src.id)}
                  className="mt-4 w-full py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-amber-600 transition-colors cursor-pointer font-mono"
                >
                  Upgrade Plant (+25%) · {src.upgradeCost.credits / 1000}k GC | {src.upgradeCost.metal / 1000}k M
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB CONTENT: GRID SETTINGS & OVERCLOCKING */}
      {/* ========================================================================= */}
      {activeTab === 'grid-settings' && (
        <div className="space-y-6">
          <div className="border border-[#dedede] bg-white p-6 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-[#111111] flex items-center gap-2">
                <SlidersHorizontal className="text-amber-600 w-5 h-5" />
                <span>Microgrid Tuning, Frequency Stabilization & Overclock Protocols</span>
              </h3>
              <p className="text-xs text-[#666666] mt-1">
                Configure governor frequency, load shedding priorities, automatic emergency battery discharge, and emergency interstellar power subsidies.
              </p>
            </div>

            {/* Overclocking Selector */}
            <div className="border border-[#dedede] p-4 bg-[#fafafa] space-y-3">
              <span className="text-xs font-bold text-[#111111] uppercase block">
                Planetary Grid Overclocking Protocol:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'normal', name: 'Standard Mode (100%)', desc: 'Optimal generator lifecycle, 0% meltdown risk', color: 'border-[#dedede]' },
                  { id: 'overclock_125', name: 'High Output (125%)', desc: '+25% Megawatt generation, +15% fuel draw', color: 'border-amber-400' },
                  { id: 'danger_150', name: 'Overdrive Danger (150%)', desc: '+50% Power surge, high blackout/wear risk', color: 'border-rose-400' },
                ].map((mode) => {
                  const isSelected = powerGrid.settings.overclockMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleSetOverclock(mode.id as GridOverclockMode)}
                      className={`p-4 text-left border cursor-pointer transition-all ${
                        isSelected ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white hover:border-[#111111]'
                      }`}
                    >
                      <strong className="text-xs uppercase block">{mode.name}</strong>
                      <span className={`text-[11px] block mt-1 ${isSelected ? 'text-neutral-300' : 'text-[#666666]'}`}>
                        {mode.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Load Shedding Hierarchy */}
            <div className="border border-[#dedede] p-4 bg-[#fafafa] space-y-3">
              <span className="text-xs font-bold text-[#111111] uppercase block">
                Automatic Brownout Load Shedding Priority Order:
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {powerGrid.settings.loadSheddingPriority.map((stage, idx) => (
                  <div
                    key={stage}
                    className="p-2.5 bg-white border border-[#dedede] flex items-center gap-2 font-bold"
                  >
                    <span className="px-1.5 py-0.5 bg-[#111111] text-white text-[10px]">#{idx + 1}</span>
                    <span className="uppercase text-[#111111]">{stage.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Subsidies */}
            <div className="border border-amber-300 bg-amber-50/70 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-bold text-sm text-amber-950 uppercase flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  <span>Purchase Orbital Emergency Power Subsidies</span>
                </h4>
                <p className="text-xs text-amber-900 mt-1">
                  Inject +35,000 MWh immediate reserve charge into the capacitor grid using Galactic Credits.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePurchaseEmergencyGridPower}
                className="px-5 py-2.5 bg-[#111111] hover:bg-amber-600 text-white text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Coins size={14} />
                <span>Inject Power (50k GC)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
