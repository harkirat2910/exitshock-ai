import { useState, useMemo } from 'react';
import { useAppState } from '../context/AppStateContext';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Activity } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils';
import { motion } from 'framer-motion';

export default function OverviewPage() {
  const { cases, selectCase } = useAppState();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [ministryFilter, setMinistryFilter] = useState('All');

  const ministries = useMemo(() => ['All', ...new Set(cases.map(c => c.ministry).filter(Boolean))], [cases]);

  const filtered = useMemo(() => {
    let result = cases;
    if (riskFilter !== 'All') result = result.filter(c => c.risk_level === riskFilter);
    if (ministryFilter !== 'All') result = result.filter(c => c.ministry === ministryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.vendor.toLowerCase().includes(q) || c.ministry.toLowerCase().includes(q));
    }
    return result.sort((a, b) => b.fragility_score - a.fragility_score);
  }, [cases, riskFilter, ministryFilter, search]);

  const criticalCount = cases.filter(c => c.risk_level === 'Critical').length;
  const highCount = cases.filter(c => c.risk_level === 'High').length;

  const handleSelect = (c) => {
    selectCase(c);
    navigate('/investigate');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Procurement Risk Tool</h1>
          <p className="text-sm text-text-secondary mt-1">
            Select a vendor case to begin risk assessment. {cases.length} cases across {ministries.length - 1} ministries.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-danger" />
            <span className="text-sm text-text-secondary"><span className="font-bold text-text">{criticalCount}</span> Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-sm text-text-secondary"><span className="font-bold text-text">{highCount}</span> High</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-sm text-text-secondary"><span className="font-bold text-text">{cases.length - criticalCount - highCount}</span> Medium/Low</span>
          </div>
          <div className="ml-auto text-sm text-text-muted">
            Total spend: <span className="font-mono font-semibold text-text">{formatCurrency(cases.reduce((s, c) => s + c.vendor_spend, 0))}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search vendors or ministries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border text-sm text-text placeholder:text-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
            />
          </div>
          <select
            value={ministryFilter}
            onChange={(e) => setMinistryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-border text-sm text-text outline-none focus:border-accent/40 transition-all"
          >
            {ministries.map(m => <option key={m} value={m}>{m === 'All' ? 'All Ministries' : m}</option>)}
          </select>
          <div className="flex gap-1.5">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(r => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  riskFilter === r
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-white text-text-secondary border border-border hover:border-accent/30'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Case grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.button
              key={c.case_id}
              onClick={() => handleSelect(c)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="card p-5 text-left cursor-pointer hover:border-accent/30 group transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text truncate group-hover:text-accent transition-colors">{c.vendor}</p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{c.ministry}</p>
                </div>
                <span className={`pill flex-shrink-0 ml-2 ${
                  c.risk_level === 'Critical' ? 'bg-danger-subtle text-danger' :
                  c.risk_level === 'High' ? 'bg-warning-subtle text-warning' :
                  c.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-success-subtle text-success'
                }`}>{c.risk_level}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="font-mono">{formatCurrency(c.vendor_spend)}</span>
                <span className="font-mono">{formatPercent(c.vendor_share)} share</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-text-muted" />
                  <div className="w-24 h-1.5 rounded-full bg-surface-alt overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.fragility_score >= 80 ? 'bg-danger' :
                        c.fragility_score >= 60 ? 'bg-warning' :
                        c.fragility_score >= 40 ? 'bg-amber-400' : 'bg-success'
                      }`}
                      style={{ width: `${c.fragility_score}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-text">{c.fragility_score}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-text-muted">No cases match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
