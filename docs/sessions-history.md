# sessions history (practice/exam) with examples

**Endpoint**: `{{base_url}}/api/v1/students/practise-sessions?uniteId=53&sessionType=PRACTICE`

**usage**:
- use "PRACTICE" for practice sessions
- use "EXAM" for exam sessions
- use correct unitId

**response**:
```json 
{
    "success": true,
    "data": {
        "success": true,
        "data": {
            "filterInfo": {
                "uniteId": 53,
                "moduleId": null,
                "uniteName": "Basic Medical Sciences",
                "moduleName": null,
                "sessionType": "PRACTICE"
            },
            "totalSessions": 2,
            "sessions": [
                {
                    "sessionId": 419,
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
                    "completedAt": "2025-09-10T17:28:09.661Z"
                },
                {
                    "sessionId": 630,
                    "title": "Valid EXAM Session",
                    "status": "NOT_STARTED",
                    "type": "PRACTICE",
                    "timeSpent": 0,
                    "totalQuestions": 7,
                    "questionsAnswered": 7,
                    "questionsNotAnswered": 0,
                    "correctAnswers": 0,
                    "incorrectAnswers": 7,
                    "score": 0,
                    "percentage": 0,
                    "averageTimePerQuestion": 0,
                    "completedAt": null
                }
            ],
            "aggregateStats": {
                "totalTimeSpent": 0,
                "totalQuestionsAnswered": 12,
                "totalCorrectAnswers": 4,
                "overallAccuracy": 33.33,
                "averageSessionScore": 42.5
            }
        }
    },
    "meta": {
        "timestamp": "2025-09-11T19:22:25.991Z",
        "requestId": "1npi73zd7ip"
    }
}
```