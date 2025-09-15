**endpoint**: 
`{{base_url}}/api/v1/students/dashboard/stats`

response:
```json

{
    "success": true,
    "data": {
        "todosToday": [
            {
                "id": 919,
                "title": "sasasasas",
                "description": "sasasasza",
                "type": "EXAM",
                "priority": "MEDIUM",
                "status": "PENDING",
                "dueDate": "2025-09-13T20:15:00.000Z",
                "courses": []
            },
            {
                "id": 920,
                "title": "Read 2 courses: Physiology -sasasas Advanced Concepts, Physiology - Clinical Applications",
                "description": "asassas",
                "type": "READING",
                "priority": "MEDIUM",
                "status": "PENDING",
                "dueDate": "2025-09-13T22:14:00.000Z",
                "courses": [
                    {
                        "id": 656,
                        "name": "Physiology - Advanced Concepts",
                        "module": {
                            "id": 223,
                            "name": "Physiology",
                            "studyPack": null
                        }
                    },
                    {
                        "id": 657,
                        "name": "Physiology - Clinical Applications",
                        "module": {
                            "id": 223,
                            "name": "Physiology",
                            "studyPack": null
                        }
                    }
                ]
            },
            {
                "id": 753,
                "title": "Todo 138: READING task",
                "description": "Complete reading task for better understanding",
                "type": "READING",
                "priority": "HIGH",
                "status": "IN_PROGRESS",
                "dueDate": "2025-09-13T19:29:19.166Z",
                "courses": [
                    {
                        "id": 753,
                        "name": "Physiology - Clinical Applications",
                        "module": {
                            "id": 255,
                            "name": "Physiology",
                            "studyPack": null
                        }
                    }
                ]
            }
        ],
        "lastSessionByCreated": {
            "id": 666,
            "title": "FFF",
            "type": "PRACTICE",
            "status": "IN_PROGRESS",
            "score": 1.333333333333333,
            "percentage": 44.44,
            "createdAt": "2025-09-13T19:32:03.263Z",
            "quiz": null,
            "exam": null
        },
        "lastSessionByAnswer": {
            "id": 666,
            "title": "FFF",
            "type": "PRACTICE",
            "status": "IN_PROGRESS",
            "score": 1.333333333333333,
            "percentage": 44.44,
            "updatedAt": "2025-09-13T19:36:33.661Z",
            "quiz": null,
            "exam": null
        },
        "questionCount": 294,
        "unitsCount": 90,
        "independentModulesCount": 12,
        "staticExamsCount": 5,
        "userStudyPacks": [
            {
                "id": 34,
                "name": "Résidanat",
                "description": "Pack spécialisé pour la préparation au résidanat",
                "type": "residency",
                "yearNumber": "SEVEN",
                "pricePerMonth": "2000",
                "pricePerYear": "20000",
                "subscription": {
                    "id": 209,
                    "status": "ACTIVE",
                    "startDate": "2025-08-11T19:28:05.432Z",
                    "endDate": "2026-08-11T19:28:05.432Z",
                    "amountPaid": 100
                }
            }
        ],
        "userSubscriptions": [
            {
                "id": 209,
                "status": "ACTIVE",
                "startDate": "2025-08-11T19:28:05.432Z",
                "endDate": "2026-08-11T19:28:05.432Z",
                "amountPaid": 100,
                "paymentMethod": "Credit Card",
                "studyPack": {
                    "id": 34,


"name": "Résidanat",
                    "type": "residency",
                    "yearNumber": "SEVEN"
                }
            }
        ],
        "userProfile": {
            "id": 101,
            "email": "test@example.com",
            "fullName": "Test Student",
            "role": "STUDENT",
            "currentYear": "ONE",
            "emailVerified": true,
            "isActive": true,
            "lastLogin": "2025-09-13T20:19:08.776Z",
            "university": {
                "id": 18,
                "name": "Test University",
                "country": "Algeria"
            },
            "specialty": {
                "id": 20,
                "name": "Medicine"
            }
        },
        "answersLast7Days": [
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
            },
            {
                "date": "2025-09-07",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            },
            {
                "date": "2025-09-08",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            },
            {
                "date": "2025-09-09",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            },
            {
                "date": "2025-09-10",
                "correct": 4,
                "incorrect": 1,
                "total": 5
            },
            {
                "date": "2025-09-11",
                "correct": 0,
                "incorrect": 0,
                "total": 0
            }
        ]
    },
    "meta": {
        "timestamp": "2025-09-13T20:19:51.196Z",
        "requestId": "9fjhavcjmde"
    }
}
```