# MyDeepTech Codebase Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Project Structure](#project-structure)
4. [Key Features & Modules](#key-features--modules)
5. [Authentication System](#authentication-system)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Routing & Navigation](#routing--navigation)
9. [UI Components](#ui-components)
10. [Development Setup](#development-setup)
11. [Build & Deployment](#build--deployment)
12. [Key Configurations](#key-configurations)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)

---

## Overview

**MyDeepTech** is a comprehensive talent acquisition and annotation platform that connects businesses with skilled annotators for AI/ML data processing tasks. The platform facilitates project management, user assessment, payment processing, and real-time communication between administrators and annotators.

### Core Purpose
- **For Administrators**: Manage annotation projects, assess annotator skills, handle payments, and oversee platform operations
- **For Annotators**: Discover and apply to projects, take skill assessments, track earnings, and communicate with project managers
- **For the Platform**: Provide a seamless marketplace for AI/ML data annotation work

---

## Tech Stack & Architecture

### Frontend Framework
- **React 18.3.1** with **TypeScript 5.6.2**
- **Vite 5.4.10** as build tool and dev server
- **React Router DOM 6.28.0** for client-side routing

### UI & Styling
- **Ant Design 5.22.1** - Primary component library
- **TailwindCSS 3.4.15** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Animation library
- **Lucide React 0.460.0** - Icon library

### State Management
- **React Context API** - User context management
- **TanStack React Query 5.61.0** - Server state management
- **Local component state** with hooks

### Data Visualization
- **Recharts 2.15.4** - Chart and analytics components
- **CountUp.js 2.9.0** - Animated counters

### Communication & Real-time
- **Socket.io Client 4.8.1** - WebSocket communication
- **Axios 1.7.7** - HTTP client
- **Chat system** - Built-in customer service

### Media & File Handling
- **React Player 2.16.0** - Video player component
- **HTML2Canvas 1.4.1** & **jsPDF 3.0.4** - PDF generation
- **React PDF Viewer** - PDF viewing capabilities

### Development Tools
- **ESLint 9.13.0** - Code linting
- **TypeScript ESLint 8.11.0** - TypeScript linting
- **PostCSS 8.4.49** - CSS processing

### Security & Encryption
- **Crypto-js 4.2.0** - Data encryption
- **JWT Token** authentication
- **Session storage** for secure data persistence

---

## Project Structure

```
mydeeptech/
├── public/                          # Static assets
│   └── videos/                      # Video files
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── Admin/                   # Admin-specific components
│   │   ├── Assessment/              # Assessment system components
│   │   ├── AuthCard/                # Authentication UI components
│   │   ├── Chat/                    # Chat system components
│   │   ├── Dashboard/               # Dashboard components
│   │   ├── Modal/                   # Modal components
│   │   ├── ui/                      # Base UI components
│   │   └── ...
│   ├── pages/                       # Page-level components
│   │   ├── Auth/                    # Authentication pages
│   │   ├── Dashboard/               # Dashboard pages
│   │   │   ├── Admin/              # Admin dashboard pages
│   │   │   └── User/               # User dashboard pages
│   │   ├── Projects/               # Project-related pages
│   │   └── ...
│   ├── hooks/                       # Custom React hooks
│   │   ├── Auth/                   # Authentication hooks
│   │   ├── Assessment/             # Assessment hooks
│   │   └── ...
│   ├── service/                     # API services
│   │   ├── axiosApi.ts             # Axios configuration
│   │   ├── apiUtils.ts             # API utilities
│   │   └── PasswordResetService.ts  # Password reset service
│   ├── store/                       # State management
│   │   └── api/
│   │       └── endpoints.ts         # API endpoints configuration
│   ├── types/                       # TypeScript type definitions
│   ├── utils/                       # Utility functions
│   ├── assets/                      # Static assets (fonts, images)
│   ├── data/                        # Static data files
│   ├── constants.ts                 # Application constants
│   ├── encryption.ts                # Encryption utilities
│   ├── helpers.ts                   # Helper functions
│   ├── UserContext.tsx              # User context provider
│   ├── App.tsx                      # Main application component
│   └── main.tsx                     # Application entry point
├── tailwind.config.ts               # TailwindCSS configuration
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
└── README.md                        # Project documentation
```

---

## Key Features & Modules

### 1. User Management System
- **Dual Authentication**: Separate login systems for administrators and annotators (DTUsers)
- **Role-based Access Control**: Admin, QA Reviewer, and Annotator roles
- **Profile Management**: Complete user profiles with skills, experience, and preferences
- **Status Tracking**: Annotator approval status, email verification, and onboarding progress

### 2. Project Management System
- **Project Creation**: Admins can create detailed annotation projects with specifications
- **Application Management**: Users apply to projects; admins approve/reject applications
- **Project Categories**: Text, Image, Audio, Video annotation, and more
- **Payment Management**: Configurable pay rates and payment structures
- **Project Tracking**: Status monitoring and progress tracking

### 3. Assessment System
- **Multimedia Assessment**: Video-based assessments for skill evaluation
- **English Proficiency Tests**: Language skill assessments
- **QA Review System**: Quality assurance review workflow
- **Assessment History**: Track user assessment attempts and results
- **Scoring System**: Comprehensive evaluation metrics

### 4. Communication System
- **Real-time Chat**: Socket.io-based chat system
- **Customer Service**: Integrated customer support chat
- **Notification System**: Real-time notifications for users and admins
- **Email Integration**: Automated email notifications for various events

### 5. Payment & Invoicing
- **Invoice Management**: Generate and manage payment invoices
- **Receipt System**: Payment receipt generation and tracking
- **Payout Management**: Handle payments to annotators
- **Financial Analytics**: Revenue tracking and financial reporting

### 6. Dashboard & Analytics
- **Admin Dashboard**: Comprehensive admin overview with metrics
- **User Dashboard**: Personalized user experience with project status
- **Analytics**: Charts and visualizations for data insights
- **Reporting**: Detailed reports on platform performance

---

## Authentication System

### Architecture
The platform uses a sophisticated dual authentication system:

#### 1. DTUser Authentication (Annotators)
```typescript
// Login endpoint
POST /auth/dtUserLogin

// User registration
POST /auth/createDTuser

// Email verification
GET /auth/verifyDTusermail/:id

// Password reset
POST /auth/dtuser-forgot-password
POST /auth/dtuser-reset-password
```

#### 2. Admin Authentication
```typescript
// Admin login
POST /admin/login

// Admin registration (invitation-based)
POST /admin/create

// OTP verification
POST /admin/verify-otp
```

### User Context Management
```typescript
// UserContext.tsx
export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  domains: string[];
  annotatorStatus: string;
  microTaskerStatus: string;
  qaStatus: string;
  // ... other fields
}

// Usage in components
const { userInfo, setUserInfo } = useUserContext();
```

### Security Implementation
- **JWT Tokens**: Secure authentication with Bearer tokens
- **Encrypted Storage**: User data and tokens encrypted using crypto-js
- **Session Management**: Automatic token refresh and session handling
- **Route Protection**: Protected routes based on authentication status

---

## State Management

### 1. User Context (Global State)
```typescript
// UserContext provides global user state
const UserContext = createContext<{
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
}>({
  userInfo: defaultUserInfo,
  setUserInfo: () => {},
});
```

### 2. React Query (Server State)
```typescript
// Used for caching and synchronizing server state
import { useQuery, useMutation } from '@tanstack/react-query';

// Example usage in hooks
const { data, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
});
```

### 3. Local Component State
- Individual components manage their own state using `useState` and `useReducer`
- Form state managed by Ant Design Form components
- Modal and UI state handled locally

---

## API Integration

### Base Configuration
```typescript
// axiosApi.ts
const axiosInstance = axios.create({
  baseURL: baseURL, // from environment variables
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Automatic token injection
axiosInstance.interceptors.request.use(async (config) => {
  const token = await retrieveTokenFromStorage();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Endpoints Structure
```typescript
// endpoints.ts
export const endpoints = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
  },
  authDT: {
    createDTUser: "/auth/createDTuser",
    loginDTUser: "/auth/dtUserLogin",
    // ... more DTUser endpoints
  },
  adminAuth: {
    signup: "/admin/create",
    login: "/admin/login",
  },
  project: {
    createProject: "/auth/createProject",
    getProject: "/auth/getProject",
    // ... more project endpoints
  },
  // ... other endpoint groups
};
```

### Custom Hooks Pattern
```typescript
// Example: useAdminProjects.ts
export const useAdminProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const createProject = useCallback(async (projectData: CreateProjectForm) => {
    setLoading(true);
    try {
      const response = await apiPost(endpoints.adminProject.createProject, projectData);
      // Handle response
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  return { createProject, loading, error, projects };
};
```

---

## Routing & Navigation

### Route Structure
```typescript
// App.tsx - Main routing configuration
<Router>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignupPage />} />
    
    {/* Protected User Dashboard */}
    <Route path="/dashboard" element={<Dashboard />}>
      <Route path="overview" element={<Welcome />} />
      <Route path="projects" element={<Projects />} />
      <Route path="assessment" element={<Assessment />} />
      // ... more user routes
    </Route>

    {/* Admin Dashboard */}
    <Route path="/admin" element={<AdminLayout />}>
      <Route path="overview" element={<AdminOverview />} />
      <Route path="projects" element={<ProjectManagement />} />
      <Route path="users" element={<UserManagement />} />
      // ... more admin routes
    </Route>
  </Routes>
</Router>
```

### Navigation Logic
- **Role-based Navigation**: Routes determined by user role and authentication status
- **Protected Routes**: Authentication-required routes with automatic redirects
- **Dynamic Navigation**: Menu items change based on user permissions

---

## UI Components

### Component Architecture
1. **Base Components** (`src/components/ui/`)
   - Reusable, generic UI components
   - Button, Modal, Input variations

2. **Feature Components** (`src/components/`)
   - Domain-specific components
   - Assessment, Chat, Dashboard components

3. **Page Components** (`src/pages/`)
   - Full page implementations
   - Compose multiple components together

### Key UI Libraries Integration

#### Ant Design
```typescript
// Primary component library for complex UI elements
import { Button, Modal, Form, Table, Card } from 'antd';

// Custom theming through CSS and component props
const customButton = (
  <Button type="primary" size="large" className="custom-button">
    Submit
  </Button>
);
```

#### TailwindCSS
```typescript
// Utility-first styling approach
const className = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
```

#### Framer Motion
```typescript
// Animation and transitions
import { motion } from 'framer-motion';

const AnimatedComponent = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    Content
  </motion.div>
);
```

---

## Development Setup

### Prerequisites
- **Node.js**: Version 18+ recommended
- **npm** or **yarn**: Package manager
- **Git**: Version control

### Installation Steps
```bash
# 1. Clone the repository
git clone <repository-url>
cd mydeeptech

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npm run dev

# 5. Access the application
# Open http://localhost:5173 in your browser
```

### Environment Variables
```env
# .env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
# Add other required environment variables
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "vite",              // Start dev server
    "build": "tsc -b && vite build", // Production build
    "lint": "eslint .",         // Run linting
    "preview": "vite preview"   // Preview production build
  }
}
```

---

## Build & Deployment

### Production Build
```bash
# 1. Build the application
npm run build

# 2. Build output location
dist/

# 3. Preview build locally
npm run preview
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Deployment Considerations
- **Environment Variables**: Set production environment variables
- **API Base URL**: Update VITE_API_URL for production API
- **Static Assets**: Ensure all assets are properly bundled
- **HTTPS**: Ensure secure connections in production

---

## Key Configurations

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### TailwindCSS Configuration
```typescript
// tailwind.config.ts
const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4CAF50",
          hover: "#45A049",
        },
        secondary: {
          DEFAULT: "#2196F3",
          hover: "#1976D2",
        },
        // ... more custom colors
      },
    },
  },
  plugins: [],
};
```

### ESLint Configuration
```javascript
// eslint.config.js
export default [
  // ESLint configuration for React/TypeScript
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: reactHooks,
    },
    // ... more configuration
  }
];
```

---

## Best Practices

### 1. Code Organization
- **Feature-based Structure**: Organize code by features rather than file types
- **Consistent Naming**: Use consistent naming conventions for files and components
- **TypeScript Usage**: Leverage TypeScript for type safety and better development experience

### 2. Component Design
- **Single Responsibility**: Each component should have a single, well-defined purpose
- **Prop Interfaces**: Define clear TypeScript interfaces for all component props
- **Custom Hooks**: Extract reusable logic into custom hooks

### 3. State Management
- **Minimize State**: Keep state as minimal and close to where it's used
- **Context Usage**: Use Context for truly global state, avoid prop drilling
- **Server State**: Use React Query for server state management

### 4. API Integration
- **Error Handling**: Implement comprehensive error handling for all API calls
- **Loading States**: Provide appropriate loading states for better UX
- **Caching**: Implement proper caching strategies for API responses

### 5. Security
- **Input Validation**: Validate all user inputs on the client side
- **Token Management**: Secure token storage and automatic refresh
- **Route Protection**: Implement proper route guards for protected pages

---

## Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Type checking issues
npm run build
# Fix TypeScript errors in the output

# Dependency conflicts
rm -rf node_modules package-lock.json
npm install
```

#### 2. Development Server Issues
```bash
# Port already in use
lsof -ti:5173 | xargs kill -9

# Clear cache
rm -rf .vite
npm run dev
```

#### 3. Authentication Issues
- Check token expiration
- Verify API endpoint configuration
- Ensure proper CORS setup on backend

#### 4. API Connection Issues
- Verify VITE_API_URL in environment variables
- Check network connectivity
- Verify backend server status

### Debugging Tips
1. **Console Logging**: Use browser developer tools for debugging
2. **React Developer Tools**: Install React DevTools extension
3. **Network Tab**: Monitor API calls in browser developer tools
4. **Error Boundaries**: Implement error boundaries for better error handling

---

## Conclusion

This MyDeepTech platform is a sophisticated React/TypeScript application that provides a comprehensive solution for AI/ML annotation project management. The codebase follows modern development practices with a clean architecture, type safety, and robust error handling.

### Key Strengths
- **Modular Architecture**: Well-organized, feature-based code structure
- **Type Safety**: Comprehensive TypeScript implementation
- **Modern Stack**: Latest React and ecosystem tools
- **Security**: Proper authentication and data encryption
- **User Experience**: Polished UI with animations and responsive design

### Areas for New Developers
1. **Start with Authentication**: Understand the dual auth system first
2. **Explore User Context**: Learn how global state is managed
3. **Study API Integration**: Understand the custom hooks pattern
4. **Component Structure**: Familiarize with the component hierarchy
5. **Routing System**: Understand the role-based navigation logic

This documentation should provide a comprehensive understanding of the codebase for new developers joining the project.