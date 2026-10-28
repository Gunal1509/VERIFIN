import React, { useState } from 'react';
import { 
  Clock, 
  ArrowRight, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  FileSearch, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import type { CaseData, CaseStatus } from '../types';

interface CaseQueueScreenProps {
  cases: CaseData[];
  onSelectCase: (caseId: string, screen?: string) => void;
}

export const CaseQueueScreen: React.FC<CaseQueueScreenProps> = ({ cases, onSelectCase }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const copy = microcopy.screens.queue;

  const filteredCases = cases.filter((c) => {
    const matchesFilter = selectedFilter === 'all' || c.status === selectedFilter;
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>{copy.statusChips.ready}</span>
          </span>
        );
      case 'needsEvidence':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{copy.statusChips.needsEvidence}</span>
          </span>
        );
      case 'waitingApprover':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <FileSearch className="w-3 h-3 text-blue-600" />
            <span>{copy.statusChips.waitingApprover}</span>
          </span>
        );
      case 'sanctioned':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <CheckCircle className="w-3 h-3 text-indigo-600" />
            <span>{copy.statusChips.sanctioned}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{copy.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{copy.subtitle}</p>
        </div>
        <div className="flex items-center space-x-3 text-xs bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200">
          <Clock className="w-4 h-4 text-brand-600" />
          <span className="text-slate-600">Total Officer Time Saved Today:</span>
          <span className="font-bold text-brand-900 text-sm">17.8 Hours</span>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: 'all', label: 'All Cases' },
            { id: 'needsEvidence', label: copy.statusChips.needsEvidence },
            { id: 'ready', label: copy.statusChips.ready },
            { id: 'waitingApprover', label: copy.statusChips.waitingApprover },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFilter === chip.id
                  ? 'bg-brand-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">{c.id}</span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-900 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{c.sector} &bull; {c.entityType}</p>
                </div>
                {getStatusBadge(c.status)}
              </div>

              {/* Loan Amount & Time Saved */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Requested Loan</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {c.requestedAmountInr > 0 ? `₹${(c.requestedAmountInr / 100000).toFixed(1)} Lakh` : 'Review Only'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{copy.timeSavedLabel}</span>
                  <span className="font-bold text-emerald-700 text-sm">~{c.timeSavedMinutes} mins</span>
                </div>
              </div>

              {/* Colleague Microcopy Summary */}
              <div className="bg-brand-50/60 p-3 rounded-lg border border-brand-100/60 text-xs text-brand-950 leading-relaxed font-normal">
                {c.summaryMessage}
              </div>

              {/* Security Banner if Injection Detected */}
              {c.hasAdversarialInjection && (
                <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-md">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Prompt Injection Quarantined & Logged</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-brand-500" />
                <span>Deterministic Sizing</span>
              </div>
              <button
                onClick={() => onSelectCase(c.id, 'workflow')}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-900 hover:bg-brand-800 rounded-lg shadow-xs transition-colors"
              >
                <span>{copy.openAction}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
