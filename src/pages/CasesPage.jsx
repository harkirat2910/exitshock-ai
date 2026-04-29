import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, ArrowUpDown, ShieldAlert, AlertTriangle, TrendingUp, Users, Building2, Database } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { formatCurrency, formatPercent, riskBadgeClass } from '../utils/formatters';

/* ── Animated counter ─────────────────────────────── */
function CountUp({ to, duration = 1800, prefix = '', suffix = '', decimals = 0 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  const started = useRef(false);
  const el = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const e = 1 - Math.pow(1 - t, 4);
          setVal(to * e);
          if (t < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (el.current) observer.observe(el.current);
    return () => { observer.disconnect(); cancelAnimationFrame(raf.current); };
  }, [to, duration]);

  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  return <span ref={el}>{prefix}{display}{suffix}</span>;
}

const RISK_LEVELS = ['All', 'Critical', 'High', 'Moderate', 'Low'];

const COLUMNS = [
  { key: 'vendor', label: 'Vendor', align: 'left', sortable: true },
  { key: 'ministry', label: 'Ministry', align: 'left', sortable: true },
  { key: 'fragility_score', label: 'Fragility', align: 'right', sortable: true },
  { key: 'risk_level', label: 'Risk', align: 'center', sortable: true },
  { key: 'vendor_share', label: 'Market Share', align: 'right', sortable: true },
  { key: 'hhi', label: 'HHI', align: 'right', sortable: true },
  { key: 'vendor_sole_source_share', label: 'Sole-Source', align: 'right', sortable: true },
  { key: 'replacement_vendor_count', label: 'Replacements', align: 'right', sortable: true },
];

const RISK_ORDER = { Critical: 0, High: 1, Medium: 2, Moderate: 2, Low: 3 };

export default function CasesPage() {
  const { cases, selectCase, coverage } = useAppState();
  const navigate = useNavigate();

  const [ministry, setMinistry] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('fragility_score');
  const [sortDir, setSortDir] = useState('desc');

  const ministries = useMemo(() => {
    const set = new Set(cases.map((c) => c.ministry));
    return ['All', ...Array.from(set).sort()];
  }, [cases]);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (ministry !== 'All' && c.ministry !== ministry) return false;
      if (riskLevel !== 'All') {
        if (riskLevel === 'Moderate' && c.risk_level !== 'Medium' && c.risk_level !== 'Moderate') return false;
        else if (riskLevel !== 'Moderate' && c.risk_level !== riskLevel) return false;
      }
      if (search && !c.vendor.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [cases, ministry, riskLevel, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === 'risk_level') {
        aVal = RISK_ORDER[aVal] ?? 99;
        bVal = RISK_ORDER[bVal] ?? 99;
      }
      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'vendor' || key === 'ministry' ? 'asc' : 'desc');
    }
  };

  const handleRowClick = (c) => {
    selectCase(c);
    navigate('/investigate');
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-blue-600" />
      : <ChevronDown className="w-3 h-3 text-blue-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ═══ HERO SECTION ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-10 rounded-2xl border border-gray-200 bg-white overflow-hidden"
      >
        {/* Subtle grid bg */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative px-8 py-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Live Intelligence Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
            Procurement Risk <span className="text-blue-600">Intelligence</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mb-8">
            AI-powered analysis of Alberta's $64.3B procurement ecosystem. Identifying vendor
            dependency risks before they become crises.
          </p>

          {/* Animated stat counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Database className="w-4 h-4" />, value: 82569, label: 'Records Analyzed', prefix: '', suffix: '' },
              { icon: <TrendingUp className="w-4 h-4" />, value: 64.3, label: 'Total Spend', prefix: '$', suffix: 'B', decimals: 1 },
              { icon: <Users className="w-4 h-4" />, value: 14775, label: 'Vendors Tracked', prefix: '', suffix: '' },
              { icon: <Building2 className="w-4 h-4" />, value: 82, label: 'Ministries Covered', prefix: '', suffix: '' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-1.5 text-gray-400 mb-2">{s.icon}<span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span></div>
                <p className="text-2xl font-black text-gray-900 font-mono">
                  <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals || 0} duration={2000 + i * 300} />
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ LIVE RISK TICKER ═══ */}
      <div className="mb-8 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white border-r border-gray-200">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Live Feed</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <motion.div
              className="flex items-center gap-8 whitespace-nowrap py-2 px-4"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              {[...cases.filter(c => c.risk_level === 'Critical').slice(0, 10), ...cases.filter(c => c.risk_level === 'Critical').slice(0, 10)].map((c, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-[11px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.risk_level === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <span className="font-bold text-gray-700">{c.vendor}</span>
                  <span className="text-gray-400">&rarr;</span>
                  <span className="font-mono text-red-600">{c.fragility_score}</span>
                  <span className="text-gray-300">|</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ AI INSIGHT CARDS ═══ */}
      {(() => {
        const criticalCount = cases.filter(c => c.risk_level === 'Critical').length;
        const highShareCases = cases.filter(c => c.vendor_share >= 0.8);
        const avgFragility = cases.length > 0 ? Math.round(cases.reduce((s, c) => s + c.fragility_score, 0) / cases.length) : 0;
        const soleSourceRisk = cases.filter(c => c.vendor_sole_source_share > 0.5).length;
        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="grid sm:grid-cols-3 gap-4 mb-8"
          >
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Critical Alert</p>
                <p className="text-sm text-red-600 mt-0.5">
                  <span className="font-black">{criticalCount}</span> vendor relationships at critical risk.
                  {highShareCases.length > 0 && ` ${highShareCases.length} hold 80%+ market share.`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Sole-Source Risk</p>
                <p className="text-sm text-amber-600 mt-0.5">
                  <span className="font-black">{soleSourceRisk}</span> vendors with &gt;50% sole-source contracts.
                  Procurement flexibility is compromised.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Avg Fragility</p>
                <p className="text-sm text-blue-600 mt-0.5">
                  System-wide fragility index: <span className="font-black">{avgFragility}/100</span>.
                  {avgFragility >= 60 ? ' Elevated risk across the board.' : ' Within manageable range.'}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Risk Cases</h2>
        <p className="text-sm text-gray-500 mt-1">
          {sorted.length.toLocaleString()} vendor-ministry relationships flagged for review.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Ministry */}
        <select
          value={ministry}
          onChange={(e) => setMinistry(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {ministries.map((m) => (
            <option key={m} value={m}>{m === 'All' ? 'All Ministries' : m}</option>
          ))}
        </select>

        {/* Risk level pills */}
        <div className="flex items-center gap-1">
          {RISK_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setRiskLevel(level)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                riskLevel === level
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Count */}
        <span className="text-sm text-gray-400 self-center ml-auto">
          {sorted.length} case{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon colKey={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((c) => (
                <tr
                  key={c.case_id}
                  onClick={() => handleRowClick(c)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[220px] truncate">{c.vendor}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{c.ministry}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            c.fragility_score >= 80 ? 'bg-red-500' :
                            c.fragility_score >= 60 ? 'bg-amber-500' :
                            c.fragility_score >= 40 ? 'bg-blue-500' :
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${c.fragility_score}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold text-gray-900 w-8 text-right">{c.fragility_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${riskBadgeClass(c.risk_level)}`}>
                      {c.risk_level === 'Critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                      {c.risk_level === 'Medium' ? 'Moderate' : c.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{formatPercent(c.vendor_share)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{c.hhi.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{formatPercent(c.vendor_sole_source_share)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{c.replacement_vendor_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            No cases match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
