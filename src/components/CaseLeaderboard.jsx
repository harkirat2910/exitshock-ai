import { motion } from 'framer-motion';
import { ShieldAlert, Users, BarChart3 } from 'lucide-react';
import { formatCurrency, formatPercent, getRiskColor } from '../utils';

const scoreGradient = (score) => {
  if (score >= 80) return 'from-red-600 to-red-500';
  if (score >= 60) return 'from-amber-600 to-amber-400';
  return 'from-emerald-600 to-emerald-400';
};

const scoreGlow = (score) => {
  if (score >= 80) return '0 0 15px rgba(239,68,68,0.4)';
  if (score >= 60) return '0 0 15px rgba(245,158,11,0.3)';
  return '0 0 15px rgba(16,185,129,0.3)';
};

export default function CaseLeaderboard({ cases, selectedCase, onSelectCase }) {
  const top10 = cases
    .slice()
    .sort((a, b) => b.fragility_score - a.fragility_score)
    .slice(0, 10);

  if (!top10.length) return null;

  return (
    <div className="mt-6 space-y-2">
      {top10.map((c, i) => {
        const isSelected = selectedCase?.case_id === c.case_id;

        return (
          <motion.button
            key={c.case_id}
            onClick={() => onSelectCase(c)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            whileHover={{ x: 4, scale: 1.005 }}
            whileTap={{ scale: 0.998 }}
            className={`w-full text-left rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden group ${
              isSelected
                ? 'glass shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                : 'glass-subtle hover:glass'
            }`}
          >
            {/* Active indicator bar */}
            {isSelected && (
              <motion.div
                layoutId="leaderboard-active"
                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-red-500 rounded-r-full shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}

            {/* Hover gradient sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/[0.03] to-amber-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

            {/* ── top row: rank, name, score badge ── */}
            <div className="flex items-center justify-between gap-4 p-4 md:p-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg neu-inset flex items-center justify-center font-mono font-bold text-sm text-text-secondary">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text truncate group-hover:text-amber-50 transition-colors">{c.vendor}</p>
                  <p className="text-sm text-text-muted truncate">{c.ministry}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* fragility score pill — neumorphic */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 3 }}
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${scoreGradient(c.fragility_score)} flex items-center justify-center`}
                  style={{ boxShadow: scoreGlow(c.fragility_score) }}
                >
                  <span className="text-sm font-black text-white drop-shadow-lg">{c.fragility_score}</span>
                </motion.div>
                {/* risk badge */}
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRiskColor(c.risk_level)}`}
                >
                  {c.risk_level}
                </span>
              </div>
            </div>

            {/* ── stats strip ── */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 pb-4 md:px-5 md:pb-5 text-xs text-text-secondary">
              <Stat label="Vendor Share" value={formatPercent(c.vendor_share)} />
              <Stat label="HHI" value={c.hhi.toLocaleString()} icon={<BarChart3 className="w-3 h-3" />} />
              <Stat label="Replacements" value={c.replacement_vendor_count} icon={<Users className="w-3 h-3" />} />
              <Stat label="Spend" value={formatCurrency(c.vendor_spend)} />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <span className="flex items-center gap-1">
      {icon}
      <span className="text-text-muted">{label}</span>{' '}
      <span className="font-mono font-semibold text-text-secondary">{value}</span>
    </span>
  );
}
