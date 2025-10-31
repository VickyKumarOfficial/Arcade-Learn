/**
 * Common Features Helper Library
 * Based on OpenResume's common-features.ts
 * Reference: https://github.com/xitanggg/open-resume/blob/main/src/app/lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features.ts
 */

import type { TextItem, FeatureSet } from "@/types/resume";

const isTextItemBold = (fontName: string) =>
  fontName.toLowerCase().includes("bold");
export const isBold = (item: TextItem) => isTextItemBold(item.fontName);
export const hasLetter = (item: TextItem) => /[a-zA-Z]/.test(item.text);
export const hasNumber = (item: TextItem) => /[0-9]/.test(item.text);
export const hasComma = (item: TextItem) => item.text.includes(",");
export const getHasText = (text: string) => (item: TextItem) =>
  item.text.includes(text);
export const hasOnlyLettersSpacesAmpersands = (item: TextItem) =>
  /^[A-Za-z\s&]+$/.test(item.text);
export const hasLetterAndIsAllUpperCase = (item: TextItem) =>
  hasLetter(item) && item.text.toUpperCase() === item.text;

// Date Features
const DATE_FEATURE_SETS_PRIMARY_KEYWORDS = [
  "present",
  "now",
  "current",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const matchDateKeyword = (item: TextItem) =>
  DATE_FEATURE_SETS_PRIMARY_KEYWORDS.some((keyword) =>
    item.text.toLowerCase().includes(keyword)
  );
const matchYear = (item: TextItem) => item.text.match(/(?:19|20)\d{2}/);

export const DATE_FEATURE_SETS: FeatureSet[] = [
  [matchYear, 2, true],
  [matchDateKeyword, 2],
  [hasComma, -1],
];
