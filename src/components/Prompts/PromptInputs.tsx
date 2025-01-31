import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PromptInputsProps {
  positivePrompt: string;
  negativePrompt: string;
  seed: string;
  onPositivePromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
  onSeedChange: (value: string) => void;
}

export function PromptInputs({
  positivePrompt,
  negativePrompt,
  seed,
  onPositivePromptChange,
  onNegativePromptChange,
  onSeedChange
}: PromptInputsProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">Paramètres avancés</span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      <div className={`mt-4 space-y-4 transition-all duration-200 ${isAdvancedOpen ? 'block' : 'hidden'}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Positive Prompt</label>
          <textarea
            value={positivePrompt}
            onChange={(e) => onPositivePromptChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Negative Prompt</label>
          <textarea
            value={negativePrompt}
            onChange={(e) => onNegativePromptChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Seed</label>
          <input
            type="number"
            value={seed}
            onChange={(e) => onSeedChange(e.target.value)}
            placeholder="Enter a seed number (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty for random seed
          </p>
        </div>
      </div>
    </div>
  );
}