// This file maps the testIds in the roadmapComponents to the actual test IDs in componentTests

export const getComponentPrerequisites = () => {
  return {
    // Frontend React Roadmap
    'frontend-react': {
      'html-css-basics': [],
      'javascript-fundamentals': ['html-css-basics'],
      'react-basics': ['javascript-fundamentals'],
      'typescript': ['react-basics'],
      'state-management': ['react-basics'],
      'testing': ['react-basics', 'typescript']
    },
    // Backend Node.js Roadmap
    'backend-nodejs': {
      'nodejs-basics': [],
      'express-framework': ['nodejs-basics'],
      'databases': ['express-framework']
    },
    // MERN Stack Roadmap
    'fullstack-mern': {
      'mern-setup': ['frontend-react.react-basics', 'backend-nodejs.nodejs-basics'],
      'authentication': ['mern-setup']
    },
    // Data Science Roadmap
    'data-science': {
      'python-fundamentals': [],
      'pandas-numpy': ['python-fundamentals']
    },
    // DevOps Roadmap
    'devops': {
      'docker-basics': [],
      'kubernetes': ['docker-basics']
    }
  };
};

// Map component IDs to their test IDs
export const getComponentTestIds = () => {
  return {
    'html-css-basics': 'html-css-basics',
    'javascript-fundamentals': 'javascript-fundamentals',
    'react-basics': 'react-basics',
    'typescript': 'typescript',
    'state-management': 'state-management',
    'testing': 'testing',
    'nodejs-basics': 'nodejs-basics',
    'express-framework': 'express-framework',
    'databases': 'databases',
    'mern-setup': 'mern-setup',
    'authentication': 'authentication',
    'python-fundamentals': 'python-fundamentals',
    'pandas-numpy': 'pandas-numpy',
    'docker-basics': 'docker-basics',
    'kubernetes': 'kubernetes'
  };
};