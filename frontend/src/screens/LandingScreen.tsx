import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  GitFork, 
  Play, 
  Terminal, 
  Lock, 
  AlertTriangle, 
  RefreshCw, 
  Info,
  Sparkles
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import type { ConnectorRegistryItem } from '../types';

interface LandingScreenProps {
  onOpenCockpit: () => void;
  onOpenAgentTheatre: () => void;
  onOpenEntryScene?: () => void;
  onOpenIntegrations?: () => void;
}

const FALLBACK_CONNECTORS: ConnectorRegistryItem[] = [
  {
    name: 'GST & Udyam Service',
    endpoint: 'mcp://connectors.verifin.local/gst',
    transport: 'stdio / HTTP streamable',
    status: 'mock',
    tools: ['verify_gstin', 'fetch_gstr3b_filings', 'fetch_udyam_registration'],
    resources: ['gst://returns/fy24', 'udyam://msme-cert'],
    securityScope: 'READ_ONLY_SANITY_CHECK',
    description: 'Verifies tax identification, monthly GSTR-3B filings, and MSME category eligibility.',
  },
  {
    name: 'Credit Bureau Service',
    endpoint: 'mcp://connectors.verifin.local/bureau',
    transport: 'stdio / HTTP streamable',
    status: 'mock',
    tools: ['get_cibil_commercial_score', 'get_active_tradelines', 'check_dpd_history'],
    resources: ['bureau://cibil/report'],
    securityScope: 'READ_ONLY_TRADELINE',
    description: 'Retrieves commercial credit scores, active loans, and 12-month payment delinquency tracks.',
  },
  {
    name: 'KYC & MCA Registry Service',
    endpoint: 'mcp://connectors.verifin.local/kyc',
    transport: 'stdio / HTTP streamable',
    status: 'mock',
    tools: ['verify_pan', 'verify_aadhaar_offline_xml', 'lookup_mca_directors'],
    resources: ['kyc://identity/pan', 'mca://din/network'],
    securityScope: 'READ_ONLY_IDENTITY',
    description: 'Authenticates PAN, Aadhaar, and detects common directors across sister entities.',
  },
  {
    name: 'Core Banking Service',
    endpoint: 'mcp://connectors.verifin.local/cbs',
    transport: 'HTTP streamable / mutual TLS',
    status: 'mock',
    tools: ['get_account_balance', 'post_pending_ledger_entry', 'get_statement_eod'],
    resources: ['cbs://ledger/entries'],
    securityScope: 'POST_PENDING_ONLY (NO_DISBURSAL)',
    description: 'Fetches transaction history and posts proposed loan terms to ledger as PENDING_APPROVAL only.',
  },
  {
    name: 'Document Storage Service',
    endpoint: 'mcp://connectors.verifin.local/docstore',
    transport: 'stdio / S3 compatible',
    status: 'mock',
    tools: ['get_document_page', 'verify_checksum', 'list_case_evidence'],
    resources: ['docstore://cases/documents'],
    securityScope: 'READ_ONLY_ENCRYPTED',
    description: 'Serves tamper-evident document pages, bank e-statements, and corroborating utility bills.',
  },
];

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onOpenCockpit,
  onOpenAgentTheatre,
  onOpenEntryScene,
  onOpenIntegrations,
}) => {
  const [evidenceToggled, setEvidenceToggled] = useState<boolean>(false);
  const [connectors, setConnectors] = useState<ConnectorRegistryItem[]>(FALLBACK_CONNECTORS);
  const copy = microcopy.landing;
  const benchmarkCopy = microcopy.benchmarkMatrix;

  useEffect(() => {
    fetch('http://localhost:8000/api/connectors')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data && data.connectors && data.connectors.length > 0) {
          setConnectors(data.connectors);
        }
      })
      .catch(() => {
        // graceful offline fallback
      });
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="bg-fintech-dark text-white border-b border-slate-800 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                  <span>{copy.hero.badge}</span>
                </div>
                {onOpenEntryScene && (
                  <button
                    onClick={onOpenEntryScene}
                    className="inline-flex items-center space-x-1.5 bg-brand-950/70 hover:bg-brand-900 border border-brand-800/80 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono text-cyan-300 transition-colors cursor-pointer group"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 group-hover:rotate-12 transition-transform" />
                    <span>Watch Story Intro</span>
                  </button>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Verifin
              </h1>
              <p className="text-lg sm:text-2xl font-medium text-slate-300 leading-snug">
                {copy.hero.headline}
              </p>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                {copy.hero.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-4">
                <button
                  onClick={onOpenAgentTheatre}
                  className="inline-flex items-center justify-center space-x-2.5 bg-brand-600 hover:bg-brand-500 text-white px-5 sm:px-6 py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer w-full sm:w-auto"
                >
                  <Play className="w-4 h-4 fill-current shrink-0" />
                  <span>{copy.hero.watchProcessAction}</span>
                </button>

                <button
                  onClick={onOpenCockpit}
                  className="inline-flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 sm:px-6 py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer w-full sm:w-auto"
                >
                  <span>{copy.hero.openDemoAction}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                {onOpenEntryScene && (
                  <button
                    onClick={onOpenEntryScene}
                    className="inline-flex items-center justify-center space-x-2 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 hover:border-cyan-600 px-4 sm:px-5 py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Replay Intro Scene</span>
                  </button>
                )}
              </div>

              <div className="pt-4 sm:pt-6 border-t border-slate-800/80 flex items-center space-x-2 text-[11px] sm:text-xs text-slate-400 font-mono">
                <GitFork className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="line-clamp-2">{copy.hero.waveMetricText}</span>
              </div>
            </div>

            {/* Compact Wave Concurrency Visual */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-slate-300 font-semibold text-[11px] sm:text-xs">Orchestrator Waves</span>
                </div>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono">
                  BENCHMARK: 284ms
                </span>
              </div>

              {/* Wave Visual Rows */}
              <div className="space-y-2.5 font-mono text-xs">
                {/* Wave 0 */}
                <div className="space-y-1">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 flex justify-between">
                    <span>Wave 0 (Intake & Identity)</span>
                    <span className="text-cyan-400">Concurrent</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-slate-800/80 border border-slate-700 p-2 rounded text-slate-300 flex items-center space-x-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">Intake Agent</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 p-2 rounded text-slate-300 flex items-center space-x-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">Bureau & KYC</span>
                    </div>
                  </div>
                </div>

                {/* Wave 1 */}
                <div className="space-y-1">
                  <div className="text-[10px] sm:text-[11px] text-slate-400">Wave 1 (Triangulation)</div>
                  <div className="bg-slate-800/80 border border-amber-800/60 p-2 rounded text-amber-300 flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="truncate">Trust Gate (Grade A/B/C)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">Deterministic</span>
                  </div>
                </div>

                {/* Wave 2 */}
                <div className="space-y-1">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 flex justify-between">
                    <span>Wave 2 (Forensics & Cashflow)</span>
                    <span className="text-cyan-400">Concurrent</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-slate-800/80 border border-slate-700 p-2 rounded text-slate-300 flex items-center space-x-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">Cashflow (DSCR)</span>
                    </div>
                    <div className="bg-slate-800/80 border border-rose-900/60 p-2 rounded text-rose-300 flex items-center space-x-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                      <span className="truncate">Fraud Loops (NetworkX)</span>
                    </div>
                  </div>
                </div>

                {/* Wave 3-8 Sequential Pipeline */}
                <div className="space-y-1">
                  <div className="text-[10px] sm:text-[11px] text-slate-400">Waves 3–8 (Structuring, Limits, Memo, Ledger)</div>
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded text-slate-400 flex items-center justify-between text-[10px] sm:text-[11px]">
                    <span className="truncate">Risk → Policy → Structuring → CAM → Ledger</span>
                    <span className="text-emerald-400 font-semibold shrink-0 ml-1">PENDING_APP</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[10px] sm:text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Physical Safety Guard:</span>
                </div>
                <p>Fund release APIs are physically absent. Ledger state restricted to PENDING_APPROVAL.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM: SHARMA TRADERS */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded">
              {copy.problem.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {copy.problem.title}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {copy.problem.description}
            </p>
          </div>

          {/* Sharma Box Comparison */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 sm:pb-6 border-b border-slate-200 gap-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Exemplar Case Study</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">{copy.problem.caseHeadline}</h3>
                <p className="text-xs sm:text-sm text-slate-600">Wholesale Building Materials • New Delhi</p>
              </div>
              <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-800 text-xs font-medium self-start md:self-auto">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>₹2.80 Cr Turnover Gap Flagged</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 py-6 sm:py-8">
              {/* GST Column */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Self-Declared Tax</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    Grade C (Uncorroborated)
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">{copy.problem.gstReported}</div>
                <p className="text-xs text-slate-500">{copy.problem.gstLabel} (Sharma_GSTR3B_FY24.pdf)</p>
                <div className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                  Self-reported sales claim submitted to GSTN portal. Zero proof of genuine outward customer settlement.
                </div>
              </div>

              {/* Bank Column */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Verified Bank Credits</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Grade A (Verified Proof)
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">{copy.problem.bankVerified}</div>
                <p className="text-xs text-slate-500">{copy.problem.bankLabel} (Sharma_SBI_Current_FY24.pdf)</p>
                <div className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                  Direct 12-month inward current account deposits verified via e-statement data.
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="font-semibold text-slate-900">The Underwriting Verdict:</span>
                <p className="text-slate-600 text-xs">{copy.problem.gapDescription}</p>
              </div>
              <button
                onClick={onOpenCockpit}
                className="inline-flex items-center justify-center space-x-2 bg-brand-950 hover:bg-brand-900 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer w-full sm:w-auto"
              >
                <span>Inspect in Cockpit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CRITICAL GAPS */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 bg-brand-100 px-2.5 py-1 rounded">
              {copy.gaps.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {copy.gaps.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {copy.gaps.cards.map((gap) => (
              <div key={gap.num} className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-slate-300">{gap.num}</span>
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">GAP</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{gap.title}</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <p className="text-slate-500">
                    <strong className="text-rose-700">Today's Flaw:</strong> {gap.problem}
                  </p>
                  <p className="text-slate-700 bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-100">
                    <strong className="text-emerald-700">Verifin Solution:</strong> {gap.verifinApproach}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ADAPTIVE DAG & INCREMENTAL RE-PLAN */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
            <div className="max-w-3xl space-y-3 sm:space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded">
                {copy.adaptiveDag.tag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {copy.adaptiveDag.title}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {copy.adaptiveDag.subtitle}
              </p>
            </div>

            {/* Interactive Toggle Button */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
              <button
                onClick={() => setEvidenceToggled(!evidenceToggled)}
                className={`inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer w-full sm:w-auto ${
                  evidenceToggled 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : 'bg-white text-slate-800 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${evidenceToggled ? 'animate-spin' : ''}`} />
                <span>{evidenceToggled ? 'New Evidence Active (+Electricity)' : 'Simulate Adding Utility Bills'}</span>
              </button>
            </div>
          </div>

          {/* Re-Plan Metrics Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Workflow Nodes</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">11 Stages</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Directed Acyclic Graph</span>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border transition-all ${evidenceToggled ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xs text-amber-800 font-medium">Stages Redone (Stale)</span>
              <div className="text-xl sm:text-2xl font-bold text-amber-900 mt-1">
                {evidenceToggled ? '7 Stages' : '0 (Initial Run)'}
              </div>
              <span className="text-[11px] text-amber-700 mt-0.5 block">
                {evidenceToggled ? 'Cashflow → Risk → Structuring' : 'Full wave execution'}
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border transition-all ${evidenceToggled ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xs text-emerald-800 font-medium">Stages Reused from Cache</span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-900 mt-1">
                {evidenceToggled ? '4 Stages' : '11 Initialized'}
              </div>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">
                {evidenceToggled ? 'Intake, Bureau, Trust, Fraud (0ms)' : 'Input SHA-256 registered'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Sizing Impact</span>
              <div className="text-xl sm:text-2xl font-bold text-brand-900 mt-1">
                {evidenceToggled ? '₹45L → ₹66.5L' : '₹45.0 Lakh'}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {evidenceToggled ? '+₹21.5 Lakh unlocked capital' : 'Under Bank A policy constraints'}
              </span>
            </div>
          </div>

          {/* Graph Visualization Card */}
          <div className="bg-fintech-dark text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-800 space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-slate-200 font-semibold text-xs">Graph Execution State</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 font-mono text-[10px] sm:text-[11px]">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Reused (Cached)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Redone (Stale)</span>
                </span>
              </div>
            </div>

            {/* Stages Grid (Fully Responsive) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs">
              {/* Cached Stages */}
              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all ${evidenceToggled ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 0</div>
                <div className="font-bold mt-0.5 truncate">1. Intake</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-slate-400">{evidenceToggled ? 'REUSED (0ms)' : 'Done'}</div>
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all ${evidenceToggled ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 0</div>
                <div className="font-bold mt-0.5 truncate">2. Bureau KYC</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-slate-400">{evidenceToggled ? 'REUSED (0ms)' : 'Done'}</div>
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all ${evidenceToggled ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 1</div>
                <div className="font-bold mt-0.5 truncate">3. Trust Gate</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-slate-400">{evidenceToggled ? 'REUSED (0ms)' : 'Done'}</div>
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all ${evidenceToggled ? 'bg-amber-950/60 border-amber-500/80 text-amber-300 animate-pulse' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 2</div>
                <div className="font-bold mt-0.5 truncate">4. Cashflow</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-amber-400">{evidenceToggled ? 'CHANGED' : 'Done'}</div>
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all ${evidenceToggled ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 2</div>
                <div className="font-bold mt-0.5 truncate">5. Fraud Graph</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-slate-400">{evidenceToggled ? 'REUSED (0ms)' : 'Done'}</div>
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all ${evidenceToggled ? 'bg-amber-950/60 border-amber-500/80 text-amber-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 3</div>
                <div className="font-bold mt-0.5 truncate">6. Risk Score</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-slate-400">{evidenceToggled ? 'REDONE' : 'Done'}</div>
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all ${evidenceToggled ? 'bg-amber-950/60 border-amber-500/80 text-amber-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 4</div>
                <div className="font-bold mt-0.5 truncate">7. Policy Limit</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-slate-400">{evidenceToggled ? 'REDONE' : 'Done'}</div>
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all ${evidenceToggled ? 'bg-amber-950/60 border-amber-500/80 text-amber-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 5</div>
                <div className="font-bold mt-0.5 truncate">8. Structuring</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-amber-400">{evidenceToggled ? '₹66.5L' : 'Done'}</div>
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all ${evidenceToggled ? 'bg-amber-950/60 border-amber-500/80 text-amber-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 6</div>
                <div className="font-bold mt-0.5 truncate">9. CAM Memo</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-slate-400">{evidenceToggled ? 'SYNCED' : 'Done'}</div>
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all ${evidenceToggled ? 'bg-amber-950/60 border-amber-500/80 text-amber-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 7</div>
                <div className="font-bold mt-0.5 truncate">10. Ledger</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-slate-400">{evidenceToggled ? 'PENDING' : 'Done'}</div>
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg border transition-all col-span-2 ${evidenceToggled ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Wave 8</div>
                <div className="font-bold mt-0.5 truncate">11. Officer Sign-Off</div>
                <div className="text-[9px] sm:text-[10px] mt-1.5 text-cyan-400">AWAITING DECISION</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {copy.adaptiveDag.explanation}
            </p>
          </div>
        </div>
      </section>

      {/* 5. CONTROLS AND TRUST */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 bg-brand-100 px-2.5 py-1 rounded">
              {copy.controlsTrust.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {copy.controlsTrust.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {copy.controlsTrust.cards.map((card, idx) => (
              <div key={idx} className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{card.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FORWARD-DEPLOYED MCP CONNECTOR REGISTRY (Phone & Desktop Optimized) */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-3xl space-y-3 sm:space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded">
                {copy.mcpConnectors.tag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {copy.mcpConnectors.title}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {copy.mcpConnectors.subtitle}
              </p>
            </div>

            {onOpenIntegrations && (
              <button
                type="button"
                onClick={onOpenIntegrations}
                className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer self-start md:self-auto"
              >
                <span>+ Integrate Bank / Partner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Desktop/Tablet Table View */}
          <div className="hidden md:block bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-mono font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">{copy.mcpConnectors.tableHeaders.name}</th>
                    <th className="px-5 py-3.5">{copy.mcpConnectors.tableHeaders.protocol}</th>
                    <th className="px-5 py-3.5">{copy.mcpConnectors.tableHeaders.tools}</th>
                    <th className="px-5 py-3.5">{copy.mcpConnectors.tableHeaders.security}</th>
                    <th className="px-5 py-3.5">{copy.mcpConnectors.tableHeaders.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {connectors.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        <div>{c.name}</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">{c.description}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600">
                        {c.transport}
                      </td>
                      <td className="px-5 py-4 font-mono text-brand-700">
                        <div className="flex flex-wrap gap-1">
                          {c.tools.map((t, tid) => (
                            <span key={tid} className="bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {c.securityScope}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{c.status.toUpperCase()} ADAPTER</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Phone Card View */}
          <div className="block md:hidden space-y-3">
            {connectors.map((c, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span>{c.status.toUpperCase()}</span>
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">PROTOCOL:</span>
                    <span className="font-mono text-slate-700">{c.transport}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">SECURITY:</span>
                    <span className="font-mono text-slate-700 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.securityScope}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">TOOLS OFFERED:</span>
                  <div className="flex flex-wrap gap-1">
                    {c.tools.map((t, tid) => (
                      <span key={tid} className="bg-brand-50 text-brand-800 px-2 py-0.5 rounded text-[10px] font-mono border border-brand-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6.5 BENCHMARK MATRIX — Verifin vs Generic AI */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-3xl space-y-2 sm:space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded">
              {benchmarkCopy.tag}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{benchmarkCopy.title}</h2>
            <p className="text-sm text-slate-600">{benchmarkCopy.subtitle}</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 w-1/4">Capability</th>
                  <th className="px-5 py-3.5 text-left font-bold text-rose-600 w-[37.5%]">
                    ✗ Generic AI Copilot / LLM Wrapper
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-emerald-700 w-[37.5%]">
                    ✓ Verifin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {benchmarkCopy.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800">{row.category}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-start space-x-2">
                        <span className="text-rose-500 font-bold mt-0.5 shrink-0">✗</span>
                        <span className="text-slate-600 leading-relaxed">{row.llm}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start space-x-2">
                        <span className="text-emerald-600 font-bold mt-0.5 shrink-0">✓</span>
                        <span className="text-slate-700 font-medium leading-relaxed">{row.verifin}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {benchmarkCopy.rows.map((row, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">{row.category}</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2 bg-rose-50 rounded-lg p-2.5 border border-rose-100">
                    <span className="text-rose-500 font-bold shrink-0">✗</span>
                    <span className="text-slate-600">{row.llm}</span>
                  </div>
                  <div className="flex items-start space-x-2 bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span className="text-slate-700 font-medium">{row.verifin}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ROLLOUT & HONEST LIMITATIONS */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          {/* Rollout */}
          <div className="space-y-6 sm:space-y-8">
            <div className="max-w-3xl space-y-2 sm:space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 bg-brand-100 px-2.5 py-1 rounded">
                {copy.rollout.tag}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{copy.rollout.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {copy.rollout.phases.map((p, i) => (
                <div key={i} className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">{p.phase}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Honest Limitations */}
          <div className="bg-white p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-200 space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                {copy.honestLimits.tag}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">{copy.honestLimits.title}</h3>
              <p className="text-xs text-slate-600">{copy.honestLimits.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs text-slate-700">
              {copy.honestLimits.items.map((item, i) => (
                <div key={i} className="flex items-start space-x-2.5 bg-slate-50 p-3 sm:p-3.5 rounded-lg border border-slate-100">
                  <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-fintech-dark text-slate-400 text-xs py-8 sm:py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="text-white font-bold text-base">Verifin</div>
              <p className="text-slate-400 text-xs">{copy.hero.headline}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300">
              <button onClick={onOpenCockpit} className="hover:text-white transition-colors cursor-pointer">Officer Cockpit</button>
              <button onClick={onOpenAgentTheatre} className="hover:text-white transition-colors cursor-pointer">Agent Theatre</button>
              <a href="#audit" className="hover:text-white transition-colors">Audit (docs/AUDIT.md)</a>
            </div>
          </div>

          <p className="text-slate-500 leading-relaxed text-[11px]">
            {copy.footer.syntheticNotice}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>{copy.footer.copyright}</span>
            <span className="font-mono text-emerald-400">Zero Disbursal Route Verification: PASSED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
