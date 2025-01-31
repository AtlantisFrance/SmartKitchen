import { Clock, Trash2, ExternalLink } from 'lucide-react';
import { ProjectAssignment } from '../Projects/ProjectAssignment';

interface Generation {
  id: string;
  images: string[];
  positivePrompt: string;
  negativePrompt: string;
  seed?: string;
  timestamp: number;
  projectName?: string;
}

interface GeneratedImagesListProps {
  generations: Generation[];
  currentImages: string[];
  projects: Project[];
  onDelete: (generationId: string) => void;
  onProjectAssign: () => void;
}

export function GeneratedImagesList({ 
  generations, 
  currentImages, 
  projects,
  onDelete,
  onProjectAssign 
}: GeneratedImagesListProps) {
  if (generations.length === 0 && currentImages.length === 0) return null;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="mt-6 space-y-8">
      {generations.map((generation, index) => (
        <div key={generation.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-medium text-gray-900">Generation #{generations.length - index}</h3>
              {generation.projectName && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {generation.projectName}
                </span>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {formatTimestamp(generation.timestamp)}
              </div>
            </div>
            <button
              onClick={() => onDelete(generation.id)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
              title="Delete generation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-3 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Positive Prompt:</span> {generation.positivePrompt || 'None'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Negative Prompt:</span> {generation.negativePrompt || 'None'}
            </p>
            {generation.seed && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Seed:</span> {generation.seed}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {generation.images.map((url, imgIndex) => (
              <div 
                key={imgIndex} 
                className="relative group"
              >
                <div 
                  className="relative"
                >
                  <img 
                    draggable="true"
                    style={{ cursor: 'move' }}
                    onDragStart={(e) => {
                      // Set the drag data
                      e.dataTransfer.setData('text/plain', url);
                      e.dataTransfer.effectAllowed = 'copy';

                      // Set drag image
                      const img = new Image();
                      img.src = url;
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          // Scale down the drag preview for better UX
                          const scale = 0.2;
                          canvas.width = img.width * scale;
                          canvas.height = img.height * scale;
                          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                          const dragPreview = document.createElement('img');
                          dragPreview.src = canvas.toDataURL();
                          dragPreview.onload = () => {
                            e.dataTransfer.setDragImage(
                              dragPreview,
                              dragPreview.width / 2,
                              dragPreview.height / 2
                            );
                          };
                        }
                      };
                      
                      // Add visual feedback
                      e.currentTarget.classList.add('opacity-50');
                    }}
                    onDragEnd={(e) => {
                      // Remove visual feedback
                      e.currentTarget.classList.remove('opacity-50');
                    }}
                    src={url} 
                    alt={`Generated ${imgIndex + 1}`} 
                    className="rounded-lg shadow-md w-full h-auto transition-opacity duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                <div className="mt-2">
                  <ProjectAssignment
                    imageId={generation.id}
                    currentProject={generation.project}
                    projects={projects}
                    onAssignSuccess={onProjectAssign}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {currentImages.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Current Generation</h3>
          <div className="grid grid-cols-2 gap-4">
            {currentImages.map((url, index) => (
              <div 
                key={index} 
                className="relative group"
              >
                <div 
                  className="relative"
                >
                  <img 
                    draggable="true"
                    style={{ cursor: 'move' }}
                    onDragStart={(e) => {
                      // Set the drag data
                      e.dataTransfer.setData('text/plain', url);
                      e.dataTransfer.effectAllowed = 'copy';

                      // Set drag image
                      const img = new Image();
                      img.src = url;
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          // Scale down the drag preview for better UX
                          const scale = 0.2;
                          canvas.width = img.width * scale;
                          canvas.height = img.height * scale;
                          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                          const dragPreview = document.createElement('img');
                          dragPreview.src = canvas.toDataURL();
                          dragPreview.onload = () => {
                            e.dataTransfer.setDragImage(
                              dragPreview,
                              dragPreview.width / 2,
                              dragPreview.height / 2
                            );
                          };
                        }
                      };
                      
                      // Add visual feedback
                      e.currentTarget.classList.add('opacity-50');
                    }}
                    onDragEnd={(e) => {
                      // Remove visual feedback
                      e.currentTarget.classList.remove('opacity-50');
                    }}
                    src={url} 
                    alt={`Current ${index + 1}`} 
                    className="rounded-lg shadow-md w-full h-auto transition-opacity duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}