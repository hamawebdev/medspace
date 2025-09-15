
## Endpoints

### 1. Create Practice Session by Label

**POST** `/api/v1/quiz-sessions/practice/:labelId`

Creates a new practice session with questions from the specified label and saves the mapping in LabelSession.

```bash
# Create practice session for label ID 1
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:3005/api/v1/quiz-sessions/practice/1
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": 123,
    "questionCount": 15,
    "title": "Practice: My Label Name"
  }
}
```
