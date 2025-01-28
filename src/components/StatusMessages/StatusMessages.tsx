import { AlertCircle } from 'lucide-react';

interface StatusMessagesProps {
  error: string | null;
  success: string | null;
}

export function StatusMessages({ error, success }: StatusMessagesProps) {
  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}
    </>
  );
}