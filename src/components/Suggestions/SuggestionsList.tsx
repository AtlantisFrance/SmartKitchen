import { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';

interface Suggestion {
  id: string;
  name: string;
  description: string;
  positivePrompt: string;
  negativePrompt: string;
  seed?: string;
  previewUrl: string;
}

interface SuggestionsListProps {
  onSelect: (suggestion: Suggestion) => void;
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'modern-minimal',
    name: 'Cuisine Moderne Minimaliste',
    description: 'Design épuré avec des lignes nettes et des surfaces lisses',
    positivePrompt: 'modern minimalist kitchen, clean lines, handleless cabinets, matte finish, neutral colors, sleek appliances, hidden storage, island counter, pendant lights, natural light, high-end, professional, architectural visualization',
    negativePrompt: 'clutter, ornate details, traditional style, rustic, dark, busy patterns',
    seed: '42789',
    previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920&h=1080'
  },
  {
    id: 'scandinavian',
    name: 'Style Scandinave',
    description: 'Ambiance chaleureuse avec bois clair et tons naturels',
    positivePrompt: 'scandinavian kitchen design, light wood cabinets, white walls, natural materials, functional design, open shelving, simple hardware, plenty of natural light, cozy atmosphere, hygge, professional photo',
    negativePrompt: 'dark colors, heavy ornamentation, cluttered space, artificial looking',
    seed: '98234',
    previewUrl: 'https://images.unsplash.com/photo-1556912173-3c66f687b3c3?auto=format&fit=crop&q=80&w=1920&h=1080'
  },
  {
    id: 'industrial',
    name: 'Style Industriel',
    description: 'Mélange de métal, bois brut et surfaces texturées',
    positivePrompt: 'industrial style kitchen, exposed brick walls, metal fixtures, concrete countertops, open shelving, pendant lights, stainless steel appliances, wood and metal mix, urban loft style, professional photography',
    negativePrompt: 'country style, pastel colors, delicate details, traditional elements',
    seed: '67453',
    previewUrl: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&q=80&w=1920&h=1080'
  },
  {
    id: 'luxury',
    name: 'Cuisine Luxueuse',
    description: 'Finitions haut de gamme et matériaux nobles',
    positivePrompt: 'luxury kitchen design, marble countertops, high-end appliances, crystal chandelier, custom cabinetry, gold or brass fixtures, dramatic lighting, spacious layout, professional, architectural visualization',
    negativePrompt: 'budget materials, simple design, rustic elements, cluttered space',
    seed: '12567',
    previewUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1920&h=1080'
  }
];

export function SuggestionsList({ onSelect }: SuggestionsListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        <div className="flex items-center">
          <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-700">Vos suggestions</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {SUGGESTIONS.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`group relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                selectedId === suggestion.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedId(suggestion.id);
                onSelect(suggestion);
              }}
            >
              {/* Image Container with 16:9 aspect ratio */}
              <div className="relative pb-[56.25%]">
                <img
                  src={suggestion.previewUrl}
                  alt={suggestion.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Overlay Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {suggestion.name}
                  </h3>
                  <p className="text-sm text-gray-200">
                    {suggestion.description}
                  </p>
                </div>

                {/* Selection Indicator */}
                {selectedId === suggestion.id && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}