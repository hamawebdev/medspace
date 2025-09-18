
### Get Question Reports
**GET** `/admin/questions/reports`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

response:
```json

{
    "success": true,
    "data": {
        "reports": [
            {
                "id": 15,
                "userId": 202,
                "questionId": 1048,
                "reportType": "TYPO",
                "description": "nnnnnjcewewe",
                "status": "PENDING",
                "reviewedById": null,
                "adminResponse": null,
                "createdAt": "2025-09-16T18:56:42.825Z",
                "updatedAt": "2025-09-16T18:56:42.825Z",
                "user": {
                    "fullName": "Ahmed Ben Ali",
                    "email": "student1@university.dz"
                },
                "question": {
                    "id": 1048,
                    "courseId": 1439,
                    "examId": 159,
                    "sourceId": 27,
                    "questionText": "What is the primary function of the stomach?",
                    "explanation": "The stomach digests food.",
                    "questionType": "SINGLE_CHOICE",
                    "universityId": 30,
                    "yearLevel": "ONE",
                    "examYear": 2024,
                    "rotation": null,
                    "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"stomach\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                    "createdById": 204,
                    "createdAt": "2025-09-14T18:00:17.007Z",
                    "updatedAt": "2025-09-14T18:00:17.007Z",
                    "questionAnswers": [
                        {
                            "id": 4224,
                            "questionId": 1048,
                            "answerText": "Digests food",
                            "isCorrect": true,
                            "explanation": "This is the correct answer.",
                            "createdAt": "2025-09-14T18:00:17.013Z"
                        },
                        {
                            "id": 4225,
                            "questionId": 1048,
                            "answerText": "Produces hormones",
                            "isCorrect": false,
                            "explanation": "This is incorrect.",
                            "createdAt": "2025-09-14T18:00:17.022Z"
                        },
                        {
                            "id": 4226,
                            "questionId": 1048,
                            "answerText": "Stores energy",
                            "isCorrect": false,
                            "explanation": "This is incorrect.",
                            "createdAt": "2025-09-14T18:00:17.027Z"
                        },
                        {
                            "id": 4227,
                            "questionId": 1048,
                            "answerText": "Regulates temperature",
                            "isCorrect": false,
                            "explanation": "This is incorrect.",
                            "createdAt": "2025-09-14T18:00:17.032Z"
                        }
                    ],
                    "course": {
                        "name": "Basic Anatomy"
                    }
                },
                "reviewedBy": null
            },
            {
                "id": 12,
                "userId": 201,
                "questionId": 1045,
                "reportType": "TYPO",
                "description": "There is a spelling error in the question text.",
                "status": "PENDING",
                "reviewedById": null,
                "adminResponse": null,
                "createdAt": "2025-09-14T18:00:20.043Z",
                "updatedAt": "2025-09-14T18:00:20.043Z",
                "user": {
                    "fullName": "Test Student",
                    "email": "test@example.com"
                },
                "question": {
                    "id": 1045,
                    "courseId": 1439,
                    "examId": 159,
                    "sourceId": 27,
                    "questionText": "What is the primary function of the kidney?",
                    "explanation": "The kidney filters waste from blood.",
                    "questionType": "SINGLE_CHOICE",
                    "universityId": 30,
                    "yearLevel": "ONE",
                    "examYear": 2024,
                    "rotation": null,
                    "metadata": "{\"difficulty\":\"beginner\",\"topic\":\"kidney\",\"category\":\"anatomy\",\"estimatedTime\":60}",
                    "createdById": 204,
                    "createdAt": "2025-09-14T18:00:16.898Z",
                    "updatedAt": "2025-09-14T18:00:16.898Z",
                    "questionAnswers": [
                        {
                            "id": 4212,
                            "questionId": 1045,
                            "answerText": "Filters waste",
                            "isCorrect": true,
                            "explanation": "This is the correct answer.",
                            "createdAt": "2025-09-14T18:00:16.905Z"
                        },
                        {
                            "id": 4213,
                            "questionId": 1045,
                            "answerText": "Produces hormones",
                            "isCorrect": false,
                            "explanation": "This is incorrect.",
                            "createdAt": "2025-09-14T18:00:16.915Z"
                        },
                        {
                            "id": 4214,
                            "questionId": 1045,
                            "answerText": "Stores energy",
                            "isCorrect": false,
                            "explanation": "This is incorrect.",
                            "createdAt": "2025-09-14T18:00:16.921Z"
                        },
                        {
                            "id": 4215,
                            "questionId": 1045,
                            "answerText": "Regulates temperature",
                            "isCorrect": false,
                            "explanation": "This is incorrect.",
                            "createdAt": "2025-09-14T18:00:16.926Z"
                        }
                    ],
                    "course": {
                        "name": "Basic Anatomy"
                    }
                },
                "reviewedBy": null
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalCount": 2,
            "limit": 10,
            "hasNextPage": false,
            "hasPreviousPage": false
        }
    },
    "meta": {
        "timestamp": "2025-09-17T09:27:50.764Z",
        "requestId": "sftf635ofx"
    }
}
```
### Review Question Report
**PUT** `/admin/questions/reports/{id}`

**Path Parameters:**
- `id` (required): Report ID

**Report Status Values:**
- PENDING
- REVIEWED
- RESOLVED
- DISMISSED

**Request Body:**
```json
{
  "response": "thank you",
  "action": "RESOLVED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "userId": 202,
    "questionId": 1048,
    "reportType": "TYPO",
    "description": "nnnnnjcewewe",
    "status": "RESOLVED",
    "reviewedById": 1,
    "adminResponse": "Issue has been fixed",
    "createdAt": "2025-09-16T18:56:42.825Z",
    "updatedAt": "2025-09-17T10:30:15.123Z",
    "user": {
      "fullName": "Ahmed Ben Ali",
      "email": "student1@university.dz"
    },
    "question": {
      "id": 1048,
      "questionText": "What is the primary function of the stomach?",
      "questionType": "SINGLE_CHOICE"
    },
    "reviewedBy": {
      "fullName": "Admin User",
      "email": "admin@university.dz"
    }
  },
  "meta": {
    "timestamp": "2025-09-17T10:30:15.123Z",
    "requestId": "abc123def"
  }
}
```

---