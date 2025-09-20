# Session Calculations

# INDEPENDENT MODULE



ENDPOINT : GET `{{base_url}}/api/v1/studentspractise-sessionsmoduleId=49sessionType=PRACTICE`

reponse : 
```json
{
    "success": true,
    "data": {
        "success": true,
        "data": {
            "filterInfo": {
                "uniteId": null,
                "moduleId": 49,
                "uniteName": "Basic Medical Sciences",
                "moduleName": "Human Anatomy",
                "sessionType": "PRACTICE"
            },
            "totalSessions": 1,
            "sessions": [
                {
                    "sessionId": 1,
                    "title": "Practice Session - First Year Exam",
                    "status": "COMPLETED",
                    "type": "PRACTICE",
                    "timeSpent": 0,
                    "totalQuestions": 5,
                    "questionsAnswered": 5,
                    "questionsNotAnswered": 0,
                    "correctAnswers": 4,
                    "incorrectAnswers": 1,
                    "score": 85,
                    "percentage": 85,
                    "averageTimePerQuestion": 0,
                    "completedAt": "2025-09-20T14:36:31.832Z"
                }
            ],
            "aggregateStats": {
                "totalTimeSpent": 0,
                "totalQuestionsAnswered": 5,
                "totalCorrectAnswers": 4,
                "overallAccuracy": 80,
                "averageSessionScore": 85
            }
        }
    },
    "meta": {
        "timestamp": "2025-09-20T16:39:55.766Z",
        "requestId": "k4cwgfc5cbo"
    }
}
```

# UNIT

endpoint : `GET {{base_url}}/api/v1/students/practise-sessions?uniteId=1&sessionType=PRACTICE`

reponse : 
