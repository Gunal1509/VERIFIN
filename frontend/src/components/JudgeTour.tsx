import React, { useState, useEffect, useRef } from 'react';
import { Zap, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { microcopy } from '../copy/microcopy';

const STEP_DURATION_MS = 5000;

export const JudgeTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = microcopy.judgeTour.steps;

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  const startTimers = (currentStep: number) => {
    clearTimers();
    setProgress(0);

    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + (100 / (STEP_DURATION_MS / 50));
      });
    }, 50);

    intervalRef.current = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        const nextStep = currentStep + 1;
        setStep(nextStep);
        startTimers(nextStep);
      } else {
        setProgress(100);
      }
    }, STEP_DURATION_MS) as unknown as ReturnType<typeof setInterval>;
  };

  const handleOpen = () => {
    setIsOpen(true);
    setStep(0);
    startTimers(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    clearTimers();
    setStep(0);
    setProgress(0);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      const next = step + 1;
      setStep(next);
      startTimers(next);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const prev = step - 1;
      setStep(prev);
      startTimers(prev);
    }
  };

  const handleStepClick = (i: number) => {
    setStep(i);
    startTimers(i);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const current = steps[step];

  return (
    <>
      {/* Floating Pill */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label={microcopy.judgeTour.pillLabel}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold px-4 py-3 rounded-full shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 print:hidden"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>{microcopy.judgeTour.pillLabel}</span>
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm print:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={microcopy.judgeTour.modalTitle}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-950 to-brand-800 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-300" />
                <span className="text-white font-bold text-sm">{microcopy.judgeTour.modalTitle}</span>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close tour"
                className="text-slate-400 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex px-5 pt-4 gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleStepClick(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={`flex-1 h-1 rounded-full transition-all duration-300 focus:outline-none ${
                    i < step
                      ? 'bg-brand-600'
                      : i === step
                      ? 'bg-brand-900'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="px-5 pt-2">
              <div className="h-0.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-none rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="px-5 py-6 space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{current.icon}</span>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-brand-600 uppercase tracking-wider">
                    Step {step + 1} of {steps.length}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {current.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {current.body}
                  </p>
                </div>
              </div>

              {/* Highlight Metric */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                  {current.metricLabel}
                </span>
                <span className="text-lg font-extrabold text-brand-900 font-mono">
                  {current.metricValue}
                </span>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="px-5 pb-5 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={step === 0}
                aria-label="Previous step"
                className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 rounded px-2 py-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {step < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <span>{microcopy.judgeTour.doneLabel}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
