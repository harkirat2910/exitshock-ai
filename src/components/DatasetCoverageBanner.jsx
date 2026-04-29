import { useMemo, useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { formatCurrency, formatNumber } from '../utils/formatters';

function AnimatedStat({ value, label, highlight }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const [displayed, setDisplayed] = useState(value);
  const hasRun = useRef(false);

  // Extract numeric portion for animation
  const numericPart = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const isAnimatable = !isNaN(numericPart) && numericPart > 0 && !String(value).includes('yrs');

  useEffect(() => {
    if (!isInView || hasRun.current || !isAnimatable) return;
    hasRun.current = true;

    const start = performance.now();
    const duration = 1400;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericPart * eased;

      // Reconstruct formatted value
      if (String(value).startsWith('$')) {
        if (current >= 1e9) setDisplayed(`$${(current / 1e9).toFixed(1)}B`);
        else if (current >= 1e6) setDisplayed(`$${(current / 1e6).toFixed(1)}M`);
        else if (current >= 1e3) setDisplayed(`$${(current / 1e3).toFixed(0)}K`);
        else setDisplayed(`$${Math.round(current)}`);
      } else {
        setDisplayed(Math.round(current).toLocaleString());
      }

      if (progress < 1) requestAnimationFrame(tick);
      else setDisplayed(value); // final exact value
    }

    requestAnimationFrame(tick);
  }, [isInView, isAnimatable, numericPart, value]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center px-3 py-4">
      <span className={`text-2xl md:text-3xl font-black tracking-tight ${highlight === 'amber' ? 'text-amber-400' : highlight === 'cyan' ? 'text-accent' : 'text-text'}`}>
        {isInView || !isAnimatable ? displayed : '\u00A0'}
      </span>
      <span className="mt-1 text-[11px] md:text-xs font-medium uppercase tracking-wider text-text-secondary">
        {label}
      </span>
    </div>
  );
}

export default function DatasetCoverageBanner({ coverage, cases }) {
  const metrics = useMemo(() => {
    if (coverage) {
      const criticalCount = cases?.filter(
        (c) => c.risk_level === 'Critical' || c.risk_level === 'High'
      ).length ?? 0;

      return {
        records: formatNumber(coverage.total_records),
        spend: formatCurrency(coverage.total_spend),
        vendors: formatNumber(coverage.unique_vendors),
        ministries: formatNumber(coverage.ministries),
        fiscalYears: coverage.fiscal_years
          ? `${coverage.fiscal_years} yrs (${coverage.first_year}–${coverage.last_year})`
          : 'N/A',
        soleSourceSpend: formatCurrency(coverage.sole_source_spend),
        critical: formatNumber(criticalCount),
      };
    }

    // Fallback: derive what we can from cases
    if (!cases || cases.length === 0) return null;

    const totalSpend = cases.reduce((sum, c) => sum + (c.vendor_spend ?? 0), 0);
    const vendors = new Set(cases.map((c) => c.vendor)).size;
    const ministries = new Set(cases.map((c) => c.ministry)).size;
    const criticalCount = cases.filter(
      (c) => c.risk_level === 'Critical' || c.risk_level === 'High'
    ).length;

    return {
      records: 'N/A',
      spend: formatCurrency(totalSpend),
      vendors: formatNumber(vendors),
      ministries: formatNumber(ministries),
      fiscalYears: 'N/A',
      soleSourceSpend: 'N/A',
      critical: formatNumber(criticalCount),
    };
  }, [coverage, cases]);

  if (!metrics) return null;

  return (
    <section className="relative border-b border-border bg-surface-alt backdrop-blur">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.03] via-transparent to-cyan-500/[0.03]" />
      <div className="relative max-w-7xl mx-auto px-4 py-6">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-text-muted mb-4">
          Dataset Intelligence Summary
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1 lg:divide-x divide-border">
          <AnimatedStat value={metrics.records} label="Records Scanned" highlight="amber" />
          <AnimatedStat value={metrics.spend} label="Total Spend" />
          <AnimatedStat value={metrics.vendors} label="Unique Vendors" highlight="cyan" />
          <AnimatedStat value={metrics.ministries} label="Ministries" />
          <AnimatedStat value={metrics.fiscalYears} label="Fiscal Years" />
          <AnimatedStat value={metrics.soleSourceSpend} label="Sole-Source Spend" highlight="amber" />
          <AnimatedStat value={metrics.critical} label="High-Risk Cases" highlight="cyan" />
        </div>
      </div>
    </section>
  );
}
