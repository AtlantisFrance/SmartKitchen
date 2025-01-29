import { RefreshCw } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: string;
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  if (!progress) return null;

  // Extract attempt numbers from the progress string
  const attemptMatch = progress.match(/Attempt (\d+)\/(\d+)/);
  const isCompleted = progress.includes('100%');
  
  let progressPercentage = 0;
  if (attemptMatch) {
    const [, current, total] = attemptMatch;
    progressPercentage = Math.min(100, (parseInt(current) / parseInt(total)) * 100);
  } else if (isCompleted) {
    progressPercentage = 100;
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center mb-2">
        <RefreshCw className="w-4 h-4 mr-2 text-blue-600 animate-spin" />
        <p className="text-sm text-blue-600">{progress}</p>
      </div>
      <div className="w-full bg-blue-100 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className="text-xs text-blue-500 mt-1 text-right">
        {progressPercentage.toFixed(0)}%
      </p>
    </div>
  );
}