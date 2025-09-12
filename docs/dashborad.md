**endpoint**: 
`{{base_url}}/api/v1/students/dashboard/stats`

response:
```json
{
    "success": true,
    "data": {
        "todosToday": [],
        "lastSessionByCreated": {
            "id": 239,
            "title": "Practice Session - llll",
            "type": "PRACTICE",
            "status": "IN_PROGRESS",
            "score": 0,
            "percentage": 0,
            "createdAt": "2025-09-08T19:28:27.180Z",
            "quiz": null,
            "exam": null
        },
        "lastSessionByAnswer": {
            "id": 232,
            "title": "test 1",
            "type": "EXAM",
            "status": "COMPLETED",
            "score": 20,
            "percentage": 100,
            "updatedAt": "2025-09-07T20:39:41.249Z",
            "quiz": null,
            "exam": null
        },
        "questionCount": 214,
        "unitsCount": 28,
        "independentModulesCount": 1,
        "staticExamsCount": 5,
        "userStudyPacks": [
            {
                "id": 3,
                "name": "Residency Preparation",
                "description": "Preparation for medical residency exams",
                "type": "RESIDENCY",
                "yearNumber": null,
                "pricePerMonth": "250",
                "pricePerYear": "2500",
                "subscription": {
                    "id": 1,
                    "status": "ACTIVE",
                    "startDate": "2025-08-01T11:08:38.915Z",
                    "endDate": "2026-08-01T11:08:38.915Z",
                    "amountPaid": 100
                }
            },
            {
                "id": 3,
                "name": "Residency Preparation",
                "description": "Preparation for medical residency exams",
                "type": "RESIDENCY",
                "yearNumber": null,
                "pricePerMonth": "250",
                "pricePerYear": "2500",
                "subscription": {
                    "id": 59,
                    "status": "ACTIVE",
                    "startDate": "2025-01-24T11:08:57.745Z",
                    "endDate": "2025-08-01T11:08:57.745Z",
                    "amountPaid": 120
                }
            }
        ],
        "userSubscriptions": [
            {
                "id": 59,
                "status": "ACTIVE",
                "startDate": "2025-01-24T11:08:57.745Z",
                "endDate": "2025-08-01T11:08:57.745Z",
                "amountPaid": 120,
                "paymentMethod": "Credit Card",
                "studyPack": {
                    "id": 3,
                    "name": "Residency Preparation",
                    "type": "RESIDENCY",
                    "yearNumber": null
                }
            },
            {
                "id": 1,
                "status": "ACTIVE",
                "startDate": "2025-08-01T11:08:38.915Z",
                "endDate": "2026-08-01T11:08:38.915Z",
                "amountPaid": 100,
                "paymentMethod": "Credit Card",
                "studyPack": {
                    "id": 3,
                    "name": "Residency Preparation",
                    "type": "RESIDENCY",
                    "yearNumber": null
                }
            }
        ],
        "userProfile": {
            "id": 1,
            "email": "test@example.com",
            "fullName": "Test Student",
            "role": "STUDENT",
            "currentYear": "ONE",
            "emailVerified": true,
            "isActive": true,
            "lastLogin": "2025-09-08T19:09:32.865Z",
            "university": {
                "id": 2,
                "name": "Test University",
                "country": "Algeria"
            },
            "specialty": {
                "id": 2,
                "name": "Medicine"
            }
        },
        "answersLast7Days": [
            {
                "date": "2025-08-31",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            },
            {
                "date": "2025-09-01",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            },
            {
                "date": "2025-09-02",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            },
            {
                "date": "2025-09-03",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            },
            {
                "date": "2025-09-04",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            },
            {
                "date": "2025-09-05",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            },
            {
                "date": "2025-09-06",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            }
        ]
    },
    "meta": {
        "timestamp": "2025-09-08T19:54:07.239Z",
        "requestId": "p82sob5ijl"
    }
}
```