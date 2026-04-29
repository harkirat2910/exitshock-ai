import {
  AlertTriangle,
  Building2,
  DollarSign,
  BarChart3,
  FileWarning,
  Users,
  ShieldAlert,
  Target,
  Replace,
  Info,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercent, getRiskColor, getScoreLabel } from '../utils';

function CollapsibleSection({ title, icon, defaultOpen = true, children, accentColor = 'text-text-muted' }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-5 py-3.5 hover:bg-surface-alt transition-colors text-left"
      >
        <span className={accentColor}>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary flex-1">{title}</span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default function VendorCaseFile({ selectedCase }) {
  if (!selectedCase) return null;

  const c = selectedCase;
  const scoreColor = c.fragility_score >= 80 ? '#dc2626' : c.fragility_score >= 60 ? '#f59e0b' : '#10b981';

  return (
    <div className="space-y-6">
      {/* ── Header: vendor identity + fragility ring — Glassmorphism ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-start gap-6 glass rounded-2xl p-6 relative overflow-hidden"
      >
        {/* Aurora accent */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[80px] pointer-events-none" style={{ background: `${scoreColor}15` }} />

        {/* Fragility score ring — Skeuomorphic gauge */}
        <div className="flex-shrink-0 self-center md:self-start">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-28 h-28"
          >
            {/* Neumorphic ring background */}
            <div className="absolute inset-0 rounded-full neu-inset" />
            <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="52" fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="327"
                initial={{ strokeDashoffset: 327 }}
                animate={{ strokeDashoffset: 327 - (c.fragility_score / 100) * 327 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{ filter: `drop-shadow(0 0 8px ${scoreColor}80)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <span className="text-2xl font-black font-mono text-text" style={{ textShadow: `0 0 15px ${scoreColor}60` }}>{c.fragility_score}</span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">Fragility</span>
            </div>
          </motion.div>
        </div>

        {/* Vendor identity */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="text-2xl font-bold text-text truncate">{c.vendor}</h3>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRiskColor(c.risk_level)}`}>
              {c.risk_level}
            </span>
          </div>
          <p className="text-sm text-text-secondary flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            {c.ministry}
          </p>
          <p className="mt-3 text-xs text-text-muted border-l-2 border-amber-500/40 pl-3 max-w-xl">
            Potential procurement fragility detected. This case represents an observed dependency signal
            and is flagged for recommended review — not an indication of wrongdoing.
          </p>
        </div>
      </motion.div>

      {/* ── Key metrics — Bento Grid with Claymorphism ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: <DollarSign className="w-4 h-4" />, label: 'Vendor Spend', value: formatCurrency(c.vendor_spend) },
          { icon: <BarChart3 className="w-4 h-4" />, label: 'Vendor Share', value: formatPercent(c.vendor_share) },
          { icon: <ShieldAlert className="w-4 h-4" />, label: 'HHI Index', value: c.hhi.toLocaleString() },
          { icon: <FileWarning className="w-4 h-4" />, label: 'Sole-Source', value: formatPercent(c.vendor_sole_source_share) },
          { icon: <Replace className="w-4 h-4" />, label: 'Replacements', value: c.replacement_vendor_count },
          { icon: <Users className="w-4 h-4" />, label: 'Active Vendors', value: c.active_vendors },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3, scale: 1.03 }}
            className="clay rounded-xl p-3 cursor-default group"
          >
            <div className="flex items-center gap-1.5 text-text-muted mb-1 group-hover:text-amber-400/70 transition-colors">
              {metric.icon}
              <span className="text-[10px] uppercase tracking-wide">{metric.label}</span>
            </div>
            <p className="text-lg font-bold font-mono text-text">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Evidence bullets — Collapsible ── */}
      {c.explanation.length > 0 && (
        <CollapsibleSection title="Observed Dependency Signals" icon={<Info className="w-4 h-4" />} defaultOpen={true} accentColor="text-amber-400">
          <ul className="space-y-2.5">
            {c.explanation.map((e, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="text-sm text-text-secondary flex gap-2.5 group/item"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500/80 flex-shrink-0 mt-0.5 group-hover/item:text-amber-400 transition-colors" />
                <span>{e}</span>
              </motion.li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* ── Sole-source service exposure — Collapsible ── */}
      {c.sole_source_services.length > 0 && (
        <CollapsibleSection title="Sole-Source Service Exposure" icon={<Target className="w-4 h-4" />} defaultOpen={false} accentColor="text-red-400">
          <div className="space-y-4">
            {c.sole_source_services.map((ss, i) => (
              <div key={i} className="clay rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-semibold text-text">{ss.service_group}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-red-400">{formatCurrency(ss.sole_source_amount ?? 0)}</span>
                    {ss.sole_source_contracts != null && (
                      <span className="text-text-muted">
                        {ss.sole_source_contracts} contract{ss.sole_source_contracts !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {ss.contract_service_examples?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {ss.contract_service_examples.map((ex, j) => (
                      <p key={j} className="text-xs text-text-secondary leading-relaxed">• {ex}</p>
                    ))}
                  </div>
                )}

                {ss.permitted_situations_examples?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ss.permitted_situations_examples.map((code, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono glass-subtle text-text-secondary"
                      >
                        Situation {code.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-text-muted leading-relaxed">
            Sole-source designations reflect documented procurement decisions and permitted exceptions — not irregularities. Flagged for recommended review only.
          </p>
        </CollapsibleSection>
      )}

      {/* ── Replacement vendor candidates — Bento cards ── */}
      {c.replacement_vendors.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
            <Replace className="w-4 h-4 text-emerald-400" /> Potential Replacement Vendors
          </h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {c.replacement_vendors.slice(0, 6).map((rv, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="glass rounded-xl p-4 cursor-default group hover:shadow-[0_0_15px_rgba(52,211,153,0.08)] transition-all"
              >
                <p className="font-medium text-sm text-text truncate group-hover:text-emerald-50 transition-colors">{rv.name}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
                  <span>{formatCurrency(rv.past_spend)} spend</span>
                  <span className="font-mono text-emerald-400">{rv.replacement_fit_score}% fit</span>
                </div>
                {rv.years_active != null && (
                  <p className="mt-1 text-[11px] text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {rv.years_active} yr{rv.years_active !== 1 ? 's' : ''} active
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
