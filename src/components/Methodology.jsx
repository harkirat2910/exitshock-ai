import { motion } from 'framer-motion';
import { Info, Scale, Building2, FileCheck, Users, CalendarClock, TrendingDown, ShieldAlert } from 'lucide-react';

/* ── score components data ───────────────────────────── */
const SCORE_COMPONENTS = [
  {
    icon: <Scale className="w-5 h-5" />,
    title: 'Vendor Dominance',
    weight: 30,
    description:
      "How much of a ministry's recent spending goes to a single vendor. When one supplier captures a large share, the ministry has fewer options if that vendor exits.",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: 'Market Concentration (HHI)',
    weight: 25,
    description:
      'The Herfindahl-Hirschman Index measures whether ministry spending is spread across many vendors or concentrated in a few. Values above 2,500 signal a highly concentrated market.',
  },
  {
    icon: <FileCheck className="w-5 h-5" />,
    title: 'Sole-Source Reliance',
    weight: 20,
    description:
      'The share of contracts awarded without a competitive process. High sole-source rates can limit visibility into alternative pricing and capacity.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Replacement Scarcity',
    weight: 15,
    description:
      'How many other vendors have recently delivered similar services to the same ministry. Fewer alternatives mean longer recovery times after a vendor departure.',
  },
  {
    icon: <CalendarClock className="w-5 h-5" />,
    title: 'Incumbency',
    weight: 10,
    description:
      'How many consecutive years a vendor has been present. Long incumbency can reflect deep integration that makes transition more complex and costly.',
  },
  {
    icon: <TrendingDown className="w-5 h-5" />,
    title: 'Competition Decline',
    weight: null,
    description:
      'Tracked via Tipping Point analysis — years where vendor pools shrank, concentration spiked, or sole-source rates rose sharply. These structural shifts inform overall risk context.',
  },
];

/* ── risk level thresholds ───────────────────────────── */
const RISK_LEVELS = [
  { range: '80–100', label: 'Critical', color: 'bg-red-500', textColor: 'text-red-400', glow: 'rgba(239,68,68,0.15)', description: 'Immediate review recommended. Single-point-of-failure risk.' },
  { range: '60–79', label: 'High', color: 'bg-amber-500', textColor: 'text-amber-400', glow: 'rgba(245,158,11,0.12)', description: 'Significant concentration. Contingency planning warranted.' },
  { range: '40–59', label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-400', glow: 'rgba(234,179,8,0.1)', description: 'Moderate risk. Monitoring and diversification advised.' },
  { range: '0–39', label: 'Low', color: 'bg-emerald-500', textColor: 'text-emerald-400', glow: 'rgba(16,185,129,0.1)', description: 'Healthy vendor distribution. Standard oversight.' },
];

/* ── component card — Glassmorphism + micro-interactions ── */
function ComponentCard({ component, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="group glass rounded-xl p-5 cursor-default hover:shadow-[0_4px_25px_rgba(0,0,0,0.2)] transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          className="flex-shrink-0 p-2.5 clay rounded-xl text-amber-400 group-hover:text-amber-300 transition-colors"
        >
          {component.icon}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h4 className="text-sm font-bold text-text">{component.title}</h4>
            {component.weight != null && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full neu-inset text-amber-400">
                {component.weight}%
              </span>
            )}
            {component.weight == null && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full glass-subtle text-text-secondary">
                Context
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{component.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── main component ──────────────────────────────────── */
export default function Methodology() {
  return (
    <div className="space-y-10">
      {/* model card header — Clay + glass */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 clay border-b border-white/[0.03] flex items-center gap-3">
          <Info className="w-4 h-4 text-text-secondary" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Model Card — Procurement Fragility Score</span>
        </div>

        <div className="p-6 md:p-8">
          <h3 className="text-lg font-bold text-text mb-3">What is the Fragility Score?</h3>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            The Procurement Fragility Score (0–100) measures how dependent a ministry is on a
            specific vendor. It asks a simple question:{' '}
            <span className="text-text font-medium italic">
              "If this vendor disappeared tomorrow, how difficult would it be to maintain services?"
            </span>{' '}
            Higher scores indicate greater dependency and more difficult transitions. The score
            combines six observable signals from public procurement records.
          </p>
        </div>
      </motion.div>

      {/* score components — Bento Grid */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-6 h-px bg-gradient-to-r from-transparent to-slate-700" />
          Score Components
          <span className="w-6 h-px bg-gradient-to-l from-transparent to-slate-700" />
        </h3>

        {/* weight bar — Neumorphic container */}
        <div className="mb-6 rounded-full overflow-hidden h-2.5 flex neu-inset">
          {SCORE_COMPONENTS.filter(c => c.weight != null).map((c, i) => {
            const colors = ['bg-amber-500', 'bg-amber-600', 'bg-yellow-500', 'bg-emerald-500', 'bg-sky-500'];
            return (
              <motion.div
                key={i}
                initial={{ width: 0 }}
                animate={{ width: `${c.weight}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                className={`${colors[i]} h-full`}
                title={`${c.title}: ${c.weight}%`}
              />
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {SCORE_COMPONENTS.map((c, i) => (
            <ComponentCard key={i} component={c} index={i} />
          ))}
        </div>
      </div>

      {/* risk levels — Bento grid with glow accents */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-6 h-px bg-gradient-to-r from-transparent to-slate-700" />
          Risk Classification
          <span className="w-6 h-px bg-gradient-to-l from-transparent to-slate-700" />
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RISK_LEVELS.map((level, i) => (
            <motion.div
              key={level.label}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="glass rounded-xl p-4 cursor-default"
              style={{ boxShadow: `0 0 0 0 transparent` }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 + i }}
                  className={`w-2.5 h-2.5 rounded-full ${level.color}`}
                  style={{ boxShadow: `0 0 10px ${level.glow}` }}
                />
                <span className={`text-sm font-bold ${level.textColor}`}>{level.label}</span>
                <span className="text-xs font-mono text-text-muted ml-auto">{level.range}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{level.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* disclaimer — Glassmorphism */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-start gap-3 p-5 glass rounded-2xl"
      >
        <ShieldAlert className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-text-secondary mb-1">Transparency Notice</p>
          <p className="text-sm text-text-secondary leading-relaxed">
            ExitShock does not allege wrongdoing. It surfaces procurement fragility signals that may
            deserve review. All scores are derived from publicly available government procurement
            records and reflect observed patterns — not conclusions about vendor performance or
            integrity.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
