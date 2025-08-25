# Medcin Platform - Complete API Documentation Index

## 📚 Documentation Overview

This repository contains comprehensive API documentation for the Medcin Platform, a medical education system built with Node.js, Express, TypeScript, and Prisma.

## 📋 Documentation Files

### 1. **API_DOCUMENTATION.md** - Main API Documentation
**Purpose**: Complete API reference with detailed examples
**Contents**:
- Authentication endpoints with examples
- Quiz system (QCM/QCS support, retakes, filtering)
- Exam system (session creation, module-based exams)
- Student management (progress, notes, todos, analytics)
- Admin & content management
- Media & file upload endpoints
- Response formats and error handling

**Key Features Documented**:
- JWT authentication with refresh tokens
- Multiple choice and single choice questions
- Dynamic quiz generation with flexible filtering
- Retake sessions (SAME, INCORRECT_ONLY, CORRECT_ONLY, NOT_RESPONDED)
- Student progress tracking and analytics
- Admin content management
- File upload with multiple media types

### 2. **API_TESTING_GUIDE.md** - Testing Guide
**Purpose**: Comprehensive testing instructions and examples
**Contents**:
- curl command examples for all endpoints
- Postman collection usage instructions
- Authentication flow testing
- Quiz and exam system testing
- Student feature testing
- Admin functionality testing
- Error handling and edge case testing
- Performance testing guidelines

**Testing Scenarios**:
- Complete quiz flow (creation → answers → results → retake)
- Admin content management workflow
- Student progress tracking
- Error handling and validation
- Load testing and performance monitoring

### 3. **API_REFERENCE_SUMMARY.md** - Quick Reference
**Purpose**: Quick lookup table for all endpoints
**Contents**:
- Complete endpoint listing with HTTP methods
- Authentication requirements and role permissions
- Query parameters reference
- Response status codes
- Data types and enums
- File upload specifications
- Rate limiting information

**Quick Access**:
- Endpoint overview table
- Authentication requirements
- Role-based access control
- Common query parameters
- Error codes and meanings

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- SQLite database
- Postman (optional, for collection testing)

### Quick Setup
```bash
# 1. Start the server
cd backend
npm install
npm start

# 2. Seed the database
npm run prisma:seed

# 3. Test the API
curl http://localhost:3005/api/v1/universities
```

### Authentication Quick Start
```bash
# Register a new user
curl -X POST http://localhost:3005/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login and get tokens
curl -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🎯 Key API Features

### 1. **Advanced Quiz System**
- **Multiple Question Types**: Single choice (QCS) and multiple choice (QCM)
- **Dynamic Generation**: Create quizzes with flexible filtering by year, course, module
- **Retake Options**: Four types of retake sessions for targeted practice
- **Real-time Scoring**: Immediate feedback with explanations

### 2. **Comprehensive Exam System**
- **Structured Exams**: Predefined exam sessions with manual question ordering
- **Module Combination**: Create exams from multiple modules
- **Year-based Filtering**: Access historical exam questions by year

### 3. **Student Progress Tracking**
- **Detailed Analytics**: Performance tracking across subjects and time
- **Personal Notes**: Question and quiz-specific note-taking
- **Custom Labels**: Organize content with personal labeling system
- **Todo Management**: Task tracking with priorities and due dates

### 4. **Admin Content Management**
- **User Management**: Complete CRUD operations for users
- **Content Creation**: Quizzes, exams, questions with rich media support
- **Subscription Management**: Handle user subscriptions and payments
- **Report System**: Question quality assurance through user reports

### 5. **Media & File Management**
- **Multiple File Types**: Images, PDFs, logos, explanation graphics
- **Organized Storage**: Type-based file organization
- **Size Validation**: Appropriate limits for different file types
- **Secure Upload**: Role-based upload permissions

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure access and refresh token system
- **Role-based Access**: Three-tier permission system (Student/Employee/Admin)
- **Token Refresh**: Automatic token renewal for seamless experience
- **Password Security**: Bcrypt hashing with secure password policies

### Data Validation
- **Zod Schemas**: Comprehensive input validation
- **Type Safety**: TypeScript for compile-time type checking
- **Sanitization**: Input sanitization to prevent XSS attacks
- **Rate Limiting**: Protection against abuse and DoS attacks

## 📊 Database Schema Highlights

### Core Models
- **Users**: Multi-role system with university and specialty associations
- **Questions**: Support for both single and multiple choice with explanations
- **Quiz Sessions**: Flexible session management with retake capabilities
- **Exams**: Structured examination system with manual ordering
- **Subscriptions**: Payment and access management

### Advanced Features
- **Question Associations**: Link questions to courses and exams
- **Progress Tracking**: Detailed analytics and performance metrics
- **Content Organization**: Hierarchical structure (StudyPack → Unite → Module → Course)
- **User Engagement**: Notes, labels, todos, and reporting system

## 🧪 Testing Resources

### Postman Collections
- **Enhanced_Quiz_System_Tests.postman_collection.json**: Complete test suite
- **Enhanced_Quiz_System_Environment.postman_environment.json**: Environment variables
- Pre-configured requests with automatic token management

### Test Data
- **Seeded Database**: Comprehensive test data including users, content, and questions
- **Sample Quizzes**: Multiple choice and single choice question examples
- **Test Users**: Admin, employee, and student accounts for testing

### Automated Testing
- **Jest Test Suite**: Unit and integration tests
- **API Endpoint Tests**: Comprehensive endpoint coverage
- **Edge Case Testing**: Error handling and validation testing

## 🔧 Development Tools

### Code Quality
- **TypeScript**: Full type safety and IntelliSense support
- **ESLint**: Code linting and style enforcement
- **Prettier**: Consistent code formatting
- **Prisma**: Type-safe database access with migrations

### Development Workflow
- **Hot Reload**: Nodemon for development server
- **Database Migrations**: Prisma migration system
- **Seed Scripts**: Automated test data generation
- **Environment Configuration**: Flexible environment variable management

## 📈 Performance Considerations

### Optimization Features
- **Pagination**: Efficient data loading with configurable limits
- **Caching Headers**: Optimized media file serving
- **Database Indexing**: Strategic indexes for query performance
- **Rate Limiting**: Protection against abuse

### Monitoring
- **Request Logging**: Morgan middleware for request tracking
- **Error Handling**: Comprehensive error logging and reporting
- **Performance Metrics**: Response time and throughput monitoring

## 🤝 API Usage Patterns

### Common Workflows

1. **Student Learning Flow**:
   - Login → Get quiz filters → Create session → Submit answers → View results → Create retake

2. **Admin Content Management**:
   - Login → Create quiz/exam → Upload media → Manage users → Review reports

3. **Progress Tracking**:
   - Complete sessions → View analytics → Create notes → Manage todos

### Best Practices
- Always include proper authentication headers
- Use pagination for large data sets
- Handle errors gracefully with proper status codes
- Validate input data before submission
- Use appropriate HTTP methods for different operations

## 📞 Support & Resources

### Documentation Links
- [Main API Documentation](./API_DOCUMENTATION.md)
- [Testing Guide](./API_TESTING_GUIDE.md)
- [Quick Reference](./API_REFERENCE_SUMMARY.md)

### Additional Resources
- [Enhanced Quiz System Docs](./ENHANCED_QUIZ_SYSTEM_DOCS.md)
- [Multiple Choice API Guide](./MULTIPLE_CHOICE_API_GUIDE.md)
- [Postman Testing Guide](./POSTMAN_TESTING_GUIDE.md)

### Development Setup
- Database schema: `backend/prisma/schema.prisma`
- Environment configuration: `backend/.env`
- Test scripts: `backend/package.json`

---

**Last Updated**: January 2024  
**API Version**: v1  
**Base URL**: `http://localhost:3005/api/v1`
