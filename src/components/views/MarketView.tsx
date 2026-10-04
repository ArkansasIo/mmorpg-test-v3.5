import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, UserCheck } from 'lucide-react';
import { sound } from '../../sound';
import { MarketOrder, MercenaryContract, PlayerResources } from '../../types';

interface MarketViewProps {
  resources: PlayerResources;
  orders: MarketOrder[];
  mercenaries: MercenaryContract[];
  onHireMercenary: (contractId: string) => { success: boolean; message: string };
  onFulfillOrder: (orderId: string) => { success: boolean; message: string };
}

export const MarketView: React.FC<MarketViewProps> = ({
  resources,
  orders,
  mercenaries,
  onHireMercenary,
  onFulfillOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'mercenaries'>('resources');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleHire = (contractId: string) => {
    const res = onHireMercenary(contractId);
    if (res.success) {
      sound.play('confirm');
      setNotice({ type: 'success', text: res.message });
    } else {
      sound.play('warning');
      setNotice({ type: 'error', text: res.message });
    }
  };

  const handleOrder = (orderId: string) => {
    const res = onFulfillOrder(orderId);
    if (res.success) {
      sound.play('trade');
      setNotice({ type: 'success', text: res.message });
    } else {
      sound.play('warning');
      setNotice({ type: 'error', text: res.message });
    }
  };

  return (
    <div id="market-view" className="space-y-6">
      <div className="border border-[#dedede] bg-white p-6">
        <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
          COMMERCE & CONTRACTORS · TRADE NETWORK
        </div>
        <h2 className="text-2xl font-bold text-[#111111]">Galactic Market & Mercenaries</h2>
        <p className="text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
          Access free trade markets across neutral outposts. Purchase commodity resources or contract
          mercenary legions to bolster your planetary defense lines immediately.
        </p>
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
          <button type="button" onClick={() => setNotice(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#dedede] bg-white px-4">
        <button
          type="button"
          onClick={() => {
            sound.play('click');
            setActiveTab('resources');
          }}
          className={`py-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'resources'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          Resource Exchange
        </button>
        <button
          type="button"
          onClick={() => {
            sound.play('click');
            setActiveTab('mercenaries');
          }}
          className={`py-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'mercenaries'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          Mercenary Guild
        </button>
      </div>

      {/* Content */}
      {activeTab === 'resources' ? (
        <div className="border border-[#dedede] bg-white p-6">
          <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider border-b border-[#eeeeee] pb-4 mb-4">
            Active Galactic Exchange Listings
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#dedede] text-[#777777] font-bold uppercase text-[10px]">
                  <th className="py-3 px-2">Merchant Syndicate</th>
                  <th className="py-3 px-2">Commodity</th>
                  <th className="py-3 px-2">Quantity</th>
                  <th className="py-3 px-2">Unit Price</th>
                  <th className="py-3 px-2">Total Value</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3.5 px-2 font-bold text-[#111111]">{o.sellerName}</td>
                    <td className="py-3.5 px-2 uppercase text-[10px] font-semibold text-[#555555]">
                      {o.resourceType}
                    </td>
                    <td className="py-3.5 px-2 font-mono font-bold text-[#111111]">
                      {o.quantity.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-2 font-mono text-[#666666]">{o.pricePerUnit} NQ</td>
                    <td className="py-3.5 px-2 font-mono font-bold text-[#111111]">
                      {o.totalCost.toLocaleString()} NQ
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleOrder(o.id)}
                        disabled={resources.naquadah < o.totalCost}
                        className="px-4 py-1.5 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors disabled:opacity-50"
                      >
                        Acquire Order →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mercenaries.map((merc) => {
            const canAfford = resources.naquadah >= merc.cost;

            return (
              <div key={merc.id} className="border border-[#dedede] bg-white p-6 flex flex-col justify-between">
                <div>
                  <div className="border-b border-[#eeeeee] pb-3 mb-3">
                    <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                      {merc.type} legion
                    </span>
                    <h3 className="text-base font-bold text-[#111111] mt-0.5">{merc.name}</h3>
                  </div>

                  <div className="border border-[#eeeeee] bg-[#fafafa] p-3 text-xs space-y-1.5 mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#666666]">Attack Strength:</span>
                      <b className="font-mono text-[#111111]">+{merc.attackPower}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666]">Defense Fortification:</span>
                      <b className="font-mono text-[#111111]">+{merc.defensePower}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666]">Turn Upkeep:</span>
                      <b className="font-mono text-[#dc2626]">-{merc.upkeepPerTurn} NQ/turn</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666]">Available Cadres:</span>
                      <b className="font-mono text-[#111111]">{merc.available}</b>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#eeeeee] pt-3 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#111111]">
                    {merc.cost.toLocaleString()} Naquadah
                  </span>
                  <button
                    type="button"
                    onClick={() => handleHire(merc.id)}
                    disabled={!canAfford || merc.available <= 0}
                    className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] transition-colors disabled:opacity-50"
                  >
                    Enlist Unit →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
