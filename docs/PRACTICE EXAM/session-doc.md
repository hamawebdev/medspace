
# Quiz Session API Documentation

## Get Quiz Session

### Endpoint

**GET** `{{base_url}}/quiz-sessions/{sessionId}`

### Example Request

**GET** `{{base_url}}/quiz-sessions/210`

### Response
{
    "success": true,
    "data": {
        "id": 210,
        "title": "Custom Anatomy Exam - Postman Test",
        "type": "PRACTICE",
        "status": "NOT_STARTED",
        "score": 0,
        "percentage": 0,
        "questions": [
            {
                "id": 1,
                "questionText": "What is the primary function of the heart?",
                "questionType": "SINGLE_CHOICE",
                "explanation": "The heart pumps blood throughout the body.",
                "yearLevel": "THREE",
                "examYear": 2024,
                "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"heart\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                "questionImages": [],
                "questionExplanationImages": [],
                "university": {
                    "id": 1,
                    "name": "University of Algiers",
                    "country": "Algeria"
                },
                "course": {
                    "id": 1,
                    "name": "Basic Anatomy",
                    "description": "Introduction to human anatomy",
                    "module": {
                        "id": 1,
                        "name": "Human Anatomy"
                    }
                },
                "source": {
                    "id": 1,
                    "name": "Medical Textbooks"
                },
                "questionAnswers": [
                    {
                        "id": 1,
                        "answerText": "Pumps blood",
                        "isCorrect": true,
                        "explanation": "This is the correct answer.",
                        "explanationImages": [
                            {
                                "id": 1,
                                "imagePath": "/images/explanations/heart-diagram.jpg",
                                "altText": "heart anatomical diagram"
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "answerText": "Produces hormones",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 3,
                        "answerText": "Stores energy",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 4,
                        "answerText": "Regulates temperature",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    }
                ],
                "createdAt": "2025-08-31T11:08:39.114Z",
                "updatedAt": "2025-08-31T11:08:39.114Z"
            },
            {
                "id": 2,
                "questionText": "What is the primary function of the liver?",
                "questionType": "SINGLE_CHOICE",
                "explanation": "The liver processes nutrients and detoxifies blood.",
                "yearLevel": "ONE",
                "examYear": 2024,
                "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"liver\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                "questionImages": [],
                "questionExplanationImages": [],
                "university": {
                    "id": 1,
                    "name": "University of Algiers",
                    "country": "Algeria"
                },
                "course": {
                    "id": 1,
                    "name": "Basic Anatomy",
                    "description": "Introduction to human anatomy",
                    "module": {
                        "id": 1,


"name": "Human Anatomy"
                    }
                },
                "source": {
                    "id": 1,
                    "name": "Medical Textbooks"
                },
                "questionAnswers": [
                    {
                        "id": 5,
                        "answerText": "Detoxifies blood",
                        "isCorrect": true,
                        "explanation": "This is the correct answer.",
                        "explanationImages": [
                            {
                                "id": 2,
                                "imagePath": "/images/explanations/liver-diagram.jpg",
                                "altText": "liver anatomical diagram"
                            }
                        ]
                    },
                    {
                        "id": 6,
                        "answerText": "Produces hormones",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 7,
                        "answerText": "Stores energy",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 8,
                        "answerText": "Regulates temperature",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    }
                ],
                "createdAt": "2025-08-31T11:08:39.158Z",
                "updatedAt": "2025-08-31T11:08:39.158Z"
            },
            {
                "id": 3,
                "questionText": "What is the primary function of the kidney?",
                "questionType": "SINGLE_CHOICE",
                "explanation": "The kidney filters waste from blood.",
                "yearLevel": "ONE",
                "examYear": 2024,
                "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"kidney\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                "questionImages": [],
                "questionExplanationImages": [],
                "university": {
                    "id": 1,
                    "name": "University of Algiers",
                    "country": "Algeria"
                },
                "course": {
                    "id": 1,
                    "name": "Basic Anatomy",
                    "description": "Introduction to human anatomy",
                    "module": {
                        "id": 1,
                        "name": "Human Anatomy"
                    }
                },
                "source": {
                    "id": 1,
                    "name": "Medical Textbooks"
                },
                "questionAnswers": [
                    {
                        "id": 9,
                        "answerText": "Filters waste",
                        "isCorrect": true,
                        "explanation": "This is the correct answer.",
                        "explanationImages": [
                            {
                                "id": 3,
                                "imagePath": "/images/explanations/kidney-diagram.jpg",
                                "altText": "kidney anatomical diagram"
                            }
                        ]
                    },
                    {
                        "id": 10,
                        "answerText": "Produces hormones",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 11,
                        "answerText": "Stores energy",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",


"explanationImages": []
                    },
                    {
                        "id": 12,
                        "answerText": "Regulates temperature",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    }
                ],
                "createdAt": "2025-08-31T11:08:39.196Z",
                "updatedAt": "2025-08-31T11:08:39.196Z"
            }
        ],
        "answers": [
            {
                "questionId": 1
            },
            {
                "questionId": 2
            },
            {
                "questionId": 3
            }
        ],
        "createdAt": "2025-09-02T10:43:10.622Z",
        "updatedAt": "2025-09-02T10:43:10.622Z"
    },
    "meta": {
        "timestamp": "2025-09-04T19:19:07.819Z",
        "requestId": "ovjnf9cw2il"
    }
}

## Submit Answer API

### Request Specification

**POST** `/api/v1/students/quiz-sessions/{sessionId}/submit-answer`
**Authorization:** Bearer <JWT_TOKEN>  
**Content-Type:** application/json

### Request Body

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
### Request Body Parameters

answers (array, required): Array of answer objects
questionId (integer, required): ID of the question being answered
selectedAnswerId (integer, optional): For single choice questions
selectedAnswerIds (array, optional): For multiple choice questions
timeSpent (integer, optional): Time spent on the session in seconds (0-86400)
### Enhanced Features

Time Tracking: Accepts and stores time spent on the session
Incomplete Sessions: Allows submission even if not all questions are answered
Smart Scoring: Calculates scores based on answered questions only
Dual Score Format: Returns both percentage and normalized 20-point scores
### Response Schema
{
    "success": true,
    "data": {
        "sessionId": 667,
        "scoreOutOf20": 4,
        "percentageScore": 20,
        "timeSpent": 22,
        "answeredQuestions": 2,
        "totalQuestions": 5
    },
    "meta": {
        "timestamp": "2025-09-14T10:40:37.038Z",
        "requestId": "18wmsduhcxh"
    }
}
### Response Fields

sessionId: ID of the completed session
scoreOutOf20: Score normalized to 20 points (based on total questions)
percentageScore: Percentage score (correct answers / answered questions * 100)
timeSpent: Time spent in seconds (if provided)
answeredQuestions: Number of questions answered in this submission
totalQuestions: Total number of questions in the session
status: Session status (always "completed" after submission)
### Scoring Logic

Percentage Score: (Correct Answers / Answered Questions) × 100
Score Out of 20: (Correct Answers / Total Questions) × 20
Incomplete Sessions: Students can submit partial answers; unanswered questions don't affect percentage calculation



--- 



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
