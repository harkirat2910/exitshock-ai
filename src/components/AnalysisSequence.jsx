import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  { text: 'Scanning procurement records', icon: '📊' },
  { text: 'Cross-referencing vendor dependencies', icon: '🔗' },
  { text: 'Analyzing sole-source exposure', icon: '🔍' },
  { text: 'Detecting competition tipping points', icon: '📉' },
  { text: 'Generating fragility assessment', icon: '⚡' },
];

const STEP_DURATION = 320; // ms per step

export default function AnalysisSequence({ onComplete, vendorName }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentStep < STEPS.length) {
      const timer = setTimeout(() => setCurrentStep(s => s + 1), STEP_DURATION);
      return () => clearTimeout(timer);
    } else if (!done) {
      const timer = setTimeout(() => {
        setDone(true);
        onComplete?.();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStep, done, onComplete]);

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-alt border border-border rounded-xl p-8 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-bold text-text">Analyzing Vendor Risk</p>
          <p className="text-xs text-text-muted truncate max-w-[240px]">{vendorName}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-border rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2.5">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isComplete = i < currentStep;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isComplete || isActive ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isActive ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>
              <span className={`text-xs ${isComplete ? 'text-text-secondary' : isActive ? 'text-text font-medium' : 'text-text-muted'}`}>
                {step.text}...
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
