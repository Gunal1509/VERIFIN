import React, { useRef, useState } from 'react';
import { 
  RotateCcw, 
  Download, 
  Video,
  PlayCircle,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';

interface Chapter {
  id: string;
  timeSec: number;
  title: string;
  summary: string;
}

const MOTION_CHAPTERS: Chapter[] = [
  { id: '1', timeSec: 0, title: '1. Animated Document Streaming & Ingestion', summary: 'GSTR-3B, Bank e-statements, and KYC PDFs fly into the intake sandbox with moving laser scanlines.' },
  { id: '2', timeSec: 24, title: '2. Trust Gate Comparator & 70% Gap', summary: 'Dynamic comparison bars contrast ₹4.0 Cr GST sales vs ₹1.2 Cr bank credits. Grade C stamped.' },
  { id: '3', timeSec: 49, title: '3. Concurrent Wave Concurrency (asyncio)', summary: 'Parallel streams branch simultaneously to Cash Flow Agent and Forensic Fraud Agent.' },
  { id: '4', timeSec: 71, title: '4. Forensic NetworkX Circular Money Loop', summary: 'Animated money packets travel between Sharma -> Verma -> Gupta. Directed cycle closed in 6 days.' },
  { id: '5', timeSec: 96, title: '5. Incremental Re-Plan Ripple & Resizing', summary: 'Electricity bills uploaded: upstream stages cached (0ms), loan sizing animates live from ₹45L to ₹66L.' },
  { id: '6', timeSec: 120, title: '6. Officer Approval & Zero-Disbursal Lock', summary: 'Priya Sharma approves to SANCTIONED in ledger. Physical zero-disbursal invariant verified.' },
];

const PRESENTATION_CHAPTERS: Chapter[] = [
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
  const [selectedVideo, setSelectedVideo] = useState<'motion' | 'presentation'>('motion');
  const [currentTime, setCurrentTime] = useState<number>(0);

  const activeChapters = selectedVideo === 'motion' ? MOTION_CHAPTERS : PRESENTATION_CHAPTERS;
  const videoSrc = selectedVideo === 'motion' ? '/prototype_motion_video.mp4' : '/demo_video.mp4';
  const downloadName = selectedVideo === 'motion' ? 'msme_copilot_prototype_walkthrough.mp4' : 'msme_underwriting_copilot_demo.mp4';

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
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header and Video Switcher */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Video Showcase: Prototype Walkthrough & Pitch
            </h2>
            <span className="bg-brand-100 text-brand-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              30 FPS Motion Graphics &bull; 1080p Full HD
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time animated file transfers, concurrent agent wave execution, and forensic fraud cycle isolation.
          </p>
        </div>

        {/* Video Mode Selector & Download Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => { setSelectedVideo('motion'); setCurrentTime(0); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                selectedVideo === 'motion' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>30 FPS Animated Motion Video</span>
            </button>
            <button
              onClick={() => { setSelectedVideo('presentation'); setCurrentTime(0); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                selectedVideo === 'presentation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
              <span>Pitch Deck Walkthrough</span>
            </button>
          </div>

          <a
            href={videoSrc}
            download={downloadName}
            className="flex items-center space-x-2 px-3.5 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download MP4</span>
          </a>

          <a
            href="/msme_underwriting_copilot_presentation.pptx"
            download="msme_underwriting_copilot_presentation.pptx"
            className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Presentation className="w-4 h-4" />
            <span>Download PPTX Deck</span>
          </a>
        </div>
      </div>

      {/* Video Player + Chapters Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Player Container */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col justify-between">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              key={videoSrc}
              ref={videoRef}
              src={videoSrc}
              controls
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Player Info Bar */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                {selectedVideo === 'motion' 
                  ? '30 FPS Motion Video: Real-time file transfers & circular loop animation' 
                  : 'Official 3-Minute Slide Presentation with voiceover'}
              </span>
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
                <span>
                  {selectedVideo === 'motion' ? 'Motion Chapters (6 Stages)' : 'Pitch Chapters (8 Scenes)'}
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">Click to seek</span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {activeChapters.map((ch, idx) => {
                const nextChapter = activeChapters[idx + 1];
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
