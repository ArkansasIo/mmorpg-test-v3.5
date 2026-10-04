import React from 'react';
import { AlertTriangle, ArrowLeft, Home, Search } from 'lucide-react';

export interface RouteNotFoundViewProps { route: string; onNavigate: (route: string) => void; }

export const RouteNotFoundView: React.FC<RouteNotFoundViewProps> = ({ route, onNavigate }) => (
  <section className="max-w-4xl mx-auto w-full p-6">
    <div className="border border-red-300 bg-white shadow-sm">
      <div className="border-b border-red-200 bg-red-50 px-6 py-5 flex items-start gap-4">
        <AlertTriangle className="text-red-600 shrink-0" size={28} />
        <div><h1 className="text-lg font-black uppercase tracking-wider text-[#111]">Page Not Found</h1><p className="text-xs text-red-700 mt-1">The requested command route is not registered in the current client build.</p></div>
      </div>
      <div className="p-6 space-y-5">
        <div className="font-mono text-xs bg-neutral-100 border border-neutral-200 p-4 break-all">ROUTE: {route || '(empty)'}</div>
        <p className="text-sm text-neutral-600">This guard prevents an unregistered navigation item from becoming a white screen. Return to a known command surface or use the navigation groups.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onNavigate('dashboard')} className="px-4 py-2 bg-[#111] text-white text-xs font-bold uppercase flex items-center gap-2"><Home size={14}/> Command Dashboard</button>
          <button type="button" onClick={() => onNavigate('resources')} className="px-4 py-2 border border-neutral-300 bg-white text-[#111] text-xs font-bold uppercase flex items-center gap-2"><Search size={14}/> Resource Vault</button>
          <button type="button" onClick={() => window.history.back()} className="px-4 py-2 border border-neutral-300 bg-white text-[#111] text-xs font-bold uppercase flex items-center gap-2"><ArrowLeft size={14}/> Back</button>
        </div>
      </div>
    </div>
  </section>
);
export default RouteNotFoundView;
