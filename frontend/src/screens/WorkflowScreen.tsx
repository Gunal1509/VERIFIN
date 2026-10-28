import React, { useState } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Layers, 
  RefreshCw
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import type { CaseData, WorkflowStageNode } from '../types';

interface WorkflowScreenProps {
  currentCase: CaseData;
  onApplyNewEvidence: () => void;
  hasAppliedEvidence: boolean;
}

export const WorkflowScreen: React.FC<WorkflowScreenProps> = ({
  currentCase,
  onApplyNewEvidence,
  hasAppliedEvidence,
}) => {
  const [isSimulatingReplan, setIsSimulatingReplan] = useState(false);
  const copy = microcopy.screens.workflow;

  const handleSimulateEvidence = () => {
    setIsSimulatingReplan(true);
    setTimeout(() => {
      onApplyNewEvidence();
      setIsSimulatingReplan(false);
    }, 1200);
  };

  // Group stages by wave
  const wavesMap = currentCase.workflowStages.reduce<Record<number, WorkflowStageNode[]>>((acc, stage) => {
    if (!acc[stage.wave]) acc[stage.wave] = [];
    acc[stage.wave].push(stage);
    return acc;
  }, {});

  const waves = Object.entries(wavesMap).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{copy.title}</h2>
            <span className="bg-brand-100 text-brand-900 text-xs px-2 py-0.5 rounded-full font-semibold">
              Wave Topological Scheduler
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{copy.subtitle}</p>
        </div>

        {/* Re-Plan Trigger for Sharma Case */}
        {currentCase.id === 'case_sharma_traders' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSimulateEvidence}
              disabled={isSimulatingReplan}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-all ${
                hasAppliedEvidence
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-amber-600 hover:bg-amber-700 animate-pulse'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSimulatingReplan ? 'animate-spin' : ''}`} />
              <span>
                {hasAppliedEvidence 
                  ? 'Re-Plan Completed (6/9 Stages Reused)' 
                  : copy.replanButton}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Re-Plan Pulse Banner */}
      {hasAppliedEvidence && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between glow-amber-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Incremental Re-Planning Activated
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                {microcopy.caseMoments.evidenceAdded} Only <strong>Cash Flow</strong>, <strong>Risk</strong>, and <strong>Structuring</strong> recomputed. The other 6 stages used cached results.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300">
            66.7% Compute Saved
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <span className="font-semibold text-slate-800">Graph Legend:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>{copy.legendParallel} (Runs Concurrent)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-teal-500"></span>
          <span>{copy.legendReused} (Cached Input-Hash)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>{copy.legendStale} (Downstream Rerun)</span>
        </div>
      </div>

      {/* Live DAG Wave Progression View */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-6">
          {waves.map(([waveNum, stagesInWave]) => {
            const isParallel = stagesInWave.length > 1;
            return (
              <div key={waveNum} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                    <span>Wave {waveNum} {isParallel && '(Parallel Execution)'}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Inputs ready &bull; Deterministic merge
                  </span>
                </div>

                {/* Stage Cards in this Wave */}
                <div className={`grid gap-4 ${isParallel ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {stagesInWave.map((stage) => {
                    const isStaleRerun = hasAppliedEvidence && ['cashflow', 'risk', 'structuring'].includes(stage.id);
                    const isReused = hasAppliedEvidence && !['cashflow', 'risk', 'structuring'].includes(stage.id);

                    return (
                      <div
                        key={stage.id}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          isStaleRerun
                            ? 'bg-amber-50/60 border-amber-400 shadow-sm ring-1 ring-amber-300'
                            : isReused
                            ? 'bg-teal-50/40 border-teal-300'
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase">
                                stage_{stage.id}
                              </span>
                              {isParallel && (
                                <span className="bg-brand-100 text-brand-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  PARALLEL
                                </span>
                              )}
                              {isReused && (
                                <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  REUSED (HASH MATCH)
                                </span>
                              )}
                              {isStaleRerun && (
                                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                                  STALE RERUN
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">{stage.name}</h4>
                          </div>

                          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{stage.executionTimeMs}ms</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{stage.summary}</p>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono truncate max-w-[200px]">
                            Hash: {stage.id.substring(0, 4)}e9..2c
                          </span>
                          <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Input Verified</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plain Language Timeline Narration */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <GitFork className="w-4 h-4 text-brand-600" />
          <span>{copy.timelineHeading}</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-normal">
          <div className="flex items-start space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0"></span>
            <p>
              "I started reading the documents and checking the credit bureau at the same time in Wave 1 because their inputs were both ready."
            </p>
          </div>
          <div className="flex items-start space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0"></span>
            <p>
              "Once document facts were extracted, the Trust Gate evaluated each figure: bank statements received Grade A, while the claimed turnover was assigned Grade C due to the 70% gap."
            </p>
          </div>
          <div className="flex items-start space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0"></span>
            <p>
              "In Wave 3, Cash Flow Analysis and the Fraud Detector ran in parallel. The fraud check found no circular rings, but confirmed the unverified turnover gap."
            </p>
          </div>
          {hasAppliedEvidence && (
            <div className="flex items-start space-x-2.5 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium text-amber-950">
              <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
              <p>
                "When you uploaded the commercial electricity bills, I only had to redo 3 downstream steps (Cashflow, Risk, and Structuring). The upstream documents, Trust Gate, and Bureau steps kept their cached results."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
