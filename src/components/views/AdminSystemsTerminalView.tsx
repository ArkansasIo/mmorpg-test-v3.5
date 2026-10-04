import { useEffect, useMemo, useState } from "react";
import { Activity, Database, RefreshCw, Search, ShieldCheck, Terminal, Users, Server, AlertTriangle } from "lucide-react";
import { executeAdminTerminal, getAdminTerminalHistory, getAdminTerminalMenu, type AdminMenuNode } from "../../lib/adminTerminal";

type Output = Record<string, unknown>;
type HistoryEntry = { id: string | number; command?: string; created_at?: string };

export function AdminSystemsTerminalView() {
  const [menu, setMenu] = useState<AdminMenuNode[]>([]);
  const [role, setRole] = useState("");
  const [command, setCommand] = useState("status");
  const [output, setOutput] = useState<Output | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setError("");
      const [m, h] = await Promise.all([getAdminTerminalMenu(), getAdminTerminalHistory(25)]);
      setMenu(Array.isArray(m.menu) ? m.menu : []);
      setRole(m.role || "admin");
      setHistory(Array.isArray(h) ? h : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Admin systems unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const commands = useMemo(
    () => menu.flatMap((node) => Array.isArray(node.commands) ? node.commands : []),
    [menu],
  );

  useEffect(() => {
    if (commands.length && !commands.includes(command)) setCommand(commands[0]);
  }, [commands, command]);

  const run = async (requestedCommand = command) => {
    try {
      setError("");
      setLoading(true);
      let args: Record<string, unknown> = {};
      if (requestedCommand === "users search") args = { query: query.trim() };
      if (requestedCommand === "user ban" || requestedCommand === "user unban") args = { userId: query.trim() };
      if (requestedCommand === "config get") args = { key: query.trim() };
      const result = await executeAdminTerminal(requestedCommand, args);
      setOutput(result.result && typeof result.result === "object" ? result.result as Output : { result: result.result });
      const h = await getAdminTerminalHistory(25);
      setHistory(Array.isArray(h) ? h : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Command failed");
    } finally {
      setLoading(false);
    }
  };

  const stats = output || {};
  return (
    <div className="space-y-4">
      <div className="bg-slate-950 text-white border border-cyan-900 p-5 shadow-xl">
        <div className="flex flex-wrap justify-between gap-4 items-center">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-black tracking-widest"><Terminal size={16} /> ADMIN SYSTEMS COMMAND CENTER</div>
            <h2 className="text-2xl font-black mt-1">Server Administration</h2>
            <p className="text-slate-400 text-xs mt-1">Server-authoritative controls with RBAC, audit logging, and allow-listed commands.</p>
          </div>
          <div className="flex items-center gap-2 border border-emerald-700 bg-emerald-950/40 px-3 py-2 text-xs">
            <ShieldCheck size={15} className="text-emerald-400" /><span>{role || "AUTHENTICATING"}</span>
          </div>
        </div>
      </div>

      {error && <div className="border border-red-500/40 bg-red-950/30 text-red-300 p-3 text-xs flex gap-2"><AlertTriangle size={15} />{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-slate-700 bg-slate-950 p-4 text-white"><Activity size={16} className="text-cyan-400" /><div className="text-[10px] text-slate-500 uppercase mt-2">Runtime</div><div className="text-lg font-black">{String(stats.status ?? "—")}</div></div>
        <div className="border border-slate-700 bg-slate-950 p-4 text-white"><Users size={16} className="text-cyan-400" /><div className="text-[10px] text-slate-500 uppercase mt-2">Users</div><div className="text-lg font-black">{String(stats.users ?? "—")}</div></div>
        <div className="border border-slate-700 bg-slate-950 p-4 text-white"><ShieldCheck size={16} className="text-cyan-400" /><div className="text-[10px] text-slate-500 uppercase mt-2">Admins</div><div className="text-lg font-black">{String(stats.administrators ?? "—")}</div></div>
        <div className="border border-slate-700 bg-slate-950 p-4 text-white"><Server size={16} className="text-cyan-400" /><div className="text-[10px] text-slate-500 uppercase mt-2">Memory</div><div className="text-lg font-black">{stats.memoryMb ? String(stats.memoryMb) + " MB" : "—"}</div></div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        <aside className="border border-slate-300 bg-white p-3 space-y-2">
          <div className="text-[10px] font-bold uppercase text-slate-500">Authorized Systems</div>
          {menu.map((node) => (
            <button key={node.id} type="button" onClick={() => node.commands?.[0] && setCommand(node.commands[0])}
              className={"w-full text-left p-2 border text-xs " + (node.commands?.includes(command) ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50")}>
              <div className="font-bold">{node.label}</div><div className="text-[10px] opacity-70">{node.description}</div>
            </button>
          ))}
        </aside>

        <main className="border border-slate-300 bg-white p-4 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <select value={command} onChange={(e) => setCommand(e.target.value)} className="border p-2 text-xs min-w-52" disabled={!commands.length || loading}>
              {commands.length ? commands.map((item) => <option key={item} value={item}>{item}</option>) : <option value="status">status</option>}
            </select>
            <div className="relative flex-1 min-w-52"><Search size={14} className="absolute left-2 top-2.5 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Query, user ID, or config key" className="w-full border p-2 pl-7 text-xs" /></div>
            <button type="button" onClick={() => void run()} disabled={loading || !commands.length} className="px-4 py-2 bg-slate-950 text-white text-xs font-black disabled:opacity-50">{loading ? "WORKING..." : "EXECUTE"}</button>
            <button type="button" onClick={() => void load()} className="p-2 border disabled:opacity-50" disabled={loading} title="Refresh"><RefreshCw size={14} /></button>
          </div>

          <pre className="min-h-56 max-h-[460px] overflow-auto bg-slate-950 text-emerald-300 p-4 text-xs">{output ? JSON.stringify(output, null, 2) : "Ready. Execute status to load live server metrics."}</pre>

          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-2"><Database size={13} />Recent Terminal Activity</div>
            {history.map((item) => <div key={item.id} className="border-t p-2 text-[10px] flex justify-between gap-2"><span className="font-bold">{item.command || "unknown"}</span><span className="text-slate-500">{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</span></div>)}
          </div>
        </main>
      </div>
    </div>
  );
}
