# Session Creation - Quick Reference Guide

## 🚀 Quick Start

### Practice Session
```bash
curl -X POST "http://localhost:3005/api/v1/quizzes/sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Practice Quiz",
    "sessionType": "PRACTISE",
    "questionCount": 10,
    "courseIds": [1, 2]
  }'
```

### Exam Session
```bash
curl -X POST "http://localhost:3005/api/v1/quizzes/sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Final Exam",
    "sessionType": "EXAM",
    "courseIds": [1, 2],
    "years": [2023],
    "universityIds": [1],
    "questionSourceIds": [1]
  }'
```

## 📋 Required Fields

| Session Type | Required Fields |
|--------------|----------------|
| **PRACTISE** | `title`, `sessionType`, `questionCount`, `courseIds` |
| **EXAM** | `title`, `sessionType`, `courseIds`, `years`, `universityIds`, `questionSourceIds` |

## ⚠️ Key Differences

| Feature | PRACTISE | EXAM |
|---------|----------|------|
| Question Count | Limited to specified number | ALL available questions |
| Question Types | Can be filtered | All types included |
| Years | Optional (multiple allowed) | **Required (single item only)** |
| University IDs | Optional (multiple allowed) | **Required (single item only)** |
| Question Source IDs | Optional (multiple allowed) | **Required (single item only)** |

## 🔧 Validation Rules

### PRACTISE Sessions
- ✅ `questionCount` is required (1-100)
- ✅ `questionTypes` can filter question types
- ✅ `years` and `universityIds` are optional

### EXAM Sessions  
- ❌ `questionCount` is ignored
- ❌ `questionTypes` is ignored
- ✅ `years` is required (exactly 1 item)
- ✅ `universityIds` is required (exactly 1 item)
- ✅ `questionSourceIds` is required (exactly 1 item)

## 🧪 Test Your Implementation

Run the test script to verify your setup:
```bash
./test-session-validation.sh
```

## 📊 Response Format

### Success
```json
{
  "success": true,
  "data": {
    "sessionId": 123,
    "title": "Your Session Title",
    "questionCount": 10,
    "filtersApplied": { ... }
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Validation failed: ..."
  }
}
```

## 🚨 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Question count is required for PRACTISE sessions" | Missing `questionCount` for PRACTISE | Add `questionCount` field |
| "Years, University IDs, and Question Source IDs are required for EXAM sessions and must contain exactly one item each" | Missing or multiple items in required fields for EXAM | Use single items: `years: [2023]`, `universityIds: [1]`, `questionSourceIds: [1]` |
| "Active subscription required" | Expired or no subscription | Check subscription status |
| "Insufficient questions" | Not enough questions match filters | Adjust filters or reduce `questionCount` |

## 💡 Pro Tips

1. **Always check `success` field** in response
2. **Use descriptive titles** for better organization
3. **Validate course IDs** exist in your system
4. **Handle errors gracefully** with user-friendly messages
5. **Monitor question availability** for your filter combinations
6. **For EXAM sessions**: Use exactly one item in `years`, `universityIds`, and `questionSourceIds` arrays

---

*For detailed documentation, see `SESSION_CREATION_API_DOCUMENTATION.md`*
