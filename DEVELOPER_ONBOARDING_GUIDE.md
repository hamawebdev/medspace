# BizKwik/MedCortex Developer Onboarding Guide

## 📋 Project Overview

**BizKwik** (branded as **MedCortex**) is a comprehensive medical education platform built with modern web technologies. The platform provides AI-powered personalized learning, quiz/exam systems, progress tracking, and collaborative study tools for medical students.

### Key Information
- **Project Name**: BizKwik (Frontend) / MedCortex (Brand)
- **Type**: Medical Education Platform
- **Architecture**: Next.js Frontend + Node.js/Express Backend
- **Target Users**: Medical students, administrators, employees
- **Current Status**: Active development with core features implemented

## 🏗️ Architecture Overview

### Frontend Architecture
```
Next.js 15.3.3 (App Router)
├── Authentication & Authorization (JWT-based)
├── Role-based routing (Student/Admin/Employee)
├── Component-based UI (shadcn/ui + Radix UI)
├── State Management (Zustand + React Query)
├── API Integration (Axios + Custom API Client)
└── Responsive Design (Tailwind CSS)
```

### Backend Integration
- **API Base**: External Node.js/Express backend
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with refresh mechanism
- **File Upload**: Multipart form data support
- **Testing**: Comprehensive API test suite

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15.3.3** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling framework

### UI Components & Design
- **shadcn/ui** - Component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animations
- **next-themes** - Dark/light mode

### State Management & Data
- **Zustand** - Global state management
- **TanStack React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Stagewise Toolbar** - Development debugging
- **TypeScript** - Static type checking

## 📁 Project Structure

```
BizKwik-main/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   ├── admin/             # Admin dashboard & management
│   │   ├── student/           # Student learning interface
│   │   ├── employee/          # Employee management interface
│   │   ├── quiz/              # Quiz session interface
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components (shadcn)
│   │   ├── auth/             # Authentication components
│   │   ├── student/          # Student-specific components
│   │   ├── admin/            # Admin-specific components
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── api-client.ts     # HTTP client configuration
│   │   ├── api-services.ts   # API service methods
│   │   └── auth.ts           # Authentication utilities
│   ├── types/                # TypeScript type definitions
│   ├── context/              # React context providers
│   └── utils/                # Helper functions
├── docs/                     # API documentation
├── public/                   # Static assets
└── package.json              # Dependencies & scripts
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js 18+** and npm
- **Git** for version control
- **Code Editor** (VS Code recommended)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd BizKwik-main
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
   # Add other environment variables as needed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001 (separate repository)

### Development Scripts
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test:api     # Run API integration tests
```

## 🔐 Authentication System

### User Roles
- **STUDENT**: Access to learning content, quizzes, progress tracking
- **ADMIN**: Full system administration and content management
- **EMPLOYEE**: Content creation and user management

### Authentication Flow
1. User registers/logs in via `/auth/login` or `/auth/register`
2. Backend returns JWT access token and refresh token
3. Frontend stores tokens and user profile
4. API requests include Bearer token in Authorization header
5. Role-based route protection via AuthGuard components

### Route Protection
```typescript
// Example protected route
<AuthGuard requiredRole="STUDENT">
  <StudentDashboard />
</AuthGuard>
```

## 📊 Current Implementation Status

### ✅ Fully Implemented Features

#### Authentication & User Management
- User registration and login
- JWT token management with refresh
- Role-based access control
- Profile management and settings
- Email verification system

#### Student Features
- **Dashboard**: Performance overview, recent activity, progress tracking
- **Quiz System**: Practice mode with question types (QCM/QCS)
- **Exam System**: Formal assessment mode with multi-module support
- **Progress Tracking**: Course progress, analytics, performance metrics
- **Study Tools**: Notes, labels, todos, bookmarks
- **Session Management**: Quiz/exam session creation and management
- **Question Reports**: Report problematic questions
- **Subscriptions**: Study pack subscriptions and management

#### Admin Features (Partial)
- **Content Management**: Universities, study packs, units, modules, courses
- **Question Import**: Bulk JSON question import with validation
- **Basic User Management**: User CRUD operations (API level)
- **Authentication Guards**: Admin route protection

#### Technical Infrastructure
- **API Integration**: Comprehensive API client with error handling
- **State Management**: Zustand stores and React Query integration
- **UI Components**: Complete shadcn/ui component library
- **Responsive Design**: Mobile-first responsive layouts
- **Testing Suite**: API integration tests and validation
- **Error Handling**: Global error boundaries and user feedback

### ⚠️ Partially Implemented Features

#### Admin Dashboard
- **Status**: API services exist, UI partially implemented
- **Missing**: Dashboard overview, statistics, analytics charts
- **Current**: Redirects to content management page

#### File Upload System
- **Status**: API endpoints exist, UI components missing
- **Missing**: Upload interfaces, file preview, media management
- **Current**: Backend supports image/PDF uploads

#### Quiz/Exam Management (Admin)
- **Status**: API endpoints exist, admin UI missing
- **Missing**: Quiz creation, exam management, question editing
- **Current**: Students can create and take quizzes/exams

### ❌ Missing/Incomplete Features

#### Admin Interface Gaps
- Dashboard overview with statistics and analytics
- User management interface (API exists, UI missing)
- Subscription management interface
- Revenue tracking and analytics
- Question reports management interface
- File upload and media management UI

#### Advanced Student Features
- AI-powered personalized learning paths
- Collaborative study groups
- Advanced analytics and insights
- Mobile app (web-only currently)
- Offline quiz capabilities (partially implemented)

#### System Features
- Real-time notifications
- Advanced search and filtering
- Data export capabilities
- Audit logging interface
- System health monitoring

## 🔧 Development Workflow

### Code Organization
- **Components**: Organized by feature/role (student/, admin/, ui/)
- **Hooks**: Custom hooks for API integration and state management
- **Services**: API service classes for different domains
- **Types**: Comprehensive TypeScript definitions
- **Utils**: Helper functions and utilities

### API Integration Pattern
```typescript
// Example API service usage
const { data, loading, error } = useQuery({
  queryKey: ['dashboard-performance'],
  queryFn: () => StudentService.getDashboardPerformance()
});
```

### Component Development
- Use shadcn/ui components as base
- Follow responsive design principles
- Implement proper loading and error states
- Add TypeScript types for all props
- Include accessibility features

### Testing Strategy
- API integration tests via npm scripts
- Component testing (to be implemented)
- End-to-end testing (to be implemented)
- Manual testing with test accounts

## 📚 Key Resources

### Documentation
- `docs/` - Comprehensive API documentation
- `ADMIN_DASHBOARD_IMPLEMENTATION_PLAN.md` - Admin feature roadmap
- Component README files in respective directories

### Test Accounts
- Admin: admin@medcin.dz / admin123
- Student: Various test accounts available
- Employee: Available via admin creation

### API Testing
```bash
npm run test:api              # Run all API tests
npm run test:api:auth         # Test authentication
npm run test:api:quiz         # Test quiz system
npm run test:admin            # Test admin endpoints
```

## 🎯 Next Steps for New Developers

1. **Familiarize with codebase structure**
2. **Set up development environment**
3. **Review API documentation in docs/ folder**
4. **Run API tests to understand system behavior**
5. **Explore student dashboard and quiz system**
6. **Review admin implementation plan for upcoming work**
7. **Check current issues and feature requests**

## 🤝 Contributing Guidelines

### Code Standards
- Follow TypeScript best practices
- Use existing component patterns
- Maintain responsive design principles
- Add proper error handling
- Include loading states for async operations

### Git Workflow
- Create feature branches from main
- Use descriptive commit messages
- Test changes before committing
- Keep commits focused and atomic

### Pull Request Process
- Ensure all tests pass
- Update documentation if needed
- Request code review
- Address feedback promptly

## 🚨 Known Issues & Limitations

### Current Limitations
- **Admin Dashboard**: Incomplete UI implementation
- **File Uploads**: No frontend interface
- **Mobile Experience**: Optimized but not native app
- **Offline Support**: Limited offline quiz capabilities
- **Real-time Features**: No live notifications or collaboration

### Performance Considerations
- Large quiz sessions may impact performance
- Image loading optimization needed
- API response caching could be improved
- Bundle size optimization opportunities exist

### Security Notes
- JWT tokens stored in localStorage (consider httpOnly cookies)
- File upload validation on frontend only
- Rate limiting handled by backend
- CORS configuration for production deployment needed

## 🔮 Future Roadmap

### Short Term (1-3 months)
- Complete admin dashboard implementation
- Add file upload interfaces
- Implement user management UI
- Enhanced mobile experience
- Performance optimizations

### Medium Term (3-6 months)
- AI-powered learning recommendations
- Real-time collaboration features
- Advanced analytics and reporting
- Mobile app development
- Comprehensive testing suite

### Long Term (6+ months)
- Multi-language support
- Advanced AI tutoring
- Integration with external systems
- Scalability improvements
- Enterprise features

---

**Welcome to the BizKwik/MedCortex development team!** This guide provides the foundation for understanding and contributing to the project. For specific questions or clarifications, refer to the detailed documentation in the `docs/` folder or reach out to the development team.

## 📞 Support & Contact

- **Documentation**: Check `docs/` folder for detailed API documentation
- **Issues**: Report bugs and feature requests through project management system
- **Code Review**: All changes require peer review before merging
- **Questions**: Reach out to senior developers for guidance and clarification

Happy coding! 🚀