import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  Target,
  TrendingDown,
  FileText,
  Layers,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils';
import { calculateExitShock } from '../utils/simulation';
import VendorCaseFile from '../components/VendorCaseFile';
import ExportMemo from '../components/ExportMemo';

const STEPS = [
  { id: 'signals', label: 'Risk Signals', icon: AlertTriangle },
  { id: 'investigate', label: 'Deep Dive', icon: FileSearch },
  { id: 'simulate', label: 'Simulate Exit', icon: Zap },
  { id: 'action', label: 'Action Plan', icon: FileText },
];

/* ── Stepper ────────────────────────────────────────── */
function Stepper({ currentStep, completedSteps, onStepClick }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = currentStep === i;
        const isCompleted = completedSteps.includes(i);
        const isAccessible = i <= Math.max(...completedSteps, 0) + 1;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => isAccessible && onStepClick(i)}
              disabled={!isAccessible}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all text-left w-full cursor-pointer ${
                isActive
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : isCompleted
                  ? 'bg-success-subtle border border-success/20 text-success'
                  : isAccessible
                  ? 'bg-white border border-border text-text-secondary hover:border-accent/30 hover:shadow-sm'
                  : 'bg-white border border-border text-text-muted cursor-not-allowed opacity-40'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-white/20' : isCompleted ? 'bg-success/10' : 'bg-surface-alt'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] uppercase tracking-wider ${isActive ? 'opacity-70' : 'opacity-50'}`}>Step {i + 1}</p>
                <p className="text-xs font-semibold truncate">{step.label}</p>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-text-muted mx-1 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Signal Triage ───────────────────────────── */
function SignalTriageStep({ selectedCase, onComplete, signalStates, setSignalStates }) {
  const signals = useMemo(() => {
    if (!selectedCase) return [];
    const s = [];
    if (selectedCase.vendor_share >= 0.5)
      s.push({ id: 'dominance', severity: 'critical', label: 'Vendor Dominance', detail: `${(selectedCase.vendor_share * 100).toFixed(0)}% of ministry spend concentrated in one vendor`, metric: formatPercent(selectedCase.vendor_share) });
    else if (selectedCase.vendor_share >= 0.3)
      s.push({ id: 'dominance', severity: 'elevated', label: 'Vendor Concentration', detail: `${(selectedCase.vendor_share * 100).toFixed(0)}% vendor share — above healthy threshold`, metric: formatPercent(selectedCase.vendor_share) });
    if (selectedCase.hhi >= 2500)
      s.push({ id: 'hhi', severity: 'critical', label: 'Near-Monopoly Market (HHI)', detail: `HHI of ${selectedCase.hhi.toLocaleString()} — extremely concentrated market`, metric: selectedCase.hhi.toLocaleString() });
    else if (selectedCase.hhi >= 1500)
      s.push({ id: 'hhi', severity: 'elevated', label: 'High Market Concentration', detail: `HHI of ${selectedCase.hhi.toLocaleString()} — moderately concentrated`, metric: selectedCase.hhi.toLocaleString() });
    if (selectedCase.vendor_sole_source_share >= 0.5)
      s.push({ id: 'sole_source', severity: 'critical', label: 'Sole-Source Dependency', detail: `${(selectedCase.vendor_sole_source_share * 100).toFixed(0)}% of contracts are sole-sourced`, metric: formatPercent(selectedCase.vendor_sole_source_share) });
    else if (selectedCase.vendor_sole_source_share >= 0.25)
      s.push({ id: 'sole_source', severity: 'elevated', label: 'Sole-Source Exposure', detail: `${(selectedCase.vendor_sole_source_share * 100).toFixed(0)}% sole-source share`, metric: formatPercent(selectedCase.vendor_sole_source_share) });
    if (selectedCase.replacement_vendor_count <= 1)
      s.push({ id: 'replacement', severity: 'critical', label: 'No Viable Replacements', detail: `Only ${selectedCase.replacement_vendor_count} replacement vendor available`, metric: String(selectedCase.replacement_vendor_count) });
    else if (selectedCase.replacement_vendor_count <= 3)
      s.push({ id: 'replacement', severity: 'elevated', label: 'Limited Replacements', detail: `Only ${selectedCase.replacement_vendor_count} replacement vendors identified`, metric: String(selectedCase.replacement_vendor_count) });
    if (selectedCase.active_vendors <= 2)
      s.push({ id: 'active', severity: 'critical', label: 'Minimal Vendor Pool', detail: `Only ${selectedCase.active_vendors} vendors active`, metric: String(selectedCase.active_vendors) });
    s.push({ id: 'fragility', severity: selectedCase.fragility_score >= 80 ? 'critical' : selectedCase.fragility_score >= 60 ? 'elevated' : 'watch', label: 'Fragility Score', detail: `Composite risk score of ${selectedCase.fragility_score}/100`, metric: String(selectedCase.fragility_score) });
    return s;
  }, [selectedCase]);

  const allTriaged = signals.every(s => signalStates[s.id]);
  const confirmedCount = Object.values(signalStates).filter(v => v === 'confirmed').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-text">Triage Risk Signals</h3>
          <p className="text-sm text-text-muted mt-0.5">Confirm threats or dismiss false positives.</p>
        </div>
        <span className="pill bg-surface-alt text-text-muted border border-border">
          {Object.keys(signalStates).length} / {signals.length} triaged
        </span>
      </div>

      <div className="space-y-2">
        {signals.map((signal, i) => {
          const state = signalStates[signal.id];
          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card p-4 transition-all ${
                state === 'confirmed' ? 'border-danger/30 bg-danger-subtle/30' :
                state === 'dismissed' ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  signal.severity === 'critical' ? 'bg-danger' :
                  signal.severity === 'elevated' ? 'bg-warning' : 'bg-text-muted'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text">{signal.label}</span>
                    <span className={`pill text-[10px] ${
                      signal.severity === 'critical' ? 'bg-danger-subtle text-danger' :
                      signal.severity === 'elevated' ? 'bg-warning-subtle text-warning' :
                      'bg-surface-alt text-text-muted'
                    }`}>{signal.severity}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{signal.detail}</p>
                </div>
                <span className="text-lg font-bold font-mono text-text">{signal.metric}</span>
                <div className="flex gap-1.5 flex-shrink-0 ml-2">
                  {!state ? (
                    <>
                      <button
                        onClick={() => setSignalStates(prev => ({ ...prev, [signal.id]: 'confirmed' }))}
                        className="px-3 py-1.5 rounded-lg bg-danger-subtle text-danger text-xs font-medium hover:bg-danger/10 transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setSignalStates(prev => ({ ...prev, [signal.id]: 'dismissed' }))}
                        className="px-3 py-1.5 rounded-lg bg-surface-alt text-text-muted text-xs font-medium border border-border hover:bg-border/30 transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : state === 'confirmed' ? (
                    <button onClick={() => setSignalStates(prev => { const n = {...prev}; delete n[signal.id]; return n; })}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-danger-subtle text-danger text-xs font-medium cursor-pointer">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                    </button>
                  ) : (
                    <button onClick={() => setSignalStates(prev => { const n = {...prev}; delete n[signal.id]; return n; })}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-alt text-text-muted text-xs font-medium cursor-pointer">
                      <XCircle className="w-3.5 h-3.5" /> Dismissed
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {allTriaged && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex items-center justify-between">
          <p className="text-sm text-success flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {confirmedCount} threat{confirmedCount !== 1 ? 's' : ''} confirmed
          </p>
          <button onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition-colors cursor-pointer text-sm">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

/* ── Step 2: Deep Dive ───────────────────────────────── */
function DeepDiveStep({ selectedCase, onComplete }) {
  const [reviewed, setReviewed] = useState(false);
  return (
    <div>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-text">Deep Dive: {selectedCase.vendor}</h3>
        <p className="text-sm text-text-muted mt-0.5">Review the full case file and replacement options.</p>
      </div>
      <VendorCaseFile selectedCase={selectedCase} />
      <div className="mt-6 card p-4 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)}
            className="w-4 h-4 rounded border-border text-accent focus:ring-accent" />
          <span className="text-sm text-text-secondary">I've reviewed the evidence</span>
        </label>
        {reviewed && (
          <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition-colors cursor-pointer text-sm">
            Simulate <Zap className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ── Step 3: Simulate Exit ───────────────────────────── */
function SimulateStep({ selectedCase, onComplete, simulationResult, setSimulationResult }) {
  const [phase, setPhase] = useState(simulationResult ? 'done' : 'ready');
  const [diversifyPct, setDiversifyPct] = useState(0);

  const runSim = () => {
    setPhase('running');
    setTimeout(() => {
      const result = calculateExitShock(selectedCase);
      setSimulationResult(result);
      setPhase('done');
    }, 1200);
  };

  const scenarioResult = useMemo(() => {
    if (!selectedCase || diversifyPct === 0) return null;
    const modified = {
      ...selectedCase,
      vendor_share: selectedCase.vendor_share * (1 - diversifyPct / 100),
      vendor_spend: selectedCase.vendor_spend * (1 - diversifyPct / 100),
    };
    return calculateExitShock(modified);
  }, [selectedCase, diversifyPct]);

  const displayResult = diversifyPct > 0 && scenarioResult ? scenarioResult : simulationResult;

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-text">Exit Simulation</h3>
        <p className="text-sm text-text-muted mt-0.5">
          Model what happens if <span className="font-medium text-text">{selectedCase.vendor}</span> exits.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'ready' && (
          <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-danger-subtle flex items-center justify-center mb-5">
              <Zap className="w-7 h-7 text-danger" />
            </div>
            <p className="text-sm text-text-secondary max-w-md mb-6">
              Estimates impact on service continuity — spend exposure, replacement capacity, and market depth.
            </p>
            <button onClick={runSim}
              className="px-6 py-3 bg-accent text-white font-semibold rounded-xl shadow-sm hover:bg-accent-light transition-all cursor-pointer flex items-center gap-2">
              <Zap className="w-4 h-4" /> Run Simulation
            </button>
          </motion.div>
        )}

        {phase === 'running' && (
          <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card p-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin mb-4" />
            <p className="text-sm font-medium text-text">Running simulation…</p>
            <p className="text-xs text-text-muted mt-1">Calculating market impact</p>
          </motion.div>
        )}

        {phase === 'done' && displayResult && (
          <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card overflow-hidden mb-4">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2 bg-danger-subtle/30">
                <ShieldAlert className="w-4 h-4 text-danger" />
                <h4 className="text-sm font-semibold text-text">Impact Assessment</h4>
                <span className={`ml-auto pill ${
                  displayResult.difficulty === 'Critical' ? 'bg-danger-subtle text-danger' :
                  displayResult.difficulty === 'High' ? 'bg-warning-subtle text-warning' :
                  'bg-success-subtle text-success'
                }`}>{displayResult.difficulty}</span>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">Spend Exposed</p>
                  <p className="text-lg font-bold font-mono text-danger mt-1">{formatCurrency(displayResult.spendExposed)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">Coverage Gap</p>
                  <p className="text-lg font-bold font-mono text-warning mt-1">{(displayResult.coverageGap * 100).toFixed(0)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">Replacements</p>
                  <p className="text-lg font-bold font-mono text-success mt-1">{displayResult.effectiveReplacementCount}</p>
                </div>
              </div>
              <div className="px-5 pb-5">
                <p className="text-sm text-text-secondary p-3 rounded-lg bg-surface-alt border border-border">{displayResult.recommendation}</p>
              </div>
            </div>

            {/* What-if slider */}
            <div className="card p-5">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> What-If Scenario
              </h4>
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-muted w-16">Diversify</span>
                <input type="range" min="0" max="50" step="5" value={diversifyPct}
                  onChange={(e) => setDiversifyPct(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-surface-alt rounded-full appearance-none cursor-pointer accent-accent" />
                <span className="text-sm font-mono font-bold text-accent w-10 text-right">{diversifyPct}%</span>
              </div>
              {diversifyPct > 0 && scenarioResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-surface-alt p-2 text-center border border-border">
                    <p className="text-[10px] text-text-muted">New Exposure</p>
                    <p className="text-xs font-bold font-mono text-accent">{formatCurrency(scenarioResult.spendExposed)}</p>
                  </div>
                  <div className="rounded-lg bg-surface-alt p-2 text-center border border-border">
                    <p className="text-[10px] text-text-muted">New Gap</p>
                    <p className="text-xs font-bold font-mono text-accent">{(scenarioResult.coverageGap * 100).toFixed(0)}%</p>
                  </div>
                  <div className="rounded-lg bg-surface-alt p-2 text-center border border-border">
                    <p className="text-[10px] text-text-muted">New Risk</p>
                    <p className={`text-xs font-bold ${
                      scenarioResult.difficulty === 'Critical' ? 'text-danger' :
                      scenarioResult.difficulty === 'High' ? 'text-warning' : 'text-success'
                    }`}>{scenarioResult.difficulty}</p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button onClick={onComplete}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition-colors cursor-pointer text-sm">
                Generate Action Plan <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Step 4: Action Plan ─────────────────────────────── */
function ActionPlanStep({ selectedCase, signalStates, simulationResult }) {
  const confirmedSignals = Object.entries(signalStates).filter(([, v]) => v === 'confirmed').map(([k]) => k);
  const risk = simulationResult?.difficulty ?? 'Unknown';

  const actions = useMemo(() => {
    const a = [];
    if (confirmedSignals.includes('dominance') || confirmedSignals.includes('hhi'))
      a.push('Conduct competitive market sounding before next renewal');
    if (confirmedSignals.includes('sole_source'))
      a.push('Challenge sole-source justification and explore alternative procurement vehicles');
    if (confirmedSignals.includes('replacement'))
      a.push('Pre-qualify at least 2 additional suppliers in this service category');
    if (confirmedSignals.includes('active'))
      a.push('Develop market development strategy to attract new vendors');
    if (simulationResult?.coverageGap > 0.3)
      a.push('Establish business continuity plan for vendor exit scenario');
    if (simulationResult?.difficulty === 'Critical')
      a.push('Escalate to procurement executive for immediate review');
    if (a.length === 0)
      a.push('Continue monitoring — no immediate action required');
    return a;
  }, [confirmedSignals, simulationResult]);

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-text">Action Plan</h3>
        <p className="text-sm text-text-muted mt-0.5">Based on your investigation and simulation results.</p>
      </div>

      {/* Summary */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-subtle flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text">{selectedCase.vendor}</p>
            <p className="text-xs text-text-muted">{selectedCase.ministry}</p>
          </div>
          <span className={`pill ${
            risk === 'Critical' ? 'bg-danger-subtle text-danger' :
            risk === 'High' ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'
          }`}>{risk} Risk</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-surface-alt p-3 border border-border">
            <p className="text-[10px] text-text-muted uppercase">Confirmed Threats</p>
            <p className="text-lg font-bold font-mono text-danger">{confirmedSignals.length}</p>
          </div>
          <div className="rounded-lg bg-surface-alt p-3 border border-border">
            <p className="text-[10px] text-text-muted uppercase">Spend at Risk</p>
            <p className="text-lg font-bold font-mono text-warning">{formatCurrency(simulationResult?.spendExposed ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card p-5 mb-4">
        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Recommended Actions
        </h4>
        <div className="space-y-2">
          {actions.map((action, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-success-subtle/50 border border-success/10">
              <span className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-success">{i + 1}</span>
              <p className="text-sm text-text-secondary">{action}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="card p-4 flex items-center justify-between">
        <p className="text-sm text-text-muted">Export as procurement memo</p>
        <ExportMemo selectedCase={selectedCase} />
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────── */
export default function CaseInvestigationPage() {
  const { selectedCase } = useAppState();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [signalStates, setSignalStates] = useState({});
  const [simulationResult, setSimulationResult] = useState(null);
  const prevCaseRef = useRef(null);

  useEffect(() => {
    if (selectedCase && selectedCase.case_id !== prevCaseRef.current) {
      prevCaseRef.current = selectedCase.case_id;
      setCurrentStep(0);
      setCompletedSteps([]);
      setSignalStates({});
      setSimulationResult(null);
    }
  }, [selectedCase]);

  const completeStep = useCallback((step) => {
    setCompletedSteps(prev => [...new Set([...prev, step])]);
    setCurrentStep(step + 1);
  }, []);

  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  if (!selectedCase) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-accent-subtle flex items-center justify-center mx-auto mb-4">
            <FileSearch className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-text">No Case Selected</h2>
          <p className="text-sm text-text-muted mt-2">Go back to the home page and select a vendor to begin investigation.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text">{selectedCase.vendor}</h2>
          <p className="text-sm text-text-muted">{selectedCase.ministry} · Fragility {selectedCase.fragility_score}/100</p>
        </div>

        <Stepper currentStep={currentStep} completedSteps={completedSteps} onStepClick={setCurrentStep} />

        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {currentStep === 0 && <SignalTriageStep selectedCase={selectedCase} onComplete={() => completeStep(0)} signalStates={signalStates} setSignalStates={setSignalStates} />}
            {currentStep === 1 && <DeepDiveStep selectedCase={selectedCase} onComplete={() => completeStep(1)} />}
            {currentStep === 2 && <SimulateStep selectedCase={selectedCase} onComplete={() => completeStep(2)} simulationResult={simulationResult} setSimulationResult={setSimulationResult} />}
            {currentStep === 3 && <ActionPlanStep selectedCase={selectedCase} signalStates={signalStates} simulationResult={simulationResult} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
