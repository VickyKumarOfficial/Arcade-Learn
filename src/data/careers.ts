
import { CareerOption } from '@/types';

export const careerOptions: CareerOption[] = [
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    description: 'Create engaging user interfaces and experiences using modern web technologies',
    averageSalary: '$75,000 - $120,000',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
    roadmapIds: ['frontend-react'],
    companies: ['Google', 'Facebook', 'Netflix', 'Airbnb', 'Uber'],
    tags: ['frontend', 'web-development', 'react', 'javascript', 'typescript', 'css', 'html', 'ui', 'ux', 'responsive-design']
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    description: 'Build scalable server-side applications and APIs',
    averageSalary: '$80,000 - $130,000',
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Database Design'],
    roadmapIds: ['backend-nodejs'],
    companies: ['Amazon', 'Microsoft', 'Stripe', 'PayPal', 'Shopify'],
    tags: ['backend', 'server-side', 'nodejs', 'express', 'mongodb', 'database', 'api', 'rest', 'microservices', 'scalability']
  },
  {
    id: 'fullstack-developer',
    title: 'Full Stack Developer',
    description: 'Work on both frontend and backend to build complete web applications',
    averageSalary: '$85,000 - $140,000',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'REST APIs'],
    roadmapIds: ['frontend-react', 'backend-nodejs', 'fullstack-mern'],
    companies: ['Spotify', 'GitHub', 'Slack', 'Discord', 'Notion'],
    tags: ['fullstack', 'frontend', 'backend', 'web-development', 'react', 'nodejs', 'javascript', 'typescript', 'database', 'api']
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Extract insights from data using statistical analysis and machine learning',
    averageSalary: '$95,000 - $160,000',
    requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy', 'Data Visualization'],
    roadmapIds: ['data-science'],
    companies: ['Netflix', 'Tesla', 'LinkedIn', 'Instagram', 'Twitter'],
    tags: ['data-science', 'python', 'machine-learning', 'statistics', 'data-analysis', 'pandas', 'numpy', 'visualization', 'ai', 'analytics']
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    description: 'Streamline development and deployment processes using automation and cloud technologies',
    averageSalary: '$90,000 - $150,000',
    requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Cloud Platforms', 'Linux', 'Infrastructure as Code'],
    roadmapIds: ['devops-cloud'],
    companies: ['AWS', 'Google Cloud', 'HashiCorp', 'Red Hat', 'Docker'],
    tags: ['devops', 'cloud', 'docker', 'kubernetes', 'cicd', 'automation', 'infrastructure', 'aws', 'deployment', 'monitoring']
  },
  {
    id: 'software-architect',
    title: 'Software Architect',
    description: 'Design and oversee large-scale software systems and technical decisions',
    averageSalary: '$120,000 - $200,000',
    requiredSkills: ['System Design', 'Architecture Patterns', 'Multiple Programming Languages', 'Leadership'],
    roadmapIds: ['frontend-react', 'backend-nodejs', 'fullstack-mern', 'devops-cloud'],
    companies: ['Oracle', 'IBM', 'Salesforce', 'Adobe', 'Atlassian'],
    tags: ['architecture', 'system-design', 'leadership', 'scalability', 'design-patterns', 'enterprise', 'technical-leadership', 'software-engineering']
  }
];
