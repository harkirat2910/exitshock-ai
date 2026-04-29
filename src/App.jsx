import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TopNav from './components/TopNav';
import CasesPage from './pages/CasesPage';
import CaseInvestigationPage from './pages/CaseInvestigationPage';
import TrendsMethodologyPage from './pages/TrendsMethodologyPage';
import ChallengePage from './pages/ChallengePage';
import { useAppState } from './context/AppStateContext';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: 'easeOut' },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...pageTransition}>
        <Routes location={location}>
          <Route path="/" element={<CasesPage />} />
          <Route path="/investigate" element={<CaseInvestigationPage />} />
          <Route path="/trends" element={<TrendsMethodologyPage />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { loading, error } = useAppState();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
          <p className="text-red-600 font-semibold">Failed to load data</p>
          <p className="text-gray-500 text-sm max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Skeleton nav */}
        <div className="h-14 border-b border-gray-200 px-8 flex items-center gap-6">
          <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
          <div className="flex gap-2 ml-auto">
            {[1,2,3,4].map(i => <div key={i} className="h-4 w-16 bg-gray-100 rounded animate-pulse" />)}
          </div>
        </div>
        {/* Skeleton hero */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="rounded-2xl border border-gray-100 p-8 mb-8">
            <div className="h-3 w-32 bg-gray-100 rounded animate-pulse mb-4" />
            <div className="h-8 w-80 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8" />
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mb-3" />
                  <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          {/* Skeleton table rows */}
          <div className="space-y-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-12 rounded-lg bg-gray-50 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNav />
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
      <footer className="border-t border-gray-100 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold text-gray-500">ExitShock<span className="text-blue-500">AI</span></span>
            <span>&middot;</span>
            <span>Procurement Risk Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-wider">
            <span>82,569 Records</span>
            <span>&middot;</span>
            <span>$64.3B Analyzed</span>
            <span>&middot;</span>
            <span>Team nullEntity</span>
            <span>&middot;</span>
            <span>Agency 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}