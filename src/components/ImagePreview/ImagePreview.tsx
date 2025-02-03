import { useState } from 'react';

interface ImagePreviewProps {
  image: string | null;
  onError: () => void;
}

export function ImagePreview({ image, onError }: ImagePreviewProps) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  if (!image) return null;

  return (
    <div className="mt-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Preview</h3>
        {dimensions && (
          <span className="text-sm text-gray-500">
            {dimensions.width} × {dimensions.height}px
          </span>
        )}
      </div>
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <img 
          src={image} 
          alt="Preview" 
          className="max-h-48 w-full object-contain bg-gray-50"
          onError={onError}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            setDimensions({
              width: img.naturalWidth,
              height: img.naturalHeight
            });
          }}
          loading="eager"
          crossOrigin="anonymous"
        />
      </div>
      <div className="mt-2 flex flex-col gap-1">
        <p className="text-sm text-gray-500 break-all">
          Image URL: {image}
        </p>
      </div>
    </div>
  );
}