import {
  diagnoseAdaptiveLearningSignal,
  shiftAdaptiveSkillLevel,
  type AdaptiveDiagnosisAction,
  type AdaptiveDiagnosisInput,
  type AdaptiveDiagnosisResult,
} from '@/services/adaptiveRoadmapDiagnosisService';
import type { FrontendSkillLevel } from '@/types/adaptiveRoadmap';

export type FrontendDiagnosisAction = AdaptiveDiagnosisAction;
export type FrontendDiagnosisInput = AdaptiveDiagnosisInput;
export type FrontendDiagnosisResult = AdaptiveDiagnosisResult;

export function diagnoseFrontendLearningSignal(input: FrontendDiagnosisInput): FrontendDiagnosisResult {
  return diagnoseAdaptiveLearningSignal(input);
}

export function shiftSkillLevel(level: FrontendSkillLevel, delta: -1 | 0 | 1): FrontendSkillLevel {
  return shiftAdaptiveSkillLevel(level, delta);
}
