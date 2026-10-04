import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Crosshair,
  Wrench,
  Search,
  Zap,
  Info,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  Flame,
  Truck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../sound';
import { PlayerWeapon, WeaponType, PlayerResources, EquipmentCategory } from '../../types';

interface ArmoryViewProps {
  resources: PlayerResources;
  weapons: WeaponType[];
  inventory: PlayerWeapon[];
  activeRoute?: string;
  onBuyWeapon: (weaponTypeId: string, quantity: number) => { success: boolean; message: string };
  onRepairWeapon: (weaponTypeId: string) => { success: boolean; message: string };
  onRepairAll?: () => { success: boolean; message: string };
}

type TabType = 'all' | 'weapon' | 'armor' | 'shield' | 'depot';

export const ArmoryView: React.FC<ArmoryViewProps> = ({
  resources,
  weapons,
  inventory,
  activeRoute,
  onBuyWeapon,
  onRepairWeapon,
  onRepairAll,
}) => {
  // Sync tab with sidebar activeRoute if specified
  const initialTab: TabType = useMemo(() => {
    if (activeRoute === 'weapons') return 'weapon';
    if (activeRoute === 'armors') return 'armor';
    if (activeRoute === 'shields') return 'shield';
    if (activeRoute === 'repair') return 'depot';
    return 'all';
  }, [activeRoute]);

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'power' | 'price' | 'tier' | 'name'>('power');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [inspectedItem, setInspectedItem] = useState<WeaponType | null>(null);

  // Update tab when route changes
  useEffect(() => {
    if (activeRoute === 'weapons') setActiveTab('weapon');
    else if (activeRoute === 'armors') setActiveTab('armor');
    else if (activeRoute === 'shields') setActiveTab('shield');
    else if (activeRoute === 'repair') setActiveTab('depot');
    else if (activeRoute === 'weapon-market') setActiveTab('all');
  }, [activeRoute]);

  // Reset subcategory when switching tabs
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedSubCategory('all');
  };

  const getQuantityInput = (id: string) => quantities[id] || 1;

  const setQuantityInput = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, Math.min(10000, val)) }));
  };

  const setQuickQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  };

  const setMaxAfford = (weapon: WeaponType) => {
    const max = Math.max(1, Math.floor(resources.naquadah / weapon.price));
    setQuantities((prev) => ({ ...prev, [weapon.id]: max }));
  };

  const handleBuy = (weapon: WeaponType) => {
    const qty = getQuantityInput(weapon.id);
    const res = onBuyWeapon(weapon.id, qty);
    if (res.success) {
      sound.play('trade');
      setNotice({ type: 'success', text: res.message });
    } else {
      sound.play('warning');
      setNotice({ type: 'error', text: res.message });
    }
  };

  const handleRepair = (weaponTypeId: string) => {
    const res = onRepairWeapon(weaponTypeId);
    if (res.success) {
      sound.play('confirm');
      setNotice({ type: 'success', text: res.message });
    } else {
      sound.play('warning');
      setNotice({ type: 'error', text: res.message });
    }
  };

  const handleRepairAll = () => {
    if (onRepairAll) {
      const res = onRepairAll();
      if (res.success) {
        sound.play('confirm');
        setNotice({ type: 'success', text: res.message });
      } else {
        sound.play('warning');
        setNotice({ type: 'error', text: res.message });
      }
    }
  };

  // Summary Metrics
  const summary = useMemo(() => {
    let totalAttack = 0;
    let totalDefense = 0;
    let totalItems = 0;
    let damagedCount = 0;
    let totalRepairCost = 0;
    let totalDurabilitySum = 0;

    inventory.forEach((inv) => {
      const wt = weapons.find((w) => w.id === inv.weaponTypeId);
      if (wt) {
        const durMult = inv.durability / 100;
        totalAttack += wt.attack * inv.quantity * durMult;
        totalDefense += wt.defense * inv.quantity * durMult;
        totalItems += inv.quantity;
        totalDurabilitySum += inv.durability * inv.quantity;
        if (inv.durability < 100) {
          damagedCount += inv.quantity;
          totalRepairCost += Math.max(10, Math.round(inv.quantity * 25 * ((100 - inv.durability) / 100)));
        }
      }
    });

    const avgDurability = totalItems > 0 ? Math.round(totalDurabilitySum / totalItems) : 100;

    return {
      totalAttack: Math.round(totalAttack),
      totalDefense: Math.round(totalDefense),
      totalItems,
      damagedCount,
      totalRepairCost,
      avgDurability,
    };
  }, [inventory, weapons]);

  // Filter and Sort Items
  const filteredItems = useMemo(() => {
    return weapons.filter((w) => {
      // Tab filter
      if (activeTab === 'depot') {
        const owned = inventory.find((item) => item.weaponTypeId === w.id);
        if (!owned || owned.quantity <= 0) return false;
      } else if (activeTab !== 'all' && w.itemType !== activeTab) {
        return false;
      }

      // SubCategory filter
      if (selectedSubCategory !== 'all' && w.subCategory !== selectedSubCategory) {
        return false;
      }

      // Tier filter
      if (tierFilter !== 'all' && w.tier !== tierFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = w.name.toLowerCase().includes(q);
        const matchesSub = w.subCategory.toLowerCase().includes(q);
        const matchesSpec = w.specSummary.toLowerCase().includes(q);
        const matchesDesc = w.description.toLowerCase().includes(q);
        const matchesDoc = (w.doctrine || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSub && !matchesSpec && !matchesDesc && !matchesDoc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'power') comparison = b.power - a.power;
      else if (sortBy === 'price') comparison = b.price - a.price;
      else if (sortBy === 'tier') comparison = b.tier - a.tier;
      else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }, [weapons, inventory, activeTab, selectedSubCategory, tierFilter, searchQuery, sortBy, sortOrder]);

  // Subcategories available for active tab
  const availableSubCategories = useMemo(() => {
    const list = weapons
      .filter((w) => (activeTab === 'all' || activeTab === 'depot' ? true : w.itemType === activeTab))
      .map((w) => w.subCategory);
    return Array.from(new Set(list));
  }, [weapons, activeTab]);

  return (
    <div id="armory-view" className="space-y-6">
      {/* Header Banner */}
      <div className="border border-[#dedede] bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
              ARMORY & DEFENSE LOGISTICS · REALM ARSENAL
            </div>
            <h2 className="text-2xl font-bold text-[#111111]">Weapons, Armors & Shields Arsenal</h2>
            <p className="text-xs text-[#666666] mt-1 max-w-2xl leading-relaxed">
              Equip your armed forces with tactical assault carbines, heavy artillery, armored combat vehicles,
              ballistic ceramic plates, and planetary phase barrier shields.
            </p>
          </div>

          {summary.damagedCount > 0 && onRepairAll && (
            <div className="flex items-center gap-3 bg-[#fafafa] border border-[#dedede] p-3">
              <div className="text-right">
                <div className="text-[10px] font-bold text-[#dc2626] uppercase">Maintenance Alert</div>
                <div className="text-xs font-mono font-bold text-[#111111]">
                  {summary.damagedCount.toLocaleString()} damaged systems ({summary.totalRepairCost.toLocaleString()} NQ)
                </div>
              </div>
              <button
                type="button"
                onClick={handleRepairAll}
                className="px-3 py-2 bg-[#111111] text-white text-xs font-bold hover:bg-[#333333] transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Wrench size={12} />
                <span>Repair All Depot</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Armory Readiness Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="border border-[#dedede] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
            <Crosshair size={12} className="text-[#111111]" />
            <span>Offense Output</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#111111]">
            +{summary.totalAttack.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#666666] mt-0.5">Weapons Strike Bonus</div>
        </div>

        <div className="border border-[#dedede] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
            <Shield size={12} className="text-[#111111]" />
            <span>Defense Absorbed</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#111111]">
            +{summary.totalDefense.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#666666] mt-0.5">Armor & Shield Plating</div>
        </div>

        <div className="border border-[#dedede] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
            <Layers size={12} className="text-[#111111]" />
            <span>Depot Systems</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#111111]">
            {summary.totalItems.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#666666] mt-0.5">Equipped Hardware Units</div>
        </div>

        <div className="border border-[#dedede] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
            <Wrench size={12} className="text-[#111111]" />
            <span>Readiness Index</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#111111]">
            {summary.avgDurability}%
          </div>
          <div className="text-[10px] text-[#666666] mt-0.5">Fleet Durability Avg</div>
        </div>

        <div className="border border-[#dedede] bg-white p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
            <Zap size={12} className="text-[#111111]" />
            <span>Treasury</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#111111]">
            {resources.naquadah.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#666666] mt-0.5">Available Naquadah</div>
        </div>
      </div>

      {notice && (
        <div
          className={`p-4 border text-xs font-semibold flex justify-between items-center ${
            notice.type === 'success'
              ? 'bg-[#fafafa] border-[#111111] text-[#111111] border-l-4'
              : 'bg-[#fff5f5] border-[#dc2626] text-[#dc2626] border-l-4'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Main Armory View Container */}
      <div className="border border-[#dedede] bg-white">
        {/* Navigation Category Tabs */}
        <div className="flex flex-wrap border-b border-[#dedede] bg-[#fafafa]">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-r border-[#dedede] ${
              activeTab === 'all'
                ? 'bg-white text-[#111111] border-b-2 border-b-[#111111] -mb-[1px]'
                : 'text-[#666666] hover:text-[#111111] hover:bg-white/50'
            }`}
          >
            All Ordnance ({weapons.length})
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('weapon')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-r border-[#dedede] flex items-center gap-1.5 ${
              activeTab === 'weapon'
                ? 'bg-white text-[#111111] border-b-2 border-b-[#111111] -mb-[1px]'
                : 'text-[#666666] hover:text-[#111111] hover:bg-white/50'
            }`}
          >
            <Crosshair size={13} />
            <span>Weapons ({weapons.filter((w) => w.itemType === 'weapon').length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('armor')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-r border-[#dedede] flex items-center gap-1.5 ${
              activeTab === 'armor'
                ? 'bg-white text-[#111111] border-b-2 border-b-[#111111] -mb-[1px]'
                : 'text-[#666666] hover:text-[#111111] hover:bg-white/50'
            }`}
          >
            <Shield size={13} />
            <span>Armors & Vehicles ({weapons.filter((w) => w.itemType === 'armor').length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('shield')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-r border-[#dedede] flex items-center gap-1.5 ${
              activeTab === 'shield'
                ? 'bg-white text-[#111111] border-b-2 border-b-[#111111] -mb-[1px]'
                : 'text-[#666666] hover:text-[#111111] hover:bg-white/50'
            }`}
          >
            <Sparkles size={13} />
            <span>Shields & Deflectors ({weapons.filter((w) => w.itemType === 'shield').length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('depot')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ml-auto border-l border-[#dedede] flex items-center gap-1.5 ${
              activeTab === 'depot'
                ? 'bg-white text-[#111111] border-b-2 border-b-[#111111] -mb-[1px]'
                : 'text-[#666666] hover:text-[#111111] hover:bg-white/50'
            }`}
          >
            <Wrench size={13} />
            <span>My Depot ({inventory.filter((i) => i.quantity > 0).length})</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-[#dedede] bg-white space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                placeholder="Search by system name, caliber, doctrine, or specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-[#cccccc] text-xs focus:outline-none focus:border-[#111111] transition-colors"
              />
            </div>

            {/* Tier Filter & Sorting */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-[#777777] uppercase">Tier:</span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
                  className="border border-[#cccccc] px-2 py-1 bg-white text-xs"
                >
                  <option value="all">All Tiers</option>
                  <option value={1}>Tier I · Standard / Surplus</option>
                  <option value={2}>Tier II · Heavy Tactical</option>
                  <option value={3}>Tier III · Advanced Military</option>
                  <option value={4}>Tier IV · Elite Heavy</option>
                  <option value={5}>Tier V · Legendary / Exotic</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-[#777777] uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-[#cccccc] px-2 py-1 bg-white text-xs"
                >
                  <option value="power">Combat Power</option>
                  <option value="price">Unit Price</option>
                  <option value="tier">Technology Tier</option>
                  <option value="name">Alphabetical</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="border border-[#cccccc] px-2 py-1 bg-white font-mono hover:bg-[#fafafa]"
                  title="Toggle Sort Order"
                >
                  {sortOrder === 'asc' ? '▲' : '▼'}
                </button>
              </div>
            </div>
          </div>

          {/* Subcategory Pills */}
          {availableSubCategories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-[#777777] uppercase mr-1">Filter Class:</span>
              <button
                type="button"
                onClick={() => setSelectedSubCategory('all')}
                className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                  selectedSubCategory === 'all'
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white text-[#666666] border-[#dedede] hover:border-[#111111]'
                }`}
              >
                All Classes
              </button>
              {availableSubCategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                    selectedSubCategory === sub
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-[#666666] border-[#dedede] hover:border-[#111111]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Equipment List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#dedede] text-[#777777] font-bold uppercase text-[10px] bg-[#fafafa]">
                <th className="py-3 px-4">Military System / Ordnance</th>
                <th className="py-3 px-2">Classification</th>
                <th className="py-3 px-2">Tier</th>
                <th className="py-3 px-2">Combat Rating</th>
                <th className="py-3 px-2">Unit Price</th>
                <th className="py-3 px-2">In Depot</th>
                <th className="py-3 px-2">Durability</th>
                <th className="py-3 px-4 text-right">Procurement & Maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeee]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#888888]">
                    No military systems matched your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((w) => {
                  const owned = inventory.find((item) => item.weaponTypeId === w.id);
                  const count = owned ? owned.quantity : 0;
                  const dur = owned ? owned.durability : 100;
                  const qty = getQuantityInput(w.id);
                  const totalCost = w.price * qty;
                  const canAfford = resources.naquadah >= totalCost;
                  const isDamaged = count > 0 && dur < 100;
                  const singleRepairCost = Math.max(10, Math.round(count * 25 * ((100 - dur) / 100)));

                  // Tier badge styling
                  const tierColors: Record<number, string> = {
                    1: 'border-[#cccccc] text-[#666666]',
                    2: 'border-[#111111] text-[#111111] bg-[#f5f5f5]',
                    3: 'border-[#2563eb] text-[#2563eb]',
                    4: 'border-[#7c3aed] text-[#7c3aed]',
                    5: 'border-[#d97706] text-[#b45309] font-bold bg-[#fffbeb]',
                  };

                  return (
                    <tr key={w.id} className="hover:bg-[#fafafa] transition-colors group">
                      {/* Name & Quick Specs */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="font-bold text-[#111111] flex items-center gap-1.5">
                              <span>{w.name}</span>
                              <button
                                type="button"
                                onClick={() => setInspectedItem(w)}
                                title="View Military Specifications"
                                className="text-[#888888] hover:text-[#111111] transition-colors"
                              >
                                <Info size={13} />
                              </button>
                            </div>
                            <div className="text-[11px] text-[#666666] font-mono mt-0.5 max-w-sm truncate">
                              {w.specSummary}
                            </div>
                            {w.doctrine && (
                              <div className="text-[10px] text-[#888888] italic mt-0.5">
                                Doctrine: {w.doctrine}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Classification */}
                      <td className="py-3.5 px-2">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-1.5 py-0.5 border text-[10px] font-bold uppercase ${
                              w.itemType === 'weapon'
                                ? 'border-[#dc2626] text-[#dc2626]'
                                : w.itemType === 'armor'
                                ? 'border-[#2563eb] text-[#2563eb]'
                                : 'border-[#059669] text-[#059669]'
                            }`}
                          >
                            {w.itemType}
                          </span>
                          <div className="text-[10px] text-[#666666] font-medium">{w.subCategory}</div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-2">
                        <span className={`px-1.5 py-0.5 border text-[10px] ${tierColors[w.tier] || 'border-[#cccccc]'}`}>
                          Tier {w.tier}
                        </span>
                      </td>

                      {/* Combat Rating */}
                      <td className="py-3.5 px-2 font-mono">
                        <div className="space-y-0.5">
                          {w.attack > 0 && (
                            <div className="text-xs font-bold text-[#111111]">
                              +{w.attack} <span className="text-[10px] font-normal text-[#666666]">ATK</span>
                            </div>
                          )}
                          {w.defense > 0 && (
                            <div className="text-xs font-bold text-[#2563eb]">
                              +{w.defense} <span className="text-[10px] font-normal text-[#666666]">DEF</span>
                            </div>
                          )}
                          {w.attack === 0 && w.defense === 0 && (
                            <div className="text-xs font-bold text-[#111111]">+{w.power} PWR</div>
                          )}
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-2 font-mono text-[#444444]">
                        <div className="font-bold text-[#111111]">{w.price.toLocaleString()} NQ</div>
                        {w.upkeep && w.upkeep > 0 ? (
                          <div className="text-[10px] text-[#888888]">{w.upkeep} NQ / turn</div>
                        ) : null}
                      </td>

                      {/* In Inventory */}
                      <td className="py-3.5 px-2 font-mono font-bold text-[#111111]">
                        {count.toLocaleString()}
                      </td>

                      {/* Durability */}
                      <td className="py-3.5 px-2">
                        {count > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-[#eeeeee] overflow-hidden">
                              <div
                                className={`h-full ${
                                  dur < 70 ? 'bg-[#dc2626]' : dur < 90 ? 'bg-[#d97706]' : 'bg-[#111111]'
                                }`}
                                style={{ width: `${dur}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-[#666666]">{dur}%</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#aaaaaa]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex flex-col items-end gap-1.5">
                          {/* Quick purchase controls */}
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max="10000"
                              value={qty}
                              onChange={(e) => setQuantityInput(w.id, parseInt(e.target.value, 10) || 1)}
                              className="w-16 border border-[#cccccc] px-1.5 py-1 text-center font-mono text-xs"
                            />
                            <div className="flex border border-[#cccccc] divide-x divide-[#cccccc]">
                              <button
                                type="button"
                                onClick={() => setQuickQuantity(w.id, 10)}
                                className="px-1.5 py-1 text-[10px] font-bold text-[#555555] hover:bg-[#eeeeee]"
                                title="Add 10"
                              >
                                +10
                              </button>
                              <button
                                type="button"
                                onClick={() => setQuickQuantity(w.id, 50)}
                                className="px-1.5 py-1 text-[10px] font-bold text-[#555555] hover:bg-[#eeeeee]"
                                title="Add 50"
                              >
                                +50
                              </button>
                              <button
                                type="button"
                                onClick={() => setMaxAfford(w)}
                                className="px-1.5 py-1 text-[10px] font-bold text-[#555555] hover:bg-[#eeeeee]"
                                title="Max affordable with current Naquadah"
                              >
                                Max
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleBuy(w)}
                              disabled={!canAfford}
                              title={`Buy ${qty} for ${totalCost.toLocaleString()} Naquadah`}
                              className={`px-3 py-1 font-bold text-xs transition-colors whitespace-nowrap ${
                                canAfford
                                  ? 'bg-[#111111] text-white hover:bg-[#333333]'
                                  : 'bg-[#eeeeee] text-[#aaaaaa] cursor-not-allowed'
                              }`}
                            >
                              Buy ({totalCost.toLocaleString()} NQ)
                            </button>
                          </div>

                          {/* Repair Button if damaged */}
                          {isDamaged && (
                            <button
                              type="button"
                              onClick={() => handleRepair(w.id)}
                              className="px-2.5 py-1 border border-[#dc2626] text-[#dc2626] hover:bg-[#fff5f5] font-bold text-[11px] transition-colors flex items-center gap-1"
                              title={`Restore durability to 100% (Cost: ~${singleRepairCost.toLocaleString()} NQ)`}
                            >
                              <Wrench size={11} />
                              <span>Repair System ({singleRepairCost.toLocaleString()} NQ)</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Military Specification Inspection Modal */}
      {inspectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#111111] max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-[#dedede] pb-3">
              <div>
                <div className="text-[9px] font-bold text-[#777777] uppercase tracking-[1.5px]">
                  MILITARY EQUIPMENT SPECIFICATION DOSSIER
                </div>
                <h3 className="text-xl font-bold text-[#111111] mt-0.5">{inspectedItem.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.5 border border-[#111111] text-[10px] font-bold uppercase">
                    {inspectedItem.itemType}
                  </span>
                  <span className="text-xs text-[#666666]">{inspectedItem.subCategory}</span>
                  <span className="text-xs text-[#888888]">· Tier {inspectedItem.tier}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                className="text-lg font-bold text-[#555555] hover:text-[#111111]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#444444] leading-relaxed">
              {inspectedItem.description}
            </p>

            <div className="grid grid-cols-2 gap-3 bg-[#fafafa] p-4 border border-[#dedede] text-xs">
              <div>
                <span className="block text-[10px] font-bold text-[#777777] uppercase">Technical Specs</span>
                <strong className="text-[#111111] font-mono text-xs">{inspectedItem.specSummary}</strong>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#777777] uppercase">Operational Doctrine</span>
                <span className="text-[#111111] text-xs">{inspectedItem.doctrine || 'Combined Arms'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#777777] uppercase">Mass / Chassis</span>
                <span className="font-mono text-[#111111] text-xs">{inspectedItem.mass || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#777777] uppercase">Operational Range</span>
                <span className="font-mono text-[#111111] text-xs">{inspectedItem.range || 'Tactical Direct Fire'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#777777] uppercase">Crew / Operators</span>
                <span className="font-mono text-[#111111] text-xs">{inspectedItem.crewReq ?? 1} personnel</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#777777] uppercase">Turn Upkeep</span>
                <span className="font-mono text-[#111111] text-xs">{inspectedItem.upkeep ?? 0} Naquadah</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#777777] uppercase">Strike / Defense Power</span>
                <span className="font-mono font-bold text-[#111111] text-xs">
                  +{inspectedItem.attack} ATK / +{inspectedItem.defense} DEF
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#777777] uppercase">Unit Cost</span>
                <span className="font-mono font-bold text-[#111111] text-xs">{inspectedItem.price.toLocaleString()} NQ</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                className="px-4 py-1.5 bg-[#111111] text-white text-xs font-bold hover:bg-[#333333]"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
