import React, { useState, useEffect } from 'react';
import { ArrowRight, Code2, Copy, Check, FileCheck, Layers, Play, RefreshCw, Cpu } from 'lucide-react';

const PRESETS = {
  express: `// Express Node.js Server in TypeScript
import express, { Request, Response } from 'express';

interface ServerMetrics {
  uptime: number;
  pid: number;
  memoryMB: number;
  healthy: boolean;
}

const app = express();
const PORT: number = 3000;
const startTime: number = Date.now();

app.use(express.json());

app.get('/api/health', (req: Request, res: Response): void => {
  const metrics: ServerMetrics = {
    uptime: Math.floor((Date.now() - startTime) / 1000),
    pid: process.pid,
    memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    healthy: true,
  };
  res.json(metrics);
});

app.listen(PORT, (): void => {
  console.log(\`Server listening on http://localhost:\${PORT}\`);
});`,

  worker: `// Background Worker Daemon with TypeScript Types
interface TaskPayload {
  id: string;
  name: string;
  retries: number;
  timestamp: number;
}

class TaskSupervisor {
  private activeTasks: Map<string, TaskPayload> = new Map();

  public register(task: TaskPayload): boolean {
    if (this.activeTasks.has(task.id)) return false;
    this.activeTasks.set(task.id, task);
    return true;
  }

  public async processAll(): Promise<number> {
    let completed = 0;
    for (const [id, task] of this.activeTasks.entries()) {
      console.log(\`Processing task \${id} (\${task.name})...\`);
      completed++;
    }
    return completed;
  }
}

export const supervisor = new TaskSupervisor();`,

  config: `// Strictly Typed Environment Configuration
import dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  databaseUrl: string;
  autoRestartDelay: number;
}

export function loadConfig(): AppConfig {
  const port = parseInt(process.env.PORT || '3000', 10);
  const nodeEnv = (process.env.NODE_ENV || 'development') as AppConfig['nodeEnv'];
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/app';

  return {
    port,
    nodeEnv,
    databaseUrl,
    autoRestartDelay: 3000,
  };
}`,
};

export const LiveCompiler: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'express' | 'worker' | 'config'>('express');
  const [tsCode, setTsCode] = useState<string>(PRESETS.express);
  const [compiledJs, setCompiledJs] = useState<string>('');
  const [compiledDts, setCompiledDts] = useState<string>('');
  const [targetModule, setTargetModule] = useState<'esm' | 'cjs'>('esm');
  const [targetEcma, setTargetEcma] = useState<'ES2022' | 'ES2020'>('ES2022');
  const [removeComments, setRemoveComments] = useState<boolean>(false);
  const [activeOutputTab, setActiveOutputTab] = useState<'js' | 'dts'>('js');
  const [compileTimeMs, setCompileTimeMs] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // In-browser TypeScript transpiler simulation
  const compileTypeScript = (source: string, mode: 'esm' | 'cjs', target: string, stripComments: boolean) => {
    const start = performance.now();

    let output = source;

    // Remove comments if requested
    if (stripComments) {
      output = output.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    }

    // Generate .d.ts representation
    const typeMatches = source.match(/(?:interface|type|class)\s+([A-Za-z0-9_]+)[\s\S]*?\{[\s\S]*?\}/g) || [];
    const dtsOutput = `// Auto-generated TypeScript declaration\n// Target: ${target}\n\n` +
      typeMatches.map(t => `export declare ${t.trim()}`).join('\n\n') +
      `\n\nexport declare const PORT: number;\nexport declare const app: any;`;
    setCompiledDts(dtsOutput);

    // Strip type annotations for JS output
    // 1. Remove interfaces and types
    output = output.replace(/(?:export\s+)?(?:interface|type)\s+[A-Za-z0-9_]+[\s\S]*?\{[\s\S]*?\}/g, '');
    output = output.replace(/(?:export\s+)?type\s+[A-Za-z0-9_]+\s*=\s*[^;]+;/g, '');

    // 2. Remove access modifiers (private, public, protected, readonly)
    output = output.replace(/\b(public|private|protected|readonly)\s+/g, '');

    // 3. Remove function/variable return and argument type annotations (e.g. `: number`, `: Request`, `: void`, `as AppConfig['nodeEnv']`)
    output = output.replace(/:\s*([A-Za-z0-9_<>[\]|&, ]+)(?=[=,);{])/g, '');
    output = output.replace(/\s+as\s+[A-Za-z0-9_<>[\]|&'.]+/g, '');

    // 4. Handle ESM vs CommonJS
    if (mode === 'cjs') {
      // Convert import express, { Request, Response } from 'express'; -> const express = require('express');
      output = output.replace(
        /import\s+([A-Za-z0-9_]+)(?:,\s*\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"];?/g,
        (_match, def, _named, pkg) => {
          return `"use strict";\nconst ${def} = require("${pkg}");`;
        }
      );
      output = output.replace(/import\s+['"]([^'"]+)['"];?/g, 'require("$1");');
      output = output.replace(/export\s+const\s+([A-Za-z0-9_]+)/g, 'exports.$1');
      output = output.replace(/export\s+function\s+([A-Za-z0-9_]+)/g, 'function $1;\nexports.$1 = $1;');
      output = output.replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, 'module.exports = $1;');
    } else {
      // Add ESM banner if not present
      if (!output.startsWith('//')) {
        output = `// Node.js ECMAScript Module (${target})\n` + output;
      }
    }

    // Clean multiple blank lines
    output = output.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    const duration = Math.max(1, Math.round(performance.now() - start));
    setCompileTimeMs(duration);
    setCompiledJs(output);
  };

  useEffect(() => {
    compileTypeScript(tsCode, targetModule, targetEcma, removeComments);
  }, [tsCode, targetModule, targetEcma, removeComments]);

  const handlePresetChange = (presetKey: 'express' | 'worker' | 'config') => {
    setSelectedPreset(presetKey);
    setTsCode(PRESETS[presetKey]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeOutputTab === 'js' ? compiledJs : compiledDts);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Card */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>LIVE TYPESCRIPT TO NODE.JS TRANSPILER</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Interactive Compiler Playground</h2>
            <p className="text-xs text-slate-400 mt-1">
              Inspect how TypeScript constructs, type annotations, and module imports translate directly into Node.js runtime code.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
            <button
              onClick={() => handlePresetChange('express')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedPreset === 'express'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Express API
            </button>
            <button
              onClick={() => handlePresetChange('worker')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedPreset === 'worker'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daemon Class
            </button>
            <button
              onClick={() => handlePresetChange('config')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedPreset === 'config'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Config Loader
            </button>
          </div>
        </div>

        {/* Compiler Flags Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Module Format</label>
            <select
              value={targetModule}
              onChange={(e) => setTargetModule(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="esm">NodeNext / ESM (import)</option>
              <option value="cjs">CommonJS (require/exports)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">ECMAScript Target</label>
            <select
              value={targetEcma}
              onChange={(e) => setTargetEcma(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ES2022">ES2022 (Modern Node 18+)</option>
              <option value="ES2020">ES2020 (Node 14+)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Strip Comments</label>
            <button
              onClick={() => setRemoveComments(!removeComments)}
              className={`w-full px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                removeComments
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              {removeComments ? 'Enabled' : 'Preserve Comments'}
            </button>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Build Telemetry</label>
            <div className="text-xs font-mono text-emerald-400 pt-1">
              ⚡ {compileTimeMs}ms · {compiledJs.length} bytes
            </div>
          </div>
        </div>
      </div>

      {/* Dual Code View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source TypeScript */}
        <div className="border border-slate-800 bg-[#090d16] rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-mono text-slate-300 font-semibold">Source: server/index.ts</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">TypeScript 7.x</span>
          </div>
          <textarea
            value={tsCode}
            onChange={(e) => setTsCode(e.target.value)}
            spellCheck={false}
            className="w-full h-[400px] p-4 bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed selection:bg-blue-500/30"
          />
        </div>

        {/* Compiled Node.js Output */}
        <div className="border border-slate-800 bg-[#090d16] rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveOutputTab('js')}
                className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${
                  activeOutputTab === 'js'
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                dist-server/index.js
              </button>
              <button
                onClick={() => setActiveOutputTab('dts')}
                className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${
                  activeOutputTab === 'dts'
                    ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                index.d.ts (Types)
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="w-full h-[400px] p-4 font-mono text-xs text-slate-300 overflow-x-auto overflow-y-auto leading-relaxed selection:bg-emerald-500/30">
            <code>{activeOutputTab === 'js' ? compiledJs : compiledDts}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
