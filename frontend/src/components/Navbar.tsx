import React, { useState } from 'react';
import { 
  Building2, 
  GitFork, 
  ShieldCheck, 
  Network, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Sliders, 
  ChevronDown, 
  Video, 
  PlayCircle, 
  Home, 
  RefreshCw,
  Menu,
  X,
  Sparkles,
  PlugZap
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
  onTogglePolicyPack: () => void;
  onOpenEntryScene?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  setActiveScreen,
  cases,
  selectedCaseId,
  setSelectedCaseId,
  activePolicyPack,
  onTogglePolicyPack,
  onOpenEntryScene,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const mainNavItems = [
    { id: 'landing', label: microcopy.navigation.landing, icon: Home },
    { id: 'integrations', label: microcopy.navigation.integrations, icon: PlugZap },
    { id: 'agentTheatre', label: microcopy.navigation.agentTheatre, icon: PlayCircle },
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

  const handleNavClick = (screenId: string) => {
    setActiveScreen(screenId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Institutional Safety Banner */}
      <div className="bg-fintech-dark text-slate-200 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs flex flex-wrap justify-between items-center gap-1.5">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-semibold text-white">{microcopy.app.officerRoleBadge}</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:inline">{microcopy.app.humanInChargeBanner}</span>
        </div>

        {/* Policy Switcher & Disbursal Guard & Intro Scene Trigger */}
        <div className="flex items-center space-x-2 text-slate-300">
          {onOpenEntryScene && (
            <button
              onClick={onOpenEntryScene}
              title="Watch the animated story intro to title"
              className="inline-flex items-center space-x-1 bg-brand-900 hover:bg-brand-800 text-cyan-200 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono border border-cyan-700/60 transition-colors cursor-pointer"
            >
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-300 shrink-0" />
              <span>INTRO SCENE</span>
            </button>
          )}
          <button
            onClick={onTogglePolicyPack}
            title="Click to toggle between Bank A (Standard) and Bank B (Conservative)"
            className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 shrink-0" />
            <span>POLICY: {activePolicyPack.toUpperCase()}</span>
          </button>
          <span className="hidden sm:inline font-mono text-[10px] sm:text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
            DISBURSAL: LOCKED
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div 
          onClick={() => handleNavClick('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-brand-950 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm group-hover:bg-brand-900 transition-colors">
            V
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {microcopy.app.title}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
              Virtusa Jatayu S6 &bull; MSME Copilot
            </p>
          </div>
        </div>

        {/* Mobile Actions: Case Dropdown + Hamburger */}
        <div className="flex items-center space-x-2">
          {/* Case Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            <span className="hidden sm:inline text-xs font-semibold text-slate-500 px-1 font-mono">CASE:</span>
            <div className="relative">
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                aria-label="Active MSME loan case"
                className="appearance-none bg-white text-[11px] sm:text-xs font-semibold text-slate-800 py-1 pl-2 pr-7 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-xs max-w-[140px] sm:max-w-[200px] truncate"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Accordion) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-3 py-2 space-y-1 shadow-lg animate-in fade-in duration-150">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 py-1">
            Navigation Menu
          </div>
          <div className="grid grid-cols-1 gap-1">
            {onOpenEntryScene && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEntryScene();
                }}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold w-full text-left bg-brand-950 text-cyan-200 border border-brand-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Play Animated Story Intro</span>
              </button>
            )}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold w-full text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-brand-50 text-brand-900 border border-brand-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Sub-Bar (Swipeable on Phone, Full on Desktop) */}
      <div className="px-2 sm:px-4 bg-slate-50 border-t border-slate-200 overflow-x-auto touch-scroll">
        <nav className="flex space-x-1 py-1.5" aria-label="Cockpit navigation">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-brand-900 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
