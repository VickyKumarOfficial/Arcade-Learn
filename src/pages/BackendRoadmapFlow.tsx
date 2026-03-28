import GenericRoadmapFlowPage from '@/components/roadmap/GenericRoadmapFlowPage';
import { backendRoadmapConfig } from '@/data/backendRoadmapConfig';

export default function BackendRoadmapFlow() {
  return <GenericRoadmapFlowPage config={backendRoadmapConfig} />;
}
