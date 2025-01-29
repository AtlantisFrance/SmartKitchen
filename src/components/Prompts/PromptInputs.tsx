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
  return (
    <div className="space-y-4 mb-6">
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
  );
}