import { useState, useRef, useEffect } from 'react';
import { FolderPlus, Folder } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface ProjectSelectorProps {
  selectedProject: Project | null;
  onProjectSelect: (project: Project | null) => void;
  projects: Project[];
  onProjectsChange: () => void;
}

export function ProjectSelector({ selectedProject, onProjectSelect, projects, onProjectsChange }: ProjectSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      const { error: createError } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || null,
        });

      if (createError) throw createError;

      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreating(false);
      onProjectsChange();
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project');
    }
  };

  return (
    <div className="mb-6 relative" ref={dropdownRef}>
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-gray-700">Project</label>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
        >
          <FolderPlus className="w-4 h-4 mr-1" />
          {isCreating ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {isCreating ? (
        <div className="space-y-3">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <textarea
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            placeholder="Project description (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
          <button
            onClick={handleCreateProject}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 bg-white"
          >
            <div className="flex items-center">
              <Folder className="w-4 h-4 mr-2" />
              <span>{selectedProject ? selectedProject.name : 'Select a project'}</span>
            </div>
            <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    onProjectSelect(project);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-2 hover:bg-gray-50 ${
                    selectedProject?.id === project.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  <div className="flex flex-col w-full">
                    <div className="flex items-center">
                      <Folder className="w-4 h-4 mr-2" />
                      <span className="truncate font-medium">{project.name}</span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-gray-500 ml-6 mt-1 truncate">
                        {project.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}