import React,{useEffect,useState} from "react";
import {Terminal,ShieldCheck,RefreshCw} from "lucide-react";
import {executeAdminTerminal,getAdminTerminalHistory,getAdminTerminalMenu,type AdminMenuNode} from "../../lib/adminTerminal";

export function AdminSystemsTerminalView(){
 const [menu,setMenu]=useState<AdminMenuNode[]>([]); const [role,setRole]=useState(""); const [command,setCommand]=useState("status");
 const [output,setOutput]=useState<unknown>(null); const [history,setHistory]=useState<any[]>([]); const [error,setError]=useState("");
 const load=async()=>{try{setError("");const m=await getAdminTerminalMenu();setMenu(m.menu);setRole(m.role);setHistory(await getAdminTerminalHistory(25));}catch(e){setError(e instanceof Error?e.message:"Admin terminal unavailable");}};
 useEffect(()=>{void load();},[]);
 const run=async()=>{try{setError("");const r=await executeAdminTerminal(command);setOutput(r.result);setHistory(await getAdminTerminalHistory(25));}catch(e){setError(e instanceof Error?e.message:"Command failed");}};
 return <div className="space-y-4 font-mono">
  <div className="border-2 border-slate-800 bg-slate-950 text-white p-5">
   <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Terminal size={18} className="text-cyan-400"/><span className="font-black">ADMIN SYSTEMS TERMINAL</span></div><span className="text-[10px] text-emerald-400"><ShieldCheck size={12} className="inline mr-1"/>{role||"AUTHENTICATING"}</span></div>
   <p className="text-[11px] text-slate-400 mt-2">Server-authoritative administration. Commands are allow-listed; arbitrary SQL execution is disabled.</p>
  </div>
  {error&&<div className="border border-red-300 bg-red-50 text-red-700 p-3 text-xs">{error}</div>}
  <div className="grid lg:grid-cols-[280px_1fr] gap-4">
   <aside className="border border-slate-300 bg-white p-3 space-y-2"><div className="text-[10px] font-bold uppercase text-slate-500">Systems Menu</div>{menu.map(n=><button key={n.id} onClick={()=>n.commands?.[0]&&setCommand(n.commands[0])} className={"w-full text-left p-2 border text-xs "+(n.commands?.includes(command)?"bg-slate-900 text-white":"bg-white hover:bg-slate-50")}><div className="font-bold">{n.label}</div><div className="text-[10px] opacity-70 mt-1">{n.description}</div></button>)}</aside>
   <main className="border border-slate-300 bg-white p-4 space-y-4">
    <div className="flex gap-2"><select value={command} onChange={e=>setCommand(e.target.value)} className="flex-1 border p-2 text-xs">{menu.flatMap(n=>n.commands||[]).map(c=><option key={c}>{c}</option>)}</select><button onClick={run} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold">EXECUTE</button><button onClick={load} className="p-2 border" title="Refresh"><RefreshCw size={14}/></button></div>
    <pre className="min-h-48 max-h-[500px] overflow-auto bg-slate-950 text-emerald-300 p-4 text-xs">{output?JSON.stringify(output,null,2):"Ready."}</pre>
    <div><div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Recent Terminal History</div>{history.map(h=><div key={h.id} className="border-t p-2 text-[10px]"><span className="font-bold">{h.command}</span><span className="text-slate-500 ml-2">{new Date(h.created_at).toLocaleString()}</span></div>)}</div>
   </main>
  </div>
 </div>;
}
