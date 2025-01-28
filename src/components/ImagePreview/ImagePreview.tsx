interface ImagePreviewProps {
  image: string | null;
  onError: () => void;
}

export function ImagePreview({ image, onError }: ImagePreviewProps) {
  if (!image) return null;

  return (
    <div className="mt-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <img 
          src={image} 
          alt="Preview" 
          className="max-h-48 w-full object-contain bg-gray-50"
          onError={onError}
          loading="eager"
          crossOrigin="anonymous"
        />
      </div>
      <p className="mt-2 text-sm text-gray-500 break-all">
        Image URL: {image}
      </p>
    </div>
  );
}