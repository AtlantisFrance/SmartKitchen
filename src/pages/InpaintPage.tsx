import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Eraser, Paintbrush } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ImageUploader } from '../components/ImageInput/ImageUploader';
import { ImagePreview } from '../components/ImagePreview/ImagePreview';
import { PromptInputs } from '../components/Prompts/PromptInputs';
import { GeneratedImagesList } from '../components/GeneratedImages/GeneratedImagesList';
import { StatusMessages } from '../components/StatusMessages/StatusMessages';
import { GenerateButton } from '../components/GenerateButton/GenerateButton';
import { ProgressIndicator } from '../components/Progress/ProgressIndicator';
import { TaskIdDisplay } from '../components/TaskId/TaskIdDisplay';
import { ProjectSelector } from '../components/Projects/ProjectSelector';
import { TaskHistory } from '../components/TaskId/TaskHistory';

interface InpaintPageProps {
  session: any;
}

export function InpaintPage({ session }: InpaintPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [seed, setSeed] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isImageValid, setIsImageValid] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isEraser, setIsEraser] = useState(false);
  const [scale, setScale] = useState(1);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  useEffect(() => {
    if (image && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        setOriginalImageSize({ width: img.width, height: img.height });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Initialize mask layer
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };
      img.src = image;
    }
  }, [image]);

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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 1)';
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const ctx = canvas.getContext('2d')!;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!canvasRef.current) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    ctx.closePath();
    
    // Update mask image
    setMaskImage(canvas.toDataURL('image/png'));
  };

  const clearMask = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setMaskImage(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && session?.user) {
      try {
        // Create object URL for immediate preview
        const objectUrl = URL.createObjectURL(file);
        setImage(objectUrl);
        setIsImageValid(true);
        
        // Clear existing mask
        clearMask();
      } catch (err) {
        console.error('Error handling image:', err);
        setError('Failed to load image');
        setImage(null);
        setIsImageValid(false);
      }
    }
  };

  const generateInpaintedImage = async () => {
    if (!image || !maskImage) {
      setError('Please provide both an image and mask');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);
    setProgress('Initializing inpainting... 0%');

    try {
      // TODO: Replace with your inpainting workflow ID and parameters
      const body = {
        input: {
          image: image,
          mask: maskImage,
          prompt: positivePrompt,
          negative_prompt: negativePrompt,
          seed: seed || Math.floor(Math.random() * 1000000).toString()
        },
        workflow_id: "your-inpainting-workflow-id",
        webhook: ""
      };

      // TODO: Implement the rest of the generation logic similar to DepthPage
      // This is a placeholder for the actual implementation
      setError('Inpainting feature coming soon - waiting for workflow ID');
      setGenerating(false);
      setProgress('');
    } catch (err) {
      console.error('Error generating inpainted image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      setGenerating(false);
      setProgress('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Kitchen Inpainting</h2>
            <button
              onClick={clearMask}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Clear Mask
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
            projects={projects}
            onProjectsChange={fetchProjects}
          />

          <ImageUploader onImageUpload={handleImageUpload} />

          {image && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-x-4">
                  <button
                    onClick={() => setIsEraser(false)}
                    className={`px-4 py-2 rounded-lg ${
                      !isEraser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Paintbrush className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEraser(true)}
                    className={`px-4 py-2 rounded-lg ${
                      isEraser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Eraser className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Brush Size:</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600">{brushSize}px</span>
                </div>
              </div>

              <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{
                    width: '100%',
                    height: 'auto',
                    cursor: isEraser ? 'crosshair' : 'brush'
                  }}
                  className="bg-gray-50"
                />
              </div>
            </div>
          )}

          <PromptInputs
            positivePrompt={positivePrompt}
            negativePrompt={negativePrompt}
            seed={seed}
            onPositivePromptChange={setPositivePrompt}
            onNegativePromptChange={setNegativePrompt}
            onSeedChange={setSeed}
          />

          <TaskIdDisplay taskId={taskId} />

          <GenerateButton
            onClick={generateInpaintedImage}
            disabled={generating || !image || !maskImage}
            generating={generating}
          />

          <ProgressIndicator progress={progress} />
        </div>
      </div>

      <div className="space-y-6">
        <GeneratedImagesList 
          generations={[]}
          currentImages={generatedImages}
          onDelete={() => {}}
          projects={projects}
          onProjectAssign={() => {}}
        />

        <StatusMessages error={error} success={success} />
      </div>
    </div>
  );
}