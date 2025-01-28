import { RefreshCw } from 'lucide-react';

interface ImageUrlInputProps {
  imageUrl: string;
  isImageLoading: boolean;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
}

export function ImageUrlInput({ imageUrl, isImageLoading, onUrlChange, onSubmit }: ImageUrlInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Enter image URL"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={isImageLoading}
        />
        <button
          onClick={onSubmit}
          disabled={!imageUrl || isImageLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isImageLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Preview'
          )}
        </button>
      </div>
    </div>
  );
}