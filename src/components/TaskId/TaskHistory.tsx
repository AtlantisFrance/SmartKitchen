import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { History, ExternalLink, Copy, Check } from 'lucide-react';

interface TaskHistoryProps {
  onTaskSelect: (taskId: string) => void;
}

export function TaskHistory({ onTaskSelect }: TaskHistoryProps) {
  const [tasks, setTasks] = useState<{ task_id: string, created_at: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('result_images')
        .select('task_id, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching task history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(taskId);
      setCopiedId(taskId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <History className="w-4 h-4 mr-2" />
        Task History
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />
      <div className="fixed right-4 top-24 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No tasks found</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task, index) => (
                <li key={task.task_id}>
                  <button
                    onClick={() => {
                      onTaskSelect(task.task_id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          Task #{tasks.length - index}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(task.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                        {task.task_id}
                      </p>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(task.task_id, e);
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Copy Task ID"
                    >
                      {copiedId === task.task_id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}