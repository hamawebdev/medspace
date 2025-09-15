endpoint: `GET /api/v1/students/notes/by-module?uniteId=X`

example response:
```json
{
  "success": true,
  "status": null,
  "coursesCount": 0,
  "notesCount": 0,
  "requestParams": {
    "uniteId": 10
  },
  "timestamp": "2025-09-08T18:37:58.505Z",
  "meta": {
    "requestId": "7qucb7g9u3x",
    "timestamp": "2025-09-08T18:40:54.396Z"
  },
  "data": {
    "unite": {
      "id": 10,
      "name": "Clinical Sciences - Residency Preparation",
      "notes": [
        {
          "id": 240,
          "noteText": "Note 236: Important points to remember for this question. Key concepts and study tips.",
          "createdAt": "2025-08-31T11:09:39.031Z",
          "questions": {
            "id": 193,
            "questionText": "Question 179: What is the primary function of the lymphatic system?",
            "questionType": "SINGLE_CHOICE",
            "examYear": 2024,
            "yearLevel": "ONE",
            "rotation": null,
            "course": {
              "id": 101
            },
            "module": {
              "id": 35,
              "name": "Pharmacology",
              "description": "Study of pharmacology"
            },
            "unite": {
              "id": 10,
              "name": "Clinical Sciences - Residency Preparation"
            },
            "name": "Pharmacology - Clinical Applications"
          }
        },
        {
          "id": 18,
          "noteText": "Note 14: Important points to remember for this question. Key concepts and study tips.",
          "createdAt": "2025-08-31T11:09:34.747Z",
          "questions": {
            "id": 77,
            "questionText": "Question 63: What is the primary function of the nervous system?",
            "questionType": "SINGLE_CHOICE",
            "examYear": 2022,
            "yearLevel": "FOUR",
            "rotation": null,
            "course": {
              "id": 95
            },
            "module": {
              "id": 33,
              "name": "Physiology",
              "description": "Study of physiology"
            },
            "unite": {
              "id": 10,
              "name": "Clinical Sciences - Residency Preparation"
            },
            "name": "Physiology - Clinical Applications"
          }
        }
      ]
    }
  }
}
```