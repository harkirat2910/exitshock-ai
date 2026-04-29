import { useAppState } from '../context/AppStateContext';
import TippingPointTimeline from '../components/TippingPointTimeline';
import Methodology from '../components/Methodology';
import BacktestLab from '../components/BacktestLab';
import MinistryMarketAtlas from '../components/MinistryMarketAtlas';
import ChallengeAlignment from '../components/ChallengeAlignment';
import { DemoNote } from '../components/DemoMode';
import { LineChart, ShieldCheck, BarChart3, Globe, Target } from 'lucide-react';

export default function TrendsMethodologyPage() {
  const { selectedCase, backtests, ministryAtlas } = useAppState();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Trends & Methodology</h1>
          <p className="text-sm text-text-muted mt-1">
            {selectedCase
              ? `Analysis for ${selectedCase.vendor}`
              : 'Select a vendor to view trends'}
          </p>
        </div>

        {/* Tipping Point */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Market Trends</h2>
          </div>
          {selectedCase ? (
            <TippingPointTimeline timeline={selectedCase.timeline} />
          ) : (
            <div className="card p-12 text-center">
              <p className="text-sm text-text-muted">Select a vendor case from the home page to view trends.</p>
            </div>
          )}
        </section>

        {/* Methodology */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Methodology</h2>
          </div>
          <Methodology />
        </section>

        {/* Backtests */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Backtest Validation</h2>
          </div>
          <BacktestLab backtests={backtests} />
        </section>

        {/* Ministry Market Atlas */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Ministry Atlas</h2>
          </div>
          <MinistryMarketAtlas atlas={ministryAtlas} />
        </section>

        {/* Challenge Alignment */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Challenge Alignment</h2>
          </div>
          <ChallengeAlignment />
        </section>
      </div>
    </div>
  );
}
