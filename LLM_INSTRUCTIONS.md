
# Career Roadmap Website - LLM Recreation Instructions

## Project Overview

**Project Name**: SkillPath - Career Roadmap Platform  
**Project Type**: Educational Technology Platform  
**Description**: A modern career roadmap website that enables individuals to upskill themselves by following curated learning roadmaps from foundational to mastery levels. Upon completing roadmaps, users receive tailored career options and job opportunities based on acquired skills.

## Core Features

### 1. Landing Page
- Modern, engaging hero section with gradient background
- Animated elements and smooth scrolling
- Statistics display (50+ Learning Components, 5+ Career Roadmaps, 100% Free Resources)
- Call-to-action buttons for navigation

### 2. Roadmaps Section
- Grid-based display of available learning roadmaps
- Category filtering system
- Interactive roadmap cards with:
  - Progress tracking with visual progress bars
  - Difficulty badges (Beginner/Intermediate/Advanced)
  - Estimated duration display
  - Component count information
  - Gradient-styled action buttons

### 3. Detailed Roadmap Pages
- Individual pages for each roadmap with comprehensive information
- Component-based learning structure
- Progress tracking mechanism
- Resource links integration

### 4. Career Options
- Job profiles and opportunities based on completed roadmaps
- Salary information and required skills display
- Company listings for each career option

### 5. Navigation System
- Fixed navigation bar with backdrop blur effect
- Responsive design for mobile and desktop
- Active route highlighting
- Brand identity with logo and gradient text

## Technical Stack

### Frontend Framework
- **React 18.3.1** with TypeScript
- **Vite** as build tool and development server
- **React Router DOM 6.26.2** for client-side routing

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **Shadcn/UI** component library for consistent design system
- **Lucide React 0.462.0** for iconography
- **Class Variance Authority** for component variants
- **Tailwind Animate** for animations

### State Management & Data Fetching
- **TanStack React Query 5.56.2** for server state management
- Local state with React hooks

### Additional Libraries
- **Recharts 2.12.7** for data visualization
- **React Hook Form 7.53.0** with Zod validation
- **Sonner** for toast notifications
- **Date-fns** for date manipulation

## Project Structure

```
src/
├── components/
│   ├── ui/           # Shadcn UI components
│   ├── Hero.tsx      # Landing page hero section
│   ├── Navigation.tsx # Main navigation component
│   ├── RoadmapCard.tsx # Individual roadmap card
│   └── RoadmapsSection.tsx # Roadmaps grid section
├── pages/
│   ├── Index.tsx     # Landing page
│   ├── RoadmapDetail.tsx # Individual roadmap page
│   ├── Careers.tsx   # Career opportunities page
│   └── NotFound.tsx  # 404 error page
├── data/
│   ├── roadmaps.ts   # Mock roadmap data
│   └── careers.ts    # Mock career data
├── types/
│   └── index.ts      # TypeScript type definitions
├── hooks/
│   └── use-toast.ts  # Toast notification hook
└── lib/
    └── utils.ts      # Utility functions
```

## Data Models

### Roadmap Interface
```typescript
interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  components: RoadmapComponent[];
  completedComponents: number;
  icon: string;
  color: string;
}
```

### RoadmapComponent Interface
```typescript
interface RoadmapComponent {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  resources: Resource[];
  completed: boolean;
}
```

### Career Option Interface
```typescript
interface CareerOption {
  id: string;
  title: string;
  description: string;
  averageSalary: string;
  requiredSkills: string[];
  roadmapIds: string[];
  companies: string[];
}
```

## Mock Data Requirements

### Roadmaps Data
Include 6+ roadmaps covering:
- Frontend Development (React, JavaScript fundamentals)
- Backend Development (Node.js, APIs)
- Data Science (Python, Machine Learning)
- DevOps (Cloud, Docker, CI/CD)
- Mobile Development (React Native)
- UI/UX Design

### Career Data
Include 8+ career options with:
- Software Engineer roles
- Data Scientist positions
- DevOps Engineer roles
- Product Manager positions
- UI/UX Designer roles

## Design System

### Color Palette
- Primary gradients: Blue to Purple (`from-blue-600 to-purple-600`)
- Background gradients: Slate to Purple (`from-slate-900 via-purple-900 to-slate-900`)
- Difficulty colors:
  - Beginner: Green (`bg-green-100 text-green-800`)
  - Intermediate: Yellow (`bg-yellow-100 text-yellow-800`)
  - Advanced: Red (`bg-red-100 text-red-800`)

### Typography
- Primary font: System fonts with Tailwind defaults
- Gradient text effects for headings
- Consistent font weights and sizes

### Component Styling
- Backdrop blur effects for navigation
- Card-based layouts with hover animations
- Smooth transitions and transforms
- Responsive grid systems

## Routing Configuration

```typescript
Routes:
- "/" - Landing page (Index component)
- "/roadmaps" - Redirects to landing page
- "/roadmap/:id" - Individual roadmap detail page
- "/careers" - Career opportunities page
- "*" - 404 Not Found page
```

## Key Implementation Details

### Progress Tracking
- Visual progress bars showing completion percentage
- Component-level completion tracking
- Persistent progress state (mock implementation)

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Grid layouts that adapt to screen sizes
- Touch-friendly interactions

### Performance Considerations
- Component lazy loading where applicable
- Optimized re-renders with React Query
- Efficient state management

## Setup Instructions

1. **Initialize Vite React TypeScript project**
2. **Install dependencies** (see package.json for exact versions)
3. **Configure Tailwind CSS** with custom theme extensions
4. **Set up Shadcn/UI** components
5. **Implement routing** with React Router DOM
6. **Create mock data files** with realistic content
7. **Build components** following the structure above
8. **Style with Tailwind** using the design system
9. **Test responsive behavior** across devices

## Future Enhancements (Out of Scope)
- Backend integration with Supabase
- User authentication system
- Real progress persistence
- Payment integration for premium content
- Mobile application version
- Advanced analytics features
- External job platform integration

## Notes for LLM Recreation
- Focus on visual design and user experience
- Ensure all TypeScript interfaces are properly implemented
- Use consistent naming conventions throughout
- Implement proper error boundaries and loading states
- Follow React best practices for performance
- Maintain accessibility standards
- Test all navigation flows and interactions
