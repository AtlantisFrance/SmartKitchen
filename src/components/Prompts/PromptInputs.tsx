interface PromptInputsProps {
  positivePrompt: string;
  negativePrompt: string;
  onPositivePromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
}

export function PromptInputs({
  positivePrompt,
  negativePrompt,
  onPositivePromptChange,
  onNegativePromptChange
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
    </div>
  );
}