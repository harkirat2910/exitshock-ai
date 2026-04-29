import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldAlert, RotateCcw, Users, DollarSign, AlertTriangle, CheckCircle, Skull } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils';

/* ── transition risk label ───────────────────────────── */
function getTransitionRisk(score) {
  if (score >= 80) return { label: 'Severe', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  if (score >= 60) return { label: 'High', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
  return { label: 'Contained', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
}

/* ── stat card — Claymorphism ────────────────────────── */
function StatCard({ icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.03 }}
      className="clay rounded-xl p-4 cursor-default group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-text-muted group-hover:text-amber-400/70 transition-colors">{icon}</span>
        <p className="text-xs text-text-secondary uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-xl md:text-2xl font-black font-mono ${color}`}>{value}</p>
    </motion.div>
  );
}

/* ── replacement row — Glassmorphism ─────────────────── */
function ReplacementRow({ vendor, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.4 + index * 0.07 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 glass rounded-xl px-4 py-3 group cursor-default"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:shadow-[0_0_10px_rgba(52,211,153,0.2)] transition-shadow">
        <span className="text-xs font-bold text-emerald-400">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text truncate">{vendor.name}</p>
        <p className="text-xs text-text-muted">
          {vendor.years_active} yr{vendor.years_active !== 1 ? 's' : ''} active · {formatCurrency(vendor.past_spend)} historical spend
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-bold font-mono text-emerald-400">{vendor.replacement_fit_score}%</p>
        <p className="text-[10px] text-text-muted uppercase tracking-wide">Fit</p>
      </div>
    </motion.div>
  );
}

/* ── main component ──────────────────────────────────── */
export default function ExitSimulator({ selectedCase }) {
  const [hasSimulated, setHasSimulated] = useState(false);
  const [isBlasting, setIsBlasting] = useState(false);

  if (!selectedCase) return null;

  const risk = getTransitionRisk(selectedCase.fragility_score);
  const replacements = selectedCase.replacement_vendors ?? [];

  const handleSimulate = () => {
    setIsBlasting(true);
    setTimeout(() => {
      setIsBlasting(false);
      setHasSimulated(true);
    }, 600);
  };
  const handleReset = () => setHasSimulated(false);

  return (
    <div className="glass rounded-2xl overflow-hidden relative">
      {/* Blast flash overlay */}
      <AnimatePresence>
        {isBlasting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 bg-gradient-to-br from-red-500/30 via-amber-500/20 to-transparent pointer-events-none rounded-2xl"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!hasSimulated ? (
          /* ── pre-simulation — calm state ────────────── */
          <motion.div
            key="pre"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-8 flex flex-col md:flex-row items-center gap-8 relative aurora-bg"
          >
            {/* Floating status indicator */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"
                />
                <p className="text-sm text-emerald-400 font-medium">Vendor currently active in observed procurement market.</p>
              </div>
              <p className="text-text-secondary text-sm mt-1">
                Simulating exit for <span className="font-semibold text-text">{selectedCase.vendor}</span> from{' '}
                <span className="font-semibold text-text">{selectedCase.ministry}</span>.
              </p>
              <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
                <Skull className="w-3 h-3" />
                This will model the impact of sudden vendor departure on procurement resilience.
              </p>
            </div>

            {/* Neo-Brutalism Simulate Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSimulate}
              disabled={isBlasting}
              className="neo-brutal px-8 py-4 bg-gradient-to-r from-red-600 to-amber-500 text-white font-black rounded-xl flex items-center gap-3 cursor-pointer flex-shrink-0 uppercase tracking-wider text-sm disabled:opacity-50"
            >
              <Zap className="w-5 h-5" />
              {isBlasting ? 'Detonating...' : 'Simulate Exit'}
            </motion.button>
          </motion.div>
        ) : (
          /* ── post-simulation results ────────────────── */
          <motion.div
            key="post"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 relative"
          >
            {/* Red alert aurora */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-red-500/8 blur-[80px] pointer-events-none" />

            {/* header banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between gap-4 mb-8"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="p-2.5 glass rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  <ShieldAlert className="w-6 h-6 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-black text-red-400 uppercase tracking-wider">Exit Shock Detected</h3>
                  <p className="text-xs text-text-muted">Simulated departure of {selectedCase.vendor}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary glass rounded-xl hover:text-text transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </motion.button>
            </motion.div>

            {/* stat grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                icon={<DollarSign className="w-4 h-4" />}
                label="Spend Exposed"
                value={formatCurrency(selectedCase.vendor_spend)}
                color="text-red-400"
                delay={0.15}
              />
              <StatCard
                icon={<Users className="w-4 h-4" />}
                label="Replacement Vendors"
                value={selectedCase.replacement_vendor_count}
                color={selectedCase.replacement_vendor_count === 0 ? 'text-red-400' : 'text-emerald-400'}
                delay={0.25}
              />
              <StatCard
                icon={<AlertTriangle className="w-4 h-4" />}
                label="Transition Risk"
                value={risk.label}
                color={risk.color}
                delay={0.35}
              />
            </div>

            {/* recommended action — glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex items-start gap-3 p-4 glass rounded-xl mb-8"
              style={{ borderColor: 'rgba(251,191,36,0.15)' }}
            >
              <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-400 mb-0.5">Recommended Action</p>
                <p className="text-sm text-text-secondary">
                  Run a market test before renewal and identify backup suppliers.
                </p>
              </div>
            </motion.div>

            {/* replacement vendors list */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Potential Replacement Vendors
              </h4>

              {replacements.length > 0 ? (
                <div className="space-y-2">
                  {replacements.map((v, i) => (
                    <ReplacementRow key={v.name} vendor={v} index={i} />
                  ))}
                </div>
              ) : (
                <div className="p-4 glass rounded-xl text-center">
                  <p className="text-sm text-text-muted">
                    No recent alternative vendors met the activity threshold.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
