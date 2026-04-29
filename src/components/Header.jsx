import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCase } = useAppState();
  const isHome = location.pathname === '/';

  const riskPill = selectedCase
    ? selectedCase.risk_level === 'Critical' ? 'bg-danger-subtle text-danger'
    : selectedCase.risk_level === 'High' ? 'bg-warning-subtle text-warning'
    : 'bg-success-subtle text-success'
    : '';

  return (
    <header className="flex items-center gap-4 px-6 h-14 bg-white border-b border-border shrink-0 z-50">
      {!isHome && (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-text-muted hover:text-accent transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium">Cases</span>
        </button>
      )}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
          <ShieldAlert className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-[15px] font-bold text-text tracking-tight">
          ExitShock<span className="text-text-muted font-medium ml-0.5">AI</span>
        </h1>
      </div>
      {!isHome && selectedCase && (
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-text-secondary font-medium">{selectedCase.vendor}</span>
          <span className={'pill ' + riskPill}>{selectedCase.risk_level}</span>
        </div>
      )}
    </header>
  );
}
