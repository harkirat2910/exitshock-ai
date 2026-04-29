import { useAppState } from '../context/AppStateContext';
import { calculateExitShock } from '../utils/simulation';
import { formatCurrency, formatPercent } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, RotateCcw, ArrowRight, Server, Building2, TrendingDown, Shield, Users } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function SimulatorPage() {
  const { selectedCase, simulated, simulationResult, blastState, runSimulation, resetSimulation } = useAppState();
  const [showDetails, setShowDetails] = useState(false);

  const result = useMemo(() => {
    if (simulationResult) return simulationResult;
    if (selectedCase) return calculateExitShock(selectedCase);
    return null;
  }, [selectedCase, simulationResult]);

  if (!selectedCase) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-accent-subtle flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-text">Exit Simulator</h2>
          <p className="text-sm text-text-muted mt-2">
            Select a vendor from the home page to simulate what happens if they exit the market.
          </p>
        </div>
      </div>
    );
  }

  const isRunning = blastState === 'warning' || blastState === 'blast';
  const isDone = blastState === 'deactivated';

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-accent" />
              <h1 className="text-xl font-bold text-text">Exit Simulator</h1>
            </div>
            <p className="text-sm text-text-muted">
              Model the impact of <span className="font-medium text-text">{selectedCase.vendor}</span> exiting {selectedCase.ministry}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isDone && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={resetSimulation}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-alt border border-border text-sm text-text-secondary hover:text-text hover:border-border transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </motion.button>
            )}
            {!simulated && (
              <button
                onClick={runSimulation}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold shadow-sm hover:bg-accent-light transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                {isRunning ? 'Simulatingâ€¦' : 'Run Simulation'}
              </button>
            )}
          </div>
        </div>

        {/* Scenario Card */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Scenario</span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {/* Source */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-[11px] text-text-muted">Ministry</p>
                <p className="text-sm font-medium text-text">{selectedCase.ministry?.split(' ').slice(0, 3).join(' ')}</p>
              </div>
            </div>
            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-text-muted">
                <div className="h-px w-8 bg-border" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">exits</span>
                <div className="h-px w-8 bg-border" />
              </div>
            </div>
            {/* Target */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDone ? 'bg-danger-subtle' : 'bg-warning-subtle'}`}>
                <Server className={`w-5 h-5 ${isDone ? 'text-danger' : 'text-warning'}`} />
              </div>
              <div>
                <p className="text-[11px] text-text-muted">Vendor</p>
                <p className="text-sm font-medium text-text">{selectedCase.vendor}</p>
              </div>
            </div>
          </div>

          {/* Key facts */}
          <div className="mt-5 pt-4 border-t border-border grid grid-cols-4 gap-4">
            {[
              { label: 'Vendor Spend', value: formatCurrency(selectedCase.vendor_spend) },
              { label: 'Market Share', value: formatPercent(selectedCase.vendor_share) },
              { label: 'Active Vendors', value: selectedCase.active_vendors },
              { label: 'Fragility Score', value: selectedCase.fragility_score },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[10px] text-text-muted uppercase tracking-wide">{f.label}</p>
                <p className="text-sm font-bold font-mono text-text mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation progress */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card p-6 mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-warning-subtle flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Zap className="w-4 h-4 text-warning" />
                  </motion.div>
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Running exit simulationâ€¦</p>
                  <p className="text-xs text-text-muted">Calculating market impact and replacement capacity</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-surface-alt overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-warning to-accent"
                  initial={{ width: '0%' }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {isDone && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Impact summary */}
              <div className="card overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-border bg-danger-subtle/30 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-danger" />
                  <h2 className="text-sm font-semibold text-text">Simulation Results</h2>
                  <span className={`ml-auto pill ${
                    result.difficulty === 'Critical' ? 'bg-danger-subtle text-danger' :
                    result.difficulty === 'High' ? 'bg-warning-subtle text-warning' :
                    'bg-success-subtle text-success'
                  }`}>
                    {result.difficulty} Risk
                  </span>
                </div>

                <div className="p-6 grid grid-cols-3 gap-6">
                  <ResultMetric
                    icon={DollarSign}
                    label="Spend Exposed"
                    value={formatCurrency(result.spendExposed)}
                    description="Contract value at risk if vendor exits"
                    color="danger"
                  />
                  <ResultMetric
                    icon={Users}
                    label="Replacement Coverage"
                    value={`${(result.replacementCoverage * 100).toFixed(0)}%`}
                    description={`${result.effectiveReplacementCount} viable replacements identified`}
                    color="accent"
                  />
                  <ResultMetric
                    icon={TrendingDown}
                    label="Coverage Gap"
                    value={`${(result.coverageGap * 100).toFixed(0)}%`}
                    description="Unmet demand after replacements"
                    color="warning"
                  />
                </div>
              </div>

              {/* Recommendation */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-semibold text-text">Recommended Action</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{result.recommendation}</p>

                {/* Replacement vendors */}
                {selectedCase.replacement_vendors?.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-wide mb-3">Replacement Candidates</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCase.replacement_vendors.slice(0, 6).map((v, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-alt border border-border">
                          <Server className="w-3.5 h-3.5 text-success" />
                          <span className="text-xs font-medium text-text truncate">{v.name}</span>
                          <span className="ml-auto text-[10px] font-mono text-success">{v.replacement_fit_score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultMetric({ icon: Icon, label, value, description, color }) {
  const colors = {
    danger: 'bg-danger-subtle text-danger',
    warning: 'bg-warning-subtle text-warning',
    accent: 'bg-accent-subtle text-accent',
    success: 'bg-success-subtle text-success',
  };
  const iconColor = colors[color] || colors.accent;

  return (
    <div>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[11px] text-text-muted font-medium uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold font-mono text-text mt-1">{value}</p>
      <p className="text-[11px] text-text-muted mt-1">{description}</p>
    </div>
  );
}

function DollarSign(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
