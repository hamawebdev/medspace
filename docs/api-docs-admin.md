# Admin API Documentation

## Authentication

All admin endpoints require authentication via Bearer token in the Authorization header.

```
Authorization: Bearer <admin_jwt_token>
```

Base URL: `http://localhost:3005/api/v1`

---

## Dashboard & Analytics

### Get Dashboard Statistics
**GET** `/admin/dashboard/stats`

Returns overall platform statistics including user counts, revenue, and recent activity.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 75,
    "activeUsers": 72,
    "totalStudents": 53,
    "totalSubscriptions": 105,
    "activeSubscriptions": 25,
    "totalRevenue": 18520,
    "monthlyRevenue": 18520,
    "totalQuizzes": 107,
    "totalQuestions": 293,
    "totalExams": 52,
    "recentActivity": [...]
  }
}
```

### Get User Analytics
**GET** `/admin/analytics/users`

Returns user growth data and distribution by role and university.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "userGrowth": [...],
    "usersByRole": [...],
    "usersByUniversity": [...]
  }
}
```

---

## User Management

### Get All Users
**GET** `/admin/users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 75,
    "page": 1,
    "limit": 10,
    "totalPages": 8
  }
}
```

### Get User by ID
**GET** `/admin/users/:id`

**Path Parameters:**
- `id` (required): User ID

### Create User
**POST** `/admin/users`

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "STUDENT",
  "password": "password123",
  "currentYear": "ONE"
}
```

### Update User
**PUT** `/admin/users/:id`

**Path Parameters:**
- `id` (required): User ID

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "currentYear": "TWO"
}
```

### Deactivate User
**DELETE** `/admin/users/:id`

**Path Parameters:**
- `id` (required): User ID

### Reset User Password
**POST** `/admin/users/:id/reset-password`

**Path Parameters:**
- `id` (required): User ID

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

---

## Study Pack Management

### Get All Study Packs
**GET** `/admin/study-packs`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### Create Study Pack
**POST** `/admin/study-packs`

**Request Body:**
```json
{
  "name": "First Year Medicine",
  "description": "Complete first year curriculum",
  "type": "YEAR",
  "yearNumber": "ONE",
  "pricePerMonth": 100,
  "pricePerYear": 1000
}
```

### Update Study Pack
**PUT** `/admin/study-packs/:id`

**Path Parameters:**
- `id` (required): Study pack ID

### Delete Study Pack
**DELETE** `/admin/study-packs/:id`

**Path Parameters:**
- `id` (required): Study pack ID

---

## Content Management

### Create Unite
**POST** `/admin/content/unites`

**Request Body:**
```json
{
  "studyPackId": 1,
  "name": "Anatomy",
  "description": "Human anatomy studies"
}
```

### Create Module
**POST** `/admin/content/modules`

**Request Body:**
```json
{
  "uniteId": 1,
  "name": "Cardiovascular System",
  "description": "Heart and blood vessels"
}
```

### Create Course
**POST** `/admin/content/courses`

**Request Body:**
```json
{
  "name": "Cardiac Physiology",
  "description": "Study of heart function",
  "moduleId": 1
}
```

### Update Unite
**PUT** `/admin/content/unites/:id`

### Update Module
**PUT** `/admin/content/modules/:id`

### Update Course
**PUT** `/admin/content/courses/:id`

### Delete Unite
**DELETE** `/admin/content/unites/:id`

### Delete Module
**DELETE** `/admin/content/modules/:id`

### Delete Course
**DELETE** `/admin/content/courses/:id`

---

## Quiz Management

### Get All Quizzes
**GET** `/admin/quizzes`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### Create Quiz
**POST** `/admin/quizzes`

**Request Body:**
```json
{
  "title": "Cardiology Quiz",
  "description": "Test knowledge of heart diseases",
  "type": "QCM",
  "courseId": 1,
  "yearLevel": "THREE",
  "questions": [
    {
      "questionText": "What is the normal heart rate?",
      "questionType": "SINGLE_CHOICE",
      "answers": [
        {"answerText": "60-100 bpm", "isCorrect": true},
        {"answerText": "40-60 bpm", "isCorrect": false}
      ]
    }
  ]
}
```

### Update Quiz
**PUT** `/admin/quizzes/:id`

### Delete Quiz
**DELETE** `/admin/quizzes/:id`

---

## Exam Management

### Get All Exams
**GET** `/admin/exams`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### Create Exam
**POST** `/admin/exams`

**Request Body:**
```json
{
  "title": "Final Cardiology Exam",
  "description": "Comprehensive cardiology assessment",
  "moduleId": 1,
  "universityId": 1,
  "yearLevel": "FOUR",
  "examYear": "2024",
  "year": 2024,
  "questions": [...]
}
```

---

## Question Management

### Get All Questions
**GET** `/admin/questions`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Question Reports
**GET** `/admin/questions/reports`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### Review Question Report
**PUT** `/admin/questions/reports/:id`

**Path Parameters:**
- `id` (required): Report ID

**Request Body:**
```json
{
  "status": "RESOLVED",
  "adminNotes": "Issue has been fixed"
}
```

---

## Subscription Management

### Get All Subscriptions
**GET** `/admin/subscriptions`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### Update Subscription
**PUT** `/admin/subscriptions/:id`

**Path Parameters:**
- `id` (required): Subscription ID

**Request Body:**
```json
{
  "status": "ACTIVE",
  "endDate": "2025-12-31T23:59:59.000Z"
}
```

### Get Subscription Statistics
**GET** `/admin/subscriptions/stats`

### Cancel Subscription
**POST** `/admin/subscriptions/:id/cancel`

**Request Body:**
```json
{
  "reason": "User request"
}
```

### Add Months to Subscription
**POST** `/admin/subscriptions/:id/add-months`

**Request Body:**
```json
{
  "months": 3
}
```

### Activate Subscription
**POST** `/admin/subscriptions/:id/activate`

---

## System Administration

### Get All Universities
**GET** `/admin/universities`

### Create University
**POST** `/admin/universities`

**Request Body:**
```json
{
  "name": "University of Algiers",
  "country": "Algeria"
}
```

### Get All Specialties
**GET** `/admin/specialties`

### Create Specialty
**POST** `/admin/specialties`

**Request Body:**
```json
{
  "name": "Cardiology",
  "description": "Heart and cardiovascular system"
}
```

---

## Question Source Management

### Get All Question Sources
**GET** `/admin/question-sources`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### Create Question Source
**POST** `/admin/question-sources`

**Request Body:**
```json
{
  "name": "Medical Textbooks",
  "description": "Questions from standard medical textbooks"
}
```

### Get Question Source by ID
**GET** `/admin/question-sources/:id`

### Update Question Source
**PUT** `/admin/question-sources/:id`

### Delete Question Source
**DELETE** `/admin/question-sources/:id`

---

## Activation Code Management

### Get All Activation Codes
**GET** `/admin/activation-codes`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### Create Activation Code
**POST** `/admin/activation-codes`

**Request Body:**
```json
{
  "description": "Student access code",
  "durationMonths": 12,
  "maxUses": 100,
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "studyPackIds": [1, 2]
}
```

### Deactivate Activation Code
**PATCH** `/admin/activation-codes/:id/deactivate`

**Path Parameters:**
- `id` (required): Activation code ID

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Validation failed: field is required",
    "timestamp": "2025-09-13T17:00:00.000Z",
    "requestId": "unique-request-id",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Email is required",
          "code": "required"
        }
      ]
    }
  }
}
```

## Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
