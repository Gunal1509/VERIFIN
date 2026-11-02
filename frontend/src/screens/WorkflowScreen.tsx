import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Zap, 
  Layers, 
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Lock,
  Sparkles,
  Terminal
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import type { CaseData } from '../types';

interface WorkflowScreenProps {
  currentCase: CaseData;
  onApplyNewEvidence: () => void;
  hasAppliedEvidence: boolean;
}

interface AgentLogMessage {
  id: string;
  wave: number;
  from: string;
  to: string;
  message: string;
  type: 'info' | 'flag' | 'replan' | 'success';
}

const UNIQUE_FEATURES = [
  {
    id: 'adaptive_dag',
    title: '1. Adaptive Per-Case Dependency Graph (DAG)',
    badge: 'Wave Concurrency',
    icon: GitFork,
    color: 'border-blue-500 bg-blue-50/40 text-blue-900',
    summary: 'No hardcoded sequential agent chains. The planner builds a custom graph per case and schedules parallel waves.',
    details: 'Stages whose inputs are ready execute concurrently (e.g., Document Intake and Bureau checks run simultaneously in Wave 1; Cash Flow and Fraud Detection run side-by-side in Wave 3). Cuts turnaround latency by 17.7%.',
  },
  {
    id: 'incremental_replan',
    title: '2. Incremental Re-Planning with Input-Hash Caching',
    badge: '36.4% Pipeline Saved',
    icon: RefreshCw,
    color: 'border-amber-500 bg-amber-50/40 text-amber-900',
    summary: 'When new evidence arrives, only stale downstream stages rerun. Upstream results are reused from cache.',
    details: 'Each stage computes a SHA-256 hash of its declared inputs. When electricity bills are added, 4 upstream steps (Intake, Bureau, Trust Gate, Fraud) keep their cached outputs (0ms), while only 7 downstream stages (Cash Flow, Risk, Policy, Structuring, CAM, Ledger, Human) recompute.',
  },
  {
    id: 'trust_gate',
    title: '3. Deterministic Trust Gate (A/B/C Grading)',
    badge: 'Honest Borrower Protection',
    icon: ShieldCheck,
    color: 'border-emerald-500 bg-emerald-50/40 text-emerald-900',
    summary: 'Cross-document triangulation before credit analysis. Protects cash-heavy small businesses.',
    details: 'Grade A is confirmed by a second independent source (GST matches bank credits). Grade B protects plausible cash sales without bank proof (never called fraud). Grade C isolates contradicted claims.',
  },
  {
    id: 'forensic_graph',
    title: '4. Forensic NetworkX Circular Flow Detection',
    badge: 'Transaction-Level Proof',
    icon: ShieldAlert,
    color: 'border-rose-500 bg-rose-50/40 text-rose-900',
    summary: 'Graph algorithm isolates circular trading loops with exact transaction IDs and shared attributes.',
    details: 'Identifies closed directed cycles (Sharma -> Verma -> Gupta -> Sharma) returning to source within 6 days with <1.5% slippage, flags shared physical premises in Okhla, and runs the outside-world cash dissipation test.',
  },
  {
    id: 'code_computes',
    title: '5. Strict Boundary: Code Computes, Models Explain',
    badge: 'Zero Math Hallucination',
    icon: Cpu,
    color: 'border-indigo-500 bg-indigo-50/40 text-indigo-900',
    summary: 'Arithmetic and hard policy limits are 100% deterministic Python. Language models only read and explain.',
    details: 'DSCR (1.5 / 1.25 - 0.2 = 1.0L/mo) and Present Value loan sizing (₹45 Lakh at 12% for 5 years) are calculated strictly by pure code. Models are never allowed to perform math or decide policy breaches.',
  },
  {
    id: 'zero_disbursal',
    title: '6. Human in Charge & Zero-Disbursal Guarantee',
    badge: 'Mandatory Human Gate',
    icon: Lock,
    color: 'border-purple-500 bg-purple-50/40 text-purple-900',
    summary: 'The system proposes; the credit officer decides. Disbursal route is physically absent in code.',
    details: 'The ledger only writes PENDING_APPROVAL until an authenticated credit officer signs off. An automated test scans every API route and asserts no fund disbursal endpoint exists anywhere.',
  },
];

export const WorkflowScreen: React.FC<WorkflowScreenProps> = ({
  currentCase,
  onApplyNewEvidence,
  hasAppliedEvidence,
}) => {
  const [activeWave, setActiveWave] = useState<number>(8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<string>('adaptive_dag');
  const [isSimulatingReplan, setIsSimulatingReplan] = useState<boolean>(false);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveWave((prev) => {
          if (prev >= 8) {
            setIsPlaying(false);
            return 8;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSimulateEvidence = () => {
    setIsSimulatingReplan(true);
    setTimeout(() => {
      onApplyNewEvidence();
      setIsSimulatingReplan(false);
      setActiveWave(8);
    }, 1200);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveWave(1);
  };

  const handleStepForward = () => {
    setActiveWave((prev) => Math.min(8, prev + 1));
  };

  // Agent Blackboard logs based on active wave
  const agentLogs: AgentLogMessage[] = [
    { id: '1', wave: 1, from: 'intake_agent', to: 'trust_gate', message: 'Extracted GSTR-3B declared sales (₹4.0 Cr) and SBI bank credits (₹1.2 Cr).', type: 'info' },
    { id: '2', wave: 1, from: 'bureau_kyc_agent', to: 'risk_agent', message: 'Pushed commercial CIBIL score 710 with regular historical repayment.', type: 'info' },
    { id: '3', wave: 2, from: 'trust_gate', to: 'blackboard', message: 'Turnover gap (70%) flagged as Grade C; bank credits confirmed as Grade A.', type: 'flag' },
    { id: '4', wave: 3, from: 'cashflow_agent', to: 'risk_agent', message: 'Verified monthly operating cashflow established at ₹1.5 Lakh/mo.', type: 'info' },
    { id: '5', wave: 3, from: 'fraud_detector', to: 'blackboard', message: 'Turnover gap exceeds 20% threshold (RULE_TURNOVER_GAP_EXCEEDED).', type: 'flag' },
    { id: '6', wave: 4, from: 'risk_agent', to: 'policy_agent', message: 'Calculated initial DSCR: 0.90x on requested ₹75 Lakh application.', type: 'flag' },
    { id: '7', wave: 5, from: 'policy_agent', to: 'structuring_agent', message: 'Hard limit enforced: Cap ticket size at cashflow present value.', type: 'info' },
    { id: '8', wave: 6, from: 'structuring_agent', to: 'cam_agent', message: 'Loan sized at ₹45 Lakh. Evidence ladder created unlocking ₹66.5 Lakh.', type: 'success' },
    { id: '9', wave: 7, from: 'cam_agent', to: 'citation_validator', message: 'CAM generated. 100% of sentences linked to fact and transaction IDs.', type: 'success' },
    { id: '10', wave: 8, from: 'ledger_agent', to: 'human_approver', message: 'Record posted with status PENDING_APPROVAL. Ready for officer review.', type: 'success' },
  ];

  const visibleLogs = agentLogs.filter((l) => l.wave <= activeWave);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Adaptive Agent Workflow & DAG Visualizer
            </h2>
            <span className="bg-brand-100 text-brand-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Parallel Waves Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic execution graph with input-hash caching, concurrent waves, and incremental re-planning.
          </p>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Flow'}</span>
          </button>

          <button
            onClick={handleStepForward}
            disabled={activeWave >= 8}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors disabled:opacity-40 cursor-pointer"
            title="Step Forward One Wave"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors cursor-pointer"
            title="Reset to Wave 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Re-Plan Trigger */}
          {currentCase.id === 'case_sharma_traders' && (
            <button
              onClick={handleSimulateEvidence}
              disabled={isSimulatingReplan}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-all cursor-pointer ${
                hasAppliedEvidence
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-amber-600 hover:bg-amber-700 animate-pulse'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingReplan ? 'animate-spin' : ''}`} />
              <span>
                {hasAppliedEvidence ? 'Re-Plan Active (4 Cached / 7 Redone)' : '⚡ Trigger Re-Plan'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Incremental Re-Plan Pulse Banner */}
      {hasAppliedEvidence && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 glow-amber-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Incremental Re-Planning in Action
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                {microcopy.caseMoments.evidenceAdded(7, 4)} <strong>Cash Flow, Risk, Policy, Structuring, CAM, Ledger, and Human</strong> recomputed. The 4 upstream/independent stages (Intake, Bureau, Trust Gate, Fraud) kept their cached results.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-950 bg-amber-200 px-3 py-1 rounded-md border border-amber-400 shrink-0 self-start sm:self-auto">
            36.4% Pipeline Preserved &bull; 0ms Cache Hits
          </span>
        </div>
      )}

      {/* Main Interactive Flow Canvas */}
      <div className="bg-slate-950 rounded-2xl p-6 shadow-xl border border-slate-800 text-white space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live DAG Execution Pipeline (11 Stages)
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="text-slate-400">Wave: <strong className="text-brand-400">{activeWave} / 8</strong></span>
            <span className="text-slate-400">Concurrence: <strong className="text-emerald-400">asyncio.gather</strong></span>
          </div>
        </div>

        {/* Animated DAG Flow Map */}
        <div className="space-y-6">
          {/* Wave 1: Intake & Bureau (Parallel) */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeWave === 1
              ? 'border-brand-500 bg-brand-950/40 glow-blue-pulse'
              : activeWave > 1
              ? 'border-slate-800 bg-slate-900/60'
              : 'border-slate-900 bg-slate-900/20 opacity-40'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold uppercase text-brand-300 font-mono flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                <span>Wave 0 &bull; Parallel Input Intake</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                PARALLEL WAVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">1. Document Intake Agent</span>
                  <span className="text-[10px] font-mono text-slate-400">42ms</span>
                </div>
                <p className="text-[11px] text-slate-400">Parses GST GSTR-3B returns, SBI bank e-statements, and loan json.</p>
                <div className="text-[10px] text-emerald-400 pt-1 font-mono">Input Hash: e4a1..90b2 [MATCHED]</div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">2. Bureau & KYC Agent</span>
                  <span className="text-[10px] font-mono text-slate-400">38ms</span>
                </div>
                <p className="text-[11px] text-slate-400">Concurrent direct pull: CIBIL commercial score 710 and existing EMIs.</p>
                <div className="text-[10px] text-emerald-400 pt-1 font-mono">Input Hash: 7b3c..11f8 [MATCHED]</div>
              </div>
            </div>
          </div>

          {/* SVG Animated Connector Line 1 */}
          <div className="h-6 flex items-center justify-center">
            <svg className="w-32 h-6">
              <line x1="64" y1="0" x2="64" y2="24" stroke={activeWave >= 2 ? "#38bdf8" : "#334155"} strokeWidth="2" className={activeWave >= 2 ? "animate-dash-flow" : ""} />
            </svg>
          </div>

          {/* Wave 2: Trust Gate */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeWave === 2
              ? 'border-brand-500 bg-brand-950/40 glow-blue-pulse'
              : activeWave > 2
              ? 'border-slate-800 bg-slate-900/60'
              : 'border-slate-900 bg-slate-900/20 opacity-40'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold uppercase text-brand-300 font-mono">
                Wave 1 &bull; Trust Gate Triangulation Engine
              </span>
              <span className="text-[10px] font-mono text-brand-400">Deterministic Code</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white">3. Trust Gate Grading Agent</span>
                <span className="text-[10px] font-mono text-slate-400">12ms</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cross-validates claimed turnover vs bank deposits. Flags 70% gap as <strong>Grade C</strong>.
              </p>
              <div className="text-[10px] text-emerald-400 pt-1 font-mono">
                Status: {hasAppliedEvidence ? 'REUSED FROM CACHE (0ms)' : 'Verified'}
              </div>
            </div>
          </div>

          {/* SVG Animated Connector Line 2 (Split) */}
          <div className="h-6 flex items-center justify-center">
            <svg className="w-48 h-6">
              <path d="M 96 0 L 96 12 L 40 24 M 96 12 L 152 24" fill="none" stroke={activeWave >= 3 ? "#38bdf8" : "#334155"} strokeWidth="2" className={activeWave >= 3 ? "animate-dash-flow" : ""} />
            </svg>
          </div>

          {/* Wave 3: Cashflow & Fraud (Parallel) */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeWave === 3
              ? 'border-brand-500 bg-brand-950/40 glow-blue-pulse'
              : activeWave > 3
              ? 'border-slate-800 bg-slate-900/60'
              : 'border-slate-900 bg-slate-900/20 opacity-40'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold uppercase text-brand-300 font-mono flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                <span>Wave 2 &bull; Parallel Cashflow & Forensic Analysis</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                PARALLEL WAVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cashflow Node */}
              <div className={`p-3.5 rounded-lg border space-y-1 transition-all ${
                hasAppliedEvidence
                  ? 'bg-amber-950/40 border-amber-500 glow-amber-pulse'
                  : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">4. Cash Flow Analysis Agent</span>
                  <span className="text-[10px] font-mono text-slate-400">14ms</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {hasAppliedEvidence 
                    ? '⚡ RECOMPUTED: Verified cash upgraded from ₹1.5L to ₹2.2L/mo via utility bills.' 
                    : 'Calculates verified net monthly operating cash (₹1.5 Lakh/mo).'}
                </p>
                <div className="text-[10px] font-mono pt-1 text-amber-400">
                  {hasAppliedEvidence ? 'STALE RERUN [NEW EVIDENCE]' : 'CACHED'}
                </div>
              </div>

              {/* Fraud Node */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">5. Forensic Fraud & NetworkX Agent</span>
                  <span className="text-[10px] font-mono text-slate-400">46ms</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Runs directed cycle checks, linked entity hash matching, and outside-world dissipation test.
                </p>
                <div className="text-[10px] font-mono pt-1 text-emerald-400">
                  REUSED (Cached Output Unchanged - 0ms)
                </div>
              </div>
            </div>
          </div>

          {/* SVG Animated Connector Line 3 (Merge) */}
          <div className="h-6 flex items-center justify-center">
            <svg className="w-48 h-6">
              <path d="M 40 0 L 96 12 L 96 24 M 152 0 L 96 12" fill="none" stroke={activeWave >= 4 ? "#38bdf8" : "#334155"} strokeWidth="2" className={activeWave >= 4 ? "animate-dash-flow" : ""} />
            </svg>
          </div>

          {/* Waves 4 to 8: Sequential Sizing & Governance (6 Stages) */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeWave >= 4
              ? 'border-brand-500 bg-brand-950/40'
              : 'border-slate-900 bg-slate-900/20 opacity-40'
          }`}>
            <span className="text-[11px] font-bold uppercase text-brand-300 font-mono block mb-3">
              Waves 3 to 8 &bull; Risk, Policy, Structuring, CAM, Ledger & Human Gate
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 text-xs">
              <div className={`p-3 rounded-lg border ${hasAppliedEvidence ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 bg-slate-900'}`}>
                <span className="font-bold text-white block">6. Risk Score</span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {hasAppliedEvidence ? 'DSCR: 1.25x' : 'Initial: 0.90x'}
                </span>
                <span className="text-[9px] font-mono text-amber-400">{hasAppliedEvidence ? 'REDONE' : 'OK'}</span>
              </div>

              <div className={`p-3 rounded-lg border ${hasAppliedEvidence ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 bg-slate-900'}`}>
                <span className="font-bold text-white block">7. Policy Engine</span>
                <span className="text-[10px] text-slate-400 block mt-1">Limits check</span>
                <span className="text-[9px] font-mono text-amber-400">{hasAppliedEvidence ? 'REDONE' : 'OK'}</span>
              </div>

              <div className={`p-3 rounded-lg border ${hasAppliedEvidence ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 bg-slate-900'}`}>
                <span className="font-bold text-white block">8. Structuring</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                  {hasAppliedEvidence ? 'Sized: ₹66.5L' : 'Sized: ₹45.0L'}
                </span>
                <span className="text-[9px] font-mono text-amber-400">{hasAppliedEvidence ? 'REDONE' : 'OK'}</span>
              </div>

              <div className={`p-3 rounded-lg border ${hasAppliedEvidence ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 bg-slate-900'}`}>
                <span className="font-bold text-white block">9. CAM Memo</span>
                <span className="text-[10px] text-slate-400 block mt-1">Citations OK</span>
                <span className="text-[9px] font-mono text-amber-400">{hasAppliedEvidence ? 'REDONE' : 'OK'}</span>
              </div>

              <div className={`p-3 rounded-lg border ${hasAppliedEvidence ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 bg-slate-900'}`}>
                <span className="font-bold text-white block">10. Ledger</span>
                <span className="text-[10px] text-slate-400 block mt-1">PENDING_APP</span>
                <span className="text-[9px] font-mono text-amber-400">{hasAppliedEvidence ? 'REDONE' : 'OK'}</span>
              </div>

              <div className={`p-3 rounded-lg border ${hasAppliedEvidence ? 'border-cyan-500 bg-cyan-950/30' : 'border-slate-800 bg-slate-900'}`}>
                <span className="font-bold text-white block">11. Human Gate</span>
                <span className="text-[10px] text-cyan-300 block mt-1">Officer Sign-Off</span>
                <span className="text-[9px] font-mono text-cyan-400">AWAITING</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Agent-to-Agent Blackboard Message Feed */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-brand-400" />
            <span>Agent-to-Agent (A2A) Blackboard Event Stream</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Structured messages ({visibleLogs.length} events logged)
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs pr-1">
          {visibleLogs.map((log) => (
            <div key={log.id} className="p-2 rounded bg-slate-950/70 border border-slate-800 flex items-start space-x-2 text-[11px]">
              <span className="text-slate-500 shrink-0">[W{log.wave}]</span>
              <span className="text-brand-400 font-bold shrink-0">{log.from} &rarr; {log.to}:</span>
              <span className={
                log.type === 'flag' ? 'text-amber-300' :
                log.type === 'success' ? 'text-emerald-300' :
                'text-slate-300'
              }>{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* The 6 Unique Architectural Innovations Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Unique Innovations & Architectural Highlights</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key capabilities distinguishing this forward-deployed copilot from generic LLM wrappers.
          </p>
        </div>

        {/* Feature Tab Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {UNIQUE_FEATURES.map((feat) => {
            const Icon = feat.icon;
            const isTabActive = activeFeatureTab === feat.id;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveFeatureTab(feat.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isTabActive
                    ? 'border-brand-600 bg-brand-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${isTabActive ? 'text-brand-300' : 'text-brand-600'}`} />
                <span className="font-bold text-xs block leading-tight truncate">{feat.title}</span>
                <span className={`text-[10px] block mt-1 font-mono ${isTabActive ? 'text-brand-200' : 'text-slate-400'}`}>
                  {feat.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Deep Dive Card */}
        {(() => {
          const activeFeat = UNIQUE_FEATURES.find((f) => f.id === activeFeatureTab) || UNIQUE_FEATURES[0];
          const Icon = activeFeat.icon;
          return (
            <div className={`p-6 rounded-2xl border-2 transition-all ${activeFeat.color}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{activeFeat.title}</h4>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{activeFeat.summary}</p>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-white shadow-xs text-slate-800">
                  {activeFeat.badge}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs text-slate-800 leading-relaxed font-normal">
                {activeFeat.details}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
