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
    id: 'scandinavian',
    name: 'Style Scandinave',
    description: 'Design épuré mélange de meuble clair et de bois',
    positivePrompt: 'A Scandinavian kitchen with a bright, functional, and inviting atmosphere. ((The ground)) is light oak wood or soft whitewashed flooring, ensuring warmth and openness. ((The furniture finish)) is matte white or soft pastel with seamless lines, emphasizing simplicity. ((The counter and backsplash)) are natural wood, white stone, or light ceramic tile, creating a fresh and clean aesthetic. ((The walls)) remain soft white or pastel, enhancing brightness. ((The lighting)) includes warm LED strips, woven pendant lamps, and natural daylight emphasis, creating a cozy yet functional space. The atmosphere is calm, airy, and balanced, with natural materials and soft tones enhancing a welcoming Nordic-inspired aesthetic.',
    negativePrompt: 'ugly, deformed, bad anatomy, distorted walls, blurry image, poor lighting, oversaturated colors, bad composition, unrealistic textures, low quality render',
    seed: '98234',
    previewUrl: 'https://vpgawuzrkdfkmcqijjcm.supabase.co/storage/v1/object/public/website-pictures//scandinavian.png'
  },
  {
    id: 'industrial',
    name: 'Style Industriel',
    description: 'Mélange de métal, bois brut et surfaces texturées',
    positivePrompt: 'An industrial-style kitchen featuring raw materials and bold contrasts. ((The ground)) is polished concrete or dark wood, enhancing the rugged aesthetic. ((The furniture finish)) is dark metal, reclaimed wood, or black matte surfaces, creating an urban loft ambiance. ((The counter and backsplash)) are raw stone, oxidized metal, or exposed brick, reinforcing the industrial aesthetic. ((The walls)) incorporate rough concrete, exposed brick, or dark-toned paint, emphasizing texture and character. ((The lighting)) consists of exposed filament bulbs, hanging metal fixtures, and black steel frames, enhancing the warehouse-inspired design. The atmosphere is bold, urban, and functional, celebrating raw, unrefined materials with a sophisticated edge.',
    negativePrompt: 'ugly, deformed, bad architecture, poor quality, blurry details, incorrect perspective, unrealistic materials, bad shadows, amateur photo, distorted space',
    seed: '67453',
    previewUrl: 'https://vpgawuzrkdfkmcqijjcm.supabase.co/storage/v1/object/public/website-pictures//industrial.png'
  },
  {
    id: 'vintage',
    name: 'Cuisine Vintage',
    description: 'Style botanique vintage avec charme rustique et naturel',
    positivePrompt: '((Vintage greenhouse kitchen, botanical and rustic charm.))\n\n((The ground)) is black-and-white checkered tiles with a worn, vintage aesthetic, adding character and contrast.\n((The furniture finish)) is muted sage green cabinetry with classic paneling and dark metal knobs, enhancing the nostalgic charm.\n((The counter and backsplash)) feature warm butcher block wood countertops paired with vintage square ceramic tiles in earthy tones, creating a cozy and inviting workspace.\n((The walls and windows)) are deep forest green with expansive metal-framed glass panels, flooding the space with natural light and seamlessly blending the indoors with the lush outdoor greenery.\n((The lighting)) includes vintage brass pendant lamps, warm under-cabinet lighting, and soft daylight filtering through large glass windows, ensuring a natural and warm ambiance.\n\nThe atmosphere is organic, eclectic, and nostalgic, with an abundance of potted plants, earthy ceramics, and textured vintage elements enhancing the greenhouse-inspired aesthetic.',
    negativePrompt: 'ugly, deformed, bad quality, unrealistic colors, poor lighting, distorted perspective, blurry details, incorrect vintage style, amateur composition, bad architecture',
    seed: '34521',
    previewUrl: 'https://vpgawuzrkdfkmcqijjcm.supabase.co/storage/v1/object/public/website-pictures//natural.png'
  },
  {
    id: 'rustic',
    name: 'Cuisine Rustique',
    description: 'Ambiance chaleureuse avec matériaux naturels et bois apparent',
    positivePrompt: '((Rustic farmhouse kitchen, warm and traditional design.))\n\n((The ground)) is natural light wood with visible grain, creating a warm and organic foundation.\n((The furniture finish)) is solid natural wood with carved details and dark metal hardware, showcasing artisanal craftsmanship.\n((The counter and backsplash)) are a mix of thick butcher block wood and polished white marble with soft veining, balancing warmth and elegance.\n((The walls)) feature exposed natural stone with a textured, earthy appearance, paired with soft white paint to enhance brightness.\n((The lighting)) includes wrought-iron pendant lamps with vintage glass shades, recessed ceiling spotlights, and natural daylight filtering through large windows, creating a cozy ambiance.\n\nThe atmosphere is inviting, warm, and rich in texture, blending raw materials with classic country charm.',
    negativePrompt: 'ugly, deformed, unrealistic textures, bad lighting, poor quality, blurry details, incorrect materials, distorted space, amateur photo, bad composition',
    seed: '89765',
    previewUrl: 'https://vpgawuzrkdfkmcqijjcm.supabase.co/storage/v1/object/public/website-pictures//rustic.png'
  },
  {
    id: 'modern',
    name: 'Cuisine Moderne',
    description: 'Design contemporain avec lignes épurées et technologie intégrée',
    positivePrompt: 'A sophisticated modern kitchen with ((sleek handleless cabinets)) in high-gloss finish, featuring integrated smart appliances. ((The countertops)) are premium quartz or polished concrete with waterfall edges. ((The backsplash)) is large-format glass panels with subtle metallic sheen. ((The lighting)) combines recessed LED strips, minimalist pendant lights over a central island, and under-cabinet illumination. ((The appliances)) are fully integrated with touch controls and smart features. ((The layout)) emphasizes clean lines with a large central island featuring a cantilevered breakfast bar. ((The color palette)) focuses on sophisticated grays, whites, and subtle metallic accents. The space includes hidden storage solutions and state-of-the-art ventilation. Professional architectural visualization with perfect composition and lighting.',
    negativePrompt: 'ugly, deformed, bad quality, unrealistic reflections, poor lighting, blurry surfaces, incorrect perspective, amateur render, distorted space, bad architecture',
    seed: '23456',
    previewUrl: 'https://iili.io/2tK4Jjt.png'
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
          <span className="text-sm font-medium text-blue-700">vos suggestions de design</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUGGESTIONS.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`group relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 shadow-lg hover:shadow-xl ${
                selectedId === suggestion.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedId(suggestion.id);
                onSelect(suggestion);
              }}
            >
              {/* Image Container with 16:9 aspect ratio */}
              <div className="relative aspect-[4/3]">
                <img
                  src={suggestion.previewUrl}
                  alt={suggestion.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 bg-gray-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Overlay Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {suggestion.name}
                  </h3>
                  <p className="text-sm text-gray-100 line-clamp-2">
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