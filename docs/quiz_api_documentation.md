# Quiz API Documentation

## Overview
This API allows you to create and manage quiz sessions for practice tests. The workflow involves creating a quiz session and then retrieving the session details with questions.

---

## 1. Create a Quiz Session

### Purpose
Creates a new quiz session with specified parameters and filters.

### Endpoint
```http
POST {{base_url}}/quizzes/quiz-sessions
```

### Request Body
```json
{
  "title": "Medical Board Practice Quiz",
  "settings": {
    "questionCount": 10
  },
  "filters": {
    "quizSourceIds": [7, 8],
    "questionTypes": ["SINGLE_CHOICE"]
  }
}
```

### Request Body Explanation

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | The name/title of the quiz session |
| `settings` | Object | Configuration settings for the quiz |
| `settings.questionCount` | Number | How many questions to include in the quiz |
| `filters` | Object | Criteria to filter which questions are included |
| `filters.quizSourceIds` | Array | IDs of question sources/banks to pull from |
| `filters.questionTypes` | Array | Types of questions to include (e.g., "SINGLE_CHOICE") |

### Response
```json
{
    "success": true,
    "data": {
        "sessionId": 137
    },
    "meta": {
        "timestamp": "2025-08-06T19:17:44.128Z",
        "requestId": "kv1vmaello8"
    }
}
```

### Response Explanation

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Indicates if the request was successful |
| `data.sessionId` | Number | Unique identifier for the created quiz session |
| `meta.timestamp` | String | When the request was processed (ISO 8601 format) |
| `meta.requestId` | String | Unique identifier for tracking this specific request |

---

## 2. Retrieve Quiz Session Details

### Purpose
Fetches complete details of a quiz session including all questions and answer options.

### Endpoint
```http
GET {{base_url}}/quiz-sessions/137
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `sessionId` | Number | The ID of the quiz session to retrieve (137 in this example) |

### Response Structure

```json
{
    "success": true,
    "data": {
        "id": 137,
        "title": "Medical Board Practice Quiz",
        "type": "PRACTICE",
        "status": "NOT_STARTED",
        "score": 0,
        "percentage": 0,
        "questions": [...],
        "answers": [],
        "createdAt": "2025-08-06T19:17:44.112Z",
        "updatedAt": "2025-08-06T19:17:44.112Z"
    },
    "meta": {...}
}
```

### Session Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique identifier for the quiz session |
| `title` | String | Name of the quiz session |
| `type` | String | Type of quiz (e.g., "PRACTICE") |
| `status` | String | Current status ("NOT_STARTED", "IN_PROGRESS", "COMPLETED") |
| `score` | Number | Current score (0 if not started) |
| `percentage` | Number | Score as percentage (0 if not started) |
| `questions` | Array | List of all questions in the quiz |
| `answers` | Array | User's submitted answers (empty if not started) |
| `createdAt` | String | When the session was created |
| `updatedAt` | String | When the session was last modified |

---

## 3. Question Structure

Each question in the `questions` array has the following structure:

```json
{
    "id": 56,
    "questionText": "What is the primary function of the kidney?",
    "questionType": "SINGLE_CHOICE",
    "explanation": "The kidney filters waste from blood.",
    "answers": [...]
}
```

### Question Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique identifier for the question |
| `questionText` | String | The actual question text displayed to user |
| `questionType` | String | Type of question (e.g., "SINGLE_CHOICE") |
| `explanation` | String | General explanation about the question topic |
| `answers` | Array | List of possible answer options |

---

## 4. Answer Structure

Each answer option within a question has this structure:

```json
{
    "id": 197,
    "answerText": "Filters waste",
    "isCorrect": true,
    "explanation": "This is the correct answer.",
    "explanationImages": [
        {
            "id": 12,
            "imagePath": "/images/explanations/kidney-diagram.jpg",
            "altText": "kidney anatomical diagram"
        }
    ]
}
```

### Answer Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique identifier for the answer option |
| `answerText` | String | The text of the answer choice |
| `isCorrect` | Boolean | Whether this is the correct answer |
| `explanation` | String | Explanation for why this answer is correct/incorrect |
| `explanationImages` | Array | Images that help explain the answer |

---

## 5. Explanation Image Structure

When an answer includes explanatory images:

```json
{
    "id": 12,
    "imagePath": "/images/explanations/kidney-diagram.jpg",
    "altText": "kidney anatomical diagram"
}
```

### Image Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique identifier for the image |
| `imagePath` | String | Path/URL to the image file |
| `altText` | String | Alternative text for accessibility |

---

## 6. Common Response Metadata

All API responses include a `meta` object:

```json
{
    "timestamp": "2025-08-06T19:18:44.174Z",
    "requestId": "5ndlooixqsg"
}
```

### Meta Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | String | When the response was generated (ISO 8601) |
| `requestId` | String | Unique identifier for request tracking/debugging |

---

## 7. Typical Workflow

1. **Create Session**: POST to `/quizzes/quiz-sessions` with quiz parameters
2. **Get Session ID**: Extract `sessionId` from the creation response
3. **Retrieve Questions**: GET `/quiz-sessions/{sessionId}` to get all questions
4. **Present Quiz**: Display questions and answers to the user
5. **Submit Answers**: (Not shown in example) Submit user's answers
6. **Get Results**: (Not shown in example) Retrieve final scores and explanations

---

## 8. Question Types

Based on the examples, the API supports:

- **SINGLE_CHOICE**: Multiple choice questions with one correct answer
- Other types may be available but aren't shown in this example

---

## 9. Status Values

Quiz sessions can have different statuses:

- **NOT_STARTED**: Session created but user hasn't begun
- **IN_PROGRESS**: User is actively taking the quiz
- **COMPLETED**: Quiz finished, results available