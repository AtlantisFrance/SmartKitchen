import React, { useState, useEffect } from 'react';
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
import { ProjectSelector } from '../components/Projects/ProjectSelector';

interface Project {
  id: string;
  name: string;
  description?: string;
}

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
  projectName?: string;
}

interface DepthPageProps {
  session: any;
}

export default function DepthPage({ session }: DepthPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [seed, setSeed] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [sessionGenerations, setSessionGenerations] = useState<Generation[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<'file' | 'url'>('file');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isImageValid, setIsImageValid] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [manualTaskId, setManualTaskId] = useState('');
  const [isTaskIdInputOpen, setIsTaskIdInputOpen] = useState(false);

  const token = '49be0c4f-0a33-4a4a-a602-4f6f46a37a96';

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    }
  };

  const resetForm = () => {
    setImage(null);
    setImageUrl('');
    setPositivePrompt('');
    setNegativePrompt('');
    setSeed('');
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
      const startTime = Date.now();
      
      const response = await fetch("https://api.comfyonline.app/api/query_run_workflow_status", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ task_id: taskId })
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`[Status Check] Response time: ${responseTime}ms`);

      if (!response.ok) {
        console.error(`[Status Check] HTTP error: ${response.status}`);
        console.error('[Status Check] Response headers:', Object.fromEntries([...response.headers]));
        return null;
      }

      const responseText = await response.text();
      console.log('[Status Check] Raw response:', responseText);
      
      if (responseText.trim() === '') {
        console.log('[Status Check] Empty response received');
        return null;
      }

      let data: any;
      try {
        data = JSON.parse(responseText);
        
        // Check if we have a valid response structure
        if (!data || (typeof data !== 'object')) {
          console.error('[Status Check] Invalid response structure:', data);
          return null;
        }

        // If the response contains state information directly
        if (data.state) {
          return {
            success: true,
            data: {
              state: data.state,
              output: data.output || {}
            }
          };
        }

        // If the response is wrapped in a data property
        if (data.data) {
          return {
            success: true,
            data: data.data
          };
        }

        console.error('[Status Check] Unexpected response structure:', data);
        return null;
      } catch (parseError) {
        console.error('[Status Check] Failed to parse JSON:', parseError);
        return null;
      }
    } catch (error) {
      console.error('[Status Check] Error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error
      });
      return null;
    }
  };

  const handleManualQuery = async () => {
    const queryTaskId = manualTaskId || taskId;
    if (!queryTaskId) return;
    
    setIsQuerying(true);
    setError(null);
    
    try {
      const status = await queryTaskStatus(queryTaskId);
      
      if (!status) {
        throw new Error('Failed to get status');
      }

      if (status.success && status.data?.state === 'COMPLETED') {
        if (status.data.output?.output_url_list) {
          const urls = status.data.output.output_url_list;
          setGeneratedImages(urls);
          setSuccess('Generation completed!');
          
          // Update database and UI
          if (session?.user) {
            try {
              await supabase
                .from('result_images')
                .insert({
                  user_id: session.user.id,
                  image_url: urls[0],
                  seed: seed || null,
                  project_id: selectedProject?.id || null,
                  task_id: queryTaskId,
                  positive_prompt: positivePrompt,
                  negative_prompt: negativePrompt
                }).throwOnError();

              setSessionGenerations(prev => prev.map(gen => 
                gen.id === queryTaskId 
                  ? { ...gen, images: urls }
                  : gen
              ));
            } catch (err) {
              console.error('Failed to update result:', err);
            }
          }
        } else {
          throw new Error('No output images received');
        }
      } else if (status.data?.state === 'PROCESSING') {
        setSuccess('Generation is still processing');
      } else if (status.data?.state === 'ERROR' || !status.success) {
        throw new Error(status.errorMsg || 'Generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to query status');
    } finally {
      setIsQuerying(false);
    }
  };

  const pollStatus = async (taskId: string) => {
    let attempts = 0;
    const maxAttempts = 120;
    const baseInterval = 2000; // Back to 2 seconds
    let pollInterval = baseInterval;
    
    setTaskId(taskId);
    
    while (attempts < maxAttempts) {
      console.log(`[Polling] Attempt ${attempts + 1}/${maxAttempts} at ${new Date().toISOString()}`);
      const attemptStart = Date.now();
      
      const status = await queryTaskStatus(taskId);
      
      const attemptDuration = Date.now() - attemptStart;
      console.log(`[Polling] Attempt ${attempts + 1} took ${attemptDuration}ms`);
      
      if (!status) {
        console.error('[Polling] Failed to get status');
        setError('Failed to check generation status');
        setGenerating(false);
        setProgress('Error: Failed to check status - possible network issue');
        setTaskId(null);
        break;
      }

      const progressPercent = Math.min(95, (attempts / maxAttempts) * 100);
      
      // Update progress message with queue information
      if (attempts === 0) {
        setProgress('Starting generation... 0%');
      } else if (attempts < 5) {
        setProgress(`Initializing and checking queue position... ${progressPercent.toFixed(0)}%`);
      } else if (attempts < 10) {
        setProgress(`Waiting in queue... ${progressPercent.toFixed(0)}%`);
      } else {
        setProgress(`Processing image... ${progressPercent.toFixed(0)}%`);
      }

      if (status.success && status.data?.state === 'COMPLETED') {
        if (status.data.output?.output_url_list) {
          setProgress('Generation completed successfully! 100%');
          const urls = status.data.output.output_url_list;
          setGeneratedImages(urls);
          setSuccess('Image generated successfully!');
          
          if (session?.user) {
            try {
              await supabase
                .from('result_images')
                .insert({
                  user_id: session.user.id,
                  image_url: urls[0],
                  seed: seed || null,
                  project_id: selectedProject?.id || null,
                  task_id: taskId,
                  positive_prompt: positivePrompt,
                  negative_prompt: negativePrompt
                }).throwOnError();

              // Update the generation in the UI
              setSessionGenerations(prev => prev.map(gen => 
                gen.id === taskId 
                  ? { ...gen, images: urls }
                  : gen
              ));
            } catch (err) {
              console.error('Failed to update result in database:', err);
            }
          }
        } else {
          setError('No output images received');
        }
        setGenerating(false);
        setProgress('');
        setTaskId(null);
        break;
      } else if (!status.success || status.errorMsg || status.data?.state === 'ERROR') {
        setError(status.errorMsg || 'Image generation failed');
        setGenerating(false);
        setProgress('');
        setTaskId(null);
        break;
      } else if (status.data?.state === 'PROCESSING') {
        // Adjust polling interval based on attempt count
        if (attempts < 5) {
          pollInterval = baseInterval; // Check frequently at first
        } else if (attempts < 20) {
          pollInterval = baseInterval * 2; // Slow down more
        } else {
          pollInterval = baseInterval * 3; // Slow down even more for long-running tasks
        }
      }
      
      attempts++;
      if (attempts === maxAttempts) {
        setError('Generation timed out. The process took longer than expected - this might indicate high queue load.');
        setGenerating(false);
        setProgress('');
        setTaskId(null);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && session?.user) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      
      try {
        setError(null);
        setSuccess(null);
        setImage(null);
        setIsImageValid(false);
        setGenerating(false);
        setProgress('');
        
        // Validate file size
        if (file.size > maxSize) {
          throw new Error('File size must be less than 10MB');
        }
        
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          throw new Error('File must be JPEG, PNG, or GIF');
        }
        
        // Generate a unique filename using timestamp and random string
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${timestamp}-${randomString}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;
        
        setProgress('Uploading image...');
        
        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('depthmaps')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('depthmaps')
          .getPublicUrl(filePath);
        
        // Validate the public URL
        const isValid = await validateImageUrl(publicUrl);
        if (!isValid) {
          throw new Error('Failed to validate uploaded image');
        }

        // Save to database
        const { error: insertError } = await supabase
          .from('depthmaps')
          .insert({
            user_id: session.user.id,
            image_path: filePath,
            created_at: new Date().toISOString()
          });

        if (insertError) throw insertError;

        // Update UI with public URL
        setImage(publicUrl); // Use the Supabase public URL directly
        setIsImageValid(true);
        setSuccess('Image uploaded successfully');
        setProgress('');
      } catch (err) {
        console.error('[Image Upload] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to upload image');
        setImage(null);
        setIsImageValid(false);
        setProgress('');
      }
    }
  };

  const validateImageUrl = (url: string) => {
    return new Promise((resolve) => {
      const img = new Image();
      
      // Don't try to validate blob URLs
      if (url.startsWith('blob:')) {
        resolve(false);
        return;
      }
      
      const timeoutId = setTimeout(() => {
        img.src = '';
        resolve(false);
      }, 10000); // 10 second timeout
      
      img.onload = () => resolve(true);
      img.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };
      img.crossOrigin = 'anonymous';
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
    console.log('[Generation] Starting new generation request');
    console.log('[Generation] Image URL:', image);
    console.log('[Generation] Input method:', inputMethod);
    console.log('[Generation] Image valid:', isImageValid);
    console.log('[Generation] Session:', session ? 'logged in' : 'not logged in');
    
    // Reset any existing state
    setGenerating(false);
    setProgress('');
    setError(null);
    setSuccess(null);
    
    if (!session) {
      setError('Please sign in to generate images');
      return;
    }

    if (!image || image.startsWith('blob:')) {
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
    setProgress('Initializing generation... 0%');
    
    try {
      console.log('[Generation] Starting new generation');
      const body = {
        input: {
          CLIPTextEncode_text_7: negativePrompt,
          LoadImage_image_17: image || '',
          CLIPTextEncode_text_23: positivePrompt,
          easy_int_value_60: seed || Math.floor(Math.random() * 1000000).toString()
        },
        workflow_id: "a254baa6-52eb-4a06-9a0f-ad9a9619b842",
        webhook: ""
      };
      console.log('[Generation] Request payload:', JSON.stringify(body, null, 2));

      console.log('[Generation] Sending request');
      const response = await fetch("https://api.comfyonline.app/api/run_workflow", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      console.log('[Generation] Response status:', response.status);
      const responseText = await response.text();
      console.log('[Generation] Raw response:', responseText);

      if (!response.ok) {
        console.error('[Generation] HTTP error:', response.status);
        throw new Error('Failed to start generation');
      }

      const data: GenerationResponse = JSON.parse(responseText);
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
            <div className="flex items-center space-x-4">
              {isTaskIdInputOpen ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={manualTaskId}
                    onChange={(e) => setManualTaskId(e.target.value)}
                    placeholder="Enter Task ID"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                  <button
                    onClick={() => {
                      handleManualQuery();
                      setIsTaskIdInputOpen(false);
                      setManualTaskId('');
                    }}
                    disabled={!manualTaskId || isQuerying}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    Query
                  </button>
                  <button
                    onClick={() => {
                      setIsTaskIdInputOpen(false);
                      setManualTaskId('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsTaskIdInputOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out"
                >
                  Query Task ID
                </button>
              )}
              <button
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                New Generation
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
            projects={projects}
            onProjectsChange={fetchProjects}
          />

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
            seed={seed}
            onPositivePromptChange={setPositivePrompt}
            onNegativePromptChange={setNegativePrompt}
            onSeedChange={setSeed}
          />

          <TaskIdDisplay 
            taskId={taskId}
          />

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