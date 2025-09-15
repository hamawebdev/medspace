# get session in progress (practice/exam) with examples
**Endpoint**: **GET** `{{base_url}}/quiz-sessions/{sessionId}`

## Session Continuation Behavior

When a user exits a session and later continues it, this endpoint returns a comprehensive response that includes:

- **Session State Preservation**: The `timeSpent` field tracks exactly where the user left off (in seconds)
- **Answer State Management**: The `answers` array maintains the complete state of all questions:
  - **Answered Questions**: Include `selectedAnswerId`, `isCorrect` status, and `answeredAt` timestamp
  - **Unanswered Questions**: Only contain `questionId` without selection data
- **Progress Tracking**: Current `score` and `percentage` reflect the user's performance up to the exit point
- **Question Context**: Full question details with answers, explanations, and metadata for seamless continuation
- **Session Metadata**: Includes creation/update timestamps and session type (PRACTICE/EXAM)

This structure ensures users can resume their session exactly where they left off, with all previous answers preserved and the timer accurately reflecting their actual time investment.

**response**:
{
    "success": true,
    "data": {
        "id": 655,
        "title": "Valid Practice Session",
        "type": "PRACTICE",
        "status": "IN_PROGRESS",
        "score": 8.571428571428571,
        "percentage": 100,
        "timeSpent": 120,
        "questions": [
            {
                "id": 504,
                "questionText": "What is the primary function of the heart?",
                "questionType": "SINGLE_CHOICE",
                "explanation": "The heart pumps blood throughout the body.",
                "yearLevel": "ONE",
                "examYear": 2024,
                "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"heart\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                "questionImages": [],
                "questionExplanationImages": [],
                "university": {
                    "id": 17,
                    "name": "University of Algiers",
                    "country": "Algeria"
                },
                "course": {
                    "id": 587,
                    "name": "Basic Anatomy",
                    "description": "Introduction to human anatomy",
                    "module": {
                        "id": 199,
                        "name": "Human Anatomy"
                    }
                },
                "source": {
                    "id": 13,
                    "name": "Medical Textbooks"
                },
                "questionAnswers": [
                    {
                        "id": 2037,
                        "answerText": "Pumps blood",
                        "isCorrect": true,
                        "explanation": "This is the correct answer.",
                        "explanationImages": [
                            {
                                "id": 15,
                                "imagePath": "/images/explanations/heart-diagram.jpg",
                                "altText": "heart anatomical diagram"
                            }
                        ]
                    },
                    {
                        "id": 2038,
                        "answerText": "Produces hormones",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2039,
                        "answerText": "Stores energy",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2040,
                        "answerText": "Regulates temperature",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    }
                ],
                "createdAt": "2025-09-10T19:28:05.657Z",
                "updatedAt": "2025-09-10T19:28:05.657Z"
            },
            {
                "id": 505,
                "questionText": "What is the primary function of the liver?",
                "questionType": "SINGLE_CHOICE",
                "explanation": "The liver processes nutrients and detoxifies blood.",
                "yearLevel": "ONE",
                "examYear": 2024,
                "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"liver\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                "questionImages": [],
                "questionExplanationImages": [],
                "university": {
                    "id": 17,
                    "name": "University of Algiers",
                    "country": "Algeria"
                },
                "course": {
                    "id": 587,
                    "name": "Basic Anatomy",
                    "description": "Introduction to human anatomy",
                    "module": {


"id": 199,
                        "name": "Human Anatomy"
                    }
                },
                "source": {
                    "id": 13,
                    "name": "Medical Textbooks"
                },
                "questionAnswers": [
                    {
                        "id": 2041,
                        "answerText": "Detoxifies blood",
                        "isCorrect": true,
                        "explanation": "This is the correct answer.",
                        "explanationImages": [
                            {
                                "id": 16,
                                "imagePath": "/images/explanations/liver-diagram.jpg",
                                "altText": "liver anatomical diagram"
                            }
                        ]
                    },
                    {
                        "id": 2042,
                        "answerText": "Produces hormones",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2043,
                        "answerText": "Stores energy",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2044,
                        "answerText": "Regulates temperature",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    }
                ],
                "createdAt": "2025-09-10T19:28:05.706Z",
                "updatedAt": "2025-09-10T19:28:05.706Z"
            },
            {
                "id": 506,
                "questionText": "What is the primary function of the kidney?",
                "questionType": "SINGLE_CHOICE",
                "explanation": "The kidney filters waste from blood.",
                "yearLevel": "ONE",
                "examYear": 2024,
                "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"kidney\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                "questionImages": [],
                "questionExplanationImages": [],
                "university": {
                    "id": 17,
                    "name": "University of Algiers",
                    "country": "Algeria"
                },
                "course": {
                    "id": 587,
                    "name": "Basic Anatomy",
                    "description": "Introduction to human anatomy",
                    "module": {
                        "id": 199,
                        "name": "Human Anatomy"
                    }
                },
                "source": {
                    "id": 13,
                    "name": "Medical Textbooks"
                },
                "questionAnswers": [
                    {
                        "id": 2045,
                        "answerText": "Filters waste",
                        "isCorrect": true,
                        "explanation": "This is the correct answer.",
                        "explanationImages": [
                            {
                                "id": 17,
                                "imagePath": "/images/explanations/kidney-diagram.jpg",
                                "altText": "kidney anatomical diagram"
                            }
                        ]
                    },
                    {
                        "id": 2046,
                        "answerText": "Produces hormones",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2047,
                        "answerText": "Stores energy",
                        "isCorrect": false,

"explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2048,
                        "answerText": "Regulates temperature",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    }
                ],
                "createdAt": "2025-09-10T19:28:05.768Z",
                "updatedAt": "2025-09-10T19:28:05.768Z"
            },
            {
                "id": 507,
                "questionText": "What is the primary function of the lung?",
                "questionType": "SINGLE_CHOICE",
                "explanation": "The lung facilitates gas exchange.",
                "yearLevel": "ONE",
                "examYear": 2024,
                "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"lung\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                "questionImages": [],
                "questionExplanationImages": [],
                "university": {
                    "id": 17,
                    "name": "University of Algiers",
                    "country": "Algeria"
                },
                "course": {
                    "id": 587,
                    "name": "Basic Anatomy",
                    "description": "Introduction to human anatomy",
                    "module": {
                        "id": 199,
                        "name": "Human Anatomy"
                    }
                },
                "source": {
                    "id": 13,
                    "name": "Medical Textbooks"
                },
                "questionAnswers": [
                    {
                        "id": 2049,
                        "answerText": "Gas exchange",
                        "isCorrect": true,
                        "explanation": "This is the correct answer.",
                        "explanationImages": [
                            {
                                "id": 18,
                                "imagePath": "/images/explanations/lung-diagram.jpg",
                                "altText": "lung anatomical diagram"
                            }
                        ]
                    },
                    {
                        "id": 2050,
                        "answerText": "Produces hormones",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2051,
                        "answerText": "Stores energy",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2052,
                        "answerText": "Regulates temperature",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    }
                ],
                "createdAt": "2025-09-10T19:28:05.818Z",
                "updatedAt": "2025-09-10T19:28:05.818Z"
            },
            {
                "id": 508,
                "questionText": "What is the primary function of the brain?",
                "questionType": "SINGLE_CHOICE",
                "explanation": "The brain controls body functions.",
                "yearLevel": "ONE",
                "examYear": 2024,
                "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"brain\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                "questionImages": [],
                "questionExplanationImages": [],
                "university": {
                    "id": 17,
                    "name": "University of Algiers",
                    "country": "Algeria"
                },
                "course": {
                    "id": 587,


"name": "Basic Anatomy",
                    "description": "Introduction to human anatomy",
                    "module": {
                        "id": 199,
                        "name": "Human Anatomy"
                    }
                },
                "source": {
                    "id": 13,
                    "name": "Medical Textbooks"
                },
                "questionAnswers": [
                    {
                        "id": 2053,
                        "answerText": "Controls functions",
                        "isCorrect": true,
                        "explanation": "This is the correct answer.",
                        "explanationImages": [
                            {
                                "id": 19,
                                "imagePath": "/images/explanations/brain-diagram.jpg",
                                "altText": "brain anatomical diagram"
                            }
                        ]
                    },
                    {
                        "id": 2054,
                        "answerText": "Produces hormones",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2055,
                        "answerText": "Stores energy",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2056,
                        "answerText": "Regulates temperature",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    }
                ],
                "createdAt": "2025-09-10T19:28:05.865Z",
                "updatedAt": "2025-09-10T19:28:05.865Z"
            },
            {
                "id": 509,
                "questionText": "What is the primary function of the stomach?",
                "questionType": "SINGLE_CHOICE",
                "explanation": "The stomach digests food.",
                "yearLevel": "ONE",
                "examYear": 2024,
                "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"stomach\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                "questionImages": [],
                "questionExplanationImages": [],
                "university": {
                    "id": 17,
                    "name": "University of Algiers",
                    "country": "Algeria"
                },
                "course": {
                    "id": 587,
                    "name": "Basic Anatomy",
                    "description": "Introduction to human anatomy",
                    "module": {
                        "id": 199,
                        "name": "Human Anatomy"
                    }
                },
                "source": {
                    "id": 13,
                    "name": "Medical Textbooks"
                },
                "questionAnswers": [
                    {
                        "id": 2057,
                        "answerText": "Digests food",
                        "isCorrect": true,
                        "explanation": "This is the correct answer.",
                        "explanationImages": [
                            {
                                "id": 20,
                                "imagePath": "/images/explanations/stomach-diagram.jpg",
                                "altText": "stomach anatomical diagram"
                            }
                        ]
                    },
                    {
                        "id": 2058,
                        "answerText": "Produces hormones",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },


{
                        "id": 2059,
                        "answerText": "Stores energy",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2060,
                        "answerText": "Regulates temperature",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    }
                ],
                "createdAt": "2025-09-10T19:28:05.919Z",
                "updatedAt": "2025-09-10T19:28:05.919Z"
            },
            {
                "id": 510,
                "questionText": "What is the primary function of the muscle?",
                "questionType": "SINGLE_CHOICE",
                "explanation": "The muscle enables movement.",
                "yearLevel": "ONE",
                "examYear": 2024,
                "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"muscle\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                "questionImages": [],
                "questionExplanationImages": [],
                "university": {
                    "id": 17,
                    "name": "University of Algiers",
                    "country": "Algeria"
                },
                "course": {
                    "id": 587,
                    "name": "Basic Anatomy",
                    "description": "Introduction to human anatomy",
                    "module": {
                        "id": 199,
                        "name": "Human Anatomy"
                    }
                },
                "source": {
                    "id": 13,
                    "name": "Medical Textbooks"
                },
                "questionAnswers": [
                    {
                        "id": 2061,
                        "answerText": "Enables movement",
                        "isCorrect": true,
                        "explanation": "This is the correct answer.",
                        "explanationImages": [
                            {
                                "id": 21,
                                "imagePath": "/images/explanations/muscle-diagram.jpg",
                                "altText": "muscle anatomical diagram"
                            }
                        ]
                    },
                    {
                        "id": 2062,
                        "answerText": "Produces hormones",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2063,
                        "answerText": "Stores energy",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    },
                    {
                        "id": 2064,
                        "answerText": "Regulates temperature",
                        "isCorrect": false,
                        "explanation": "This is incorrect.",
                        "explanationImages": []
                    }
                ],
                "createdAt": "2025-09-10T19:28:05.978Z",
                "updatedAt": "2025-09-10T19:28:05.978Z"
            }
        ],
        "answers": [
            {
                "questionId": 510
            },
            {
                "questionId": 509
            },
            {
                "questionId": 508
            },
            {
                "questionId": 507
            },
            {
                "questionId": 506,
                "selectedAnswerId": 2045,
                "isCorrect": true,
                "answeredAt": "2025-09-13T12:16:16.000Z"
            },
            {
                "questionId": 505,
                "selectedAnswerId": 2041,


"isCorrect": true,
                "answeredAt": "2025-09-13T12:16:15.983Z"
            },
            {
                "questionId": 504,
                "selectedAnswerId": 2037,
                "isCorrect": true,
                "answeredAt": "2025-09-13T12:16:15.964Z"
            }
        ],
        "createdAt": "2025-09-13T12:13:32.062Z",
        "updatedAt": "2025-09-13T12:16:16.017Z"
    },
    "meta": {
        "timestamp": "2025-09-13T12:52:20.280Z",
        "requestId": "roqmh92mc8"
    }
}