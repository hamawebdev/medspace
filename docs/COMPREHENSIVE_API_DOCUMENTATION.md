# Medcin Platform - Comprehensive API Documentation

## Overview

The Medcin Platform is a comprehensive medical education system built with Node.js, Express, TypeScript, and Prisma. This documentation provides a complete reference for all API endpoints.

**Base URL:** `http://localhost:3005/api/v1`

## Quick Reference

### Authentication Required
Most endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Role-Based Access Control
- **STUDENT**: Learning content, quizzes, personal progress
- **EMPLOYEE**: Content creation and management
- **ADMIN**: Full system administration

## API Endpoints Summary

### Health & Public Access
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | System health check | No |
| GET | `/universities` | List all universities | No |
| GET | `/specialties` | List all specialties | No |

### Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | User registration | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/verify-email` | Verify email address | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |
| PUT | `/auth/change-password` | Change password | Yes |

### Quiz System (`/quizzes`, `/quiz-sessions`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/quizzes/quiz-sessions` | Create quiz session | Yes | Student + Subscription |
| GET | `/quizzes/quiz-filters` | Get quiz filter options | Yes | Student + Subscription |
| GET | `/quiz-sessions` | Get user quiz sessions | Yes | Student + Subscription |
| GET | `/quiz-sessions/{id}` | Get quiz session details | Yes | Student + Subscription |
| POST | `/quiz-sessions/{id}/submit-answer` | Submit quiz answers | Yes | Student + Subscription |
| PUT | `/quiz-sessions/{id}/questions/{qId}/answer` | Update single answer | Yes | Student + Subscription |
| POST | `/quiz-sessions/retake` | Create retake session | Yes | Student + Subscription |

### Exam System (`/exams`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/exams/exam-sessions` | Create exam session | Yes | Student + Subscription |
| POST | `/exams/exam-sessions/from-modules` | Create exam from modules | Yes | Student + Subscription |
| GET | `/exams/available` | Get available exams | Yes | Student + Subscription |
| GET | `/exams/by-module/{moduleId}/{year}` | Get exams by module/year | Yes | Student + Subscription |
| GET | `/exams/{id}` | Get exam details | Yes | Student + Subscription |
| GET | `/exams/{id}/questions` | Get exam questions | Yes | Student + Subscription |

### Student Management (`/students`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/students/progress/overview` | Get progress overview | Yes | Student + Subscription |
| PUT | `/students/courses/{id}/progress` | Update course progress | Yes | Student + Subscription |
| GET | `/students/quiz-history` | Get quiz history | Yes | Student + Subscription |
| GET | `/students/session-results` | Get session results (filtered) | Yes | Student + Subscription |
| GET | `/students/available-sessions` | Get available sessions | Yes | Student + Subscription |
| GET | `/students/subscriptions` | Get user subscriptions | Yes | Student |
| GET | `/students/notes` | Get student notes | Yes | Student |
| POST | `/students/notes` | Create note | Yes | Student |
| PUT | `/students/notes/{id}` | Update note | Yes | Student |
| DELETE | `/students/notes/{id}` | Delete note | Yes | Student |
| GET | `/students/questions/{id}/notes` | Get notes for question | Yes | Student |
| GET | `/students/labels` | Get student labels | Yes | Student |
| POST | `/students/labels` | Create label | Yes | Student |
| PUT | `/students/labels/{id}` | Update label | Yes | Student |
| DELETE | `/students/labels/{id}` | Delete label | Yes | Student |
| POST | `/students/quizzes/{qId}/labels/{lId}` | Add label to quiz | Yes | Student |
| POST | `/students/quiz-sessions/{sId}/labels/{lId}` | Add label to session | Yes | Student |
| GET | `/students/todos` | Get todos | Yes | Student |
| POST | `/students/todos` | Create todo | Yes | Student |
| PUT | `/students/todos/{id}` | Update todo | Yes | Student |
| DELETE | `/students/todos/{id}` | Delete todo | Yes | Student |
| PUT | `/students/todos/{id}/complete` | Complete todo | Yes | Student |
| POST | `/students/questions/{id}/report` | Report question issue | Yes | Student |
| GET | `/students/reports` | Get user reports | Yes | Student |
| GET | `/students/reports/{id}` | Get report details | Yes | Student |
| GET | `/students/dashboard/performance` | Get performance analytics | Yes | Student |
| GET | `/students/session-stats` | Get session statistics | Yes | Student + Subscription |

### Content Access (Public/Enhanced)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/study-packs` | Get study packs | Optional |
| GET | `/study-packs/{id}` | Get study pack details | Optional |
| GET | `/courses/{id}/resources` | Get course resources | Yes (Student + Subscription) |

### Admin Dashboard (`/admin`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin/dashboard/stats` | Get dashboard statistics | Yes | Admin |
| GET | `/admin/analytics/users` | Get user analytics | Yes | Admin |

### User Management (`/admin/users`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin/users` | Get all users (filtered) | Yes | Admin |
| GET | `/admin/users/stats` | Get user statistics | Yes | Admin |
| GET | `/admin/users/{id}` | Get user by ID | Yes | Admin |
| POST | `/admin/users` | Create new user | Yes | Admin |
| PUT | `/admin/users/{id}` | Update user | Yes | Admin |
| DELETE | `/admin/users/{id}` | Deactivate user | Yes | Admin |
| POST | `/admin/users/{id}/reset-password` | Reset user password | Yes | Admin |

### Study Pack Management (`/admin/study-packs`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin/study-packs` | Get all study packs | Yes | Admin |
| POST | `/admin/study-packs` | Create study pack | Yes | Admin |
| PUT | `/admin/study-packs/{id}` | Update study pack | Yes | Admin |
| DELETE | `/admin/study-packs/{id}` | Delete study pack | Yes | Admin |

### Content Management (`/admin/content`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/admin/content/unites` | Create unite | Yes | Admin |
| POST | `/admin/content/modules` | Create module | Yes | Admin |
| POST | `/admin/content/courses` | Create course | Yes | Admin/Employee |
| PUT | `/admin/content/unites/{id}` | Update unite | Yes | Admin |
| PUT | `/admin/content/modules/{id}` | Update module | Yes | Admin |
| PUT | `/admin/content/courses/{id}` | Update course | Yes | Admin/Employee |
| DELETE | `/admin/content/unites/{id}` | Delete unite | Yes | Admin |
| DELETE | `/admin/content/modules/{id}` | Delete module | Yes | Admin |
| DELETE | `/admin/content/courses/{id}` | Delete course | Yes | Admin/Employee |
| POST | `/admin/content/resources` | Create course resource | Yes | Admin/Employee |
| PUT | `/admin/content/resources/{id}` | Update course resource | Yes | Admin/Employee |
| DELETE | `/admin/content/resources/{id}` | Delete course resource | Yes | Admin/Employee |

### Quiz Management (`/admin/quizzes`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin/quizzes` | Get all quizzes | Yes | Admin/Employee |
| POST | `/admin/quizzes` | Create quiz with questions | Yes | Admin/Employee |
| PUT | `/admin/quizzes/{id}` | Update quiz | Yes | Admin/Employee |
| DELETE | `/admin/quizzes/{id}` | Delete quiz | Yes | Admin/Employee |

### Exam Management (`/admin/exams`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin/exams` | Get all exams | Yes | Admin/Employee |
| POST | `/admin/exams` | Create exam with questions | Yes | Admin/Employee |

### Question Management (`/admin/questions`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin/questions` | Get all questions | Yes | Admin |
| GET | `/admin/questions/reports` | Get question reports | Yes | Admin/Employee |
| PUT | `/admin/questions/reports/{id}` | Review question report | Yes | Admin/Employee |
| POST | `/admin/questions` | Create question | Yes | Admin/Employee |
| POST | `/admin/questions/bulk` | Create multiple questions | Yes | Admin/Employee |
| PUT | `/admin/questions/{id}/explanation` | Update question explanation | Yes | Admin/Employee |
| GET | `/admin/questions/filters` | Get question filters | Yes | Admin/Employee |
| GET | `/admin/questions/{id}` | Get question by ID | Yes | Admin/Employee |
| POST | `/admin/questions/{id}/images` | Add images to question | Yes | Admin/Employee |
| DELETE | `/admin/questions/{id}/images/{imageId}` | Delete question image | Yes | Admin/Employee |

### Subscription Management (`/admin/subscriptions`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin/subscriptions` | Get all subscriptions | Yes | Admin |
| PUT | `/admin/subscriptions/{id}` | Update subscription | Yes | Admin |
| GET | `/admin/subscriptions/stats` | Get subscription analytics | Yes | Admin |
| POST | `/admin/subscriptions/{id}/cancel` | Cancel subscription | Yes | Admin |
| POST | `/admin/subscriptions/{id}/add-months` | Add months to subscription | Yes | Admin |
| POST | `/admin/subscriptions/{id}/activate` | Activate subscription | Yes | Admin |

### University & Specialty Management (`/admin`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/admin/universities` | Create university | Yes | Admin |
| POST | `/admin/specialties` | Create specialty | Yes | Admin |

### Quiz Source Management (`/admin/quiz-sources`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin/quiz-sources` | Get all quiz sources | Yes | Admin/Employee |
| POST | `/admin/quiz-sources` | Create quiz source | Yes | Admin/Employee |
| GET | `/admin/quiz-sources/{id}` | Get quiz source by ID | Yes | Admin/Employee |
| PUT | `/admin/quiz-sources/{id}` | Update quiz source | Yes | Admin/Employee |
| DELETE | `/admin/quiz-sources/{id}` | Delete quiz source | Yes | Admin/Employee |

### File Upload (`/admin/upload`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/admin/upload/logo` | Upload logo image | Yes | Admin/Employee |
| POST | `/admin/upload/explanation` | Upload explanation images | Yes | Admin/Employee |
| POST | `/admin/upload/pdf` | Upload PDF documents | Yes | Admin/Employee |
| POST | `/admin/upload/study-pack-media` | Upload study pack media | Yes | Admin/Employee |
| POST | `/admin/upload/image` | Upload general images | Yes | Admin/Employee |

### Media Serving (`/media`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/media/{fileType}/{filename}` | Serve media files | No |

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed: field: error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message",
      "code": "validation_code"
    }
  ]
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Pagination

Many endpoints support pagination:

**Query Parameters:**
- `page`: Page number (1-1000, default: 1)
- `limit`: Items per page (1-100, default: 10)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## File Upload Specifications

### File Size Limits
- **Images**: 10MB per file
- **PDFs**: 50MB per file
- **Logos**: 5MB per file
- **Explanations**: 10MB per file

### File Type Restrictions
- **Images**: .jpg, .jpeg, .png, .gif, .webp
- **PDFs**: .pdf only
- **Logos**: .jpg, .jpeg, .png, .svg
- **Explanations**: .jpg, .jpeg, .png, .gif

### Upload Limits per Request
- **General Images**: 10 files
- **PDFs**: 10 files
- **Study Pack Images**: 15 files
- **Study Pack PDFs**: 10 files
- **Explanation Images**: 5 files
- **Logos**: 5 files

## Security Features

- JWT-based authentication
- Role-based access control
- Request validation with Zod schemas
- Rate limiting protection
- CORS enabled
- Helmet security headers
- Input sanitization
- File upload validation

## Notes

1. All timestamps are in ISO 8601 format
2. Subscription checks are enforced for student content access
3. File uploads require multipart/form-data content type
4. Media files are served with appropriate caching headers
5. Question types support both single choice (QCS) and multiple choice (QCM)
6. Retake sessions offer flexible replay options
7. Progress tracking includes detailed analytics and insights
