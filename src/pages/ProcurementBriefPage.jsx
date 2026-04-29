import { useAppState } from '../context/AppStateContext';
import ProcurementBrief from '../components/ProcurementBrief';
import ExportMemo from '../components/ExportMemo';
import { FileText } from 'lucide-react';

export default function ProcurementBriefPage() {
  const { selectedCase } = useAppState();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-accent" />
            <h1 className="text-2xl font-bold text-text">Procurement Brief</h1>
          </div>
          <p className="text-sm text-text-muted">
            {selectedCase
              ? `Assessment for ${selectedCase.vendor}`
              : 'Select a vendor to generate a brief'}
          </p>
        </div>

        {selectedCase ? (
          <div className="space-y-6">
            <ProcurementBrief selectedCase={selectedCase} />
            <div className="card p-4 flex items-center justify-between">
              <p className="text-sm text-text-muted">Export as formal procurement memo</p>
              <ExportMemo selectedCase={selectedCase} />
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-sm text-text-muted">Select a vendor case from the home page to generate a brief.</p>
          </div>
        )}
      </div>
    </div>
  );
}
