import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  LineChart,
  Zap,
  FileText,
  Search,
  RotateCcw,
  Filter,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { formatCurrency, getRiskColor } from '../utils';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/risk-analysis', label: 'Investigate', icon: FileSearch },
  { path: '/trends', label: 'Trends', icon: LineChart },
  { path: '/simulator', label: 'Simulator', icon: Zap },
  { path: '/brief', label: 'Brief', icon: FileText },
];

export default function SidebarNav() {
  const {
    cases,
    filteredCases,
    filters,
    setFilters,
    selectedCase,
    selectCase,
    resetFilters,
  } = useAppState();
  const navigate = useNavigate();

  const ministries = ['All', ...new Set(cases.map((c) => c.ministry).filter(Boolean))];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <aside className="w-[260px] bg-white border-r border-border flex flex-col shrink-0 overflow-hidden">
      {/* Navigation */}
      <nav className="p-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-accent-subtle text-accent'
                  : 'text-text-secondary hover:bg-surface-alt hover:text-text'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-3 h-px bg-border" />

      {/* Filters */}
      <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Filters</span>
          </div>
          <button
            onClick={resetFilters}
            className="text-[11px] text-text-muted hover:text-accent font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Ministry */}
        <div>
          <label className="block text-[11px] text-text-muted font-medium mb-1">Ministry</label>
          <select
            value={filters.ministry}
            onChange={(e) => handleFilterChange('ministry', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-xs text-text bg-surface-alt border border-border outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
          >
            {ministries.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-[11px] text-text-muted font-medium mb-1.5">Risk Level</label>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((risk) => (
              <button
                key={risk}
                onClick={() => handleFilterChange('riskLevel', risk)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  filters.riskLevel === risk
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-surface-alt text-text-secondary border border-border hover:border-accent/30'
                }`}
              >
                {risk === 'Medium' ? 'Med' : risk}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor Search */}
        <div>
          <label className="block text-[11px] text-text-muted font-medium mb-1">Search Vendor</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Vendor name..."
              value={filters.searchVendor}
              onChange={(e) => handleFilterChange('searchVendor', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-text bg-surface-alt border border-border outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-text-muted/50"
            />
          </div>
        </div>

        {/* Case List */}
        <div className="flex-1 min-h-0">
          <label className="block text-[11px] text-text-muted font-medium mb-1.5">
            Cases <span className="text-text-muted">({filteredCases.length})</span>
          </label>
          <div className="space-y-1 max-h-[calc(100vh-480px)] overflow-y-auto pr-1">
            {filteredCases.slice(0, 20).map((c) => (
              <button
                key={c.case_id}
                onClick={() => { selectCase(c); navigate('/risk-analysis'); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                  selectedCase?.case_id === c.case_id
                    ? 'bg-accent-subtle border border-accent/20 text-accent'
                    : 'hover:bg-surface-alt text-text-secondary border border-transparent'
                }`}
              >
                <p className="font-medium truncate text-text">{c.vendor}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    c.risk_level === 'Critical' ? 'bg-danger' :
                    c.risk_level === 'High' ? 'bg-warning' :
                    c.risk_level === 'Medium' ? 'bg-amber-400' : 'bg-success'
                  }`} />
                  <span className="text-[10px] text-text-muted truncate">{c.ministry}</span>
                  <span className="text-[10px] text-text-muted ml-auto font-mono">{c.fragility_score}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
