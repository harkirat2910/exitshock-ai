import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Zap, Target, TrendingUp, Users, Shield,
  RotateCcw, Trophy, Brain, AlertTriangle,
  ArrowRight, Play, Activity, Gauge, Crosshair,
  Radio, ServerCrash, ShieldOff, Wifi, WifiOff,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

/* ── constants ─────────────────────────────────────── */
const TOTAL_ROUNDS = 5;

const SIM_PHASES = [
  { msg: 'INITIATING EXIT PROTOCOL', icon: <Radio className="w-5 h-5" />, dur: 800 },
  { msg: 'REMOVING VENDOR FROM SUPPLY CHAIN', icon: <WifiOff className="w-5 h-5" />, dur: 1000 },
  { msg: 'CALCULATING MARKET DISRUPTION', icon: <Activity className="w-5 h-5" />, dur: 1200 },
  { msg: 'ANALYZING VENDOR POOL IMPACT', icon: <ServerCrash className="w-5 h-5" />, dur: 1000 },
  { msg: 'GENERATING ASSESSMENT', icon: <ShieldOff className="w-5 h-5" />, dur: 800 },
];

/* ── helpers ───────────────────────────────────────── */
function pickScenarios(backtests) {
  if (!backtests || backtests.length < TOTAL_ROUNDS) return [];
  const sorted = [...backtests].sort((a, b) => b.observed_exit_shock_score - a.observed_exit_shock_score);
  const buckets = [
    sorted.filter(b => b.observed_exit_shock_score >= 90),
    sorted.filter(b => b.observed_exit_shock_score >= 70 && b.observed_exit_shock_score < 90),
    sorted.filter(b => b.observed_exit_shock_score >= 40 && b.observed_exit_shock_score < 70),
    sorted.filter(b => b.observed_exit_shock_score < 40),
  ];
  const picks = [];
  const used = new Set();
  for (const bucket of buckets) {
    const shuffled = bucket.sort(() => Math.random() - 0.5);
    for (const b of shuffled) {
      if (!used.has(b.backtest_id)) { picks.push(b); used.add(b.backtest_id); break; }
    }
  }
  const remaining = backtests.filter(b => !used.has(b.backtest_id)).sort(() => Math.random() - 0.5);
  for (const b of remaining) { if (picks.length >= TOTAL_ROUNDS) break; picks.push(b); }
  return picks.slice(0, TOTAL_ROUNDS).sort(() => Math.random() - 0.5);
}

function acc(predicted, actual, maxDelta) {
  return Math.max(0, Math.round((1 - Math.abs(predicted - actual) / maxDelta) * 100));
}

function scoreRound(preds, bt) {
  const s = acc(preds.shock, bt.observed_exit_shock_score, 100);
  const h = acc(preds.hhi, bt.hhi_after_exit, Math.max(bt.hhi_after_exit, bt.hhi_before_exit, 10000));
  const v = acc(preds.vendors, bt.vendors_after_exit, Math.max(bt.vendors_before_exit, bt.vendors_after_exit, 1));
  return Math.round(s * 0.4 + h * 0.3 + v * 0.3);
}

function getRank(avg) {
  if (avg >= 85) return { title: 'Chief Risk Officer', emoji: '🏆' };
  if (avg >= 70) return { title: 'Senior Analyst', emoji: '🎖️' };
  if (avg >= 50) return { title: 'Risk Analyst', emoji: '📊' };
  if (avg >= 30) return { title: 'Junior Analyst', emoji: '📋' };
  return { title: 'Intern', emoji: '🎓' };
}

function sevColor(score) {
  if (score >= 80) return '#dc2626';
  if (score >= 60) return '#d97706';
  if (score >= 40) return '#2563eb';
  return '#059669';
}

function accColor(pct) {
  if (pct >= 80) return '#059669';
  if (pct >= 50) return '#2563eb';
  if (pct >= 25) return '#d97706';
  return '#dc2626';
}

/* ── AnimatedCounter ───────────────────────────────── */
function AnimNum({ to, duration = 1200, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(to * e));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

/* ── Circular Gauge ────────────────────────────────── */
function CircGauge({ value, max, label, color, size = 120 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xl font-black font-mono" style={{ color }}><AnimNum to={value} /></span>
      </div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-2">{label}</p>
    </div>
  );
}

/* ── Ring slider ───────────────────────────────────── */
function RingSlider({ value, onChange, min, max, label, icon, color, subtitle }) {
  const pct = (value - min) / (max - min);
  const r = 52, cx = 64, cy = 64, size = 128;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle
            cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            className="transition-all duration-150"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono" style={{ color }}>
            {value.toLocaleString()}
          </span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={max > 1000 ? 50 : 1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-28 h-1.5 mt-2 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${color} ${pct*100}%, #e5e7eb ${pct*100}%)`, accentColor: color }}
      />
      <div className="flex items-center gap-1.5 mt-2">
        {icon}
        <span className="text-xs font-bold text-gray-700">{label}</span>
      </div>
      {subtitle && <span className="text-[10px] text-gray-400 mt-0.5">{subtitle}</span>}
    </div>
  );
}

/* ── Simulation sequence overlay ───────────────────── */
function SimSequence({ onComplete, vendorName }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeout;
    const totalDur = SIM_PHASES.reduce((s, p) => s + p.dur, 0);
    let elapsed = 0;

    const runPhase = (idx) => {
      if (idx >= SIM_PHASES.length) { onComplete(); return; }
      setPhaseIdx(idx);
      const phaseDur = SIM_PHASES[idx].dur;
      const startProg = elapsed / totalDur * 100;
      elapsed += phaseDur;
      const endProg = elapsed / totalDur * 100;

      // Animate progress during this phase
      const steps = 20;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setProgress(startProg + (endProg - startProg) * (step / steps));
        if (step >= steps) clearInterval(interval);
      }, phaseDur / steps);

      timeout = setTimeout(() => {
        clearInterval(interval);
        runPhase(idx + 1);
      }, phaseDur);
    };

    runPhase(0);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  const phase = SIM_PHASES[phaseIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/[0.97] backdrop-blur-sm"
    >
      {/* Ripple rings */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-blue-300/30"
          initial={{ width: 100, height: 100, opacity: 0.6 }}
          animate={{ width: 600 + i * 200, height: 600 + i * 200, opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
        />
      ))}

      <div className="relative z-10 text-center max-w-lg px-6">
        {/* Pulsing icon */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mx-auto mb-8 w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent flex items-center justify-center"
          >
            <Crosshair className="w-5 h-5 text-blue-500" />
          </motion.div>
        </motion.div>

        {/* Vendor name */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-blue-600 text-xs font-mono uppercase tracking-[0.3em] mb-2"
        >
          TARGET: {vendorName}
        </motion.p>

        {/* Phase message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <span className="text-blue-500">{phase.icon}</span>
            <span className="text-gray-900 text-sm font-black tracking-[0.15em] uppercase">{phase.msg}</span>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-80 mx-auto">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-400">
            <span>PROCESSING</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Fake data stream */}
        <div className="mt-6 space-y-1 opacity-40">
          {[0,1,2].map(i => (
            <motion.p
              key={`${phaseIdx}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="text-[9px] font-mono text-blue-500 tracking-wide"
            >
              {['> querying procurement_records_v3...', '> cross-referencing vendor_registry...', '> computing hhi_delta_matrix...'][i]}
            </motion.p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Accuracy bar ──────────────────────────────────── */
function AccBar({ label, predicted, actual, maxVal, delay = 0 }) {
  const a = acc(predicted, actual, maxVal);
  const c = accColor(a);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-xl border border-gray-200 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</p>
        <span className="text-lg font-black font-mono" style={{ color: c }}><AnimNum to={a} />%</span>
      </div>
      <div className="flex items-center gap-6 text-sm mb-3">
        <div>
          <span className="text-[10px] text-gray-400 block">You predicted</span>
          <span className="font-bold font-mono text-gray-900">{predicted.toLocaleString()}</span>
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.5 }}
          className="flex-1 h-px bg-gray-300 origin-left"
        />
        <div className="text-right">
          <span className="text-[10px] text-gray-400 block">Actual</span>
          <span className="font-black font-mono" style={{ color: c }}>{actual.toLocaleString()}</span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: c }}
          initial={{ width: 0 }}
          animate={{ width: `${a}%` }}
          transition={{ delay: delay + 0.5, duration: 1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
export default function ExitShockChallenge({ backtests }) {
  const [phase, setPhase] = useState('intro');
  const [scenarios, setScenarios] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundScores, setRoundScores] = useState([]);
  const [shock, setShock] = useState(50);
  const [hhi, setHhi] = useState(2500);
  const [vendors, setVendors] = useState(100);
  const summaryConfettiFired = useRef(false);

  const currentScenario = scenarios[roundIndex];

  const resetSliders = useCallback((bt) => {
    setShock(50);
    setHhi(bt ? Math.round(bt.hhi_before_exit) : 2500);
    setVendors(bt ? bt.vendors_before_exit : 100);
  }, []);

  const startGame = useCallback(() => {
    const picked = pickScenarios(backtests);
    if (picked.length < TOTAL_ROUNDS) return;
    setScenarios(picked);
    setRoundIndex(0);
    setRoundScores([]);
    resetSliders(picked[0]);
    setPhase('playing');
  }, [backtests, resetSliders]);

  const runSim = () => setPhase('simulating');

  const onSimComplete = useCallback(() => {
    const preds = { shock, hhi, vendors };
    const pts = scoreRound(preds, currentScenario);
    setRoundScores(prev => [...prev, { points: pts, preds, scenario: currentScenario }]);
    setPhase('reveal');
    // Confetti burst on great predictions
    if (pts >= 70) {
      const burst = pts >= 85 ? 3 : pts >= 70 ? 2 : 1;
      for (let i = 0; i < burst; i++) {
        setTimeout(() => {
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.6, x: 0.3 + Math.random() * 0.4 }, colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb'] });
        }, i * 400);
      }
    }
  }, [shock, hhi, vendors, currentScenario]);

  const handleNext = () => {
    if (roundIndex + 1 >= TOTAL_ROUNDS) {
      setPhase('summary');
    } else {
      const next = roundIndex + 1;
      setRoundIndex(next);
      resetSliders(scenarios[next]);
      setPhase('playing');
    }
  };

  const totalScore = roundScores.reduce((s, r) => s + r.points, 0);
  const avgScore = roundScores.length > 0 ? Math.round(totalScore / roundScores.length) : 0;

  if (!backtests || backtests.length < TOTAL_ROUNDS) {
    return (
      <div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg">
        <p className="text-gray-500">Not enough backtest data to run the simulator.</p>
      </div>
    );
  }

  /* ── INTRO ── */
  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          {/* Animated rings */}
          <div className="relative inline-block mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-28 h-28 rounded-full border border-dashed border-blue-200"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-2 rounded-full border border-blue-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
                <Crosshair className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Exit Shock <span className="text-blue-600">Simulator</span>
          </h2>
          <p className="text-gray-400 mb-12 max-w-md mx-auto leading-relaxed">
            Real vendor exits. Real procurement data.
            <br />Can you predict the aftermath?
          </p>

          {/* How it works — staggered */}
          <div className="flex items-start justify-center gap-8 mb-12">
            {[
              { n: '01', label: 'Intel Brief', sub: 'Read the dossier', icon: <Brain className="w-5 h-5" />, delay: 0.1 },
              { n: '02', label: 'Set Predictions', sub: 'Calibrate the dials', icon: <Gauge className="w-5 h-5" />, delay: 0.2 },
              { n: '03', label: 'Run Simulation', sub: 'See what really happened', icon: <Activity className="w-5 h-5" />, delay: 0.3 },
            ].map(s => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: s.delay, duration: 0.5 }}
                className="text-center w-36"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-blue-600 mb-2">
                  {s.icon}
                </div>
                <p className="text-xs font-black text-gray-900 uppercase tracking-wider">{s.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </div>

          <motion.button
            onClick={startGame}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors cursor-pointer shadow-xl shadow-gray-300 text-base"
          >
            <Play className="w-5 h-5" />
            Launch Simulator
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ── SUMMARY ── */
  if (phase === 'summary') {
    const rank = getRank(avgScore);
    // Epic confetti for summary
    if (avgScore >= 60 && !summaryConfettiFired.current) {
      summaryConfettiFired.current = true;
      setTimeout(() => {
        const count = avgScore >= 85 ? 5 : avgScore >= 70 ? 3 : 2;
        for (let i = 0; i < count; i++) {
          setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 }, colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#10b981', '#fbbf24'] }), i * 300);
        }
      }, 600);
    }
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto py-12"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-6xl mb-4"
          >
            {rank.emoji}
          </motion.div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">Simulation Complete</h2>
          <p className="text-gray-400">Final assessment of your procurement instincts</p>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-10 rounded-2xl bg-white border border-gray-200 text-center mb-8 relative overflow-hidden shadow-sm"
        >
          {/* Grid bg */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />
          <div className="relative">
            <p className="text-6xl font-black text-gray-900 mb-1">
              <AnimNum to={avgScore} duration={2000} suffix="%" />
            </p>
            <p className="text-sm text-gray-400 mb-3">Average Prediction Accuracy</p>
            <p className="text-lg font-bold text-blue-600">{rank.title}</p>
          </div>
        </motion.div>

        <div className="space-y-3 mb-8">
          {roundScores.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-200 text-gray-700 text-xs font-black">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{r.scenario.vendor}</p>
                <p className="text-xs text-gray-400 truncate">{r.scenario.ministry}</p>
              </div>
              <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: accColor(r.points) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${r.points}%` }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                />
              </div>
              <span className="text-sm font-black w-12 text-right" style={{ color: accColor(r.points) }}>{r.points}%</span>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setPhase('intro'); setRoundScores([]); }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Run Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  /* ── SIMULATING OVERLAY ── */
  if (phase === 'simulating') {
    return (
      <AnimatePresence>
        <SimSequence onComplete={onSimComplete} vendorName={currentScenario.vendor} />
      </AnimatePresence>
    );
  }

  /* ── PLAYING / REVEAL ── */
  const bt = currentScenario;
  const isReveal = phase === 'reveal';
  const revealData = isReveal ? roundScores[roundScores.length - 1] : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
            <motion.div
              key={i}
              className={`h-2 w-10 rounded-full ${
                i < roundIndex ? 'bg-emerald-500' : i === roundIndex ? (isReveal ? 'bg-emerald-500' : 'bg-blue-600') : 'bg-gray-200'
              }`}
              animate={i === roundIndex && !isReveal ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          ))}
        </div>
        <span className="text-xs font-mono font-bold text-gray-400">
          SCENARIO {roundIndex + 1}/{TOTAL_ROUNDS}
        </span>
        {roundScores.length > 0 && (
          <span className="ml-auto text-xs font-black text-gray-700 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            {avgScore}% avg
          </span>
        )}
      </div>

      {/* Intel briefing */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-200 overflow-hidden mb-6 bg-white"
      >
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-black text-gray-700 uppercase tracking-[0.15em]">Intelligence Briefing</span>
          <span className="ml-auto text-[10px] font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
            EXIT: {bt.exit_year}
          </span>
        </div>
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xl font-black text-gray-900">{bt.vendor}</h3>
              <p className="text-sm text-gray-400">{bt.ministry}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-red-500"
              />
              VENDOR EXIT IMMINENT
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: 'Market Share', v: formatPercent(bt.share_in_last_active_year), hot: bt.share_in_last_active_year > 0.3, icon: <Target className="w-3 h-3" /> },
              { l: 'Lifetime Spend', v: formatCurrency(bt.lifetime_spend), hot: false, icon: <TrendingUp className="w-3 h-3" /> },
              { l: 'Active Vendors', v: bt.vendors_before_exit.toLocaleString(), hot: bt.vendors_before_exit < 50, icon: <Users className="w-3 h-3" /> },
              { l: 'Current HHI', v: bt.hhi_before_exit.toLocaleString(), hot: bt.hhi_before_exit > 2500, icon: <Shield className="w-3 h-3" /> },
            ].map(c => (
              <motion.div
                key={c.l}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`p-3 rounded-xl border ${c.hot ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-gray-400">{c.icon}<span className="text-[10px] font-bold uppercase tracking-wider">{c.l}</span></div>
                <p className={`text-sm font-black ${c.hot ? 'text-red-700' : 'text-gray-900'}`}>{c.v}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {!isReveal ? (
        /* ── PREDICTION CONSOLE ── */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="rounded-2xl border border-gray-200 overflow-hidden mb-6 bg-white">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prediction Console</span>
              <span className="ml-auto text-[10px] text-gray-400">Drag the dials to set your predictions</span>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-around flex-wrap gap-8">
                <RingSlider
                  value={shock} onChange={setShock} min={0} max={100}
                  label="Shock Score" icon={<Zap className="w-3.5 h-3.5 text-gray-400" />}
                  color={sevColor(shock)}
                  subtitle="0 = none · 100 = catastrophic"
                />
                <RingSlider
                  value={hhi} onChange={setHhi} min={0} max={10000}
                  label="HHI After Exit" icon={<TrendingUp className="w-3.5 h-3.5 text-gray-400" />}
                  color={hhi > 2500 ? '#dc2626' : hhi > 1800 ? '#d97706' : '#059669'}
                  subtitle={`Now: ${bt.hhi_before_exit.toLocaleString()}`}
                />
                <RingSlider
                  value={vendors} onChange={setVendors} min={0} max={Math.max(bt.vendors_before_exit * 2, 100)}
                  label="Vendors Left" icon={<Users className="w-3.5 h-3.5 text-gray-400" />}
                  color={vendors < bt.vendors_before_exit * 0.5 ? '#dc2626' : vendors < bt.vendors_before_exit * 0.9 ? '#d97706' : '#059669'}
                  subtitle={`Now: ${bt.vendors_before_exit.toLocaleString()}`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={runSim}
              className="inline-flex items-center gap-3 px-10 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-colors cursor-pointer shadow-lg shadow-red-200 text-sm uppercase tracking-wider"
            >
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Crosshair className="w-5 h-5" />
              </motion.div>
              Simulate Vendor Exit
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* ── REVEAL ── */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Score hero */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="rounded-2xl bg-white border border-gray-200 p-8 mb-6 text-center relative overflow-hidden shadow-sm"
          >
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />
            <div className="relative">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.3em] mb-2">Prediction Accuracy</p>
              <p className="text-5xl font-black text-gray-900 mb-2">
                <AnimNum to={revealData.points} duration={1500} suffix="%" />
              </p>
              <p className="text-sm text-gray-400">
                {revealData.points >= 80 ? '🎯 Outstanding — you read it perfectly.' :
                 revealData.points >= 60 ? '✅ Strong analytical instincts.' :
                 revealData.points >= 40 ? '📊 Decent read on the situation.' :
                 '💥 This one was brutal.'}
              </p>
            </div>
          </motion.div>

          {/* Accuracy breakdowns */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <AccBar label="Shock Score" predicted={revealData.preds.shock} actual={bt.observed_exit_shock_score} maxVal={100} delay={0.3} />
            <AccBar label="HHI After" predicted={revealData.preds.hhi} actual={bt.hhi_after_exit} maxVal={Math.max(bt.hhi_after_exit, bt.hhi_before_exit, 10000)} delay={0.5} />
            <AccBar label="Vendors Left" predicted={revealData.preds.vendors} actual={bt.vendors_after_exit} maxVal={Math.max(bt.vendors_before_exit, bt.vendors_after_exit, 1)} delay={0.7} />
          </div>

          {/* Actual result gauges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl border border-gray-200 p-6 bg-white mb-6"
          >
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-5 text-center">Actual Post-Exit Metrics</p>
            <div className="flex items-center justify-around flex-wrap gap-6">
              <CircGauge value={bt.observed_exit_shock_score} max={100} label="Shock Score" color={sevColor(bt.observed_exit_shock_score)} />
              <CircGauge value={Math.round(bt.hhi_after_exit)} max={10000} label="HHI" color={bt.hhi_after_exit > 2500 ? '#dc2626' : '#2563eb'} />
              <CircGauge value={bt.vendors_after_exit} max={bt.vendors_before_exit || 1} label="Vendors" color={bt.vendors_after_exit < bt.vendors_before_exit * 0.5 ? '#dc2626' : '#059669'} />
              <CircGauge value={Math.round(bt.sole_source_after_exit * 100)} max={100} label="Sole-Source %" color={bt.sole_source_after_exit > 0.5 ? '#dc2626' : '#2563eb'} />
            </div>
          </motion.div>

          {/* Evidence */}
          {bt.evidence && bt.evidence.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6"
            >
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Evidence</p>
              {bt.evidence.map((e, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                  className="text-xs text-gray-600 py-1 flex items-start gap-2"
                >
                  <span className="text-gray-300 mt-0.5">▸</span>{e}
                </motion.p>
              ))}
            </motion.div>
          )}

          <div className="flex justify-center">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-10 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold cursor-pointer"
            >
              {roundIndex + 1 >= TOTAL_ROUNDS ? 'See Final Results' : 'Next Scenario'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
