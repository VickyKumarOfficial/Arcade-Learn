import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, BulletListTextarea } from './InputGroup';
import { useResumeBuilder } from '@/contexts/ResumeBuilderContext';

export const ProjectsForm = () => {
  const { resume, updateProject, addProject, deleteProject } = useResumeBuilder();
  const projects = resume.projects;
  const showDelete = projects.length > 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h3>
        <Button
          type="button"
          onClick={addProject}
          size="sm"
          variant="outline"
          className="dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
        >
          Add Project
        </Button>
      </div>

      {projects.map((proj, idx) => (
        <div
          key={idx}
          className="relative grid grid-cols-6 gap-3 p-4 rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700/50"
        >
          {showDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
              onClick={() => deleteProject(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Input
            label="Project Name"
            labelClassName="col-span-4"
            name="project"
            placeholder="E-Commerce Platform"
            value={proj.project}
            onChange={(field, value) => updateProject(idx, field, value)}
          />
          <Input
            label="Date"
            labelClassName="col-span-2"
            name="date"
            placeholder="Summer 2023"
            value={proj.date}
            onChange={(field, value) => updateProject(idx, field, value)}
          />
          <BulletListTextarea
            label="Description"
            labelClassName="col-span-full"
            name="descriptions"
            placeholder="Built a full-stack e-commerce platform using React, Node.js, and MongoDB..."
            value={proj.descriptions}
            onChange={(field, value) => updateProject(idx, field, value)}
          />
        </div>
      ))}
    </div>
  );
};
