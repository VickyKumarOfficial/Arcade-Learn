import { BulletListTextarea } from './InputGroup';
import { useResumeBuilder } from '@/contexts/ResumeBuilderContext';

export const SkillsForm = () => {
  const { resume, updateSkills } = useResumeBuilder();
  const { descriptions } = resume.skills;

  const handleChange = (field: string, value: string[]) => {
    updateSkills(field, value);
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Skills</h3>

      <div className="grid grid-cols-6 gap-3 p-4 rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700/50">
        <BulletListTextarea
          label="Skills & Technologies"
          labelClassName="col-span-full"
          name="descriptions"
          placeholder="JavaScript, TypeScript, React, Node.js, Python, AWS..."
          value={descriptions}
          onChange={handleChange}
        />
        <p className="col-span-full text-sm text-gray-600 dark:text-gray-400">
          Tip: Group skills by category (e.g., "Frontend: React, Vue, Angular" or "Languages: Python, Java, C++")
        </p>
      </div>
    </div>
  );
};
