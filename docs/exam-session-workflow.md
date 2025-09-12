# Exam Session Creation

Step 1: Get Content Structure
**Endpoint:** `GET /api/v1/students/content/filters`
- Returns hierarchical structure: Unites → Modules → Courses
- Filtered by user's active subscriptions and year level
- Includes both unit-based modules and independent modules

Step 2: Get Available Questions
# By Unite (all modules within unite)
**Endpoint:** `GET /api/v1/quizzes/questions-by-unite-or-module?uniteId=5`

# By Module (specific module only)  
**Endpoint:** `GET /api/v1/quizzes/questions-by-unite-or-module?moduleId=12`

Step 3: Apply Frontend Filters

**Endpoint:** `GET /api/v1/quizzes/session-filters`

Retrieve all available filter categories based on actual question data:
- University (universityId)
- Question source (sourceId) 
- Exam year (examYear)
- Rotation (rotation) - R1, R2, R3, R4
- Year level (yearLevel)
- Question type (questionType)

Step 4: Create Exam Session

**Endpoint:** `POST /api/v1/quizzes/create-session-by-questions`

request: 
```json
{
  "title": "Custom Anatomy Practice",
  "type": "EXAM", 
  "questionIds": [189, 190, 191]
}
```

- `type` (required): Must be either "PRACTICE" or "EXAM"

response:
```json
{
  "success": true,
  "data": {
    "sessionId": 228,
    "type": "EXAM",
    "questionCount": 3,
    "status": "NOT_STARTED",
    "createdAt": "2025-09-07T20:10:05.027Z"
  }
}
```
 - Capture the returned sessionId from `response.data.sessionId`.



# endpoints usage: 

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

---


**Endpoint:** `GET /api/v1/quizzes/session-filters`

Retrieve all available filter categories based on actual question data:


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


---

# Get Available Questions response

**Endpoint:** GET /api/v1/quizzes/questions-by-unite-or-module?uniteId=5

response:
```json
{
    "success": true,
    "data": {
        "success": true,
        "data": {
            "questions": [
                {
                    "id": 82,
                    "questionText": "Question 68: What is the primary function of the urinary system?",
                    "questionType": "SINGLE_CHOICE",
                    "universityId": 4,
                    "yearLevel": "FIVE",
                    "examYear": 2022,
                    "rotation": null,
                    "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"urinary system\",\"category\":\"general\",\"estimatedTime\":90,\"multipleCorrect\":false,\"questionNumber\":68}",
                    "sourceId": 5,
                    "createdAt": "2025-08-31T11:08:42.716Z",
                    "updatedAt": "2025-08-31T11:09:23.793Z",
                    "university": {
                        "id": 4,
                        "name": "University of Constantine",
                        "country": "Algeria"
                    },
                    "course": {
                        "id": 39,
                        "name": "Pharmacology - Introduction",
                        "module": {
                            "id": 15,
                            "name": "Pharmacology",
                            "unite": {
                                "id": 5,
                                "name": "Advanced Studies - First Year Medicine"
                            }
                        }
                    },
                    "source": {
                        "id": 5,
                        "name": "University Materials"
                    }
                },
                {
                    "id": 76,
                    "questionText": "Question 62: What is the primary function of the respiratory system?",
                    "questionType": "MULTIPLE_CHOICE",
                    "universityId": 6,
                    "yearLevel": "FOUR",
                    "examYear": 2020,
                    "rotation": null,
                    "metadata": "{\"difficulty\":\"intermediate\",\"topic\":\"respiratory system\",\"category\":\"physiology\",\"estimatedTime\":120,\"multipleCorrect\":true,\"questionNumber\":62}",
                    "sourceId": 6,
                    "createdAt": "2025-08-31T11:08:42.681Z",
                    "updatedAt": "2025-08-31T11:09:23.684Z",
                    "university": {
                        "id": 6,
                        "name": "University of Annaba",
                        "country": "Algeria"
                    },
                    "course": {
                        "id": 33,
                        "name": "Physiology - Introduction",
                        "module": {
                            "id": 13,
                            "name": "Physiology",
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
                },
                {
                    "id": 52,
                    "questionText": "Question 38: What is the primary function of the respiratory system?",
                    "questionType": "SINGLE_CHOICE",
                    "universityId": 4,
                    "yearLevel": "ONE",
                    "examYear": 2022,
                    "rotation": null,
                    "metadata": "{\"difficulty\":\"intermediate\",\"topic\":\"respiratory system\",\"category\":\"physiology\",\"estimatedTime\":90,\"multipleCorrect\":false,\"questionNumber\":38}",
                    "sourceId": 4,
                    "createdAt": "2025-08-31T11:08:42.540Z",
                    "updatedAt": "2025-08-31T11:09:23.238Z",
                    "university": {
                        "id": 4,
                        "name": "University of Constantine",
"country": "Algeria"
                    },
                    "course": {
                        "id": 35,
                        "name": "Physiology - Clinical Applications",
                        "module": {
                            "id": 13,
                            "name": "Physiology",
                            "unite": {
                                "id": 5,
                                "name": "Advanced Studies - First Year Medicine"
                            }
                        }
                    },
                    "source": {
                        "id": 4,
                        "name": "Board Exam Questions"
                    }
                },
                {
                    "id": 20,
                    "questionText": "Question 6: What is the primary function of the immune system?",
                    "questionType": "MULTIPLE_CHOICE",
                    "universityId": 5,
                    "yearLevel": "FOUR",
                    "examYear": 2021,
                    "rotation": null,
                    "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"immune system\",\"category\":\"general\",\"estimatedTime\":120,\"multipleCorrect\":true,\"questionNumber\":6}",
                    "sourceId": 4,
                    "createdAt": "2025-08-31T11:08:42.356Z",
                    "updatedAt": "2025-08-31T11:09:22.531Z",
                    "university": {
                        "id": 5,
                        "name": "University of Oran",
                        "country": "Algeria"
                    },
                    "course": {
                        "id": 40,
                        "name": "Pharmacology - Advanced Concepts",
                        "module": {
                            "id": 15,
                            "name": "Pharmacology",
                            "unite": {
                                "id": 5,
                                "name": "Advanced Studies - First Year Medicine"
                            }
                        }
                    },
                    "source": {
                        "id": 4,
                        "name": "Board Exam Questions"
                    }
                }
            ],
            "totalCount": 4,
            "filterInfo": {
                "uniteId": 5,
                "moduleId": null,
                "uniteName": "Advanced Studies - First Year Medicine",
                "moduleName": "Pharmacology"
            }
        },
        "message": "Questions retrieved successfully for Advanced Studies - First Year Medicine"
    },
    "meta": {
        "timestamp": "2025-09-07T18:14:54.339Z",
        "requestId": "5yfrh2gwtmc"
    }
}

```


