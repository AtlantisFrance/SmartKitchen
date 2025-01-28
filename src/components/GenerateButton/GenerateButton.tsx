import { RefreshCw, Image as ImageIcon } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  generating: boolean;
}

export function GenerateButton({ onClick, disabled, generating }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg 
                flex items-center justify-center transition duration-150 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {generating ? (
        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <ImageIcon className="w-5 h-5 mr-2" />
      )}
      {generating ? 'Generating...' : 'Generate Image'}
    </button>
  );
}