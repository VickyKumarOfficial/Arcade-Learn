import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, BulletListTextarea } from './InputGroup';
import { useResumeBuilder } from '@/contexts/ResumeBuilderContext';

export const EducationsForm = () => {
  const { resume, updateEducation, addEducation, deleteEducation } = useResumeBuilder();
  const educations = resume.educations;
  const showDelete = educations.length > 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h3>
        <Button
          type="button"
          onClick={addEducation}
          size="sm"
          variant="outline"
          className="dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
        >
          Add Education
        </Button>
      </div>

      {educations.map((edu, idx) => (
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
              onClick={() => deleteEducation(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Input
            label="School / University"
            labelClassName="col-span-4"
            name="school"
            placeholder="Stanford University"
            value={edu.school}
            onChange={(field, value) => updateEducation(idx, field, value)}
          />
          <Input
            label="Date"
            labelClassName="col-span-2"
            name="date"
            placeholder="May 2020"
            value={edu.date}
            onChange={(field, value) => updateEducation(idx, field, value)}
          />
          <Input
            label="Degree & Major"
            labelClassName="col-span-4"
            name="degree"
            placeholder="Bachelor of Science in Computer Science"
            value={edu.degree}
            onChange={(field, value) => updateEducation(idx, field, value)}
          />
          <Input
            label="GPA"
            labelClassName="col-span-2"
            name="gpa"
            placeholder="3.8"
            value={edu.gpa}
            onChange={(field, value) => updateEducation(idx, field, value)}
          />
          <BulletListTextarea
            label="Additional Information (Optional)"
            labelClassName="col-span-full"
            name="descriptions"
            placeholder="Dean's List, Honors, Activities, Relevant Coursework..."
            value={edu.descriptions}
            onChange={(field, value) => updateEducation(idx, field, value)}
          />
        </div>
      ))}
    </div>
  );
};
