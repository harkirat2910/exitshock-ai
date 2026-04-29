import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, X, ShieldOff, TrendingDown, Users } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils';
import { useAppState } from '../context/AppStateContext';

export default function SimulatorImpactModal() {
  const { impactModalOpen, setImpactModalOpen, selectedCase, simulationResult, blastState } = useAppState();

  if (!selectedCase || !simulationResult || blastState !== 'deactivated') return null;

  const difficultyColor = {
    Critical: { text: 'text-red-400', border: 'border-red-500/40', glow: 'rgba(239,68,68,0.3)', bg: 'bg-red-500/10' },
    High: { text: 'text-amber-400', border: 'border-amber-500/40', glow: 'rgba(245,158,11,0.25)', bg: 'bg-amber-500/10' },
    Medium: { text: 'text-yellow-400', border: 'border-yellow-500/30', glow: 'rgba(234,179,8,0.2)', bg: 'bg-yellow-500/10' },
    Low: { text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'rgba(16,185,129,0.2)', bg: 'bg-emerald-500/10' },
  }[simulationResult.difficulty] || { text: 'text-red-400', border: 'border-red-500/40', glow: 'rgba(239,68,68,0.3)', bg: 'bg-red-500/10' };

  return (
    <AnimatePresence>
      {impactModalOpen && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setImpactModalOpen(false)}
          />

          {/* Modal card */}
          <motion.div
            className={`relative w-full max-w-2xl glass rounded-2xl overflow-hidden border ${difficultyColor.border}`}
            style={{ boxShadow: `0 0 60px ${difficultyColor.glow}` }}
            initial={{ scale: 0.85, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            {/* Red aurora */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: difficultyColor.glow }} />

            {/* Close */}
            <button
              onClick={() => setImpactModalOpen(false)}
              className="absolute top-4 right-4 z-10 text-text-muted hover:text-text glass-subtle p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className={`p-6 border-b border-white/[0.06] flex items-center gap-4 ${difficultyColor.bg}`}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.6, repeat: 3 }}
                className={`w-14 h-14 rounded-xl clay flex items-center justify-center`}
              >
                <AlertTriangle className={`w-8 h-8 ${difficultyColor.text} drop-shadow-[0_0_12px_currentColor]`} />
              </motion.div>
              <div>
                <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-[.15em] ${difficultyColor.text}`}>
                  Vendor Exit Impact
                </h2>
                <p className="text-text-muted text-sm tracking-wide mt-0.5">
                  Target Neutralized: <span className="text-text font-bold">{selectedCase.vendor}</span>
                </p>
              </div>
            </div>

            {/* Metrics Grid — Bento */}
            <div className="p-6 md:p-8 grid grid-cols-3 gap-4">
              <MetricCard
                icon={<ShieldOff className="w-4 h-4" />}
                label="Spend Exposed"
                value={formatCurrency(simulationResult.spendExposed)}
                color="text-red-400"
                delay={0.1}
              />
              <MetricCard
                icon={<Users className="w-4 h-4" />}
                label="Replacement Capacity"
                value={formatPercent(simulationResult.replacementCoverage)}
                color="text-emerald-400"
                delay={0.2}
              />
              <MetricCard
                icon={<TrendingDown className="w-4 h-4" />}
                label="Coverage Gap"
                value={formatPercent(simulationResult.coverageGap)}
                color="text-amber-400"
                delay={0.3}
              />
            </div>

            {/* Difficulty badge */}
            <div className="px-6 md:px-8 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Transition Difficulty:</span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className={`text-sm font-black uppercase tracking-wider px-3 py-1 rounded-lg ${difficultyColor.bg} ${difficultyColor.text} border ${difficultyColor.border}`}
                >
                  {simulationResult.difficulty}
                </motion.span>
                <span className="text-[10px] text-text-muted font-mono">
                  {simulationResult.postExitActiveVendors} vendors remain · {simulationResult.effectiveReplacementCount} replacements
                </span>
              </div>
            </div>

            {/* Recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mx-6 md:mx-8 mb-6 md:mb-8 p-4 glass-subtle rounded-xl flex items-start gap-3"
            >
              <Zap className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] uppercase tracking-[.2em] text-sky-400 font-black mb-1">Recommended Action</h4>
                <p className="text-sm text-text-secondary leading-relaxed">{simulationResult.recommendation}</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetricCard({ icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="clay rounded-xl p-4 text-center"
    >
      <div className="flex items-center justify-center gap-1.5 text-text-muted mb-2">
        {icon}
        <p className="text-[9px] uppercase tracking-[.15em] font-bold">{label}</p>
      </div>
      <p className={`text-2xl md:text-3xl font-black font-mono ${color}`}>{value}</p>
    </motion.div>
  );
}
