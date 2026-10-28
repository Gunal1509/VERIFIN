import React from 'react';
import { 
  Building2, 
  GitFork, 
  ShieldCheck, 
  Network, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Sliders, 
  UserCheck,
  ChevronDown,
  Video
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import type { CaseData } from '../types';

interface NavbarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  cases: CaseData[];
  selectedCaseId: string;
  setSelectedCaseId: (id: string) => void;
  activePolicyPack: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  setActiveScreen,
  cases,
  selectedCaseId,
  setSelectedCaseId,
  activePolicyPack,
}) => {
  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const navItems = [
    { id: 'queue', label: microcopy.navigation.queue, icon: Building2 },
    { id: 'workflow', label: microcopy.navigation.workflow, icon: GitFork },
    { id: 'trustGate', label: microcopy.navigation.trustGate, icon: ShieldCheck },
    { id: 'fraudGraph', label: microcopy.navigation.fraudGraph, icon: Network },
    { id: 'evidenceLadder', label: microcopy.navigation.evidenceLadder, icon: TrendingUp },
    { id: 'camProofPack', label: microcopy.navigation.camProofPack, icon: FileText },
    { id: 'decision', label: microcopy.navigation.decision, icon: CheckCircle2 },
    { id: 'operations', label: microcopy.navigation.operations, icon: Sliders },
    { id: 'demoVideo', label: microcopy.navigation.demoVideo, icon: Video },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner */}
      <div className="bg-brand-950 text-slate-200 px-4 py-1.5 text-xs flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-white">{microcopy.app.officerRoleBadge}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300 hidden md:inline">{microcopy.app.humanInChargeBanner}</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-300">
          <span className="bg-brand-900/80 px-2 py-0.5 rounded text-[11px] font-mono border border-brand-800">
            Policy: {activePolicyPack.toUpperCase()}
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-emerald-400">
            DISBURSAL: LOCKED
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-950 to-brand-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            M
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {microcopy.app.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {microcopy.app.tagline} &bull; Virtusa Jatayu S6
            </p>
          </div>
        </div>

        {/* Case Switcher */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
          <span className="text-xs font-semibold text-slate-500 px-2">Active Case:</span>
          <div className="relative">
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              aria-label="Active MSME loan case"
              className="appearance-none bg-white text-xs font-semibold text-slate-800 py-1.5 pl-3 pr-8 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-xs"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.requestedAmountInr > 0 ? `₹${(c.requestedAmountInr / 100000).toFixed(0)}L` : 'Special'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Officer Badge */}
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <UserCheck className="w-3.5 h-3.5 text-brand-600" />
          <span className="font-semibold text-slate-800">Priya Sharma</span>
          <span className="text-slate-400 text-[11px]">(Credit Officer #CR-88412)</span>
        </div>
      </div>

      {/* Screen Navigation Tabs */}
      <nav className="px-4 flex space-x-1 overflow-x-auto border-t border-slate-100 bg-slate-50/50 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-brand-600 text-brand-900 bg-white font-semibold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.id === 'workflow' && selectedCase.id === 'case_sharma_traders' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
