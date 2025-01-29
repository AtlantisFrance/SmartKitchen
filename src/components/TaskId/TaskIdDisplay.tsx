import { QueryButton } from './QueryButton';

interface TaskIdDisplayProps {
  taskId: string | null;
  onQuery?: () => void;
  isQuerying?: boolean;
}

export function TaskIdDisplay({ taskId, onQuery, isQuerying }: TaskIdDisplayProps) {
  if (!taskId) return null;

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
      <p className="text-sm text-gray-600">
        <span className="font-medium">Task ID:</span> {taskId}
      </p>
      {onQuery && (
        <QueryButton
          onQuery={onQuery}
          disabled={isQuerying || !taskId}
        />
      )}
    </div>
  );
}