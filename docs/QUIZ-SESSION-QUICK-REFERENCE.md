# Quiz Session API - Quick Reference Guide

## 🚀 Quick Start

### **1. Get Available Filters**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3005/api/v1/quizzes/quiz-filters
```

### **2. Create Basic Quiz**
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Quiz","settings":{"questionCount":10},"filters":{"courseIds":[10]}}' \
  http://localhost:3005/api/v1/quizzes/quiz-sessions
```

### **3. Create Retake Session**
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"originalSessionId":123,"retakeType":"INCORRECT_ONLY"}' \
  http://localhost:3005/api/v1/quiz-sessions/retake
```

## 📋 Request Templates

### **Minimal Request**
```json
{
  "title": "Basic Quiz",
  "settings": {"questionCount": 10},
  "filters": {"courseIds": [10]}
}
```

### **Full Featured Request**
```json
{
  "title": "Comprehensive Medical Quiz",
  "quizType": "QCM",
  "settings": {"questionCount": 25},
  "filters": {
    "yearLevels": ["ONE", "TWO"],
    "moduleIds": [12, 13],
    "courseIds": [10, 11, 12],
    "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICE"],
    "examYears": [2023, 2024],
    "quizSourceIds": [7, 8, 9]
  }
}
```

## 🎯 Real Database IDs

### **Courses**
- `10` - Basic Anatomy
- `11` - Advanced Anatomy  
- `12` - Cardiac Physiology
- `13` - Respiratory Physiology
- `14` - General Pathology

### **Modules**
- `12` - Human Anatomy
- `13` - Human Physiology
- `14` - Pathology

### **Quiz Sources**
- `7` - Medical Board Exams
- `8` - University Exams
- `9` - Practice Tests
- `10` - Residency Exams
- `11` - International Medical Exams
- `12` - Mock Exams

## 🔧 Common Patterns

### **By Question Type**
```json
// Single Choice Only
{"filters": {"courseIds": [10], "questionTypes": ["SINGLE_CHOICE"]}}

// Multiple Choice Only  
{"filters": {"courseIds": [10], "questionTypes": ["MULTIPLE_CHOICE"]}}

// Mixed Types
{"filters": {"courseIds": [10], "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICE"]}}
```

### **By Quiz Source**
```json
// Medical Board Questions
{"filters": {"quizSourceIds": [7]}}

// University + Practice Questions
{"filters": {"quizSourceIds": [8, 9]}}

// All Exam Sources
{"filters": {"quizSourceIds": [7, 8, 10, 11]}}
```

### **By Academic Level**
```json
// Module Level
{"filters": {"moduleIds": [12]}}

// Course Level
{"filters": {"courseIds": [10, 11]}}

// Mixed Levels
{"filters": {"moduleIds": [12], "courseIds": [13]}}
```

## ⚠️ Common Errors

### **400 Validation Errors**
```json
// Title with invalid characters
{"title": "Quiz: Test (Part 1)"}  // ❌ Contains : and ()
{"title": "Quiz - Test Part 1"}   // ✅ Valid

// Empty filters
{"filters": {}}                   // ❌ At least one filter required
{"filters": {"courseIds": [10]}}  // ✅ Valid

// Invalid question count
{"settings": {"questionCount": 0}}   // ❌ Must be 1-100
{"settings": {"questionCount": 101}} // ❌ Must be 1-100
{"settings": {"questionCount": 20}}  // ✅ Valid
```

### **404 No Questions Found**
```json
// Non-existent IDs
{"filters": {"courseIds": [999]}}     // ❌ Course doesn't exist
{"filters": {"quizSourceIds": [999]}} // ❌ Quiz source doesn't exist

// Valid but no matching questions
{"filters": {"courseIds": [10], "examYears": [1990]}} // ❌ No questions from 1990
```

### **403 Subscription Required**
```json
// Missing or expired subscription
// Response: "Active subscription required to access quiz sessions"
```

## 🔄 Retake Session Types

### **Retake Types**
- `SAME` - Exact same questions
- `INCORRECT_ONLY` - Only wrong answers
- `CORRECT_ONLY` - Only correct answers  
- `NOT_RESPONDED` - Only unanswered questions

### **Requirements**
- Original session must be `COMPLETED`
- User must own the original session
- Valid retake type required

## 📊 Response Formats

### **Success Response**
```json
{
  "success": true,
  "data": {"sessionId": 123}
}
```

### **Error Response**
```json
{
  "success": false,
  "error": {
    "type": "NoQuestionsFoundError",
    "message": "No questions found matching the specified filters",
    "timestamp": "2025-08-06T13:45:30.123Z",
    "requestId": "req_abc123"
  }
}
```

## 🎯 Validation Limits

| Field | Min | Max | Notes |
|-------|-----|-----|-------|
| `title` | 3 chars | 100 chars | Alphanumeric + `-_.,!?` only |
| `questionCount` | 1 | 100 | Integer |
| `yearLevels` | - | 7 items | Enum values |
| `uniteIds` | - | 10 items | Positive integers |
| `moduleIds` | - | 20 items | Positive integers |
| `courseIds` | - | 50 items | Positive integers |
| `questionTypes` | 1 item | 2 items | Cannot be empty if provided |
| `examYears` | 1 item | 20 items | 1900-2035 range |
| `quizSourceIds` | 1 item | 10 items | Positive integers |

## 🔐 Authentication

### **Required Headers**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### **Token Requirements**
- Valid JWT token
- Active subscription
- Current payment status

## 🧪 Testing Commands

### **Test Server Connection**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3005/api/v1/quizzes/quiz-filters
```

### **Test Quiz Creation**
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Quiz","settings":{"questionCount":5},"filters":{"courseIds":[10]}}' \
  http://localhost:3005/api/v1/quizzes/quiz-sessions
```

### **Test Validation**
```bash
# Should fail with validation error
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"","settings":{"questionCount":0},"filters":{}}' \
  http://localhost:3005/api/v1/quizzes/quiz-sessions
```

## 📚 Related Documentation

- **Full API Documentation**: `QUIZ-SESSION-API-DOCUMENTATION.md`
- **Quiz Source Filtering Guide**: `QUIZ-SOURCE-FILTERING-GUIDE.md`
- **Retake Testing Guide**: `RETAKE-TESTING-GUIDE.md`
- **Title Validation Guide**: `TITLE-VALIDATION-GUIDE.md`

## 🎉 Quick Success Test

```bash
# 1. Get your JWT token from login
TOKEN="your_jwt_token_here"

# 2. Check available filters
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3005/api/v1/quizzes/quiz-filters

# 3. Create a quiz with real data
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Quiz",
    "settings": {"questionCount": 5},
    "filters": {"courseIds": [10]}
  }' \
  http://localhost:3005/api/v1/quizzes/quiz-sessions

# 4. If successful, you'll get: {"success": true, "data": {"sessionId": 123}}
```

---

**Quick Reference Version**: 1.0  
**Last Updated**: August 2025
