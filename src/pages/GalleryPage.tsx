import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, ExternalLink, Folder, FolderPlus } from 'lucide-react';

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
  const [assigningProject, setAssigningProject] = useState<string | null>(null);

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
      const { error: deleteError } = await supabase
        .from('result_images')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
  };

  const handleAssignProject = async (imageId: string, projectId: string) => {
    try {
      setError(null);
      
      // First update the project_id
      const { error: updateError } = await supabase
        .from('result_images')
        .update({ project_id: projectId })
        .eq('id', imageId)
        .eq('user_id', session.user.id);

      if (updateError) throw updateError;

      // Get the project name
      const project = projects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');

      // Update local state
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, project: { name: project.name }, project_id: projectId }
          : img
      ));

      setAssigningProject(null);
    } catch (err) {
      console.error('Error assigning project:', err);
      setError('Failed to assign project');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Projects</h2>
      
      {/* Project Creation Form */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">Select a project or create a new one</p>
          <button
            onClick={() => setIsCreatingProject(!isCreatingProject)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            {isCreatingProject ? 'Cancel' : 'New Project'}
          </button>
        </div>

        {isCreatingProject && (
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 mb-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <textarea
                id="projectDescription"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter project description"
              />
            </div>
            <button
              onClick={handleCreateProject}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        )}
      </div>
      
      {/* Project Selection */}
      <div className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="relative group flex flex-col">
              <button
                onClick={() => setSelectedProject(project)}
                className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                  selectedProject?.id === project.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
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
            <h3 className="text-sm font-medium text-gray-700 mb-1">Project Description</h3>
            <p className="text-sm text-gray-600">{selectedProject.description}</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {!selectedProject && !error && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700">Showing all images. Select a project to filter.</p>
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
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Positive:</span> {image.positive_prompt || 'None'}
                  </p>
                </div>
                <div className="flex items-center justify-between mb-2">
                  {image.project?.name ? (
                    <div className="flex items-center">
                      <Folder className="w-4 h-4 mr-1 text-blue-600" />
                      <span className="text-sm text-blue-600">{image.project.name}</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => setAssigningProject(assigningProject === image.id ? null : image.id)}
                        className="text-sm text-gray-500 hover:text-blue-600 flex items-center"
                      >
                        <FolderPlus className="w-4 h-4 mr-1" />
                        Assign to Project
                      </button>
                      
                      {assigningProject === image.id && (
                        <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg">
                          {projects.map(project => (
                            <button
                              key={project.id}
                              onClick={() => handleAssignProject(image.id, project.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Folder className="w-4 h-4 mr-2" />
                              {project.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Negative:</span> {image.negative_prompt || 'None'}
                </div>
                {image.seed && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Seed:</span> {image.seed}
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(image.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
