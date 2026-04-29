import { formatPercent } from '../utils/formatters';

const SIGNALS = [
  {
    label: 'Vendor Share',
    field: 'vendor_share',
    format: (v) => formatPercent(v),
    thresholds: [
      { min: 0.50, status: 'Critical', label: '>50%' },
      { min: 0.25, status: 'Elevated', label: '>25%' },
    ],
    reviewNote: '>25% elevated, >50% critical',
  },
  {
    label: 'Ministry-Market HHI',
    field: 'hhi',
    format: (v) => v?.toLocaleString() ?? 'N/A',
    thresholds: [
      { min: 2500, status: 'Critical', label: '>2500' },
      { min: 1800, status: 'Elevated', label: '>1800' },
    ],
    reviewNote: '>1800 elevated, >2500 critical',
  },
  {
    label: 'Sole-Source Exposure',
    field: 'vendor_sole_source_share',
    format: (v) => formatPercent(v),
    thresholds: [
      { min: 0.50, status: 'Critical', label: '>50%' },
      { min: 0.25, status: 'Elevated', label: '>25%' },
    ],
    reviewNote: '>25% elevated, >50% critical',
  },
  {
    label: 'Replacement Scarcity',
    field: 'replacement_vendor_count',
    format: (v) => (v != null ? String(v) : 'N/A'),
    thresholds: [
      { max: 1, status: 'Critical', label: '0–1 vendors' },
      { max: 2, status: 'Elevated', label: '<3 vendors' },
    ],
    reviewNote: '<3 elevated, 0–1 critical',
    inverted: true,
  },
  {
    label: 'Fragility Score',
    field: 'fragility_score',
    format: (v) => v?.toFixed(1) ?? 'N/A',
    thresholds: [
      { min: 80, status: 'Critical', label: '>80' },
      { min: 65, status: 'Elevated', label: '>65' },
    ],
    reviewNote: '>65 high, >80 critical',
  },
  {
    label: 'Active Vendor Pool',
    field: 'active_vendors',
    format: (v) => (v != null ? String(v) : 'N/A'),
    thresholds: [
      { max: 3, status: 'Critical', label: '≤3 vendors' },
      { max: 5, status: 'Elevated', label: '≤5 vendors' },
    ],
    reviewNote: '≤5 elevated, ≤3 critical',
    inverted: true,
  },
];

function getStatus(signal, value) {
  if (value == null) return 'Normal';
  for (const t of signal.thresholds) {
    if (signal.inverted) {
      if (t.max != null && value <= t.max) return t.status;
    } else {
      if (t.min != null && value >= t.min) return t.status;
    }
  }
  // Check for Watch zone (slightly below thresholds)
  if (signal.inverted) {
    const lowest = signal.thresholds[signal.thresholds.length - 1];
    if (lowest.max != null && value <= lowest.max + 2) return 'Watch';
  } else {
    const lowest = signal.thresholds[signal.thresholds.length - 1];
    if (lowest.min != null && value >= lowest.min * 0.8) return 'Watch';
  }
  return 'Normal';
}

const STATUS_STYLES = {
  Critical: 'bg-red-600/20 text-red-400 border-red-600/30',
  Elevated: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Watch: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  Normal: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
};

export default function EvidenceMatrix({ selectedCase }) {
  if (!selectedCase) return null;

  return (
    <div className="bg-surface-alt border border-border rounded-xl p-5">
      <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Scoring Audit Trail
      </h4>
      <p className="text-[11px] text-text-muted mb-5">
        Review signals used to compute the fragility score. These are observed metrics that deserve review — not evidence of wrongdoing.
      </p>

      {/* Desktop: table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-text-muted">
              <th className="text-left py-2 pr-4 font-semibold">Signal</th>
              <th className="text-right py-2 px-4 font-semibold">Observed</th>
              <th className="text-right py-2 px-4 font-semibold">Review Threshold</th>
              <th className="text-center py-2 pl-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {SIGNALS.map((signal) => {
              const value = selectedCase[signal.field];
              const status = getStatus(signal, value);
              return (
                <tr key={signal.field} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 text-text-secondary font-medium">{signal.label}</td>
                  <td className="py-3 px-4 text-right font-mono text-text">{signal.format(value)}</td>
                  <td className="py-3 px-4 text-right text-text-muted text-xs">{signal.reviewNote}</td>
                  <td className="py-3 pl-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${STATUS_STYLES[status]}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: card layout */}
      <div className="md:hidden space-y-3">
        {SIGNALS.map((signal) => {
          const value = selectedCase[signal.field];
          const status = getStatus(signal, value);
          return (
            <div key={signal.field} className="bg-surface-alt border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-secondary">{signal.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${STATUS_STYLES[status]}`}>
                  {status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-text">{signal.format(value)}</span>
                <span className="text-[10px] text-text-muted">{signal.reviewNote}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
