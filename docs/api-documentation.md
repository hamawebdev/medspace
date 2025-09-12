# API Documentation - Independent Modules & Content Filters

**Version:** 2.0  
**Last Updated:** August 31, 2025  
**Changes:** Independent modules support, content filters endpoint

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [New API Endpoints](#new-api-endpoints)
3. [Modified Database Schema](#modified-database-schema)
4. [Updated Existing Endpoints](#updated-existing-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Frontend Integration Guide](#frontend-integration-guide)
7. [Error Handling](#error-handling)
8. [Migration Notes](#migration-notes)

---

## 🎯 Overview

This release introduces support for **independent modules** that can exist without being part of a unit, and a new **content filters endpoint** for better content organization. The changes maintain full backward compatibility with existing unit-based modules.

### Key Features Added:
- ✅ Independent modules (modules without units)
- ✅ Content filters API endpoint
- ✅ Enhanced study packs responses
- ✅ Flexible module creation/management
- ✅ **Rotation field support** - All question endpoints now include rotation field (R1, R2, R3, R4)
- ✅ Medical residency rotation-based filtering and display
- ✅ CourseLayer QCM functionality with business logic constraints
- ✅ **Restructured Exam Session Filters** - Question-based filter structure with comprehensive categories
- ✅ **New Question Retrieval Workflow** - Unite/Module-based question retrieval for exam session creation
- ✅ **Session Type Filtering** - Student sessions filters now support PRACTICE/EXAM type filtering
- ✅ **Enhanced Practice Sessions Endpoint** - Unite/Module filtering with session type support
- ✅ **Enhanced Student Content Endpoints** - Notes, Labels, and Courses with Unite/Module filtering
---

## 🆕 Exam Session Creation Workflow

### Overview
A complete workflow for creating custom exam sessions with advanced filtering capabilities based on the Question model structure.

### Workflow Steps

#### Step 1: Get Available Filter Options
**Endpoint:** `GET /api/v1/quizzes/session-filters`

Retrieve all available filter categories based on actual question data:

```bash
curl -X GET http://localhost:3005/api/v1/quizzes/session-filters \
  -H "Authorization: Bearer <JWT_TOKEN>"
```


**Response Structure:**
```json
{
  "success": true,
  "data": {
    "universities": [
      {
        "id": 2,
        "name": "Test University",
        "country": "Algeria",
        "questionCount": 11
      }
    ],
    "questionSources": [
      {
        "id": 1,
        "name": "Official Exams",
        "questionCount": 25
      }
    ],
    "examYears": [
      {
        "year": 2023,
        "questionCount": 15
      }
    ],
    "rotations": [
      {
        "rotation": "R1",
        "questionCount": 8
      }
    ],
    "unites": [
      {
        "id": 5,
        "name": "Advanced Studies - First Year Medicine",
        "questionCount": 5,
        "modules": [
          {
            "id": 12,
            "name": "Anatomy",
            "questionCount": 1
          }
        ]
      }
    ],
    "individualModules": [
      {
        "id": 15,
        "name": "Independent Cardiology",
        "questionCount": 12
      }
    ],
    "totalQuestionCount": 114
  }
}
```

#### Step 2: Retrieve Questions by Unite or Module
**Endpoint:** `GET /api/v1/quizzes/questions-by-unite-or-module`

Retrieve questions filtered by either unite ID or module ID (mutually exclusive):

**By Unite ID:**
```bash
curl -X GET "http://localhost:3005/api/v1/quizzes/questions-by-unite-or-module?uniteId=5" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**By Module ID:**
```bash
curl -X GET "http://localhost:3005/api/v1/quizzes/questions-by-unite-or-module?moduleId=12" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 189,
        "questionText": "Question 175: What is the primary function of the musculoskeletal system?",
        "questionType": "SINGLE_CHOICE",
        "universityId": 7,
        "yearLevel": "FIVE",
        "examYear": 2020,
        "rotation": null,
        "metadata": "{\"difficulty\":\"advanced\",\"topic\":\"musculoskeletal system\"}",
        "sourceId": 6,
        "createdAt": "2025-08-31T11:08:43.363Z",
        "updatedAt": "2025-08-31T11:08:43.363Z",
        "university": {
          "id": 7,
          "name": "University of Tlemcen",
          "country": "Algeria"
        },
        "course": {
          "id": 32,
          "name": "Anatomy - Clinical Applications",
          "module": {
            "id": 12,
            "name": "Anatomy",
            "unite": {
              "id": 5,
              "name": "Advanced Studies - First Year Medicine"
            }
          }
        },
        "source": {
          "id": 6,
          "name": "Practice Question Banks"
        }
      }
    ],
    "totalCount": 5,
    "filterInfo": {
      "uniteId": 5,
      "moduleId": null,
      "uniteName": "Advanced Studies - First Year Medicine",
      "moduleName": "Anatomy"
    }
  },
  "message": "Questions retrieved successfully for Advanced Studies - First Year Medicine"
}
```

#### Step 3: Frontend Filtering 
Apply additional client-side filtering on the retrieved questions based on:
- University (`universityId`)
- Question source (`sourceId`)
- Exam year (`examYear`)
- Rotation (`rotation`)
- Year level (`yearLevel`)
- Question type (`questionType`)

#### Step 4: Create Exam Session
**Endpoint:** `POST /api/v1/quizzes/create-session-by-questions`

Create the exam session using the filtered question IDs:

```bash
curl -X POST http://localhost:3005/api/v1/quizzes/create-session-by-questions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Custom Anatomy Exam",
    "type": "EXAM",
    "questionIds": [189, 190, 191]
  }'
```

### Business Logic

#### Filter Categories:
- **Universities**: All universities that have questions in accessible study packs
- **Question Sources**: All question sources with question counts
- **Exam Years**: All exam years with question counts (sorted descending)
- **Rotations**: Medical residency rotations (R1, R2, R3, R4) with question counts
- **Units**: Hierarchical units containing modules with question counts
- **Individual Modules**: Standalone modules not within units

#### Access Control:
- Users only see questions from their accessible study packs
- Residency users get access to all study packs
- Question counts reflect user's accessible content

#### Validation:
- Cannot specify both `uniteId` and `moduleId` simultaneously
- Must specify either `uniteId` or `moduleId`
- Invalid IDs return appropriate error messages

---

## 🔧 Recent Fixes & Enhancements

### Restructured Exam Session Filters Endpoint

**Issue Addressed:** The `/exam-session-filters` endpoint was returning a complex hierarchical structure based on the Exam model, making it difficult to create flexible question filtering interfaces.

**Solution:** Restructured the endpoint to return filter options based on the Question model structure with flat, categorized filter arrays.

**Endpoint:** `GET /api/v1/quizzes/session-filters`

**Before (Old Structure):**
```json
{
  "success": true,
  "data": {
    "unites": [
      {
        "id": 1,
        "title": "Unit Name",
        "modules": [
          {
            "id": 1,
            "title": "Module Name",
            "universities": [
              {
                "id": 1,
                "name": "University Name",
                "years": [
                  {
                    "year": 2023,
                    "questionSingleCount": 10,
                    "questionMultipleCount": 5,
                    "questionSingleChoiceIds": [1, 2, 3],
                    "questionMultipleChoiceIds": [4, 5]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**After (New Structure):**
```json
{
  "success": true,
  "data": {
    "universities": [
      {
        "id": 2,
        "name": "Test University",
        "country": "Algeria",
        "questionCount": 11
      }
    ],
    "questionSources": [
      {
        "id": 1,
        "name": "Official Exams",
        "questionCount": 25
      }
    ],
    "examYears": [
      {
        "year": 2023,
        "questionCount": 15
      }
    ],
    "rotations": [
      {
        "rotation": "R1",
        "questionCount": 8
      }
    ],
    "unites": [
      {
        "id": 5,
        "name": "Advanced Studies",
        "questionCount": 5,
        "modules": [
          {
            "id": 12,
            "name": "Anatomy",
            "questionCount": 1
          }
        ]
      }
    ],
    "individualModules": [
      {
        "id": 15,
        "name": "Independent Cardiology",
        "questionCount": 12
      }
    ],
    "totalQuestionCount": 114
  }
}
```

**Benefits:**
- ✅ **Simplified Frontend Integration**: Flat filter arrays instead of nested hierarchies
- ✅ **Question-Based Filtering**: All filters based on actual question data
- ✅ **Comprehensive Categories**: Universities, sources, years, rotations, units, and modules
- ✅ **Question Counts**: Each filter option shows available question count
- ✅ **Independent Modules Support**: Separate category for standalone modules
- ✅ **Rotation Support**: Medical residency rotation filtering (R1, R2, R3, R4)
- ✅ **Access Control**: Respects user's accessible study packs

### Session Type Filtering for Student Sessions Filters

**Enhancement Added:** The student sessions filters endpoint now supports filtering session counts by session type (PRACTICE or EXAM).

**Endpoint:** `GET /api/v1/students/sessions/filters`

**New Required Parameter:**
- `sessionType` (required): Must be either "PRACTICE" or "EXAM"

**Before (No Session Type Filtering):**
```bash
GET /api/v1/students/sessions/filters
# Returned mixed session counts (both PRACTICE and EXAM combined)
```

**After (Session Type Filtering):**
```bash
# Get only practice session counts
GET /api/v1/students/sessions/filters?sessionType=PRACTICE

# Get only exam session counts
GET /api/v1/students/sessions/filters?sessionType=EXAM
```

**Response Structure (Unchanged):**
```json
{
  "success": true,
  "data": {
    "unites": [
      {
        "id": 1,
        "name": "Basic Medical Sciences",
        "sessionsCount": 1,
        "modules": [
          {
            "id": 1,
            "name": "Human Anatomy",
            "sessionsCount": 1,
            "courses": [...]
          }
        ]
      }
    ],
    "independentModules": []
  }
}
```

**Key Changes:**
- ✅ **Required Parameter**: `sessionType` parameter is now mandatory
- ✅ **Type Validation**: Only accepts "PRACTICE" or "EXAM" values
- ✅ **Filtered Counts**: Session counts reflect only the specified session type
- ✅ **Database Filtering**: Queries filter by session type at the database level
- ✅ **Error Handling**: Clear error messages for missing or invalid parameters

**Error Responses:**

**Missing sessionType Parameter (400):**
```json
{
  "success": false,
  "error": {
    "message": "sessionType parameter is required. Must be either 'PRACTICE' or 'EXAM'"
  }
}
```

**Invalid sessionType Value (400):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid sessionType. Must be either 'PRACTICE' or 'EXAM'"
  }
}
```

**Usage Examples:**
```bash
# Get practice session counts
curl -X GET "http://localhost:3005/api/v1/students/sessions/filters?sessionType=PRACTICE" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Get exam session counts
curl -X GET "http://localhost:3005/api/v1/students/sessions/filters?sessionType=EXAM" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Business Logic:**
- Session counts are calculated only for the specified session type
- Maintains hierarchical structure (unites → modules → courses)
- Respects user's accessible study packs and subscription status
- Filters by completed sessions only
- Supports both quiz-based sessions and practice sessions with custom questions

### Enhanced Practice Sessions Endpoint with Unite/Module Filtering

**Enhancement Added:** The practice sessions endpoint now supports both unite-based and module-based filtering with session type filtering.

**Endpoint:** `GET /api/v1/students/practise-sessions`

**Required Parameters:**
- `sessionType` (required): Must be either "PRACTICE" or "EXAM"
- `uniteId` OR `moduleId` (mutually exclusive): Filter by unite or module

**Before (Module-only filtering):**
```bash
GET /api/v1/students/practise-sessions/module/:moduleId
# Only supported module-based filtering for practice sessions
```

**After (Flexible filtering with session types):**
```bash
# Get practice sessions for a specific module
GET /api/v1/students/practise-sessions?moduleId=1&sessionType=PRACTICE

# Get exam sessions for a specific module
GET /api/v1/students/practise-sessions?moduleId=1&sessionType=EXAM

# Get practice sessions for all modules within a unite
GET /api/v1/students/practise-sessions?uniteId=1&sessionType=PRACTICE

# Get exam sessions for all modules within a unite
GET /api/v1/students/practise-sessions?uniteId=1&sessionType=EXAM
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "filterInfo": {
      "uniteId": 1,
      "moduleId": null,
      "uniteName": "Basic Medical Sciences",
      "moduleName": null,
      "sessionType": "PRACTICE"
    },
    "totalSessions": 5,
    "sessions": [
      {
        "sessionId": 123,
        "title": "Practice Session 1",
        "status": "COMPLETED",
        "type": "PRACTICE",
        "timeSpent": 1800,
        "totalQuestions": 20,
        "questionsAnswered": 18,
        "questionsNotAnswered": 2,
        "correctAnswers": 15,
        "incorrectAnswers": 3,
        "score": 15,
        "percentage": 83.33,
        "averageTimePerQuestion": 100,
        "completedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "aggregateStats": {
      "totalTimeSpent": 9000,
      "totalQuestionsAnswered": 90,
      "totalCorrectAnswers": 75,
      "overallAccuracy": 83.33,
      "averageSessionScore": 15.5
    }
  }
}
```

**Key Features:**
- ✅ **Mutually Exclusive Filters**: Either uniteId OR moduleId, not both
- ✅ **Session Type Filtering**: Separate PRACTICE and EXAM session retrieval
- ✅ **Unite-based Filtering**: Get sessions from all modules within a unite
- ✅ **Module-based Filtering**: Get sessions from a specific module
- ✅ **Comprehensive Session Data**: Detailed statistics for each session
- ✅ **Aggregate Statistics**: Overall performance metrics
- ✅ **Access Control**: Respects user's accessible study packs

**Error Responses:**

**Missing sessionType Parameter (400):**
```json
{
  "success": false,
  "error": {
    "message": "sessionType parameter is required. Must be either 'PRACTICE' or 'EXAM'"
  }
}
```

**Missing Filter Parameter (400):**
```json
{
  "success": false,
  "error": {
    "message": "Either uniteId or moduleId must be provided"
  }
}
```

**Both Filters Provided (400):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot provide both uniteId and moduleId. Please select only one."
  }
}
```

**Invalid sessionType (400):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid sessionType. Must be either 'PRACTICE' or 'EXAM'"
  }
}
```

**Usage Examples:**
```bash
# Get practice sessions for module 1
curl -X GET "http://localhost:3005/api/v1/students/practise-sessions?moduleId=1&sessionType=PRACTICE" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Get exam sessions for unite 1
curl -X GET "http://localhost:3005/api/v1/students/practise-sessions?uniteId=1&sessionType=EXAM" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Business Logic:**
- Sessions are filtered by the specified session type only
- Unite filtering includes all sessions from modules within that unite
- Module filtering includes only sessions from that specific module
- Supports both quiz-based sessions and practice sessions with custom questions
- Access control validates user's subscription and study pack access
- Detailed session statistics include timing, accuracy, and completion data

### Enhanced Student Content Endpoints with Unite/Module Filtering

**Enhancement Added:** The student notes, labels, and courses endpoints now support both unite-based and module-based filtering using query parameters instead of path parameters.

**Modified Endpoints:**
- **Before**: `GET /api/v1/students/notes/module/:moduleId`
- **After**: `GET /api/v1/students/notes/by-module?moduleId=X` OR `GET /api/v1/students/notes/by-module?uniteId=X`

- **Before**: `GET /api/v1/students/labels/module/:moduleId`
- **After**: `GET /api/v1/students/labels/by-module?moduleId=X` OR `GET /api/v1/students/labels/by-module?uniteId=X`

- **Before**: `GET /api/v1/students/courses/module/:moduleId`
- **After**: `GET /api/v1/students/courses/by-module?moduleId=X` OR `GET /api/v1/students/courses/by-module?uniteId=X`

**Required Parameters:**
- `uniteId` OR `moduleId` (mutually exclusive): Filter by unite or module
- Both parameters are validated as integers
- Cannot provide both parameters simultaneously

**Key Features:**
- ✅ **Mutually Exclusive Filters**: Either uniteId OR moduleId, not both
- ✅ **Unite-based Filtering**: Get content from all modules within a unite
- ✅ **Module-based Filtering**: Get content from a specific module
- ✅ **Enhanced Response Structure**: Includes filter information context
- ✅ **Access Control**: Respects user's accessible study packs
- ✅ **Comprehensive Validation**: Parameter validation with clear error messages

**Response Structure Examples:**

**Notes Endpoint Response:**
```json
{
  "success": true,
  "data": {
    "filterInfo": {
      "uniteId": 1,
      "moduleId": null,
      "uniteName": "Basic Medical Sciences",
      "moduleName": null
    },
    "courseGroups": [
      {
        "course": {
          "id": 1,
          "name": "Basic Anatomy",
          "module": {
            "id": 1,
            "name": "Human Anatomy"
          }
        },
        "notes": [
          {
            "id": 1,
            "noteText": "Important anatomy concepts...",
            "questionId": 1,
            "quizId": null,
            "createdAt": "2024-01-15T10:30:00Z"
          }
        ]
      }
    ],
    "ungroupedNotes": [],
    "totalNotes": 5
  }
}
```

**Labels Endpoint Response:**
```json
{
  "success": true,
  "data": {
    "filterInfo": {
      "uniteId": null,
      "moduleId": 1,
      "uniteName": "Basic Medical Sciences",
      "moduleName": "Human Anatomy"
    },
    "labels": [
      {
        "id": 1,
        "name": "Important",
        "statistics": {
          "quizzesCount": 2,
          "questionsCount": 5,
          "quizSessionsCount": 1,
          "totalItems": 8
        },
        "questionIds": [1, 2, 3],
        "questions": [...]
      }
    ],
    "totalLabels": 3
  }
}
```

**Courses Endpoint Response:**
```json
{
  "success": true,
  "data": {
    "filterInfo": {
      "uniteId": 1,
      "moduleId": null,
      "uniteName": "Basic Medical Sciences",
      "moduleName": null
    },
    "courses": [
      {
        "id": 1,
        "name": "Basic Anatomy",
        "description": "Introduction to human anatomy",
        "resources": [
          {
            "id": 1,
            "title": "Anatomy Textbook",
            "type": "PDF",
            "url": "https://example.com/textbook.pdf"
          }
        ],
        "moduleId": 1,
        "moduleName": "Human Anatomy",
        "statistics": {
          "questionsCount": 25,
          "quizzesCount": 5
        }
      }
    ],
    "totalCourses": 8
  }
}
```

**Error Responses:**

**Missing Filter Parameter (400):**
```json
{
  "success": false,
  "error": {
    "message": "Either uniteId or moduleId must be provided"
  }
}
```

**Both Filters Provided (400):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot provide both uniteId and moduleId. Please select only one."
  }
}
```

**Invalid Parameter Format (400):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid uniteId or moduleId format"
  }
}
```

**Usage Examples:**
```bash
# Get notes for a specific module
curl -X GET "http://localhost:3005/api/v1/students/notes/by-module?moduleId=1" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Get labels for all modules in a unite
curl -X GET "http://localhost:3005/api/v1/students/labels/by-module?uniteId=1" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Get courses for a specific module
curl -X GET "http://localhost:3005/api/v1/students/courses/by-module?moduleId=1" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Business Logic:**
- Unite filtering includes content from all modules within that unite
- Module filtering includes only content from that specific module
- Filter information is included in responses for context
- Access control validates user's subscription and study pack access
- Supports both independent modules and modules within unites
- Maintains hierarchical relationships (unites → modules → courses → content)

### Rotation Field Support in Question Endpoints

**Issue Fixed:** Question retrieval endpoints were not returning the `rotation` field in their responses.

**Affected Endpoints:**
- `GET /api/v1/students/questions` - Student questions endpoint
- `GET /api/v1/admin/questions` - Admin questions endpoint

**Resolution:**
- ✅ Added `rotation` field to admin questions Prisma select statement
- ✅ Added `rotation` field to student questions response formatting
- ✅ Field now returns enum values: "R1", "R2", "R3", "R4", or `null` if not set
- ✅ Supports medical residency rotation-based filtering and display
- ✅ Maintains backward compatibility with existing integrations

**Example Response with Rotation Field:**
```json
{
  "id": 10215,
  "questionText": "What is the most common cause of chest pain in young adults?",
  "questionType": "SINGLE_CHOICE",
  "rotation": "R1",
  "yearLevel": "FIVE",
  "examYear": 2023,
  "universityId": 2,
  "course": {
    "id": 15,
    "name": "Internal Medicine"
  }
}
```

**Testing Verification:**
- ✅ Student endpoint: Returns rotation field correctly
- ✅ Admin endpoint: Returns rotation field correctly
- ✅ Database contains questions with R1, R2, R3, R4 rotation values
- ✅ Questions without rotation return `null` value appropriately

---

## 🆕 New API Endpoints

### Content Filters Endpoint

**Endpoint:** `GET /api/v1/students/content/filters`

**Description:** Returns hierarchical content structure based on user's active subscriptions and year level.

#### Request Specification

```http
GET /api/v1/students/content/filters
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Authentication
- **Required:** Yes
- **Type:** JWT Bearer Token
- **Middleware:** `checkPayment()` - validates active subscription

#### Response Schema

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "unites": [
      {
        "id": 1,
        "name": "Basic Sciences",
        "modules": [
          {
            "id": 1,
            "name": "Anatomy",
            "courses": [
              {
                "id": 1,
                "name": "Human Anatomy",
                "description": "Study of human body structure"
              }
            ]
          }
        ]
      }
    ],
    "independentModules": [
      {
        "id": 101,
        "name": "Independent Physiology",
        "courses": [
          {
            "id": 50,
            "name": "Advanced Physiology",
            "description": "Advanced physiological concepts"
          }
        ]
      }
    ]
  }
}
```

#### Filtering Logic
- **Subscription-based:** Only content from user's active study pack subscriptions
- **Year level:** Filtered by user's `currentYear` from JWT token
- **Residency packs:** Always included (accessible to all year levels)

#### Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "type": "UnauthorizedError",
    "message": "Invalid or expired token",
    "timestamp": "2025-08-31T09:00:00.000Z"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "type": "ForbiddenError",
    "message": "Access denied: No active subscription",
    "timestamp": "2025-08-31T09:00:00.000Z"
  }
}
```

### Module-Specific Endpoints

These endpoints provide filtered content based on a specific module ID, supporting both unit-based and independent modules.

#### Module Notes Endpoint

**Endpoint:** `GET /api/v1/students/notes/module/:moduleId`

**Description:** Returns all notes for questions and quizzes within a specific module, grouped by course.

**Request Specification:**
```http
GET /api/v1/students/notes/module/4
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Path Parameters:**
- `moduleId` (integer, required): The ID of the module to filter notes for

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "moduleId": 4,
    "courseGroups": [
      {
        "courseId": 6,
        "courseName": "Basic Anatomy",
        "notes": [
          {
            "id": 1,
            "noteText": "Remember to review the heart anatomy diagram",
            "questionId": 1,
            "quizId": null,
            "question": {
              "id": 1,
              "questionText": "What is the primary function of the heart?...",
              "course": {
                "id": 6,
                "name": "Basic Anatomy"
              }
            },
            "quiz": null,
            "createdAt": "2025-08-26T17:12:36.352Z",
            "updatedAt": "2025-08-26T17:12:36.352Z"
          }
        ]
      }
    ],
    "ungroupedNotes": [],
    "totalNotes": 1
  }
}
```

#### Module Labels Endpoint

**Endpoint:** `GET /api/v1/students/labels/module/:moduleId`

**Description:** Returns all student labels that contain questions from the specified module.

**Request Specification:**
```http
GET /api/v1/students/labels/module/4
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response Schema:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Important Questions",
      "statistics": {
        "quizzesCount": 2,
        "questionsCount": 5,
        "quizSessionsCount": 1,
        "totalItems": 8
      },
      "questionIds": [1, 2, 3],
      "questions": [
        {
          "id": 1,
          "questionText": "What is the primary function of the heart?...",
          "course": {
            "id": 6,
            "name": "Basic Anatomy",
            "module": {
              "id": 4,
              "name": "Human Anatomy",
              "description": "Study of human body structure"
            }
          },
          "createdAt": "2025-08-26T17:12:36.352Z"
        }
      ],
      "createdAt": "2025-08-26T17:12:36.352Z"
    }
  ]
}
```

#### Module Courses Endpoint

**Endpoint:** `GET /api/v1/students/courses/module/:moduleId`

**Description:** Returns all courses within a specific module along with their resources and statistics.

**Request Specification:**
```http
GET /api/v1/students/courses/module/4
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "moduleId": 4,
    "moduleName": "Human Anatomy",
    "moduleDescription": "Study of human body structure",
    "courses": [
      {
        "id": 6,
        "name": "Basic Anatomy",
        "description": "Introduction to human anatomy",
        "resources": [
          {
            "id": 1,
            "title": "Anatomy Textbook",
            "type": "PDF",
            "url": "https://example.com/anatomy.pdf"
          }
        ],
        "statistics": {
          "questionsCount": 25,
          "quizzesCount": 5
        }
      }
    ],
    "totalCourses": 1
  }
}
```

**Authentication & Authorization:**
- All module-specific endpoints require JWT authentication
- Users can only access modules from their active study pack subscriptions
- Supports both unit-based modules and independent modules
- Validates module access based on user's subscription status

**Error Responses:**

**Module Not Found or Access Denied (403):**
```json
{
  "success": false,
  "error": {
    "type": "ForbiddenError",
    "message": "Access denied: Module not found or not accessible with your current subscription",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

**Invalid Module ID (400):**
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Valid module ID is required",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

### Enhanced Quiz Session Submission Endpoint

**Endpoint:** `POST /api/v1/students/quiz-sessions/:sessionId/submit-answer`

**Description:** Submit answers for a quiz session with enhanced scoring, time tracking, and incomplete session handling.

**Request Specification:**
```http
POST /api/v1/students/quiz-sessions/123/submit-answer
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedAnswerId": 4
    },
    {
      "questionId": 2,
      "selectedAnswerIds": [7, 9]
    }
  ],
  "timeSpent": 1800
}
```

**Request Body Parameters:**
- `answers` (array, required): Array of answer objects
  - `questionId` (integer, required): ID of the question being answered
  - `selectedAnswerId` (integer, optional): For single choice questions
  - `selectedAnswerIds` (array, optional): For multiple choice questions
- `timeSpent` (integer, optional): Time spent on the session in seconds (0-86400)

**Enhanced Features:**
- **Time Tracking**: Accepts and stores time spent on the session
- **Incomplete Sessions**: Allows submission even if not all questions are answered
- **Smart Scoring**: Calculates scores based on answered questions only
- **Dual Score Format**: Returns both percentage and normalized 20-point scores

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "sessionId": 123,
    "scoreOutOf20": 16.5,
    "percentageScore": 82.5,
    "timeSpent": 1800,
    "answeredQuestions": 15,
    "totalQuestions": 20,
    "status": "completed"
  }
}
```

**Response Fields:**
- `sessionId`: ID of the completed session
- `scoreOutOf20`: Score normalized to 20 points (based on total questions)
- `percentageScore`: Percentage score (correct answers / answered questions * 100)
- `timeSpent`: Time spent in seconds (if provided)
- `answeredQuestions`: Number of questions answered in this submission
- `totalQuestions`: Total number of questions in the session
- `status`: Session status (always "completed" after submission)

**Scoring Logic:**
- **Percentage Score**: (Correct Answers / Answered Questions) × 100
- **Score Out of 20**: (Correct Answers / Total Questions) × 20
- **Incomplete Sessions**: Students can submit partial answers; unanswered questions don't affect percentage calculation

**Error Responses:**

**Session Already Completed (400):**
```json
{
  "success": false,
  "error": {
    "type": "SessionCompletedError",
    "message": "Session 123 has already been completed",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

**Invalid Time Spent (400):**
```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Time spent cannot exceed 24 hours",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

### Rotation Field Support

**Description:** All question-related endpoints now support medical residency rotation filtering and management.

**Rotation Enum Values:** `R1`, `R2`, `R3`, `R4`

**Enhanced Endpoints:**
- `POST /api/v1/quizzes/create-session-by-questions` - Session creation using question IDs (supports rotation filtering via frontend)
- `POST /api/v1/admin/questions` - Now accepts optional `rotation` field
- `PUT /api/v1/admin/questions/:id` - Now supports updating rotation field
- All question fetching endpoints include `rotation` field in responses

**Session Creation with Rotation-Filtered Questions:**
```json
{
  "title": "R1 Internal Medicine Practice",
  "type": "PRACTICE",
  "questionIds": [123, 456, 789]
}
```

Note: Rotation filtering is now applied on the frontend after retrieving questions via the Method 1 workflow.

**Question with Rotation Field:**
```json
{
  "id": 123,
  "questionText": "What is the most common cause...",
  "rotation": "R1",
  "yearLevel": "ONE",
  "explanation": "...",
  "answers": [...]
}
```

### Session Filtration Data Endpoint

**Endpoint:** `GET /api/v1/students/sessions/filters`

**Description:** Retrieve hierarchical session filtration data with session counts for authenticated students. Returns unites, modules, and courses with the number of completed quiz sessions for each level.

**Authentication:** Required (JWT token)
**Authorization:** Student role required

**Request Specification:**
```http
GET /api/v1/students/sessions/filters
Authorization: Bearer <JWT_TOKEN>
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "unites": [
      {
        "id": 1,
        "name": "Basic Medical Sciences",
        "sessionsCount": 2,
        "modules": [
          {
            "id": 1,
            "name": "Human Anatomy",
            "sessionsCount": 2,
            "courses": [
              {
                "id": 1,
                "name": "Basic Anatomy",
                "description": "Introduction to human anatomy"
              },
              {
                "id": 2,
                "name": "Advanced Anatomy",
                "description": "Advanced study of anatomical systems"
              }
            ]
          }
        ]
      }
    ],
    "independentModules": [
      {
        "id": 101,
        "name": "Independent Physiology",
        "sessionsCount": 1,
        "courses": [
          {
            "id": 50,
            "name": "Advanced Physiology",
            "description": "Advanced physiological concepts"
          }
        ]
      }
    ]
  }
}
```

**Response Fields:**
- `unites`: Array of unite objects with hierarchical structure
  - `id`: Unite identifier
  - `name`: Unite name
  - `sessionsCount`: Total completed quiz sessions within this unite
  - `modules`: Array of modules within this unite
- `independentModules`: Array of modules not associated with any unite
  - `id`: Module identifier
  - `name`: Module name
  - `sessionsCount`: Total completed quiz sessions within this module
  - `courses`: Array of courses within this module

**Business Logic:**
- **Session Count Calculation**: `sessionsCount` represents completed quiz sessions by the authenticated student
- **Subscription Filtering**: Only returns content accessible through student's active subscription
- **Year Level Filtering**: Filters based on student's current year level from JWT token
- **Hierarchical Structure**: Maintains unite → module → course hierarchy
- **Independent Modules**: Handles modules with direct study pack association (no unite)

**Session Counting Logic:**
Sessions are counted from two sources:
1. **Quiz-based sessions**: Sessions created from formal quizzes within courses
2. **Practice sessions**: Dynamic sessions with questions from courses within the scope

**Error Responses:**

**Unauthorized Access (401):**
```json
{
  "success": false,
  "error": {
    "type": "UnauthorizedError",
    "message": "Authentication required",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

**No Active Subscription (403):**
```json
{
  "success": false,
  "error": {
    "type": "ForbiddenError",
    "message": "Access denied: No active subscription found",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

**Usage Example:**
```bash
curl -X GET http://localhost:3005/api/v1/students/sessions/filters \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Practice Session Statistics for Module

**Endpoint:** `GET /api/v1/students/practise-sessions/module/:moduleId`

**Description:** Retrieve detailed practice session statistics for a specific module with comprehensive analytics. Returns only PRACTICE type sessions (excludes EXAM sessions) with detailed performance metrics.

**Authentication:** Required (JWT token)
**Authorization:** Student role required

**Request Specification:**
```http
GET /api/v1/students/practise-sessions/module/123
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameters:**
- `moduleId` (integer, required): ID of the module to get practice session statistics for

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "moduleId": 123,
    "moduleName": "Human Anatomy",
    "totalPracticeSessions": 5,
    "sessions": [
      {
        "sessionId": 456,
        "title": "Anatomy Practice Session",
        "status": "COMPLETED",
        "timeSpent": 1800,
        "totalQuestions": 20,
        "questionsAnswered": 18,
        "questionsNotAnswered": 2,
        "correctAnswers": 15,
        "incorrectAnswers": 3,
        "score": 15.0,
        "percentage": 83.33,
        "averageTimePerQuestion": 100,
        "completedAt": "2025-08-31T10:00:00.000Z"
      }
    ],
    "aggregateStats": {
      "totalTimeSpent": 7200,
      "totalQuestionsAnswered": 85,
      "totalCorrectAnswers": 68,
      "overallAccuracy": 80.0,
      "averageSessionScore": 16.2
    }
  }
}
```

**Response Fields:**
- `moduleId`: ID of the requested module
- `moduleName`: Name of the module
- `totalPracticeSessions`: Count of practice sessions in this module
- `sessions`: Array of session objects with detailed statistics:
  - `sessionId`: Unique session identifier
  - `title`: Session title
  - `status`: Session status (COMPLETED, IN_PROGRESS, etc.)
  - `timeSpent`: Total time spent on session in seconds
  - `totalQuestions`: Total number of questions in the session
  - `questionsAnswered`: Number of questions the student answered
  - `questionsNotAnswered`: Number of questions left unanswered
  - `correctAnswers`: Number of correctly answered questions
  - `incorrectAnswers`: Number of incorrectly answered questions
  - `score`: Session score out of 20
  - `percentage`: Percentage score (correctAnswers / questionsAnswered * 100)
  - `averageTimePerQuestion`: Average time spent per question (timeSpent / questionsAnswered)
  - `completedAt`: Session completion timestamp
- `aggregateStats`: Summary statistics across all sessions:
  - `totalTimeSpent`: Total time spent across all sessions
  - `totalQuestionsAnswered`: Total questions answered across all sessions
  - `totalCorrectAnswers`: Total correct answers across all sessions
  - `overallAccuracy`: Overall accuracy percentage
  - `averageSessionScore`: Average score across all sessions

**Business Logic:**
- **Session Type Filtering**: Only includes PRACTICE sessions, excludes EXAM sessions
- **Module Access Validation**: Validates user has access to the requested module
- **Comprehensive Analytics**: Calculates detailed statistics from quiz attempts and session data
- **Time-based Metrics**: Includes time tracking and average time per question
- **Accuracy Calculations**: Provides both individual session and aggregate accuracy metrics

**Statistics Calculation:**
- **Session Level**: Statistics calculated from quiz_attempts and multiple_choice_attempts tables
- **Answer Counting**: Combines single choice and multiple choice question attempts
- **Time Metrics**: Uses timeSpent field and calculates averages
- **Accuracy**: Calculated as (correct answers / total answered questions) * 100

**Error Responses:**

**Module Not Found (404):**
```json
{
  "success": false,
  "error": {
    "type": "NotFoundError",
    "message": "Module not found",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

**Access Denied (403):**
```json
{
  "success": false,
  "error": {
    "type": "ForbiddenError",
    "message": "Access denied: Module not accessible with your current subscription",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

**Invalid Module ID (400):**
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Valid module ID is required",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

**Usage Example:**
```bash
curl -X GET http://localhost:3005/api/v1/students/practise-sessions/module/123 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Course Layer Management Endpoints

**Description:** Manage course layers with QCM (Question à Choix Multiple) layer support. Each course can have multiple layers, but only one QCM layer per course per student.

#### Create Course Layer

**Endpoint:** `POST /api/v1/students/course-layers`

**Authentication:** Required (JWT token)
**Authorization:** Student role required

**Request Specification:**
```http
POST /api/v1/students/course-layers
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": 123,
  "layerNumber": 1,
  "isQcmLayer": false
}
```

**Request Body Parameters:**
- `courseId` (integer, required): ID of the course
- `layerNumber` (integer, required): Layer number (1, 2, 3, etc.)
- `isQcmLayer` (boolean, optional): Whether this is a QCM layer (default: false)

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "courseId": 123,
    "layerNumber": 1,
    "isCompleted": false,
    "isQcmLayer": false,
    "completedAt": null,
    "createdAt": "2025-08-31T10:00:00.000Z"
  },
  "message": "Course layer 1 created successfully"
}
```

**Business Logic:**
- **QCM Layer Constraint**: Only one layer per course can have `isQcmLayer: true`
- **Layer Validation**: Validates course exists and user has access
- **Automatic Fields**: Sets creation timestamp and default completion status

#### Update Course Layer

**Endpoint:** `PUT /api/v1/students/course-layers/:layerId`

**Request Body:**
```json
{
  "isCompleted": true,
  "isQcmLayer": false
}
```

**Request Body Parameters:**
- `isCompleted` (boolean, optional): Mark layer as completed/incomplete
- `isQcmLayer` (boolean, optional): Change QCM layer status

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "courseId": 123,
    "layerNumber": 1,
    "isCompleted": true,
    "isQcmLayer": false,
    "completedAt": "2025-08-31T10:00:00.000Z",
    "updatedAt": "2025-08-31T10:00:00.000Z"
  },
  "message": "Course layer updated successfully"
}
```

#### Get Course Layers

**Endpoint:** `GET /api/v1/students/courses/:courseId/layers`

**Response Schema:**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "courseId": 123,
      "layerNumber": 1,
      "isCompleted": true,
      "isQcmLayer": false,
      "completedAt": "2025-08-31T10:00:00.000Z",
      "createdAt": "2025-08-31T09:00:00.000Z",
      "updatedAt": "2025-08-31T10:00:00.000Z",
      "course": {
        "id": 123,
        "name": "Human Anatomy"
      }
    },
    {
      "id": 457,
      "courseId": 123,
      "layerNumber": 2,
      "isCompleted": false,
      "isQcmLayer": true,
      "completedAt": null,
      "createdAt": "2025-08-31T09:30:00.000Z",
      "updatedAt": "2025-08-31T09:30:00.000Z",
      "course": {
        "id": 123,
        "name": "Human Anatomy"
      }
    }
  ],
  "message": "Course layers retrieved successfully"
}
```

**Error Responses:**

**QCM Layer Constraint Violation (400):**
```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Course already has a QCM layer (Layer 2). Only one QCM layer per course is allowed.",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

**Course Not Found (404):**
```json
{
  "success": false,
  "error": {
    "type": "NotFoundError",
    "message": "Course not found",
    "timestamp": "2025-08-31T10:00:00.000Z"
  }
}
```

**Usage Examples:**
```bash
# Create a regular layer
curl -X POST http://localhost:3005/api/v1/students/course-layers \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"courseId": 123, "layerNumber": 1, "isQcmLayer": false}'

# Create a QCM layer
curl -X POST http://localhost:3005/api/v1/students/course-layers \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"courseId": 123, "layerNumber": 2, "isQcmLayer": true}'

# Update layer completion
curl -X PUT http://localhost:3005/api/v1/students/course-layers/456 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"isCompleted": true}'

# Get all layers for a course
curl -X GET http://localhost:3005/api/v1/students/courses/123/layers \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 🗄️ Modified Database Schema

### Module Model Changes

**Previous Schema:**
```prisma
model Module {
  id        Int      @id @default(autoincrement())
  uniteId   Int      @map("unite_id")  // Required
  name      String
  description String?
  // ... other fields
  
  unite      Unite    @relation(fields: [uniteId], references: [id])
  // ... other relations
}
```

**New Schema:**
```prisma
model Module {
  id          Int      @id @default(autoincrement())
  uniteId     Int?     @map("unite_id")      // Now optional
  studyPackId Int?     @map("study_pack_id") // New field
  name        String
  description String?
  // ... other fields
  
  unite       Unite?     @relation(fields: [uniteId], references: [id])
  studyPack   StudyPack? @relation(fields: [studyPackId], references: [id])
  // ... other relations
}
```

### Key Changes:
1. **`uniteId`** - Changed from required to optional (`Int?`)
2. **`studyPackId`** - New optional field for direct study pack association
3. **Relationships** - Added `studyPack` relation, made `unite` optional

### StudyPack Model Enhancement

**Added relationship:**
```prisma
model StudyPack {
  // ... existing fields
  modules         Module[]  // New relation to independent modules
  // ... other relations
}
```

### Database Migration

**Migration Applied:** `20250831090617_make_module_unite_optional_and_add_study_pack_relation`

**SQL Changes:**
```sql
-- Make unite_id optional
ALTER TABLE modules ALTER COLUMN unite_id DROP NOT NULL;

-- Add study_pack_id column
ALTER TABLE modules ADD COLUMN study_pack_id INTEGER;

-- Add foreign key constraint
ALTER TABLE modules ADD CONSTRAINT modules_study_pack_id_fkey 
  FOREIGN KEY (study_pack_id) REFERENCES study_packs(id) ON DELETE CASCADE;
```

---

## 🔄 Updated Existing Endpoints

### Study Packs Endpoints

Both student and admin study packs endpoints now include independent modules.

#### Student Endpoint: `GET /api/v1/students/study-packs`
#### Admin Endpoint: `GET /api/v1/admin/study-packs`

**Enhanced Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "First Year Medicine",
      "unites": [
        {
          "id": 1,
          "name": "Basic Sciences",
          "modules": [
            // Unit-based modules
          ]
        }
      ],
      "modules": [
        // Independent modules (where uniteId is null)
        {
          "id": 101,
          "name": "Independent Anatomy",
          "courses": [
            // Courses for independent module
          ]
        }
      ]
    }
  ]
}
```

### Admin Module Management

#### Create Module: `POST /api/v1/admin/modules`

**Updated Request Schema:**
```json
{
  "uniteId": 1,        // Optional - for unit-based modules
  "studyPackId": 2,    // Optional - for independent modules
  "name": "Module Name",
  "description": "Module description"
}
```

**Validation Rules:**
- Either `uniteId` OR `studyPackId` must be provided (not both)
- Both cannot be null/undefined
- Referenced unite/study pack must exist

#### Update Module: `PUT /api/v1/admin/modules/:id`

**Updated Request Schema:** Same as create, with same validation rules.

---

## 🔐 Authentication & Authorization

### JWT Token Structure

The content filters endpoint extracts the following from JWT:

```javascript
{
  user_data: {
    id: 6,
    currentYear: "ONE",  // Used for year level filtering
    // ... other user fields
  },
  subscriptions: [
    {
      study_pack_id: 4,
      // ... subscription details
    }
  ],
  accessible_study_packs: [4, 5]  // Used for content filtering
}
```

### Subscription Validation

- Uses existing `validateUserSubscriptionsImproved()` method
- Checks for active subscriptions
- Extracts accessible study pack IDs
- Validates payment status

---

## 🎨 Frontend Integration Guide

### Consuming Content Filters

```typescript
interface ContentFilters {
  unites: Unite[];
  independentModules: Module[];
}

interface Unite {
  id: number;
  name: string;
  modules: Module[];
}

interface Module {
  id: number;
  name: string;
  courses: Course[];
}

interface Course {
  id: number;
  name: string;
  description?: string;
}

// API call example
const fetchContentFilters = async (): Promise<ContentFilters> => {
  const response = await fetch('/api/v1/students/content/filters', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  return result.data;
};
```

### UI Component Structure

```typescript
// Recommended component hierarchy
<ContentFilters>
  <UnitsSection>
    {unites.map(unite => (
      <UnitCard key={unite.id}>
        <ModulesGrid>
          {unite.modules.map(module => (
            <ModuleCard key={module.id}>
              <CoursesList courses={module.courses} />
            </ModuleCard>
          ))}
        </ModulesGrid>
      </UnitCard>
    ))}
  </UnitsSection>
  
  <IndependentModulesSection>
    <ModulesGrid>
      {independentModules.map(module => (
        <ModuleCard key={module.id} isIndependent={true}>
          <CoursesList courses={module.courses} />
        </ModuleCard>
      ))}
    </ModulesGrid>
  </IndependentModulesSection>
</ContentFilters>
```

### Handling Mixed Content

```typescript
// Utility function to combine all modules
const getAllModules = (filters: ContentFilters): Module[] => {
  const unitModules = filters.unites.flatMap(unite => unite.modules);
  return [...unitModules, ...filters.independentModules];
};

// Check if module is independent
const isIndependentModule = (module: Module, filters: ContentFilters): boolean => {
  return filters.independentModules.some(indep => indep.id === module.id);
};
```

---

## ⚠️ Error Handling

### Common Error Scenarios

1. **No Active Subscription**
   - Status: 403
   - Action: Redirect to subscription page

2. **Invalid Token**
   - Status: 401
   - Action: Redirect to login

3. **Server Error**
   - Status: 500
   - Action: Show error message, retry option

### Error Handling Example

```typescript
const handleContentFilters = async () => {
  try {
    const filters = await fetchContentFilters();
    setContentFilters(filters);
  } catch (error) {
    if (error.status === 403) {
      // No active subscription
      router.push('/subscription');
    } else if (error.status === 401) {
      // Invalid token
      router.push('/login');
    } else {
      // Other errors
      setError('Failed to load content. Please try again.');
    }
  }
};
```

---

## 📝 Migration Notes

### Backward Compatibility

- ✅ All existing unit-based modules continue to work unchanged
- ✅ Existing API endpoints maintain same response structure
- ✅ No breaking changes to current frontend implementations

### Database Migration

- **Applied:** August 31, 2025
- **Migration ID:** `20250831090617_make_module_unite_optional_and_add_study_pack_relation`
- **Rollback:** Available if needed (contact backend team)

### Testing Recommendations

1. **Test both content types:**
   - Verify unit-based modules display correctly
   - Verify independent modules display correctly

2. **Test filtering:**
   - Verify subscription-based filtering
   - Verify year level filtering

3. **Test edge cases:**
   - Users with no subscriptions
   - Users with expired subscriptions
   - Empty content scenarios

---
