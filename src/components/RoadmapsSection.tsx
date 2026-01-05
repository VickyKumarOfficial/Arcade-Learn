
import { useState } from "react";
import { roadmaps } from "@/data/roadmaps";
import RoadmapCard from "./RoadmapCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface RoadmapsSectionProps {
  onInteraction?: () => void;
  isFullPage?: boolean; // New prop to indicate if this is the full Roadmaps page
}

const RoadmapsSection = ({ onInteraction, isFullPage = false }: RoadmapsSectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('View All Courses');

  // Define the specific categories we want to show
  const specificCategories = ['View All Courses', 'Full Stack', 'Data Science', 'AI/ML', 'Cloud', 'Blockchain'];

  // Enhanced search keywords for each roadmap
  const roadmapKeywords: { [key: string]: string[] } = {
    'frontend-react': ['html', 'css', 'javascript', 'react', 'jsx', 'typescript', 'hooks', 'state', 'props', 'components', 'frontend', 'ui', 'responsive', 'bootstrap', 'tailwind', 'sass'],
    'backend-nodejs': ['node', 'nodejs', 'express', 'api', 'rest', 'database', 'mongodb', 'postgresql', 'sql', 'server', 'backend', 'middleware', 'authentication', 'jwt', 'mongoose'],
    'fullstack-mern': ['mern', 'mongodb', 'express', 'react', 'node', 'nodejs', 'full stack', 'fullstack', 'javascript', 'authentication', 'jwt', 'api', 'spa', 'web development'],
    'mobile-flutter': ['flutter', 'dart', 'mobile', 'android', 'ios', 'cross platform', 'app development', 'firebase', 'state management', 'widgets', 'material design'],
    'cybersecurity': ['security', 'hacking', 'penetration testing', 'ethical hacking', 'network security', 'encryption', 'firewall', 'malware', 'vulnerability', 'cyber', 'infosec', 'kali linux'],
    'ai-ml-engineering': ['artificial intelligence', 'machine learning', 'python', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'neural networks', 'deep learning', 'data science', 'ai', 'ml'],
    'blockchain-web3': ['blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'smart contracts', 'solidity', 'web3', 'defi', 'nft', 'crypto', 'distributed ledger', 'decentralized'],
    'game-development-unity': ['unity', 'c#', 'csharp', 'game development', 'gaming', 'gameobjects', 'animation', 'physics', '2d', '3d', 'mobile games', 'indie games', 'scripting'],
    'cloud-architecture': ['aws', 'azure', 'google cloud', 'gcp', 'cloud computing', 'docker', 'kubernetes', 'microservices', 'serverless', 'lambda', 'ec2', 's3', 'devops', 'infrastructure'],
    'product-management': ['product', 'management', 'strategy', 'roadmap', 'user research', 'analytics', 'metrics', 'kpi', 'agile', 'scrum', 'stakeholder', 'go-to-market', 'product owner'],
    'qa-automation': ['testing', 'qa', 'quality assurance', 'selenium', 'automation', 'test cases', 'bug testing', 'api testing', 'performance testing', 'ci/cd', 'jenkins', 'cypress'],
    'ux-ui-design': ['ux', 'ui', 'user experience', 'user interface', 'design', 'figma', 'adobe xd', 'sketch', 'prototyping', 'wireframes', 'user research', 'usability', 'typography', 'color theory'],
    'iot-embedded': ['iot', 'internet of things', 'arduino', 'raspberry pi', 'embedded systems', 'sensors', 'electronics', 'microcontroller', 'gpio', 'mqtt', 'wifi', 'bluetooth', 'hardware']
  };

  // Define popular roadmaps to show by default (limit to 6 most popular)
  const popularRoadmapIds = [
    'frontend-react',
    'backend-nodejs',
    'fullstack-mern',
    'ai-ml-engineering',
    'cybersecurity',
    'blockchain-web3'
  ];

  // Filter roadmaps based on search term and selected category
  const filteredRoadmaps = roadmaps.filter(roadmap => {
    const searchLower = searchTerm.toLowerCase();
    const keywords = roadmapKeywords[roadmap.id] || [];

    // Special case: show all courses when '*' is used as search term
    if (searchTerm === '*') {
      return true;
    }

    // If no search term and viewing all courses, show only popular ones
    if (searchTerm === '' && selectedCategory === 'View All Courses') {
      return popularRoadmapIds.includes(roadmap.id);
    }

    // Standard filtering logic
    const matchesSearch = searchTerm === '' ||
      roadmap.title.toLowerCase().includes(searchLower) ||
      roadmap.description.toLowerCase().includes(searchLower) ||
      roadmap.category.toLowerCase().includes(searchLower) ||
      keywords.some(keyword => keyword.includes(searchLower) || searchLower.includes(keyword));

    const matchesCategory = selectedCategory === 'View All Courses' || roadmap.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section id="roadmaps" className="pt-18 sm:pt-22 pb-16 sm:pb-20 overflow-x-hidden relative" style={{ background: 'linear-gradient(to bottom, #000000 0%, hsl(0, 0%, 4%) 100%)' }}>
      <div className="w-full px-2 sm:px-4 max-w-none">
        {/* Only show heading when not on full Roadmaps page (i.e., on home page) */}
        {!isFullPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-2 sm:mb-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-3 mt-2 sm:mt-3 leading-normal md:leading-normal px-2">
              {searchTerm === '*' ? 'All Available' : 'Some Popular'}
              <span className="text-primary"> Courses</span>
            </h2>
            {searchTerm === '' && selectedCategory === 'View All Courses' && (
              <p className="text-muted-foreground text-sm sm:text-base">
                Showing {filteredRoadmaps.length} most popular courses
              </p>
            )}
            {searchTerm === '*' && (
              <p className="text-muted-foreground text-sm sm:text-base">
                Showing all {filteredRoadmaps.length} available courses
              </p>
            )}
          </motion.div>
        )}

        <div className="mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-2"
          >
            {/* Category Buttons */}
            {specificCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  if (!user && onInteraction) {
                    onInteraction();
                    return;
                  }
                  setSelectedCategory(category);
                  setSearchTerm('');
                }}
                className={`px-6 py-3 rounded-full shadow-md border transition-all duration-200 cursor-pointer ${selectedCategory === category
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary'
                  }`}
              >
                <span className={`font-medium ${selectedCategory === category
                  ? 'text-primary-foreground'
                  : 'text-foreground text-sm sm:text-base'
                  }`}>
                  {category}
                </span>
              </button>
            ))}

            {/* Search Bar - Only show on full Roadmaps page */}
            {isFullPage && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search roadmaps..."
                  value={searchTerm}
                  onChange={(e) => {
                    if (!user && onInteraction) {
                      onInteraction();
                      return;
                    }
                    setSearchTerm(e.target.value);
                  }}
                  onFocus={() => {
                    if (!user && onInteraction) {
                      onInteraction();
                    }
                  }}
                  className="px-6 py-3 rounded-full shadow-md border border-border bg-card text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all duration-200 w-64"
                />
                <svg
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 px-2 sm:px-4 auto-rows-fr"
        >
          {filteredRoadmaps.map((roadmap) => (
            <motion.div
              key={roadmap.id}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
              }}
              className="h-full"
            >
              <RoadmapCard roadmap={roadmap} />
            </motion.div>
          ))}
        </motion.div>

        {/* Show "View All Roadmaps" button when displaying limited popular courses */}
        {searchTerm === '' && selectedCategory === 'View All Courses' && filteredRoadmaps.length === popularRoadmapIds.length && (
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={() => {
                if (!user && onInteraction) {
                  onInteraction();
                  return;
                }
                // If on full Roadmaps page, show all courses; if on Home page, navigate to Roadmaps
                if (isFullPage) {
                  setSearchTerm('*');
                } else {
                  navigate('/roadmaps');
                }
              }}
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              View All Roadmaps
            </button>
          </div>
        )}

        {/* Show "Show Popular Courses" button when displaying all courses */}
        {searchTerm === '*' && selectedCategory === 'View All Courses' && (
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={() => {
                if (!user && onInteraction) {
                  onInteraction();
                  return;
                }
                setSearchTerm('');
              }}
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Show Popular Courses Only
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RoadmapsSection;
