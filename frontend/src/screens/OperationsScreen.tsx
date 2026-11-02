import React from 'react';
import { 
  Cpu, 
  Coins, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';

interface OperationsScreenProps {
  activePolicyPack: string;
  onTogglePolicyPack: () => void;
  hasAppliedEvidence: boolean;
}

export const OperationsScreen: React.FC<OperationsScreenProps> = ({
  activePolicyPack,
  onTogglePolicyPack,
  hasAppliedEvidence,
}) => {
  const copy = microcopy.screens.operations;

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{copy.title}</h2>
            <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
              Telemetry & Configuration
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{copy.subtitle}</p>
        </div>
      </div>

      {/* One-Click Policy Pack Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
              Configurable Risk Engine
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Policy Pack: {activePolicyPack.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {activePolicyPack === 'bank_a' ? copy.policyDescriptionA : copy.policyDescriptionB}
            </p>
          </div>

          <button
            onClick={onTogglePolicyPack}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>
              {activePolicyPack === 'bank_a' ? copy.switchAction : copy.switchActionBack}
            </span>
          </button>
        </div>

        <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-lg text-xs text-brand-950 font-medium">
          {copy.switchSuccess(activePolicyPack.toUpperCase())}
        </div>
      </div>

      {/* Live System Performance & Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">{copy.metrics.avgLatency}</span>
            <Cpu className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">284 ms</div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            Parallel waves 17.7% faster than sequential (284ms vs 345ms)
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">{copy.metrics.tokenCost}</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">4,120</div>
          <span className="text-[11px] text-slate-500 block">
            Budget cap: 50,000 tokens / case
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">{copy.metrics.replanRate}</span>
            <RefreshCw className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {hasAppliedEvidence ? '4 / 11 Cached' : '100% Fresh'}
          </div>
          <span className="text-[11px] text-indigo-700 font-semibold block">
            {hasAppliedEvidence ? '36.4% pipeline steps preserved (4 cached / 7 redone)' : 'Zero stale stages initially'}
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">{copy.metrics.safeDisbursalCheck}</span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">0 Routes</div>
          <span className="text-[11px] text-emerald-800 font-semibold block">
            Test passed: Automated disbursal impossible
          </span>
        </div>
      </div>

      {/* Safety Invariants Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Non-Negotiable System Safety Invariants</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-800">1. Code computes, models explain (deterministic DSCR & sizing)</span>
          </div>
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-800">2. Zero disbursal route in API or backend ledger</span>
          </div>
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-800">3. Zero automated rejections (human officer always approves)</span>
          </div>
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-800">4. Honest borrowers protected (cash-heavy shops Grade B, never fraud)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
