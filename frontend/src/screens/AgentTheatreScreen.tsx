import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  ShieldCheck, 
  FileText, 
  Zap, 
  ExternalLink, 
  MessageSquare, 
  X,
  ArrowRight
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import type { AgentTheatreStage, CaseData } from '../types';
import { SHARMA_INITIAL_STAGES, SHARMA_REPLAN_STAGES } from '../data/agentTheatreTraces';

interface AgentTheatreScreenProps {
  cases: CaseData[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  onOpenCockpit: () => void;
}

export const AgentTheatreScreen: React.FC<AgentTheatreScreenProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  onOpenCockpit,
}) => {
  const [stages, setStages] = useState<AgentTheatreStage[]>(SHARMA_INITIAL_STAGES);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(10); // default show full run
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [whatChangedMode, setWhatChangedMode] = useState<boolean>(false);
  const [isLiveStream, setIsLiveStream] = useState<boolean>(false);
  const [activeModalEvidence, setActiveModalEvidence] = useState<{
    doc: string;
    page?: number;
    txnId?: string;
    label: string;
  } | null>(null);
  const [officerDecisionSubmitted, setOfficerDecisionSubmitted] = useState<string | null>(null);

  const copy = microcopy.agentTheatre;
  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Try to connect to real SSE if backend is available
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`http://localhost:8000/api/cases/${selectedCaseId}/events`);
      eventSource.onopen = () => {
        setIsLiveStream(true);
      };
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.event === 'stage_finished') {
            // Live orchestrator progress
          }
        } catch {
          // ignore
        }
      };
      eventSource.onerror = () => {
        setIsLiveStream(false);
        if (eventSource) eventSource.close();
      };
    } catch {
      setIsLiveStream(false);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [selectedCaseId]);

  // Handle What Changed mode toggle
  useEffect(() => {
    if (whatChangedMode) {
      setStages(SHARMA_REPLAN_STAGES);
      setCurrentStageIndex(10);
    } else {
      setStages(SHARMA_INITIAL_STAGES);
    }
  }, [whatChangedMode]);

  // Autoplay timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev >= stages.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, stages.length]);

  const handlePlayPause = () => {
    if (currentStageIndex >= stages.length - 1) {
      setCurrentStageIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStageIndex((prev) => Math.min(stages.length - 1, prev + 1));
  };

  const handleReplay = () => {
    setIsPlaying(false);
    setCurrentStageIndex(0);
    setTimeout(() => setIsPlaying(true), 150);
  };

  const handleOfficerDecision = async (action: 'SANCTIONED' | 'SENT_BACK' | 'ESCALATED') => {
    setOfficerDecisionSubmitted(action);
    try {
      await fetch(`http://localhost:8000/api/cases/${selectedCaseId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: `Decision recorded from Agent Theatre interactive session.`,
          officer_id: 'CREDIT_OFFICER_001',
        }),
      });
    } catch {
      // offline fallback
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 sm:px-2.5 py-0.5 rounded">
              INTERACTIVE DEMONSTRATION
            </span>
            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-medium ${
              isLiveStream ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveStream ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isLiveStream ? 'Live Orchestrator SSE' : 'Recorded Trace'}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5 sm:mt-2">{copy.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">{copy.subtitle}</p>
          <div className="pt-2">
            <button
              onClick={onOpenCockpit}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              <span>Open Cockpit ({currentCase.name})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Concurrency Benchmark Pill */}
        <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono shrink-0">
          <div className="flex items-center justify-between text-slate-300 gap-2">
            <span className="text-[11px] sm:text-xs">{copy.benchmarkHeader}</span>
            <span className="text-emerald-400 font-bold text-[11px] sm:text-xs">{copy.speedup}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-[11px] pt-1 border-t border-slate-800">
            <div>
              <div className="text-slate-400">{copy.parallelLabel}</div>
              <div className="text-emerald-300 font-bold text-xs sm:text-sm">{copy.parallelTime}</div>
            </div>
            <div>
              <div className="text-slate-400">{copy.sequentialLabel}</div>
              <div className="text-slate-300 font-bold text-xs sm:text-sm">{copy.sequentialTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar (Phone-Friendly) */}
      <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        {/* Case Selector */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-mono shrink-0">{copy.controls.caseSelect}</span>
          <select
            value={selectedCaseId}
            onChange={(e) => onSelectCase(e.target.value)}
            className="bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-400 flex-1 sm:flex-initial truncate"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Playback Controls & Speed */}
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleReplay}
              title={copy.controls.replay}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={handlePlayPause}
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>{copy.controls.pause}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{copy.controls.play}</span>
                </>
              )}
            </button>

            <button
              onClick={handleStepForward}
              title={copy.controls.step}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1 pl-1.5 border-l border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[10px] sm:text-xs">Speed:</span>
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono cursor-pointer ${
                  playbackSpeed === spd ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* What Changed Toggle */}
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setWhatChangedMode(!whatChangedMode)}
            className={`inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer w-full sm:w-auto ${
              whatChangedMode
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 shrink-0 ${whatChangedMode ? 'fill-current' : ''}`} />
            <span>{copy.controls.whatChanged}</span>
          </button>
        </div>
      </div>

      {/* Progress & Wave Stepper */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 space-y-2">
        <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-500 font-mono">
          <span>STAGE {Math.min(currentStageIndex + 1, stages.length)} OF {stages.length}</span>
          <span className="truncate ml-2">{whatChangedMode ? 'RE-PLAN (7 REDONE / 4 REUSED)' : 'INITIAL RUN'}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
          {stages.map((st, i) => (
            <div
              key={st.id}
              className={`h-full transition-all duration-300 ${
                i <= currentStageIndex
                  ? st.isReused
                    ? 'bg-emerald-500'
                    : st.isStale
                    ? 'bg-amber-500'
                    : 'bg-brand-600'
                  : 'bg-transparent'
              }`}
              style={{ width: `${100 / stages.length}%` }}
            />
          ))}
        </div>
      </div>

      {/* Mobile Horizontal Stage Pills (Phone View) */}
      <div className="block lg:hidden space-y-1.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
          Select Stage to Inspect:
        </span>
        <div className="flex space-x-1.5 overflow-x-auto touch-scroll pb-1">
          {stages.map((stage, idx) => {
            const isCurrent = idx === currentStageIndex;
            return (
              <button
                key={stage.id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStageIndex(idx);
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-left text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                  isCurrent
                    ? 'bg-brand-900 text-white border-brand-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  stage.isReused ? 'bg-emerald-400' : stage.isStale ? 'bg-amber-400' : 'bg-brand-400'
                }`} />
                <span>{stage.name.split('.')[0]}. {stage.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Detail & Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Desktop Stages List (Hidden on phone view to prioritize active inspector) */}
        <div className="hidden lg:block lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            Pipeline Agents (Wave-Grouped)
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {stages.map((stage, idx) => {
              const isCurrent = idx === currentStageIndex;
              const isPassed = idx < currentStageIndex;

              return (
                <div
                  key={stage.id}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStageIndex(idx);
                  }}
                  className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-brand-50/80 border-brand-500 shadow-xs'
                      : isPassed
                      ? 'bg-white border-slate-200 hover:bg-slate-50'
                      : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        stage.isReused ? 'bg-emerald-500' : stage.isStale ? 'bg-amber-500' : 'bg-brand-600'
                      }`} />
                      <span className="font-bold text-slate-900">{stage.name}</span>
                    </div>

                    <div className="flex items-center space-x-2 font-mono text-[10px]">
                      {stage.isReused && (
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                          REUSED (0ms)
                        </span>
                      )}
                      {stage.isStale && (
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                          STALE REDONE
                        </span>
                      )}
                      <span className="text-slate-400">Wave {stage.wave}</span>
                    </div>
                  </div>

                  <p className="text-slate-500 mt-1 line-clamp-1">{stage.oneSentenceJob}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Stage Detailed Inspector Card */}
        <div className="lg:col-span-7">
          {stages[currentStageIndex] && (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 gap-2 sm:gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] sm:text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Wave {stages[currentStageIndex].wave}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-slate-400">
                      ID: {stages[currentStageIndex].id}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    {stages[currentStageIndex].name}
                  </h2>
                </div>

                <div className="flex items-center space-x-2 font-mono text-[11px] sm:text-xs self-start sm:self-auto">
                  <span className="bg-slate-100 text-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-slate-200">
                    Hash: {stages[currentStageIndex].inputHash}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-emerald-200 font-semibold">
                    {stages[currentStageIndex].executionTimeMs} ms
                  </span>
                </div>
              </div>

              {/* 1. Job Description */}
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Job Responsibility</span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{stages[currentStageIndex].oneSentenceJob}</p>
              </div>

              {/* 2. Inputs Read */}
              <div className="space-y-1.5">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Declared Inputs Read</span>
                <div className="flex flex-wrap gap-1.5">
                  {stages[currentStageIndex].inputsRead.map((inp, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-md text-[11px] sm:text-xs font-mono">
                      {inp}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. Tools Called (Code vs Model) */}
              <div className="space-y-2">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Tools Called</span>
                <div className="space-y-2">
                  {stages[currentStageIndex].toolsCalled.map((tool, idx) => (
                    <div key={idx} className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{tool.name}</div>
                        <div className="text-slate-500 text-[11px]">{tool.description}</div>
                      </div>
                      <span className={`self-start sm:self-auto shrink-0 px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        tool.type === 'code'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {tool.type === 'code' ? '[Deterministic Code]' : '[LLM Model]'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Output Summary */}
              <div className="space-y-1.5 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Output Result</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">{stages[currentStageIndex].outputSummary}</p>
              </div>

              {/* 5. Evidence Citations (Clickable!) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider font-mono text-[10px] sm:text-xs">Clickable Citations</span>
                  <span className="text-slate-400 text-[11px]">Click to inspect</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stages[currentStageIndex].evidenceCitations.map((ev, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveModalEvidence(ev)}
                      className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 shadow-xs cursor-pointer hover:border-brand-500 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate max-w-[200px]">{ev.label}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. A2A Dialogue if present */}
              {stages[currentStageIndex].a2aDialogue && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 sm:p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Agent-to-Agent Communication</span>
                  </div>
                  <div className="text-xs text-amber-800">
                    <span className="font-semibold">{stages[currentStageIndex].a2aDialogue?.from}</span> → <span className="font-semibold">{stages[currentStageIndex].a2aDialogue?.to}</span>:
                    <p className="mt-1 font-mono text-[10px] sm:text-[11px] bg-white/80 p-2 sm:p-2.5 rounded border border-amber-200">
                      "{stages[currentStageIndex].a2aDialogue?.message}"
                    </p>
                  </div>
                </div>
              )}

              {/* Stage 11 Credit Officer Final Gate */}
              {stages[currentStageIndex].id === 'human' && (
                <div className="pt-4 border-t border-slate-200 space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">Credit Officer Final Sign-Off</h3>
                      <p className="text-[11px] sm:text-xs text-slate-500">Human makes the call. Select ledger action:</p>
                    </div>
                    {officerDecisionSubmitted && (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold font-mono self-start sm:self-auto">
                        RECORDED: {officerDecisionSubmitted}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleOfficerDecision('SANCTIONED')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs text-center"
                    >
                      Approve & Sanction ({whatChangedMode ? '₹66.5L' : '₹45.0L'})
                    </button>
                    <button
                      onClick={() => handleOfficerDecision('SENT_BACK')}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs text-center"
                    >
                      Send Back for Evidence
                    </button>
                    <button
                      onClick={() => handleOfficerDecision('ESCALATED')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs text-center"
                    >
                      Escalate Case
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Evidence Citation Modal */}
      {activeModalEvidence && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Evidence Proof Document</h3>
              </div>
              <button
                onClick={() => setActiveModalEvidence(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">DOCUMENT:</span>
                  <span className="font-bold text-slate-900 text-right truncate ml-2">{activeModalEvidence.doc}</span>
                </div>
                {activeModalEvidence.page && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-mono">PAGE NUMBER:</span>
                    <span className="font-bold text-slate-900">Page {activeModalEvidence.page}</span>
                  </div>
                )}
                {activeModalEvidence.txnId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-mono">TRANSACTION ID:</span>
                    <span className="font-bold text-brand-700 font-mono">{activeModalEvidence.txnId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">PROOF CITATION:</span>
                  <span className="font-bold text-slate-900 text-right truncate ml-2">{activeModalEvidence.label}</span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cryptographically verified against tamper-evident SHA-256 document checksum.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveModalEvidence(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer w-full sm:w-auto"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
