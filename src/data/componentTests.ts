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
  },

  // Mobile Flutter Development Tests
  'dart-fundamentals': {
    id: 'dart-fundamentals',
    title: 'Dart Programming Fundamentals Test',
    description: 'Test your knowledge of Dart language basics and syntax for Flutter development',
    timeLimit: 20,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'dart-1',
        question: 'Which of the following is the correct way to declare a variable in Dart?',
        type: 'multiple-choice',
        options: ['var name = "John";', 'String name = "John";', 'dynamic name = "John";', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      },
      {
        id: 'dart-2',
        question: 'Dart supports both just-in-time (JIT) and ahead-of-time (AOT) compilation.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'dart-3',
        question: 'What is the entry point function for a Dart application?',
        type: 'multiple-choice',
        options: ['start()', 'main()', 'init()', 'run()'],
        correctAnswer: 'main()',
        points: 20
      },
      {
        id: 'dart-4',
        question: 'In Dart, the "final" keyword creates a compile-time constant.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'dart-5',
        question: 'Which collection type in Dart maintains insertion order and allows duplicates?',
        type: 'multiple-choice',
        options: ['Set', 'List', 'Map', 'Queue'],
        correctAnswer: 'List',
        points: 20
      }
    ]
  },

  'flutter-setup': {
    id: 'flutter-setup',
    title: 'Flutter Development Environment Test',
    description: 'Test your knowledge of Flutter setup and development environment',
    timeLimit: 15,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'flutter-1',
        question: 'Which command is used to create a new Flutter project?',
        type: 'multiple-choice',
        options: ['flutter new', 'flutter create', 'flutter init', 'flutter start'],
        correctAnswer: 'flutter create',
        points: 20
      },
      {
        id: 'flutter-2',
        question: 'Flutter uses Dart as its programming language.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'flutter-3',
        question: 'What is the purpose of pubspec.yaml in Flutter?',
        type: 'multiple-choice',
        options: ['Manage dependencies', 'Configure app metadata', 'Define assets', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      },
      {
        id: 'flutter-4',
        question: 'Hot reload allows you to see changes instantly without restarting the app.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'flutter-5',
        question: 'Which file contains the main entry point for a Flutter app?',
        type: 'multiple-choice',
        options: ['main.dart', 'app.dart', 'index.dart', 'flutter.dart'],
        correctAnswer: 'main.dart',
        points: 20
      }
    ]
  },

  'flutter-widgets': {
    id: 'flutter-widgets',
    title: 'Flutter Widgets and UI Test',
    description: 'Test your knowledge of Flutter widgets and UI components',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'widget-1',
        question: 'What are the two main types of widgets in Flutter?',
        type: 'multiple-choice',
        options: ['StatefulWidget and StatelessWidget', 'MaterialWidget and CupertinoWidget', 'LayoutWidget and DisplayWidget', 'ContainerWidget and TextWidget'],
        correctAnswer: 'StatefulWidget and StatelessWidget',
        points: 20
      },
      {
        id: 'widget-2',
        question: 'A StatelessWidget can change its appearance during runtime.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'widget-3',
        question: 'Which widget is used to create a scrollable list in Flutter?',
        type: 'multiple-choice',
        options: ['ListView', 'ScrollView', 'ListContainer', 'ScrollList'],
        correctAnswer: 'ListView',
        points: 20
      },
      {
        id: 'widget-4',
        question: 'Material Design widgets start with the prefix "Material".',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'widget-5',
        question: 'What method must be implemented in a StatelessWidget?',
        type: 'multiple-choice',
        options: ['build()', 'render()', 'display()', 'show()'],
        correctAnswer: 'build()',
        points: 20
      }
    ]
  },

  'flutter-state-management': {
    id: 'flutter-state-management',
    title: 'Flutter State Management Test',
    description: 'Test your knowledge of state management in Flutter applications',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'state-1',
        question: 'Which method is used to update the state in a StatefulWidget?',
        type: 'multiple-choice',
        options: ['setState()', 'updateState()', 'refreshState()', 'changeState()'],
        correctAnswer: 'setState()',
        points: 20
      },
      {
        id: 'state-2',
        question: 'Provider is a popular state management solution for Flutter.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'state-3',
        question: 'What is the purpose of InheritedWidget in Flutter?',
        type: 'multiple-choice',
        options: ['Share data down the widget tree', 'Handle user input', 'Manage animations', 'Control navigation'],
        correctAnswer: 'Share data down the widget tree',
        points: 20
      },
      {
        id: 'state-4',
        question: 'BLoC pattern stands for Business Logic Component.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'state-5',
        question: 'Which of these is NOT a state management solution for Flutter?',
        type: 'multiple-choice',
        options: ['Provider', 'BLoC', 'Riverpod', 'Redux.js'],
        correctAnswer: 'Redux.js',
        points: 20
      }
    ]
  },

  'flutter-deployment': {
    id: 'flutter-deployment',
    title: 'Flutter App Deployment Test',
    description: 'Test your knowledge of building and deploying Flutter applications',
    timeLimit: 20,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'deploy-1',
        question: 'Which command builds a Flutter app for Android release?',
        type: 'multiple-choice',
        options: ['flutter build apk', 'flutter build android', 'flutter compile apk', 'flutter release android'],
        correctAnswer: 'flutter build apk',
        points: 20
      },
      {
        id: 'deploy-2',
        question: 'Flutter apps can be deployed to both iOS and Android from a single codebase.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'deploy-3',
        question: 'What file format is used for iOS app distribution?',
        type: 'multiple-choice',
        options: ['.ipa', '.apk', '.exe', '.dmg'],
        correctAnswer: '.ipa',
        points: 20
      },
      {
        id: 'deploy-4',
        question: 'Code signing is required for iOS app deployment.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'deploy-5',
        question: 'Which store is used to distribute Android apps?',
        type: 'multiple-choice',
        options: ['Google Play Store', 'App Store', 'Microsoft Store', 'Amazon Appstore'],
        correctAnswer: 'Google Play Store',
        points: 20
      }
    ]
  },

  // Cybersecurity & Ethical Hacking Tests
  'security-fundamentals': {
    id: 'security-fundamentals',
    title: 'Cybersecurity Fundamentals Test',
    description: 'Test your knowledge of basic cybersecurity principles and concepts',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'sec-1',
        question: 'What does CIA stand for in cybersecurity?',
        type: 'multiple-choice',
        options: ['Confidentiality, Integrity, Availability', 'Central Intelligence Agency', 'Computer Internet Access', 'Cybersecurity Information Analysis'],
        correctAnswer: 'Confidentiality, Integrity, Availability',
        points: 20
      },
      {
        id: 'sec-2',
        question: 'A firewall can protect against all types of cyber attacks.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'sec-3',
        question: 'Which of the following is a strong password practice?',
        type: 'multiple-choice',
        options: ['Using personal information', 'Using the same password everywhere', 'Using a mix of letters, numbers, and symbols', 'Using dictionary words'],
        correctAnswer: 'Using a mix of letters, numbers, and symbols',
        points: 20
      },
      {
        id: 'sec-4',
        question: 'Multi-factor authentication adds an extra layer of security.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'sec-5',
        question: 'What is social engineering in cybersecurity?',
        type: 'multiple-choice',
        options: ['A technical attack method', 'Manipulating people to reveal information', 'A type of software', 'A network protocol'],
        correctAnswer: 'Manipulating people to reveal information',
        points: 20
      }
    ]
  },

  'network-security': {
    id: 'network-security',
    title: 'Network Security Test',
    description: 'Test your knowledge of network security protocols and practices',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'net-1',
        question: 'What does VPN stand for?',
        type: 'multiple-choice',
        options: ['Virtual Private Network', 'Very Private Network', 'Virtual Public Network', 'Verified Private Network'],
        correctAnswer: 'Virtual Private Network',
        points: 20
      },
      {
        id: 'net-2',
        question: 'HTTPS provides encryption for web communications.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'net-3',
        question: 'Which port is commonly used for HTTPS traffic?',
        type: 'multiple-choice',
        options: ['80', '443', '21', '22'],
        correctAnswer: '443',
        points: 20
      },
      {
        id: 'net-4',
        question: 'A DMZ (Demilitarized Zone) is a network security concept.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'net-5',
        question: 'What is the purpose of an Intrusion Detection System (IDS)?',
        type: 'multiple-choice',
        options: ['Prevent all attacks', 'Monitor and detect suspicious activity', 'Encrypt network traffic', 'Manage user passwords'],
        correctAnswer: 'Monitor and detect suspicious activity',
        points: 20
      }
    ]
  },

  'penetration-testing': {
    id: 'penetration-testing',
    title: 'Penetration Testing Test',
    description: 'Test your knowledge of penetration testing methodologies and tools',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'pen-1',
        question: 'What is the first phase of penetration testing?',
        type: 'multiple-choice',
        options: ['Exploitation', 'Reconnaissance', 'Post-exploitation', 'Reporting'],
        correctAnswer: 'Reconnaissance',
        points: 20
      },
      {
        id: 'pen-2',
        question: 'Kali Linux is a popular distribution for penetration testing.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'pen-3',
        question: 'Which tool is commonly used for network scanning?',
        type: 'multiple-choice',
        options: ['Nmap', 'Photoshop', 'Excel', 'PowerPoint'],
        correctAnswer: 'Nmap',
        points: 20
      },
      {
        id: 'pen-4',
        question: 'A penetration test should always be performed with proper authorization.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'pen-5',
        question: 'What does the OWASP Top 10 list contain?',
        type: 'multiple-choice',
        options: ['Top programming languages', 'Most common web application vulnerabilities', 'Best security tools', 'Fastest computers'],
        correctAnswer: 'Most common web application vulnerabilities',
        points: 20
      }
    ]
  },

  'web-app-security': {
    id: 'web-app-security',
    title: 'Web Application Security Test',
    description: 'Test your knowledge of web application vulnerabilities and security measures',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'web-1',
        question: 'What does XSS stand for?',
        type: 'multiple-choice',
        options: ['Cross-Site Scripting', 'eXtra Secure System', 'eXternal Security Service', 'Cross-System Security'],
        correctAnswer: 'Cross-Site Scripting',
        points: 20
      },
      {
        id: 'web-2',
        question: 'SQL injection attacks target database queries.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'web-3',
        question: 'Which HTTP header helps prevent XSS attacks?',
        type: 'multiple-choice',
        options: ['Content-Type', 'Content-Security-Policy', 'Accept-Language', 'User-Agent'],
        correctAnswer: 'Content-Security-Policy',
        points: 20
      },
      {
        id: 'web-4',
        question: 'CSRF stands for Cross-Site Request Forgery.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'web-5',
        question: 'What is the best practice for storing passwords?',
        type: 'multiple-choice',
        options: ['Store in plain text', 'Use simple encryption', 'Hash with salt', 'Encode in Base64'],
        correctAnswer: 'Hash with salt',
        points: 20
      }
    ]
  },

  'incident-response': {
    id: 'incident-response',
    title: 'Incident Response Test',
    description: 'Test your knowledge of cybersecurity incident response procedures',
    timeLimit: 20,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'ir-1',
        question: 'What is the first step in incident response?',
        type: 'multiple-choice',
        options: ['Eradication', 'Identification', 'Recovery', 'Lessons learned'],
        correctAnswer: 'Identification',
        points: 20
      },
      {
        id: 'ir-2',
        question: 'An incident response plan should be tested regularly.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ir-3',
        question: 'What does SIEM stand for?',
        type: 'multiple-choice',
        options: ['Security Information and Event Management', 'System Integration and Error Monitoring', 'Secure Internet Email Management', 'Software Installation and Environment Management'],
        correctAnswer: 'Security Information and Event Management',
        points: 20
      },
      {
        id: 'ir-4',
        question: 'Digital forensics is part of incident response.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ir-5',
        question: 'What should be preserved during an incident?',
        type: 'multiple-choice',
        options: ['Evidence', 'Network performance', 'User productivity', 'System aesthetics'],
        correctAnswer: 'Evidence',
        points: 20
      }
    ]
  },

  // Blockchain & Web3 Development Tests
  'blockchain-basics': {
    id: 'blockchain-basics',
    title: 'Blockchain Fundamentals Test',
    description: 'Test your knowledge of blockchain technology and cryptocurrency basics',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'blockchain-1',
        question: 'What is a blockchain?',
        type: 'multiple-choice',
        options: ['A distributed ledger', 'A type of database', 'A chain of blocks containing data', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      },
      {
        id: 'blockchain-2',
        question: 'Bitcoin was the first successful implementation of blockchain technology.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'blockchain-3',
        question: 'What is a hash function in blockchain?',
        type: 'multiple-choice',
        options: ['A mathematical function that converts input to fixed-size output', 'A way to store data', 'A consensus mechanism', 'A type of cryptocurrency'],
        correctAnswer: 'A mathematical function that converts input to fixed-size output',
        points: 20
      },
      {
        id: 'blockchain-4',
        question: 'Blockchain networks are always public and permissionless.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'blockchain-5',
        question: 'What is the purpose of mining in blockchain?',
        type: 'multiple-choice',
        options: ['To create new coins', 'To validate transactions', 'To secure the network', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      }
    ]
  },

  'ethereum-solidity': {
    id: 'ethereum-solidity',
    title: 'Ethereum & Solidity Test',
    description: 'Test your knowledge of Ethereum platform and Solidity programming',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'eth-1',
        question: 'What is Ethereum?',
        type: 'multiple-choice',
        options: ['A cryptocurrency', 'A blockchain platform for smart contracts', 'A mining algorithm', 'A wallet application'],
        correctAnswer: 'A blockchain platform for smart contracts',
        points: 20
      },
      {
        id: 'eth-2',
        question: 'Solidity is the primary programming language for Ethereum smart contracts.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'eth-3',
        question: 'What is Gas in Ethereum?',
        type: 'multiple-choice',
        options: ['A type of fuel', 'A unit to measure computational effort', 'A cryptocurrency', 'A consensus mechanism'],
        correctAnswer: 'A unit to measure computational effort',
        points: 20
      },
      {
        id: 'eth-4',
        question: 'Smart contracts are immutable once deployed on Ethereum.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'eth-5',
        question: 'What is the Ethereum Virtual Machine (EVM)?',
        type: 'multiple-choice',
        options: ['A physical computer', 'A runtime environment for smart contracts', 'A mining software', 'A wallet interface'],
        correctAnswer: 'A runtime environment for smart contracts',
        points: 20
      }
    ]
  },

  'web3-dapps': {
    id: 'web3-dapps',
    title: 'Web3 DApps Development Test',
    description: 'Test your knowledge of building decentralized applications',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'dapp-1',
        question: 'What does DApp stand for?',
        type: 'multiple-choice',
        options: ['Distributed Application', 'Decentralized Application', 'Digital Application', 'Data Application'],
        correctAnswer: 'Decentralized Application',
        points: 20
      },
      {
        id: 'dapp-2',
        question: 'Web3.js is a popular library for interacting with Ethereum.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'dapp-3',
        question: 'What is MetaMask?',
        type: 'multiple-choice',
        options: ['A blockchain', 'A browser wallet extension', 'A programming language', 'A consensus algorithm'],
        correctAnswer: 'A browser wallet extension',
        points: 20
      },
      {
        id: 'dapp-4',
        question: 'DApps require a traditional backend server to function.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'dapp-5',
        question: 'What is IPFS commonly used for in DApps?',
        type: 'multiple-choice',
        options: ['Storing smart contracts', 'Decentralized file storage', 'Processing transactions', 'Mining cryptocurrencies'],
        correctAnswer: 'Decentralized file storage',
        points: 20
      }
    ]
  },

  'defi-protocols': {
    id: 'defi-protocols',
    title: 'DeFi Protocols Test',
    description: 'Test your knowledge of Decentralized Finance protocols and concepts',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'defi-1',
        question: 'What does DeFi stand for?',
        type: 'multiple-choice',
        options: ['Decentralized Finance', 'Digital Finance', 'Distributed Finance', 'Defined Finance'],
        correctAnswer: 'Decentralized Finance',
        points: 20
      },
      {
        id: 'defi-2',
        question: 'Liquidity pools are a key component of many DeFi protocols.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'defi-3',
        question: 'What is yield farming in DeFi?',
        type: 'multiple-choice',
        options: ['Growing crops', 'Earning rewards by providing liquidity', 'Mining cryptocurrencies', 'Trading NFTs'],
        correctAnswer: 'Earning rewards by providing liquidity',
        points: 20
      },
      {
        id: 'defi-4',
        question: 'Automated Market Makers (AMMs) replace traditional order books.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'defi-5',
        question: 'What is a stablecoin?',
        type: 'multiple-choice',
        options: ['A volatile cryptocurrency', 'A cryptocurrency pegged to stable assets', 'A type of NFT', 'A consensus mechanism'],
        correctAnswer: 'A cryptocurrency pegged to stable assets',
        points: 20
      }
    ]
  },

  'nft-marketplace': {
    id: 'nft-marketplace',
    title: 'NFT Marketplace Development Test',
    description: 'Test your knowledge of Non-Fungible Tokens and marketplace development',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'nft-1',
        question: 'What does NFT stand for?',
        type: 'multiple-choice',
        options: ['Non-Fungible Token', 'New Financial Technology', 'Network File Transfer', 'Non-Functional Test'],
        correctAnswer: 'Non-Fungible Token',
        points: 20
      },
      {
        id: 'nft-2',
        question: 'NFTs are unique and cannot be replicated.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'nft-3',
        question: 'Which ERC standard is commonly used for NFTs?',
        type: 'multiple-choice',
        options: ['ERC-20', 'ERC-721', 'ERC-1155', 'Both ERC-721 and ERC-1155'],
        correctAnswer: 'Both ERC-721 and ERC-1155',
        points: 20
      },
      {
        id: 'nft-4',
        question: 'OpenSea is a popular NFT marketplace.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'nft-5',
        question: 'What is minting in the context of NFTs?',
        type: 'multiple-choice',
        options: ['Selling an NFT', 'Creating a new NFT', 'Transferring an NFT', 'Destroying an NFT'],
        correctAnswer: 'Creating a new NFT',
        points: 20
      }
    ]
  },

  // AI/ML Engineering Tests
  'python-data-science': {
    id: 'python-data-science',
    title: 'Python for Data Science Test',
    description: 'Test your knowledge of Python libraries and tools for data science',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'py-ds-1',
        question: 'Which library is most commonly used for data manipulation in Python?',
        type: 'multiple-choice',
        options: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'],
        correctAnswer: 'Pandas',
        points: 20
      },
      {
        id: 'py-ds-2',
        question: 'NumPy is primarily used for numerical computing in Python.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'py-ds-3',
        question: 'What is a DataFrame in Pandas?',
        type: 'multiple-choice',
        options: ['A 2D labeled data structure', 'A machine learning model', 'A plotting function', 'A database connection'],
        correctAnswer: 'A 2D labeled data structure',
        points: 20
      },
      {
        id: 'py-ds-4',
        question: 'Matplotlib is used for data visualization in Python.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'py-ds-5',
        question: 'Which method is used to read CSV files in Pandas?',
        type: 'multiple-choice',
        options: ['read_csv()', 'load_csv()', 'import_csv()', 'open_csv()'],
        correctAnswer: 'read_csv()',
        points: 20
      }
    ]
  },

  'machine-learning-basics': {
    id: 'machine-learning-basics',
    title: 'Machine Learning Fundamentals Test',
    description: 'Test your knowledge of machine learning concepts and algorithms',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'ml-1',
        question: 'What are the three main types of machine learning?',
        type: 'multiple-choice',
        options: ['Supervised, Unsupervised, Reinforcement', 'Linear, Non-linear, Deep', 'Classification, Regression, Clustering', 'Training, Testing, Validation'],
        correctAnswer: 'Supervised, Unsupervised, Reinforcement',
        points: 20
      },
      {
        id: 'ml-2',
        question: 'In supervised learning, the algorithm learns from labeled data.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ml-3',
        question: 'What is overfitting in machine learning?',
        type: 'multiple-choice',
        options: ['Model performs well on training data but poorly on test data', 'Model performs poorly on all data', 'Model is too simple', 'Model trains too slowly'],
        correctAnswer: 'Model performs well on training data but poorly on test data',
        points: 20
      },
      {
        id: 'ml-4',
        question: 'Cross-validation helps assess model performance.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ml-5',
        question: 'Which algorithm is commonly used for classification tasks?',
        type: 'multiple-choice',
        options: ['Linear Regression', 'Random Forest', 'K-means', 'PCA'],
        correctAnswer: 'Random Forest',
        points: 20
      }
    ]
  },

  'deep-learning': {
    id: 'deep-learning',
    title: 'Deep Learning Test',
    description: 'Test your knowledge of neural networks and deep learning frameworks',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'dl-1',
        question: 'What is a neural network?',
        type: 'multiple-choice',
        options: ['A network of computers', 'A mathematical model inspired by biological neurons', 'A type of database', 'A programming language'],
        correctAnswer: 'A mathematical model inspired by biological neurons',
        points: 20
      },
      {
        id: 'dl-2',
        question: 'TensorFlow and PyTorch are popular deep learning frameworks.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'dl-3',
        question: 'What is backpropagation?',
        type: 'multiple-choice',
        options: ['A way to propagate errors backward through the network', 'A type of activation function', 'A regularization technique', 'A data preprocessing method'],
        correctAnswer: 'A way to propagate errors backward through the network',
        points: 20
      },
      {
        id: 'dl-4',
        question: 'Convolutional Neural Networks (CNNs) are primarily used for image processing.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'dl-5',
        question: 'What is the purpose of an activation function?',
        type: 'multiple-choice',
        options: ['To introduce non-linearity', 'To reduce overfitting', 'To normalize data', 'To increase training speed'],
        correctAnswer: 'To introduce non-linearity',
        points: 20
      }
    ]
  },

  'computer-vision': {
    id: 'computer-vision',
    title: 'Computer Vision Test',
    description: 'Test your knowledge of computer vision techniques and applications',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'cv-1',
        question: 'What is computer vision?',
        type: 'multiple-choice',
        options: ['The ability of computers to see', 'A field that enables computers to interpret visual information', 'A type of monitor', 'A programming technique'],
        correctAnswer: 'A field that enables computers to interpret visual information',
        points: 20
      },
      {
        id: 'cv-2',
        question: 'OpenCV is a popular computer vision library.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'cv-3',
        question: 'What is image segmentation?',
        type: 'multiple-choice',
        options: ['Dividing an image into meaningful parts', 'Compressing an image', 'Enhancing image quality', 'Converting image formats'],
        correctAnswer: 'Dividing an image into meaningful parts',
        points: 20
      },
      {
        id: 'cv-4',
        question: 'YOLO (You Only Look Once) is an object detection algorithm.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'cv-5',
        question: 'What is the purpose of edge detection in computer vision?',
        type: 'multiple-choice',
        options: ['To find boundaries between objects', 'To change image colors', 'To resize images', 'To rotate images'],
        correctAnswer: 'To find boundaries between objects',
        points: 20
      }
    ]
  },

  'mlops-production': {
    id: 'mlops-production',
    title: 'MLOps & Production Test',
    description: 'Test your knowledge of deploying and managing ML models in production',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'mlops-1',
        question: 'What does MLOps stand for?',
        type: 'multiple-choice',
        options: ['Machine Learning Operations', 'Model Learning Optimization', 'Multi-Layer Operations', 'Machine Logic Operations'],
        correctAnswer: 'Machine Learning Operations',
        points: 20
      },
      {
        id: 'mlops-2',
        question: 'MLOps combines machine learning, DevOps, and data engineering.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'mlops-3',
        question: 'What is model drift?',
        type: 'multiple-choice',
        options: ['When model performance degrades over time', 'When model trains too slowly', 'When model is too complex', 'When model uses too much memory'],
        correctAnswer: 'When model performance degrades over time',
        points: 20
      },
      {
        id: 'mlops-4',
        question: 'Docker containers are commonly used for ML model deployment.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'mlops-5',
        question: 'What is A/B testing in ML context?',
        type: 'multiple-choice',
        options: ['Testing two different models against each other', 'Testing model accuracy', 'Testing data quality', 'Testing training speed'],
        correctAnswer: 'Testing two different models against each other',
        points: 20
      }
    ]
  },

  // Game Development Unity Tests
  'csharp-programming': {
    id: 'csharp-programming',
    title: 'C# Programming Fundamentals Test',
    description: 'Test your knowledge of C# programming language basics',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'cs-1',
        question: 'Which of the following is the correct way to declare a variable in C#?',
        type: 'multiple-choice',
        options: ['int number = 10;', 'var number = 10;', 'int number; number = 10;', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      },
      {
        id: 'cs-2',
        question: 'C# is an object-oriented programming language.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'cs-3',
        question: 'What is the entry point of a C# application?',
        type: 'multiple-choice',
        options: ['Main() method', 'Start() method', 'Begin() method', 'Run() method'],
        correctAnswer: 'Main() method',
        points: 20
      },
      {
        id: 'cs-4',
        question: 'C# supports automatic memory management through garbage collection.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'cs-5',
        question: 'Which access modifier makes a member accessible only within the same class?',
        type: 'multiple-choice',
        options: ['public', 'private', 'protected', 'internal'],
        correctAnswer: 'private',
        points: 20
      }
    ]
  },

  'unity-basics': {
    id: 'unity-basics',
    title: 'Unity Engine Basics Test',
    description: 'Test your knowledge of Unity game engine fundamentals',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'unity-1',
        question: 'What is Unity?',
        type: 'multiple-choice',
        options: ['A programming language', 'A game development engine', 'A graphics card', 'An operating system'],
        correctAnswer: 'A game development engine',
        points: 20
      },
      {
        id: 'unity-2',
        question: 'Unity supports both 2D and 3D game development.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'unity-3',
        question: 'What is a GameObject in Unity?',
        type: 'multiple-choice',
        options: ['A base class for all entities in Unity scenes', 'A type of script', 'A rendering component', 'A physics system'],
        correctAnswer: 'A base class for all entities in Unity scenes',
        points: 20
      },
      {
        id: 'unity-4',
        question: 'MonoBehaviour is the base class for Unity scripts.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'unity-5',
        question: 'Which method is called once when a GameObject is first created?',
        type: 'multiple-choice',
        options: ['Start()', 'Update()', 'Awake()', 'FixedUpdate()'],
        correctAnswer: 'Awake()',
        points: 20
      }
    ]
  },

  'game-physics': {
    id: 'game-physics',
    title: 'Game Physics Test',
    description: 'Test your knowledge of physics systems in Unity game development',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'physics-1',
        question: 'What component is required for an object to have physics in Unity?',
        type: 'multiple-choice',
        options: ['Transform', 'Rigidbody', 'Collider', 'Renderer'],
        correctAnswer: 'Rigidbody',
        points: 20
      },
      {
        id: 'physics-2',
        question: 'Unity uses the PhysX physics engine.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'physics-3',
        question: 'What is the purpose of a Collider in Unity?',
        type: 'multiple-choice',
        options: ['To render objects', 'To detect collisions', 'To apply forces', 'To control animation'],
        correctAnswer: 'To detect collisions',
        points: 20
      },
      {
        id: 'physics-4',
        question: 'Kinematic Rigidbodies are affected by forces and collisions.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'physics-5',
        question: 'Which method is best for moving a Rigidbody?',
        type: 'multiple-choice',
        options: ['transform.position', 'rigidbody.AddForce()', 'rigidbody.MovePosition()', 'Both AddForce and MovePosition'],
        correctAnswer: 'Both AddForce and MovePosition',
        points: 20
      }
    ]
  },

  'animation-ui': {
    id: 'animation-ui',
    title: 'Animation & UI Systems Test',
    description: 'Test your knowledge of Unity animation and user interface systems',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'anim-1',
        question: 'What is the Animation Controller in Unity?',
        type: 'multiple-choice',
        options: ['A script that controls animations', 'A state machine for managing animation transitions', 'A component that plays sounds', 'A physics simulation tool'],
        correctAnswer: 'A state machine for managing animation transitions',
        points: 20
      },
      {
        id: 'anim-2',
        question: 'Unity\'s UI system is called Canvas.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'anim-3',
        question: 'What is a keyframe in animation?',
        type: 'multiple-choice',
        options: ['A frame that defines specific values at a point in time', 'A type of animation clip', 'A UI component', 'A physics constraint'],
        correctAnswer: 'A frame that defines specific values at a point in time',
        points: 20
      },
      {
        id: 'anim-4',
        question: 'UI elements in Unity must be children of a Canvas.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'anim-5',
        question: 'Which component is used to display text in Unity UI?',
        type: 'multiple-choice',
        options: ['Text', 'Label', 'TextMesh', 'TextMeshPro'],
        correctAnswer: 'TextMeshPro',
        points: 20
      }
    ]
  },

  'game-publishing': {
    id: 'game-publishing',
    title: 'Game Publishing Test',
    description: 'Test your knowledge of building and publishing games from Unity',
    timeLimit: 20,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'pub-1',
        question: 'Which platforms can Unity build games for?',
        type: 'multiple-choice',
        options: ['PC only', 'Mobile only', 'Console only', 'Multiple platforms including PC, mobile, console, and web'],
        correctAnswer: 'Multiple platforms including PC, mobile, console, and web',
        points: 20
      },
      {
        id: 'pub-2',
        question: 'Unity can export games to WebGL for browser play.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'pub-3',
        question: 'What is the first step in publishing a Unity game?',
        type: 'multiple-choice',
        options: ['Upload to store', 'Build the game', 'Create marketing materials', 'Set up analytics'],
        correctAnswer: 'Build the game',
        points: 20
      },
      {
        id: 'pub-4',
        question: 'You need different Unity licenses for different platforms.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'pub-5',
        question: 'What should you optimize before publishing a mobile game?',
        type: 'multiple-choice',
        options: ['Graphics quality', 'Performance and file size', 'Sound quality', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      }
    ]
  },

  // Cloud Architecture Tests
  'cloud-fundamentals': {
    id: 'cloud-fundamentals',
    title: 'Cloud Computing Fundamentals Test',
    description: 'Test your knowledge of cloud computing basics and service models',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'cloud-1',
        question: 'What are the three main cloud service models?',
        type: 'multiple-choice',
        options: ['IaaS, PaaS, SaaS', 'Public, Private, Hybrid', 'Storage, Compute, Network', 'Development, Testing, Production'],
        correctAnswer: 'IaaS, PaaS, SaaS',
        points: 20
      },
      {
        id: 'cloud-2',
        question: 'Cloud computing allows you to rent computing resources instead of owning them.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'cloud-3',
        question: 'What does IaaS stand for?',
        type: 'multiple-choice',
        options: ['Internet as a Service', 'Infrastructure as a Service', 'Integration as a Service', 'Information as a Service'],
        correctAnswer: 'Infrastructure as a Service',
        points: 20
      },
      {
        id: 'cloud-4',
        question: 'Scalability is one of the main benefits of cloud computing.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'cloud-5',
        question: 'Which of these is a cloud deployment model?',
        type: 'multiple-choice',
        options: ['Public cloud', 'Private cloud', 'Hybrid cloud', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      }
    ]
  },

  'aws-services': {
    id: 'aws-services',
    title: 'AWS Services Test',
    description: 'Test your knowledge of Amazon Web Services and core cloud services',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'aws-1',
        question: 'What is Amazon EC2?',
        type: 'multiple-choice',
        options: ['A storage service', 'A compute service providing virtual servers', 'A database service', 'A networking service'],
        correctAnswer: 'A compute service providing virtual servers',
        points: 20
      },
      {
        id: 'aws-2',
        question: 'S3 stands for Simple Storage Service.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'aws-3',
        question: 'What is Amazon RDS?',
        type: 'multiple-choice',
        options: ['A relational database service', 'A content delivery network', 'A load balancer', 'A monitoring service'],
        correctAnswer: 'A relational database service',
        points: 20
      },
      {
        id: 'aws-4',
        question: 'AWS Lambda allows you to run code without managing servers.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'aws-5',
        question: 'What is the purpose of Amazon CloudFront?',
        type: 'multiple-choice',
        options: ['Database management', 'Content delivery network (CDN)', 'Server monitoring', 'User authentication'],
        correctAnswer: 'Content delivery network (CDN)',
        points: 20
      }
    ]
  },

  'microservices-architecture': {
    id: 'microservices-architecture',
    title: 'Microservices Architecture Test',
    description: 'Test your knowledge of microservices design patterns and implementation',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'micro-1',
        question: 'What is a microservice?',
        type: 'multiple-choice',
        options: ['A small application', 'A loosely coupled service that implements business capability', 'A type of database', 'A monitoring tool'],
        correctAnswer: 'A loosely coupled service that implements business capability',
        points: 20
      },
      {
        id: 'micro-2',
        question: 'Microservices can be developed and deployed independently.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'micro-3',
        question: 'What is API Gateway in microservices architecture?',
        type: 'multiple-choice',
        options: ['A single entry point for all client requests', 'A database connector', 'A monitoring system', 'A deployment tool'],
        correctAnswer: 'A single entry point for all client requests',
        points: 20
      },
      {
        id: 'micro-4',
        question: 'Each microservice should have its own database.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'micro-5',
        question: 'What is service discovery in microservices?',
        type: 'multiple-choice',
        options: ['Finding bugs in services', 'Automatically locating services on the network', 'Creating new services', 'Monitoring service performance'],
        correctAnswer: 'Automatically locating services on the network',
        points: 20
      }
    ]
  },

  'infrastructure-as-code': {
    id: 'infrastructure-as-code',
    title: 'Infrastructure as Code Test',
    description: 'Test your knowledge of IaC tools and practices',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'iac-1',
        question: 'What is Infrastructure as Code (IaC)?',
        type: 'multiple-choice',
        options: ['Writing code for applications', 'Managing infrastructure through code and automation', 'A programming language', 'A cloud service'],
        correctAnswer: 'Managing infrastructure through code and automation',
        points: 20
      },
      {
        id: 'iac-2',
        question: 'Terraform is a popular Infrastructure as Code tool.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'iac-3',
        question: 'What is the main benefit of Infrastructure as Code?',
        type: 'multiple-choice',
        options: ['Faster deployment', 'Consistency and reproducibility', 'Version control for infrastructure', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      },
      {
        id: 'iac-4',
        question: 'CloudFormation is AWS\'s native IaC service.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'iac-5',
        question: 'What format does Terraform use for configuration files?',
        type: 'multiple-choice',
        options: ['JSON', 'YAML', 'HCL (HashiCorp Configuration Language)', 'XML'],
        correctAnswer: 'HCL (HashiCorp Configuration Language)',
        points: 20
      }
    ]
  },

  'monitoring-observability': {
    id: 'monitoring-observability',
    title: 'Monitoring & Observability Test',
    description: 'Test your knowledge of cloud monitoring and observability practices',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'mon-1',
        question: 'What are the three pillars of observability?',
        type: 'multiple-choice',
        options: ['Metrics, Logs, Traces', 'CPU, Memory, Network', 'Development, Testing, Production', 'Frontend, Backend, Database'],
        correctAnswer: 'Metrics, Logs, Traces',
        points: 20
      },
      {
        id: 'mon-2',
        question: 'Monitoring is reactive while observability is proactive.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'mon-3',
        question: 'What is a metric in monitoring?',
        type: 'multiple-choice',
        options: ['A quantitative measurement over time', 'A log message', 'An error trace', 'A configuration file'],
        correctAnswer: 'A quantitative measurement over time',
        points: 20
      },
      {
        id: 'mon-4',
        question: 'Prometheus is a popular open-source monitoring system.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'mon-5',
        question: 'What is distributed tracing?',
        type: 'multiple-choice',
        options: ['Tracking requests across multiple services', 'Distributing logs across servers', 'Spreading metrics collection', 'Sharing monitoring dashboards'],
        correctAnswer: 'Tracking requests across multiple services',
        points: 20
      }
    ]
  },

  // Product Management Tests
  'product-strategy': {
    id: 'product-strategy',
    title: 'Product Strategy Test',
    description: 'Test your knowledge of product strategy and vision development',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'ps-1',
        question: 'What is a product vision?',
        type: 'multiple-choice',
        options: ['A detailed feature list', 'A long-term aspirational statement about the product', 'A marketing campaign', 'A technical specification'],
        correctAnswer: 'A long-term aspirational statement about the product',
        points: 20
      },
      {
        id: 'ps-2',
        question: 'Product-market fit means having a product that satisfies market demand.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ps-3',
        question: 'What is the purpose of a product roadmap?',
        type: 'multiple-choice',
        options: ['To show detailed technical implementation', 'To communicate strategy and timeline', 'To track bugs', 'To manage team schedules'],
        correctAnswer: 'To communicate strategy and timeline',
        points: 20
      },
      {
        id: 'ps-4',
        question: 'OKRs (Objectives and Key Results) are commonly used in product management.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ps-5',
        question: 'What is a Minimum Viable Product (MVP)?',
        type: 'multiple-choice',
        options: ['The cheapest product possible', 'A product with minimum features to validate learning', 'A prototype', 'The final product version'],
        correctAnswer: 'A product with minimum features to validate learning',
        points: 20
      }
    ]
  },

  'user-research': {
    id: 'user-research',
    title: 'User Research Test',
    description: 'Test your knowledge of user research methods and customer discovery',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'ur-1',
        question: 'What is the primary goal of user research?',
        type: 'multiple-choice',
        options: ['To prove your assumptions', 'To understand user needs and behaviors', 'To increase sales', 'To reduce development costs'],
        correctAnswer: 'To understand user needs and behaviors',
        points: 20
      },
      {
        id: 'ur-2',
        question: 'Qualitative research focuses on understanding the "why" behind user behavior.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ur-3',
        question: 'Which of these is a qualitative research method?',
        type: 'multiple-choice',
        options: ['A/B testing', 'User interviews', 'Analytics data', 'Conversion rates'],
        correctAnswer: 'User interviews',
        points: 20
      },
      {
        id: 'ur-4',
        question: 'User personas are fictional characters representing your target users.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ur-5',
        question: 'What is customer journey mapping?',
        type: 'multiple-choice',
        options: ['Tracking user location', 'Visualizing user experience across touchpoints', 'Mapping sales territories', 'Planning marketing campaigns'],
        correctAnswer: 'Visualizing user experience across touchpoints',
        points: 20
      }
    ]
  },

  'product-analytics': {
    id: 'product-analytics',
    title: 'Product Analytics Test',
    description: 'Test your knowledge of data-driven product decisions and metrics',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'pa-1',
        question: 'What are the different types of product metrics?',
        type: 'multiple-choice',
        options: ['Only revenue metrics', 'User engagement, retention, and business metrics', 'Only technical metrics', 'Only marketing metrics'],
        correctAnswer: 'User engagement, retention, and business metrics',
        points: 20
      },
      {
        id: 'pa-2',
        question: 'DAU stands for Daily Active Users.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'pa-3',
        question: 'What is cohort analysis?',
        type: 'multiple-choice',
        options: ['Analyzing user groups over time', 'Studying competitor products', 'Testing new features', 'Measuring server performance'],
        correctAnswer: 'Analyzing user groups over time',
        points: 20
      },
      {
        id: 'pa-4',
        question: 'A/B testing helps validate product hypotheses with data.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'pa-5',
        question: 'What is churn rate?',
        type: 'multiple-choice',
        options: ['Rate of feature adoption', 'Rate of users leaving the product', 'Rate of bug reports', 'Rate of new signups'],
        correctAnswer: 'Rate of users leaving the product',
        points: 20
      }
    ]
  },

  'agile-development': {
    id: 'agile-development',
    title: 'Agile Development Test',
    description: 'Test your knowledge of agile methodologies and product development processes',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'agile-1',
        question: 'What is a sprint in Agile development?',
        type: 'multiple-choice',
        options: ['A type of meeting', 'A time-boxed iteration for development work', 'A testing phase', 'A deployment process'],
        correctAnswer: 'A time-boxed iteration for development work',
        points: 20
      },
      {
        id: 'agile-2',
        question: 'Scrum is a framework for implementing Agile principles.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'agile-3',
        question: 'What is the role of a Product Owner in Scrum?',
        type: 'multiple-choice',
        options: ['Managing the development team', 'Defining and prioritizing product requirements', 'Writing code', 'Testing the product'],
        correctAnswer: 'Defining and prioritizing product requirements',
        points: 20
      },
      {
        id: 'agile-4',
        question: 'User stories are written from the end user\'s perspective.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'agile-5',
        question: 'What is the purpose of a retrospective meeting?',
        type: 'multiple-choice',
        options: ['Planning the next sprint', 'Reviewing and improving team processes', 'Demonstrating completed work', 'Estimating story points'],
        correctAnswer: 'Reviewing and improving team processes',
        points: 20
      }
    ]
  },

  'go-to-market': {
    id: 'go-to-market',
    title: 'Go-to-Market Strategy Test',
    description: 'Test your knowledge of product launch and market entry strategies',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'gtm-1',
        question: 'What is a go-to-market strategy?',
        type: 'multiple-choice',
        options: ['A development plan', 'A plan for bringing a product to market', 'A testing strategy', 'A hiring plan'],
        correctAnswer: 'A plan for bringing a product to market',
        points: 20
      },
      {
        id: 'gtm-2',
        question: 'Market segmentation involves dividing the market into distinct groups.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'gtm-3',
        question: 'What is product positioning?',
        type: 'multiple-choice',
        options: ['Where to place the product in stores', 'How the product is perceived relative to competitors', 'The product development timeline', 'The pricing strategy'],
        correctAnswer: 'How the product is perceived relative to competitors',
        points: 20
      },
      {
        id: 'gtm-4',
        question: 'Customer acquisition cost (CAC) should be lower than customer lifetime value (LTV).',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'gtm-5',
        question: 'What is a distribution channel?',
        type: 'multiple-choice',
        options: ['A communication method', 'A path through which products reach customers', 'A marketing campaign', 'A development process'],
        correctAnswer: 'A path through which products reach customers',
        points: 20
      }
    ]
  },

  // QA Automation Testing Tests
  'testing-fundamentals': {
    id: 'testing-fundamentals',
    title: 'Software Testing Fundamentals Test',
    description: 'Test your knowledge of software testing principles and methodologies',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'test-1',
        question: 'What are the main types of software testing?',
        type: 'multiple-choice',
        options: ['Manual and Automated', 'Functional and Non-functional', 'Unit, Integration, and System', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      },
      {
        id: 'test-2',
        question: 'Testing can prove that software is completely bug-free.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'test-3',
        question: 'What is the difference between verification and validation?',
        type: 'multiple-choice',
        options: ['No difference', 'Verification checks if we built the product right, validation checks if we built the right product', 'Verification is manual, validation is automated', 'Verification is for bugs, validation is for performance'],
        correctAnswer: 'Verification checks if we built the product right, validation checks if we built the right product',
        points: 20
      },
      {
        id: 'test-4',
        question: 'Black box testing focuses on internal code structure.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'test-5',
        question: 'What is regression testing?',
        type: 'multiple-choice',
        options: ['Testing new features', 'Re-testing existing functionality after changes', 'Testing performance', 'Testing security'],
        correctAnswer: 'Re-testing existing functionality after changes',
        points: 20
      }
    ]
  },

  'selenium-automation': {
    id: 'selenium-automation',
    title: 'Selenium Web Automation Test',
    description: 'Test your knowledge of Selenium WebDriver and web automation',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'sel-1',
        question: 'What is Selenium WebDriver?',
        type: 'multiple-choice',
        options: ['A web browser', 'A tool for automating web browser interactions', 'A programming language', 'A testing framework'],
        correctAnswer: 'A tool for automating web browser interactions',
        points: 20
      },
      {
        id: 'sel-2',
        question: 'Selenium supports multiple programming languages including Java, Python, and C#.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'sel-3',
        question: 'Which of these is NOT a valid locator strategy in Selenium?',
        type: 'multiple-choice',
        options: ['ID', 'Class Name', 'XPath', 'Color'],
        correctAnswer: 'Color',
        points: 20
      },
      {
        id: 'sel-4',
        question: 'Page Object Model is a design pattern used in Selenium automation.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'sel-5',
        question: 'What is an implicit wait in Selenium?',
        type: 'multiple-choice',
        options: ['A fixed delay', 'A global wait applied to all elements', 'A wait for specific conditions', 'No wait at all'],
        correctAnswer: 'A global wait applied to all elements',
        points: 20
      }
    ]
  },

  'api-testing': {
    id: 'api-testing',
    title: 'API Testing Test',
    description: 'Test your knowledge of API testing methods and tools',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'api-1',
        question: 'What does API stand for?',
        type: 'multiple-choice',
        options: ['Application Programming Interface', 'Automated Program Integration', 'Advanced Programming Implementation', 'Application Process Integration'],
        correctAnswer: 'Application Programming Interface',
        points: 20
      },
      {
        id: 'api-2',
        question: 'REST APIs use HTTP methods like GET, POST, PUT, and DELETE.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'api-3',
        question: 'What HTTP status code indicates a successful request?',
        type: 'multiple-choice',
        options: ['404', '500', '200', '301'],
        correctAnswer: '200',
        points: 20
      },
      {
        id: 'api-4',
        question: 'JSON is the most common data format for REST APIs.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'api-5',
        question: 'What should be tested in API testing?',
        type: 'multiple-choice',
        options: ['Response status codes', 'Response data and structure', 'Response time', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      }
    ]
  },

  'performance-testing': {
    id: 'performance-testing',
    title: 'Performance Testing Test',
    description: 'Test your knowledge of load testing and performance optimization',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'perf-1',
        question: 'What is the difference between load testing and stress testing?',
        type: 'multiple-choice',
        options: ['No difference', 'Load testing tests normal conditions, stress testing tests beyond normal capacity', 'Load testing is automated, stress testing is manual', 'Load testing is for APIs, stress testing is for UI'],
        correctAnswer: 'Load testing tests normal conditions, stress testing tests beyond normal capacity',
        points: 20
      },
      {
        id: 'perf-2',
        question: 'Performance testing should be done only at the end of development.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'perf-3',
        question: 'What does response time measure?',
        type: 'multiple-choice',
        options: ['How long a server takes to start', 'Time between request and response', 'How many requests per second', 'Server uptime'],
        correctAnswer: 'Time between request and response',
        points: 20
      },
      {
        id: 'perf-4',
        question: 'JMeter is a popular open-source performance testing tool.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'perf-5',
        question: 'What is throughput in performance testing?',
        type: 'multiple-choice',
        options: ['Response time', 'Number of requests processed per unit time', 'Error rate', 'Server memory usage'],
        correctAnswer: 'Number of requests processed per unit time',
        points: 20
      }
    ]
  },

  'cicd-testing': {
    id: 'cicd-testing',
    title: 'CI/CD Integration Test',
    description: 'Test your knowledge of integrating tests in CI/CD pipelines',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'cicd-1',
        question: 'What does CI/CD stand for?',
        type: 'multiple-choice',
        options: ['Continuous Integration/Continuous Deployment', 'Computer Integration/Computer Deployment', 'Code Integration/Code Deployment', 'Central Integration/Central Deployment'],
        correctAnswer: 'Continuous Integration/Continuous Deployment',
        points: 20
      },
      {
        id: 'cicd-2',
        question: 'Automated tests should be integrated into the CI/CD pipeline.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'cicd-3',
        question: 'What happens when a test fails in a CI pipeline?',
        type: 'multiple-choice',
        options: ['The build continues anyway', 'The build is typically stopped/failed', 'Tests are ignored', 'Only manual tests are run'],
        correctAnswer: 'The build is typically stopped/failed',
        points: 20
      },
      {
        id: 'cicd-4',
        question: 'Jenkins is a popular CI/CD tool.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'cicd-5',
        question: 'What is the benefit of running tests in CI/CD?',
        type: 'multiple-choice',
        options: ['Early bug detection', 'Faster feedback', 'Consistent test execution', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      }
    ]
  },

  // UX/UI Design & Research Tests
  'design-thinking': {
    id: 'design-thinking',
    title: 'Design Thinking Test',
    description: 'Test your knowledge of human-centered design process and methodology',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'dt-1',
        question: 'What are the five stages of Design Thinking?',
        type: 'multiple-choice',
        options: ['Plan, Design, Build, Test, Deploy', 'Empathize, Define, Ideate, Prototype, Test', 'Research, Analyze, Create, Validate, Launch', 'Discover, Define, Develop, Deliver'],
        correctAnswer: 'Empathize, Define, Ideate, Prototype, Test',
        points: 20
      },
      {
        id: 'dt-2',
        question: 'Design Thinking is a human-centered approach to innovation.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'dt-3',
        question: 'What is the goal of the Empathize stage?',
        type: 'multiple-choice',
        options: ['To create solutions', 'To understand users and their needs', 'To test prototypes', 'To define problems'],
        correctAnswer: 'To understand users and their needs',
        points: 20
      },
      {
        id: 'dt-4',
        question: 'Design Thinking encourages divergent thinking followed by convergent thinking.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'dt-5',
        question: 'What is the purpose of prototyping in Design Thinking?',
        type: 'multiple-choice',
        options: ['To create the final product', 'To quickly test and iterate on ideas', 'To impress stakeholders', 'To complete the project'],
        correctAnswer: 'To quickly test and iterate on ideas',
        points: 20
      }
    ]
  },

  'ux-research': {
    id: 'ux-research',
    title: 'UX Research Test',
    description: 'Test your knowledge of user research methods and usability testing',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'uxr-1',
        question: 'What is the difference between quantitative and qualitative research?',
        type: 'multiple-choice',
        options: ['No difference', 'Quantitative focuses on numbers and data, qualitative focuses on insights and behaviors', 'Quantitative is cheaper, qualitative is expensive', 'Quantitative is for designers, qualitative is for developers'],
        correctAnswer: 'Quantitative focuses on numbers and data, qualitative focuses on insights and behaviors',
        points: 20
      },
      {
        id: 'uxr-2',
        question: 'User interviews are a qualitative research method.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'uxr-3',
        question: 'What is a user persona?',
        type: 'multiple-choice',
        options: ['A real user', 'A fictional character representing a user segment', 'A design pattern', 'A testing method'],
        correctAnswer: 'A fictional character representing a user segment',
        points: 20
      },
      {
        id: 'uxr-4',
        question: 'Usability testing should be done with the target audience.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'uxr-5',
        question: 'What is the think-aloud protocol in usability testing?',
        type: 'multiple-choice',
        options: ['Users silently complete tasks', 'Users verbalize their thoughts while completing tasks', 'Researchers think out loud', 'Users write down their thoughts'],
        correctAnswer: 'Users verbalize their thoughts while completing tasks',
        points: 20
      }
    ]
  },

  'ui-design-principles': {
    id: 'ui-design-principles',
    title: 'UI Design Principles Test',
    description: 'Test your knowledge of visual design, typography, and layout principles',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'ui-1',
        question: 'What are the basic principles of visual design?',
        type: 'multiple-choice',
        options: ['Color, Typography, Images', 'Balance, Contrast, Emphasis, Unity', 'HTML, CSS, JavaScript', 'Research, Design, Test'],
        correctAnswer: 'Balance, Contrast, Emphasis, Unity',
        points: 20
      },
      {
        id: 'ui-2',
        question: 'White space (negative space) is important in UI design.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ui-3',
        question: 'What is the purpose of a visual hierarchy?',
        type: 'multiple-choice',
        options: ['To make things look pretty', 'To guide users\' attention and communicate importance', 'To use different colors', 'To fill up space'],
        correctAnswer: 'To guide users\' attention and communicate importance',
        points: 20
      },
      {
        id: 'ui-4',
        question: 'Sans-serif fonts are generally better for body text on screens.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ui-5',
        question: 'What is the 60-30-10 rule in color design?',
        type: 'multiple-choice',
        options: ['A pricing strategy', 'A color proportion guideline for balanced designs', 'A typography rule', 'A layout grid system'],
        correctAnswer: 'A color proportion guideline for balanced designs',
        points: 20
      }
    ]
  },

  'design-tools': {
    id: 'design-tools',
    title: 'Design Tools Test',
    description: 'Test your knowledge of design tools and prototyping techniques',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'tools-1',
        question: 'Which of these is a popular UI/UX design tool?',
        type: 'multiple-choice',
        options: ['Figma', 'Adobe XD', 'Sketch', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 20
      },
      {
        id: 'tools-2',
        question: 'Figma is a web-based design tool that allows real-time collaboration.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'tools-3',
        question: 'What is the difference between low-fidelity and high-fidelity prototypes?',
        type: 'multiple-choice',
        options: ['Low-fi is digital, high-fi is paper', 'Low-fi is basic/rough, high-fi is detailed/polished', 'Low-fi is expensive, high-fi is cheap', 'No difference'],
        correctAnswer: 'Low-fi is basic/rough, high-fi is detailed/polished',
        points: 20
      },
      {
        id: 'tools-4',
        question: 'Wireframes should include detailed visual design elements.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'tools-5',
        question: 'What is a design system?',
        type: 'multiple-choice',
        options: ['A software for designing', 'A collection of reusable components and guidelines', 'A design process', 'A type of prototype'],
        correctAnswer: 'A collection of reusable components and guidelines',
        points: 20
      }
    ]
  },

  'responsive-design': {
    id: 'responsive-design',
    title: 'Responsive & Accessible Design Test',
    description: 'Test your knowledge of responsive design and accessibility principles',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'resp-1',
        question: 'What is responsive design?',
        type: 'multiple-choice',
        options: ['Design that responds to user clicks', 'Design that adapts to different screen sizes and devices', 'Design that loads quickly', 'Design that changes colors'],
        correctAnswer: 'Design that adapts to different screen sizes and devices',
        points: 20
      },
      {
        id: 'resp-2',
        question: 'Mobile-first design approach means designing for mobile devices first.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'resp-3',
        question: 'What are breakpoints in responsive design?',
        type: 'multiple-choice',
        options: ['Points where the design breaks', 'Specific screen widths where layout changes', 'Error points in code', 'Design milestones'],
        correctAnswer: 'Specific screen widths where layout changes',
        points: 20
      },
      {
        id: 'resp-4',
        question: 'Accessibility in design means making products usable by people with disabilities.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'resp-5',
        question: 'What is the minimum color contrast ratio recommended for normal text?',
        type: 'multiple-choice',
        options: ['2:1', '3:1', '4.5:1', '7:1'],
        correctAnswer: '4.5:1',
        points: 20
      }
    ]
  },

  // IoT & Embedded Systems Tests
  'electronics-basics': {
    id: 'electronics-basics',
    title: 'Electronics Fundamentals Test',
    description: 'Test your knowledge of basic electronics and circuit principles',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'elec-1',
        question: 'What is the relationship between voltage, current, and resistance (Ohm\'s Law)?',
        type: 'multiple-choice',
        options: ['V = I × R', 'V = I ÷ R', 'V = I + R', 'V = I - R'],
        correctAnswer: 'V = I × R',
        points: 20
      },
      {
        id: 'elec-2',
        question: 'A resistor limits the flow of electric current.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'elec-3',
        question: 'What does LED stand for?',
        type: 'multiple-choice',
        options: ['Light Emitting Diode', 'Low Energy Device', 'Linear Electronic Display', 'Logic Electronic Driver'],
        correctAnswer: 'Light Emitting Diode',
        points: 20
      },
      {
        id: 'elec-4',
        question: 'In a series circuit, current is the same through all components.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'elec-5',
        question: 'What is the purpose of a capacitor?',
        type: 'multiple-choice',
        options: ['To store electrical energy', 'To amplify signals', 'To generate electricity', 'To measure voltage'],
        correctAnswer: 'To store electrical energy',
        points: 20
      }
    ]
  },

  'arduino-programming': {
    id: 'arduino-programming',
    title: 'Arduino Programming Test',
    description: 'Test your knowledge of Arduino microcontroller programming',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'ard-1',
        question: 'What programming language is primarily used for Arduino?',
        type: 'multiple-choice',
        options: ['Python', 'C/C++', 'Java', 'JavaScript'],
        correctAnswer: 'C/C++',
        points: 20
      },
      {
        id: 'ard-2',
        question: 'Every Arduino sketch must have setup() and loop() functions.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ard-3',
        question: 'What does pinMode() function do?',
        type: 'multiple-choice',
        options: ['Sets the operating mode of a pin', 'Reads the value of a pin', 'Writes a value to a pin', 'Measures pin voltage'],
        correctAnswer: 'Sets the operating mode of a pin',
        points: 20
      },
      {
        id: 'ard-4',
        question: 'digitalWrite(13, HIGH) turns on an LED connected to pin 13.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'ard-5',
        question: 'What is the difference between analog and digital pins on Arduino?',
        type: 'multiple-choice',
        options: ['No difference', 'Analog pins can read varying voltages, digital pins read HIGH/LOW', 'Analog pins are faster', 'Digital pins use more power'],
        correctAnswer: 'Analog pins can read varying voltages, digital pins read HIGH/LOW',
        points: 20
      }
    ]
  },

  'raspberry-pi': {
    id: 'raspberry-pi',
    title: 'Raspberry Pi Test',
    description: 'Test your knowledge of Raspberry Pi and Linux systems for embedded development',
    timeLimit: 30,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'rpi-1',
        question: 'What is Raspberry Pi?',
        type: 'multiple-choice',
        options: ['A microcontroller', 'A single-board computer', 'A programming language', 'A sensor'],
        correctAnswer: 'A single-board computer',
        points: 20
      },
      {
        id: 'rpi-2',
        question: 'Raspberry Pi runs a Linux-based operating system.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'rpi-3',
        question: 'What does GPIO stand for in Raspberry Pi?',
        type: 'multiple-choice',
        options: ['General Purpose Input/Output', 'Global Positioning Input/Output', 'Graphics Processing Input/Output', 'Game Programming Input/Output'],
        correctAnswer: 'General Purpose Input/Output',
        points: 20
      },
      {
        id: 'rpi-4',
        question: 'Python is commonly used for Raspberry Pi programming.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'rpi-5',
        question: 'What is the purpose of the GPIO pins on Raspberry Pi?',
        type: 'multiple-choice',
        options: ['To connect external hardware', 'To provide power', 'To display graphics', 'To connect to internet'],
        correctAnswer: 'To connect external hardware',
        points: 20
      }
    ]
  },

  'iot-protocols': {
    id: 'iot-protocols',
    title: 'IoT Communication Protocols Test',
    description: 'Test your knowledge of IoT communication protocols and networking',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'iot-1',
        question: 'What does MQTT stand for?',
        type: 'multiple-choice',
        options: ['Message Queuing Telemetry Transport', 'Multi-Queue Transfer Technology', 'Mobile Quality Testing Tool', 'Machine Query Transfer Terminal'],
        correctAnswer: 'Message Queuing Telemetry Transport',
        points: 20
      },
      {
        id: 'iot-2',
        question: 'MQTT is a lightweight messaging protocol ideal for IoT devices.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'iot-3',
        question: 'What is the main advantage of LoRaWAN for IoT?',
        type: 'multiple-choice',
        options: ['High speed data transfer', 'Long range, low power communication', 'High bandwidth', 'Low cost hardware'],
        correctAnswer: 'Long range, low power communication',
        points: 20
      },
      {
        id: 'iot-4',
        question: 'WiFi is suitable for battery-powered IoT devices due to its low power consumption.',
        type: 'true-false',
        correctAnswer: 'false',
        points: 20
      },
      {
        id: 'iot-5',
        question: 'What is the publish-subscribe pattern in MQTT?',
        type: 'multiple-choice',
        options: ['Direct device-to-device communication', 'Devices publish messages to topics, subscribers receive them', 'A security protocol', 'A data compression method'],
        correctAnswer: 'Devices publish messages to topics, subscribers receive them',
        points: 20
      }
    ]
  },

  'iot-cloud-integration': {
    id: 'iot-cloud-integration',
    title: 'IoT Cloud Integration Test',
    description: 'Test your knowledge of connecting IoT devices to cloud platforms',
    timeLimit: 25,
    passingScore: 80,
    maxAttempts: 3,
    questions: [
      {
        id: 'cloud-iot-1',
        question: 'What is AWS IoT Core?',
        type: 'multiple-choice',
        options: ['A physical IoT device', 'A cloud platform for connecting IoT devices', 'An IoT programming language', 'A sensor type'],
        correctAnswer: 'A cloud platform for connecting IoT devices',
        points: 20
      },
      {
        id: 'cloud-iot-2',
        question: 'IoT devices can send data to cloud platforms using REST APIs.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'cloud-iot-3',
        question: 'What is the purpose of device shadows in IoT cloud platforms?',
        type: 'multiple-choice',
        options: ['To hide devices from hackers', 'To maintain device state when offline', 'To create device backups', 'To monitor device temperature'],
        correctAnswer: 'To maintain device state when offline',
        points: 20
      },
      {
        id: 'cloud-iot-4',
        question: 'Edge computing brings data processing closer to IoT devices.',
        type: 'true-false',
        correctAnswer: 'true',
        points: 20
      },
      {
        id: 'cloud-iot-5',
        question: 'What is telemetry in IoT?',
        type: 'multiple-choice',
        options: ['Device configuration', 'Remote measurement and data transmission', 'Device security', 'Power management'],
        correctAnswer: 'Remote measurement and data transmission',
        points: 20
      }
    ]
  }
};