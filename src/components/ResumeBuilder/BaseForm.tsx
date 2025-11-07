import { ReactNode } from 'react';

interface BaseFormProps {
  children: ReactNode;
  className?: string;
}

export const BaseForm = ({ children, className = '' }: BaseFormProps) => {
  return (
    <section className={`flex flex-col gap-3 rounded-lg bg-white dark:bg-gray-800 p-6 pt-4 shadow-md border border-gray-200 dark:border-gray-700 transition-opacity duration-200 ${className}`}>
      {children}
    </section>
  );
};
