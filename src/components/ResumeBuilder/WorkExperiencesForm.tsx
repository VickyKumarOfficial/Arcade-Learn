import { Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, BulletListTextarea } from './InputGroup';
import { useResumeBuilder } from '@/contexts/ResumeBuilderContext';

export const WorkExperiencesForm = () => {
  const { resume, updateWorkExperience, addWorkExperience, deleteWorkExperience } = useResumeBuilder();
  const workExperiences = resume.workExperiences;
  const showDelete = workExperiences.length > 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Experience</h3>
        <Button
          type="button"
          onClick={addWorkExperience}
          size="sm"
          variant="outline"
          className="dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
        >
          Add Experience
        </Button>
      </div>

      {workExperiences.map((exp, idx) => (
        <div
          key={idx}
          className="relative grid grid-cols-6 gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50"
        >
          {showDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
              onClick={() => deleteWorkExperience(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Input
            label="Company"
            labelClassName="col-span-4"
            name="company"
            placeholder="Google"
            value={exp.company}
            onChange={(field, value) => updateWorkExperience(idx, field, value)}
          />
          <Input
            label="Date"
            labelClassName="col-span-2"
            name="date"
            placeholder="Jan 2020 - Present"
            value={exp.date}
            onChange={(field, value) => updateWorkExperience(idx, field, value)}
          />
          <Input
            label="Job Title"
            labelClassName="col-span-full"
            name="jobTitle"
            placeholder="Senior Software Engineer"
            value={exp.jobTitle}
            onChange={(field, value) => updateWorkExperience(idx, field, value)}
          />
          <BulletListTextarea
            label="Description"
            labelClassName="col-span-full"
            name="descriptions"
            placeholder="Led development of..."
            value={exp.descriptions}
            onChange={(field, value) => updateWorkExperience(idx, field, value)}
          />
        </div>
      ))}
    </div>
  );
};
