import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, ExternalLink, FolderIcon as Folder, FolderPlus, Loader2, ChevronDown } from 'lucide-react';
import { ProjectAssignment } from '../components/Projects/ProjectAssignment';

interface GalleryImage {
  id: string;
  image_url: string;
  positive_prompt: string;
  negative_prompt: string;
  seed?: string;
  created_at: string;
  project: {
    name: string;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface GalleryPageProps {
  session: any;
}

export function GalleryPage({ session }: GalleryPageProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<string[]>([]);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (session) {
      fetchProjects();
      fetchImages();
    }
  }, [session, selectedProject]);

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
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('result_images')
        .select(`
          *,
          project:projects(name)
        `)
        .eq('user_id', session.user.id);
        
      if (selectedProject) {
        query = query.eq('project_id', selectedProject.id);
      }

      query = query.order('created_at', { ascending: false });
      
      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      setImages(data || []);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      setProjects(prev => [...prev, data]);
      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreatingProject(false);
      setSelectedProject(data);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This will permanently delete all images generated in this project.')) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      // Clear the images list immediately to prevent showing deleted project's images
      setImages(prev => prev.filter(img => img.project_id !== projectId));

      // Finally delete the project itself
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (deleteError) throw deleteError;

      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      
      // Fetch all images again to ensure we have the latest data
      await fetchImages();
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      
      // Get the image URL before deleting the record
      const { data: imageData, error: fetchError } = await supabase
        .from('result_images')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from database
      const { error: deleteError } = await supabase
        .from('result_images')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Extract file path from URL
      if (imageData?.image_url) {
        const url = new URL(imageData.image_url);
        const filePath = url.pathname.split('/').slice(4).join('/'); // Remove /storage/v1/object/public/
        
        // Delete from storage bucket
        const { error: storageError } = await supabase.storage
          .from('generated-images')
          .remove([filePath]);

        if (storageError) {
          console.error('Failed to delete from storage:', storageError);
          // Don't throw here as the database record is already deleted
        }
      }

      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
  };

  const handleAssignProject = async (imageId: string, projectId: string) => {
    try {
      setError(null);
      setSuccess(null);
      setAssigningProject(null);
      
      const { data: updatedImage, error: updateError } = await supabase
        .from('result_images')
        .update({ project_id: projectId })
        .eq('id', imageId)
        .eq('user_id', session.user.id)
        .select(`
          *,
          project:projects(name)
        `)
        .single();

      if (updateError) throw updateError;

      // Update local state
      if (updatedImage) {
        // Only update the image if it's in the current view
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...updatedImage, project: updatedImage.project }
            : img
        ));
        setSuccess('Project assigned successfully');
      } else {
        throw new Error('Failed to update image');
      }
    } catch (err) {
      console.error('Error assigning project:', err);
      setError('Failed to assign project');
    } finally {
      setAssigningProject(null);
    }
  };

  const handleClearGallery = async () => {
    if (!confirm('Are you sure you want to delete ALL your generated images? This action cannot be undone.')) {
      return;
    }

    try {
      setIsClearing(true);
      setError(null);
      setSuccess(null);

      // Get all image URLs before deleting records
      const { data: imageData, error: fetchError } = await supabase
        .from('result_images')
        .select('image_url')
        .eq('user_id', session.user.id);

      if (fetchError) throw fetchError;

      // Delete from database
      const { error: deleteError } = await supabase
        .from('result_images')
        .delete()
        .eq('user_id', session.user.id);

      if (deleteError) throw deleteError;

      // Delete all files from storage
      if (imageData && imageData.length > 0) {
        const filePaths = imageData.map(img => {
          const url = new URL(img.image_url);
          return url.pathname.split('/').slice(4).join('/'); // Remove /storage/v1/object/public/
        });

        const { error: storageError } = await supabase.storage
          .from('generated-images')
          .remove(filePaths);

        if (storageError) {
          console.error('Failed to delete some files from storage:', storageError);
          // Don't throw here as the database records are already deleted
        }
      }

      setImages([]);
      setSuccess('All images have been deleted successfully');
    } catch (err) {
      console.error('Error clearing gallery:', err);
      setError('Failed to clear gallery');
    } finally {
      setIsClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
        <button
          onClick={handleClearGallery}
          disabled={isClearing || images.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isClearing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-2" />
          )}
          Clear All Generated Images
        </button>
      </div>
      
      {/* Project Creation Form */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {selectedProject && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Current project:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {selectedProject.name}
                </span>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Clear selection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCreatingProject(!isCreatingProject)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            {isCreatingProject ? 'Cancel' : 'New Project'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="relative group flex flex-col">
              <button
                onClick={() => setSelectedProject(project)}
                className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                  selectedProject?.id === project.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                } flex-col`}
              >
                <div className="flex items-center w-full">
                  <Folder className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="truncate font-medium">{project.name}</span>
                </div>
                {project.description && (
                  <p className="text-xs text-gray-500 mt-2 truncate w-full">
                    {project.description}
                  </p>
                )}
              </button>
              <button
                onClick={() => handleDeleteProject(project.id)}
                className="absolute top-1 right-1 p-1 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        {selectedProject?.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-1">About {selectedProject.name}</h3>
            <p className="text-sm text-gray-600">{selectedProject.description}</p>
          </div>
        )}
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      
      {!selectedProject && !error && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700">Showing all images. Click on a project above to filter by project.</p>
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No generated images yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative group">
                <img
                  src={image.image_url}
                  alt="Generated kitchen"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <a
                      href={image.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setExpandedPrompts(prev => 
                      prev.includes(image.id) 
                        ? prev.filter(id => id !== image.id)
                        : [...prev, image.id]
                    )}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
                  >
                    <span className="font-medium">Prompts</span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${
                        expandedPrompts.includes(image.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedPrompts.includes(image.id) && (
                    <div className="mt-2 space-y-2 px-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Positive Prompt:</p>
                        <p className="text-sm text-gray-600 mt-1">{image.positive_prompt || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Negative Prompt:</p>
                        <p className="text-sm text-gray-600 mt-1">{image.negative_prompt || 'None'}</p>
                      </div>
                    </div>
                  )}
                  <ProjectAssignment
                    imageId={image.id}
                    currentProject={image.project}
                    projects={projects}
                    onAssignSuccess={fetchImages}
                  />
                </div>
                {image.seed && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Seed:</span> {image.seed}
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                  <span>{new Date(image.created_at).toLocaleDateString('fr-FR', {
                    timeZone: 'Europe/Paris'
                  })}</span>
                  <span>{new Date(image.created_at).toLocaleTimeString('fr-FR', {
                    timeZone: 'Europe/Paris',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}