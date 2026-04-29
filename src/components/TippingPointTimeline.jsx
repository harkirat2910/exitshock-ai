import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const CHART_GRID = '#172a4540';
const CHART_AXIS = '#475569';
const CHART_TICK = { fill: '#94a3b8', fontSize: 11 };
const TOOLTIP_STYLE = {
  background: 'rgba(10, 22, 40, 0.9)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: 12,
};

const pctFmt = (v) => `${(v * 100).toFixed(0)}%`;
const pctTip = (v) => `${(v * 100).toFixed(1)}%`;

export default function TippingPointTimeline({ timeline }) {
  const data = Array.isArray(timeline) ? timeline : [];

  const firstTippingYear = useMemo(() => {
    const tp = data.find((t) => t.is_tipping_point);
    return tp?.year ?? null;
  }, [data]);

  if (!data.length) return null;

  return (
    <div className="space-y-6">
      {/* Tipping-point callout — Glassmorphism */}
      {firstTippingYear ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 glass rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-red-500/8 blur-[50px] pointer-events-none" />
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-red-300">
              Tipping point first detected in <span className="font-mono text-red-400">{firstTippingYear}</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              Concentration metrics crossed critical thresholds, signaling a structural shift in vendor dependency.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3 glass-subtle rounded-2xl p-5">
          <span className="text-sm text-text-secondary">No tipping point detected in observed window.</span>
        </div>
      )}

      {/* 4-panel grid — Bento layout */}
      <div className="grid md:grid-cols-2 gap-4">
        <ChartPanel
          title="Active Vendors"
          subtitle="Vendor pool size over time"
          data={data}
          dataKey="active_vendors"
          color="#38bdf8"
          gradientId="activeGrad"
          firstTippingYear={firstTippingYear}
          type="area"
          yDomain={['auto', 'auto']}
          tipFormatter={(v) => [v, 'Active Vendors']}
        />
        <ChartPanel
          title="HHI Index"
          subtitle="Market concentration (>2,500 = highly concentrated)"
          data={data}
          dataKey="hhi"
          color="#f59e0b"
          gradientId="hhiPanelGrad"
          firstTippingYear={firstTippingYear}
          type="area"
          yDomain={[0, 'auto']}
          referenceLine={{ y: 2500, label: '2500' }}
          tipFormatter={(v) => [v.toLocaleString(), 'HHI']}
        />
        <ChartPanel
          title="Top Vendor Share"
          subtitle="Dominant vendor's percentage of ministry spend"
          data={data}
          dataKey="top_vendor_share"
          color="#ef4444"
          gradientId="topShareGrad"
          firstTippingYear={firstTippingYear}
          type="line"
          yDomain={[0, 1]}
          yTickFormatter={pctFmt}
          tipFormatter={(v) => [pctTip(v), 'Top Vendor Share']}
        />
        <ChartPanel
          title="Sole-Source Share"
          subtitle="Proportion of contracts awarded without competition"
          data={data}
          dataKey="sole_source_share"
          color="#a78bfa"
          gradientId="ssShareGrad"
          firstTippingYear={firstTippingYear}
          type="line"
          yDomain={[0, 1]}
          yTickFormatter={pctFmt}
          tipFormatter={(v) => [pctTip(v), 'Sole-Source Share']}
        />
      </div>

      {/* Tipping-point year badges — Neumorphic pills */}
      {data.some((t) => t.is_tipping_point) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-text-muted uppercase tracking-wide mr-1">Tipping years:</span>
          {data.filter((t) => t.is_tipping_point).map((t, i) => (
            <motion.span
              key={t.year}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.1 }}
              className="px-2.5 py-0.5 rounded-lg text-xs font-mono neu-inset text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)] cursor-default"
            >
              {t.year}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── individual chart panel ────────────────────────────── */
function ChartPanel({
  title,
  subtitle,
  data,
  dataKey,
  color,
  gradientId,
  firstTippingYear,
  type,
  yDomain,
  yTickFormatter,
  referenceLine,
  tipFormatter,
}) {
  const Chart = type === 'area' ? AreaChart : LineChart;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-5 group hover:shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all duration-300"
    >
      <div className="mb-3">
        <p className="text-sm font-semibold text-text group-hover:text-amber-50 transition-colors">{title}</p>
        <p className="text-[11px] text-text-muted">{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <Chart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="year"
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            tickLine={false}
          />
          <YAxis
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            tickLine={false}
            domain={yDomain}
            tickFormatter={yTickFormatter}
            width={40}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: '#fbbf24', fontSize: 11 }}
            formatter={tipFormatter}
          />

          {/* Tipping-point vertical marker */}
          {firstTippingYear && (
            <ReferenceLine
              x={firstTippingYear}
              stroke="#ef4444"
              strokeDasharray="4 3"
              strokeOpacity={0.6}
              label={{ value: '▼', fill: '#ef4444', fontSize: 10, position: 'top' }}
            />
          )}

          {/* Optional horizontal reference */}
          {referenceLine && (
            <ReferenceLine
              y={referenceLine.y}
              stroke="#ef4444"
              strokeDasharray="6 3"
              strokeOpacity={0.4}
              label={{
                value: referenceLine.label,
                fill: '#ef444480',
                fontSize: 10,
                position: 'right',
              }}
            />
          )}

          {type === 'area' ? (
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              dot={{ fill: color, r: 2.5 }}
              activeDot={{ r: 4, fill: color }}
            />
          ) : (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 2.5 }}
              activeDot={{ r: 4, fill: color }}
            />
          )}
        </Chart>
      </ResponsiveContainer>
    </motion.div>
  );
}
