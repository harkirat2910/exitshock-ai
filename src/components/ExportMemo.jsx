import { FileOutput } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

function buildMemoHTML(c) {
  const date = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const vendorShare = (c.vendor_share * 100).toFixed(1);
  const soleSource = (c.vendor_sole_source_share * 100).toFixed(1);

  const tippingYears = (c.timeline || []).filter(t => t.is_tipping_point).map(t => t.year);
  const tippingNote = tippingYears.length > 0
    ? `Concentration metrics crossed critical thresholds in fiscal year${tippingYears.length > 1 ? 's' : ''} ${tippingYears.join(', ')}.`
    : 'No tipping-point years detected in the observed window.';

  const replacementNote = c.replacement_vendor_count === 0
    ? 'No recent alternative vendors met the activity threshold.'
    : `${c.replacement_vendor_count} alternative vendor${c.replacement_vendor_count > 1 ? 's' : ''} observed with recent activity in this ministry-market.`;

  const soleServices = (c.sole_source_services || []);
  const soleServicesNote = soleServices.length > 0
    ? soleServices.slice(0, 5).map(s => `• ${s.description || s.service_group || 'Unnamed service'} — ${formatCurrency(s.sole_source_amount || 0)}`).join('\n')
    : '• No sole-source service groups identified.';

  const evidenceBullets = (c.evidence_flags || [])
    .map(e => `• ${e.label || e.flag}: ${e.detail || e.value || ''}`)
    .join('\n') || '• No specific evidence flags recorded.';

  const riskLabel = c.fragility_score >= 80 ? 'Critical' : c.fragility_score >= 60 ? 'High' : c.fragility_score >= 40 ? 'Medium' : 'Low';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Procurement Fragility Review Memo — ${c.vendor}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 48px 64px; max-width: 800px; margin: 0 auto; line-height: 1.6; font-size: 13px; }
  h1 { font-size: 20px; margin-bottom: 4px; color: #111; }
  h2 { font-size: 14px; margin-top: 28px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; color: #333; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta { font-size: 12px; color: #555; margin-bottom: 24px; }
  .meta span { display: block; margin-bottom: 2px; }
  .header-bar { border-top: 3px solid #1e3a5f; padding-top: 16px; margin-bottom: 24px; }
  .score-box { display: inline-block; background: #f8f8f8; border: 1px solid #ddd; border-radius: 4px; padding: 6px 14px; font-size: 18px; font-weight: bold; margin: 4px 0; }
  .score-critical { color: #dc2626; }
  .score-high { color: #d97706; }
  .score-medium { color: #ca8a04; }
  .score-low { color: #16a34a; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
  th, td { text-align: left; padding: 6px 10px; border: 1px solid #e0e0e0; font-size: 12px; }
  th { background: #f5f5f5; font-weight: 600; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 12px; margin: 4px 0; color: #333; }
  .disclaimer { margin-top: 32px; padding: 12px 16px; background: #fefce8; border: 1px solid #fde047; border-radius: 4px; font-size: 11px; color: #713f12; }
  .footer { margin-top: 32px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
  @media print {
    body { padding: 24px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="header-bar">
  <h1>Procurement Fragility Review Memo</h1>
  <div class="meta">
    <span><strong>Date:</strong> ${date}</span>
    <span><strong>Prepared by:</strong> ExitShock AI — Procurement Risk Simulator</span>
    <span><strong>Classification:</strong> Internal Review — Not for Public Distribution</span>
  </div>
</div>

<h2>1. Vendor</h2>
<table>
  <tr><th>Vendor Name</th><td>${c.vendor}</td></tr>
  <tr><th>Lifetime Spend</th><td>${formatCurrency(c.lifetime_spend || 0)}</td></tr>
  <tr><th>Active Years</th><td>${c.years_active || 'N/A'}</td></tr>
  <tr><th>Vendor Share of Ministry Spend</th><td>${vendorShare}%</td></tr>
</table>

<h2>2. Ministry</h2>
<table>
  <tr><th>Ministry</th><td>${c.ministry}</td></tr>
  <tr><th>Market HHI</th><td>${(c.hhi || 0).toLocaleString()}</td></tr>
  <tr><th>Active Vendors in Market</th><td>${c.active_vendors || 'N/A'}</td></tr>
</table>

<h2>3. Fragility Score</h2>
<p>The Procurement Fragility Score measures structural dependency, not performance or intent.</p>
<div class="score-box score-${riskLabel.toLowerCase()}">${c.fragility_score} / 100 — ${riskLabel}</div>

<h2>4. Finding</h2>
<p>This vendor-ministry relationship exhibits elevated concentration signals that may warrant procurement review. The vendor holds ${vendorShare}% of ministry-market spend with ${soleSource}% sole-source exposure across ${c.years_active || 'multiple'} active years.</p>
<p style="margin-top:6px;">${tippingNote}</p>

<h2>5. Evidence</h2>
<pre>${evidenceBullets}</pre>
<p style="margin-top:8px;"><strong>Sole-Source Service Exposure:</strong></p>
<pre>${soleServicesNote}</pre>

<h2>6. Scenario Result</h2>
<table>
  <tr><th>Replacement Vendors Available</th><td>${c.replacement_vendor_count ?? 'Unknown'}</td></tr>
  <tr><th>Exposed Spend (if vendor exits)</th><td>${formatCurrency(c.lifetime_spend || 0)}</td></tr>
  <tr><th>Market Concentration (HHI)</th><td>${(c.hhi || 0).toLocaleString()}</td></tr>
</table>
<p>${replacementNote}</p>

<h2>7. Recommended Review</h2>
<ul style="padding-left:18px; font-size:12px;">
  <li>Assess whether current sole-source justifications remain valid for ongoing service needs.</li>
  <li>Evaluate vendor transition readiness and contingency coverage.</li>
  <li>Consider market testing before next contract renewal period.</li>
  <li>Review whether alternative vendors can meet capacity requirements.</li>
</ul>

<h2>8. Limitations</h2>
<ul style="padding-left:18px; font-size:12px; color:#555;">
  <li>Dependency measured at ministry-market level using available contract and sole-source records.</li>
  <li>Vendor names may contain inconsistencies due to data entry variation.</li>
  <li>Replacement vendor count reflects observed recent activity, not confirmed capability.</li>
  <li>This is a first-pass review tool, not a final procurement decision.</li>
</ul>

<div class="disclaimer">
  <strong>Disclaimer:</strong> ExitShock does not allege fraud, misconduct, or legal wrongdoing. This memo surfaces structural procurement patterns that may deserve review. All data is derived from publicly available government procurement records.
</div>

<div class="footer">
  ExitShock AI — Procurement Risk Simulator &bull; Generated ${date}
</div>

<div class="no-print" style="text-align:center; margin-top:24px;">
  <button onclick="window.print()" style="padding:10px 24px; font-size:13px; font-weight:600; background:#1e3a5f; color:#fff; border:none; border-radius:4px; cursor:pointer;">Print / Save as PDF</button>
</div>
</body>
</html>`;
}

export default function ExportMemo({ selectedCase }) {
  if (!selectedCase) return null;

  const handleExport = () => {
    const html = buildMemoHTML(selectedCase);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-light transition-colors cursor-pointer"
    >
      <FileOutput className="w-4 h-4" />
      Export Review Memo
    </button>
  );
}
