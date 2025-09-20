# Question Sources API Documentation


## Endpoints

### 1. Get All Question Sources

**Endpoint:** `GET /question-sources`

**Description:** Retrieves a paginated list of all question sources.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Example Request:**
```bash
curl -X GET "http://localhost:3005/api/v1/admin/question-sources?page=1&limit=10" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "questionSources": [
      {
        "id": 1,
        "name": "Medical University Exam 2024",
        "createdAt": "2025-09-20T12:42:08.997Z",
        "updatedAt": "2025-09-20T12:42:08.997Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "meta": {
    "timestamp": "2025-09-20T12:42:02.682Z",
    "requestId": "stu5ii0rgv"
  }
}
```

### 2. Create Question Source

**Endpoint:** `POST /question-sources`

**Description:** Creates a new question source.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "string"
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters, alphanumeric with spaces, hyphens, and underscores only
- Must match regex: `^[a-zA-Z0-9\s\-_]+$`

**Example Request:**
```bash
curl -X POST "http://localhost:3005/api/v1/admin/question-sources" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Medical University Exam 2024"}'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "message": "Question source created successfully",
    "questionSource": {
      "id": 1,
      "name": "Medical University Exam 2024",
      "createdAt": "2025-09-20T12:42:08.997Z",
      "updatedAt": "2025-09-20T12:42:08.997Z"
    }
  },
  "meta": {
    "timestamp": "2025-09-20T12:42:09.013Z",
    "requestId": "lhdmav2gv9"
  }
}
```

**Validation Error Example:**
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Request validation failed: name: Question source name must be at least 2 characters",
    "timestamp": "2025-09-20T12:42:29.042Z",
    "requestId": "1r09302sxolp9o9dhw1rwd",
    "details": {
      "errors": [
        {
          "field": "name",
          "message": "Question source name must be at least 2 characters",
          "code": "too_small"
        }
      ],
      "hint": "Please ensure all required fields are provided with correct data types and formats"
    }
  }
}
```

### 3. Get Question Source by ID

**Endpoint:** `GET /question-sources/:id`

**Description:** Retrieves a specific question source by its ID.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Path Parameters:**
- `id`: Question source ID (positive integer)

**Example Request:**
```bash
curl -X GET "http://localhost:3005/api/v1/admin/question-sources/1" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "questionSource": {
      "id": 1,
      "name": "Medical University Exam 2024",
      "createdAt": "2025-09-20T12:42:08.997Z",
      "updatedAt": "2025-09-20T12:42:08.997Z",
      "_count": {
        "questions": 0
      }
    }
  },
  "meta": {
    "timestamp": "2025-09-20T12:42:13.838Z",
    "requestId": "qtstbkmqw2"
  }
}
```

### 4. Update Question Source

**Endpoint:** `PUT /question-sources/:id`

**Description:** Updates an existing question source.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Path Parameters:**
- `id`: Question source ID (positive integer)

**Request Body:**
```json
{
  "name": "string"
}
```

**Validation Rules:**
- `name`: Optional, 2-100 characters, alphanumeric with spaces, hyphens, and underscores only
- Must match regex: `^[a-zA-Z0-9\s\-_]+$`

**Example Request:**
```bash
curl -X PUT "http://localhost:3005/api/v1/admin/question-sources/1" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Medical University Exam 2024 - Updated"}'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "message": "Question source updated successfully",
    "questionSource": {
      "id": 1,
      "name": "Medical University Exam 2024 - Updated",
      "createdAt": "2025-09-20T12:42:08.997Z",
      "updatedAt": "2025-09-20T12:42:18.982Z"
    }
  },
  "meta": {
    "timestamp": "2025-09-20T12:42:18.994Z",
    "requestId": "8ixwaap30gl"
  }
}
```

### 5. Delete Question Source

**Endpoint:** `DELETE /question-sources/:id`

**Description:** Deletes a question source by its ID.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Path Parameters:**
- `id`: Question source ID (positive integer)

**Example Request:**
```bash
curl -X DELETE "http://localhost:3005/api/v1/admin/question-sources/1" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "message": "Question source deleted successfully"
  },
  "meta": {
    "timestamp": "2025-09-20T12:42:24.195Z",
    "requestId": "usv84s4ikdp"
  }
}
```

## Error Responses

### Common Error Types

1. **BadRequestError** - Validation errors
2. **UnauthorizedError** - Authentication required
3. **ForbiddenError** - Insufficient permissions
4. **NotFoundError** - Resource not found
5. **InternalServerError** - Server errors

### Error Response Format
```json
{
  "success": false,
  "error": {
    "type": "ErrorType",
    "message": "Human readable error message",
    "timestamp": "2025-09-20T12:42:29.042Z",
    "requestId": "unique-request-id",
    "details": {
      "errors": [
        {
          "field": "fieldName",
          "message": "Specific field error message",
          "code": "error_code"
        }
      ],
      "hint": "Additional help text"
    }
  }
}
```

## Validation Rules Summary

### Question Source Name
- **Required**: Yes (for creation)
- **Type**: String
- **Length**: 2-100 characters
- **Pattern**: `^[a-zA-Z0-9\s\-_]+$` (letters, numbers, spaces, hyphens, underscores only)
- **Examples**:
  - ✅ Valid: "Medical University Exam 2024"
  - ✅ Valid: "Board-Certification_Test"
  - ❌ Invalid: "A" (too short)
  - ❌ Invalid: "Test@#$%Invalid" (invalid characters)

## Permissions

- **Admin Only**: All endpoints require admin or employee role
- **Authentication**: Bearer token required for all endpoints

## Rate Limiting

- **Global Rate Limit**: 2000 requests per 15 minutes per IP
- **Headers**: Rate limit information included in response headers

## Testing Results

All endpoints have been successfully tested with the following scenarios:

✅ **GET /question-sources** - Returns empty list initially
✅ **POST /question-sources** - Creates new question source successfully
✅ **GET /question-sources/:id** - Retrieves specific question source with question count
✅ **PUT /question-sources/:id** - Updates question source successfully
✅ **DELETE /question-sources/:id** - Deletes question source successfully
✅ **Validation** - Proper error handling for invalid input
✅ **Authentication** - All endpoints properly protected

## Usage Examples

### Complete Workflow Example

```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@medcin.com", "password": "SuperAdmin123!"}' \
  | jq -r '.data.tokens.accessToken')

# 2. Create a question source
curl -X POST "http://localhost:3005/api/v1/admin/question-sources" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Medical Board Exam 2024"}'

# 3. Get all question sources
curl -X GET "http://localhost:3005/api/v1/admin/question-sources" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 4. Get specific question source
curl -X GET "http://localhost:3005/api/v1/admin/question-sources/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 5. Update question source
curl -X PUT "http://localhost:3005/api/v1/admin/question-sources/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Medical Board Exam 2024 - Updated"}'

# 6. Delete question source
curl -X DELETE "http://localhost:3005/api/v1/admin/question-sources/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Question sources are used to categorize questions in the system
- The `_count.questions` field shows how many questions are associated with each source
- Pagination is available for the list endpoint with configurable page size
- All endpoints return consistent response format with success/error indicators
