import { Wallet } from 'lucide-react';

interface BalanceDisplayProps {
  balance: number | null;
  loading: boolean;
}

export function BalanceDisplay({ balance, loading }: BalanceDisplayProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-center mb-4">
        <Wallet className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Credit Balance</h2>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-600">
          {loading ? '...' : balance !== null ? `$${balance.toFixed(2)}` : '---'}
        </p>
      </div>
    </div>
  );
}