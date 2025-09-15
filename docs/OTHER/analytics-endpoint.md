# Analytics endpoint

**Endpoint**: `GET {{base_url}}/api/v1/quiz-sessions/type/{PRACTICE}`
- PRACTICE or EXAM or RESIDENCY


**Response**:

{
    "success": true,
    "data": {
        "sessions": [
            {
                "id": 667,
                "type": "PRACTICE",
                "title": "test continue",
                "stats": {
                    "averagePerQuestion": 17,
                    "totalQuestions": 5,
                    "answeredCorrect": 2,
                    "answeredWrong": 2,
                    "consulted": 0,
                    "accuracy": "50%"
                },
                "courses": [
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 4,
                        "answeredCorrect": 2,
                        "answeredWrong": 1,
                        "consulted": 0,
                        "accuracy": "67%"
                    },
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 1,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 666,
                "type": "PRACTICE",
                "title": "FFF",
                "stats": {
                    "averagePerQuestion": 45,
                    "totalQuestions": 3,
                    "answeredCorrect": 1,
                    "answeredWrong": 1,
                    "consulted": 0,
                    "accuracy": "50%"
                },
                "courses": [
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 2,
                        "answeredCorrect": 1,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "100%"
                    },
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 1,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 665,
                "type": "PRACTICE",
                "title": "NAD",
                "stats": {
                    "averagePerQuestion": 22,
                    "totalQuestions": 4,
                    "answeredCorrect": 0,
                    "answeredWrong": 2,
                    "consulted": 2,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 2,
                        "answeredCorrect": 0,
                        "answeredWrong": 2,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 2,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 2,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 664,
                "type": "PRACTICE",
                "title": "Practice: Important",
                "stats": {
                    "averagePerQuestion": 29,
                    "totalQuestions": 4,
                    "answeredCorrect": 0,
                    "answeredWrong": 4,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 2,
                        "answeredCorrect": 0,
                        "answeredWrong": 2,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {


"name": "Cardiac Physiology",
                        "totalQuestions": 2,
                        "answeredCorrect": 0,
                        "answeredWrong": 2,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 663,
                "type": "PRACTICE",
                "title": "dsdsd",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 7,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 662,
                "type": "PRACTICE",
                "title": "Practice: Important",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 2,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 2,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 661,
                "type": "PRACTICE",
                "title": "Practice Session - Important",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 2,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 2,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 660,
                "type": "PRACTICE",
                "title": "Valid EXAM Session - Retake",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 7,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 7,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 7,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 7,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 659,
                "type": "PRACTICE",
                "title": "Practice Session - Review Later",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 1,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,


"consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 658,
                "type": "PRACTICE",
                "title": "Practice Session - Review Later",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 1,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 657,
                "type": "PRACTICE",
                "title": "Practice Session - Important",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 1,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 656,
                "type": "PRACTICE",
                "title": "Valid EXAM Session - Retake",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 7,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 7,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 7,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 7,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 655,
                "type": "PRACTICE",
                "title": "Valid EXAM Session",
                "stats": {
                    "averagePerQuestion": 17,
                    "totalQuestions": 7,
                    "answeredCorrect": 3,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "100%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 7,
                        "answeredCorrect": 3,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "100%"
                    }
                ]
            },
            {
                "id": 654,
                "type": "PRACTICE",
                "title": "dsdsd - Retake",
                "stats": {
                    "averagePerQuestion": 2,
                    "totalQuestions": 13,
                    "answeredCorrect": 0,
                    "answeredWrong": 3,
                    "consulted": 10,
                    "accuracy": "0%"
                },
                "courses": [
                    {


"name": "Basic Anatomy",
                        "totalQuestions": 7,
                        "answeredCorrect": 0,
                        "answeredWrong": 3,
                        "consulted": 4,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 6,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 653,
                "type": "PRACTICE",
                "title": "ffdfd - Retake - Incorrect Only",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 1,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 1,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 1,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 652,
                "type": "PRACTICE",
                "title": "ffdfd - Retake",
                "stats": {
                    "averagePerQuestion": 10,
                    "totalQuestions": 8,
                    "answeredCorrect": 1,
                    "answeredWrong": 1,
                    "consulted": 6,
                    "accuracy": "50%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 2,
                        "answeredCorrect": 1,
                        "answeredWrong": 1,
                        "consulted": 0,
                        "accuracy": "50%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 6,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 651,
                "type": "PRACTICE",
                "title": "ffdfd",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 8,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 2,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 650,
                "type": "PRACTICE",
                "title": "rererere",
                "stats": {
                    "averagePerQuestion": 30,
                    "totalQuestions": 8,
                    "answeredCorrect": 1,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "100%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",


"totalQuestions": 2,
                        "answeredCorrect": 1,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "100%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 649,
                "type": "PRACTICE",
                "title": "rererere",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 8,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 2,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 648,
                "type": "PRACTICE",
                "title": "dddd",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 7,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 647,
                "type": "PRACTICE",
                "title": "dddd",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 7,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 646,
                "type": "PRACTICE",
                "title": "fdfdf",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 9,
                    "answeredCorrect": 0,


"answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 3,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 645,
                "type": "PRACTICE",
                "title": "dsdsd",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 13,
                    "answeredCorrect": 5,
                    "answeredWrong": 8,
                    "consulted": 0,
                    "accuracy": "38%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 7,
                        "answeredCorrect": 3,
                        "answeredWrong": 4,
                        "consulted": 0,
                        "accuracy": "43%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 2,
                        "answeredWrong": 4,
                        "consulted": 0,
                        "accuracy": "33%"
                    }
                ]
            },
            {
                "id": 644,
                "type": "PRACTICE",
                "title": "vfvvv",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 2,
                    "answeredCorrect": 1,
                    "answeredWrong": 1,
                    "consulted": 0,
                    "accuracy": "50%"
                },
                "courses": [
                    {
                        "name": "Physiology - Introduction",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 1,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Pathology - Advanced Concepts",
                        "totalQuestions": 1,
                        "answeredCorrect": 1,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "100%"
                    }
                ]
            },
            {
                "id": 643,
                "type": "PRACTICE",
                "title": "Basic Anatomy, Cardiac Physiology",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 6,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 642,
                "type": "PRACTICE",
                "title": "test",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 8,
                    "answeredCorrect": 0,


"answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 2,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 641,
                "type": "PRACTICE",
                "title": "test",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 8,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 2,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 640,
                "type": "PRACTICE",
                "title": "Practice Session - First Year Exam - Incorrect Only",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 1,
                    "answeredCorrect": 0,
                    "answeredWrong": 1,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,
                        "answeredCorrect": 0,
                        "answeredWrong": 1,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 639,
                "type": "PRACTICE",
                "title": "test 10",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 5,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 5,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 638,
                "type": "PRACTICE",
                "title": "Practice Session - First Year Exam - Incorrect Only",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 1,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 1,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 1,


"answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 1,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 637,
                "type": "PRACTICE",
                "title": "Basic Anatomy, Cardiac Physiology",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 13,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 7,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    },
                    {
                        "name": "Cardiac Physiology",
                        "totalQuestions": 6,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 630,
                "type": "PRACTICE",
                "title": "Valid EXAM Session",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 7,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 7,
                        "answeredCorrect": 0,
                        "answeredWrong": 0,
                        "consulted": 0,
                        "accuracy": "0%"
                    }
                ]
            },
            {
                "id": 559,
                "type": "PRACTICE",
                "title": "Session 133: Quiz 44: Anatomy - Advanced Concepts",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 0,
                    "answeredCorrect": 0,
                    "answeredWrong": 0,
                    "consulted": 0,
                    "accuracy": "0%"
                },
                "courses": []
            },
            {
                "id": 419,
                "type": "PRACTICE",
                "title": "Practice Session - First Year Exam",
                "stats": {
                    "averagePerQuestion": 0,
                    "totalQuestions": 5,
                    "answeredCorrect": 4,
                    "answeredWrong": 1,
                    "consulted": 0,
                    "accuracy": "80%"
                },
                "courses": [
                    {
                        "name": "Basic Anatomy",
                        "totalQuestions": 5,
                        "answeredCorrect": 4,
                        "answeredWrong": 1,
                        "consulted": 0,
                        "accuracy": "80%"
                    }
                ]
            }
        ]
    },
    "meta": {
        "timestamp": "2025-09-14T12:00:23.886Z",
        "requestId": "isa8jvd3g4"
    }
}