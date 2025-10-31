import type { ResumeSectionToLines, ResumeSkills } from "@/types/resume";
import { getSectionLinesByKeywords } from "../lib/getSectionLines";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "../lib/bulletPoints";

export const extractSkills = (sections: ResumeSectionToLines) => {
  const lines = getSectionLinesByKeywords(sections, ["skill"]);
  const descriptionsLineIdx = getDescriptionsLineIdx(lines) ?? 0;
  const descriptionsLines = lines.slice(descriptionsLineIdx);
  const descriptions = getBulletPointsFromLines(descriptionsLines);

  const featuredSkills: string[] = [];
  if (descriptionsLineIdx !== 0) {
    const featuredSkillsLines = lines.slice(0, descriptionsLineIdx);
    const featuredSkillsTextItems = featuredSkillsLines
      .flat()
      .filter((item) => item.text.trim())
      .slice(0, 10); // Get up to 10 featured skills
    for (let i = 0; i < featuredSkillsTextItems.length; i++) {
      featuredSkills.push(featuredSkillsTextItems[i].text);
    }
  }

  const skills: ResumeSkills = {
    featuredSkills,
    descriptions,
  };

  return { skills };
};
