import { Search } from 'lucide-react';

interface QueryButtonProps {
  onQuery: () => void;
  disabled: boolean;
}

export function QueryButton({ onQuery, disabled }: QueryButtonProps) {
  return (
    <button
      onClick={onQuery}
      disabled={disabled}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Search className="w-4 h-4 mr-2" />
      Query Status
    </button>
  );
}