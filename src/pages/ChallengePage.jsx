import ExitShockChallenge from '../components/ExitShockChallenge';
import { useAppState } from '../context/AppStateContext';

export default function ChallengePage() {
  const { backtests } = useAppState();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <ExitShockChallenge backtests={backtests} />
    </div>
  );
}
