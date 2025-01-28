import { Upload, Link as LinkIcon } from 'lucide-react';

interface InputMethodToggleProps {
  inputMethod: 'file' | 'url';
  onMethodChange: (method: 'file' | 'url') => void;
}

export function InputMethodToggle({ inputMethod, onMethodChange }: InputMethodToggleProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex rounded-lg border border-gray-200">
        <button
          className={`px-4 py-2 rounded-l-lg ${inputMethod === 'file' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
          onClick={() => onMethodChange('file')}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          File Upload
        </button>
        <button
          className={`px-4 py-2 rounded-r-lg ${inputMethod === 'url' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
          onClick={() => onMethodChange('url')}
        >
          <LinkIcon className="w-4 h-4 inline mr-2" />
          URL Input
        </button>
      </div>
    </div>
  );
}