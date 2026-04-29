import { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';

/* ── Demo flow steps ─────────────────────────────────── */
const DEMO_STEPS = [
  { num: 1, label: 'Scale', note: 'We analyzed over $27 billion in Alberta procurement — here is the dataset scope.' },
  { num: 2, label: 'Discovery', note: 'Eight executive metrics surface the highest-risk patterns across 100 vendor cases.' },
  { num: 3, label: 'Case File', note: 'Each vendor gets a forensic dossier showing dominance, sole-source exposure, and evidence signals.' },
  { num: 4, label: 'Tipping Point', note: 'We track the exact fiscal year when competition stopped behaving like competition.' },
  { num: 5, label: 'Stress Test', note: 'Now we remove the vendor and see exposed spend, replacement scarcity, and recommended procurement action.' },
  { num: 6, label: 'AI Analyst', note: 'AI generates a risk brief, evidence check, and review questions grounded in observed data.' },
  { num: 7, label: 'Validation', note: 'Backtests confirm — when vendors disappeared historically, markets concentrated further.' },
  { num: 8, label: 'Model Card', note: 'Full transparency: six score components, thresholds, limitations, and disclaimers.' },
];

/* ── Context ─────────────────────────────────────────── */
const DemoModeContext = createContext({ active: false });

export function useDemoMode() {
  return useContext(DemoModeContext);
}

/* ── Provider ────────────────────────────────────────── */
export function DemoModeProvider({ children }) {
  const [active, setActive] = useState(false);

  return (
    <DemoModeContext.Provider value={{ active, setActive }}>
      {children}
    </DemoModeContext.Provider>
  );
}

/* ── Floating Toggle Button ──────────────────────────── */
export function DemoModeToggle() {
  const { active, setActive } = useDemoMode();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => setActive(!active)}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold shadow-lg transition-colors border backdrop-blur-sm cursor-pointer ${
        active
          ? 'bg-accent/10 border-accent/30 text-accent shadow-accent/10'
          : 'bg-white/90 border-border text-text-secondary hover:text-text hover:border-accent/30'
      }`}
    >
      {active ? <X className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      {active ? 'Exit Demo' : 'Demo Mode'}
    </motion.button>
  );
}

/* ── Section Badge ───────────────────────────────────── */
export function DemoBadge({ step }) {
  const { active } = useDemoMode();
  if (!active) return null;

  const info = DEMO_STEPS[step - 1];
  if (!info) return null;

  return (
    <AnimatePresence>
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="inline-flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent"
      >
        <span className="w-4 h-4 rounded-full bg-accent/15 flex items-center justify-center text-[9px] font-black">
          {info.num}
        </span>
        {info.label}
      </motion.span>
    </AnimatePresence>
  );
}

/* ── Presenter Note ──────────────────────────────────── */
export function DemoNote({ step }) {
  const { active } = useDemoMode();
  if (!active) return null;

  const info = DEMO_STEPS[step - 1];
  if (!info) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-4"
      >
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-accent/[0.05] border border-accent/15">
          <span className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] font-black text-accent flex-shrink-0">
            {info.num}
          </span>
          <p className="text-xs text-text-secondary leading-relaxed italic">
            "{info.note}"
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
