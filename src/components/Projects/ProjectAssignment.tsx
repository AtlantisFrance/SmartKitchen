import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Folder, FolderPlus, ChevronDown, X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface ProjectAssignmentProps {
  imageId: string;
  currentProject?: { name: string } | null;
  projects: Project[];
  onAssignSuccess: () => void;
}

export function ProjectAssignment({ imageId, currentProject, projects, onAssignSuccess }: ProjectAssignmentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssignProject = async (projectId: string) => {
    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from('result_images')
        .update({ project_id: projectId })
        .select(`
          *,
          project:projects(name)
        `)
        .eq('id', imageId);

      if (updateError) throw updateError;

      setIsOpen(false);
      onAssignSuccess();
    } catch (err) {
      console.error('Error assigning project:', err);
      setError('Failed to assign project');
    }
  };

  if (currentProject?.name) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 group"
        >
          <div className="flex items-center">
            <Folder className="w-4 h-4 mr-1" />
            <span className="text-sm">{currentProject.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
            <div className="py-1">
              <button
                onClick={async () => {
                  try {
                    await handleAssignProject(null);
                  } catch (err) {
                    console.error('Error removing project:', err);
                    setError('Failed to remove project');
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Remove from Project
              </button>
              <div className="border-t border-gray-100 my-1" />
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleAssignProject(project.id)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  {project.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-gray-500 hover:text-blue-600 flex items-center group"
      >
        <FolderPlus className="w-4 h-4 mr-1" />
        Assign to Project
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => handleAssignProject(project.id)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
            >
              <Folder className="w-4 h-4 mr-2" />
              {project.name}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute z-50 mt-1 w-48 p-2 bg-red-50 text-red-600 text-xs rounded-md border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
}