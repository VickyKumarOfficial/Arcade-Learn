import { ChangeEvent, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';

interface InputProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (name: string, value: string) => void;
  labelClassName?: string;
}

export const Input = ({
  label,
  name,
  value = '',
  placeholder,
  onChange,
  labelClassName = '',
}: InputProps) => {
  return (
    <div className={labelClassName}>
      <Label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</Label>
      <ShadcnInput
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className="mt-1"
      />
    </div>
  );
};

interface TextareaProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (name: string, value: string) => void;
  labelClassName?: string;
  rows?: number;
}

export const Textarea = ({
  label,
  name,
  value = '',
  placeholder,
  onChange,
  labelClassName = '',
  rows = 3,
}: TextareaProps) => {
  return (
    <div className={labelClassName}>
      <Label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</Label>
      <ShadcnTextarea
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className="mt-1 resize-none"
        rows={rows}
      />
    </div>
  );
};

interface BulletListTextareaProps {
  label: string;
  name: string;
  value: string[];
  placeholder: string;
  onChange: (name: string, value: string[]) => void;
  labelClassName?: string;
}

export const BulletListTextarea = ({
  label,
  name,
  value = [],
  placeholder,
  onChange,
  labelClassName = '',
}: BulletListTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split('\n');
    onChange(name, lines);
  };

  return (
    <div className={labelClassName}>
      <Label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</Label>
      <ShadcnTextarea
        ref={textareaRef}
        name={name}
        value={value.join('\n')}
        placeholder={placeholder}
        onChange={handleChange}
        className="mt-1 min-h-[100px] resize-none font-normal"
        rows={5}
      />
      <p className="text-xs text-gray-500 mt-1">One bullet point per line</p>
    </div>
  );
};
