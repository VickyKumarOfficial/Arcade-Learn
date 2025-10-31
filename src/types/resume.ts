/**
 * Resume types - Based on OpenResume structure
 * Adapted for Arcade-Learn
 */

// ========== PDF Parser Types ==========

export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean; // End of line
}

export type TextItems = TextItem[];

export type Line = TextItem[];
export type Lines = Line[];

export type ResumeSectionToLines = {
  [key: string]: Lines;
};

export interface TextScore {
  text: string;
  score: number;
  match: boolean;
}

export type TextScores = TextScore[];

// ========== Resume Data Structure ==========

export interface ResumeProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  url: string;
  summary: string;
}

export interface ResumeEducation {
  school: string;
  degree: string;
  gpa: string;
  date: string;
  descriptions: string[];
}

export interface ResumeWorkExperience {
  company: string;
  jobTitle: string;
  date: string;
  descriptions: string[];
}

export interface ResumeProject {
  project: string;
  date: string;
  descriptions: string[];
}

export interface ResumeSkills {
  featuredSkills: string[];
  descriptions: string[];
}

export interface ResumeCustom {
  descriptions: string[];
}

export interface Resume {
  profile: ResumeProfile;
  workExperiences: ResumeWorkExperience[];
  educations: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkills;
  custom: ResumeCustom;
}

// ========== Feature Scoring System ==========

export type FeatureSet = [
  (item: TextItem) => boolean | RegExpMatchArray | null,
  number,
  boolean?
];

export type Subsections = Lines[]; // Array of subsections, where each subsection is Lines

// ========== Initial/Default Values ==========

export const initialProfile: ResumeProfile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  url: "",
  summary: "",
};

export const initialEducation: ResumeEducation = {
  school: "",
  degree: "",
  gpa: "",
  date: "",
  descriptions: [],
};

export const initialWorkExperience: ResumeWorkExperience = {
  company: "",
  jobTitle: "",
  date: "",
  descriptions: [],
};

export const initialProject: ResumeProject = {
  project: "",
  date: "",
  descriptions: [],
};

export const initialSkills: ResumeSkills = {
  featuredSkills: [],
  descriptions: [],
};

export const initialCustom: ResumeCustom = {
  descriptions: [],
};

export const initialResume: Resume = {
  profile: initialProfile,
  workExperiences: [initialWorkExperience],
  educations: [initialEducation],
  projects: [initialProject],
  skills: initialSkills,
  custom: initialCustom,
};
