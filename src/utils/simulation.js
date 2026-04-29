/**
 * simulation.js — ExitShock AI simulation engine
 * Computes exit-shock metrics dynamically from case data.
 */

export function calculateExitShock(caseData) {
  if (!caseData) return null;

  const {
    vendor_spend,
    ministry_spend,
    vendor_share,
    active_vendors,
    replacement_vendors = [],
    replacement_vendor_count,
  } = caseData;

  const spendExposed = vendor_spend || (ministry_spend || 0) * (vendor_share || 0);

  const safeReplacements = replacement_vendors || [];
  const replacementCapacity = safeReplacements.reduce((sum, rv) => {
    const cap =
      rv.avg_annual_spend != null
        ? rv.avg_annual_spend
        : (rv.past_spend || 0) / Math.max(rv.years_active || 1, 1);
    return sum + cap;
  }, 0);

  const replacementCoverage = spendExposed > 0 ? Math.min(replacementCapacity / spendExposed, 1) : 0;
  const coverageGap = Math.max(1 - replacementCoverage, 0);
  const postExitActiveVendors = Math.max((active_vendors || 0) - 1, 0);
  const effectiveReplacementCount = replacement_vendor_count ?? safeReplacements.length;

  let difficulty;
  if (effectiveReplacementCount === 0 || coverageGap > 0.4 || postExitActiveVendors <= 1) {
    difficulty = 'Critical';
  } else if (coverageGap > 0.25) {
    difficulty = 'High';
  } else if (coverageGap > 0.1) {
    difficulty = 'Medium';
  } else {
    difficulty = 'Low';
  }

  const recommendations = {
    Critical: 'Do not renew without supplier diversification, market sounding, or continuity planning.',
    High: 'Begin competitive market test before renewal and validate alternate supplier capacity.',
    Medium: 'Monitor concentration and pre-qualify backup suppliers.',
    Low: 'Maintain current supplier but keep replacement options active.',
  };

  return {
    spendExposed,
    replacementCapacity,
    replacementCoverage,
    coverageGap,
    postExitActiveVendors,
    effectiveReplacementCount,
    difficulty,
    recommendation: recommendations[difficulty],
  };
}
