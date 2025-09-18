import { ComponentTest } from '../types';

export const componentTests: Record<string, ComponentTest> = {
  // Frontend React Roadmap Tests
  'html-css-basics': {
    id: 'html-css-basics',
    title: 'HTML & CSS Fundamentals Test',
    description: 'Test your knowledge of HTML structure and CSS styling',
    timeLimit: 15,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'html-1',
        question: 'Which HTML element is used to define the main content of a document?',
        type: 'multiple-choice',
        options: ['<header>', '<main>', '<section>', '<article>'],
        correctAnswer: '<main>',
        points: 20
      },
      {
        id: 'html-2',
        question: 'CSS stands for Cascading Style Sheets.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'css-1',
        question: 'Which CSS property is used to change the text color?',
        type: 'multiple-choice',
        options: ['color', 'text-color', 'font-color', 'background-color'],
        correctAnswer: 'color',
        points: 20
      },
      {
        id: 'css-2',
        question: 'The box model includes margin, border, padding, and content.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'html-3',
        question: 'Which attribute is used to specify a unique identifier for an HTML element?',
        type: 'multiple-choice',
        options: ['class', 'id', 'name', 'key'],
        correctAnswer: 'id',
        points: 20
      }
    ]
  },

  'javascript-fundamentals': {
    id: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals Test',
    description: 'Test your understanding of JavaScript basics',
    timeLimit: 20,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'js-1',
        question: 'Which keyword is used to declare a variable that cannot be reassigned?',
        type: 'multiple-choice',
        options: ['var', 'let', 'const', 'final'],
        correctAnswer: 'const',
        points: 20
      },
      {
        id: 'js-2',
        question: 'JavaScript is a compiled language.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'js-3',
        question: 'What will console.log(typeof null) output?',
        type: 'multiple-choice',
        options: ['null', 'undefined', 'object', 'string'],
        correctAnswer: 'object',
        points: 20
      },
      {
        id: 'js-4',
        question: 'Arrow functions automatically bind the "this" context.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'js-5',
        question: 'Which method is used to add an element to the end of an array?',
        type: 'multiple-choice',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 'push()',
        points: 20
      }
    ]
  },

  'react-basics': {
    id: 'react-basics',
    title: 'React Basics Test',
    description: 'Test your knowledge of React fundamentals',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'react-1',
        question: 'What is JSX?',
        type: 'multiple-choice',
        options: ['A templating language', 'A syntax extension for JavaScript', 'A separate framework', 'A CSS preprocessor'],
        correctAnswer: 'A syntax extension for JavaScript',
        points: 20
      },
      {
        id: 'react-2',
        question: 'React components must always return a single root element.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'react-3',
        question: 'Which hook is used to manage component state?',
        type: 'multiple-choice',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correctAnswer: 'useState',
        points: 20
      },
      {
        id: 'react-4',
        question: 'Props are mutable in React components.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'react-5',
        question: 'What is the purpose of useEffect hook?',
        type: 'multiple-choice',
        options: ['Managing state', 'Handling side effects', 'Creating components', 'Styling components'],
        correctAnswer: 'Handling side effects',
        points: 20
      }
    ]
  },

  'typescript': {
    id: 'typescript',
    title: 'TypeScript Essentials Test',
    description: 'Test your understanding of TypeScript features',
    timeLimit: 20,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'ts-1',
        question: 'TypeScript is a superset of JavaScript.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ts-2',
        question: 'Which symbol is used to define optional properties in TypeScript?',
        type: 'multiple-choice',
        options: ['*', '?', '!', '&'],
        correctAnswer: '?',
        points: 20
      },
      {
        id: 'ts-3',
        question: 'TypeScript code can run directly in the browser without compilation.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'ts-4',
        question: 'What is the purpose of interfaces in TypeScript?',
        type: 'multiple-choice',
        options: ['To define object shapes', 'To create classes', 'To import modules', 'To handle errors'],
        correctAnswer: 'To define object shapes',
        points: 20
      },
      {
        id: 'ts-5',
        question: 'Which keyword is used to define a type alias?',
        type: 'multiple-choice',
        options: ['type', 'interface', 'class', 'enum'],
        correctAnswer: 'type',
        points: 20
      }
    ]
  },

  'state-management': {
    id: 'state-management',
    title: 'State Management Test',
    description: 'Test your knowledge of React state management patterns',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'state-1',
        question: 'What is the Context API used for?',
        type: 'multiple-choice',
        options: ['Local state management', 'Global state sharing', 'API calls', 'Component styling'],
        correctAnswer: 'Global state sharing',
        points: 20
      },
      {
        id: 'state-2',
        question: 'Redux requires a single store for the entire application.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'state-3',
        question: 'Which hook is used to access Context values?',
        type: 'multiple-choice',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 'useContext',
        points: 20
      },
      {
        id: 'state-4',
        question: 'Reducers in Redux should be pure functions.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'state-5',
        question: 'What is prop drilling?',
        type: 'multiple-choice',
        options: ['A debugging technique', 'Passing props through multiple component levels', 'A state management library', 'A React hook'],
        correctAnswer: 'Passing props through multiple component levels',
        points: 20
      }
    ]
  },

  'testing': {
    id: 'testing',
    title: 'React Testing Test',
    description: 'Test your knowledge of React testing practices',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'test-1',
        question: 'Which library is commonly used for testing React components?',
        type: 'multiple-choice',
        options: ['Jest', 'React Testing Library', 'Enzyme', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      },
      {
        id: 'test-2',
        question: 'Unit tests should test implementation details rather than behavior.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'test-3',
        question: 'What does the render function in React Testing Library return?',
        type: 'multiple-choice',
        options: ['A component instance', 'A DOM node', 'Testing utilities', 'A React element'],
        correctAnswer: 'Testing utilities',
        points: 20
      },
      {
        id: 'test-4',
        question: 'Snapshot testing helps catch unintended UI changes.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'test-5',
        question: 'Which method is used to simulate user interactions in tests?',
        type: 'multiple-choice',
        options: ['fireEvent', 'userEvent', 'simulate', 'Both A and B'],
        correctAnswer: 'Both A and B',
        points: 20
      }
    ]
  },

  // Backend Node.js Roadmap Tests
  'nodejs-basics': {
    id: 'nodejs-basics',
    title: 'Node.js Fundamentals Test',
    description: 'Test your understanding of Node.js runtime and core modules',
    timeLimit: 20,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'node-1',
        question: 'Node.js is built on which JavaScript engine?',
        type: 'multiple-choice',
        options: ['SpiderMonkey', 'V8', 'JavaScriptCore', 'Chakra'],
        correctAnswer: 'V8',
        points: 20
      },
      {
        id: 'node-2',
        question: 'Node.js is single-threaded.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'node-3',
        question: 'Which module is used to work with file systems in Node.js?',
        type: 'multiple-choice',
        options: ['fs', 'path', 'os', 'util'],
        correctAnswer: 'fs',
        points: 20
      },
      {
        id: 'node-4',
        question: 'npm stands for Node Package Manager.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'node-5',
        question: 'What is the Event Loop in Node.js?',
        type: 'multiple-choice',
        options: ['A debugging tool', 'The mechanism that handles asynchronous operations', 'A testing framework', 'A package manager'],
        correctAnswer: 'The mechanism that handles asynchronous operations',
        points: 20
      }
    ]
  },

  'express-framework': {
    id: 'express-framework',
    title: 'Express.js Framework Test',
    description: 'Test your knowledge of Express.js web framework',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'express-1',
        question: 'Express.js is a web application framework for Node.js.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'express-2',
        question: 'Which method is used to define routes in Express?',
        type: 'multiple-choice',
        options: ['app.route()', 'app.get()', 'app.use()', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      },
      {
        id: 'express-3',
        question: 'Middleware functions have access to request and response objects.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'express-4',
        question: 'What is the purpose of the next() function in Express middleware?',
        type: 'multiple-choice',
        options: ['To end the request', 'To pass control to the next middleware', 'To send a response', 'To handle errors'],
        correctAnswer: 'To pass control to the next middleware',
        points: 20
      },
      {
        id: 'express-5',
        question: 'Which HTTP status code indicates a successful GET request?',
        type: 'multiple-choice',
        options: ['200', '201', '404', '500'],
        correctAnswer: '200',
        points: 20
      }
    ]
  },

  'databases': {
    id: 'databases',
    title: 'Database Integration Test',
    description: 'Test your knowledge of database integration with Node.js',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'db-1',
        question: 'MongoDB is a NoSQL database.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'db-2',
        question: 'Which ODM is commonly used with MongoDB in Node.js?',
        type: 'multiple-choice',
        options: ['Sequelize', 'Mongoose', 'TypeORM', 'Prisma'],
        correctAnswer: 'Mongoose',
        points: 20
      },
      {
        id: 'db-3',
        question: 'SQL databases use tables to store data.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'db-4',
        question: 'What does CRUD stand for?',
        type: 'multiple-choice',
        options: ['Create, Read, Update, Delete', 'Connect, Retrieve, Upload, Download', 'Cache, Route, Update, Deploy', 'Configure, Run, Update, Debug'],
        correctAnswer: 'Create, Read, Update, Delete',
        points: 20
      },
      {
        id: 'db-5',
        question: 'Which method is used to find documents in MongoDB?',
        type: 'multiple-choice',
        options: ['find()', 'select()', 'get()', 'query()'],
        correctAnswer: 'find()',
        points: 20
      }
    ]
  },

  // Full Stack MERN Tests
  'mern-setup': {
    id: 'mern-setup',
    title: 'MERN Stack Setup Test',
    description: 'Test your knowledge of MERN stack development environment',
    timeLimit: 20,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'mern-1',
        question: 'MERN stands for MongoDB, Express, React, and Node.js.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'mern-2',
        question: 'Which tool is commonly used to manage both frontend and backend in MERN?',
        type: 'multiple-choice',
        options: ['Webpack', 'Concurrently', 'Babel', 'ESLint'],
        correctAnswer: 'Concurrently',
        points: 20
      },
      {
        id: 'mern-3',
        question: 'The frontend and backend in MERN stack run on the same port.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'mern-4',
        question: 'What is the typical folder structure for a MERN application?',
        type: 'multiple-choice',
        options: ['client/ and server/', 'frontend/ and backend/', 'public/ and api/', 'All are valid approaches'],
        correctAnswer: 'All are valid approaches',
        points: 20
      },
      {
        id: 'mern-5',
        question: 'Which command is used to create a new React application?',
        type: 'multiple-choice',
        options: ['npm create react-app', 'npx create-react-app', 'npm init react-app', 'node create-react-app'],
        correctAnswer: 'npx create-react-app',
        points: 20
      }
    ]
  },

  'authentication': {
    id: 'authentication',
    title: 'User Authentication Test',
    description: 'Test your knowledge of JWT authentication and authorization',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'auth-1',
        question: 'JWT stands for JSON Web Token.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'auth-2',
        question: 'Which part of JWT contains the actual data?',
        type: 'multiple-choice',
        options: ['Header', 'Payload', 'Signature', 'All parts'],
        correctAnswer: 'Payload',
        points: 20
      },
      {
        id: 'auth-3',
        question: 'JWTs are stateless.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'auth-4',
        question: 'What is the purpose of the signature in a JWT?',
        type: 'multiple-choice',
        options: ['To encrypt the data', 'To verify the token integrity', 'To store user information', 'To set expiration time'],
        correctAnswer: 'To verify the token integrity',
        points: 20
      },
      {
        id: 'auth-5',
        question: 'Which HTTP header is typically used to send JWT tokens?',
        type: 'multiple-choice',
        options: ['Content-Type', 'Authorization', 'Authentication', 'Token'],
        correctAnswer: 'Authorization',
        points: 20
      }
    ]
  },

  // Data Science Tests
  'python-fundamentals': {
    id: 'python-fundamentals',
    title: 'Python for Data Science Test',
    description: 'Test your knowledge of Python programming for data science',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'python-1',
        question: 'Python is an interpreted language.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'python-2',
        question: 'Which data structure is ordered and mutable in Python?',
        type: 'multiple-choice',
        options: ['Tuple', 'List', 'Set', 'Dictionary'],
        correctAnswer: 'List',
        points: 20
      },
      {
        id: 'python-3',
        question: 'Python uses 0-based indexing.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'python-4',
        question: 'What is the output of len([1, 2, 3, 4])?',
        type: 'multiple-choice',
        options: ['3', '4', '5', 'Error'],
        correctAnswer: '4',
        points: 20
      },
      {
        id: 'python-5',
        question: 'Which library is NOT commonly used for data science in Python?',
        type: 'multiple-choice',
        options: ['NumPy', 'Pandas', 'Matplotlib', 'Django'],
        correctAnswer: 'Django',
        points: 20
      }
    ]
  },

  'pandas-numpy': {
    id: 'pandas-numpy',
    title: 'Data Manipulation Test',
    description: 'Test your knowledge of Pandas and NumPy for data analysis',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'pandas-1',
        question: 'Pandas is built on top of NumPy.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'pandas-2',
        question: 'What is the primary data structure in Pandas for 2D data?',
        type: 'multiple-choice',
        options: ['Series', 'DataFrame', 'Array', 'Matrix'],
        correctAnswer: 'DataFrame',
        points: 20
      },
      {
        id: 'numpy-1',
        question: 'NumPy arrays are more efficient than Python lists for numerical operations.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'pandas-3',
        question: 'Which method is used to read a CSV file in Pandas?',
        type: 'multiple-choice',
        options: ['read_csv()', 'load_csv()', 'import_csv()', 'get_csv()'],
        correctAnswer: 'read_csv()',
        points: 20
      },
      {
        id: 'numpy-2',
        question: 'What does the reshape() method do in NumPy?',
        type: 'multiple-choice',
        options: ['Changes array values', 'Changes array dimensions', 'Sorts the array', 'Filters the array'],
        correctAnswer: 'Changes array dimensions',
        points: 20
      }
    ]
  },

  // DevOps Tests
  'docker-basics': {
    id: 'docker-basics',
    title: 'Docker Containerization Test',
    description: 'Test your knowledge of Docker containerization',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'docker-1',
        question: 'Docker containers share the host OS kernel.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'docker-2',
        question: 'Which file is used to define a Docker image?',
        type: 'multiple-choice',
        options: ['docker.yml', 'Dockerfile', 'container.conf', 'image.json'],
        correctAnswer: 'Dockerfile',
        points: 20
      },
      {
        id: 'docker-3',
        question: 'Docker images are immutable.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'docker-4',
        question: 'What command is used to build a Docker image?',
        type: 'multiple-choice',
        options: ['docker create', 'docker build', 'docker make', 'docker compile'],
        correctAnswer: 'docker build',
        points: 20
      },
      {
        id: 'docker-5',
        question: 'Which command is used to run a Docker container?',
        type: 'multiple-choice',
        options: ['docker start', 'docker run', 'docker exec', 'docker launch'],
        correctAnswer: 'docker run',
        points: 20
      }
    ]
  },

  'kubernetes': {
    id: 'kubernetes',
    title: 'Kubernetes Orchestration Test',
    description: 'Test your knowledge of Kubernetes container orchestration',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'k8s-1',
        question: 'Kubernetes is a container orchestration platform.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'k8s-2',
        question: 'What is the smallest deployable unit in Kubernetes?',
        type: 'multiple-choice',
        options: ['Container', 'Pod', 'Node', 'Service'],
        correctAnswer: 'Pod',
        points: 20
      },
      {
        id: 'k8s-3',
        question: 'A Pod can contain multiple containers.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'k8s-4',
        question: 'What is kubectl?',
        type: 'multiple-choice',
        options: ['A container runtime', 'The Kubernetes command-line tool', 'A monitoring tool', 'A container registry'],
        correctAnswer: 'The Kubernetes command-line tool',
        points: 20
      },
      {
        id: 'k8s-5',
        question: 'Which component manages the Kubernetes cluster?',
        type: 'multiple-choice',
        options: ['Master Node', 'Worker Node', 'Pod', 'Service'],
        correctAnswer: 'Master Node',
        points: 20
      }
    ]
  }
};