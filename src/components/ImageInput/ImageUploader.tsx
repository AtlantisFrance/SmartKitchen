import { Upload } from 'lucide-react';
import { useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDrop?: (url: string) => void;
}

export function ImageUploader({ onImageUpload, onImageDrop }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // Try to get URL from text/plain data
    const textData = e.dataTransfer.getData('text/plain');
    if (textData && textData.startsWith('http') && onImageDrop) {
      onImageDrop(textData);
      return;
    }

    // Handle dropped files
    if (e.dataTransfer.files?.length > 0) {
      const file = e.dataTransfer.files[0];
      const fakeEvent = {
        target: {
          files: [file]
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onImageUpload(fakeEvent);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Uploader votre cuisine référence</label>
      <div 
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <span>Choisir un fichier</span>
              <input 
                type="file" 
                className="sr-only" 
                onChange={onImageUpload} 
                accept="image/*"
                onClick={(e) => {
                  // Reset the input value to allow selecting the same file again
                  (e.target as HTMLInputElement).value = '';
                }}
              />
            </label>
            <p className="pl-1">ou glisser-déposer</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
        </div>
      </div>
    </div>
  );
}