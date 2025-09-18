
import { Roadmap } from '@/types';

export const roadmaps: Roadmap[] = [
  {
    id: 'frontend-react',
    title: 'Frontend Development with React',
    description: 'Master modern frontend development with React, TypeScript, and related technologies',
    category: 'Frontend',
    difficulty: 'Intermediate',
    estimatedDuration: '12-16 weeks',
    completedComponents: 0,
    icon: '⚛️',
    color: 'from-blue-500 to-cyan-500',
    components: [
      {
        id: 'html-css-basics',
        title: 'HTML & CSS Fundamentals',
        description: 'Learn the building blocks of web development',
        estimatedHours: 40,
        completed: false,
        isLocked: false, // First component is unlocked
        prerequisiteIds: [], // No prerequisites for first component
        testId: 'html-css-basics',
        resources: [
          {
            id: 'html-mdn',
            title: 'HTML Basics - MDN',
            type: 'documentation',
            url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
            duration: '8 hours'
          },
          {
            id: 'css-guide',
            title: 'CSS Complete Guide',
            type: 'course',
            url: 'https://web.dev/learn/css/',
            duration: '12 hours'
          }
        ]
      },
      {
        id: 'javascript-fundamentals',
        title: 'JavaScript Fundamentals',
        description: 'Master JavaScript ES6+ features and concepts',
        estimatedHours: 60,
        completed: false,
        isLocked: true, // Locked until previous component is completed
        prerequisiteIds: ['html-css-basics'],
        testId: 'javascript-fundamentals',
        resources: [
          {
            id: 'js-info',
            title: 'Modern JavaScript Tutorial',
            type: 'documentation',
            url: 'https://javascript.info/',
            duration: '25 hours'
          },
          {
            id: 'js-es6',
            title: 'ES6 Features Deep Dive',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=WZQc7RUAg18',
            duration: '2 hours'
          }
        ]
      },
      {
        id: 'react-basics',
        title: 'React Fundamentals',
        description: 'Learn React components, props, state, and hooks',
        estimatedHours: 50,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['javascript-fundamentals'],
        testId: 'react-basics',
        resources: [
          {
            id: 'react-docs',
            title: 'Official React Documentation',
            type: 'documentation',
            url: 'https://react.dev/learn',
            duration: '20 hours'
          },
          {
            id: 'react-hooks',
            title: 'React Hooks Tutorial',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
            duration: '3 hours'
          }
        ]
      },
      {
        id: 'typescript',
        title: 'TypeScript Integration',
        description: 'Add type safety to your React applications',
        estimatedHours: 35,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['react-basics'],
        testId: 'typescript',
        resources: [
          {
            id: 'ts-handbook',
            title: 'TypeScript Handbook',
            type: 'documentation',
            url: 'https://www.typescriptlang.org/docs/',
            duration: '15 hours'
          },
          {
            id: 'react-ts',
            title: 'React with TypeScript',
            type: 'course',
            url: 'https://react-typescript-cheatsheet.netlify.app/',
            duration: '8 hours'
          }
        ]
      },
      {
        id: 'state-management',
        title: 'State Management',
        description: 'Learn Redux, Zustand, and context patterns',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['typescript'],
        resources: [
          {
            id: 'redux-toolkit',
            title: 'Redux Toolkit Tutorial',
            type: 'documentation',
            url: 'https://redux-toolkit.js.org/tutorials/quick-start',
            duration: '12 hours'
          },
          {
            id: 'zustand-guide',
            title: 'Zustand State Management',
            type: 'article',
            url: 'https://zustand-demo.pmnd.rs/',
            duration: '6 hours'
          }
        ]
      },
      {
        id: 'testing',
        title: 'Testing React Applications',
        description: 'Unit testing, integration testing, and E2E testing',
        estimatedHours: 30,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['state-management'],
        resources: [
          {
            id: 'testing-library',
            title: 'React Testing Library',
            type: 'documentation',
            url: 'https://testing-library.com/docs/react-testing-library/intro/',
            duration: '10 hours'
          },
          {
            id: 'jest-testing',
            title: 'Jest Testing Framework',
            type: 'course',
            url: 'https://jestjs.io/docs/tutorial-react',
            duration: '8 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'backend-nodejs',
    title: 'Backend Development with Node.js',
    description: 'Build scalable backend services with Node.js, Express, and databases',
    category: 'Backend',
    difficulty: 'Intermediate',
    estimatedDuration: '14-18 weeks',
    completedComponents: 0,
    icon: '🟢',
    color: 'from-green-500 to-emerald-500',
    components: [
      {
        id: 'nodejs-basics',
        title: 'Node.js Fundamentals',
        description: 'Understanding Node.js runtime and core modules',
        estimatedHours: 35,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'nodejs-basics',
        resources: [
          {
            id: 'nodejs-docs',
            title: 'Official Node.js Documentation',
            type: 'documentation',
            url: 'https://nodejs.org/en/docs/',
            duration: '15 hours'
          },
          {
            id: 'nodejs-course',
            title: 'Node.js Complete Course',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4',
            duration: '8 hours'
          }
        ]
      },
      {
        id: 'express-framework',
        title: 'Express.js Framework',
        description: 'Build web applications and APIs with Express',
        estimatedHours: 45,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['nodejs-basics'],
        testId: 'express-framework',
        resources: [
          {
            id: 'express-guide',
            title: 'Express.js Guide',
            type: 'documentation',
            url: 'https://expressjs.com/en/guide/routing.html',
            duration: '18 hours'
          },
          {
            id: 'rest-api',
            title: 'Building REST APIs',
            type: 'course',
            url: 'https://restfulapi.net/',
            duration: '12 hours'
          }
        ]
      },
      {
        id: 'databases',
        title: 'Database Integration',
        description: 'Working with MongoDB, PostgreSQL, and ORMs',
        estimatedHours: 50,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['express-framework'],
        testId: 'databases',
        resources: [
          {
            id: 'mongodb-tutorial',
            title: 'MongoDB University',
            type: 'course',
            url: 'https://university.mongodb.com/',
            duration: '20 hours'
          },
          {
            id: 'mongoose-docs',
            title: 'Mongoose ODM',
            type: 'documentation',
            url: 'https://mongoosejs.com/docs/',
            duration: '15 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'fullstack-mern',
    title: 'Full Stack MERN Development',
    description: 'Complete web application development with MongoDB, Express, React, and Node.js',
    category: 'Full Stack',
    difficulty: 'Advanced',
    estimatedDuration: '20-24 weeks',
    completedComponents: 0,
    icon: '🚀',
    color: 'from-purple-500 to-pink-500',
    components: [
      {
        id: 'mern-setup',
        title: 'MERN Stack Setup',
        description: 'Setting up development environment and project structure',
        estimatedHours: 25,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'mern-setup',
        resources: [
          {
            id: 'mern-tutorial',
            title: 'MERN Stack Tutorial',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
            duration: '12 hours'
          }
        ]
      },
      {
        id: 'authentication',
        title: 'User Authentication',
        description: 'Implement JWT authentication and authorization',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['mern-setup'],
        testId: 'authentication',
        resources: [
          {
            id: 'jwt-guide',
            title: 'JWT Authentication Guide',
            type: 'article',
            url: 'https://jwt.io/introduction/',
            duration: '8 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science & Machine Learning',
    description: 'Master data analysis, visualization, and machine learning with Python',
    category: 'Data Science',
    difficulty: 'Intermediate',
    estimatedDuration: '16-20 weeks',
    completedComponents: 0,
    icon: '📊',
    color: 'from-orange-500 to-red-500',
    components: [
      {
        id: 'python-fundamentals',
        title: 'Python for Data Science',
        description: 'Python programming fundamentals and data structures',
        estimatedHours: 45,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'python-fundamentals',
        resources: [
          {
            id: 'python-tutorial',
            title: 'Python.org Tutorial',
            type: 'documentation',
            url: 'https://docs.python.org/3/tutorial/',
            duration: '20 hours'
          }
        ]
      },
      {
        id: 'pandas-numpy',
        title: 'Data Manipulation',
        description: 'Master Pandas and NumPy for data analysis',
        estimatedHours: 50,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['python-fundamentals'],
        testId: 'pandas-numpy',
        resources: [
          {
            id: 'pandas-tutorial',
            title: 'Pandas Tutorial',
            type: 'documentation',
            url: 'https://pandas.pydata.org/docs/user_guide/',
            duration: '25 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'devops-cloud',
    title: 'DevOps & Cloud Engineering',
    description: 'Learn containerization, CI/CD, and cloud deployment strategies',
    category: 'DevOps',
    difficulty: 'Advanced',
    estimatedDuration: '18-22 weeks',
    completedComponents: 0,
    icon: '☁️',
    color: 'from-indigo-500 to-blue-500',
    components: [
      {
        id: 'docker-basics',
        title: 'Docker Containerization',
        description: 'Containerize applications with Docker',
        estimatedHours: 35,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'docker-basics',
        resources: [
          {
            id: 'docker-tutorial',
            title: 'Docker Official Tutorial',
            type: 'documentation',
            url: 'https://docs.docker.com/get-started/',
            duration: '15 hours'
          }
        ]
      },
      {
        id: 'kubernetes',
        title: 'Kubernetes Orchestration',
        description: 'Container orchestration and management',
        estimatedHours: 60,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['docker-basics'],
        testId: 'kubernetes',
        resources: [
          {
            id: 'k8s-tutorial',
            title: 'Kubernetes Tutorial',
            type: 'documentation',
            url: 'https://kubernetes.io/docs/tutorials/',
            duration: '30 hours'
          }
        ]
      }
    ]
  }
];
