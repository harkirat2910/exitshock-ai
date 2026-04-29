import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Printer, RotateCcw, AlertTriangle, Search, ClipboardCheck } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils';

/* ── brief generator ─────────────────────────────────── */
function generateBrief(c) {
  const date = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  const vendorSharePct = (c.vendor_share * 100).toFixed(1);
  const solePct = (c.vendor_sole_source_share * 100).toFixed(1);

  const tippingYears = c.timeline.filter(t => t.is_tipping_point).map(t => t.year);
  const tippingNote = tippingYears.length > 0
    ? `Concentration metrics crossed critical thresholds in ${tippingYears.join(', ')}, indicating structural shifts in vendor dependency.`
    : 'No tipping-point years were detected in the observed window.';

  const soleSourceNote = c.sole_source_services.length > 0
    ? `${c.sole_source_services.length} sole-source service group${c.sole_source_services.length > 1 ? 's' : ''} totalling ${formatCurrency(c.sole_source_services.reduce((s, ss) => s + (ss.sole_source_amount ?? 0), 0))} were identified.`
    : 'No sole-source service groups were identified in the observed data.';

  const replacementNote = c.replacement_vendor_count === 0
    ? 'No recent alternative vendors met the activity threshold, which may extend recovery timelines if this vendor were to exit.'
    : `${c.replacement_vendor_count} alternative vendor${c.replacement_vendor_count > 1 ? 's' : ''} met the recent activity threshold, providing potential transition options.`;

  return {
    date,
    subject: `Procurement Fragility Assessment — ${c.vendor}`,
    ministry: c.ministry,
    vendor: c.vendor,
    riskLevel: c.risk_level,
    fragilityScore: c.fragility_score,

    finding: `This vendor-ministry relationship shows elevated procurement fragility. ${c.vendor} represents ${vendorSharePct}% of recent observed spend in ${c.ministry}, with a ministry-market HHI of ${c.hhi.toLocaleString()}. The Procurement Fragility Score is ${c.fragility_score} out of 100, classified as ${c.risk_level} risk.`,

    evidence: [
      `Vendor share of ministry spend: ${vendorSharePct}% (${formatCurrency(c.vendor_spend)} of ${formatCurrency(c.ministry_spend)}).`,
      `Ministry-market HHI: ${c.hhi.toLocaleString()} (values above 2,500 indicate high concentration).`,
      `Sole-source share: ${solePct}%. ${soleSourceNote}`,
      replacementNote,
      `Vendor has been active for ${c.years_active} observed fiscal year${c.years_active !== 1 ? 's' : ''}.`,
      tippingNote,
    ],

    recommendation: c.fragility_score >= 80
      ? 'This case warrants priority review. Consider conducting a market test prior to the next renewal cycle, identifying qualified backup suppliers, and developing a documented transition contingency plan.'
      : c.fragility_score >= 60
        ? 'This case warrants proactive attention. Consider broadening future solicitations, conducting a supply-market analysis, and ensuring contingency options are documented before the next contract renewal.'
        : c.fragility_score >= 40
          ? 'This case presents moderate concentration. Standard monitoring is appropriate, with periodic review of vendor diversity and consideration of multi-source strategies at renewal.'
          : 'This case reflects a healthy vendor distribution. Continue standard procurement oversight and periodic market checks.',
  };
}

/* ── main component ──────────────────────────────────── */
export default function ProcurementBrief({ selectedCase }) {
  const [brief, setBrief] = useState(null);

  if (!selectedCase) return null;

  const handleGenerate = () => setBrief(generateBrief(selectedCase));
  const handleReset = () => setBrief(null);

  return (
    <div className="glass rounded-2xl overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!brief ? (
          /* ── pre-generation state — Aurora bg ── */
          <motion.div
            key="pre"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-8 flex flex-col md:flex-row items-center gap-8 aurora-bg relative"
          >
            <div className="flex-1">
              <p className="text-text-secondary">
                Generate a procurement fragility brief for{' '}
                <span className="font-semibold text-text">{selectedCase.vendor}</span> in{' '}
                <span className="font-semibold text-text">{selectedCase.ministry}</span>.
              </p>
              <p className="text-sm text-text-muted mt-1">
                Produces a concise, non-accusatory assessment suitable for internal review.
              </p>
            </div>
            {/* Neo-Brutalism button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              className="neo-brutal px-8 py-4 bg-gradient-to-r from-sky-600 to-indigo-500 text-white font-black rounded-xl flex items-center gap-3 cursor-pointer flex-shrink-0 uppercase tracking-wider text-sm"
            >
              <FileText className="w-5 h-5" />
              Generate Brief
            </motion.button>
          </motion.div>
        ) : (
          /* ── memo card — Skeuomorphic paper-like ── */
          <motion.div
            key="post"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* memo header bar — Clay */}
            <div className="px-6 py-3 clay border-b border-white/[0.03] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Procurement Fragility Brief
                </span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-secondary glass rounded-lg hover:text-text transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-secondary glass rounded-lg hover:text-text transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </motion.button>
              </div>
            </div>

            {/* memo body — skeuomorphic paper feel */}
            <div className="p-6 md:p-8 space-y-6 relative">
              {/* Subtle paper texture lines */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.5) 28px)' }}
              />

              {/* letterhead */}
              <div className="border-b border-white/[0.06] pb-5 space-y-1 relative">
                <p className="text-xs text-text-muted uppercase tracking-wider">Date: {brief.date}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Subject: {brief.subject}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Ministry: {brief.ministry}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Classification:{' '}
                  <span className={
                    brief.riskLevel === 'Critical' ? 'text-red-400 font-bold' :
                    brief.riskLevel === 'High' ? 'text-amber-400 font-bold' :
                    brief.riskLevel === 'Medium' ? 'text-yellow-400 font-bold' :
                    'text-emerald-400 font-bold'
                  }>
                    {brief.riskLevel} Risk — Fragility Score {brief.fragilityScore}/100
                  </span>
                </p>
              </div>

              {/* finding — glass card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-subtle rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Finding</h4>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed pl-6">
                  {brief.finding}
                </p>
              </motion.div>

              {/* evidence — glass card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-subtle rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-sky-400" />
                  <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Evidence</h4>
                </div>
                <ul className="space-y-2 pl-6">
                  {brief.evidence.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="text-sm text-text-secondary leading-relaxed flex gap-2"
                    >
                      <span className="text-sky-500/60 flex-shrink-0 font-mono text-xs mt-0.5">{i + 1}.</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* recommended review — glass card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-subtle rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Recommended Review</h4>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed pl-6">
                  {brief.recommendation}
                </p>
              </motion.div>

              {/* disclaimer */}
              <div className="mt-6 pt-5 border-t border-white/[0.04]">
                <p className="text-[11px] text-text-muted leading-relaxed italic">
                  This brief is generated from publicly available procurement records and does not allege wrongdoing
                  by any vendor or ministry. It surfaces observed procurement fragility signals for informational
                  purposes only. All findings should be verified through appropriate internal review processes.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
