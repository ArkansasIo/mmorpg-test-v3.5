import React, { useState } from 'react';
import {
  Shield,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Lock,
  Zap,
  CreditCard,
  History,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Layers,
  Award,
} from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources, BankVaultUpgradeState, BankTransactionRecord, BankLoanAccount } from '../../types';
import {
  calculateBankCapacity,
  calculateBankInterestRate,
  calculateMaxLoanAvailable,
  calculatePlunderProtectionPercent,
  DEFAULT_BANK_VAULT_STATE,
} from '../../utils/upgradeCalculations';

interface BankVaultViewProps {
  resources: PlayerResources;
  naturalIncome?: number;
  bankState?: BankVaultUpgradeState;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
  onUpdateBankState?: (state: BankVaultUpgradeState) => void;
}

export const BankVaultView: React.FC<BankVaultViewProps> = ({
  resources,
  naturalIncome = 45000,
  bankState = DEFAULT_BANK_VAULT_STATE,
  onUpdateResources,
  onUpdateBankState,
}) => {
  const [activeTab, setActiveTab] = useState<'operations' | 'upgrades' | 'automation' | 'loans' | 'history'>('operations');
  const [depositInput, setDepositInput] = useState<string>('25000');
  const [withdrawInput, setWithdrawInput] = useState<string>('25000');
  const [borrowInput, setBorrowInput] = useState<string>('50000');
  const [repayInput, setRepayInput] = useState<string>('25000');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const localBankState = bankState || DEFAULT_BANK_VAULT_STATE;

  const maxCapacity = calculateBankCapacity(localBankState, naturalIncome);
  const interestRate = calculateBankInterestRate(localBankState);
  const raidShieldPct = calculatePlunderProtectionPercent(localBankState);
  const maxLoan = calculateMaxLoanAvailable(localBankState, resources.bankedNaquadah || 0, naturalIncome);

  const bankedNaquadah = resources.bankedNaquadah || 0;
  const capacityPct = Math.min(100, Math.round((bankedNaquadah / maxCapacity) * 100));

  const logTransaction = (
    type: BankTransactionRecord['type'],
    amount: number,
    note: string,
    resultingBalance: number
  ) => {
    const newTx: BankTransactionRecord = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      amount,
      note,
      resultingBalance,
    };
    if (onUpdateBankState) {
      onUpdateBankState({
        ...localBankState,
        transactions: [newTx, ...(localBankState.transactions || [])].slice(0, 50),
      });
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(depositInput, 10);
    if (isNaN(amount) || amount <= 0) return;

    if (resources.naquadah < amount) {
      sound.play('warning');
      setFeedback({ type: 'error', text: 'Insufficient liquid Naquadah in active wallet.' });
      return;
    }

    if (bankedNaquadah + amount > maxCapacity) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Vault capacity exceeded! Maximum capacity is ${maxCapacity.toLocaleString()} NQ. Upgrade vault to store more.`,
      });
      return;
    }

    const newBanked = bankedNaquadah + amount;
    sound.play('confirm');
    onUpdateResources({
      naquadah: resources.naquadah - amount,
      bankedNaquadah: newBanked,
    });
    logTransaction('deposit', amount, `Manual Secure Deposit of ${amount.toLocaleString()} NQ`, newBanked);
    setFeedback({
      type: 'success',
      text: `Successfully deposited ${amount.toLocaleString()} NQ into high-security Imperial Vault.`,
    });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawInput, 10);
    if (isNaN(amount) || amount <= 0) return;

    if (bankedNaquadah < amount) {
      sound.play('warning');
      setFeedback({ type: 'error', text: 'Requested withdrawal exceeds secured vault balance.' });
      return;
    }

    const newBanked = Math.max(0, bankedNaquadah - amount);
    sound.play('confirm');
    onUpdateResources({
      naquadah: resources.naquadah + amount,
      bankedNaquadah: newBanked,
    });
    logTransaction('withdraw', amount, `Manual Withdrawal of ${amount.toLocaleString()} NQ`, newBanked);
    setFeedback({
      type: 'success',
      text: `Successfully withdrew ${amount.toLocaleString()} NQ into liquid operational reserves.`,
    });
  };

  const handleUpgradeBankSubsystem = (subsystemKey: keyof BankVaultUpgradeState, name: string) => {
    const currentLevel = (localBankState[subsystemKey] as number) || 1;
    const costMult = Math.pow(1.68, currentLevel);
    const metalCost = Math.round(40000 * costMult);
    const crystalCost = Math.round(30000 * costMult);
    const deutCost = Math.round(10000 * costMult);
    const nqCost = Math.round(25000 * costMult);

    if (
      resources.metal < metalCost ||
      resources.crystal < crystalCost ||
      resources.deuterium < deutCost ||
      resources.naquadah < nqCost
    ) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Insufficient resources to upgrade ${name}! Required: ${metalCost.toLocaleString()} Metal, ${crystalCost.toLocaleString()} Crystal, ${deutCost.toLocaleString()} Deut, ${nqCost.toLocaleString()} NQ.`,
      });
      return;
    }

    sound.play('confirm');
    onUpdateResources({
      metal: resources.metal - metalCost,
      crystal: resources.crystal - crystalCost,
      deuterium: resources.deuterium - deutCost,
      naquadah: resources.naquadah - nqCost,
    });

    if (onUpdateBankState) {
      const updatedState = {
        ...localBankState,
        [subsystemKey]: currentLevel + 1,
      };
      onUpdateBankState(updatedState);
      logTransaction(
        'upgrade',
        nqCost,
        `Upgraded ${name} to Tier ${currentLevel + 1}`,
        resources.bankedNaquadah || 0
      );
    }

    setFeedback({
      type: 'success',
      text: `${name} successfully upgraded to Tier ${currentLevel + 1}! Financial limits and security expanded.`,
    });
  };

  const handleTakeLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(borrowInput, 10);
    if (isNaN(amount) || amount <= 0) return;

    if (localBankState.activeLoan) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: 'An active loan already exists. Please repay current balance before originating new credit.',
      });
      return;
    }

    if (amount > maxLoan) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Requested loan exceeds maximum approved credit ceiling of ${maxLoan.toLocaleString()} NQ.`,
      });
      return;
    }

    const loanInterest = 0.03; // 3% per turn
    const loanDuration = 20; // 20 turns
    const totalRepay = Math.round(amount * (1 + loanInterest * loanDuration));
    const paymentPerTurn = Math.round(totalRepay / loanDuration);

    const newLoan: BankLoanAccount = {
      loanId: `loan-${Date.now()}`,
      principal: amount,
      remainingBalance: totalRepay,
      interestRatePerTurn: loanInterest,
      turnsRemaining: loanDuration,
      maxTurns: loanDuration,
      paymentPerTurn,
    };

    sound.play('confirm');
    onUpdateResources({
      naquadah: resources.naquadah + amount,
    });

    if (onUpdateBankState) {
      onUpdateBankState({
        ...localBankState,
        activeLoan: newLoan,
      });
      logTransaction(
        'loan_borrow',
        amount,
        `Originated Imperial Credit Line of ${amount.toLocaleString()} NQ (${loanDuration} turns)`,
        resources.bankedNaquadah || 0
      );
    }

    setFeedback({
      type: 'success',
      text: `Imperial Credit Line approved! Disbursed ${amount.toLocaleString()} NQ into liquid reserves. (Repayment: ${paymentPerTurn.toLocaleString()} NQ/turn for ${loanDuration} turns).`,
    });
  };

  const handleRepayLoanEarly = () => {
    if (!localBankState.activeLoan) return;
    const amount = Math.min(
      parseInt(repayInput, 10) || localBankState.activeLoan.remainingBalance,
      localBankState.activeLoan.remainingBalance
    );

    if (resources.naquadah < amount) {
      sound.play('warning');
      setFeedback({ type: 'error', text: 'Insufficient liquid Naquadah to repay loan balance.' });
      return;
    }

    const remaining = localBankState.activeLoan.remainingBalance - amount;
    sound.play('confirm');
    onUpdateResources({
      naquadah: resources.naquadah - amount,
    });

    if (onUpdateBankState) {
      onUpdateBankState({
        ...localBankState,
        activeLoan:
          remaining <= 0
            ? null
            : {
                ...localBankState.activeLoan,
                remainingBalance: remaining,
              },
      });
      logTransaction(
        'loan_repay',
        amount,
        `Repaid ${amount.toLocaleString()} NQ towards Imperial Credit Line`,
        resources.bankedNaquadah || 0
      );
    }

    setFeedback({
      type: 'success',
      text:
        remaining <= 0
          ? 'Imperial Credit Line fully settled and cleared from registry!'
          : `Repaid ${amount.toLocaleString()} NQ. Remaining loan balance: ${remaining.toLocaleString()} NQ.`,
    });
  };

  const toggleAutoSweep = () => {
    if (onUpdateBankState) {
      onUpdateBankState({
        ...localBankState,
        autoSweepEnabled: !localBankState.autoSweepEnabled,
      });
      sound.play('confirm');
    }
  };

  const updateThreshold = (threshold: number) => {
    if (onUpdateBankState) {
      onUpdateBankState({
        ...localBankState,
        autoSweepThreshold: Math.max(10000, threshold),
      });
    }
  };

  const updateReinvestRate = (rate: number) => {
    if (onUpdateBankState) {
      onUpdateBankState({
        ...localBankState,
        reinvestRatePercent: Math.min(100, Math.max(0, rate)),
      });
    }
  };

  return (
    <div id="bank-vault-view" className="space-y-6">
      {/* Header */}
      <div className="border border-[#dedede] bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
              IMPERIAL FINANCIAL CITADEL · HIGH-SECURITY VAULTS & BANKING MATRIX
            </div>
            <h2 className="text-2xl font-bold text-[#111111]">Imperial Bank & Subspace Vaults</h2>
            <p className="text-sm text-[#666666] mt-1 max-w-3xl leading-relaxed">
              Shield massive treasury reserves against hostile orbital raids, earn compounding turn dividends,
              configure automated liquidity sweeps, and leverage emergency Stargate credit lines.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#777777] uppercase block">Current Protection</span>
              <span className="text-xs font-mono font-bold text-emerald-700">100% Banked + {raidShieldPct}% Liquid</span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap gap-2 border-t border-[#eeeeee] pt-4 mt-5">
          <button
            type="button"
            onClick={() => setActiveTab('operations')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'operations'
                ? 'bg-[#111111] text-white'
                : 'bg-[#fafafa] text-[#555555] hover:bg-[#f0f0f0] border border-[#dedede]'
            }`}
          >
            <Landmark size={14} />
            Vault Operations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upgrades')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'upgrades'
                ? 'bg-[#111111] text-white'
                : 'bg-[#fafafa] text-[#555555] hover:bg-[#f0f0f0] border border-[#dedede]'
            }`}
          >
            <Shield size={14} />
            Fortification Upgrades ({localBankState.vaultLevel})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('automation')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'automation'
                ? 'bg-[#111111] text-white'
                : 'bg-[#fafafa] text-[#555555] hover:bg-[#f0f0f0] border border-[#dedede]'
            }`}
          >
            <Sliders size={14} />
            Auto-Sweep & Reinvest
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'loans'
                ? 'bg-[#111111] text-white'
                : 'bg-[#fafafa] text-[#555555] hover:bg-[#f0f0f0] border border-[#dedede]'
            }`}
          >
            <CreditCard size={14} />
            Imperial Credit & Loans {localBankState.activeLoan ? '●' : ''}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#111111] text-white'
                : 'bg-[#fafafa] text-[#555555] hover:bg-[#f0f0f0] border border-[#dedede]'
            }`}
          >
            <History size={14} />
            Transaction Ledger ({localBankState.transactions?.length || 0})
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-[#fafafa] border-[#111111] text-[#111111] border-l-4'
              : 'bg-[#fff5f5] border-[#dc2626] text-[#dc2626] border-l-4'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[#888888] hover:text-[#111111] ml-4 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#dedede] bg-white p-4">
          <span className="text-[10px] font-bold text-[#777777] uppercase block">Secured Vault Balance</span>
          <strong className="text-xl font-mono text-[#111111] block mt-1">
            {bankedNaquadah.toLocaleString()} NQ
          </strong>
          <span className="text-[10px] text-[#777777] block mt-1">
            Cap: {maxCapacity.toLocaleString()} NQ ({capacityPct}%)
          </span>
        </div>

        <div className="border border-[#dedede] bg-white p-4">
          <span className="text-[10px] font-bold text-[#777777] uppercase block">Compounding Interest Rate</span>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp size={18} className="text-emerald-600" />
            <strong className="text-xl font-mono text-emerald-700">
              {(interestRate * 100).toFixed(1)}% / Turn
            </strong>
          </div>
          <span className="text-[10px] text-emerald-600 block mt-1">
            Est. +{Math.round(bankedNaquadah * interestRate).toLocaleString()} NQ next turn
          </span>
        </div>

        <div className="border border-[#dedede] bg-white p-4">
          <span className="text-[10px] font-bold text-[#777777] uppercase block">Active Wallet (Liquid)</span>
          <strong className="text-xl font-mono text-[#111111] block mt-1">
            {resources.naquadah.toLocaleString()} NQ
          </strong>
          <span className="text-[10px] text-[#777777] block mt-1">
            Raid Shield: {raidShieldPct}% protected
          </span>
        </div>

        <div className="border border-[#dedede] bg-white p-4">
          <span className="text-[10px] font-bold text-[#777777] uppercase block">Credit Line Status</span>
          <strong className="text-xl font-mono text-[#111111] block mt-1">
            {localBankState.activeLoan
              ? `${localBankState.activeLoan.remainingBalance.toLocaleString()} NQ Due`
              : `${maxLoan.toLocaleString()} NQ Limit`}
          </strong>
          <span className="text-[10px] text-[#777777] block mt-1">
            {localBankState.activeLoan
              ? `${localBankState.activeLoan.turnsRemaining} turns remaining`
              : 'Approved & Available'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border border-[#dedede] bg-white p-4 space-y-2">
        <div className="flex justify-between text-xs font-bold text-[#555555]">
          <span>VAULT CAPACITY OCCUPANCY</span>
          <span className="font-mono">{capacityPct}% UTILIZED</span>
        </div>
        <div className="w-full h-3.5 bg-[#eeeeee] overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              capacityPct >= 90 ? 'bg-[#dc2626]' : capacityPct >= 70 ? 'bg-amber-500' : 'bg-[#111111]'
            }`}
            style={{ width: `${capacityPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-[#777777] font-mono">
          <span>0 NQ</span>
          <span>{bankedNaquadah.toLocaleString()} / {maxCapacity.toLocaleString()} NQ</span>
          <span>MAX</span>
        </div>
      </div>

      {/* TAB 1: OPERATIONS (DEPOSIT / WITHDRAW) */}
      {activeTab === 'operations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deposit Form */}
          <div className="border border-[#dedede] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <ArrowDownLeft size={16} /> Deposit Liquid Naquadah
                </h3>
                <span className="text-xs text-[#777777]">
                  Available in Active Wallet: {resources.naquadah.toLocaleString()} NQ
                </span>
              </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-2">
                  Amount to Secure in Vault
                </label>
                <input
                  type="number"
                  min="1"
                  max={resources.naquadah}
                  value={depositInput}
                  onChange={(e) => setDepositInput(e.target.value)}
                  className="w-full bg-[#fafafa] border border-[#dedede] px-3 py-2.5 font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex gap-2">
                {[0.25, 0.5, 0.75, 1.0].map((frac) => {
                  const spaceLeft = Math.max(0, maxCapacity - bankedNaquadah);
                  const maxPossible = Math.min(resources.naquadah, spaceLeft);
                  return (
                    <button
                      key={frac}
                      type="button"
                      onClick={() => setDepositInput(String(Math.floor(maxPossible * frac)))}
                      className="flex-1 py-1.5 border border-[#dedede] text-[11px] font-mono text-[#555555] hover:border-[#111111] hover:text-[#111111] transition-colors cursor-pointer"
                    >
                      {frac === 1.0 ? 'MAX' : `${frac * 100}%`}
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={resources.naquadah <= 0 || bankedNaquadah >= maxCapacity}
                className="w-full py-3 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer disabled:opacity-50"
              >
                Secure Deposit into Vault →
              </button>
            </form>
          </div>

          {/* Withdraw Form */}
          <div className="border border-[#dedede] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <ArrowUpRight size={16} /> Withdraw to Liquid Wallet
                </h3>
                <span className="text-xs text-[#777777]">
                  Secured Vault Reserves: {bankedNaquadah.toLocaleString()} NQ
                </span>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-2">
                  Amount to Withdraw
                </label>
                <input
                  type="number"
                  min="1"
                  max={bankedNaquadah}
                  value={withdrawInput}
                  onChange={(e) => setWithdrawInput(e.target.value)}
                  className="w-full bg-[#fafafa] border border-[#dedede] px-3 py-2.5 font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex gap-2">
                {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                  <button
                    key={frac}
                    type="button"
                    onClick={() => setWithdrawInput(String(Math.floor(bankedNaquadah * frac)))}
                    className="flex-1 py-1.5 border border-[#dedede] text-[11px] font-mono text-[#555555] hover:border-[#111111] hover:text-[#111111] transition-colors cursor-pointer"
                  >
                    {frac === 1.0 ? 'MAX' : `${frac * 100}%`}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={bankedNaquadah <= 0}
                className="w-full py-3 border border-[#111111] text-[#111111] font-bold text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors cursor-pointer disabled:opacity-50"
              >
                Withdraw to Active Wallet →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: FORTIFICATION UPGRADES */}
      {activeTab === 'upgrades' && (
        <div className="space-y-4">
          <div className="border border-[#dedede] bg-white p-4 text-xs text-[#666666]">
            Upgrade individual modular subsystems to expand vault capacity, boost turn interest rates, shield unbanked liquid reserves, and unlock cross-world Stargate terminals.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subsystem 1: Bedrock Citadel Core */}
            <div className="border border-[#dedede] bg-white p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[#777777] uppercase">Structural Bedrock</span>
                  <h4 className="font-bold text-sm text-[#111111]">Sub-Surface Vault Citadel</h4>
                </div>
                <span className="px-2.5 py-0.5 bg-[#111111] text-white text-[10px] font-bold font-mono">
                  Tier {localBankState.vaultLevel}
                </span>
              </div>
              <p className="text-xs text-[#666666]">
                Expands base protected capacity by +45% per tier and provides foundational blast shielding.
              </p>
              <div className="text-xs font-mono text-emerald-700 bg-emerald-50 p-2 border border-emerald-200">
                Current Benefit: +{localBankState.vaultLevel * 45}% Capacity Multiplier
              </div>
              <button
                type="button"
                onClick={() => handleUpgradeBankSubsystem('vaultLevel', 'Sub-Surface Vault Citadel')}
                className="w-full py-2.5 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer"
              >
                Upgrade to Tier {localBankState.vaultLevel + 1} →
              </button>
            </div>

            {/* Subsystem 2: Titanium Reinforcement */}
            <div className="border border-[#dedede] bg-white p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[#777777] uppercase">Material Engineering</span>
                  <h4 className="font-bold text-sm text-[#111111]">Titanium-Trinium Bullion Silos</h4>
                </div>
                <span className="px-2.5 py-0.5 bg-[#111111] text-white text-[10px] font-bold font-mono">
                  Tier {localBankState.titaniumReinforcementLevel}
                </span>
              </div>
              <p className="text-xs text-[#666666]">
                Adds +500,000 flat Naquadah storage per tier to physical underground vaults.
              </p>
              <div className="text-xs font-mono text-emerald-700 bg-emerald-50 p-2 border border-emerald-200">
                Current Benefit: +{(localBankState.titaniumReinforcementLevel * 500000).toLocaleString()} Flat NQ Cap
              </div>
              <button
                type="button"
                onClick={() => handleUpgradeBankSubsystem('titaniumReinforcementLevel', 'Titanium Bullion Silos')}
                className="w-full py-2.5 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer"
              >
                Upgrade to Tier {localBankState.titaniumReinforcementLevel + 1} →
              </button>
            </div>

            {/* Subsystem 3: Quantum Encryption */}
            <div className="border border-[#dedede] bg-white p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[#777777] uppercase">Cryptographic Matrix</span>
                  <h4 className="font-bold text-sm text-[#111111]">Quantum Entangled Lockers</h4>
                </div>
                <span className="px-2.5 py-0.5 bg-[#111111] text-white text-[10px] font-bold font-mono">
                  Tier {localBankState.quantumEncryptionLevel}
                </span>
              </div>
              <p className="text-xs text-[#666666]">
                Increases interest dividend yield by +1.0% compound per turn and prevents cyber attacks.
              </p>
              <div className="text-xs font-mono text-emerald-700 bg-emerald-50 p-2 border border-emerald-200">
                Current Benefit: +{(localBankState.quantumEncryptionLevel * 1.0).toFixed(1)}% Turn Interest Yield
              </div>
              <button
                type="button"
                onClick={() => handleUpgradeBankSubsystem('quantumEncryptionLevel', 'Quantum Entangled Lockers')}
                className="w-full py-2.5 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer"
              >
                Upgrade to Tier {localBankState.quantumEncryptionLevel + 1} →
              </button>
            </div>

            {/* Subsystem 4: Subspace Shunt */}
            <div className="border border-[#dedede] bg-white p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[#777777] uppercase">Dimensional Defense</span>
                  <h4 className="font-bold text-sm text-[#111111]">Subspace Shunt & Decoy Vaults</h4>
                </div>
                <span className="px-2.5 py-0.5 bg-[#111111] text-white text-[10px] font-bold font-mono">
                  Tier {localBankState.subspaceShuntLevel}
                </span>
              </div>
              <p className="text-xs text-[#666666]">
                Shields +12% of unbanked liquid wallet Naquadah from being plundered during enemy raids.
              </p>
              <div className="text-xs font-mono text-emerald-700 bg-emerald-50 p-2 border border-emerald-200">
                Current Benefit: {raidShieldPct}% Liquid Reserves Protected from Plunder
              </div>
              <button
                type="button"
                onClick={() => handleUpgradeBankSubsystem('subspaceShuntLevel', 'Subspace Shunt & Decoys')}
                className="w-full py-2.5 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer"
              >
                Upgrade to Tier {localBankState.subspaceShuntLevel + 1} →
              </button>
            </div>

            {/* Subsystem 5: Stargate Banking Terminal */}
            <div className="border border-[#dedede] bg-white p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[#777777] uppercase">Wormhole Logistics</span>
                  <h4 className="font-bold text-sm text-[#111111]">Stargate Interstellar Banking Terminals</h4>
                </div>
                <span className="px-2.5 py-0.5 bg-[#111111] text-white text-[10px] font-bold font-mono">
                  Tier {localBankState.stargateTerminalLevel}
                </span>
              </div>
              <p className="text-xs text-[#666666]">
                Multiplies global storage limits by +15% and increases maximum emergency credit line by +25%.
              </p>
              <div className="text-xs font-mono text-emerald-700 bg-emerald-50 p-2 border border-emerald-200">
                Current Benefit: +{localBankState.stargateTerminalLevel * 15}% Capacity Mult · +{localBankState.stargateTerminalLevel * 25}% Credit Limit
              </div>
              <button
                type="button"
                onClick={() => handleUpgradeBankSubsystem('stargateTerminalLevel', 'Stargate Banking Terminals')}
                className="w-full py-2.5 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer"
              >
                Upgrade to Tier {localBankState.stargateTerminalLevel + 1} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATION & AUTO-SWEEP */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="border border-[#dedede] bg-white p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeeeee] pb-4">
              <div>
                <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <Zap size={18} /> Automated Liquidity Sweep Protocol
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Automatically sweeps surplus liquid Naquadah above your target threshold directly into the vault every turn tick to maximize compound interest and prevent plunder loss.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleAutoSweep}
                className={`px-6 py-2.5 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  localBankState.autoSweepEnabled
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-[#eeeeee] text-[#555555] hover:bg-[#dddddd]'
                }`}
              >
                {localBankState.autoSweepEnabled ? 'ACTIVE: AUTO-SWEEP ON' : 'DISABLED: OFF'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider">
                  Retained Liquid Reserves Threshold
                </label>
                <p className="text-xs text-[#777777]">
                  Any liquid Naquadah in excess of this amount will be safely routed into the vault on each turn cycle.
                </p>
                <div className="flex gap-2">
                  {[50000, 100000, 250000, 500000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateThreshold(val)}
                      className={`flex-1 py-2 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        localBankState.autoSweepThreshold === val
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-[#fafafa] text-[#555555] border-[#dedede] hover:border-[#111111]'
                      }`}
                    >
                      {(val / 1000).toFixed(0)}k NQ
                    </button>
                  ))}
                </div>
                <div className="text-xs font-mono text-[#555555] pt-1">
                  Active Setting: {localBankState.autoSweepThreshold.toLocaleString()} NQ
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider">
                  Interest Reinvestment Percentage: {localBankState.reinvestRatePercent}%
                </label>
                <p className="text-xs text-[#777777]">
                  Percentage of turn interest automatically compounded into the vault vs credited to liquid wallet.
                </p>
                <div className="flex gap-2">
                  {[0, 25, 50, 75, 100].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => updateReinvestRate(rate)}
                      className={`flex-1 py-2 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        localBankState.reinvestRatePercent === rate
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-[#fafafa] text-[#555555] border-[#dedede] hover:border-[#111111]'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
                <div className="text-xs font-mono text-emerald-700 pt-1">
                  {localBankState.reinvestRatePercent === 100
                    ? '100% Full Exponential Compounding'
                    : `${localBankState.reinvestRatePercent}% to Vault, ${100 - localBankState.reinvestRatePercent}% to Liquid Wallet`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMPERIAL CREDIT & LOANS */}
      {activeTab === 'loans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Loan Display or Origination */}
          <div className="border border-[#dedede] bg-white p-6 space-y-4">
            <div className="border-b border-[#eeeeee] pb-3">
              <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={18} /> Imperial Emergency Credit Line
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Borrow immediate Naquadah against banked collateral to fund critical military defense or technology research.
              </p>
            </div>

            {localBankState.activeLoan ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>ACTIVE LOAN BALANCE:</span>
                    <span className="font-mono">{localBankState.activeLoan.remainingBalance.toLocaleString()} NQ</span>
                  </div>
                  <div className="flex justify-between text-amber-800">
                    <span>Original Principal:</span>
                    <span className="font-mono">{localBankState.activeLoan.principal.toLocaleString()} NQ</span>
                  </div>
                  <div className="flex justify-between text-amber-800">
                    <span>Turn Deduction:</span>
                    <span className="font-mono">{localBankState.activeLoan.paymentPerTurn.toLocaleString()} NQ/turn</span>
                  </div>
                  <div className="flex justify-between text-amber-800">
                    <span>Remaining Turns:</span>
                    <span className="font-mono">{localBankState.activeLoan.turnsRemaining} / {localBankState.activeLoan.maxTurns} turns</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider">
                    Early Payoff Amount
                  </label>
                  <input
                    type="number"
                    value={repayInput}
                    onChange={(e) => setRepayInput(e.target.value)}
                    className="w-full bg-[#fafafa] border border-[#dedede] px-3 py-2 text-xs font-mono text-[#111111]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRepayInput(String(localBankState.activeLoan?.remainingBalance || 0))}
                      className="px-3 py-1.5 border border-[#dedede] text-xs font-mono hover:border-[#111111] cursor-pointer"
                    >
                      Full Payoff ({localBankState.activeLoan.remainingBalance.toLocaleString()} NQ)
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleRepayLoanEarly}
                    className="w-full py-3 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer"
                  >
                    Repay Loan Early →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTakeLoan} className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-[#555555] uppercase mb-1">
                    <span>Requested Credit Amount</span>
                    <span className="text-emerald-700">Max Approved: {maxLoan.toLocaleString()} NQ</span>
                  </div>
                  <input
                    type="number"
                    min="10000"
                    max={maxLoan}
                    value={borrowInput}
                    onChange={(e) => setBorrowInput(e.target.value)}
                    className="w-full bg-[#fafafa] border border-[#dedede] px-3 py-2.5 font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="flex gap-2">
                  {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                    <button
                      key={frac}
                      type="button"
                      onClick={() => setBorrowInput(String(Math.floor(maxLoan * frac)))}
                      className="flex-1 py-1.5 border border-[#dedede] text-[11px] font-mono text-[#555555] hover:border-[#111111] transition-colors cursor-pointer"
                    >
                      {frac === 1.0 ? 'MAX' : `${frac * 100}%`}
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-[#fafafa] border border-[#dedede] text-xs space-y-1 font-mono text-[#555555]">
                  <div>Loan Term: 20 Turn Settlement Cycles</div>
                  <div>Interest Rate: 3% flat turn rate</div>
                  <div>Collateral: Protected by Imperial Stargate Network</div>
                </div>

                <button
                  type="submit"
                  disabled={maxLoan <= 0}
                  className="w-full py-3 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  Originate Imperial Loan →
                </button>
              </form>
            )}
          </div>

          {/* Credit Terms Information */}
          <div className="border border-[#dedede] bg-white p-6 space-y-4 text-xs text-[#666666]">
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              Stargate Banking Guild Terms
            </h3>
            <ul className="space-y-2 list-disc pl-4 leading-relaxed">
              <li>
                <strong>Collateral Basis:</strong> Credit ceilings are calculated based on your current vault balance and projected 24-turn natural economic output.
              </li>
              <li>
                <strong>Amortized Repayment:</strong> When active, loan repayments are automatically deducted from turn income before net yield is credited.
              </li>
              <li>
                <strong>Credit Upgrades:</strong> Upgrading your Stargate Banking Terminals increases your total approved credit ceiling by +25% per tier.
              </li>
              <li>
                <strong>No Prepayment Penalty:</strong> Settle outstanding balances early at any time without fees.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 5: TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#eeeeee] pb-3">
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              Imperial Banking Ledger & Audit Trail
            </h3>
            <span className="text-xs font-mono text-[#777777]">
              {localBankState.transactions?.length || 0} Recorded Actions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#eeeeee] text-[#777777] uppercase text-[10px]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Action Type</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Details</th>
                  <th className="pb-2 text-right">Resulting Vault</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {(localBankState.transactions || []).map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#fafafa]">
                    <td className="py-2.5 text-[#777777] text-[11px]">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 font-bold uppercase text-[10px]">
                      <span
                        className={`px-2 py-0.5 inline-block ${
                          tx.type === 'deposit' || tx.type === 'interest' || tx.type === 'auto_sweep'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.type === 'withdraw' || tx.type === 'loan_repay'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-[#111111]">
                      {tx.amount.toLocaleString()} NQ
                    </td>
                    <td className="py-2.5 text-[#555555] font-sans text-xs">
                      {tx.note}
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#111111]">
                      {tx.resultingBalance.toLocaleString()} NQ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
