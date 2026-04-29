import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckSquare,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils';

const TABS = [
  { key: 'brief', label: 'Risk Brief', icon: FileText },
  { key: 'evidence', label: 'Evidence Check', icon: CheckSquare },
  { key: 'questions', label: 'Review Questions', icon: HelpCircle },
];

/* ── Risk Brief generator ────────────────────────────── */
function generateBrief(c) {
  const shareText = (c.vendor_share * 100).toFixed(1);
  const hhiText = c.hhi.toLocaleString();
  const ssText = (c.vendor_sole_source_share * 100).toFixed(1);

  const finding = `This vendor-ministry relationship shows elevated procurement fragility because ${c.vendor} represents ${shareText}% of observed ministry spend for ${c.ministry}, ministry-market HHI is ${hhiText}, and only ${c.replacement_vendor_count} recent replacement vendor${c.replacement_vendor_count !== 1 ? 's' : ''} meet the activity threshold.`;

  const evidence = [];
  evidence.push(`Vendor share of ${shareText}% exceeds typical competitive market levels.`);
  if (c.hhi >= 2500) evidence.push(`HHI of ${hhiText} indicates a highly concentrated market (threshold: 2,500).`);
  else if (c.hhi >= 1800) evidence.push(`HHI of ${hhiText} indicates a concentrated market (threshold: 1,800).`);
  if (c.vendor_sole_source_share > 0.25) evidence.push(`Sole-source exposure of ${ssText}% is elevated (threshold: 25%).`);
  if (c.replacement_vendor_count <= 2) evidence.push(`Only ${c.replacement_vendor_count} replacement vendor${c.replacement_vendor_count !== 1 ? 's' : ''} identified — limited alternatives available.`);
  if (c.years_active > 10) evidence.push(`Relationship spans ${c.years_active} fiscal years of observed activity.`);
  evidence.push(`Total vendor spend of ${formatCurrency(c.vendor_spend)} observed in procurement records.`);

  const recommendation = c.fragility_score >= 80
    ? 'Immediate review recommended. Consider market test, transition planning, and diversification assessment before next renewal.'
    : c.fragility_score >= 60
    ? 'Elevated review priority. Validate sole-source rationale and assess market availability before contract renewal.'
    : 'Standard monitoring recommended. Periodic review of vendor concentration and market health.';

  const limitations = [
    'Analysis is based on publicly available procurement data and may not reflect all contractual arrangements.',
    'Vendor name matching relies on observed records and may contain inaccuracies.',
    'Replacement vendor capability has not been validated — fitness scores reflect historical spend patterns only.',
    'This assessment does not evaluate service quality, operational constraints, or policy justifications.',
  ];

  return { finding, evidence, recommendation, limitations };
}

/* ── Evidence items ──────────────────────────────────── */
function getEvidenceItems(c) {
  const supported = [];
  supported.push({ signal: 'Vendor dominance', detail: `${(c.vendor_share * 100).toFixed(1)}% of ministry spend` });
  supported.push({ signal: 'Ministry-market HHI', detail: `${c.hhi.toLocaleString()} (${c.hhi >= 2500 ? 'highly concentrated' : c.hhi >= 1800 ? 'concentrated' : 'moderate'})` });
  supported.push({ signal: 'Sole-source exposure', detail: `${(c.vendor_sole_source_share * 100).toFixed(1)}% of contracts` });
  supported.push({ signal: 'Replacement scarcity', detail: `${c.replacement_vendor_count} vendor${c.replacement_vendor_count !== 1 ? 's' : ''} available` });
  if (c.timeline?.length > 2) {
    supported.push({ signal: 'Timeline trend', detail: `${c.timeline.length} years of historical data showing concentration trajectory` });
  }
  supported.push({ signal: 'Replacement vendor count', detail: `${c.replacement_vendors?.length ?? 0} candidates identified from procurement records` });

  const needsValidation = [
    'Whether replacement vendors have exact service capability for this ministry context',
    'Whether procurement rules and permitted situations justify current sole-source usage',
    'Whether data naming inconsistencies affect vendor identity matching',
    'Whether operational constraints or policy requirements explain the observed concentration',
  ];

  return { supported, needsValidation };
}

/* ── Review questions ────────────────────────────────── */
const REVIEW_QUESTIONS = [
  { q: 'When was the last competitive market test conducted for these services?', context: 'Market tests validate that sole-source rationale remains current.' },
  { q: 'Are the identified replacement vendors technically qualified for this scope?', context: 'Historical spend does not guarantee service capability.' },
  { q: 'Does the original sole-source rationale still apply under current conditions?', context: 'Permitted situations may expire as market conditions evolve.' },
  { q: 'What transition plan exists if this vendor becomes unavailable?', context: 'Service continuity requires documented contingency protocols.' },
  { q: 'Is the current concentration level acceptable given service continuity requirements?', context: 'Some concentration may be justified — the decision should be documented.' },
];

/* ── Main component ──────────────────────────────────── */
export default function AIAnalystPanel({ selectedCase }) {
  const [activeTab, setActiveTab] = useState('brief');

  if (!selectedCase) return null;

  return (
    <div className="bg-surface-alt border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-surface-alt border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          AI Procurement Analyst
        </div>
        <span className="text-[10px] text-text-muted font-mono">
          {selectedCase.risk_level} Priority
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold transition-all ${
                isActive
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-accent-subtle'
                  : 'text-text-muted hover:text-text-secondary border-b-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'brief' && <RiskBriefTab key="brief" selectedCase={selectedCase} />}
        {activeTab === 'evidence' && <EvidenceCheckTab key="evidence" selectedCase={selectedCase} />}
        {activeTab === 'questions' && <ReviewQuestionsTab key="questions" selectedCase={selectedCase} />}
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="border-t border-border px-6 py-3">
        <p className="text-[10px] text-text-muted text-center leading-relaxed">
          ExitShock does not allege wrongdoing. It acts as a first-pass review assistant for procurement resilience.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 1: Risk Brief
   ══════════════════════════════════════════════════════════ */
function RiskBriefTab({ selectedCase }) {
  const brief = generateBrief(selectedCase);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Finding */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Finding
        </h4>
        <p className="text-sm text-text-secondary leading-relaxed">{brief.finding}</p>
      </div>

      {/* Evidence */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 mb-2 flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5" /> Evidence
        </h4>
        <ul className="space-y-2">
          {brief.evidence.map((item, i) => (
            <li key={i} className="text-sm text-text-secondary flex gap-2.5">
              <span className="text-amber-500/60 font-mono text-xs mt-0.5">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Review */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Recommended Review
        </h4>
        <p className="text-sm text-text-secondary leading-relaxed bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
          {brief.recommendation}
        </p>
      </div>

      {/* Limitations */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5" /> Limitations
        </h4>
        <ul className="space-y-1.5">
          {brief.limitations.map((item, i) => (
            <li key={i} className="text-xs text-text-muted flex gap-2">
              <span className="text-text-muted">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 2: Evidence Check
   ══════════════════════════════════════════════════════════ */
function EvidenceCheckTab({ selectedCase }) {
  const { supported, needsValidation } = getEvidenceItems(selectedCase);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Supported by data */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 mb-3 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> Supported by Data
        </h4>
        <div className="space-y-2">
          {supported.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-4 py-2.5"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text">{item.signal}</span>
                <span className="text-text-muted mx-2">—</span>
                <span className="text-sm text-text-secondary font-mono">{item.detail}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Needs human validation */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Needs Human Validation
        </h4>
        <div className="space-y-2">
          {needsValidation.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.3 + i * 0.05 }}
              className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-2.5"
            >
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 3: Review Questions
   ══════════════════════════════════════════════════════════ */
function ReviewQuestionsTab({ selectedCase }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <p className="text-xs text-text-muted mb-4">
        Practical questions to guide human review of this vendor-ministry relationship.
      </p>

      <div className="space-y-3">
        {REVIEW_QUESTIONS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.08 }}
            className="bg-surface-alt border border-border rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-amber-400">{i + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text">{item.q}</p>
                <p className="text-xs text-text-muted mt-1">{item.context}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
