import type {
  TextItem,
  FeatureSet,
  ResumeSectionToLines,
  ResumeWorkExperience,
} from "@/types/resume";
import { getSectionLinesByKeywords } from "../lib/getSectionLines";
import {
  DATE_FEATURE_SETS,
  hasNumber,
  getHasText,
  isBold,
} from "../lib/commonFeatures";
import { divideSectionIntoSubsections } from "../lib/subsections";
import { getTextWithHighestFeatureScore } from "../lib/featureScoringSystem";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "../lib/bulletPoints";

// prettier-ignore
const WORK_EXPERIENCE_KEYWORDS_LOWERCASE = ['work', 'experience', 'employment', 'history', 'job'];
// prettier-ignore
const JOB_TITLES = ['Accountant', 'Administrator', 'Advisor', 'Agent', 'Analyst', 'Apprentice', 'Architect', 'Assistant', 'Associate', 'Auditor', 'Developer', 'Designer', 'Director', 'Engineer', 'Intern', 'Lead', 'Manager', 'Consultant', 'Coordinator', 'Specialist', 'Trainee', 'Executive', 'Officer', 'Researcher', 'Scientist', 'Technician', 'Programmer', 'Tester'];

const hasJobTitle = (item: TextItem) =>
  JOB_TITLES.some((jobTitle) =>
    item.text.split(/\s/).some((word) => word === jobTitle)
  );
const hasMoreThan5Words = (item: TextItem) => item.text.split(/\s/).length > 5;
const JOB_TITLE_FEATURE_SET: FeatureSet[] = [
  [hasJobTitle, 4],
  [hasNumber, -4],
  [hasMoreThan5Words, -2],
];

export const extractWorkExperience = (sections: ResumeSectionToLines) => {
  const workExperiences: ResumeWorkExperience[] = [];
  const workExperiencesScores = [];
  const lines = getSectionLinesByKeywords(
    sections,
    WORK_EXPERIENCE_KEYWORDS_LOWERCASE
  );
  const subsections = divideSectionIntoSubsections(lines);

  for (let i = 0; i < subsections.length; i++) {
    const subsectionLines = subsections[i];
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines) ?? 2;

    const subsectionInfoTextItems = subsectionLines
      .slice(0, descriptionsLineIdx)
      .flat();
    const [date, dateScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      DATE_FEATURE_SETS
    );
    const [jobTitle, jobTitleScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      JOB_TITLE_FEATURE_SET
    );
    const COMPANY_FEATURE_SET: FeatureSet[] = [
      [isBold, 2],
      [getHasText(date), -4],
      [getHasText(jobTitle), -4],
    ];
    const [company, companyScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      COMPANY_FEATURE_SET,
      false
    );

    const subsectionDescriptionsLines =
      subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(subsectionDescriptionsLines);

    workExperiences.push({ company, jobTitle, date, descriptions });
    workExperiencesScores.push({
      companyScores,
      jobTitleScores,
      dateScores,
    });
  }
  return { workExperiences, workExperiencesScores };
};
