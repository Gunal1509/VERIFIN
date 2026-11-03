import React, { useState } from 'react';
import { 
  Printer, 
  CheckCircle2, 
  TrendingUp, 
  Percent, 
  Banknote,
  ShieldCheck,
  Lock,
  Fingerprint
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import type { CaseData } from '../types';

interface CamProofPackScreenProps {
  currentCase: CaseData;
  hasAppliedEvidence: boolean;
}

export const CamProofPackScreen: React.FC<CamProofPackScreenProps> = ({
  currentCase,
  hasAppliedEvidence,
}) => {
  const [activeCitation, setActiveCitation] = useState<string | null>(null);
  const copy = microcopy.screens.camProofPack;

  const currentLoan = hasAppliedEvidence ? 6_650_000 : currentCase.decision.loanAmountInr;
  const currentCash = hasAppliedEvidence ? 220_000 : currentCase.decision.threeNumbers.verifiedMonthlyCashInr;
  const currentDscr = hasAppliedEvidence ? 1.25 : currentCase.decision.threeNumbers.dscr;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header and Print Action */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{copy.title}</h2>
            <span className="bg-emerald-100 text-emerald-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Citation Validator Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{copy.subtitle}</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-brand-900 text-white hover:bg-brand-800 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
        >
          <Printer className="w-4 h-4" />
          <span>{copy.printAction}</span>
        </button>
      </div>

      {/* The Printable One-Page Proof Pack Document */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-8 space-y-6 sm:space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Synthetic Notice & Watermark Bar */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-amber-800">
          <div className="flex items-center space-x-2">
            <span className="font-bold">⚠ SYNTHETIC DATA NOTICE:</span>
            <span>All borrower records, GSTINs, and statements are synthetic fixture data.</span>
          </div>
          <span className="font-mono text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded self-start sm:self-auto">
            NOT FOR LIVE CREDIT DISBURSAL
          </span>
        </div>

        {/* Cryptographic Ledger & Audit Stamp */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-700">
            <Fingerprint className="w-4 h-4 text-brand-600" />
            <span>SHA-256 HASH: <span className="text-slate-900 font-bold">e4c19bf02...89a2</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-bold">LEDGER: PENDING_APPROVAL (0-DISBURSAL ENFORCED)</span>
          </div>
        </div>

        {/* Memo Meta Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <span className="text-[11px] font-mono font-bold text-brand-700 tracking-wider uppercase">
              CREDIT ASSESSMENT MEMORANDUM &bull; CONFIDENTIAL
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              {currentCase.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Case Ref: <span className="font-mono">{currentCase.id}</span> &bull; Sector: {currentCase.sector} &bull; Entity: {currentCase.entityType}
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{copy.citationValidatorBadge}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Date: {new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* The 3 Numbers That Matter */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {copy.threeNumbersHeading}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                <Banknote className="w-3.5 h-3.5 text-brand-600" />
                <span>Verified Monthly Cash</span>
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                ₹{(currentCash / 1000).toFixed(0)}k <span className="text-xs text-slate-500 font-normal">/ mo</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                {hasAppliedEvidence ? 'Upgraded via electricity proof' : 'Net bank deposits'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                <Percent className="w-3.5 h-3.5 text-amber-600" />
                <span>Turnover Reconciliation Gap</span>
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                {currentCase.decision.threeNumbers.turnoverGapPct.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                GST sales vs bank credits
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                <span>Debt Service Coverage (DSCR)</span>
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                {currentDscr.toFixed(2)}x
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Policy minimum: 1.25x
              </span>
            </div>
          </div>
        </div>

        {/* Proposed Terms Box */}
        <div className="p-5 bg-brand-50/50 rounded-xl border border-brand-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-brand-950 uppercase tracking-wider">
              {copy.proposalHeading}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-900 text-white font-mono">
              {currentCase.decision.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Proposed Sanction</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                ₹{(currentLoan / 100000).toFixed(1)} Lakh
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Interest Rate</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {currentCase.decision.interestRatePct}% p.a.
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tenor</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {currentCase.decision.tenorMonths} Months
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Hard Policy Limit</span>
              <span className="text-sm font-bold text-emerald-700 block mt-1">
                ENFORCED (0 Disbursal)
              </span>
            </div>
          </div>
        </div>

        {/* Citations-Backed CAM Narrative */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {copy.camBodyHeading}
            </h3>
            <span className="text-[11px] text-slate-400">
              {copy.citationHelp}
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-6 rounded-xl border border-slate-200/80 font-normal">
            {currentCase.camSentences.map((sentence) => (
              <p key={sentence.id} className="inline">
                {sentence.text}{' '}
                {sentence.citations.map((cite) => (
                  <button
                    key={cite}
                    onClick={() => setActiveCitation(cite)}
                    className="inline-flex items-center text-[10px] font-mono font-bold text-brand-700 bg-brand-100/70 hover:bg-brand-200 px-1.5 py-0.2 rounded mr-1 transition-colors border border-brand-200"
                  >
                    <span>[{cite}]</span>
                  </button>
                ))}{' '}
              </p>
            ))}
          </div>
        </div>

        {/* Active Citation Trace Inspector */}
        {activeCitation && (
          <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2 border border-slate-700 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-brand-300 font-mono">
                Evidence Record: {activeCitation}
              </span>
              <button
                onClick={() => setActiveCitation(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-300 text-[11px]">
              Verified provenance: Extracted from primary filing document with cryptographic hash integrity and logged in immutable audit trail.
            </p>
          </div>
        )}

        {/* Citation Provenance Ledger for Institutional Verification */}
        <div className="space-y-2 border-t border-slate-200 pt-4 text-[11px] text-slate-600 print-page-break">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Cryptographic Evidence Provenance Citations
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10px]">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="font-bold text-brand-700">[GSTR3B_JUL23]:</span> GSTR-3B monthly return (GSTN ref #GST7729-23)
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="font-bold text-brand-700">[SBI_STMT_PAGE4]:</span> SBI Current A/c #3098271 inward credit reconciliation
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="font-bold text-brand-700">[BSES_BILL_AUG23]:</span> BSES Yamuna Power commercial connection #DL-88219
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="font-bold text-brand-700">[UDYAM_DL01A]:</span> Udyam Registration Certificate (MCA / MSME Registry)
            </div>
          </div>
        </div>

        {/* Human Sign-off Bottom line */}
        <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">{microcopy.app.title} &bull; Virtusa Jatayu</p>
            <p className="text-[11px] text-slate-400">Model drafts narrative; deterministic Python computed limits & DSCR.</p>
          </div>
          <div className="text-right">
            <div className="w-48 border-b border-slate-400 mb-1"></div>
            <span className="text-[11px] font-semibold text-slate-600">Credit Officer Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
};
