import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ImageUploader } from '../components/ImageInput/ImageUploader';
import { ImageUrlInput } from '../components/ImageInput/ImageUrlInput';
import { InputMethodToggle } from '../components/ImageInput/InputMethodToggle';
import { ImagePreview } from '../components/ImagePreview/ImagePreview';
import { PromptInputs } from '../components/Prompts/PromptInputs';
import { GeneratedImagesList } from '../components/GeneratedImages/GeneratedImagesList';
import { StatusMessages } from '../components/StatusMessages/StatusMessages';
import { GenerateButton } from '../components/GenerateButton/GenerateButton';
import { ProgressIndicator } from '../components/Progress/ProgressIndicator';
import { TaskIdDisplay } from '../components/TaskId/TaskIdDisplay';

interface ApiResponse {
  data?: {
    balances: number;
  };
  success: boolean;
  errorMsg: string;
}

interface GenerationResponse {
  data?: {
    task_id: string;
  };
  success: boolean;
  errorMsg: string;
}

interface StatusResponse {
  success: boolean;
  errorMsg?: string;
  data?: {
    output: {
      output_url_list: string[];
    };
    state: string;
    execution_time?: number;
  };
}

interface Generation {
  id: string;
  images: string[];
  positivePrompt: string;
  negativePrompt: string;
  timestamp: number;
}

interface DepthPageProps {
  session: any;
}

export function DepthPage({ session }: DepthPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [sessionGenerations, setSessionGenerations] = useState<Generation[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<'file' | 'url'>('file');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isImageValid, setIsImageValid] = useState(false);

  const token = '49be0c4f-0a33-4a4a-a602-4f6f46a37a96';

  const resetForm = () => {
    setImage(null);
    setImageUrl('');
    setPositivePrompt('');
    setNegativePrompt('');
    setGeneratedImages([]);
    setSessionGenerations([]);
    setError(null);
    setSuccess(null);
    setProgress('');
    setTaskId(null);
    setGenerating(false);
  };

  const handleDeleteGeneration = async (generationId: string) => {
    try {
      setError(null);
      
      setSessionGenerations(prev => prev.filter(gen => gen.id !== generationId));
      
      if (generationId === taskId) {
        setGeneratedImages([]);
      }
      
      if (session?.user) {
        const { error: deleteError } = await supabase
          .from('result_images')
          .delete()
          .eq('task_id', generationId)
          .eq('user_id', session.user.id);

        if (deleteError) throw deleteError;
      }
      
      setSuccess('Generation deleted successfully');
    } catch (err) {
      console.error('Failed to delete generation:', err);
      setError('Failed to delete generation');
    }
  };

  const queryTaskStatus = async (taskId: string): Promise<StatusResponse | null> => {
    try {
      console.log(`[Status Check] Querying status for task: ${taskId}`);
      
      const response = await fetch("https://api.comfyonline.app/api/query_run_workflow_status", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ task_id: taskId })
      });
      
      if (!response.ok) {
        console.error(`[Status Check] HTTP error: ${response.status}`);
        throw new Error('Status check failed');
      }

      const data: StatusResponse = await response.json();
      console.log('[Status Check] Response:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('[Status Check] Error:', error);
      return null;
    }
  };

  const pollStatus = async (taskId: string) => {
    let attempts = 0;
    const maxAttempts = 30;
    setTaskId(taskId);
    console.log(`[Polling] Starting polling for task: ${taskId}`);
    
    while (attempts < maxAttempts) {
      setProgress(`Checking status... Attempt ${attempts + 1}/${maxAttempts}`);
      console.log(`[Polling] Attempt ${attempts + 1}/${maxAttempts}`);
      
      const status = await queryTaskStatus(taskId);
      console.log(`[Polling] Status response:`, JSON.stringify(status, null, 2));
      
      if (!status) {
        console.error('[Polling] Failed to get status');
        setError('Failed to check generation status');
        setGenerating(false);
        setProgress('');
        setTaskId(null);
        break;
      }

      if (status.success && status.data?.state === 'COMPLETED') {
        console.log('[Polling] Generation completed');
        if (status.data.output?.output_url_list) {
          const urls = status.data.output.output_url_list;
          console.log('[Polling] Output URLs:', urls);
          
          const newGeneration: Generation = {
            id: taskId,
            images: urls,
            positivePrompt,
            negativePrompt,
            timestamp: Date.now()
          };
          
          setSessionGenerations(prev => [...prev, newGeneration]);
          setGeneratedImages(urls);
          setSuccess('Image generated successfully!');
          
          if (session?.user) {
            try {
              const { error: insertError } = await supabase
                .from('result_images')
                .insert({
                  user_id: session.user.id,
                  image_url: urls[0],
                  task_id: taskId,
                  positive_prompt: positivePrompt,
                  negative_prompt: negativePrompt
                });
              
              if (insertError) throw insertError;
            } catch (err) {
              console.error('Failed to save result to database:', err);
            }
          }
        } else {
          console.warn('[Polling] No URLs in completed status');
          setError('No output images received');
        }
        setGenerating(false);
        setProgress('');
        setTaskId(null);
        break;
      } else if (!status.success || status.errorMsg || status.data?.state === 'ERROR') {
        console.error('[Polling] Generation failed:', status.errorMsg);
        setError(status.errorMsg || 'Generation failed');
        setGenerating(false);
        setProgress('');
        setTaskId(null);
        break;
      } else if (status.data?.state === 'PROCESSING') {
        console.log('[Polling] Still processing...');
        setProgress(`Processing image... (Attempt ${attempts + 1}/${maxAttempts})`);
      }
      
      attempts++;
      if (attempts === maxAttempts) {
        console.error('[Polling] Reached maximum attempts');
        setError('Generation timed out');
        setGenerating(false);
        setProgress('');
        setTaskId(null);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && session?.user) {
      try {
        setError(null);
        setSuccess(null);
        
        const previewUrl = URL.createObjectURL(file);
        setImage(previewUrl);
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('depthmaps')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('depthmaps')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase
          .from('depthmaps')
          .insert({
            user_id: session.user.id,
            image_path: filePath
          });

        if (insertError) throw insertError;

        setImage(publicUrl);
        setSuccess('Image uploaded successfully');
        
        URL.revokeObjectURL(previewUrl);
      } catch (err) {
        console.error('[Image Upload] Error:', err);
        setError('Failed to upload image');
        setImage(null);
      }
    }
  };

  const validateImageUrl = (url: string) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl || !session?.user) return;
    
    setIsImageLoading(true);
    setIsImageValid(false);
    setError(null);
    
    try {
      const isValid = await validateImageUrl(imageUrl);
      if (isValid) {
        const { error: insertError } = await supabase
          .from('depthmaps')
          .insert({
            user_id: session.user.id,
            image_path: imageUrl
          });

        if (insertError) throw insertError;

        setImage(imageUrl);
        setIsImageValid(true);
        setError(null);
      } else {
        setError('Invalid image URL or image failed to load');
        setImage(null);
        setIsImageValid(false);
      }
    } catch (err) {
      console.error('[URL Input] Error:', err);
      setError('Failed to load image from URL');
      setImage(null);
      setIsImageValid(false);
    } finally {
      setIsImageLoading(false);
    }
  };

  const generateImage = async () => {
    if (!session) {
      setError('Please sign in to generate images');
      return;
    }

    if (!image) {
      setError('Please provide an image first');
      return;
    }

    if (inputMethod === 'url' && !isImageValid) {
      setError('Please wait for the image to load and validate');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);
    setProgress('Starting generation...');
    
    try {
      console.log('[Generation] Starting new generation');
      const body = {
        input: {
          CLIPTextEncode_text_7: negativePrompt,
          LoadImage_image_17: image,
          CLIPTextEncode_text_23: positivePrompt
        },
        workflow_id: "a254baa6-52eb-4a06-9a0f-ad9a9619b842",
        webhook: ""
      };

      console.log('[Generation] Sending request');
      const response = await fetch("https://api.comfyonline.app/api/run_workflow", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error('[Generation] HTTP error:', response.status);
        throw new Error('Failed to start generation');
      }

      const data: GenerationResponse = await response.json();
      console.log('[Generation] Response:', JSON.stringify(data, null, 2));
      
      if (!data.success) {
        console.error('[Generation] API error:', data.errorMsg);
        throw new Error(data.errorMsg || 'Generation failed to start');
      }
      
      if (data.data?.task_id) {
        console.log('[Generation] Got task ID:', data.data.task_id);
        await pollStatus(data.data.task_id);
      } else {
        console.error('[Generation] No task ID in response');
        throw new Error('No task ID received');
      }
    } catch (err) {
      console.error('[Generation] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      setGenerating(false);
      setProgress('');
      setTaskId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Kitchen Image Generation</h2>
            <button
              onClick={resetForm}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              New Generation
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          <InputMethodToggle 
            inputMethod={inputMethod}
            onMethodChange={setInputMethod}
          />

          {inputMethod === 'file' ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <ImageUrlInput
              imageUrl={imageUrl}
              isImageLoading={isImageLoading}
              onUrlChange={setImageUrl}
              onSubmit={handleUrlSubmit}
            />
          )}

          <ImagePreview 
            image={image}
            onError={() => {
              setError('Failed to load image');
              setImage(null);
            }}
          />

          <PromptInputs
            positivePrompt={positivePrompt}
            negativePrompt={negativePrompt}
            onPositivePromptChange={setPositivePrompt}
            onNegativePromptChange={setNegativePrompt}
          />

          <TaskIdDisplay taskId={taskId} />

          <GenerateButton
            onClick={generateImage}
            disabled={generating || !image || (inputMethod === 'url' && !isImageValid)}
            generating={generating}
          />

          <ProgressIndicator progress={progress} />
        </div>
      </div>

      {/* Results Panel */}
      <div className="space-y-6">
        <GeneratedImagesList 
          generations={sessionGenerations}
          currentImages={generatedImages}
          onDelete={handleDeleteGeneration}
        />

        <StatusMessages error={error} success={success} />
      </div>
    </div>
  );
}