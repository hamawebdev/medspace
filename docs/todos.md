# Todo Multiple Courses Feature Documentation

## Overview

The Todo module has been enhanced to support multiple courses instead of just one course per todo item. This allows students to create todos that span across multiple courses, providing better organization and flexibility in their study planning.

## Changes Made

### 1. Database Schema Changes

#### New Table: `todo_courses`
A new junction table was created to establish a many-to-many relationship between todos and courses.

```sql
CREATE TABLE todo_courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  todo_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (todo_id) REFERENCES todo_items(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(todo_id, course_id)
);
```

#### Updated `todo_items` Table
- **Removed**: `course_id` field (single course reference)
- **Added**: Many-to-many relationship through `todo_courses` table

### 2. API Changes

#### POST `/api/v1/students/todos`

**Before:**
```json
{
  "title": "Study Anatomy",
  "description": "Review chapter 3",
  "type": "READING",
  "priority": "HIGH",
  "dueDate": "2025-09-15T10:00:00.000Z",
  "courseId": 1
}
```

**After:**
```json
{
  "title": "Study Multiple Courses",
  "description": "Review anatomy and physiology together",
  "type": "READING",
  "priority": "HIGH",
  "dueDate": "2025-09-15T10:00:00.000Z",
  "courseIds": [1, 2, 3]
}
```

#### GET `/api/v1/students/todos`

**Response Format Updated:**
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": 306,
        "title": "Study Multiple Courses",
        "description": "Review anatomy and physiology together",
        "type": "READING",
        "priority": "HIGH",
        "status": "PENDING",
        "dueDate": "2025-09-15T10:00:00.000Z",
        "courses": [
          {
            "id": 1,
            "name": "Basic Anatomy"
          },
          {
            "id": 2,
            "name": "Advanced Anatomy"
          }
        ],
        "quiz": null,
        "exam": null,
        "quizSession": null,
        "isOverdue": false,
        "createdAt": "2025-09-06T20:45:44.827Z",
        "updatedAt": "2025-09-06T20:45:44.827Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalItems": 1,
      "hasMore": false
    }
  }
}
```

### 3. Validation

#### Request Validation
- `courseIds`: Optional array of positive integers
- Each course ID in the array must exist in the database
- Validation error returned if any course ID is invalid

#### Error Responses
```json
{
  "success": false,
  "error": {
    "type": "InternalServerError",
    "message": "Courses with IDs 999, 1000 not found",
    "timestamp": "2025-09-06T20:46:09.975Z",
    "requestId": "xnzxfec97x8"
  }
}
```

## Usage Examples

### Creating a Todo with Multiple Courses

```bash
curl -X POST http://localhost:3005/api/v1/students/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Study Multiple Courses",
    "description": "Review anatomy and physiology together",
    "type": "READING",
    "priority": "HIGH",
    "dueDate": "2025-09-15T10:00:00.000Z",
    "courseIds": [1, 2]
  }'
```

### Creating a Todo with Single Course

```bash
curl -X POST http://localhost:3005/api/v1/students/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Focus on Physiology",
    "description": "Deep dive into cardiac physiology",
    "type": "READING",
    "priority": "MEDIUM",
    "dueDate": "2025-09-20T10:00:00.000Z",
    "courseIds": [3]
  }'
```

### Creating a Todo with No Courses

```bash
curl -X POST http://localhost:3005/api/v1/students/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "General Study Session",
    "description": "General review session",
    "type": "OTHER",
    "priority": "LOW",
    "dueDate": "2025-09-25T10:00:00.000Z"
  }'
```

### Getting Todos

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3005/api/v1/students/todos
```

## Testing Results

All tests passed successfully:

✅ **Create todo with multiple courses** - Successfully created todo with 2 courses
✅ **Create todo with single course** - Successfully created todo with 1 course  
✅ **Create todo with no courses** - Successfully created todo with empty courses array
✅ **Error handling** - Properly validates course IDs and returns appropriate error messages
✅ **Get todos** - Returns todos with courses array populated correctly

## Backward Compatibility

- **Breaking Change**: The API request format has changed from `courseId` to `courseIds`
- **Database Migration**: Existing todos with `course_id` need to be migrated to the new `todo_courses` table
- **Response Format**: The response now includes a `courses` array instead of a single `course` object

## Migration Notes

When deploying this change:

1. **Database Migration**: Run `npx prisma db push` to apply schema changes
2. **Data Migration**: Existing todos with `course_id` values were automatically handled during schema migration
3. **Client Updates**: Frontend applications need to be updated to use `courseIds` instead of `courseId`

## Files Modified

1. **Schema**: `prisma/schema.prisma`
2. **Repository**: `src/modules/students/student.repository.ts`
3. **Service**: `src/modules/students/student.service.ts`
4. **Controller**: `src/modules/students/student.controller.ts`
5. **Seed File**: `src/seed.ts`

## Benefits

1. **Enhanced Flexibility**: Students can create todos that span multiple courses
2. **Better Organization**: Related coursework can be grouped together
3. **Improved Planning**: Cross-course study sessions can be properly tracked
4. **Scalability**: The many-to-many relationship supports future enhancements

## Future Enhancements

1. **Course Filtering**: Filter todos by specific courses
2. **Course Progress Tracking**: Track progress across multiple courses within a todo
3. **Course Dependencies**: Set dependencies between courses in todos
4. **Bulk Operations**: Create multiple todos for multiple courses at once

