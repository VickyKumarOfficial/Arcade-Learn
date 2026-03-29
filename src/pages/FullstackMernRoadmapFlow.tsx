import GenericRoadmapFlowPage from '@/components/roadmap/GenericRoadmapFlowPage';
import { fullstackMernRoadmapConfig } from '@/data/fullstackMernRoadmapConfig';

export default function FullstackMernRoadmapFlow() {
  return <GenericRoadmapFlowPage config={fullstackMernRoadmapConfig} />;
}
