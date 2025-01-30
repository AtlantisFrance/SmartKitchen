import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Uploader votre cuisine référence</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <span>Choisir un fichier</span>
              <input 
                type="file" 
                className="sr-only" 
                onChange={handleChange} 
                accept="image/*"
                onClick={(e) => {
                  // Reset the input value to allow selecting the same file again
                  (e.target as HTMLInputElement).value = '';
                }}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
        </div>
      </div>
    </div>
  );
}