import React, { useRef, useState } from 'react';
import { 
  RotateCcw, 
  Download, 
  Video
} from 'lucide-react';

interface Chapter {
  id: string;
  timeSec: number;
  title: string;
  summary: string;
}

const CHAPTERS: Chapter[] = [
  { id: '1', timeSec: 0, title: '1. Introduction & The Core Problem', summary: 'Inflated turnover fraud in MSME underwriting & forward-deployed copilot solution.' },
  { id: '2', timeSec: 27, title: '2. Case Study: Sharma Traders', summary: 'GST ₹4.0 Cr vs Bank ₹1.2 Cr (70% gap) flagged as Grade C.' },
  { id: '3', timeSec: 54, title: '3. Adaptive Parallel Agent Workflow', summary: 'Concurrent waves (Intake + Bureau, Cash Flow + Fraud) running side by side.' },
  { id: '4', timeSec: 83, title: '4. Forensic Entity & Circular Trading Graph', summary: 'Directed cycle detection (Sharma-Verma-Gupta) and outside-world test.' },
  { id: '5', timeSec: 107, title: '5. Deterministic Loan Sizing & Evidence Ladder', summary: 'Plain Python math: ₹45 Lakh initial sizing and roadmap to ₹66 Lakh.' },
  { id: '6', timeSec: 134, title: '6. Incremental Re-Planning Live', summary: 'BSES electricity bills uploaded: 3 stages rerun, 6 stages reused (66.7% compute saved).' },
  { id: '7', timeSec: 161, title: '7. Policy Pack Engine & Injection Defense', summary: 'One-click YAML policy switcher and adversarial document prompt neutralization.' },
  { id: '8', timeSec: 186, title: '8. Human-in-the-Loop Sign-off & Ledger', summary: 'Credit officer final approval and cryptographic guarantee of zero disbursal endpoint.' },
];

export const DemoVideoScreen: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              3-Minute Prototype Pitch & Demo Video
            </h2>
            <span className="bg-brand-100 text-brand-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              1080p HD &bull; Audio Narration
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Official walkthrough matching Section 14 of the specification for Virtusa Jatayu Season 6.
          </p>
        </div>

        <a
          href="/demo_video.mp4"
          download="msme_underwriting_copilot_demo.mp4"
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Standalone MP4 (4.4 MB)</span>
        </a>
      </div>

      {/* Video Player + Chapters Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Player Container */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col justify-between">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src="/demo_video.mp4"
              controls
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Quick Player Bar */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>1080p HD 60fps &bull; Synchronized Voiceover</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSeek(0)}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Video</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chapters & Transcript Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Video className="w-3.5 h-3.5 text-brand-600" />
                <span>Video Chapters (3m 33s)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Click to jump</span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {CHAPTERS.map((ch, idx) => {
                const nextChapter = CHAPTERS[idx + 1];
                const isActive = currentTime >= ch.timeSec && (nextChapter ? currentTime < nextChapter.timeSec : true);

                const minutes = Math.floor(ch.timeSec / 60);
                const seconds = ch.timeSec % 60;
                const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSeek(ch.timeSec)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                      isActive
                        ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-400 shadow-xs'
                        : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">{ch.title}</span>
                      <span className="font-mono text-[10px] text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded font-bold">
                        {timeFormatted}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {ch.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Team Code & Cosmos</span>
            <span className="text-emerald-700 font-semibold">Virtusa Jatayu S6</span>
          </div>
        </div>
      </div>
    </div>
  );
};
