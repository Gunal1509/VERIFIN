import React, { useState } from 'react';
import { 
  TrendingUp, 
  Upload, 
  CheckCircle2,
  MessageSquare,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import { BorrowerMobileSimulator } from '../components/BorrowerMobileSimulator';
import type { CaseData, EvidenceCostLevel } from '../types';

interface EvidenceLadderScreenProps {
  currentCase: CaseData;
  onApplyNewEvidence: () => void;
  hasAppliedEvidence: boolean;
}

export const EvidenceLadderScreen: React.FC<EvidenceLadderScreenProps> = ({
  currentCase,
  onApplyNewEvidence,
  hasAppliedEvidence,
}) => {
  const copy = microcopy.screens.evidenceLadder;
  const indicCopy = microcopy.indicNotice;
  const [indicTab, setIndicTab] = useState<'english' | 'hindi'>('english');
  const [copied, setCopied] = useState(false);
  const [showMobileSim, setShowMobileSim] = useState(false);

  const getCostBadge = (level: EvidenceCostLevel) => {
    switch (level) {
      case 'CHEAP':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {copy.costLabels.CHEAP}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {copy.costLabels.MEDIUM}
          </span>
        );
      case 'EXPENSIVE':
        return (
          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {copy.costLabels.EXPENSIVE}
          </span>
        );
      case 'SITE_VISIT':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {copy.costLabels.SITE_VISIT}
          </span>
        );
    }
  };

  const currentSafeLoan = hasAppliedEvidence ? 6_650_000 : currentCase.decision.loanAmountInr;
  const potentialMaxLoan = currentCase.id === 'case_sharma_traders' ? 6_650_000 : currentCase.requestedAmountInr;

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{copy.title}</h2>
            <span className="bg-brand-100 text-brand-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Gaps Become Next Steps
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{copy.subtitle}</p>
        </div>
        <div className="text-xs text-slate-500 max-w-sm bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-200">
          "We never reject when a mismatch occurs. We show the borrower a prioritized roadmap of what evidence will unlock the credit they need."
        </div>
      </div>

      {/* Sizing Progression Bar */}
      <div className="bg-gradient-to-r from-brand-950 to-brand-800 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
        <div className="space-y-1">
          <span className="text-xs text-brand-300 font-semibold uppercase tracking-wider">
            {copy.currentLoanLabel} (Confirmed Cash)
          </span>
          <div className="text-3xl font-extrabold tracking-tight">
            ₹{(currentSafeLoan / 100000).toFixed(1)} Lakh
          </div>
          <span className="text-xs text-slate-300 block">
            {hasAppliedEvidence 
              ? 'corroborated with BSES commercial electricity receipts (+₹0.6L/mo cash)' 
              : 'sized strictly on verified SBI bank deposits at 1.25x DSCR'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-brand-200 block text-[11px]">Potential Sanction</span>
            <span className="text-lg font-bold text-emerald-300">₹{(potentialMaxLoan / 100000).toFixed(1)} Lakh</span>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-brand-200 block text-[11px]">Capital Unlocked</span>
            <span className="text-lg font-bold text-amber-300">
              {hasAppliedEvidence ? '+₹21.5 Lakh' : '+₹0.0 Lakh'}
            </span>
          </div>
        </div>
      </div>

      {/* Evidence Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <span>Ranked Evidence Ladder for {currentCase.name}</span>
          </h3>
          <button
            onClick={() => setShowMobileSim(true)}
            className="inline-flex items-center space-x-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Show Borrower View</span>
          </button>
        </div>

        {currentCase.evidenceLadder.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            No pending evidence required. All reported financials are fully reconciled under Grade A.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {currentCase.evidenceLadder.map((item) => {
              const isItemVerified = hasAppliedEvidence && item.id === 'ev_sharma_bills';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 shadow-xs ${
                    isItemVerified
                      ? 'border-emerald-400 bg-emerald-50/30 ring-1 ring-emerald-300'
                      : 'border-slate-200 hover:border-brand-400'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-brand-900 text-white flex items-center justify-center font-bold text-xs">
                          {item.rank}
                        </span>
                        {getCostBadge(item.costLevel)}
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {copy.rupeeUnlocked(item.potentialUnlockedLoanInr / 100000)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{item.requiredDoc}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isItemVerified ? (
                        <span className="text-emerald-700 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified & Applied</span>
                        </span>
                      ) : (
                        copy.statusLabels.PENDING
                      )}
                    </span>

                    {currentCase.id === 'case_sharma_traders' && item.id === 'ev_sharma_bills' && (
                      <button
                        onClick={onApplyNewEvidence}
                        disabled={hasAppliedEvidence}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
                          hasAppliedEvidence
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-brand-900 text-white hover:bg-brand-800 shadow-xs'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>{hasAppliedEvidence ? 'Submitted' : 'Upload Proof'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Indic Language Notice Generator */}
      {currentCase.id === 'case_sharma_traders' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <div>
                <span className="text-[10px] font-mono font-bold text-brand-600 uppercase tracking-wider block">
                  {indicCopy.tag}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{indicCopy.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{indicCopy.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setIndicTab('english')}
                className={`px-3 py-1.5 rounded-md transition-colors focus:outline-none ${
                  indicTab === 'english' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {indicCopy.tabEnglish}
              </button>
              <button
                onClick={() => setIndicTab('hindi')}
                className={`px-3 py-1.5 rounded-md transition-colors focus:outline-none ${
                  indicTab === 'hindi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {indicCopy.tabHindi}
              </button>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg font-semibold">
              ⚠ {indicCopy.syntheticNote}
            </p>
            <div className="relative">
              <pre className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-xl p-4 font-sans">
                {indicTab === 'english'
                  ? indicCopy.english('Sharma Traders', 'SBI MSME Branch', 45, 21.5, 'BSES electricity bills')
                  : indicCopy.hindi('Sharma Traders', 'SBI MSME शाखा', 45, 21.5, 'BSES बिजली बिल')}
              </pre>
              <button
                onClick={() => {
                  const text = indicTab === 'english'
                    ? indicCopy.english('Sharma Traders', 'SBI MSME Branch', 45, 21.5, 'BSES electricity bills')
                    : indicCopy.hindi('Sharma Traders', 'SBI MSME शाखा', 45, 21.5, 'BSES बिजली बिल');
                  navigator.clipboard.writeText(text).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className="absolute top-3 right-3 flex items-center space-x-1 text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? indicCopy.copiedLabel : indicCopy.copyLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Borrower Mobile Simulator */}
      <BorrowerMobileSimulator
        isOpen={showMobileSim}
        onClose={() => setShowMobileSim(false)}
        onApplyEvidence={onApplyNewEvidence}
        hasAppliedEvidence={hasAppliedEvidence}
      />
    </div>
  );
};
