/**
 * Utility formatters for ExitShock AI
 */

export const formatCurrency = (n) => {
  if (n == null || isNaN(n)) return '$0';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

export const formatPercent = (n) => {
  if (n == null || isNaN(n)) return '0.0%';
  return `${(n * 100).toFixed(1)}%`;
};

export const formatNumber = (n) => {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toLocaleString();
};

export const formatScore = (score) => {
  if (score == null || isNaN(score)) return 'N/A';
  return Number(score).toFixed(1);
};

export const riskBadgeClass = (level) => {
  switch (level) {
    case 'Critical': return 'bg-red-50 text-red-700 border border-red-200';
    case 'High': return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Medium':
    case 'Moderate': return 'bg-blue-50 text-blue-700 border border-blue-200';
    default: return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
};

export const safeArray = (val) => (Array.isArray(val) ? val : []);

export const getRiskColor = riskBadgeClass;

export const getScoreLabel = (score) => {
  if (score == null) return 'Unknown';
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};
