import React, { useState } from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle, 
  UserCheck, 
  Lock, 
  Check
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import type { CaseData } from '../types';

interface DecisionScreenProps {
  currentCase: CaseData;
  hasAppliedEvidence: boolean;
}

export const DecisionScreen: React.FC<DecisionScreenProps> = ({
  currentCase,
  hasAppliedEvidence,
}) => {
  const [officerNotes, setOfficerNotes] = useState('');
  const [submittedAction, setSubmittedAction] = useState<string | null>(null);

  const copy = microcopy.screens.decision;

  const currentLoan = hasAppliedEvidence ? 6_600_000 : currentCase.decision.loanAmountInr;

  const handleAction = (actionName: string) => {
    setSubmittedAction(actionName);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Human In Charge Reminder Banner */}
      <div className="bg-brand-950 text-white p-6 rounded-2xl shadow-sm space-y-3 border border-brand-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-brand-800 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{copy.humanInChargeTitle}</h2>
            <p className="text-xs text-brand-200 mt-0.5">{copy.humanInChargeText}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-brand-900/80 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-300">
          <span className="font-mono">{copy.authBadge}</span>
          <span className="inline-flex items-center space-x-1.5 text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/80">
            <Lock className="w-3.5 h-3.5" />
            <span>Disbursal Route: Physically Absent in Codebase</span>
          </span>
        </div>
      </div>

      {/* Case Assessment Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Application Overview: {currentCase.name}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Requested Loan</span>
            <span className="font-bold text-slate-800 text-sm">
              ₹{(currentCase.requestedAmountInr / 100000).toFixed(1)} Lakh
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Recommended Sanction</span>
            <span className="font-bold text-brand-900 text-sm">
              ₹{(currentLoan / 100000).toFixed(1)} Lakh
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Turnover Gap</span>
            <span className="font-bold text-slate-800 text-sm">
              {currentCase.decision.threeNumbers.turnoverGapPct.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Underwriting Status</span>
            <span className="font-bold text-emerald-700 text-sm">
              PENDING_APPROVAL
            </span>
          </div>
        </div>

        {/* Officer Rationalization Field */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 block">
            {copy.notesLabel}
          </label>
          <textarea
            rows={4}
            value={officerNotes}
            onChange={(e) => setOfficerNotes(e.target.value)}
            placeholder={copy.notesPlaceholder}
            className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs text-slate-800"
          />
        </div>
      </div>

      {/* Decision Actions */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Authorized Underwriting Actions
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Action 1: Approve */}
          <button
            onClick={() => handleAction('SANCTIONED')}
            className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-left transition-all shadow-xs group"
          >
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Approve Loan</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed font-normal">
              Sanction proposed terms of ₹{(currentLoan / 100000).toFixed(1)} Lakh. Moves ledger status to SANCTIONED.
            </p>
          </button>

          {/* Action 2: Send Back for Evidence */}
          <button
            onClick={() => handleAction('SENT_BACK')}
            className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-left transition-all shadow-xs group"
          >
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs mb-1">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Send Back with Notes</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed font-normal">
              Request borrower to upload prioritized evidence from the Evidence Ladder to unlock higher sizing.
            </p>
          </button>

          {/* Action 3: Escalate to Senior Committee */}
          <button
            onClick={() => handleAction('ESCALATED')}
            className="p-4 rounded-xl border border-purple-300 bg-purple-50/60 hover:bg-purple-100 text-left transition-all shadow-xs group"
          >
            <div className="flex items-center space-x-2 text-purple-800 font-bold text-xs mb-1">
              <AlertTriangle className="w-4 h-4 text-purple-600" />
              <span>Escalate Case</span>
            </div>
            <p className="text-[11px] text-purple-900 leading-relaxed font-normal">
              Forward case to Head of Credit Risk for policy exception review or field site verification sign-off.
            </p>
          </button>
        </div>
      </div>

      {/* Action Submission Confirmation */}
      {submittedAction && (
        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Check className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-white block">
                Decision Recorded: Ledger Status &rarr; {submittedAction}
              </span>
              <span className="text-slate-400">
                Audit entry created with officer signature #CR-88412. Zero money disbursed.
              </span>
            </div>
          </div>
          <button
            onClick={() => setSubmittedAction(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
