import type {
  FeatureSet,
  ResumeSectionToLines,
  ResumeProject,
} from "@/types/resume";
import { getSectionLinesByKeywords } from "../lib/getSectionLines";
import {
  DATE_FEATURE_SETS,
  getHasText,
  isBold,
} from "../lib/commonFeatures";
import { divideSectionIntoSubsections } from "../lib/subsections";
import { getTextWithHighestFeatureScore } from "../lib/featureScoringSystem";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "../lib/bulletPoints";

export const extractProjects = (sections: ResumeSectionToLines) => {
  const projects: ResumeProject[] = [];
  const projectsScores = [];
  const lines = getSectionLinesByKeywords(sections, ["project"]);
  const subsections = divideSectionIntoSubsections(lines);

  for (let i = 0; i < subsections.length; i++) {
    const subsectionLines = subsections[i];
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines) ?? 1;

    const subsectionInfoTextItems = subsectionLines
      .slice(0, descriptionsLineIdx)
      .flat();
    const [date, dateScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      DATE_FEATURE_SETS
    );
    const PROJECT_FEATURE_SET: FeatureSet[] = [
      [isBold, 2],
      [getHasText(date), -4],
    ];
    const [project, projectScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      PROJECT_FEATURE_SET,
      false
    );

    const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(descriptionsLines);

    projects.push({ project, date, descriptions });
    projectsScores.push({
      projectScores,
      dateScores,
    });
  }
  return { projects, projectsScores };
};
