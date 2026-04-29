import { useState, useRef, useCallback } from 'react';
import { useAppState } from '../context/AppStateContext';
import VendorCaseFile from '../components/VendorCaseFile';
import AIAnalystPanel from '../components/AIAnalystPanel';
import ExportMemo from '../components/ExportMemo';
import AnalysisSequence from '../components/AnalysisSequence';
import { DemoNote } from '../components/DemoMode';
import { motion } from 'framer-motion';
import { FileSearch, ShieldAlert } from 'lucide-react';

export default function RiskAnalysisPage() {
  const { selectedCase } = useAppState();
  const [analyzing, setAnalyzing] = useState(false);
  const prevCaseId = useRef(null);

  // Trigger analysis sequence on case change
  if (selectedCase && selectedCase.case_id !== prevCaseId.current) {
    if (prevCaseId.current !== null) {
      // Only show analysis for case switches, not initial load
      setAnalyzing(true);
    }
    prevCaseId.current = selectedCase.case_id;
  }

  const handleAnalysisComplete = useCallback(() => setAnalyzing(false), []);

  return (
    <div className="p-6 h-full overflow-y-auto relative">
      {/* Aurora blobs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-amber-500/[0.03] blur-[100px] pointer-events-none animate-[aurora-shift_12s_ease-in-out_infinite]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 relative"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-2.5 clay rounded-xl"
          >
            <FileSearch className="w-5 h-5 text-amber-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Risk Analysis</h2>
            <p className="text-sm text-text-secondary">
              {selectedCase
                ? `Deep dive into ${selectedCase.vendor}`
                : 'Select a vendor case to analyze'}
            </p>
          </div>
        </div>
        <div className="mt-3 w-16 h-1 rounded-full bg-gradient-to-r from-amber-500 to-red-500" />
      </motion.div>

      {selectedCase ? (
        analyzing ? (
          <AnalysisSequence vendorName={selectedCase.vendor} onComplete={handleAnalysisComplete} />
        ) : (
        <div className="max-w-5xl relative space-y-8">
          <DemoNote step={3} />
          <VendorCaseFile selectedCase={selectedCase} />

          {/* AI Analyst Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-4">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="p-2.5 clay rounded-xl">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Analyst</h2>
                <p className="text-sm text-text-secondary">AI-assisted procurement review grounded in observed data</p>
              </div>
            </div>
            <DemoNote step={6} />
            <AIAnalystPanel selectedCase={selectedCase} />
          </motion.div>

          {/* Export Memo */}
          <ExportMemo selectedCase={selectedCase} />
        </div>
        )
      ) : (
        <div className="flex items-center justify-center h-64 glass rounded-2xl">
          <p className="text-text-muted font-medium">
            Select a vendor case from the sidebar to begin analysis.
          </p>
        </div>
      )}
    </div>
  );
}
