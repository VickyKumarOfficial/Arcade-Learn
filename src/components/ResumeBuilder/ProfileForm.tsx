import { BaseForm } from './BaseForm';
import { Input, Textarea } from './InputGroup';
import { useResumeBuilder } from '@/contexts/ResumeBuilderContext';

export const ProfileForm = () => {
  const { resume, updateProfile } = useResumeBuilder();
  const { name, email, phone, url, summary, location } = resume.profile;

  const handleChange = (field: string, value: string) => {
    updateProfile(field as keyof typeof resume.profile, value);
  };

  return (
    <BaseForm>
      <div className="grid grid-cols-6 gap-3">
        <Input
          label="Full Name"
          labelClassName="col-span-full"
          name="name"
          placeholder="John Doe"
          value={name}
          onChange={handleChange}
        />
        <Textarea
          label="Professional Summary"
          labelClassName="col-span-full"
          name="summary"
          placeholder="Passionate software engineer with 5+ years of experience building scalable web applications..."
          value={summary}
          onChange={handleChange}
          rows={3}
        />
        <Input
          label="Email"
          labelClassName="col-span-4"
          name="email"
          placeholder="john.doe@email.com"
          value={email}
          onChange={handleChange}
        />
        <Input
          label="Phone"
          labelClassName="col-span-2"
          name="phone"
          placeholder="(123) 456-7890"
          value={phone}
          onChange={handleChange}
        />
        <Input
          label="Website / LinkedIn"
          labelClassName="col-span-4"
          name="url"
          placeholder="linkedin.com/in/johndoe"
          value={url}
          onChange={handleChange}
        />
        <Input
          label="Location"
          labelClassName="col-span-2"
          name="location"
          placeholder="New York, NY"
          value={location}
          onChange={handleChange}
        />
      </div>
    </BaseForm>
  );
};
