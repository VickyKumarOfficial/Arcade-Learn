import GenericRoadmapFlowPage from '@/components/roadmap/GenericRoadmapFlowPage';
import { frontendRoadmapConfig } from '@/data/frontendRoadmapConfig';

export default function FrontendRoadmapFlow() {
  return <GenericRoadmapFlowPage config={frontendRoadmapConfig} />;
}
