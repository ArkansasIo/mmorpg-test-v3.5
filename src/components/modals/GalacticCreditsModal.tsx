import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Coins,
  TrendingUp,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
  Building,
  DollarSign,
  Layers,
  Flame,
  Droplet,
  Gem,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  ExternalLink,
  RefreshCw,
  Gift,
} from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources } from '../../types';

interface GalacticCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: PlayerResources;
  onUpdateResources?: (res: Partial<PlayerResources>) => void;
  onNavigate?: (route: string) => void;
}

interface TransactionRecord {
  id: string;
  time: string;
  desc: string;
  amount: number;
  type: 'credit' | 'debit';
  category: 'aic' | 'fx' | 'stimulus' | 'bond' | 'market';
}

export const GalacticCreditsModal: React.FC<GalacticCreditsModalProps> = ({
  isOpen,
  onClose,
  resources,
  onUpdateResources,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'exchange' | 'treasury' | 'utility' | 'ledger'>('overview');
  
  // FX State
  const [swapDirection, setSwapDirection] = useState<'buy_resource' | 'sell_resource'>('buy_resource');
  const [selectedResource, setSelectedResource] = useState<'naquadah' | 'metal' | 'crystal' | 'deuterium' | 'darkMatter'>('metal');
  const [swapAmount, setSwapAmount] = useState<number>(50000);
  const [fxNotice, setFxNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stimulus & Bond state
  const [stimulusClaimed, setStimulusClaimed] = useState<boolean>(false);
  const [activeBond, setActiveBond] = useState<{ amount: number; returnsInTurns: number; expectedReturn: number } | null>(null);

  // Local simulated ledger
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'tx-1',
      time: 'Just now',
      desc: 'AIC Factory Yield Settlement (+250 GC/turn)',
      amount: 250,
      type: 'credit',
      category: 'aic',
    },
    {
      id: 'tx-2',
      time: '2m ago',
      desc: 'Interstellar Trade Guild Tariff Dividend',
      amount: 1400,
      type: 'credit',
      category: 'market',
    },
    {
      id: 'tx-3',
      time: '5m ago',
      desc: 'Central Galactic Bank Sovereign Reserve Allocation',
      amount: 5000,
      type: 'credit',
      category: 'stimulus',
    },
  ]);

  if (!isOpen) return null;

  const currentCredits = resources.credits ?? 500000;

  // Exchange Rates (1 GC = X of Resource, or 1 Resource = Y of GC)
  // Base rates:
  // Metal: 1 GC buys 0.85 Metal. 1 Metal sells for 0.70 GC.
  // Crystal: 1 GC buys 0.50 Crystal. 1 Crystal sells for 0.40 GC.
  // Deuterium: 1 GC buys 0.25 Deuterium. 1 Deuterium sells for 0.20 GC.
  // Naquadah: 1 GC buys 0.55 Naquadah. 1 Naquadah sells for 0.75 GC.
  // Dark Matter: 1 Dark Matter costs 10,000 GC. 1 Dark Matter sells for 8,500 GC.
  const rates = {
    metal: { buyRate: 0.85, sellRate: 0.70, name: 'Refined Metal', icon: Layers, unit: 'MTL' },
    crystal: { buyRate: 0.50, sellRate: 0.40, name: 'Rare Crystal', icon: Gem, unit: 'CRY' },
    deuterium: { buyRate: 0.25, sellRate: 0.20, name: 'Deuterium Isotope', icon: Droplet, unit: 'DEU' },
    naquadah: { buyRate: 0.55, sellRate: 0.75, name: 'Liquid Naquadah', icon: Flame, unit: 'NQ' },
    darkMatter: { buyRate: 0.0001, sellRate: 0.000085, name: 'Exotic Dark Matter', icon: Sparkles, unit: 'DM' },
  };

  const currentRateObj = rates[selectedResource];

  // Quick Preset Swaps
  const quickSwaps = [
    { title: 'Buy 50k Metal', cost: 58800, resKey: 'metal' as const, amount: 50000, label: '50,000 Metal', icon: Layers },
    { title: 'Buy 30k Crystal', cost: 60000, resKey: 'crystal' as const, amount: 30000, label: '30,000 Crystal', icon: Gem },
    { title: 'Buy 15k Deuterium', cost: 60000, resKey: 'deuterium' as const, amount: 15000, label: '15,000 Deuterium', icon: Droplet },
    { title: 'Buy 25k Naquadah', cost: 45450, resKey: 'naquadah' as const, amount: 25000, label: '25,000 Naquadah', icon: Flame },
  ];

  const handleQuickBuy = (cost: number, resKey: 'metal' | 'crystal' | 'deuterium' | 'naquadah', amount: number) => {
    if (currentCredits < cost) {
      sound.play('warning');
      setFxNotice({ type: 'error', text: `Insufficient Galactic Credits! Need ${cost.toLocaleString()} GC.` });
      return;
    }

    if (onUpdateResources) {
      sound.play('trade');
      const currentResVal = (resources[resKey] as number) ?? 0;
      onUpdateResources({
        credits: currentCredits - cost,
        [resKey]: currentResVal + amount,
      });

      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        time: 'Just now',
        desc: `FX Purchase: ${amount.toLocaleString()} ${resKey.toUpperCase()}`,
        amount: cost,
        type: 'debit',
        category: 'fx',
      };
      setTransactions((prev) => [newTx, ...prev.slice(0, 19)]);
      setFxNotice({
        type: 'success',
        text: `Successfully acquired ${amount.toLocaleString()} ${resKey.toUpperCase()} for ${cost.toLocaleString()} GC.`,
      });
    }
  };

  const handleExecuteCustomSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateResources) return;

    if (swapDirection === 'buy_resource') {
      // User pays GC to get resource
      // swapAmount is amount of GC
      if (swapAmount <= 0) return;
      if (currentCredits < swapAmount) {
        sound.play('warning');
        setFxNotice({ type: 'error', text: 'Insufficient Galactic Credits for this exchange.' });
        return;
      }

      const receivedUnits = Math.floor(swapAmount * currentRateObj.buyRate);
      if (receivedUnits <= 0) {
        sound.play('warning');
        setFxNotice({ type: 'error', text: 'Exchange amount too small for minimum unit output.' });
        return;
      }

      sound.play('trade');
      const currentResVal = (resources[selectedResource] as number) ?? 0;
      onUpdateResources({
        credits: currentCredits - swapAmount,
        [selectedResource]: currentResVal + receivedUnits,
      });

      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        time: 'Just now',
        desc: `Interstellar FX: +${receivedUnits.toLocaleString()} ${currentRateObj.unit} for -${swapAmount.toLocaleString()} GC`,
        amount: swapAmount,
        type: 'debit',
        category: 'fx',
      };
      setTransactions((prev) => [newTx, ...prev.slice(0, 19)]);
      setFxNotice({
        type: 'success',
        text: `Exchange Complete: Disbursed ${swapAmount.toLocaleString()} GC for +${receivedUnits.toLocaleString()} ${currentRateObj.name}.`,
      });
    } else {
      // User sells resource to get GC
      // swapAmount is amount of Resource to sell
      const currentResVal = (resources[selectedResource] as number) ?? 0;
      if (swapAmount <= 0) return;
      if (currentResVal < swapAmount) {
        sound.play('warning');
        setFxNotice({
          type: 'error',
          text: `Insufficient ${currentRateObj.name} in reserves. You have ${currentResVal.toLocaleString()}.`,
        });
        return;
      }

      const receivedCredits = Math.floor(swapAmount * (selectedResource === 'darkMatter' ? 8500 : currentRateObj.sellRate));
      sound.play('trade');
      onUpdateResources({
        credits: currentCredits + receivedCredits,
        [selectedResource]: currentResVal - swapAmount,
      });

      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        time: 'Just now',
        desc: `Resource Liquidation: Sold ${swapAmount.toLocaleString()} ${currentRateObj.unit} for +${receivedCredits.toLocaleString()} GC`,
        amount: receivedCredits,
        type: 'credit',
        category: 'fx',
      };
      setTransactions((prev) => [newTx, ...prev.slice(0, 19)]);
      setFxNotice({
        type: 'success',
        text: `Liquidation Complete: Sold ${swapAmount.toLocaleString()} ${currentRateObj.name} for +${receivedCredits.toLocaleString()} GC.`,
      });
    }
  };

  const handleClaimStimulus = () => {
    if (stimulusClaimed) return;
    if (onUpdateResources) {
      sound.play('confirm');
      onUpdateResources({
        credits: currentCredits + 25000,
      });
      setStimulusClaimed(true);
      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        time: 'Just now',
        desc: 'Central Bank Emergency Sovereign Stimulus Grant',
        amount: 25000,
        type: 'credit',
        category: 'stimulus',
      };
      setTransactions((prev) => [newTx, ...prev.slice(0, 19)]);
    }
  };

  const handleIssueBond = () => {
    if (currentCredits < 100000) {
      sound.play('warning');
      setFxNotice({ type: 'error', text: 'Need at least 100,000 GC to issue a High-Yield Sovereign Bond.' });
      return;
    }
    if (onUpdateResources) {
      sound.play('confirm');
      onUpdateResources({
        credits: currentCredits - 100000,
      });
      setActiveBond({
        amount: 100000,
        returnsInTurns: 10,
        expectedReturn: 118000,
      });
      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        time: 'Just now',
        desc: 'Issued 10-Turn Sovereign Treasury Bond (18% Coupon Yield)',
        amount: 100000,
        type: 'debit',
        category: 'bond',
      };
      setTransactions((prev) => [newTx, ...prev.slice(0, 19)]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5"
      id="galactic-credits-system-modal"
    >
      <div className="bg-white border-2 border-amber-500/60 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl font-mono text-[#111111] animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#111111] text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-md rounded-xs">
              <Coins size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-400">
                  Galactic Credits Monetary System (GCS-9000)
                </h2>
                <span className="hidden sm:inline-block px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  UNIVERSAL TENDER · 30 UNIVERSES
                </span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Interstellar Central Bank · Sovereign Liquidity Reserve · Real-Time FX Matrix
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.play('click');
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Summary Ribbon */}
        <div className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-bold uppercase text-[10px]">Liquid Balance:</span>
            <strong className="text-base font-black text-amber-400 tracking-tight">
              {currentCredits.toLocaleString()} <span className="text-xs text-amber-500">GC</span>
            </strong>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5 bg-neutral-800/80 px-2.5 py-1 border border-neutral-700">
              <TrendingUp size={13} className="text-emerald-400" />
              <span className="text-neutral-400">Net Yield:</span>
              <strong className="text-emerald-400 font-bold">+570 GC/t (+34.2k/h)</strong>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-800/80 px-2.5 py-1 border border-neutral-700">
              <ShieldCheck size={13} className="text-cyan-400" />
              <span className="text-neutral-400">Rating:</span>
              <strong className="text-cyan-300 font-bold">AAA+ Sovereign</strong>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-800/80 px-2.5 py-1 border border-neutral-700">
              <Lock size={13} className="text-amber-400" />
              <span className="text-neutral-400">Backing:</span>
              <strong className="text-amber-300 font-bold">100% Reserve Solvency</strong>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-[#dedede] bg-neutral-100 overflow-x-auto text-xs font-bold">
          {[
            { id: 'overview', label: 'Treasury & Reserve', icon: Building },
            { id: 'exchange', label: 'Interstellar FX Exchange', icon: ArrowRightLeft },
            { id: 'treasury', label: 'Central Bank & Bonds', icon: DollarSign },
            { id: 'utility', label: 'Tender Sector Utilities', icon: Zap },
            { id: 'ledger', label: 'Transaction Ledger', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sound.play('click');
                  setActiveTab(tab.id as any);
                }}
                className={`py-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  isSel
                    ? 'border-amber-600 bg-white text-black'
                    : 'border-transparent text-neutral-600 hover:text-black hover:bg-neutral-200/60'
                }`}
              >
                <Icon size={14} className={isSel ? 'text-amber-600' : 'text-neutral-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#fafafa]">
          {/* Notice Feedback Banner */}
          {fxNotice && (
            <div
              className={`p-3.5 border-l-4 text-xs font-semibold flex items-center justify-between ${
                fxNotice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                  : 'bg-rose-50 border-rose-600 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2">
                {fxNotice.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                )}
                <span>{fxNotice.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setFxNotice(null)}
                className="text-neutral-500 hover:text-black font-bold px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW & TREASURY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-[#dedede] shadow-xs">
                  <div className="flex items-center justify-between text-neutral-500 text-[11px] mb-1">
                    <span className="uppercase font-bold">Liquid Reserves</span>
                    <Coins size={14} className="text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-amber-950">
                    {currentCredits.toLocaleString()}{' '}
                    <span className="text-xs text-amber-600">GC</span>
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>+15.2% expansion this era</span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-[#dedede] shadow-xs">
                  <div className="flex items-center justify-between text-neutral-500 text-[11px] mb-1">
                    <span className="uppercase font-bold">Turn Rate Generation</span>
                    <TrendingUp size={14} className="text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-800">
                    +570 <span className="text-xs text-emerald-600">GC/turn</span>
                  </div>
                  <div className="mt-2 text-[10px] text-neutral-500">
                    Equivalent to ~34,200 GC / Earth Hour
                  </div>
                </div>

                <div className="p-4 bg-white border border-[#dedede] shadow-xs">
                  <div className="flex items-center justify-between text-neutral-500 text-[11px] mb-1">
                    <span className="uppercase font-bold">Central Clearing Rating</span>
                    <ShieldCheck size={14} className="text-cyan-500" />
                  </div>
                  <div className="text-2xl font-black text-cyan-900">
                    AAA+ <span className="text-xs text-neutral-600">Prime</span>
                  </div>
                  <div className="mt-2 text-[10px] text-neutral-500">
                    Zero debt delinquency · Full collateral
                  </div>
                </div>
              </div>

              {/* Revenue Streams Breakdown */}
              <div className="p-5 bg-white border border-[#dedede]">
                <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building size={16} className="text-neutral-700" />
                  <span>Galactic Revenue Stream Allocation (Per Turn Cycle)</span>
                </h3>

                <div className="space-y-3 text-xs">
                  {[
                    {
                      label: 'AIC Automated Manufacturing Lines',
                      amount: '+250 GC/t',
                      share: '43.8%',
                      desc: 'Nanite assembly plant dividends and automated modular production pipelines',
                    },
                    {
                      label: 'Planetary Commerce & Tax Revenue',
                      amount: '+180 GC/t',
                      share: '31.6%',
                      desc: 'Civilian commerce, planetary spaceport duty fees, and residential trade charters',
                    },
                    {
                      label: 'Interstellar Guild Tariffs',
                      amount: '+95 GC/t',
                      share: '16.7%',
                      desc: 'Cross-universe transit customs and merchant guild transshipment taxes',
                    },
                    {
                      label: 'Stargate Network Toll Levies',
                      amount: '+45 GC/t',
                      share: '7.9%',
                      desc: 'Subspace vortex authorization tolls collected from neutral caravans',
                    },
                  ].map((stream, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-[#111111]">{stream.label}</div>
                        <div className="text-[10px] text-[#666666]">{stream.desc}</div>
                      </div>
                      <div className="text-right sm:shrink-0">
                        <strong className="text-emerald-700 font-mono text-sm">{stream.amount}</strong>
                        <div className="text-[10px] text-neutral-400">Share: {stream.share}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Jump Action Bar */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-950 font-bold">
                  <Sparkles size={16} className="text-amber-600" />
                  <span>Ready to deploy Galactic Credits into industrial expansion or fleet readiness?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.play('click');
                      setActiveTab('exchange');
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase text-[11px] cursor-pointer shadow-xs"
                  >
                    Open FX Exchange
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.play('click');
                      onClose();
                      onNavigate && onNavigate('aic-system');
                    }}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold uppercase text-[11px] cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>AIC Factories</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERSTELLAR FX EXCHANGE */}
          {activeTab === 'exchange' && (
            <div className="space-y-6">
              {/* Quick Instant Buy Presets */}
              <div className="p-4 bg-white border border-[#dedede]">
                <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span>Instant 1-Click Commodity Swaps (Guild Clearance)</span>
                  </h3>
                  <span className="text-[10px] text-neutral-500">Zero Execution Delay</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {quickSwaps.map((qs, i) => {
                    const Icon = qs.icon;
                    return (
                      <div
                        key={i}
                        className="p-3 bg-neutral-50 hover:bg-amber-50/50 border border-neutral-200 hover:border-amber-400 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                            <span className="flex items-center gap-1">
                              <Icon size={13} className="text-amber-600" />
                              {qs.label}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] font-mono text-neutral-500">
                            Cost: <strong className="text-[#111111]">{qs.cost.toLocaleString()} GC</strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickBuy(qs.cost, qs.resKey, qs.amount)}
                          className="mt-3 w-full py-1.5 bg-neutral-900 hover:bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Execute Swap
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Live Swap Terminal */}
              <div className="p-5 bg-white border border-[#dedede] space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                    <ArrowRightLeft size={16} className="text-amber-600" />
                    <span>Universal Currency & Resource Matrix Converter</span>
                  </h3>
                  <div className="flex items-center gap-1 bg-neutral-100 p-0.5 border border-neutral-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setSwapDirection('buy_resource')}
                      className={`px-2.5 py-1 font-bold cursor-pointer transition-colors ${
                        swapDirection === 'buy_resource'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      Buy Commodities with GC
                    </button>
                    <button
                      type="button"
                      onClick={() => setSwapDirection('sell_resource')}
                      className={`px-2.5 py-1 font-bold cursor-pointer transition-colors ${
                        swapDirection === 'sell_resource'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      Liquidate Resources for GC
                    </button>
                  </div>
                </div>

                <form onSubmit={handleExecuteCustomSwap} className="space-y-4 text-xs">
                  {/* Select Target Resource */}
                  <div>
                    <label className="block font-bold text-neutral-700 uppercase text-[10px] mb-1.5">
                      Select Interstellar Commodity:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {(Object.keys(rates) as Array<keyof typeof rates>).map((k) => {
                        const r = rates[k];
                        const Icon = r.icon;
                        const isSel = selectedResource === k;
                        return (
                          <button
                            key={k}
                            type="button"
                            onClick={() => {
                              sound.play('click');
                              setSelectedResource(k);
                            }}
                            className={`p-2.5 border text-left cursor-pointer transition-all ${
                              isSel
                                ? 'bg-amber-500/10 border-amber-600 text-amber-950 font-bold shadow-2xs'
                                : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs">
                              <Icon size={14} className={isSel ? 'text-amber-600' : 'text-neutral-500'} />
                              <span>{r.name}</span>
                            </div>
                            <div className="mt-1 text-[10px] font-mono text-neutral-500">
                              Res: {((resources[k] as number) ?? 0).toLocaleString()}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Input Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-neutral-700 uppercase text-[10px] mb-1">
                        {swapDirection === 'buy_resource'
                          ? 'Disburse Galactic Credits (GC):'
                          : `Sell ${currentRateObj.name} Amount:`}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={
                            swapDirection === 'buy_resource'
                              ? currentCredits
                              : (resources[selectedResource] as number) ?? 1000000
                          }
                          value={swapAmount}
                          onChange={(e) => setSwapAmount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                          className="flex-1 px-3 py-2 border border-[#dedede] bg-white font-mono font-bold text-sm focus:border-amber-600 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (swapDirection === 'buy_resource') {
                              setSwapAmount(currentCredits);
                            } else {
                              setSwapAmount((resources[selectedResource] as number) ?? 0);
                            }
                          }}
                          className="px-2.5 py-2 bg-neutral-200 hover:bg-neutral-300 font-bold text-neutral-800 text-xs cursor-pointer"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    {/* Calculated Output Preview */}
                    <div className="p-3 bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
                      <div className="text-[10px] uppercase font-bold text-neutral-500">
                        Estimated Yield from Interstellar FX:
                      </div>
                      <div className="text-xl font-black font-mono text-amber-900">
                        {swapDirection === 'buy_resource'
                          ? `+${Math.floor(swapAmount * currentRateObj.buyRate).toLocaleString()} ${currentRateObj.unit}`
                          : `+${Math.floor(
                              swapAmount * (selectedResource === 'darkMatter' ? 8500 : currentRateObj.sellRate)
                            ).toLocaleString()} GC`}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        Exchange fee: 0.5% Guild Commission included
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ArrowRightLeft size={16} />
                      <span>Confirm & Execute Interstellar Transaction</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: CENTRAL BANK & BONDS */}
          {activeTab === 'treasury' && (
            <div className="space-y-6">
              {/* Sovereign Stimulus Card */}
              <div className="p-5 bg-white border border-[#dedede] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-amber-100 text-amber-800 rounded-xs">
                      <Gift size={16} />
                    </span>
                    <h3 className="font-bold text-sm uppercase text-[#111111]">
                      Galactic Central Bank Emergency Liquidity Stimulus
                    </h3>
                  </div>
                  <p className="text-xs text-[#666666] max-w-xl">
                    Authorized imperial sovereign subsidy granted by the Central High Directorate. Inject +25,000 GC
                    directly into your empire’s operational ledger.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={stimulusClaimed}
                  onClick={handleClaimStimulus}
                  className={`px-4 py-2.5 font-bold uppercase text-xs tracking-wider transition-colors shrink-0 shadow-xs cursor-pointer ${
                    stimulusClaimed
                      ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {stimulusClaimed ? '✓ Stimulus Claimed' : 'Claim +25,000 GC Stimulus'}
                </button>
              </div>

              {/* High-Yield Sovereign Treasury Bond */}
              <div className="p-5 bg-white border border-[#dedede] space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-amber-600" />
                    <div>
                      <h3 className="font-bold text-sm uppercase text-[#111111]">
                        10-Turn Sovereign High-Yield Treasury Bond
                      </h3>
                      <p className="text-xs text-[#666666]">
                        Lock 100,000 GC into high-yield interstellar debt securities yielding +18% guaranteed return
                        (+118,000 GC payout).
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    +18% APY COUPON
                  </span>
                </div>

                {activeBond ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-amber-900">Active Sovereign Bond In Vault</div>
                      <div className="text-[11px] text-amber-800">
                        Maturing in {activeBond.returnsInTurns} turn cycles · Expected Payout: {activeBond.expectedReturn.toLocaleString()} GC
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-amber-600 text-white font-bold text-[10px] uppercase">
                      Yield Locked
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-neutral-600">
                      Minimum Subscription: <strong className="text-black font-mono">100,000 GC</strong> · Sovereign Security
                      Backed by Central Bank
                    </div>
                    <button
                      type="button"
                      onClick={handleIssueBond}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase cursor-pointer"
                    >
                      Issue Sovereign Bond
                    </button>
                  </div>
                )}
              </div>

              {/* Cyber Plunder Shield Status */}
              <div className="p-4 bg-cyan-50/60 border border-cyan-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-cyan-700" />
                  <div>
                    <strong className="text-cyan-950 font-bold">Interstellar Anti-Theft Plunder Shield Active</strong>
                    <div className="text-[11px] text-cyan-800">
                      Galactic Credits held in sovereign treasury cannot be stolen by covert spy raids or hacker syndicates.
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-cyan-700 text-white text-[10px] font-black uppercase">
                  100% Protected
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: TENDER UTILITY & INTEGRATIONS */}
          {activeTab === 'utility' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-600">
                Galactic Credits (GC) function as the universal medium of exchange across all 30 parallel universes in
                Empire at Wars. Below are primary sector applications:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'AIC Automated Industry Complex',
                    desc: 'Speed up nanite production queues and upgrade automated factory throughput tiers with GC.',
                    route: 'aic-system',
                    tag: 'Primary Sink',
                  },
                  {
                    title: 'Arms & Weapons Market',
                    desc: 'Purchase specialized small arms, anti-materiel rifles, and vehicle combat weapon modules.',
                    route: 'weapon-market',
                    tag: 'Military Supply',
                  },
                  {
                    title: 'Mercenary Guild Outposts',
                    desc: 'Sign rapid mercenary combat contracts to deploy elite Jaffa assault cadres and Kull warriors.',
                    route: 'mercenary-market',
                    tag: 'Contractors',
                  },
                  {
                    title: 'Imperial Store & Battle Pass',
                    desc: 'Unlock exclusive starship skins, sovereign insignia, and seasonal progression rewards.',
                    route: 'store-battlepass',
                    tag: 'Imperial Store',
                  },
                  {
                    title: 'EVE Blueprints Technology',
                    desc: 'Pay research licensing royalties for capital hull schematics and ME/TE optimization.',
                    route: 'eve-blueprints',
                    tag: 'Research',
                  },
                  {
                    title: 'Imperial Bank & Vault',
                    desc: 'Manage liquid Naquadah reserves, interest rate compounds, and loan accounts.',
                    route: 'bank-vault',
                    tag: 'Banking',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-[#dedede] hover:border-amber-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <strong className="text-[#111111]">{item.title}</strong>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 border border-amber-200">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] leading-relaxed">{item.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sound.play('click');
                        onClose();
                        onNavigate && onNavigate(item.route);
                      }}
                      className="mt-3 py-1.5 px-3 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Jump to System</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TRANSACTION LEDGER */}
          {activeTab === 'ledger' && (
            <div className="bg-white border border-[#dedede] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <History size={14} className="text-neutral-600" />
                  <span>Recent Interstellar Transaction Ledger</span>
                </h3>
                <span className="text-[10px] text-neutral-500 font-mono">Real-Time Central Log</span>
              </div>

              <div className="divide-y divide-neutral-100 text-xs">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`p-1 text-[10px] font-bold uppercase ${
                          tx.type === 'credit'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.type}
                      </span>
                      <div>
                        <div className="font-bold text-[#111111]">{tx.desc}</div>
                        <div className="text-[10px] text-neutral-400">{tx.time}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <strong
                        className={`text-sm font-bold ${
                          tx.type === 'credit' ? 'text-emerald-700' : 'text-neutral-800'
                        }`}
                      >
                        {tx.type === 'credit' ? '+' : '-'}
                        {tx.amount.toLocaleString()} GC
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-neutral-100 border-t border-[#dedede] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
            <Lock size={12} />
            <span>Galactic Central Bank Cryptographic Ledger v3.5-RELEASE</span>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.play('click');
              onClose();
            }}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            Close System
          </button>
        </div>
      </div>
    </div>
  );
};
