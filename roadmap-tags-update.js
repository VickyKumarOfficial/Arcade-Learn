// Helper script to generate tags for roadmaps based on their IDs and content
const roadmapTags = {
  'frontend-react': ['frontend', 'react', 'javascript', 'typescript', 'web-development', 'ui', 'components', 'hooks', 'jsx', 'css'],
  'backend-nodejs': ['backend', 'nodejs', 'javascript', 'express', 'server-side', 'api', 'database', 'mongodb', 'rest', 'microservices'],
  'fullstack-mern': ['fullstack', 'frontend', 'backend', 'react', 'nodejs', 'mongodb', 'express', 'javascript', 'web-development', 'api'],
  'data-science': ['data-science', 'python', 'machine-learning', 'statistics', 'data-analysis', 'pandas', 'numpy', 'visualization', 'ai', 'analytics'],
  'devops-cloud': ['devops', 'cloud', 'docker', 'kubernetes', 'cicd', 'automation', 'infrastructure', 'aws', 'deployment', 'monitoring'],
  'mobile-flutter': ['mobile', 'flutter', 'dart', 'ios', 'android', 'cross-platform', 'mobile-development', 'app-development', 'ui'],
  'cybersecurity': ['cybersecurity', 'security', 'ethical-hacking', 'penetration-testing', 'network-security', 'cryptography', 'vulnerability', 'infosec'],
  'blockchain-web3': ['blockchain', 'web3', 'cryptocurrency', 'smart-contracts', 'solidity', 'ethereum', 'defi', 'nft', 'decentralized'],
  'ai-ml-engineering': ['ai', 'machine-learning', 'deep-learning', 'neural-networks', 'python', 'tensorflow', 'pytorch', 'nlp', 'computer-vision'],
  'game-development-unity': ['game-development', 'unity', 'csharp', '3d', '2d', 'game-engine', 'scripting', 'graphics', 'gaming'],
  'cloud-architecture': ['cloud', 'architecture', 'aws', 'azure', 'gcp', 'scalability', 'infrastructure', 'enterprise', 'distributed-systems'],
  'product-management': ['product-management', 'strategy', 'user-research', 'analytics', 'roadmap', 'agile', 'scrum', 'business', 'growth'],
  'qa-automation': ['qa', 'testing', 'automation', 'selenium', 'test-automation', 'quality-assurance', 'cicd', 'testing-frameworks'],
  'ux-ui-design': ['ux', 'ui', 'design', 'user-experience', 'prototyping', 'figma', 'user-research', 'wireframing', 'visual-design'],
  'iot-embedded': ['iot', 'embedded-systems', 'arduino', 'raspberry-pi', 'sensors', 'hardware', 'c', 'electronics', 'connectivity']
};

// Output the tags in format ready for copy-paste
Object.entries(roadmapTags).forEach(([id, tags]) => {
  console.log(`'${id}': [${tags.map(tag => `'${tag}'`).join(', ')}],`);
});