import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FileText, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  Zap, 
  GitFork, 
  AlertTriangle,
  TrendingDown,
  Building2,
  Sparkles
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';

interface EntrySceneProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreCase?: (caseId: string) => void;
  onOpenAgentTheatre?: () => void;
}

interface DocCard {
  title: string;
  subtitle: string;
  value: string;
  status: string;
  note: string;
}

interface MeshNode {
  wave: string;
  name: string;
  tag: string;
  desc: string;
}

interface PillarItem {
  title: string;
  desc: string;
}

const ACT_DURATION_MS = 4500; // 4.5 seconds per act for comfortable reading

export const EntryScene: React.FC<EntrySceneProps> = ({
  isOpen,
  onClose,
  onExploreCase,
  onOpenAgentTheatre,
}) => {
  const [currentAct, setCurrentAct] = useState<1 | 2 | 3>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [actProgress, setActProgress] = useState<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const copy = microcopy.entryScene;

  // Synthesize soft fintech chimes using Web Audio API (no external MP3 dependencies)
  const playChime = useCallback((frequency: number = 587.33, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  // Handle Act changes with audio cue
  const goToAct = useCallback((act: 1 | 2 | 3) => {
    setCurrentAct(act);
    setActProgress(0);
    if (act === 1) playChime(440); // A4
    if (act === 2) playChime(554.37); // C#5
    if (act === 3) playChime(659.25); // E5 (Major triad)
  }, [playChime]);

  // Timer loop for auto-advancement
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const intervalStep = 50;
    const stepIncrement = (intervalStep / ACT_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setActProgress((prev) => {
        if (prev >= 100) {
          if (currentAct === 1) {
            goToAct(2);
            return 0;
          } else if (currentAct === 2) {
            goToAct(3);
            return 0;
          } else {
            // Stay on Act 3 so user can interact with CTAs
            setIsPlaying(false);
            return 100;
          }
        }
        return prev + stepIncrement;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentAct, goToAct]);

  // Keyboard navigation: Escape to skip, Space to pause/play, Arrows to move
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        if (currentAct < 3) goToAct((currentAct + 1) as 1 | 2 | 3);
      } else if (e.key === 'ArrowLeft') {
        if (currentAct > 1) goToAct((currentAct - 1) as 1 | 2 | 3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentAct, goToAct, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md overflow-y-auto p-3 sm:p-6 touch-scroll transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-scene-title"
    >
      {/* Background Animated Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,135,235,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none opacity-50" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/30 overflow-hidden flex flex-col my-auto">
        
        {/* Top Control Header */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          {/* Tag & Synthetic Data Label */}
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs font-mono font-medium text-slate-300 truncate">
              {copy.syntheticTag}
            </span>
          </div>

          {/* Controls: Sound, Pause/Play, Skip */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                setSoundEnabled((prev) => !prev);
                if (!soundEnabled) playChime(523.25);
              }}
              className="inline-flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700 cursor-pointer"
              title={soundEnabled ? copy.controls.soundOff : copy.controls.soundOn}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline text-[11px] font-mono">{copy.controls.soundOff}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline text-[11px] font-mono">{copy.controls.soundOn}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsPlaying((prev) => !prev)}
              className="inline-flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700 cursor-pointer"
              title={isPlaying ? copy.controls.pause : copy.controls.play}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px] font-mono">{copy.controls.pause}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline text-[11px] font-mono">{copy.controls.play}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition-all shadow-sm cursor-pointer ml-1"
            >
              <span>{copy.controls.skip}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Act Navigation Scrubber Bar */}
        <div className="grid grid-cols-3 bg-slate-950/60 border-b border-slate-800 text-xs font-mono">
          <button
            onClick={() => goToAct(1)}
            className={`px-3 py-2 text-left transition-all border-b-2 cursor-pointer flex flex-col gap-1 ${
              currentAct === 1
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
              <span className="font-semibold truncate">{copy.acts.act1Tab}</span>
              {currentAct === 1 && <span className="text-amber-400 text-[10px]">CURRENT</span>}
            </div>
            {/* Progress segment */}
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full transition-all duration-75"
                style={{ width: currentAct === 1 ? `${actProgress}%` : currentAct > 1 ? '100%' : '0%' }}
              />
            </div>
          </button>

          <button
            onClick={() => goToAct(2)}
            className={`px-3 py-2 text-left transition-all border-b-2 cursor-pointer flex flex-col gap-1 ${
              currentAct === 2
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
              <span className="font-semibold truncate">{copy.acts.act2Tab}</span>
              {currentAct === 2 && <span className="text-cyan-400 text-[10px]">CURRENT</span>}
            </div>
            {/* Progress segment */}
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-400 h-full transition-all duration-75"
                style={{ width: currentAct === 2 ? `${actProgress}%` : currentAct > 2 ? '100%' : '0%' }}
              />
            </div>
          </button>

          <button
            onClick={() => goToAct(3)}
            className={`px-3 py-2 text-left transition-all border-b-2 cursor-pointer flex flex-col gap-1 ${
              currentAct === 3
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
              <span className="font-semibold truncate">{copy.acts.act3Tab}</span>
              {currentAct === 3 && <span className="text-emerald-400 text-[10px]">REVEALED</span>}
            </div>
            {/* Progress segment */}
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full transition-all duration-75"
                style={{ width: currentAct === 3 ? `${actProgress}%` : '0%' }}
              />
            </div>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-8 lg:p-10 min-h-[380px] sm:min-h-[460px] flex flex-col justify-between">
          
          {/* ACT 1: THE MANUAL MSME DILEMMA */}
          {currentAct === 1 && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              <div className="space-y-2 sm:space-y-3">
                <div className="inline-flex items-center space-x-2 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-full text-[11px] font-mono text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{copy.phase1.actBadge}</span>
                </div>
                <h2 id="entry-scene-title" className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  {copy.phase1.headline}
                </h2>
                <p className="text-sm sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
                  {copy.phase1.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 italic">
                  "{copy.phase1.narration}"
                </p>
              </div>

              {/* 4 Floating Document Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
                {copy.phase1.cards.map((doc: DocCard, idx: number) => (
                  <div 
                    key={idx}
                    className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 sm:p-4 space-y-2 hover:border-slate-600 transition-all shadow-md relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-md bg-slate-700 text-slate-300">
                        <FileText className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        idx === 1 
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800' 
                          : idx === 0 
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800' 
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {doc.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400">{doc.subtitle}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-baseline justify-between">
                      <span className="text-base sm:text-lg font-bold font-mono text-cyan-300">{doc.value}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{doc.note}</p>
                  </div>
                ))}
              </div>

              {/* Discrepancy Highlight */}
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center space-x-2 text-amber-300">
                  <TrendingDown className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">{copy.phase1.metricTag}</span>
                </div>
                <button
                  onClick={() => goToAct(2)}
                  className="inline-flex items-center space-x-1.5 text-cyan-300 hover:text-cyan-200 cursor-pointer text-xs underline font-sans"
                >
                  <span>See How Verifin Solves This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ACT 2: VECTOR INTELLIGENCE & AGENT WAVES */}
          {currentAct === 2 && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              <div className="space-y-2 sm:space-y-3">
                <div className="inline-flex items-center space-x-2 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-full text-[11px] font-mono text-cyan-300">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{copy.phase2.actBadge}</span>
                </div>
                <h2 id="entry-scene-title" className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  {copy.phase2.headline}
                </h2>
                <p className="text-sm sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
                  {copy.phase2.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 italic">
                  "{copy.phase2.narration}"
                </p>
              </div>

              {/* Parallel Agent Mesh Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2">
                {copy.phase2.nodes.map((node: MeshNode, idx: number) => (
                  <div 
                    key={idx}
                    className="bg-slate-800/90 border border-slate-700 hover:border-cyan-500/50 rounded-xl p-3 sm:p-4 space-y-2 transition-all relative overflow-hidden group shadow-lg"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                        {node.wave}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        {node.tag}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{node.name}</h4>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {node.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Wave Concurrency Benchmark Tag */}
              <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center space-x-2 text-cyan-300">
                  <GitFork className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold">{copy.phase2.benchmarkTag}</span>
                </div>
                <button
                  onClick={() => goToAct(3)}
                  className="inline-flex items-center space-x-1.5 text-emerald-300 hover:text-emerald-200 cursor-pointer text-xs underline font-sans"
                >
                  <span>Reveal Verifin Title & Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ACT 3: THE SOLUTION REVEALED */}
          {currentAct === 3 && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              {/* Header Title Resolution */}
              <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
                <div className="inline-flex items-center space-x-2 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full text-[11px] font-mono text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{copy.phase3.actBadge}</span>
                </div>

                <div className="space-y-1">
                  <h1 id="entry-scene-title" className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
                    <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                      {copy.phase3.brandTitle}
                    </span>
                  </h1>
                  <p className="text-xl sm:text-3xl font-bold text-cyan-300 tracking-tight">
                    {copy.phase3.tagline}
                  </p>
                </div>

                <p className="text-sm sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
                  {copy.phase3.subheadline}. {copy.phase3.description}
                </p>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {copy.phase3.pillars.map((pillar: PillarItem, idx: number) => (
                  <div 
                    key={idx}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 sm:p-4 space-y-1.5 shadow-md hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{pillar.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {pillar.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Sharma Summary Banner */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 sm:p-4 text-xs font-mono text-slate-300 flex items-center space-x-2.5">
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="line-clamp-2">{copy.phase3.sharmaSummary}</span>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <button
                onClick={() => goToAct(1)}
                className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer py-1 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{copy.controls.replay}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {onOpenAgentTheatre && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAgentTheatre();
                  }}
                  className="inline-flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{copy.controls.watchTheatre}</span>
                </button>
              )}

              {onExploreCase && (
                <button
                  onClick={() => {
                    onClose();
                    onExploreCase('case_sharma_traders');
                  }}
                  className="inline-flex items-center justify-center space-x-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{copy.controls.exploreSharma}</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="inline-flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-98 cursor-pointer w-full sm:w-auto"
              >
                <span>{copy.controls.enterPlatform}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
