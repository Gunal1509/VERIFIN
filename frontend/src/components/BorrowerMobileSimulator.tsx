import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Smartphone, MessageCircle, RefreshCw } from 'lucide-react';
import { microcopy } from '../copy/microcopy';

interface BorrowerMobileSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEvidence: () => void;
  hasAppliedEvidence: boolean;
}

type SimPhase = 'chat' | 'uploading' | 'processing' | 'done';

export const BorrowerMobileSimulator: React.FC<BorrowerMobileSimulatorProps> = ({
  isOpen,
  onClose,
  onApplyEvidence,
  hasAppliedEvidence,
}) => {
  const [phase, setPhase] = useState<SimPhase>(hasAppliedEvidence ? 'done' : 'chat');
  const copy = microcopy.borrowerSim;

  const handleUpload = () => {
    if (phase !== 'chat') return;
    setPhase('uploading');
    setTimeout(() => setPhase('processing'), 1800);
    setTimeout(() => {
      setPhase('done');
      onApplyEvidence();
    }, 3800);
  };

  const handleReset = () => {
    setPhase('chat');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Borrower Mobile View"
    >
      <div className="relative w-full max-w-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close mobile simulator"
          className="absolute -top-4 -right-4 z-10 bg-white rounded-full shadow-lg p-1.5 text-slate-500 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Label above phone */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center space-x-2 bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{copy.label}</span>
          </div>
        </div>

        {/* Phone Frame */}
        <div className="bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-700 relative">
          {/* Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-800 rounded-full z-10" />

          {/* Phone Screen */}
          <div className="bg-slate-100 rounded-[2rem] overflow-hidden min-h-[580px] flex flex-col">
            {/* Status bar */}
            <div className="bg-emerald-600 px-4 pt-8 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{copy.contactName}</div>
                  <div className="text-emerald-200 text-[10px]">{copy.contactSubtitle}</div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 bg-[#ECE5DD] px-3 py-4 space-y-3 overflow-y-auto">
              {/* Bank message bubble */}
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2.5 max-w-[85%] shadow-sm">
                  <p className="text-[11px] text-slate-800 leading-relaxed">
                    {copy.bankMessage}
                  </p>
                  <span className="text-[9px] text-slate-400 block text-right mt-1">
                    {copy.bankMessageTime}
                  </span>
                </div>
              </div>

              {/* Bank message 2 */}
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2.5 max-w-[85%] shadow-sm">
                  <p className="text-[11px] text-slate-800 leading-relaxed font-semibold">
                    {copy.bankMessage2}
                  </p>
                  <span className="text-[9px] text-slate-400 block text-right mt-1">
                    {copy.bankMessage2Time}
                  </span>
                </div>
              </div>

              {/* Borrower reply */}
              <div className="flex justify-end">
                <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-none px-3 py-2.5 max-w-[75%] shadow-sm">
                  <p className="text-[11px] text-slate-800">{copy.borrowerReply}</p>
                  <span className="text-[9px] text-slate-400 block text-right mt-1">✓✓</span>
                </div>
              </div>

              {/* Upload area */}
              {phase === 'chat' && (
                <div className="flex justify-start">
                  <button
                    onClick={handleUpload}
                    className="bg-white border-2 border-dashed border-emerald-400 rounded-2xl px-4 py-4 max-w-[90%] w-full text-center shadow-sm hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-emerald-700">{copy.uploadCta}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{copy.uploadSubtext}</p>
                  </button>
                </div>
              )}

              {phase === 'uploading' && (
                <div className="flex justify-end">
                  <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-none px-3 py-2.5 max-w-[80%] shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center text-[10px]">
                        📄
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-800">{copy.fileName}</p>
                        <div className="w-32 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full animate-[progress_1.8s_ease-out_forwards]" style={{ width: '70%' }} />
                        </div>
                        <p className="text-[9px] text-slate-500 mt-0.5">{copy.uploadingLabel}</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 block text-right mt-1">✓</span>
                  </div>
                </div>
              )}

              {phase === 'processing' && (
                <>
                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-none px-3 py-2.5 max-w-[80%] shadow-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">📄</span>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-700">{copy.fileName}</p>
                          <p className="text-[9px] text-slate-500">{copy.uploadedLabel}</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-1">✓✓</span>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2.5 max-w-[85%] shadow-sm">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-3.5 h-3.5 text-brand-600 animate-spin" />
                        <p className="text-[11px] text-slate-600 italic">{copy.processingMsg}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {phase === 'done' && (
                <>
                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-none px-3 py-2.5 max-w-[80%] shadow-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">📄</span>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-700">{copy.fileName}</p>
                          <p className="text-[9px] text-slate-500">{copy.uploadedLabel}</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-1">✓✓</span>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2.5 max-w-[85%] shadow-sm">
                      <div className="flex items-center space-x-1 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <p className="text-[11px] font-bold text-emerald-700">{copy.doneTitle}</p>
                      </div>
                      <p className="text-[11px] text-slate-800 leading-relaxed">
                        {copy.doneMessage}
                      </p>
                      <span className="text-[9px] text-slate-400 block text-right mt-1">
                        {copy.doneTime}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom bar */}
            <div className="bg-white px-3 py-2 border-t border-slate-200 flex items-center space-x-2">
              <div className="flex-1 bg-slate-100 rounded-full px-3 py-1.5 text-[10px] text-slate-400">
                {copy.inputPlaceholder}
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs">
                ↑
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer + reset */}
        <div className="mt-3 text-center space-y-2">
          <p className="text-[10px] text-slate-400">{copy.disclaimer}</p>
          {phase === 'done' && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg inline-block">
                ✓ {copy.backendTriggerNote}
              </span>
              <button
                onClick={handleReset}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
