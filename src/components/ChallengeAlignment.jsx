import { motion } from 'framer-motion';
import { Target, Users, FileSearch, BrainCircuit } from 'lucide-react';

const CHALLENGES = [
  {
    icon: Users,
    title: 'Vendor Concentration',
    description:
      'Measures whether a small number of vendors receive a disproportionate share of ministry procurement spend.',
    signals: ['Vendor share', 'HHI', 'Active vendor count', 'Replacement scarcity'],
    color: 'amber',
  },
  {
    icon: FileSearch,
    title: 'Sole Source & Procurement Dependency',
    description:
      'Surfaces vendor relationships where sole-source exposure and repeat dependency may deserve review.',
    signals: ['Sole-source share', 'Permitted-situation examples', 'Service-level sole-source exposure'],
    color: 'cyan',
  },
  {
    icon: BrainCircuit,
    title: 'Contract Intelligence',
    description:
      'Turns procurement records into decision-ready insight by showing where government may be getting less competition over time.',
    signals: ['Timeline trends', 'Tipping point detection', 'Backtest evidence', 'Exit simulation'],
    color: 'emerald',
  },
];

const COLOR_MAP = {
  amber: { border: 'border-amber-500/30', icon: 'text-amber-400', dot: 'bg-amber-400', glow: 'from-amber-500/10' },
  cyan: { border: 'border-cyan-500/30', icon: 'text-cyan-400', dot: 'bg-cyan-400', glow: 'from-cyan-500/10' },
  emerald: { border: 'border-emerald-500/30', icon: 'text-emerald-400', dot: 'bg-emerald-400', glow: 'from-emerald-500/10' },
};

export default function ChallengeAlignment() {
  return (
    <div className="space-y-8">
      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {CHALLENGES.map((ch, i) => {
          const c = COLOR_MAP[ch.color];
          const Icon = ch.icon;
          return (
            <motion.div
              key={ch.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className={`bg-surface-alt border ${c.border} rounded-xl p-5 flex flex-col`}
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.glow} to-transparent border ${c.border} flex items-center justify-center mb-4`}>
                <Icon className={`w-4.5 h-4.5 ${c.icon}`} />
              </div>
              <h3 className="text-sm font-bold text-text mb-2">{ch.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4 flex-1">{ch.description}</p>
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium">Signals</p>
                {ch.signals.map(s => (
                  <div key={s} className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
                    {s}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Closing statement */}
      <p className="text-sm text-text-secondary leading-relaxed text-center max-w-3xl mx-auto border-t border-border pt-6">
        ExitShock reframes these challenges into one decision question:{' '}
        <span className="text-text font-medium">what breaks if a key supplier disappears tomorrow?</span>
      </p>
    </div>
  );
}
