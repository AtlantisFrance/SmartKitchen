import { RefreshCw } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: string;
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  if (!progress) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center">
        <RefreshCw className="w-4 h-4 mr-2 text-blue-600 animate-spin" />
        <p className="text-sm text-blue-600">{progress}</p>
      </div>
    </div>
  );
}