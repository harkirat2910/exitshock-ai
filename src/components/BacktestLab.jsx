import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

function scoreGradient(score) {
  if (score >= 90) return 'from-red-600 to-red-500';
  if (score >= 75) return 'from-amber-600 to-amber-400';
  return 'from-yellow-600 to-yellow-400';
}

function Badge({ children, color }) {
  const styles = {
    red: 'bg-red-500/15 text-red-400 border-red-500/25',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${styles[color] ?? styles.amber}`}>
      {children}
    </span>
  );
}

function generateInterpretation(bt) {
  const shareText = (bt.share_in_last_active_year * 100).toFixed(1);
  return `In this historical case, the vendor disappeared after representing ${shareText}% of ministry spend. After exit, the supplier market changed from ${bt.vendors_before_exit} vendors to ${bt.vendors_after_exit} vendors and HHI changed from ${bt.hhi_before_exit.toLocaleString()} to ${bt.hhi_after_exit.toLocaleString()}.`;
}

export default function BacktestLab({ backtests }) {
  const sorted = useMemo(() => {
    if (!Array.isArray(backtests) || backtests.length === 0) return [];
    return backtests
      .slice()
      .sort((a, b) => b.observed_exit_shock_score - a.observed_exit_shock_score)
      .slice(0, 15);
  }, [backtests]);

  // Empty state
  if (!sorted.length) {
    return (
      <div className="bg-surface-alt border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <FlaskConical className="w-8 h-8 text-text-muted mb-3" />
        <p className="text-sm text-text-secondary">Backtest data not available in this demo.</p>
        <p className="text-xs text-text-muted mt-1">
          Historical vendor exit validation requires the exitshock_backtests.json dataset.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div>
        <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
          ExitShock compares pre-exit and post-exit market signals to validate whether supplier loss
          can increase procurement fragility.
        </p>
      </div>

      {/* Backtest cards */}
      <div className="space-y-4">
        {sorted.map((bt, i) => {
          const hhiIncreased = bt.hhi_after_exit > bt.hhi_before_exit;
          const poolShrank = bt.vendors_after_exit < bt.vendors_before_exit;
          const ssIncreased = bt.sole_source_after_exit > bt.sole_source_before_exit;

          return (
            <motion.div
              key={bt.backtest_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-surface-alt border border-border rounded-xl p-5 hover:border-accent/30 transition-colors"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text truncate">{bt.vendor}</p>
                  <p className="text-xs text-text-muted">{bt.ministry}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted uppercase tracking-wide">Exit Year</p>
                    <p className="text-sm font-mono font-bold text-text">{bt.exit_year}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${scoreGradient(bt.observed_exit_shock_score)} flex items-center justify-center`}>
                    <span className="text-sm font-black text-white">{bt.observed_exit_shock_score}</span>
                  </div>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
                <MetricCell label="Active" before={bt.vendors_before_exit} after={bt.vendors_after_exit} bad={poolShrank} />
                <MetricCell label="Lifetime Spend" value={formatCurrency(bt.lifetime_spend)} />
                <MetricCell label="HHI" before={bt.hhi_before_exit.toLocaleString()} after={bt.hhi_after_exit.toLocaleString()} bad={hhiIncreased} />
                <MetricCell label="Sole-Source" before={formatPercent(bt.sole_source_before_exit)} after={formatPercent(bt.sole_source_after_exit)} bad={ssIncreased} />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {hhiIncreased && (
                  <Badge color="red"><TrendingUp className="w-3 h-3" /> HHI increased</Badge>
                )}
                {poolShrank && (
                  <Badge color="amber"><TrendingDown className="w-3 h-3" /> Vendor pool shrank</Badge>
                )}
                {ssIncreased && (
                  <Badge color="red"><AlertTriangle className="w-3 h-3" /> Sole-source increased</Badge>
                )}
              </div>

              {/* Interpretation */}
              <p className="text-xs text-text-muted leading-relaxed border-l-2 border-border pl-3">
                {generateInterpretation(bt)}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-text-muted text-center leading-relaxed max-w-2xl mx-auto">
        Backtests reflect observed changes in market structure after a vendor disappeared from procurement records.
        They do not prove causation — other factors may explain post-exit market shifts.
      </p>
    </div>
  );
}

function MetricCell({ label, before, after, bad, value }) {
  if (value) {
    return (
      <div className="bg-surface-alt border border-border rounded-lg p-2.5">
        <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">{label}</p>
        <p className="font-mono font-semibold text-text">{value}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-alt border border-border rounded-lg p-2.5">
      <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-text-secondary">{before}</span>
        <span className="text-text-muted">→</span>
        <span className={`font-mono font-semibold ${bad ? 'text-red-400' : 'text-emerald-400'}`}>{after}</span>
      </div>
    </div>
  );
}
