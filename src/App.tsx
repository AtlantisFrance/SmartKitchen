import React, { useState, useEffect } from 'react';
import { RefreshCw, Wallet, Upload, Image as ImageIcon, Link as LinkIcon, AlertCircle, PlusCircle } from 'lucide-react';

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

function App() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
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
    setError(null);
    setSuccess(null);
    setProgress('');
    setTaskId(null);
    setGenerating(false);
  };

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('https://api.comfyonline.app/api/get_user_account_api', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.errorMsg || 'Failed to fetch balance');
      }

      if (data.data?.balances !== undefined) {
        setBalance(data.data.balances);
        setSuccess('Balance updated successfully');
      } else {
        throw new Error('Balance data not found in response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
    
    // Clear previous generated images when starting a new generation
    setGeneratedImages([]);
    
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
          setGeneratedImages(urls);
          setSuccess('Image generated successfully!');
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        console.log('[Image Upload] Image loaded successfully');
      };
      reader.readAsDataURL(file);
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
    if (!imageUrl) return;
    
    setIsImageLoading(true);
    setIsImageValid(false);
    setError(null);
    
    try {
      const isValid = await validateImageUrl(imageUrl);
      if (isValid) {
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

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Balance Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Credit Balance</h2>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {loading ? '...' : balance !== null ? `$${balance.toFixed(2)}` : '---'}
            </p>
          </div>
        </div>

        {/* Image Generation Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Image Generation</h1>
            <button
              onClick={resetForm}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              New Generation
            </button>
          </div>
          
          {/* Input Method Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border border-gray-200">
              <button
                className={`px-4 py-2 rounded-l-lg ${inputMethod === 'file' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                onClick={() => setInputMethod('file')}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                File Upload
              </button>
              <button
                className={`px-4 py-2 rounded-r-lg ${inputMethod === 'url' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                onClick={() => setInputMethod('url')}
              >
                <LinkIcon className="w-4 h-4 inline mr-2" />
                URL Input
              </button>
            </div>
          </div>

          {/* Image Input */}
          {inputMethod === 'file' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Depth Map</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={isImageLoading}
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl || isImageLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isImageLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Preview'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {image && (
            <div className="mt-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="max-h-48 w-full object-contain"
                  onError={() => {
                    setError('Failed to load image');
                    setImage(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Prompts */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Positive Prompt</label>
              <textarea
                value={positivePrompt}
                onChange={(e) => setPositivePrompt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Negative Prompt</label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Task ID Display */}
          {taskId && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Task ID:</span> {taskId}
              </p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateImage}
            disabled={generating || !image || (inputMethod === 'url' && !isImageValid)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg 
                     flex items-center justify-center transition duration-150 ease-in-out
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <ImageIcon className="w-5 h-5 mr-2" />
            )}
            {generating ? 'Generating...' : 'Generate Image'}
          </button>

          {/* Progress */}
          {progress && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 text-blue-600 animate-spin" />
                <p className="text-sm text-blue-600">{progress}</p>
              </div>
            </div>
          )}

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((url, index) => (
                  <img key={index} src={url} alt={`Generated ${index + 1}`} className="rounded-lg shadow-md" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;