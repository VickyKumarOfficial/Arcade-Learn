
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
  },
  {
    id: 'mobile-flutter',
    title: 'Mobile Development with Flutter',
    description: 'Build cross-platform mobile apps for iOS and Android using Dart and Flutter',
    category: 'Mobile',
    difficulty: 'Intermediate',
    estimatedDuration: '16-20 weeks',
    completedComponents: 0,
    icon: '📱',
    color: 'from-blue-400 to-cyan-500',
    components: [
      {
        id: 'dart-fundamentals',
        title: 'Dart Programming Fundamentals',
        description: 'Learn Dart language basics and object-oriented programming',
        estimatedHours: 30,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'dart-fundamentals',
        resources: [
          {
            id: 'dart-tour',
            title: 'Dart Language Tour - Official Documentation',
            type: 'documentation',
            url: 'https://dart.dev/language',
            duration: '8 hours'
          },
          {
            id: 'dart-tutorial',
            title: 'Dart Programming Tutorial - Vandad Nahavandipoor',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q&list=PL6yRaaP0WPkVtoeNIGqILtRAgd3h2CNpT',
            duration: '4 hours'
          },
          {
            id: 'dart-exercises',
            title: 'DartPad Workshops - Interactive Learning',
            type: 'course',
            url: 'https://dartpad.dev/workshops',
            duration: '6 hours'
          },
          {
            id: 'dart-cheatsheet',
            title: 'Dart Language Cheatsheet & Best Practices',
            type: 'article',
            url: 'https://dart.dev/codelabs/dart-cheatsheet',
            duration: '2 hours'
          }
        ]
      },
      {
        id: 'flutter-setup',
        title: 'Flutter Environment Setup',
        description: 'Install and configure Flutter development environment',
        estimatedHours: 15,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['dart-fundamentals'],
        testId: 'flutter-setup',
        resources: [
          {
            id: 'flutter-install',
            title: 'Flutter Installation Guide - Official Documentation',
            type: 'documentation',
            url: 'https://docs.flutter.dev/get-started/install',
            duration: '3 hours'
          },
          {
            id: 'flutter-ide',
            title: 'Flutter Setup Complete Guide - Net Ninja',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=1ukSR1GRtMU&list=PL4cUxeGkcC9jLYyp2Aoh6hcWuxFDX6PBJ',
            duration: '2 hours'
          },
          {
            id: 'first-flutter-app',
            title: 'Write Your First Flutter App - Official Codelab',
            type: 'course',
            url: 'https://codelabs.developers.google.com/codelabs/first-flutter-app-pt1',
            duration: '3 hours'
          },
          {
            id: 'flutter-doctor',
            title: 'Flutter Development Setup & Tools',
            type: 'article',
            url: 'https://docs.flutter.dev/get-started/test-drive',
            duration: '2 hours'
          }
        ]
      },
      {
        id: 'flutter-widgets',
        title: 'Flutter Widgets and UI',
        description: 'Master Flutter widgets and build beautiful user interfaces',
        estimatedHours: 45,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['flutter-setup'],
        testId: 'flutter-widgets',
        resources: [
          {
            id: 'flutter-widgets-catalog',
            title: 'Flutter Widget Catalog - Complete Reference',
            type: 'documentation',
            url: 'https://docs.flutter.dev/development/ui/widgets',
            duration: '12 hours'
          },
          {
            id: 'flutter-ui-course',
            title: 'Flutter UI Course - The App Brewery',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=VPvVD8t02U8&list=PLSzsOkUDsvdtl3Pw48-R8lcK2oYkk40cm',
            duration: '8 hours'
          },
          {
            id: 'material-design',
            title: 'Building Beautiful UIs with Flutter - Google Codelabs',
            type: 'course',
            url: 'https://codelabs.developers.google.com/codelabs/flutter-cupertino',
            duration: '4 hours'
          },
          {
            id: 'layout-cheatsheet',
            title: 'Flutter Layout Cheat Sheet - Visual Guide',
            type: 'article',
            url: 'https://medium.com/flutter-community/flutter-layout-cheat-sheet-5363348d037e',
            duration: '3 hours'
          }
        ]
      },
      {
        id: 'flutter-state-management',
        title: 'State Management in Flutter',
        description: 'Learn Provider, Bloc, and other state management solutions',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['flutter-widgets'],
        testId: 'flutter-state-management',
        resources: [
          {
            id: 'flutter-state-intro',
            title: 'State Management Options - Official Guide',
            type: 'documentation',
            url: 'https://docs.flutter.dev/development/data-and-backend/state-mgmt/options',
            duration: '6 hours'
          },
          {
            id: 'provider-tutorial',
            title: 'Provider State Management - Reso Coder',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=d_m5csmrf7I&list=PLB6lc7nQ1n4iYGE_khpXRdJkJEp9WOech',
            duration: '3 hours'
          },
          {
            id: 'bloc-pattern',
            title: 'BLoC Pattern Complete Course - Felix Angelov',
            type: 'course',
            url: 'https://bloclibrary.dev/#/fluttertodostutorial',
            duration: '8 hours'
          },
          {
            id: 'riverpod-guide',
            title: 'Riverpod: The Best State Management?',
            type: 'article',
            url: 'https://codewithandrea.com/articles/flutter-state-management-riverpod/',
            duration: '5 hours'
          }
        ]
      },
      {
        id: 'flutter-deployment',
        title: 'Flutter App Deployment',
        description: 'Deploy Flutter apps to Android Play Store and iOS App Store',
        estimatedHours: 25,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['flutter-state-management'],
        testId: 'flutter-deployment',
        resources: [
          {
            id: 'android-deployment',
            title: 'Android Deployment - Official Flutter Guide',
            type: 'documentation',
            url: 'https://docs.flutter.dev/deployment/android',
            duration: '5 hours'
          },
          {
            id: 'ios-deployment',
            title: 'iOS Deployment Complete Tutorial - Code with Andrea',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=akFF1uJWZck',
            duration: '6 hours'
          },
          {
            id: 'app-signing',
            title: 'App Store Connect & Play Console Guide',
            type: 'course',
            url: 'https://codelabs.developers.google.com/codelabs/flutter-github-client',
            duration: '3 hours'
          },
          {
            id: 'fastlane-guide',
            title: 'Automate Flutter Deployment with Fastlane',
            type: 'article',
            url: 'https://docs.fastlane.tools/getting-started/cross-platform/flutter/',
            duration: '4 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Ethical Hacking',
    description: 'Learn penetration testing, network security, and ethical hacking techniques',
    category: 'Security',
    difficulty: 'Advanced',
    estimatedDuration: '20-24 weeks',
    completedComponents: 0,
    icon: '🔐',
    color: 'from-red-500 to-orange-500',
    components: [
      {
        id: 'security-fundamentals',
        title: 'Cybersecurity Fundamentals',
        description: 'Learn basic security concepts and threat landscape',
        estimatedHours: 35,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'security-fundamentals',
        resources: [
          {
            id: 'cissp-guide',
            title: 'NIST Cybersecurity Framework 2.0 - Complete Guide',
            type: 'documentation',
            url: 'https://www.nist.gov/cyberframework',
            duration: '8 hours'
          },
          {
            id: 'security-concepts',
            title: 'CompTIA Security+ Complete Course - Professor Messer',
            type: 'video',
            url: 'https://www.youtube.com/playlist?list=PLG49S3nxzAnnVhoAaL4B6aMFDQ8_gdxAy',
            duration: '4 hours'
          },
          {
            id: 'threat-modeling',
            title: 'Threat Modeling Fundamentals - Microsoft Learn',
            type: 'course',
            url: 'https://docs.microsoft.com/en-us/learn/paths/tm-threat-modeling-fundamentals/',
            duration: '6 hours'
          },
          {
            id: 'cia-triad',
            title: 'Information Security Principles - SANS Institute',
            type: 'article',
            url: 'https://www.sans.org/white-papers/1988/',
            duration: '3 hours'
          }
        ]
      },
      {
        id: 'network-security',
        title: 'Network Security',
        description: 'Understand network protocols, firewalls, and network defense',
        estimatedHours: 50,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['security-fundamentals'],
        testId: 'network-security',
        resources: [
          {
            id: 'network-protocols',
            title: 'Network Protocols and Security',
            type: 'course',
            url: 'https://www.coursera.org/learn/network-security',
            duration: '25 hours'
          },
          {
            id: 'wireshark-tutorial',
            title: 'Wireshark Network Analysis',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=jvuiI1Leg6w',
            duration: '5 hours'
          },
          {
            id: 'firewall-config',
            title: 'Firewall Configuration and Management',
            type: 'documentation',
            url: 'https://www.sans.org/white-papers/1059/',
            duration: '20 hours'
          }
        ]
      },
      {
        id: 'penetration-testing',
        title: 'Penetration Testing',
        description: 'Learn ethical hacking and penetration testing methodologies',
        estimatedHours: 60,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['network-security'],
        testId: 'penetration-testing',
        resources: [
          {
            id: 'kali-linux',
            title: 'Kali Linux and Penetration Testing',
            type: 'course',
            url: 'https://www.offensive-security.com/pwk-oscp/',
            duration: '30 hours'
          },
          {
            id: 'metasploit-guide',
            title: 'Metasploit Framework Guide',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=8lR27r8Y_ik',
            duration: '6 hours'
          },
          {
            id: 'owasp-top-10',
            title: 'OWASP Top 10 Vulnerabilities',
            type: 'documentation',
            url: 'https://owasp.org/www-project-top-ten/',
            duration: '24 hours'
          }
        ]
      },
      {
        id: 'web-app-security',
        title: 'Web Application Security',
        description: 'Secure web applications and APIs against common attacks',
        estimatedHours: 45,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['penetration-testing'],
        testId: 'web-app-security',
        resources: [
          {
            id: 'web-security-testing',
            title: 'Web Security Testing Guide',
            type: 'documentation',
            url: 'https://owasp.org/www-project-web-security-testing-guide/',
            duration: '25 hours'
          },
          {
            id: 'burp-suite',
            title: 'Burp Suite Tutorial',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=G3hpAeoZ4ek',
            duration: '4 hours'
          },
          {
            id: 'sql-injection',
            title: 'SQL Injection Prevention',
            type: 'course',
            url: 'https://portswigger.net/web-security/sql-injection',
            duration: '16 hours'
          }
        ]
      },
      {
        id: 'incident-response',
        title: 'Incident Response & Forensics',
        description: 'Learn incident response procedures and digital forensics',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['web-app-security'],
        testId: 'incident-response',
        resources: [
          {
            id: 'nist-framework',
            title: 'NIST Cybersecurity Framework',
            type: 'documentation',
            url: 'https://www.nist.gov/cyberframework',
            duration: '18 hours'
          },
          {
            id: 'digital-forensics',
            title: 'Digital Forensics Fundamentals',
            type: 'course',
            url: 'https://www.sans.org/cyber-security-courses/digital-forensics-incident-response/',
            duration: '15 hours'
          },
          {
            id: 'malware-analysis',
            title: 'Malware Analysis Basics',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=gTR6WepMYfY',
            duration: '7 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'blockchain-web3',
    title: 'Blockchain & Web3 Development',
    description: 'Master smart contracts, DeFi, NFTs, and decentralized application development',
    category: 'Blockchain',
    difficulty: 'Advanced',
    estimatedDuration: '18-22 weeks',
    completedComponents: 0,
    icon: '⛓️',
    color: 'from-purple-500 to-indigo-600',
    components: [
      {
        id: 'blockchain-basics',
        title: 'Blockchain Fundamentals',
        description: 'Understand blockchain technology, cryptocurrencies, and consensus mechanisms',
        estimatedHours: 40,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'blockchain-basics',
        resources: [
          {
            id: 'blockchain-intro',
            title: 'Blockchain Fundamentals - MIT OpenCourseWare',
            type: 'course',
            url: 'https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/',
            duration: '20 hours'
          },
          {
            id: 'bitcoin-whitepaper',
            title: 'Bitcoin Whitepaper & Analysis - Satoshi Nakamoto',
            type: 'documentation',
            url: 'https://bitcoin.org/bitcoin.pdf',
            duration: '8 hours'
          },
          {
            id: 'consensus-mechanisms',
            title: 'Blockchain Consensus - Whiteboard Crypto',
            type: 'video',
            url: 'https://www.youtube.com/playlist?list=PLU52pNodXIGdM6XDgHVG7Dvul2bs7YJyO',
            duration: '6 hours'
          },
          {
            id: 'crypto-basics',
            title: 'Cryptocurrency 101 - Binance Academy',
            type: 'article',
            url: 'https://academy.binance.com/en/articles/what-is-cryptocurrency',
            duration: '4 hours'
          }
        ]
      },
      {
        id: 'ethereum-solidity',
        title: 'Ethereum & Solidity Programming',
        description: 'Learn Ethereum blockchain and Solidity smart contract development',
        estimatedHours: 55,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['blockchain-basics'],
        testId: 'ethereum-solidity',
        resources: [
          {
            id: 'solidity-docs',
            title: 'Solidity Documentation',
            type: 'documentation',
            url: 'https://docs.soliditylang.org/',
            duration: '25 hours'
          },
          {
            id: 'ethereum-tutorial',
            title: 'Ethereum Development Tutorial',
            type: 'course',
            url: 'https://ethereum.org/en/developers/tutorials/',
            duration: '20 hours'
          },
          {
            id: 'smart-contract-security',
            title: 'Smart Contract Security',
            type: 'article',
            url: 'https://consensys.github.io/smart-contract-best-practices/',
            duration: '10 hours'
          }
        ]
      },
      {
        id: 'web3-dapps',
        title: 'Web3 and DApp Development',
        description: 'Build decentralized applications using Web3.js and React',
        estimatedHours: 50,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['ethereum-solidity'],
        testId: 'web3-dapps',
        resources: [
          {
            id: 'web3js-guide',
            title: 'Web3.js Complete Guide',
            type: 'documentation',
            url: 'https://web3js.readthedocs.io/',
            duration: '20 hours'
          },
          {
            id: 'dapp-tutorial',
            title: 'DApp Development Tutorial',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=CoMUfvY0Q0E',
            duration: '8 hours'
          },
          {
            id: 'metamask-integration',
            title: 'MetaMask Integration',
            type: 'course',
            url: 'https://docs.metamask.io/guide/',
            duration: '22 hours'
          }
        ]
      },
      {
        id: 'defi-protocols',
        title: 'DeFi Protocols & Development',
        description: 'Understand and build DeFi protocols, AMMs, and yield farming',
        estimatedHours: 45,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['web3-dapps'],
        testId: 'defi-protocols',
        resources: [
          {
            id: 'defi-guide',
            title: 'DeFi Developer Guide',
            type: 'documentation',
            url: 'https://ethereum.org/en/defi/',
            duration: '20 hours'
          },
          {
            id: 'uniswap-v3',
            title: 'Uniswap V3 Protocol Deep Dive',
            type: 'course',
            url: 'https://docs.uniswap.org/',
            duration: '15 hours'
          },
          {
            id: 'lending-protocols',
            title: 'Building Lending Protocols',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=aTp9er6S73M',
            duration: '10 hours'
          }
        ]
      },
      {
        id: 'nft-marketplace',
        title: 'NFT Development & Marketplace',
        description: 'Create and deploy NFT collections and marketplace platforms',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['defi-protocols'],
        testId: 'nft-marketplace',
        resources: [
          {
            id: 'erc721-standard',
            title: 'ERC-721 NFT Standard',
            type: 'documentation',
            url: 'https://eips.ethereum.org/EIPS/eip-721',
            duration: '12 hours'
          },
          {
            id: 'nft-tutorial',
            title: 'NFT Creation Tutorial',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=YPbgjPPC1d0',
            duration: '6 hours'
          },
          {
            id: 'opensea-integration',
            title: 'OpenSea API Integration',
            type: 'course',
            url: 'https://docs.opensea.io/',
            duration: '22 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'ai-ml-engineering',
    title: 'AI/ML Engineering with Python',
    description: 'Deep learning, neural networks, and production ML systems',
    category: 'AI/ML',
    difficulty: 'Advanced',
    estimatedDuration: '22-26 weeks',
    completedComponents: 0,
    icon: '🤖',
    color: 'from-green-500 to-teal-500',
    components: [
      {
        id: 'python-data-science',
        title: 'Python for Data Science',
        description: 'Master NumPy, Pandas, and data manipulation libraries',
        estimatedHours: 45,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'python-data-science',
        resources: [
          {
            id: 'numpy-tutorial',
            title: 'NumPy Complete Tutorial - Official User Guide',
            type: 'documentation',
            url: 'https://numpy.org/doc/stable/user/quickstart.html',
            duration: '6 hours'
          },
          {
            id: 'pandas-guide',
            title: 'Python Pandas Full Course - Keith Galli',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=vmEHCJofslg',
            duration: '8 hours'
          },
          {
            id: 'matplotlib-seaborn',
            title: 'Data Visualization Masterclass - Kaggle Learn',
            type: 'course',
            url: 'https://www.kaggle.com/learn/data-visualization',
            duration: '5 hours'
          },
          {
            id: 'jupyter-notebooks',
            title: 'Jupyter Notebook Tutorial - Real Python',
            type: 'article',
            url: 'https://realpython.com/jupyter-notebook-introduction/',
            duration: '3 hours'
          }
        ]
      },
      {
        id: 'machine-learning-basics',
        title: 'Machine Learning Fundamentals',
        description: 'Learn supervised, unsupervised learning and model evaluation',
        estimatedHours: 50,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['python-data-science'],
        testId: 'machine-learning-basics',
        resources: [
          {
            id: 'sklearn-tutorial',
            title: 'Scikit-learn Machine Learning Tutorial - Official',
            type: 'documentation',
            url: 'https://scikit-learn.org/stable/tutorial/index.html',
            duration: '12 hours'
          },
          {
            id: 'ml-coursera',
            title: 'Machine Learning Course - Andrew Ng (Stanford)',
            type: 'video',
            url: 'https://www.youtube.com/playlist?list=PLLssT5z_DsK-h9vYZkQkYNWcItqhlRJLN',
            duration: '15 hours'
          },
          {
            id: 'model-evaluation',
            title: 'ML Model Evaluation - StatQuest',
            type: 'course',
            url: 'https://www.youtube.com/watch?v=Kdsp6soqA7o&list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF',
            duration: '4 hours'
          },
          {
            id: 'kaggle-learn',
            title: 'Intro to Machine Learning - Kaggle Learn',
            type: 'article',
            url: 'https://www.kaggle.com/learn/intro-to-machine-learning',
            duration: '5 hours'
          }
        ]
      },
      {
        id: 'deep-learning',
        title: 'Deep Learning & Neural Networks',
        description: 'Master TensorFlow, Keras, and deep neural networks',
        estimatedHours: 60,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['machine-learning-basics'],
        testId: 'deep-learning',
        resources: [
          {
            id: 'tensorflow-guide',
            title: 'TensorFlow 2.0 Complete Guide',
            type: 'documentation',
            url: 'https://www.tensorflow.org/tutorials',
            duration: '30 hours'
          },
          {
            id: 'deep-learning-specialization',
            title: 'Deep Learning Specialization',
            type: 'course',
            url: 'https://www.coursera.org/specializations/deep-learning',
            duration: '25 hours'
          },
          {
            id: 'pytorch-tutorial',
            title: 'PyTorch Deep Learning',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=v5cngxo4mIg',
            duration: '5 hours'
          }
        ]
      },
      {
        id: 'computer-vision',
        title: 'Computer Vision',
        description: 'Image processing, CNN architectures, and computer vision applications',
        estimatedHours: 55,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['deep-learning'],
        testId: 'computer-vision',
        resources: [
          {
            id: 'opencv-tutorial',
            title: 'OpenCV Computer Vision',
            type: 'documentation',
            url: 'https://docs.opencv.org/4.x/d9/df8/tutorial_root.html',
            duration: '25 hours'
          },
          {
            id: 'cnn-architectures',
            title: 'CNN Architectures Deep Dive',
            type: 'course',
            url: 'https://www.coursera.org/learn/convolutional-neural-networks',
            duration: '20 hours'
          },
          {
            id: 'yolo-detection',
            title: 'Object Detection with YOLO',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=Grir6TZbc1M',
            duration: '10 hours'
          }
        ]
      },
      {
        id: 'mlops-production',
        title: 'MLOps & Production Deployment',
        description: 'Deploy and monitor ML models in production environments',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['computer-vision'],
        testId: 'mlops-production',
        resources: [
          {
            id: 'mlflow-guide',
            title: 'MLflow Model Management',
            type: 'documentation',
            url: 'https://mlflow.org/docs/latest/index.html',
            duration: '15 hours'
          },
          {
            id: 'docker-ml',
            title: 'Containerizing ML Applications',
            type: 'course',
            url: 'https://www.docker.com/blog/containerized-python-development-part-1/',
            duration: '12 hours'
          },
          {
            id: 'ml-monitoring',
            title: 'ML Model Monitoring',
            type: 'article',
            url: 'https://neptune.ai/blog/ml-model-monitoring-best-tools',
            duration: '13 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'game-development-unity',
    title: 'Game Development with Unity',
    description: 'Create 2D and 3D games using Unity engine and C# scripting',
    category: 'Game Dev',
    difficulty: 'Intermediate',
    estimatedDuration: '16-20 weeks',
    completedComponents: 0,
    icon: '🎮',
    color: 'from-purple-600 to-pink-500',
    components: [
      {
        id: 'csharp-programming',
        title: 'C# Programming for Unity',
        description: 'Learn C# fundamentals and object-oriented programming for game development',
        estimatedHours: 40,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'csharp-programming',
        resources: [
          {
            id: 'csharp-basics',
            title: 'Microsoft C# Programming Guide (Official)',
            type: 'documentation',
            url: 'https://docs.microsoft.com/en-us/dotnet/csharp/',
            duration: '20 hours'
          },
          {
            id: 'csharp-unity',
            title: 'Brackeys - C# Basics for Unity',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=IFayQioG71A&list=PLPV2KyIb3jR6ZkG8gZwJYSjnXxmfPAl51',
            duration: '6 hours'
          },
          {
            id: 'oop-csharp',
            title: 'Unity Learn - C# Survival Guide',
            type: 'course',
            url: 'https://learn.unity.com/tutorial/beginner-gameplay-scripting',
            duration: '14 hours'
          }
        ]
      },
      {
        id: 'unity-basics',
        title: 'Unity Engine Fundamentals',
        description: 'Master Unity interface, GameObjects, and basic game mechanics',
        estimatedHours: 45,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['csharp-programming'],
        testId: 'unity-basics',
        resources: [
          {
            id: 'unity-learn',
            title: 'Unity Learn - Complete Beginner Course',
            type: 'course',
            url: 'https://learn.unity.com/course/create-with-code',
            duration: '25 hours'
          },
          {
            id: 'unity-interface',
            title: 'Brackeys - Unity Interface Tutorial',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=IlKaB1etrik&list=PLPV2KyIb3jR5QFsefuO2RlAgWEz6EvVi6',
            duration: '4 hours'
          },
          {
            id: 'gameobject-components',
            title: 'Unity Manual - GameObjects & Components',
            type: 'documentation',
            url: 'https://docs.unity3d.com/Manual/GameObjects.html',
            duration: '16 hours'
          }
        ]
      },
      {
        id: 'game-physics',
        title: '2D/3D Game Physics',
        description: 'Implement physics, collisions, and movement in Unity games',
        estimatedHours: 35,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['unity-basics'],
        testId: 'game-physics',
        resources: [
          {
            id: 'unity-physics',
            title: 'Unity Manual - Physics System Guide',
            type: 'documentation',
            url: 'https://docs.unity3d.com/Manual/PhysicsSection.html',
            duration: '18 hours'
          },
          {
            id: 'rigidbody-tutorial',
            title: 'Brackeys - Physics & Rigidbody Tutorial',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=7KiK0Aqtmzc&list=PLPV2KyIb3jR4KLGCCAciWQ5qHudKtYeP7',
            duration: '3 hours'
          },
          {
            id: 'character-controller',
            title: 'Unity Learn - Character Controller',
            type: 'course',
            url: 'https://learn.unity.com/tutorial/character-controller',
            duration: '14 hours'
          }
        ]
      },
      {
        id: 'game-animation',
        title: 'Game Animation & UI',
        description: 'Create animations, UI systems, and user interactions',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['game-physics'],
        testId: 'game-animation',
        resources: [
          {
            id: 'unity-animation',
            title: 'Unity Manual - Animation System Complete Guide',
            type: 'documentation',
            url: 'https://docs.unity3d.com/Manual/AnimationSection.html',
            duration: '20 hours'
          },
          {
            id: 'ui-canvas',
            title: 'Brackeys - Unity UI Complete Tutorial',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=wbmjturGbAQ&list=PLPV2KyIb3jR4CtEelGPsmPzlvP7ISPYzR',
            duration: '5 hours'
          },
          {
            id: 'particle-effects',
            title: 'Unity Learn - Particle Systems Mastery',
            type: 'course',
            url: 'https://learn.unity.com/tutorial/introduction-to-particle-systems',
            duration: '15 hours'
          }
        ]
      },
      {
        id: 'game-publishing',
        title: 'Game Publishing & Monetization',
        description: 'Build, optimize, and publish games to various platforms',
        estimatedHours: 30,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['game-animation'],
        testId: 'game-publishing',
        resources: [
          {
            id: 'unity-build',
            title: 'Unity Manual - Build Settings & Platform Publishing',
            type: 'documentation',
            url: 'https://docs.unity3d.com/Manual/BuildSettings.html',
            duration: '12 hours'
          },
          {
            id: 'mobile-optimization',
            title: 'Unity Learn - Mobile Optimization Best Practices',
            type: 'video',
            url: 'https://learn.unity.com/tutorial/mobile-optimization-practical-guide',
            duration: '4 hours'
          },
          {
            id: 'monetization-strategies',
            title: 'Unity Monetization - Complete Guide',
            type: 'article',
            url: 'https://unity.com/solutions/mobile-monetization',
            duration: '14 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'cloud-architecture',
    title: 'Cloud Architecture & Solutions',
    description: 'Design scalable cloud infrastructure on AWS, Azure, and Google Cloud',
    category: 'Cloud',
    difficulty: 'Advanced',
    estimatedDuration: '18-22 weeks',
    completedComponents: 0,
    icon: '☁️',
    color: 'from-sky-500 to-blue-600',
    components: [
      {
        id: 'cloud-fundamentals',
        title: 'Cloud Computing Fundamentals',
        description: 'Understand cloud services, deployment models, and core concepts',
        estimatedHours: 35,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'cloud-fundamentals',
        resources: [
          {
            id: 'aws-cloud-basics',
            title: 'AWS Cloud Practitioner Essentials (Official)',
            type: 'course',
            url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/',
            duration: '15 hours'
          },
          {
            id: 'cloud-service-models',
            title: 'AWS re:Invent - Cloud Service Models Deep Dive',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=a9__D53WsUs',
            duration: '2 hours'
          },
          {
            id: 'cloud-security-intro',
            title: 'AWS Well-Architected Framework - Security Pillar',
            type: 'documentation',
            url: 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/',
            duration: '18 hours'
          }
        ]
      },
      {
        id: 'aws-services',
        title: 'AWS Core Services',
        description: 'Master EC2, S3, RDS, Lambda, and other essential AWS services',
        estimatedHours: 50,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['cloud-fundamentals'],
        testId: 'aws-services',
        resources: [
          {
            id: 'ec2-tutorial',
            title: 'AWS EC2 Documentation & Best Practices',
            type: 'documentation',
            url: 'https://docs.aws.amazon.com/ec2/',
            duration: '20 hours'
          },
          {
            id: 'aws-lambda',
            title: 'AWS Lambda Official Getting Started Guide',
            type: 'course',
            url: 'https://aws.amazon.com/lambda/getting-started/',
            duration: '15 hours'
          },
          {
            id: 'aws-storage',
            title: 'AWS re:Invent - Complete Storage Services Guide',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=_Bm4kGdHv5k',
            duration: '15 hours'
          }
        ]
      },
      {
        id: 'microservices-architecture',
        title: 'Microservices & Containerization',
        description: 'Design microservices with Docker, Kubernetes, and service mesh',
        estimatedHours: 55,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['aws-services'],
        testId: 'microservices-architecture',
        resources: [
          {
            id: 'docker-tutorial',
            title: 'Docker Official Get Started Guide',
            type: 'documentation',
            url: 'https://docs.docker.com/get-started/',
            duration: '20 hours'
          },
          {
            id: 'kubernetes-basics',
            title: 'Kubernetes Official Learning Path',
            type: 'course',
            url: 'https://kubernetes.io/docs/tutorials/',
            duration: '25 hours'
          },
          {
            id: 'service-mesh',
            title: 'Cloud Native Computing Foundation - Istio',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=s4t4BfZWGK8',
            duration: '10 hours'
          }
        ]
      },
      {
        id: 'infrastructure-as-code',
        title: 'Infrastructure as Code',
        description: 'Automate infrastructure with Terraform, CloudFormation, and CI/CD',
        estimatedHours: 45,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['microservices-architecture'],
        testId: 'infrastructure-as-code',
        resources: [
          {
            id: 'terraform-guide',
            title: 'HashiCorp Learn - Terraform Complete Guide',
            type: 'documentation',
            url: 'https://learn.hashicorp.com/terraform',
            duration: '25 hours'
          },
          {
            id: 'cloudformation-tutorial',
            title: 'AWS CloudFormation Official Documentation',
            type: 'course',
            url: 'https://docs.aws.amazon.com/cloudformation/',
            duration: '15 hours'
          },
          {
            id: 'cicd-pipelines',
            title: 'AWS DevOps - CI/CD Pipeline Best Practices',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=YQnVp6XjqiI',
            duration: '5 hours'
          }
        ]
      },
      {
        id: 'cloud-monitoring',
        title: 'Cloud Monitoring & Optimization',
        description: 'Implement monitoring, logging, and cost optimization strategies',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['infrastructure-as-code'],
        testId: 'cloud-monitoring',
        resources: [
          {
            id: 'cloudwatch-monitoring',
            title: 'AWS CloudWatch Official Documentation',
            type: 'documentation',
            url: 'https://docs.aws.amazon.com/cloudwatch/',
            duration: '18 hours'
          },
          {
            id: 'cost-optimization',
            title: 'AWS Cost Management & Optimization Guide',
            type: 'course',
            url: 'https://aws.amazon.com/aws-cost-management/',
            duration: '12 hours'
          },
          {
            id: 'observability-stack',
            title: 'Elastic Official - Complete ELK Stack Tutorial',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=gS_nHTWZEJ8',
            duration: '10 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'product-management',
    title: 'Product Management & Strategy',
    description: 'Learn product lifecycle, user research, analytics, and go-to-market strategies',
    category: 'Product',
    difficulty: 'Intermediate',
    estimatedDuration: '12-16 weeks',
    completedComponents: 0,
    icon: '📊',
    color: 'from-orange-500 to-red-500',
    components: [
      {
        id: 'product-strategy',
        title: 'Product Strategy & Vision',
        description: 'Define product vision, strategy, and roadmap planning',
        estimatedHours: 35,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'product-strategy',
        resources: [
          {
            id: 'product-management-intro',
            title: 'Google Product Management Certificate (Coursera)',
            type: 'course',
            url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce',
            duration: '15 hours'
          },
          {
            id: 'product-vision',
            title: 'Product School - Product Vision & Strategy',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=3BwjuQTA4Mk',
            duration: '3 hours'
          },
          {
            id: 'roadmap-planning',
            title: 'ProductPlan Official Roadmap Guide',
            type: 'article',
            url: 'https://www.productplan.com/learn/product-roadmap/',
            duration: '17 hours'
          }
        ]
      },
      {
        id: 'user-research',
        title: 'User Research & Validation',
        description: 'Conduct user interviews, surveys, and market validation',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['product-strategy'],
        testId: 'user-research',
        resources: [
          {
            id: 'user-interview-guide',
            title: 'Nielsen Norman Group - User Interview Guide',
            type: 'documentation',
            url: 'https://www.nngroup.com/articles/user-interviews/',
            duration: '12 hours'
          },
          {
            id: 'survey-design',
            title: 'Stanford HCI Group - Survey Design Course',
            type: 'course',
            url: 'https://hci.stanford.edu/courses/cs147/2019/assignments/assignment5.html',
            duration: '15 hours'
          },
          {
            id: 'market-validation',
            title: 'Lean Startup - Customer Development',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=yP176MBG9Tk',
            duration: '13 hours'
          }
        ]
      },
      {
        id: 'product-analytics',
        title: 'Product Analytics & Metrics',
        description: 'Define KPIs, analyze user behavior, and measure product success',
        estimatedHours: 45,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['user-research'],
        testId: 'product-analytics',
        resources: [
          {
            id: 'google-analytics',
            title: 'Google Analytics Academy - Complete Course',
            type: 'course',
            url: 'https://analytics.google.com/analytics/academy/',
            duration: '20 hours'
          },
          {
            id: 'product-metrics',
            title: 'Amplitude - Product Metrics Framework',
            type: 'documentation',
            url: 'https://amplitude.com/blog/product-metrics',
            duration: '15 hours'
          },
          {
            id: 'ab-testing',
            title: 'Google Optimize - A/B Testing Mastery',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=5ABpbVSIeQ8',
            duration: '10 hours'
          }
        ]
      },
      {
        id: 'agile-development',
        title: 'Agile Development & Collaboration',
        description: 'Work with engineering teams using Agile methodologies',
        estimatedHours: 30,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['product-analytics'],
        testId: 'agile-development',
        resources: [
          {
            id: 'scrum-guide',
            title: 'Official Scrum Guide 2020 (scrum.org)',
            type: 'documentation',
            url: 'https://www.scrum.org/resources/scrum-guide',
            duration: '8 hours'
          },
          {
            id: 'agile-tools',
            title: 'Atlassian Agile Coach - Complete Guide',
            type: 'course',
            url: 'https://www.atlassian.com/agile',
            duration: '12 hours'
          },
          {
            id: 'stakeholder-management',
            title: 'Harvard Business Review - Stakeholder Management',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=tbn6hJ2TQM0',
            duration: '10 hours'
          }
        ]
      },
      {
        id: 'go-to-market',
        title: 'Go-to-Market Strategy',
        description: 'Plan product launches, pricing, and marketing strategies',
        estimatedHours: 35,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['agile-development'],
        testId: 'go-to-market',
        resources: [
          {
            id: 'gtm-strategy',
            title: 'HubSpot Academy - Go-to-Market Strategy',
            type: 'article',
            url: 'https://blog.hubspot.com/marketing/go-to-market-strategy',
            duration: '15 hours'
          },
          {
            id: 'product-pricing',
            title: 'Price Intelligently - SaaS Pricing Guide',
            type: 'course',
            url: 'https://www.priceintelligently.com/blog/pricing-strategy',
            duration: '12 hours'
          },
          {
            id: 'product-launch',
            title: 'Product Hunt - Product Launch Masterclass',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=02GG-HoeqXw',
            duration: '8 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'qa-automation',
    title: 'QA Automation Testing',
    description: 'Master automated testing frameworks, CI/CD integration, and quality assurance',
    category: 'QA',
    difficulty: 'Intermediate',
    estimatedDuration: '14-18 weeks',
    completedComponents: 0,
    icon: '🧪',
    color: 'from-teal-500 to-green-500',
    components: [
      {
        id: 'testing-fundamentals',
        title: 'Software Testing Fundamentals',
        description: 'Learn testing principles, types, and methodologies',
        estimatedHours: 35,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'testing-fundamentals',
        resources: [
          {
            id: 'istqb-foundation',
            title: 'ISTQB Foundation Level - Official Syllabus',
            type: 'documentation',
            url: 'https://www.istqb.org/certifications/foundation-level',
            duration: '8 hours'
          },
          {
            id: 'testing-types',
            title: 'Guru99 - Software Testing Complete Course',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=E2t5XbWwj7I&list=PLhW3qG5bs-L9LTfxZ5LEBiM1WFfvX05sw',
            duration: '3 hours'
          },
          {
            id: 'test-planning',
            title: 'Software Testing Help - Test Plan Template',
            type: 'course',
            url: 'https://www.softwaretestinghelp.com/test-plan-template/',
            duration: '6 hours'
          },
          {
            id: 'testing-lifecycle',
            title: 'Guru99 - Software Testing Life Cycle Guide',
            type: 'article',
            url: 'https://www.guru99.com/software-testing-life-cycle.html',
            duration: '4 hours'
          }
        ]
      },
      {
        id: 'selenium-automation',
        title: 'Selenium Web Automation',
        description: 'Automate web applications using Selenium WebDriver',
        estimatedHours: 45,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['testing-fundamentals'],
        testId: 'selenium-automation',
        resources: [
          {
            id: 'selenium-docs',
            title: 'Selenium Official Documentation & Guide',
            type: 'documentation',
            url: 'https://selenium-python.readthedocs.io/',
            duration: '25 hours'
          },
          {
            id: 'selenium-java',
            title: 'Test Automation University - Selenium Java',
            type: 'course',
            url: 'https://testautomationu.applitools.com/selenium-webdriver-tutorial-java/',
            duration: '15 hours'
          },
          {
            id: 'page-object-model',
            title: 'Selenium Page Object Model - Guru99',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=MpQMUrF50P8',
            duration: '5 hours'
          }
        ]
      },
      {
        id: 'api-testing',
        title: 'API Testing & REST Assured',
        description: 'Test REST APIs, microservices, and backend services',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['selenium-automation'],
        testId: 'api-testing',
        resources: [
          {
            id: 'postman-tutorial',
            title: 'Postman Learning Center - Complete Guide',
            type: 'course',
            url: 'https://learning.postman.com/docs/getting-started/introduction/',
            duration: '15 hours'
          },
          {
            id: 'rest-assured',
            title: 'REST Assured Official Documentation',
            type: 'documentation',
            url: 'https://rest-assured.io/',
            duration: '18 hours'
          },
          {
            id: 'api-best-practices',
            title: 'Test Automation University - API Testing',
            type: 'video',
            url: 'https://testautomationu.applitools.com/automating-your-api-tests-with-rest-assured/',
            duration: '7 hours'
          }
        ]
      },
      {
        id: 'performance-testing',
        title: 'Performance Testing',
        description: 'Load testing, stress testing, and performance optimization',
        estimatedHours: 35,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['api-testing'],
        testId: 'performance-testing',
        resources: [
          {
            id: 'jmeter-tutorial',
            title: 'Apache JMeter Official User Manual',
            type: 'documentation',
            url: 'https://jmeter.apache.org/usermanual/index.html',
            duration: '20 hours'
          },
          {
            id: 'load-testing',
            title: 'BlazeMeter University - JMeter Course',
            type: 'course',
            url: 'https://www.blazemeter.com/jmeter-tutorial',
            duration: '10 hours'
          },
          {
            id: 'performance-metrics',
            title: 'Test Automation University - Performance Testing',
            type: 'video',
            url: 'https://testautomationu.applitools.com/jmeter-from-the-ground-up/',
            duration: '5 hours'
          }
        ]
      },
      {
        id: 'cicd-testing',
        title: 'CI/CD Integration & DevOps',
        description: 'Integrate automated tests in CI/CD pipelines',
        estimatedHours: 30,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['performance-testing'],
        testId: 'cicd-testing',
        resources: [
          {
            id: 'jenkins-testing',
            title: 'Jenkins Official Pipeline Documentation',
            type: 'documentation',
            url: 'https://www.jenkins.io/doc/book/pipeline/',
            duration: '15 hours'
          },
          {
            id: 'github-actions',
            title: 'GitHub Actions Official Documentation',
            type: 'course',
            url: 'https://docs.github.com/en/actions',
            duration: '10 hours'
          },
          {
            id: 'test-reporting',
            title: 'Test Automation University - CI/CD Testing',
            type: 'video',
            url: 'https://testautomationu.applitools.com/continuous-integration-with-jenkins/',
            duration: '5 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'ux-ui-design',
    title: 'UX/UI Design & Research',
    description: 'Design user-centered digital experiences with modern design tools and methodologies',
    category: 'Design',
    difficulty: 'Beginner',
    estimatedDuration: '12-16 weeks',
    completedComponents: 0,
    icon: '🎨',
    color: 'from-pink-500 to-rose-500',
    components: [
      {
        id: 'design-thinking',
        title: 'Design Thinking & Process',
        description: 'Learn human-centered design process and methodology',
        estimatedHours: 30,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'design-thinking',
        resources: [
          {
            id: 'design-thinking-guide',
            title: 'IDEO Design Thinking Course (Interaction Design Foundation)',
            type: 'course',
            url: 'https://www.interaction-design.org/courses/design-thinking-the-ultimate-guide',
            duration: '15 hours'
          },
          {
            id: 'human-centered-design',
            title: 'Stanford d.school - Human-Centered Design',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=musmgKEPY2o',
            duration: '3 hours'
          },
          {
            id: 'empathy-mapping',
            title: 'Nielsen Norman Group - Empathy Mapping',
            type: 'article',
            url: 'https://www.nngroup.com/articles/empathy-mapping/',
            duration: '12 hours'
          }
        ]
      },
      {
        id: 'ux-research',
        title: 'UX Research & User Testing',
        description: 'Conduct user research, interviews, and usability testing',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['design-thinking'],
        testId: 'ux-research',
        resources: [
          {
            id: 'user-research-methods',
            title: 'Nielsen Norman Group - UX Research Methods',
            type: 'documentation',
            url: 'https://www.nngroup.com/articles/which-ux-research-methods/',
            duration: '20 hours'
          },
          {
            id: 'usability-testing',
            title: 'Google UX Research Certificate (Coursera)',
            type: 'course',
            url: 'https://www.coursera.org/professional-certificates/google-ux-design',
            duration: '15 hours'
          },
          {
            id: 'user-personas',
            title: 'Adobe XD - Creating User Personas',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=GE-FOAqz7D4',
            duration: '5 hours'
          }
        ]
      },
      {
        id: 'ui-design-principles',
        title: 'UI Design Principles',
        description: 'Master visual design, typography, color theory, and layouts',
        estimatedHours: 45,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['ux-research'],
        testId: 'ui-design-principles',
        resources: [
          {
            id: 'visual-design',
            title: 'CalArts - Visual Elements of User Interface Design',
            type: 'course',
            url: 'https://www.coursera.org/learn/visual-elements-user-interface-design',
            duration: '20 hours'
          },
          {
            id: 'typography-guide',
            title: 'Google Material Design - Typography System',
            type: 'documentation',
            url: 'https://material.io/design/typography/the-type-system.html',
            duration: '12 hours'
          },
          {
            id: 'color-theory',
            title: 'Adobe Color Theory Complete Guide',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=_2LLXnUdUIc',
            duration: '13 hours'
          }
        ]
      },
      {
        id: 'design-tools',
        title: 'Design Tools & Prototyping',
        description: 'Master Figma, Adobe XD, and prototyping techniques',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['ui-design-principles'],
        testId: 'design-tools',
        resources: [
          {
            id: 'figma-tutorial',
            title: 'Figma Official Academy - Complete Course',
            type: 'course',
            url: 'https://www.figma.com/resources/learn-design/',
            duration: '20 hours'
          },
          {
            id: 'prototyping-guide',
            title: 'Figma - Interactive Prototyping Masterclass',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=KWZGAExj-es',
            duration: '5 hours'
          },
          {
            id: 'design-systems',
            title: 'Design Systems Handbook (InVision)',
            type: 'documentation',
            url: 'https://www.designsystems.com/getting-started/',
            duration: '15 hours'
          }
        ]
      },
      {
        id: 'responsive-design',
        title: 'Responsive & Accessible Design',
        description: 'Create designs that work across devices and are accessible to all users',
        estimatedHours: 35,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['design-tools'],
        testId: 'responsive-design',
        resources: [
          {
            id: 'responsive-design-guide',
            title: 'Google Web.dev - Responsive Design Basics',
            type: 'documentation',
            url: 'https://web.dev/responsive-web-design-basics/',
            duration: '15 hours'
          },
          {
            id: 'accessibility-design',
            title: 'W3C Web Accessibility Initiative (WAI)',
            type: 'course',
            url: 'https://www.w3.org/WAI/fundamentals/accessibility-intro/',
            duration: '12 hours'
          },
          {
            id: 'mobile-first',
            title: 'Google Developers - Mobile-First Design',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=0ohtVzCSHqs',
            duration: '8 hours'
          }
        ]
      }
    ]
  },
  {
    id: 'iot-embedded',
    title: 'IoT & Embedded Systems',
    description: 'Build connected devices using Arduino, Raspberry Pi, and IoT platforms',
    category: 'IoT',
    difficulty: 'Intermediate',
    estimatedDuration: '16-20 weeks',
    completedComponents: 0,
    icon: '📡',
    color: 'from-indigo-500 to-purple-500',
    components: [
      {
        id: 'electronics-basics',
        title: 'Electronics & Circuit Fundamentals',
        description: 'Learn basic electronics, circuits, and component functions',
        estimatedHours: 40,
        completed: false,
        isLocked: false,
        prerequisiteIds: [],
        testId: 'electronics-basics',
        resources: [
          {
            id: 'electronics-tutorial',
            title: 'All About Circuits - Electronics Textbook',
            type: 'course',
            url: 'https://www.allaboutcircuits.com/textbook/',
            duration: '25 hours'
          },
          {
            id: 'circuit-analysis',
            title: 'MIT OpenCourseWare - Circuit Analysis',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=VV6tZ3Aqfuc',
            duration: '5 hours'
          },
          {
            id: 'component-guide',
            title: 'Electronics Tutorials - Component Reference',
            type: 'documentation',
            url: 'https://www.electronics-tutorials.ws/',
            duration: '10 hours'
          }
        ]
      },
      {
        id: 'arduino-programming',
        title: 'Arduino Programming',
        description: 'Program Arduino microcontrollers and build projects',
        estimatedHours: 45,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['electronics-basics'],
        testId: 'arduino-programming',
        resources: [
          {
            id: 'arduino-tutorial',
            title: 'Arduino Official Programming Guide',
            type: 'documentation',
            url: 'https://www.arduino.cc/en/Tutorial/HomePage',
            duration: '25 hours'
          },
          {
            id: 'arduino-projects',
            title: 'Arduino Project Hub - Official Projects',
            type: 'course',
            url: 'https://create.arduino.cc/projecthub',
            duration: '15 hours'
          },
          {
            id: 'sensors-actuators',
            title: 'Paul McWhorter - Arduino Complete Course',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=fJWR7dBuc18&list=PLGs0VKk2DiYw-L-RibttcvK-WBZm8WLEP',
            duration: '5 hours'
          }
        ]
      },
      {
        id: 'raspberry-pi',
        title: 'Raspberry Pi & Linux',
        description: 'Work with Raspberry Pi, Linux systems, and GPIO programming',
        estimatedHours: 50,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['arduino-programming'],
        testId: 'raspberry-pi',
        resources: [
          {
            id: 'raspberry-pi-guide',
            title: 'Raspberry Pi Foundation Official Documentation',
            type: 'documentation',
            url: 'https://www.raspberrypi.org/documentation/',
            duration: '20 hours'
          },
          {
            id: 'python-gpio',
            title: 'GPIO Zero Official Documentation',
            type: 'course',
            url: 'https://gpiozero.readthedocs.io/',
            duration: '18 hours'
          },
          {
            id: 'linux-embedded',
            title: 'Embedded Linux Complete Course',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=1rYGVz_KPKU&list=PLm-Y96NmnWz-Rpc4NDOebzk1OOdXFfF4D',
            duration: '12 hours'
          }
        ]
      },
      {
        id: 'iot-protocols',
        title: 'IoT Communication Protocols',
        description: 'Learn WiFi, Bluetooth, MQTT, and other IoT communication protocols',
        estimatedHours: 40,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['raspberry-pi'],
        testId: 'iot-protocols',
        resources: [
          {
            id: 'mqtt-tutorial',
            title: 'MQTT.org Official Protocol Guide',
            type: 'documentation',
            url: 'https://mqtt.org/getting-started/',
            duration: '15 hours'
          },
          {
            id: 'wifi-bluetooth',
            title: 'UC San Diego - IoT Communications (Coursera)',
            type: 'course',
            url: 'https://www.coursera.org/learn/iot-communications',
            duration: '18 hours'
          },
          {
            id: 'lorawan-tutorial',
            title: 'The Things Network - LoRaWAN Academy',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=hMOwbNUpDQA',
            duration: '7 hours'
          }
        ]
      },
      {
        id: 'iot-cloud-integration',
        title: 'IoT Cloud Integration',
        description: 'Connect IoT devices to cloud platforms and build dashboards',
        estimatedHours: 35,
        completed: false,
        isLocked: true,
        prerequisiteIds: ['iot-protocols'],
        testId: 'iot-cloud-integration',
        resources: [
          {
            id: 'aws-iot-core',
            title: 'AWS IoT Core Official Developer Guide',
            type: 'documentation',
            url: 'https://docs.aws.amazon.com/iot/',
            duration: '18 hours'
          },
          {
            id: 'azure-iot',
            title: 'Microsoft Azure IoT Hub Documentation',
            type: 'course',
            url: 'https://docs.microsoft.com/en-us/azure/iot-hub/',
            duration: '12 hours'
          },
          {
            id: 'iot-dashboard',
            title: 'AWS IoT Analytics - Building Dashboards',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=JXVLhNMeWSo',
            duration: '5 hours'
          }
        ]
      }
    ]
  }
];
