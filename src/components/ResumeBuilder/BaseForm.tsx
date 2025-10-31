import { ReactNode } from 'react';

interface BaseFormProps {
  children: ReactNode;
  className?: string;
}

export const BaseForm = ({ children, className = '' }: BaseFormProps) => {
  return (
    <section className={`flex flex-col gap-3 rounded-lg bg-white p-6 pt-4 shadow-md transition-opacity duration-200 ${className}`}>
      {children}
    </section>
  );
};
