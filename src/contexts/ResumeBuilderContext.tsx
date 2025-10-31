import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Resume } from '@/types/resume';

// Initial Resume State (similar to OpenResume)
export const initialProfile = {
  name: '',
  summary: '',
  email: '',
  phone: '',
  location: '',
  url: '',
};

export const initialWorkExperience = {
  company: '',
  jobTitle: '',
  date: '',
  descriptions: [] as string[],
};

export const initialEducation = {
  school: '',
  degree: '',
  gpa: '',
  date: '',
  descriptions: [] as string[],
};

export const initialProject = {
  project: '',
  date: '',
  descriptions: [] as string[],
};

export const initialSkills = {
  featuredSkills: Array(6).fill({ skill: '', rating: 4 }),
  descriptions: [] as string[],
};

export const initialCustom = {
  descriptions: [] as string[],
};

export const initialResumeState: Resume = {
  profile: initialProfile,
  workExperiences: [initialWorkExperience],
  educations: [initialEducation],
  projects: [initialProject],
  skills: initialSkills,
  custom: initialCustom,
};

// Builder Settings
export interface BuilderSettings {
  themeColor: string;
  fontSize: string;
  fontFamily: string;
  documentSize: 'A4' | 'Letter';
  formToShow: {
    workExperiences: boolean;
    educations: boolean;
    projects: boolean;
    skills: boolean;
    custom: boolean;
  };
  formToHeading: {
    workExperiences: string;
    educations: string;
    projects: string;
    skills: string;
    custom: string;
  };
  showBulletPoints: {
    workExperiences: boolean;
    educations: boolean;
    projects: boolean;
    skills: boolean;
    custom: boolean;
  };
}

export const initialSettings: BuilderSettings = {
  themeColor: '#38bdf8',
  fontSize: '11',
  fontFamily: 'Roboto',
  documentSize: 'Letter',
  formToShow: {
    workExperiences: true,
    educations: true,
    projects: true,
    skills: true,
    custom: false,
  },
  formToHeading: {
    workExperiences: 'WORK EXPERIENCE',
    educations: 'EDUCATION',
    projects: 'PROJECTS',
    skills: 'SKILLS',
    custom: 'CUSTOM SECTION',
  },
  showBulletPoints: {
    workExperiences: true,
    educations: true,
    projects: true,
    skills: true,
    custom: true,
  },
};

interface ResumeBuilderContextType {
  resume: Resume;
  settings: BuilderSettings;
  updateProfile: (field: keyof typeof initialProfile, value: string) => void;
  updateWorkExperience: (idx: number, field: string, value: string | string[]) => void;
  updateEducation: (idx: number, field: string, value: string | string[]) => void;
  updateProject: (idx: number, field: string, value: string | string[]) => void;
  updateSkills: (field: string, value: any) => void;
  updateCustom: (field: string, value: string[]) => void;
  addWorkExperience: () => void;
  addEducation: () => void;
  addProject: () => void;
  deleteWorkExperience: (idx: number) => void;
  deleteEducation: (idx: number) => void;
  deleteProject: (idx: number) => void;
  updateSettings: (field: keyof BuilderSettings, value: any) => void;
  setResume: (resume: Resume) => void;
  resetResume: () => void;
}

const ResumeBuilderContext = createContext<ResumeBuilderContextType | undefined>(undefined);

export const ResumeBuilderProvider = ({ children }: { children: ReactNode }) => {
  const [resume, setResumeState] = useState<Resume>(initialResumeState);
  const [settings, setSettings] = useState<BuilderSettings>(initialSettings);

  const updateProfile = useCallback((field: keyof typeof initialProfile, value: string) => {
    setResumeState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  }, []);

  const updateWorkExperience = useCallback((idx: number, field: string, value: string | string[]) => {
    setResumeState(prev => {
      const newWorkExperiences = [...prev.workExperiences];
      newWorkExperiences[idx] = {
        ...newWorkExperiences[idx],
        [field]: value,
      };
      return {
        ...prev,
        workExperiences: newWorkExperiences,
      };
    });
  }, []);

  const updateEducation = useCallback((idx: number, field: string, value: string | string[]) => {
    setResumeState(prev => {
      const newEducations = [...prev.educations];
      newEducations[idx] = {
        ...newEducations[idx],
        [field]: value,
      };
      return {
        ...prev,
        educations: newEducations,
      };
    });
  }, []);

  const updateProject = useCallback((idx: number, field: string, value: string | string[]) => {
    setResumeState(prev => {
      const newProjects = [...prev.projects];
      newProjects[idx] = {
        ...newProjects[idx],
        [field]: value,
      };
      return {
        ...prev,
        projects: newProjects,
      };
    });
  }, []);

  const updateSkills = useCallback((field: string, value: any) => {
    setResumeState(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [field]: value,
      },
    }));
  }, []);

  const updateCustom = useCallback((field: string, value: string[]) => {
    setResumeState(prev => ({
      ...prev,
      custom: {
        ...prev.custom,
        [field]: value,
      },
    }));
  }, []);

  const addWorkExperience = useCallback(() => {
    setResumeState(prev => ({
      ...prev,
      workExperiences: [...prev.workExperiences, { ...initialWorkExperience }],
    }));
  }, []);

  const addEducation = useCallback(() => {
    setResumeState(prev => ({
      ...prev,
      educations: [...prev.educations, { ...initialEducation }],
    }));
  }, []);

  const addProject = useCallback(() => {
    setResumeState(prev => ({
      ...prev,
      projects: [...prev.projects, { ...initialProject }],
    }));
  }, []);

  const deleteWorkExperience = useCallback((idx: number) => {
    setResumeState(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== idx),
    }));
  }, []);

  const deleteEducation = useCallback((idx: number) => {
    setResumeState(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== idx),
    }));
  }, []);

  const deleteProject = useCallback((idx: number) => {
    setResumeState(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== idx),
    }));
  }, []);

  const updateSettings = useCallback((field: keyof BuilderSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setResume = useCallback((newResume: Resume) => {
    setResumeState(newResume);
  }, []);

  const resetResume = useCallback(() => {
    setResumeState(initialResumeState);
    setSettings(initialSettings);
  }, []);

  return (
    <ResumeBuilderContext.Provider
      value={{
        resume,
        settings,
        updateProfile,
        updateWorkExperience,
        updateEducation,
        updateProject,
        updateSkills,
        updateCustom,
        addWorkExperience,
        addEducation,
        addProject,
        deleteWorkExperience,
        deleteEducation,
        deleteProject,
        updateSettings,
        setResume,
        resetResume,
      }}
    >
      {children}
    </ResumeBuilderContext.Provider>
  );
};

export const useResumeBuilder = () => {
  const context = useContext(ResumeBuilderContext);
  if (!context) {
    throw new Error('useResumeBuilder must be used within ResumeBuilderProvider');
  }
  return context;
};
