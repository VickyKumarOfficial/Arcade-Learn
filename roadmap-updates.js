// Quick fix for adding tags to all roadmaps at once
// This script generates the replacement patterns for the roadmaps

const updates = [
  {
    search: `  {
    id: 'devops-cloud',
    title: 'DevOps & Cloud Engineering',
    description: 'Learn containerization, CI/CD, and cloud deployment strategies',
    category: 'DevOps',
    difficulty: 'Advanced',
    estimatedDuration: '18-22 weeks',
    completedComponents: 0,
    icon: '☁️',
    color: 'from-indigo-500 to-blue-500',`,
    replace: `  {
    id: 'devops-cloud',
    title: 'DevOps & Cloud Engineering',
    description: 'Learn containerization, CI/CD, and cloud deployment strategies',
    category: 'DevOps',
    difficulty: 'Advanced',
    estimatedDuration: '18-22 weeks',
    completedComponents: 0,
    icon: '☁️',
    color: 'from-indigo-500 to-blue-500',
    tags: ['devops', 'cloud', 'docker', 'kubernetes', 'cicd', 'automation', 'infrastructure', 'aws', 'deployment', 'monitoring'],`
  }
];

console.log('Updates ready');