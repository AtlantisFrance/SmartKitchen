import { Upload, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ImageUploaderProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDrop?: (url: string) => void;
  isUploading?: boolean;
}

interface GeneratedImage {
  id: string;
  image_url: string;
  created_at: string;
}

export function ImageUploader({ onImageUpload, onImageDrop, isUploading = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratedImagesOpen, setIsGeneratedImagesOpen] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchGeneratedImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('result_images')
        .select('id, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setGeneratedImages(data || []);
    } catch (err) {
      console.error('Error fetching generated images:', err);
    } finally {
      setLoading(false);
    }
  };

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

    setValidationError(null);

    // Try to get URL from text/plain data
    const textData = e.dataTransfer.getData('text/plain');
    if (textData && textData.startsWith('http') && onImageDrop) {
      onImageDrop(textData);
      return;
    }

    // Handle dropped files
    if (e.dataTransfer.files?.length > 0) {
      const file = e.dataTransfer.files[0];
      
      try {
        await validateImage(file);
        const fakeEvent = {
          target: {
            files: [file]
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onImageUpload(fakeEvent);
      } catch (err) {
        setValidationError(err instanceof Error ? err.message : 'Invalid image');
      }
    }
  };

  const validateImage = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check file type
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        reject(new Error('Only JPG and PNG files are allowed'));
        return;
      }

      // Check file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        reject(new Error('File size must be less than 10MB'));
        return;
      }

      // Check image dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        if (img.height > 1280) {
          reject(new Error('Image height must be 1280 pixels or less'));
          return;
        }

        resolve();
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = objectUrl;
    });
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);

    try {
      await validateImage(file);
      onImageUpload(e);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Invalid image');
      // Reset the input
      e.target.value = '';
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Uploader votre cuisine référence</label>
      
      {/* Generated Images Button */}
      <button
        onClick={() => {
          setIsGeneratedImagesOpen(!isGeneratedImagesOpen);
          if (!isGeneratedImagesOpen) {
            fetchGeneratedImages();
          }
        }}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mb-4"
      >
        <div className="flex items-center">
          <ImageIcon className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-700">Choisir une image générée précédemment comme référence pour votre cuisine</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-blue-600 transition-transform ${isGeneratedImagesOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Generated Images Grid */}
      {isGeneratedImagesOpen && (
        <div className="mb-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : generatedImages.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No generated images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {generatedImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square cursor-pointer group"
                  onClick={() => {
                    if (onImageDrop) {
                      onImageDrop(image.image_url);
                    }
                    setIsGeneratedImagesOpen(false);
                  }}
                >
                  <img
                    src={image.image_url}
                    alt={`Generated on ${new Date(image.created_at).toLocaleDateString()}`}
                    className="w-full h-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 rounded-lg" />
                  <div className="absolute bottom-2 left-2 right-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {new Date(image.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {isUploading ? (
        <div className="mt-1 flex flex-col items-center justify-center px-6 py-12 border-2 border-blue-200 rounded-lg bg-blue-50">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-blue-600 font-medium">Uploading image...</p>
        </div>
      ) : (
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
                  onChange={handleFileInputChange} 
                  accept="image/jpeg,image/png"
                  onClick={(e) => {
                    // Reset the input value to allow selecting the same file again
                    (e.target as HTMLInputElement).value = '';
                  }}
                />
              </label>
              <p className="pl-1">ou glisser-déposer</p>
            </div>
            <p className="text-xs text-gray-500">PNG ou JPG jusqu'à 10MB, hauteur max 1280px</p>
            {validationError && (
              <p className="text-xs text-red-600 mt-2">{validationError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}