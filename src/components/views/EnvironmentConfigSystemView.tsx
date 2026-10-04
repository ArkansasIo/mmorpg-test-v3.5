import React, { useState, useEffect } from 'react';
import {
  Server,
  Key,
  Database,
  Globe,
  Shield,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Terminal,
  FileCode,
  Play,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  MonitorCheck,
  HardDriveDownload,
  Flame,
} from 'lucide-react';
import { sound } from '../../sound';

interface EnvVarItem {
  key: string;
  label: string;
  category: 'Server' | 'Security' | 'Database' | 'Network' | 'Frontend' | 'Admin' | 'Development';
  defaultValue: string;
  description: string;
  isSecret?: boolean;
}

const DEFAULT_ENV_VARS: EnvVarItem[] = [
  {
    key: 'PORT',
    label: 'Backend Server Port',
    category: 'Server',
    defaultValue: '5001',
    description: 'HTTP port for the Express game backend API service.',
  },
  {
    key: 'NODE_ENV',
    label: 'Node Environment Mode',
    category: 'Server',
    defaultValue: 'development',
    description: "Runtime environment: 'development', 'production', or 'test'.",
  },
  {
    key: 'SESSION_SECRET',
    label: 'Session Cookie Encryption Key',
    category: 'Security',
    defaultValue: '',
    description: 'Cryptographic secret used to sign player authentication cookies.',
    isSecret: true,
  },
  {
    key: 'DATABASE_URL',
    label: 'PostgreSQL Database Connection URI',
    category: 'Database',
    defaultValue: '',
    description: 'Primary PostgreSQL database connection string.',
    isSecret: true,
  },
  {
    key: 'CORS_ORIGINS',
    label: 'CORS Allowed Web Origins',
    category: 'Network',
    defaultValue: 'http://localhost:3000,http://127.0.0.1:3000',
    description: 'Comma-separated browser origins authorized for session credentials.',
  },
  {
    key: 'APP_URL',
    label: 'Public Client URL',
    category: 'Network',
    defaultValue: 'http://localhost:3000',
    description: 'Canonical web frontend URL for invitations and links.',
  },
  {
    key: 'DB_POOL_MAX',
    label: 'DB Connection Pool Max',
    category: 'Database',
    defaultValue: '10',
    description: 'Maximum pool connection count for database queries.',
  },
  {
    key: 'DB_IDLE_TIMEOUT_MS',
    label: 'Database Idle Timeout (ms)',
    category: 'Database',
    defaultValue: '30000',
    description: 'Milliseconds before an idle PostgreSQL connection is retired.',
  },
  {
    key: 'VITE_PORT',
    label: 'Frontend Web Port',
    category: 'Frontend',
    defaultValue: '3000',
    description: 'Vite development server listening port.',
  },
  {
    key: 'VITE_FIREBASE_API_KEY',
    label: 'Firebase Web API Key',
    category: 'Frontend',
    defaultValue: 'demo-api-key',
    description: 'Client Firebase key for cloud identity and profiles.',
    isSecret: true,
  },
  {
    key: 'VITE_FIREBASE_AUTH_DOMAIN',
    label: 'Firebase Auth Domain',
    category: 'Frontend',
    defaultValue: 'localhost',
    description: 'Firebase authentication domain for login handshakes.',
  },
  {
    key: 'VITE_FIREBASE_PROJECT_ID',
    label: 'Firebase Project ID',
    category: 'Frontend',
    defaultValue: 'local-demo',
    description: 'Firebase cloud project identifier.',
  },
  {
    key: 'ADMIN_BOOTSTRAP_USERNAME',
    label: 'Initial Root Admin Username',
    category: 'Admin',
    defaultValue: '',
    description: 'Administrative root user for system command decks.',
  },
  {
    key: 'ADMIN_BOOTSTRAP_EMAIL',
    label: 'Root Admin Email Address',
    category: 'Admin',
    defaultValue: '',
    description: 'Super-user email for recovery and system notifications.',
  },
  {
    key: 'ADMIN_BOOTSTRAP_PASSWORD',
    label: 'Root Admin Master Password',
    category: 'Admin',
    defaultValue: '',
    description: 'Secure password for administrator console access.',
    isSecret: true,
  },
  {
    key: 'ADMIN_SECURITY_CODE',
    label: 'Root Admin Security PIN',
    category: 'Admin',
    defaultValue: '',
    description: 'Four-digit PIN required for dangerous server actions.',
    isSecret: true,
  },
  {
    key: 'DEV_AUTH_BYPASS',
    label: 'Developer Auth Bypass',
    category: 'Development',
    defaultValue: 'false',
    description: 'Allows instantaneous local developer login without remote OAuth.',
  },
];

const PRESETS = [
  {
    id: 'local_dev',
    name: 'Local Developer Stack',
    tag: 'Port 3000 + 5001',
    description: 'Standard local development with automatic mock database fallback.',
    values: {
      PORT: '5001',
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/universe_civilization',
      CORS_ORIGINS: 'http://localhost:3000,http://127.0.0.1:3000',
      APP_URL: 'http://localhost:3000',
      VITE_PORT: '3000',
      DEV_AUTH_BYPASS: 'false',
      ADMIN_SECURITY_CODE: '',
    },
  },
  {
    id: 'production_full',
    name: 'Unified Production Service',
    tag: 'Single Port 3000',
    description: 'Backend serves both API routes and built client static files on one port.',
    values: {
      PORT: '3000',
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://postgres:PROD_PASSWORD@localhost:5432/universe_civilization',
      CORS_ORIGINS: 'http://localhost:3000',
      APP_URL: 'http://localhost:3000',
      VITE_PORT: '3000',
      DEV_AUTH_BYPASS: 'false',
      ADMIN_SECURITY_CODE: '8921',
    },
  },
  {
    id: 'cloud_sql',
    name: 'Cloud SQL / Remote Postgres',
    tag: 'SSL Required',
    description: 'Configured for remote managed PostgreSQL database instance with TLS.',
    values: {
      PORT: '5001',
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://game_admin:SECRET@db.gcp.internal:5432/universe_db?sslmode=require',
      CORS_ORIGINS: 'https://universe.empire',
      APP_URL: 'https://universe.empire',
      VITE_PORT: '3000',
      DEV_AUTH_BYPASS: 'false',
      ADMIN_SECURITY_CODE: '4738',
    },
  },
];

export const EnvironmentConfigSystemView: React.FC = () => {
  const [envValues, setEnvValues] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('uc_custom_env_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const initial: Record<string, string> = {};
    DEFAULT_ENV_VARS.forEach((item) => {
      initial[item.key] = item.defaultValue;
    });
    return initial;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('local_dev');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [healthStatus, setHealthStatus] = useState<{
    checking: boolean;
    status: 'online' | 'offline' | 'untested';
    latencyMs?: number;
    details?: string;
  }>({
    checking: false,
    status: 'untested',
  });

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('uc_custom_env_config', JSON.stringify(envValues));
    } catch {
      // ignore
    }
  }, [envValues]);

  const handleChange = (key: string, value: string) => {
    setEnvValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateSecret = (key: string) => {
    sound.play('click');
    const randomSecret = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    handleChange(key, randomSecret);
  };

  const handleApplyPreset = (presetId: string) => {
    sound.play('confirm');
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePreset(presetId);
    setEnvValues((prev) => ({ ...prev, ...preset.values }));
  };

  const generateEnvText = (): string => {
    let output = '# ====================================================\n';
    output += '# UNIVERSE CIVILIZATION: EMPIRE AT WAR & BSAT\n';
    output += `# ENVIRONMENT CONFIGURATION FILE (.env)\n`;
    output += `# Generated: ${new Date().toISOString()}\n`;
    output += '# ====================================================\n\n';

    const categories = Array.from(new Set(DEFAULT_ENV_VARS.map((v) => v.category)));
    categories.forEach((cat) => {
      output += `### ${cat.toUpperCase()} CONFIGURATION\n`;
      const items = DEFAULT_ENV_VARS.filter((v) => v.category === cat);
      items.forEach((item) => {
        const val = envValues[item.key] ?? item.defaultValue;
        output += `# ${item.description}\n`;
        output += `${item.key}=${val}\n\n`;
      });
    });

    return output;
  };

  const handleDownloadEnv = () => {
    sound.play('confirm');
    const blob = new Blob([generateEnvText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.env';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyEnv = () => {
    sound.play('click');
    navigator.clipboard.writeText(generateEnvText());
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const checkBackendHealth = async () => {
    sound.play('click');
    setHealthStatus({ checking: true, status: 'untested' });
    const startTime = performance.now();
    try {
      const res = await fetch('/api/status/health', { method: 'GET' });
      const latency = Math.round(performance.now() - startTime);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setHealthStatus({
          checking: false,
          status: 'online',
          latencyMs: latency,
          details: `API operational (${latency}ms) · Mode: ${data.nodeEnv || 'active'}`,
        });
      } else {
        setHealthStatus({
          checking: false,
          status: 'offline',
          latencyMs: latency,
          details: `Backend returned HTTP ${res.status}`,
        });
      }
    } catch (e) {
      const latency = Math.round(performance.now() - startTime);
      setHealthStatus({
        checking: false,
        status: 'offline',
        latencyMs: latency,
        details: 'Standalone UI Mode / Mock Storage Active',
      });
    }
  };

  const filteredVars = DEFAULT_ENV_VARS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ['All', 'Server', 'Security', 'Database', 'Network', 'Frontend', 'Admin', 'Development'];

  const exeArtifacts = [
    {
      name: 'install-setup.exe',
      batName: 'install-setup.bat',
      title: 'Full Automated Installer & Setup',
      desc: 'Native Win64 launcher that audits Node/NPM, sets up .env, builds server & launches games',
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/20',
    },
    {
      name: 'env-config.exe',
      batName: 'env-config.bat',
      title: 'Environment Variable Configurator',
      desc: 'CLI and console tool to configure, validate, and inject backend/frontend environment presets',
      color: 'border-cyan-500 text-cyan-400 bg-cyan-950/20',
    },
    {
      name: 'launch-fullstack.exe',
      batName: 'start-fullstack.bat',
      title: 'Full-Stack Dual-Engine Launcher',
      desc: 'Spawns both Express backend server (5001) and Vite web frontend (3000) simultaneously',
      color: 'border-amber-500 text-amber-400 bg-amber-950/20',
    },
    {
      name: 'universe-server.exe',
      batName: 'start-server.bat',
      title: 'Game Backend API Server',
      desc: 'Starts authoritative Express game backend with PostgreSQL pool / in-memory fallback',
      color: 'border-purple-500 text-purple-400 bg-purple-950/20',
    },
    {
      name: 'universe-client.exe',
      batName: 'npm run dev',
      title: 'Vite Frontend Web Client',
      desc: 'Direct launcher for React 19 UI with HMR, three.js canvas, and command deck',
      color: 'border-blue-500 text-blue-400 bg-blue-950/20',
    },
  ];

  return (
    <div id="environment-config-view" className="space-y-6">
      {/* Top Banner */}
      <div className="border border-slate-700 bg-slate-900/90 text-white p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Cpu size={14} />
              <span>Full-Stack Architecture & Environment Suite</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              Environment Variable & Server Setup System
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Configure, validate, and export environment variables for the Game Backend Server,
              Frontend Client, PostgreSQL Database, and Security PIN systems. Run locally via native
              Win64 executables, batch scripts, or shell daemons.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={checkBackendHealth}
              disabled={healthStatus.checking}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} className={healthStatus.checking ? 'animate-spin' : ''} />
              <span>Test API Status</span>
            </button>
            <button
              onClick={handleCopyEnv}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'all' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedKey === 'all' ? 'Copied!' : 'Copy .env'}</span>
            </button>
            <button
              onClick={handleDownloadEnv}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded text-xs font-black flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Download size={14} />
              <span>Download .env</span>
            </button>
          </div>
        </div>

        {/* Live Backend Connection Indicator */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Backend API (Port {envValues.PORT || '5001'}):</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                healthStatus.status === 'online'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : healthStatus.status === 'offline'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  healthStatus.status === 'online'
                    ? 'bg-emerald-400 animate-pulse'
                    : healthStatus.status === 'offline'
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
              {healthStatus.status === 'online'
                ? 'CONNECTED'
                : healthStatus.status === 'offline'
                ? 'OFFLINE / STANDALONE UI'
                : 'READY TO TEST'}
            </span>
          </div>

          {healthStatus.details && (
            <span className="text-slate-400 text-[11px]">[{healthStatus.details}]</span>
          )}

          <div className="ml-auto text-[11px] text-slate-400 flex items-center gap-2">
            <span>Frontend Client:</span>
            <span className="text-emerald-400 font-bold">PORT {envValues.VITE_PORT || '3000'} (Vite Active)</span>
          </div>
        </div>
      </div>

      {/* Standalone Windows Executable (.exe) Launchers Section */}
      <div className="border border-slate-800 bg-slate-950 p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
              <HardDriveDownload size={14} />
              <span>Native Standalone Windows 64-Bit Binaries (.exe)</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Automated Setup, Config & Game Server EXEs
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 border border-slate-800 rounded">
            Native PE32+ AMD64 Binaries
          </span>
        </div>

        <p className="text-xs text-slate-400">
          These lightweight native 64-bit Windows executables run without requiring compilation or
          external packaging. Click any executable to download directly to your computer or inspect the
          underlying script.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {exeArtifacts.map((exe) => (
            <div
              key={exe.name}
              className={`p-3.5 border rounded-lg flex flex-col justify-between transition-all ${exe.color}`}
            >
              <div>
                <div className="flex items-center justify-between font-mono font-bold text-xs mb-1">
                  <span>{exe.name}</span>
                  <span className="text-[10px] opacity-75 font-normal">2,048 Bytes</span>
                </div>
                <div className="font-semibold text-white text-xs mb-1">{exe.title}</div>
                <p className="text-[11px] text-slate-300 opacity-90 leading-tight mb-3">
                  {exe.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-400 truncate">
                  → {exe.batName}
                </span>
                <a
                  href={`/${exe.name}`}
                  download={exe.name}
                  onClick={() => sound.play('click')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Download size={11} />
                  <span>Get .exe</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Profiles */}
      <div className="border border-slate-800 bg-slate-950 p-5 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-400">
            <Sliders size={13} />
            <span>Environment Presets</span>
          </div>
          <span className="text-[11px] text-slate-500">Quick-load pre-tested stack configurations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className={`p-3.5 border rounded-lg cursor-pointer transition-all ${
                activePreset === preset.id
                  ? 'border-cyan-500 bg-cyan-950/30 text-white'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <strong className="text-xs font-bold">{preset.name}</strong>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {preset.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">{preset.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Variable Editor Table */}
      <div className="border border-slate-800 bg-slate-950 rounded-lg overflow-hidden shadow-sm">
        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.play('click');
                  setSelectedCategory(cat);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Variables List */}
        <div className="divide-y divide-slate-800">
          {filteredVars.map((item) => {
            const isRevealed = revealedSecrets[item.key];
            const isSecret = Boolean(item.isSecret);
            const value = envValues[item.key] ?? item.defaultValue;

            return (
              <div
                key={item.key}
                className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="md:w-1/2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{item.key}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.category}
                    </span>
                    {isSecret && (
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5">
                        <Key size={10} />
                        <span>Protected</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                  <p className="text-[11px] text-slate-400 leading-tight">{item.description}</p>
                </div>

                <div className="md:w-1/2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isSecret && !isRevealed ? 'password' : 'text'}
                      value={value}
                      onChange={(e) => handleChange(item.key, e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {isSecret && (
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedSecrets((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                      }
                      title={isRevealed ? 'Mask secret' : 'Reveal secret'}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded border border-slate-700 text-xs font-mono"
                    >
                      {isRevealed ? 'Hide' : 'Show'}
                    </button>
                  )}

                  {item.category === 'Security' && (
                    <button
                      type="button"
                      onClick={() => handleGenerateSecret(item.key)}
                      title="Generate random secure key"
                      className="px-2 py-1 text-[11px] font-mono text-cyan-300 hover:text-white bg-cyan-950/60 border border-cyan-800 rounded flex items-center gap-1"
                    >
                      <Sparkles size={11} />
                      <span>Gen</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(value);
                      setCopiedKey(item.key);
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    title="Copy value"
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded border border-slate-700"
                  >
                    {copiedKey === item.key ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal & Quick Run Instructions */}
      <div className="border border-slate-800 bg-slate-950 p-5 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-400">
          <Terminal size={14} className="text-cyan-400" />
          <span>Quick Terminal & CLI Execution Recipes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1.5">
            <span className="text-[10px] text-cyan-400 uppercase font-bold">1. Windows One-Click Install & Setup</span>
            <pre className="p-2 bg-slate-950 rounded text-emerald-300 overflow-x-auto">
              install-setup.exe
              <br />
              <span className="text-slate-500">:: or run batch equivalent:</span>
              <br />
              install-setup.bat
            </pre>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1.5">
            <span className="text-[10px] text-amber-400 uppercase font-bold">2. Interactive Environment Config CLI</span>
            <pre className="p-2 bg-slate-950 rounded text-emerald-300 overflow-x-auto">
              env-config.exe
              <br />
              <span className="text-slate-500">:: or run node script:</span>
              <br />
              npm run config:env
            </pre>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1.5">
            <span className="text-[10px] text-purple-400 uppercase font-bold">3. Full-Stack Game Server & Client</span>
            <pre className="p-2 bg-slate-950 rounded text-emerald-300 overflow-x-auto">
              launch-fullstack.exe
              <br />
              <span className="text-slate-500">:: or run dual-runner:</span>
              <br />
              start-fullstack.bat
            </pre>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1.5">
            <span className="text-[10px] text-blue-400 uppercase font-bold">4. Linux / macOS Daemon Startup</span>
            <pre className="p-2 bg-slate-950 rounded text-emerald-300 overflow-x-auto">
              bash install-setup.sh
              <br />
              <span className="text-slate-500"># or fullstack runner:</span>
              <br />
              bash start-fullstack.sh
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
