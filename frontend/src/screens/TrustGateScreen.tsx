import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Info
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import { Tooltip } from '../components/Tooltip';
import type { CaseData, FactGrade } from '../types';

interface TrustGateScreenProps {
  currentCase: CaseData;
}

export const TrustGateScreen: React.FC<TrustGateScreenProps> = ({ currentCase }) => {
  const copy = microcopy.screens.trustGate;

  const renderGradeBadge = (grade: FactGrade) => {
    switch (grade) {
      case 'A':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Grade A (Confirmed)</span>
          </span>
        );
      case 'B':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>Grade B (Plausible, Unconfirmed)</span>
          </span>
        );
      case 'C':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Grade C (Contradicted)</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{copy.title}</h2>
            <span className="bg-emerald-100 text-emerald-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Deterministic Verification
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{copy.subtitle}</p>
        </div>
        <div className="text-xs text-slate-500 max-w-sm bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-200">
          "Code computes, models explain. Every number that shapes a loan must have proven origin and an explicit grade."
        </div>
      </div>

      {/* Grade Criteria Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 sm:p-4 rounded-xl space-y-1.5 sm:space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-600 shrink-0" />
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Grade A &bull; Independent Match</h4>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            {microcopy.tooltips.gradeA}
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-3.5 sm:p-4 rounded-xl space-y-1.5 sm:space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 shrink-0" />
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">Grade B &bull; Plausible Unconfirmed</h4>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            {microcopy.tooltips.gradeB}
          </p>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 p-3.5 sm:p-4 rounded-xl space-y-1.5 sm:space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-600 shrink-0" />
            <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide">Grade C &bull; Contradicted</h4>
          </div>
          <p className="text-xs text-rose-900 leading-relaxed">
            {microcopy.tooltips.gradeC}
          </p>
        </div>
      </div>

      {/* Trust Gate Table & Mobile Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Extracted Financial Facts for {currentCase.name}</span>
          </h3>
          <span className="text-[11px] sm:text-xs font-mono text-slate-400">
            {currentCase.facts.length} Facts Linked
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">{copy.tableHeaders.metric}</th>
                <th className="px-4 py-3">{copy.tableHeaders.value}</th>
                <th className="px-4 py-3">{copy.tableHeaders.grade}</th>
                <th className="px-4 py-3">{copy.tableHeaders.source}</th>
                <th className="px-5 py-3">{copy.tableHeaders.reason}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentCase.facts.map((fact) => (
                <tr key={fact.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    <div className="flex items-center space-x-1.5">
                      <span>{fact.name}</span>
                      {fact.id.includes('turnover') && (
                        <Tooltip content={microcopy.tooltips.turnoverGap} />
                      )}
                      {fact.id.includes('dscr') && (
                        <Tooltip content={microcopy.tooltips.dscr} />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{fact.id}</span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 font-mono text-sm">
                    {fact.value}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {renderGradeBadge(fact.grade)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-500" />
                      <span className="font-semibold text-slate-700">{fact.sourceDoc}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Page {fact.page}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 leading-relaxed max-w-md">
                    {fact.gradeReason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phone View: Responsive Fact Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {currentCase.facts.map((fact) => (
            <div key={fact.id} className="p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{fact.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{fact.id}</span>
                </div>
                <div className="shrink-0">{renderGradeBadge(fact.grade)}</div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-mono text-[11px]">VALUE:</span>
                <span className="font-bold text-slate-900 font-mono">{fact.value}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono text-[11px]">SOURCE:</span>
                <span className="text-slate-700 font-medium truncate max-w-[200px] text-right">
                  {fact.sourceDoc} (p. {fact.page})
                </span>
              </div>

              <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                {fact.gradeReason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
