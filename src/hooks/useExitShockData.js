import { useState, useEffect, useMemo } from 'react';
import { safeArray } from '../utils/formatters';

/**
 * Normalize a single case record with safe defaults.
 */
function normalizeCase(c) {
  return {
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
  };
}

/**
 * Fetch JSON from a URL. Returns null if the file is missing or invalid.
 */
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Custom hook that loads all ExitShock data files and provides
 * normalized, sorted data with selection state.
 */
export default function useExitShockData() {
  const [cases, setCases] = useState([]);
  const [backtests, setBacktests] = useState(null);
  const [ministryAtlas, setMinistryAtlas] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedBacktestId, setSelectedBacktestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      setError(null);

      const [casesData, backtestsData, atlasData, coverageData] = await Promise.all([
        fetchJSON('/data/exitshock_cases.json'),
        fetchJSON('/data/exitshock_backtests.json'),
        fetchJSON('/data/ministry_atlas.json'),
        // Try both possible filenames for coverage
        fetchJSON('/data/data_coverage.json').then(
          (d) => d ?? fetchJSON('/data/dataset_coverage.json')
        ),
      ]);

      if (cancelled) return;

      // Cases are required — set error if missing
      if (!Array.isArray(casesData) || casesData.length === 0) {
        setError('Failed to load case data. Please check that exitshock_cases.json is available.');
        setLoading(false);
        return;
      }

      // Normalize and sort by fragility_score descending
      const normalized = casesData.map(normalizeCase);
      const sorted = normalized.sort((a, b) => b.fragility_score - a.fragility_score);
      setCases(sorted);

      // Auto-select highest fragility case
      setSelectedId(sorted[0].case_id);

      // Backtests (optional)
      if (Array.isArray(backtestsData) && backtestsData.length > 0) {
        setBacktests(backtestsData);
        setSelectedBacktestId(backtestsData[0].id ?? backtestsData[0].case_id ?? null);
      }

      // Ministry atlas (optional)
      if (atlasData != null) {
        setMinistryAtlas(atlasData);
      }

      // Coverage (optional — may be array or object)
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

  // Derived selected case
  const selectedCase = useMemo(
    () => cases.find((c) => c.case_id === selectedId) ?? null,
    [cases, selectedId]
  );

  // Derived selected backtest
  const selectedBacktest = useMemo(
    () => backtests?.find((b) => (b.id ?? b.case_id) === selectedBacktestId) ?? null,
    [backtests, selectedBacktestId]
  );

  return {
    // Data
    cases,
    backtests,
    ministryAtlas,
    coverage,
    // Selection
    selectedCase,
    setSelectedCase: (c) => setSelectedId(c?.case_id ?? c),
    selectedBacktest,
    setSelectedBacktest: (b) => setSelectedBacktestId(b?.id ?? b?.case_id ?? b),
    // Status
    loading,
    error,
  };
}
