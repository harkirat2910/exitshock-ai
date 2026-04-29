import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { calculateExitShock } from '../utils/simulation';
import { safeArray } from '../utils/formatters';

const AppStateContext = createContext();

const normalizeCase = (c) => ({
  ...c,
  timeline: safeArray(c.timeline),
  replacement_vendors: safeArray(c.replacement_vendors),
  sole_source_services: safeArray(c.sole_source_services),
  explanation: safeArray(c.explanation),
  vendor_spend: c.vendor_spend ?? 0,
  ministry_spend: c.ministry_spend ?? 0,
  vendor_share: c.vendor_share ?? 0,
  hhi: c.hhi ?? 0,
  vendor_sole_source_share: c.vendor_sole_source_share ?? 0,
  active_vendors: c.active_vendors ?? 0,
  replacement_vendor_count: c.replacement_vendor_count ?? 0,
  years_active: c.years_active ?? 0,
  fragility_score: c.fragility_score ?? 0,
  risk_level: c.risk_level ?? 'Unknown',
});

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function AppStateProvider({ children }) {
  const [cases, setCases] = useState([]);
  const [backtests, setBacktests] = useState(null);
  const [ministryAtlas, setMinistryAtlas] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    ministry: 'All',
    riskLevel: 'All',
    searchVendor: '',
  });

  const [selectedId, setSelectedId] = useState(null);

  // Simulation state
  const [simulated, setSimulated] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [blastState, setBlastState] = useState('idle'); // idle | warning | blast | deactivated
  const [impactModalOpen, setImpactModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      setError(null);

      const [casesData, backtestsData, atlasData, coverageData] = await Promise.all([
        fetchJSON('/data/exitshock_cases.json'),
        fetchJSON('/data/exitshock_backtests.json'),
        fetchJSON('/data/ministry_atlas.json'),
        fetchJSON('/data/data_coverage.json').then(
          (d) => d ?? fetchJSON('/data/dataset_coverage.json')
        ),
      ]);

      if (cancelled) return;

      if (!Array.isArray(casesData) || casesData.length === 0) {
        setError('Failed to load case data. Please check that exitshock_cases.json is available.');
        setLoading(false);
        return;
      }

      const normalized = casesData.map(normalizeCase);
      const sorted = normalized.sort((a, b) => b.fragility_score - a.fragility_score);
      setCases(sorted);

      const initial = sorted.find((c) => c.risk_level === 'Critical') || sorted[0];
      if (initial) setSelectedId(initial.case_id);

      // Backtests (optional)
      if (Array.isArray(backtestsData) && backtestsData.length > 0) {
        setBacktests(backtestsData);
      }

      // Ministry atlas (optional)
      if (atlasData != null) {
        setMinistryAtlas(atlasData);
      }

      // Coverage (optional)
      if (Array.isArray(coverageData) && coverageData[0]) {
        setCoverage(coverageData[0]);
      } else if (coverageData && typeof coverageData === 'object' && !Array.isArray(coverageData)) {
        setCoverage(coverageData);
      }

      setLoading(false);
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchMinistry = filters.ministry === 'All' || c.ministry === filters.ministry;
      const matchRisk = filters.riskLevel === 'All' || c.risk_level === filters.riskLevel;
      const matchSearch =
        filters.searchVendor === '' ||
        c.vendor.toLowerCase().includes(filters.searchVendor.toLowerCase());
      return matchMinistry && matchRisk && matchSearch;
    });
  }, [cases, filters]);

  const selectedCase = useMemo(
    () => cases.find((c) => c.case_id === selectedId) ?? null,
    [cases, selectedId]
  );

  const selectCase = (caseOrId) => {
    const id = typeof caseOrId === 'string' ? caseOrId : caseOrId?.case_id;
    setSelectedId(id);
    resetSimulation();
  };

  const resetFilters = () => {
    setFilters({ ministry: 'All', riskLevel: 'All', searchVendor: '' });
    resetSimulation();
  };

  const runSimulation = () => {
    if (!selectedCase || simulated) return;
    setBlastState('warning');
    setTimeout(() => {
      setBlastState('blast');
      const result = calculateExitShock(selectedCase);
      setSimulationResult(result);
      setSimulated(true);
      setTimeout(() => {
        setBlastState('deactivated');
        setImpactModalOpen(true);
      }, 800);
    }, 1500);
  };

  const resetSimulation = () => {
    setSimulated(false);
    setSimulationResult(null);
    setBlastState('idle');
    setImpactModalOpen(false);
  };

  const value = {
    cases,
    backtests,
    ministryAtlas,
    coverage,
    loading,
    error,
    filteredCases,
    filters,
    setFilters,
    selectedCase,
    selectCase,
    resetFilters,
    simulated,
    simulationResult,
    blastState,
    impactModalOpen,
    setImpactModalOpen,
    runSimulation,
    resetSimulation,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppState = () => useContext(AppStateContext);
