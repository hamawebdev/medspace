## API Endpoint

GET /api/v1/students/sessions/residency-filters


### Response Format
{
  "success": true,
  "data": {
    "universities": [
      {
        "id": 17,
        "name": "University of Algiers",
        "country": "Algeria",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "years": [2024, 2023, 2022, 2021, 2020],
    "parts": ["PART1", "PART2", "PART3"]
  },
  "message": "Residency session filters retrieved successfully"
}

## Endpoint

```
POST /api/v1/quizzes/residency-sessions
```

## Authentication

**Required:** Bearer Token (JWT)

**Header:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

## Request Body

### Required Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `title` | string | Session title | 3-100 characters, alphanumeric with spaces, hyphens, underscores, periods, commas, exclamation marks, question marks |
| `examYear` | number | Year of the exam | Integer, 1900 to current year + 10 |
| `universityId` | number | University identifier | Positive integer |

### Optional Fields

| Field | Type | Description | Default | Validation |
|-------|------|-------------|---------|------------|
| `parts` | string[] | Array of residency parts to include | All parts | Array of 1-3 valid part values |

### Available Parts

| Value | Description |
|-------|-------------|
| `E_Sciences_Fondamentales` | Fundamental Sciences |
| `E_Dossiers_Cliniques` | Clinical Cases |
| `E_Pathologies_M_C` | Pathologies and Medical Conditions |

## Request Examples

### 1. Create Session with All Parts (Default)

```json
{
  "title": "Complete Residency Practice Session",
  "examYear": 2023,
  "universityId": 18
}
```

### 2. Create Session with Single Part

```json
{
  "title": "Sciences Fondamentales Practice",
  "examYear": 2023,
  "universityId": 18,
  "parts": ["E_Sciences_Fondamentales"]
}
```

### 3. Create Session with Multiple Parts

```json
{
  "title": "Clinical and Pathology Practice",
  "examYear": 2023,
  "universityId": 18,
  "parts": ["E_Dossiers_Cliniques", "E_Pathologies_M_C"]
}
```

### 4. Create Session with All Parts Explicitly

```json
{
  "title": "Complete Practice Session",
  "examYear": 2023,
  "universityId": 18,
  "parts": ["E_Sciences_Fondamentales", "E_Dossiers_Cliniques", "E_Pathologies_M_C"]
}
```

## Response Format

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "sessionId": 669,
    "title": "Sciences Fondamentales Practice",
    "sessionType": "RESIDENCY",
    "examYear": 2023,
    "universityId": 18,
    "questionCount": 5,
    "parts": ["E_Sciences_Fondamentales"]
  },
  "meta": {
    "timestamp": "2025-09-14T13:25:36.377Z",
    "requestId": "am6y7rgnvgu"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | number | Unique identifier for the created session |
| `title` | string | Session title |
| `sessionType` | string | Always "RESIDENCY" for residency sessions |
| `examYear` | number | Year of the exam |
| `universityId` | number | University identifier |
| `questionCount` | number | Number of questions included in the session |
| `parts` | string[] | Parts that were used to filter questions |

## Error Responses

### 400 Bad Request - Validation Error

```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Request validation failed: title: Required (received: \"undefined\") (expected: string)",
    "timestamp": "2025-09-14T13:25:31.558Z",
    "requestId": "2t0u246rnfxm0t9a1asw8k",
    "details": {
      "errors": [
        {
          "field": "title",
          "message": "Required",
          "code": "invalid_type",
          "received": "undefined",
          "expected": "string"
        }
      ],
      "hint": "Please ensure all required fields are provided with correct data types and formats"
    }
  }
}
```

### 401 Unauthorized - Authentication Error

```json
{
  "success": false,
  "error": {
    "type": "UnauthorizedError",
    "message": "Your session has been invalidated by a new login. Please log in again.",
    "timestamp": "2025-09-14T13:24:05.053Z",
    "requestId": "k5h46vjsdr"
  }
}
```

### 403 Forbidden - Access Denied

```json
{
  "success": false,
  "error": {
    "type": "ForbiddenError",
    "message": "Access denied. Residency sessions require either SEVEN year level access or residency subscription.",
    "timestamp": "2025-09-14T13:25:05.889Z",
    "requestId": "32nzpcriyik"
  }
}
```

### 404 Not Found - No Questions Found

```json
{
  "success": false,
  "error": {
    "type": "NoQuestionsFoundError",
    "message": "No questions found matching the specified filters: examYear: 2023, universityId: 1, message: \"No residency questions found for the specified exam year and university\" not found",
    "timestamp": "2025-09-14T13:25:05.889Z",
    "requestId": "32nzpcriyik"
  }
}
```

## cURL Examples

### 1. Basic Session Creation

```bash
curl -X POST "http://localhost:3005/api/v1/quizzes/residency-sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Residency Practice",
    "examYear": 2023,
    "universityId": 18
  }'
```

### 2. Single Part Filtering

```bash
curl -X POST "http://localhost:3005/api/v1/quizzes/residency-sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Sciences Only Practice",
    "examYear": 2023,
    "universityId": 18,
    "parts": ["E_Sciences_Fondamentales"]
  }'
```

### 3. Multiple Parts Filtering

```bash
curl -X POST "http://localhost:3005/api/v1/quizzes/residency-sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Clinical and Pathology Practice",
    "examYear": 2023,
    "universityId": 18,
    "parts": ["E_Dossiers_Cliniques", "E_Pathologies_M_C"]
  }'
```



