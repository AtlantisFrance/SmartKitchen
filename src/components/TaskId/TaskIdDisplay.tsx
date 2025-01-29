interface TaskIdDisplayProps {
  taskId: string | null;
}

export function TaskIdDisplay({ taskId }: TaskIdDisplayProps) {
  if (!taskId) return null;

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        <span className="font-medium">Task ID:</span> {taskId}
      </p>
    </div>
  );
}