import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ImageUploader } from '../components/ImageInput/ImageUploader';
import { ImagePreview } from '../components/ImagePreview/ImagePreview';
import { StatusMessages } from '../components/StatusMessages/StatusMessages';
import { GenerateButton } from '../components/GenerateButton/GenerateButton';
import { ProgressIndicator } from '../components/Progress/ProgressIndicator';
import { Trash2, ExternalLink } from 'lucide-react';

interface DepthMapResult {
  id: string;
  image_url: string;
  depth_map_url: string;
  created_at: string;
}

interface ThreeDPicturesProps {
  session: any;
}

export function ThreeDPictures({ session }: ThreeDPicturesProps) {
  const [results, setResults] = useState<DepthMapResult[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    if (session) {
      fetchResults();
    }
  }, [session]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pictures_3d')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Error fetching depth map results:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && session?.user) {
      try {
        setError(null);
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png'];
        
        if (file.size > maxSize) {
          throw new Error('File size must be less than 10MB');
        }
        
        if (!allowedTypes.includes(file.type)) {
          throw new Error('File must be JPEG or PNG');
        }

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${timestamp}-${randomString}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('depthmaps')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('depthmaps')
          .getPublicUrl(filePath);

        setImage(publicUrl);
        setSuccess('Image uploaded successfully');
      } catch (err) {
        console.error('Error uploading image:', err);
        setError(err instanceof Error ? err.message : 'Failed to upload image');
      }
    }
  };

  const generateDepthMap = async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setProgress('Initializing depth map generation...');

      // TODO: Implement depth map generation using the provided workflow
      setError('Depth map generation will be implemented when the workflow is provided');
      
    } catch (err) {
      console.error('Error generating depth map:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate depth map');
    } finally {
      setGenerating(false);
      setProgress('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    try {
      setError(null);
      const { error } = await supabase
        .from('pictures_3d')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResults(prev => prev.filter(result => result.id !== id));
      setSuccess('Result deleted successfully');
    } catch (err) {
      console.error('Error deleting result:', err);
      setError('Failed to delete result');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Depth Map Generation</h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload an image to generate its depth map using AI
          </p>
        </div>

        <div className="p-6 space-y-6">
          <ImageUploader onImageUpload={handleImageUpload} />
          
          <ImagePreview 
            image={image}
            onError={() => {
              setError('Failed to load image');
              setImage(null);
            }}
          />

          <GenerateButton
            onClick={generateDepthMap}
            disabled={generating || !image}
            generating={generating}
          />

          <ProgressIndicator progress={progress} />
        </div>
      </div>

      <StatusMessages error={error} success={success} />

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {results.map((result) => (
          <div key={result.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative aspect-video">
              <img
                src={result.image_url}
                alt="Original"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-30 transition-opacity" />
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(result.id)}
                  className="p-2 bg-white rounded-full text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <a
                  href={result.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="relative aspect-video">
              <img
                src={result.depth_map_url}
                alt="Depth Map"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-30 transition-opacity" />
              <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                <a
                  href={result.depth_map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500">
                Generated on {new Date(result.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}