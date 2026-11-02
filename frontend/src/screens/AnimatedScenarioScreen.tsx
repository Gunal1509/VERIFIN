import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  AlertTriangle, 
  Lock, 
  Sparkles
} from 'lucide-react';

interface SimulationStep {
  step: number;
  title: string;
  stageName: string;
  narration: string;
}

const SCENARIO_STEPS: SimulationStep[] = [
  {
    step: 1,
    title: 'Document Transfer & Untrusted Ingestion',
    stageName: 'stage_intake',
    narration: 'GSTR-3B filings, SBI bank e-statements, and KYC documents stream into the copilot. Input text is treated strictly as untrusted data, scanned for prompt injections, and parsed into structured fact tables.',
  },
  {
    step: 2,
    title: 'Trust Gate Cross-Triangulation & Turnover Gap',
    stageName: 'stage_trust_gate',
    narration: 'The Trust Gate reconciles declared GST sales against verified bank deposits. A 70% gap is detected (₹4.0 Cr claimed vs ₹1.2 Cr banked). The claimed turnover fact is graded C.',
  },
  {
    step: 3,
    title: 'Forensic NetworkX Cycle Detection',
    stageName: 'stage_fraud',
    narration: 'NetworkX graph analysis traces money movements between counterparties. A closed directed cycle is isolated: Sharma sends ₹25L to Verma, Verma sends ₹24.8L to Gupta, and Gupta returns ₹24.7L to Sharma in 6 days.',
  },
  {
    step: 4,
    title: 'Entity Links & Outside-World Test',
    stageName: 'stage_fraud_entity',
    narration: 'Hashed attribute matching reveals Sharma Global and Verma Logistics share the identical physical address in Okhla. The outside-world test confirms 87.4% of funds circulate strictly inside this triangle.',
  },
  {
    step: 5,
    title: 'Proof Pack Generation & Human Gate',
    stageName: 'stage_governance',
    narration: 'The copilot synthesizes a one-page Proof Pack with exact transaction IDs (TXN_RING_001..006). Plain Python sizes a safe loan on confirmed cash, and an authenticated officer makes the final call. Zero money is disbursed automatically.',
  },
];

export const AnimatedScenarioScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<'sharma' | 'ring'>('ring');

  // Auto-step timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 5) {
            setIsPlaying(false);
            return 5;
          }
          return prev + 1;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeStepInfo = SCENARIO_STEPS[currentStep - 1];

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Live Animated Simulation: Document Transfer & Fraud Detection
            </h2>
            <span className="bg-rose-100 text-rose-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Interactive Scenario Walkthrough
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Watch documents ingest, cross-reconcile, and expose circular trading loops step-by-step.
          </p>
        </div>

        {/* Playback Controls & Scenario Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => { setActiveScenario('ring'); setCurrentStep(1); }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeScenario === 'ring' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Circular Ring Loop
            </button>
            <button
              onClick={() => { setActiveScenario('sharma'); setCurrentStep(1); }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeScenario === 'sharma' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sharma 70% Gap
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Scenario'}</span>
          </button>

          <button
            onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
            disabled={currentStep >= 5}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 disabled:opacity-40"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => { setIsPlaying(false); setCurrentStep(1); }}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600"
            title="Reset Scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {SCENARIO_STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                currentStep === s.step
                  ? 'border-brand-600 bg-brand-50/70 ring-1 ring-brand-500'
                  : currentStep > s.step
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-slate-200 bg-slate-50/40 opacity-60'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-1">
                <span className={currentStep === s.step ? 'text-brand-700' : 'text-slate-400'}>
                  STEP 0{s.step}
                </span>
                {currentStep > s.step && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              </div>
              <span className="font-bold text-xs text-slate-900 block truncate">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Visual Canvas Area */}
      <div className="bg-slate-950 rounded-2xl p-6 shadow-xl border border-slate-800 text-white min-h-[480px] flex flex-col justify-between relative overflow-hidden">
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-ping"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-300">
              Active Stage: {activeStepInfo.stageName}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Phase {currentStep} of 5 &bull; {activeStepInfo.title}
          </span>
        </div>

        {/* DYNAMIC SCENE VISUALIZATIONS */}

        {/* SCENE 1: Document Transfer & Untrusted Ingestion */}
        {currentStep === 1 && (
          <div className="py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300 relative z-10">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono text-brand-400 uppercase tracking-widest">
                Stage 1 &bull; Document Ingestion Stream
              </span>
              <h3 className="text-lg font-bold text-white">
                Streaming Documents into Secure Sandbox
              </h3>
            </div>

            {/* Ingestion Stream Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-center">
              {/* Document 1 */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden group hover:border-brand-500 transition-colors">
                <div className="animate-scan-laser"></div>
                <div className="flex items-center space-x-2 text-brand-400">
                  <FileText className="w-5 h-5" />
                  <span className="font-bold text-xs">GSTR-3B_FY24.pdf</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Size: 1.2 MB &bull; SHA-256: 7f8c..91a0</p>
                <div className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                  Extracted: Declared Sales ₹4.0 Cr
                </div>
              </div>

              {/* Document 2 */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden group hover:border-brand-500 transition-colors">
                <div className="animate-scan-laser"></div>
                <div className="flex items-center space-x-2 text-brand-400">
                  <FileText className="w-5 h-5" />
                  <span className="font-bold text-xs">SBI_Current_FY24.pdf</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Size: 4.8 MB &bull; 340 Transactions</p>
                <div className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                  Extracted: Inflow ₹1.2 Cr
                </div>
              </div>

              {/* Document 3 */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden group hover:border-brand-500 transition-colors">
                <div className="animate-scan-laser"></div>
                <div className="flex items-center space-x-2 text-purple-400">
                  <FileText className="w-5 h-5" />
                  <span className="font-bold text-xs">MCA_Master_Data.pdf</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Corporate Registry & KYC</p>
                <div className="text-[10px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800 font-mono">
                  Parsed: Plot 42 Okhla Premise
                </div>
              </div>
            </div>

            {/* Ingestion Security Badge */}
            <div className="text-center">
              <span className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-full">
                <Lock className="w-3.5 h-3.5" />
                <span>Untrusted Data Boundary Active &bull; Prompt Injections Intercepted & Quarantined</span>
              </span>
            </div>
          </div>
        )}

        {/* SCENE 2: Trust Gate & Turnover Gap */}
        {currentStep === 2 && (
          <div className="py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300 relative z-10">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                Stage 2 &bull; Trust Gate Cross-Triangulation
              </span>
              <h3 className="text-lg font-bold text-white">
                Comparing Reported GST Sales vs Verified Bank Inflow
              </h3>
            </div>

            {/* Comparison Bars */}
            <div className="max-w-2xl mx-auto space-y-5 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
              {/* Bar 1: Declared GST */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Declared Annual GST Turnover (GSTR-3B)</span>
                  <span className="text-amber-400 font-bold">₹4,00,00,000 (₹4.0 Cr)</span>
                </div>
                <div className="w-full h-8 bg-slate-800 rounded-lg overflow-hidden flex items-center p-1">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-md w-full flex items-center justify-end pr-3 text-[11px] font-bold text-white font-mono shadow-sm">
                    Reported Sales
                  </div>
                </div>
              </div>

              {/* Bar 2: Verified Bank */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Verified Bank Deposits (SBI Primary CA)</span>
                  <span className="text-emerald-400 font-bold">₹1,20,00,000 (₹1.2 Cr)</span>
                </div>
                <div className="w-full h-8 bg-slate-800 rounded-lg overflow-hidden flex items-center p-1">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-md w-[30%] flex items-center justify-end pr-2 text-[10px] font-bold text-white font-mono shadow-sm">
                    30%
                  </div>
                </div>
              </div>

              {/* Gap Breakdown Box */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-400 block">
                    Unconfirmed Turnover Gap: 70.0%
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Exceeds maximum allowable risk threshold (20%).
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold font-mono">
                  GRADE C CONFLICT
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 3: Forensic NetworkX Circular Flow Simulation */}
        {currentStep === 3 && (
          <div className="py-6 space-y-4 animate-in fade-in zoom-in-95 duration-300 relative z-10">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono text-rose-400 uppercase tracking-widest">
                Stage 3 &bull; Forensic Graph Cycle Detection
              </span>
              <h3 className="text-lg font-bold text-white">
                Directed Circular Trading Loop Isolated
              </h3>
            </div>

            {/* Interactive Animated SVG Graph */}
            <div className="relative max-w-2xl mx-auto h-64 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-center p-4">
              <svg className="w-full h-full" viewBox="0 0 500 220">
                <defs>
                  <marker id="arrow-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#f43f5e" />
                  </marker>
                </defs>

                {/* Animated Loop Path 1: Sharma -> Verma */}
                <line x1="120" y1="80" x2="380" y2="50" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#arrow-red)" className="animate-dash-flow" />
                <text x="240" y="55" fill="#fda4af" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  Txn #001: ₹25.0 Lakh &rarr;
                </text>

                {/* Animated Loop Path 2: Verma -> Gupta */}
                <line x1="380" y1="50" x2="250" y2="180" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#arrow-red)" className="animate-dash-flow" />
                <text x="340" y="125" fill="#fda4af" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  Txn #002: ₹24.8 Lakh &rarr;
                </text>

                {/* Animated Loop Path 3: Gupta -> Sharma */}
                <line x1="250" y1="180" x2="120" y2="80" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#arrow-red)" className="animate-dash-flow" />
                <text x="160" y="145" fill="#fda4af" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  Txn #003: ₹24.7 Lakh &rarr;
                </text>
              </svg>

              {/* Node Badges */}
              <div className="absolute top-10 left-12 p-2.5 rounded-xl bg-slate-950 border border-rose-500 text-xs shadow-lg space-y-0.5">
                <span className="font-bold text-white block">Sharma Global</span>
                <span className="text-[10px] font-mono text-rose-400">Borrower Entity</span>
              </div>

              <div className="absolute top-6 right-12 p-2.5 rounded-xl bg-slate-950 border border-rose-500 text-xs shadow-lg space-y-0.5">
                <span className="font-bold text-white block">Verma Logistics</span>
                <span className="text-[10px] font-mono text-rose-400">Counterparty A</span>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2.5 rounded-xl bg-slate-950 border border-rose-500 text-xs shadow-lg space-y-0.5">
                <span className="font-bold text-white block">Gupta Trading</span>
                <span className="text-[10px] font-mono text-rose-400">Counterparty B</span>
              </div>
            </div>

            {/* Loop Summary Banner */}
            <div className="max-w-2xl mx-auto flex items-center justify-between p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs">
              <div className="flex items-center space-x-2 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Value returns to origin within <strong>6 days</strong> with &lt;1.5% slippage.</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-rose-200">
                RULE_CIRCULAR_FLOW_CYCLE_DETECTED
              </span>
            </div>
          </div>
        )}

        {/* SCENE 4: Entity Links & Outside-World Test */}
        {currentStep === 4 && (
          <div className="py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300 relative z-10">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">
                Stage 4 &bull; Entity Attribute Resolution
              </span>
              <h3 className="text-lg font-bold text-white">
                Shared Premise & Failed Outside-World Dissipation
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {/* Shared Attribute Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/80 space-y-3">
                <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>Shared Physical Office Premises</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
                  <span className="text-slate-400 block text-[10px]">REGISTERED MCA ADDRESS:</span>
                  <span className="text-white block font-bold">Plot 42, Okhla Industrial Area Phase-3, Delhi</span>
                  <span className="text-purple-400 text-[10px] block">
                    Shared between: Sharma Global &amp; Verma Logistics
                  </span>
                </div>
              </div>

              {/* Outside-World Test */}
              <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/80 space-y-3">
                <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Outside-World Cash Dissipation Test</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Loop Internal Turnover:</span>
                    <span className="text-rose-400 font-bold">87.4% (Circular)</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-400">External Real Vendors:</span>
                    <span className="text-slate-300">12.6% (Failed)</span>
                  </div>
                  <span className="block text-[10px] text-rose-400 font-mono bg-rose-950/80 p-1.5 rounded border border-rose-800">
                    BREACH: Turnover is predominantly synthetic circular trading.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 5: Proof Pack Generation & Human Gate */}
        {currentStep === 5 && (
          <div className="py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300 relative z-10">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                Stage 5 &bull; Human-in-Charge Proof Pack
              </span>
              <h3 className="text-lg font-bold text-white">
                Forensic Proof Delivered to Credit Officer
              </h3>
            </div>

            <div className="max-w-2xl mx-auto bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white">Proof Pack Summary &bull; Case Decision Gate</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                  PENDING_APPROVAL
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Verified Inflow</span>
                  <span className="text-sm font-bold text-white font-mono">₹1.2 Cr</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Calculated DSCR</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">0.90x</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Safe Sanction</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">₹45 Lakh</span>
                </div>
              </div>

              {/* Human In Charge Invariant */}
              <div className="p-3 bg-brand-950/60 border border-brand-800 rounded-xl text-xs space-y-1">
                <span className="font-bold text-brand-300 block">Officer Sign-Off Gate:</span>
                <p className="text-slate-300 text-[11px]">
                  System proposes terms and isolates transaction IDs; credit officer #CR-88412 holds final accountability. 
                  Zero automated fund disbursal is physically possible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Colleague Narration Banner */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start space-x-3 text-xs text-slate-200 relative z-10">
          <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-normal">
            {activeStepInfo.narration}
          </p>
        </div>
      </div>
    </div>
  );
};
