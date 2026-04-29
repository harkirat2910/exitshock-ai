import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Search } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

const BAND_STYLES = {
  'Highly concentrated': { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
  'Moderately concentrated': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  'Competitive / lower concentration': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
};

function bandStyle(band) {
  return BAND_STYLES[band] || BAND_STYLES['Moderately concentrated'];
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className="bg-surface-alt border border-border rounded-lg p-4">
      <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">{label}</p>
      <p className={`text-lg font-bold font-mono ${color || 'text-text'}`}>{value}</p>
      {sub && <p className="text-[11px] text-text-muted mt-1 truncate">{sub}</p>}
    </div>
  );
}

export default function MinistryMarketAtlas({ ministryAtlas }) {
  const [ministryFilter, setMinistryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const data = useMemo(() => {
    if (!Array.isArray(ministryAtlas)) return [];
    return ministryAtlas;
  }, [ministryAtlas]);

  const ministries = useMemo(() => [...new Set(data.map(d => d.ministry))].sort(), [data]);
  const years = useMemo(() => [...new Set(data.map(d => d.fiscal_year))].sort((a, b) => b - a), [data]);

  const filtered = useMemo(() => {
    let result = data;
    if (ministryFilter) result = result.filter(d => d.ministry === ministryFilter);
    if (yearFilter) result = result.filter(d => d.fiscal_year === Number(yearFilter));
    return result;
  }, [data, ministryFilter, yearFilter]);

  // Summary stats from full dataset
  const summaries = useMemo(() => {
    if (!data.length) return null;
    const mostConcentrated = data.reduce((a, b) => (b.hhi > a.hhi ? b : a), data[0]);
    const highestSS = data.reduce((a, b) => (b.sole_source_share > a.sole_source_share ? b : a), data[0]);
    const lowestVendors = data.filter(d => d.active_vendors > 0).reduce((a, b) => (b.active_vendors < a.active_vendors ? b : a), data[0]);
    const largestSpend = data.reduce((a, b) => (b.ministry_spend > a.ministry_spend ? b : a), data[0]);
    return { mostConcentrated, highestSS, lowestVendors, largestSpend };
  }, [data]);

  // Empty state
  if (!data.length) {
    return (
      <div className="bg-surface-alt border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <Globe className="w-8 h-8 text-text-muted mb-3" />
        <p className="text-sm text-text-secondary">Ministry atlas data not available.</p>
        <p className="text-xs text-text-muted mt-1">Requires ministry_atlas.json dataset.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Explanatory text */}
      <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
        The atlas prevents cherry-picking by showing the broader procurement market landscape across ministries and years.
      </p>

      {/* Summary cards */}
      {summaries && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label="Most Concentrated"
            value={`HHI ${summaries.mostConcentrated.hhi.toLocaleString()}`}
            sub={`${summaries.mostConcentrated.ministry} (${summaries.mostConcentrated.fiscal_year})`}
            color="text-red-400"
          />
          <SummaryCard
            label="Highest Sole-Source"
            value={formatPercent(summaries.highestSS.sole_source_share)}
            sub={`${summaries.highestSS.ministry} (${summaries.highestSS.fiscal_year})`}
            color="text-amber-400"
          />
          <SummaryCard
            label="Fewest Vendors"
            value={summaries.lowestVendors.active_vendors}
            sub={`${summaries.lowestVendors.ministry} (${summaries.lowestVendors.fiscal_year})`}
            color="text-accent"
          />
          <SummaryCard
            label="Largest Spend"
            value={formatCurrency(summaries.largestSpend.ministry_spend)}
            sub={`${summaries.largestSpend.ministry} (${summaries.largestSpend.fiscal_year})`}
            color="text-text"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <select
            value={ministryFilter}
            onChange={e => setMinistryFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm text-text appearance-none focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            <option value="">All Ministries ({ministries.length})</option>
            {ministries.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="relative sm:w-48">
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm text-text appearance-none focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            <option value="">All Years ({years.length})</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-text-muted self-center">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-x-auto rounded-xl border border-border"
      >
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-surface-alt text-text-muted uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Ministry</th>
              <th className="text-center px-3 py-3 font-medium">Year</th>
              <th className="text-right px-3 py-3 font-medium">Spend</th>
              <th className="text-center px-3 py-3 font-medium">Vendors</th>
              <th className="text-right px-3 py-3 font-medium">HHI</th>
              <th className="text-right px-3 py-3 font-medium">Top Share</th>
              <th className="text-right px-3 py-3 font-medium">Sole-Source</th>
              <th className="text-center px-3 py-3 font-medium">Band</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.slice(0, 50).map((row, i) => {
              const style = bandStyle(row.concentration_band);
              return (
                <tr key={`${row.ministry}-${row.fiscal_year}-${i}`} className="hover:bg-surface-alt transition-colors">
                  <td className="px-4 py-2.5 text-text font-medium max-w-[200px] truncate">{row.ministry}</td>
                  <td className="px-3 py-2.5 text-center text-text-secondary font-mono">{row.fiscal_year}</td>
                  <td className="px-3 py-2.5 text-right text-text-secondary font-mono">{formatCurrency(row.ministry_spend)}</td>
                  <td className="px-3 py-2.5 text-center text-text-secondary font-mono">{row.active_vendors}</td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    <span className={row.hhi >= 2500 ? 'text-red-400' : row.hhi >= 1800 ? 'text-amber-400' : 'text-emerald-400'}>
                      {row.hhi.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-text-secondary font-mono">{formatPercent(row.top_vendor_share)}</td>
                  <td className="px-3 py-2.5 text-right text-text-secondary font-mono">{formatPercent(row.sole_source_share)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {row.concentration_band === 'Competitive / lower concentration' ? 'Competitive' : row.concentration_band === 'Moderately concentrated' ? 'Moderate' : 'High'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 50 && (
          <div className="bg-surface-alt border-t border-border px-4 py-2.5 text-center text-xs text-text-muted">
            Showing 50 of {filtered.length} records. Use filters to narrow results.
          </div>
        )}
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Competitive (HHI &lt; 1800)</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate (1800–2500)</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> High (&gt; 2500)</span>
      </div>
    </div>
  );
}
