import {
  DollarSign,
  Activity,
  Skull,
  BarChart3,
  FileWarning,
  Users,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercent } from '../utils';

export default function CommandCenter({ cases, coverage, onSelectCase }) {
  if (!cases || !cases.length) return null;

  const totalSpend = cases.reduce((s, c) => s + c.vendor_spend, 0);

  const highestFragility = cases.reduce((best, c) =>
    c.fragility_score > best.fragility_score ? c : best
  , cases[0]);

  const criticalCount = cases.filter((c) => c.risk_level === 'Critical').length;

  const highestHHI = cases.reduce((best, c) =>
    c.hhi > best.hhi ? c : best
  , cases[0]);

  const highestSoleSource = cases.reduce((best, c) =>
    c.vendor_sole_source_share > best.vendor_sole_source_share ? c : best
  , cases[0]);

  const lowestReplacement = cases.reduce((best, c) =>
    c.replacement_vendor_count < best.replacement_vendor_count ? c : best
  , cases[0]);

  const cards = [
    {
      icon: DollarSign,
      label: 'Total Analyzed Spend',
      value: formatCurrency(totalSpend),
      subtitle: `Across ${cases.length} vendor cases`,
      accent: 'amber',
      span: 'col-span-2',
      linkedCase: null,
    },
    {
      icon: Activity,
      label: 'Highest Fragility Score',
      value: highestFragility.fragility_score,
      subtitle: highestFragility.vendor,
      accent: 'red',
      span: '',
      linkedCase: highestFragility,
    },
    {
      icon: Skull,
      label: 'Critical-Risk Cases',
      value: criticalCount,
      subtitle: criticalCount === 0 ? 'No critical cases' : 'Immediate attention required',
      accent: 'red',
      span: '',
      linkedCase: null,
    },
    {
      icon: BarChart3,
      label: 'Highest HHI',
      value: highestHHI.hhi.toLocaleString(),
      subtitle: highestHHI.ministry,
      accent: 'amber',
      span: '',
      linkedCase: highestHHI,
    },
    {
      icon: FileWarning,
      label: 'Highest Sole-Source',
      value: formatPercent(highestSoleSource.vendor_sole_source_share),
      subtitle: highestSoleSource.vendor,
      accent: 'red',
      span: '',
      linkedCase: highestSoleSource,
    },
    {
      icon: Users,
      label: 'Fewest Replacements',
      value: lowestReplacement.replacement_vendor_count,
      subtitle: lowestReplacement.vendor,
      accent: 'red',
      span: '',
      linkedCase: lowestReplacement,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
      {cards.map((card, i) => (
        <Card key={card.label} {...card} index={i} onSelectCase={onSelectCase} />
      ))}
    </div>
  );
}

function Card({ icon: Icon, label, value, subtitle, accent, span, index, linkedCase, onSelectCase }) {
  const isAmber = accent === 'amber';
  const glowColor = isAmber ? 'rgba(251,191,36,0.12)' : 'rgba(239,68,68,0.12)';
  const iconColor = isAmber ? 'text-amber-400' : 'text-red-400';
  const valueTint = isAmber ? 'text-amber-400' : 'text-red-400';
  const borderHover = isAmber ? 'hover:border-amber-500/30' : 'hover:border-red-500/30';
  const isClickable = linkedCase && onSelectCase;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={isClickable ? { scale: 0.97 } : undefined}
      onClick={isClickable ? () => onSelectCase(linkedCase) : undefined}
      className={`${span} clay rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 ${borderHover} ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Neumorphic inner glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 30px ${glowColor}` }}
      />

      {/* Corner accent gradient */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-2xl"
        style={{ background: isAmber ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)' }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.15 }}
            className={`w-10 h-10 rounded-xl glass flex items-center justify-center ${iconColor}`}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
          {isClickable && (
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all duration-200" />
          )}
        </div>
        <p className={`text-2xl md:text-3xl font-black font-mono ${valueTint}`}>
          {value}
        </p>
        <p className="text-sm font-semibold text-text mt-1">{label}</p>
        <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>
        {isClickable && (
          <p className="text-[10px] text-text-muted mt-2 group-hover:text-amber-400/60 transition-colors">Click to inspect →</p>
        )}
      </div>
    </motion.div>
  );
}
