import { Coins } from 'lucide-react';

interface BalanceDisplayProps {
  balance: number | null;
  loading: boolean;
}

export function BalanceDisplay({ balance, loading }: BalanceDisplayProps) {
  return (
    <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2">
      <Coins className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
      <p className="text-lg font-bold text-blue-600 leading-none">
        {loading ? '...' : balance !== null ? balance.toFixed(2) : '---'}
      </p>
    </div>
  );
}