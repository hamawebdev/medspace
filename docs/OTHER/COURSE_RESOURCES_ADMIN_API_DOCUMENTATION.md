# Course Resources Admin API Documentation


## Resource Types

The system supports the following resource types:

- `DOCUMENT` - PDF files, documents, study materials
- `VIDEO` - Video files or YouTube videos
- `LINK` - External URLs and web resources
- `AUDIO` - Audio files and recordings
- `IMAGE` - Images and diagrams

## Endpoints

# Get Content Filters 

### GET `/api/v1/admin/content/filters`

**Description**: Get content filters for admin users with full access to all content regardless of year level restrictions.

**Access Control**: Admin only (`adminOnly` middleware)

**Authentication**: Required (Bearer token)

**Parameters**:
- `isResidency` (optional, boolean): If `true`, returns only residency content
- `yearLevel` (optional, string): If provided, filters content by specific year level

## Request Examples


### 1. Get Residency Content Only
```bash
curl -X GET "http://localhost:3000/api/v1/admin/content/filters?isResidency=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Get Content for Specific Year Level
```bash
curl -X GET "http://localhost:3000/api/v1/admin/content/filters?yearLevel=1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
example response:
```json
{"success":true,"data":{"success":true,"data":{"unites":[{"id":8,"studyPackId":2,"name":"Advanced Studies - Second Year Medicine","description":"Advanced Studies for Second Year Medicine","logoUrl":"/logos/advanced-studies.png","createdAt":"2025-09-17T11:25:36.686Z","updatedAt":"2025-09-17T11:25:36.686Z","studyPack":{"id":2,"name":"Second Year Medicine","yearNumber":"TWO","type":"YEAR"},"modules":[{"id":24,"uniteId":8,"studyPackId":null,"name":"Anatomy","description":"Study of anatomy","logoUrl":null,"createdAt":"2025-09-17T11:25:37.385Z","updatedAt":"2025-09-17T11:25:37.385Z","courses":[{"id":66,"name":"Anatomy - Introduction","description":"Introduction in Anatomy"},{"id":67,"name":"Anatomy - Advanced Concepts","description":"Advanced Concepts in Anatomy"},{"id":68,"name":"Anatomy - Clinical Applications","description":"Clinical Applications in Anatomy"}]},{"id":25,"uniteId":8,"studyPackId":null,"name":"Physiology","description":"Study of physiology","logoUrl":null,"createdAt":"2025-09-17T11:25:37.403Z","updatedAt":"2025-09-17T11:25:37.403Z","courses":[{"id":69,"name":"Physiology - Introduction","description":"Introduction in Physiology"},{"id":70,"name":"Physiology - Advanced Concepts","description":"Advanced Concepts in Physiology"},{"id":71,"name":"Physiology - Clinical Applications","description":"Clinical Applications in Physiology"}]},{"id":26,"uniteId":8,"studyPackId":null,"name":"Pathology","description":"Study of pathology","logoUrl":null,"createdAt":"2025-09-17T11:25:37.420Z","updatedAt":"2025-09-17T11:25:37.420Z","courses":[{"id":72,"name":"Pathology - Introduction","description":"Introduction in Pathology"},{"id":73,"name":"Pathology - Advanced Concepts","description":"Advanced Concepts in Pathology"},{"id":74,"name":"Pathology - Clinical Applications","description":"Clinical Applications in Pathology"}]},{"id":27,"uniteId":8,"studyPackId":null,"name":"Pharmacology","description":"Study of pharmacology","logoUrl":null,"createdAt":"2025-09-17T11:25:37.438Z","updatedAt":"2025-09-17T11:25:37.438Z","courses":[{"id":75,"name":"Pharmacology - Introduction","description":"Introduction in Pharmacology"},{"id":76,"name":"Pharmacology - Advanced Concepts","description":"Advanced Concepts in Pharmacology"},{"id":77,"name":"Pharmacology - Clinical Applications","description":"Clinical Applications in Pharmacology"}]}]},{"id":6,"studyPackId":2,"name":"Basic Sciences - Second Year Medicine","description":"Basic Sciences for Second Year Medicine","logoUrl":"/logos/basic-sciences.png","createdAt":"2025-09-17T11:25:36.642Z","updatedAt":"2025-09-17T11:25:36.642Z","studyPack":{"id":2,"name":"Second Year Medicine","yearNumber":"TWO","type":"YEAR"},"modules":[{"id":16,"uniteId":6,"studyPackId":null,"name":"Anatomy","description":"Study of anatomy","logoUrl":null,"createdAt":"2025-09-17T11:25:37.246Z","updatedAt":"2025-09-17T11:25:37.246Z","courses":[{"id":42,"name":"Anatomy - Introduction","description":"Introduction in Anatomy"},{"id":43,"name":"Anatomy - Advanced Concepts","description":"Advanced Concepts in Anatomy"},{"id":44,"name":"Anatomy - Clinical Applications","description":"Clinical Applications in Anatomy"}]},{"id":17,"uniteId":6,"studyPackId":null,"name":"Physiology","description":"Study of physiology","logoUrl":null,"createdAt":"2025-09-17T11:25:37.263Z","updatedAt":"2025-09-17T11:25:37.263Z","courses":[{"id":45,"name":"Physiology - Introduction","description":"Introduction in Physiology"},{"id":46,"name":"Physiology - Advanced Concepts","description":"Advanced Concepts in Physiology"},{"id":47,"name":"Physiology - Clinical Applications","description":"Clinical Applications in Physiology"}]},{"id":18,"uniteId":6,"studyPackId":null,"name":"Pathology","description":"Study of pathology","logoUrl":null,"createdAt":"2025-09-17T11:25:37.280Z","updatedAt":"2025-09-17T11:25:37.280Z","courses":[{"id":48,"name":"Pathology - Introduction","description":"Introduction in Pathology"},{"id":49,"name":"Pathology - Advanced Concepts","description":"Advanced Concepts in Pathology"},{"id":50,"name":"Pathology - Clinical Applications","description":"Clinical Applications in Pathology"}]},{"id":19,"uniteId":6,"studyPackId":null,"name":"Pharmacology","description":"Study of pharmacology","logoUrl":null,"createdAt":"2025-09-17T11:25:37.297Z","updatedAt":"2025-09-17T11:25:37.297Z","courses":[{"id":51,"name":"Pharmacology - Introduction","description":"Introduction in Pharmacology"},{"id":52,"name":"Pharmacology - Advanced Concepts","description":"Advanced Concepts in Pharmacology"},{"id":53,"name":"Pharmacology - Clinical Applications","description":"Clinical Applications in Pharmacology"}]}]},{"id":2,"studyPackId":2,"name":"Clinical Sciences","description":"Clinical subjects for advanced students","logoUrl":"/logos/clinical-sciences.png","createdAt":"2025-09-17T11:25:31.210Z","updatedAt":"2025-09-17T11:25:31.210Z","studyPack":{"id":2,"name":"Second Year Medicine","yearNumber":"TWO","type":"YEAR"},"modules":[{"id":3,"uniteId":2,"studyPackId":null,"name":"Pathology","description":"Study of disease processes","logoUrl":null,"createdAt":"2025-09-17T11:25:31.263Z","updatedAt":"2025-09-17T11:25:31.263Z","courses":[{"id":5,"name":"General Pathology","description":"Introduction to pathological processes"}]}]},{"id":7,"studyPackId":2,"name":"Clinical Sciences - Second Year Medicine","description":"Clinical Sciences for Second Year Medicine","logoUrl":"/logos/clinical-sciences.png","createdAt":"2025-09-17T11:25:36.669Z","updatedAt":"2025-09-17T11:25:36.669Z","studyPack":{"id":2,"name":"Second Year Medicine","yearNumber":"TWO","type":"YEAR"},"modules":[{"id":20,"uniteId":7,"studyPackId":null,"name":"Anatomy","description":"Study of anatomy","logoUrl":null,"createdAt":"2025-09-17T11:25:37.315Z","updatedAt":"2025-09-17T11:25:37.315Z","courses":[{"id":54,"name":"Anatomy - Introduction","description":"Introduction in Anatomy"},{"id":55,"name":"Anatomy - Advanced Concepts","description":"Advanced Concepts in Anatomy"},{"id":56,"name":"Anatomy - Clinical Applications","description":"Clinical Applications in Anatomy"}]},{"id":21,"uniteId":7,"studyPackId":null,"name":"Physiology","description":"Study of physiology","logoUrl":null,"createdAt":"2025-09-17T11:25:37.333Z","updatedAt":"2025-09-17T11:25:37.333Z","courses":[{"id":57,"name":"Physiology - Introduction","description":"Introduction in Physiology"},{"id":58,"name":"Physiology - Advanced Concepts","description":"Advanced Concepts in Physiology"},{"id":59,"name":"Physiology - Clinical Applications","description":"Clinical Applications in Physiology"}]},{"id":22,"uniteId":7,"studyPackId":null,"name":"Pathology","description":"Study of pathology","logoUrl":null,"createdAt":"2025-09-17T11:25:37.350Z","updatedAt":"2025-09-17T11:25:37.350Z","courses":[{"id":60,"name":"Pathology - Introduction","description":"Introduction in Pathology"},{"id":61,"name":"Pathology - Advanced Concepts","description":"Advanced Concepts in Pathology"},{"id":62,"name":"Pathology - Clinical Applications","description":"Clinical Applications in Pathology"}]},{"id":23,"uniteId":7,"studyPackId":null,"name":"Pharmacology","description":"Study of pharmacology","logoUrl":null,"createdAt":"2025-09-17T11:25:37.368Z","updatedAt":"2025-09-17T11:25:37.368Z","courses":[{"id":63,"name":"Pharmacology - Introduction","description":"Introduction in Pharmacology"},{"id":64,"name":"Pharmacology - Advanced Concepts","description":"Advanced Concepts in Pharmacology"},{"id":65,"name":"Pharmacology - Clinical Applications","description":"Clinical Applications in Pharmacology"}]}]}],"independentModules":[]}},"meta":{"timestamp":"2025-09-17T12:38:10.285Z","requestId":"4m0rtzezohc"}}
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "unites": [
      {
        "id": 1,
        "name": "Unit Name",
        "studyPack": {
          "id": 1,
          "name": "Study Pack Name",
          "yearNumber": "1",
          "type": "REGULAR"
        },
        "modules": [
          {
            "id": 1,
            "name": "Module Name",
            "courses": [
              {
                "id": 1,
                "name": "Course Name",
                "description": "Course Description"
              }
            ]
          }
        ]
      }
    ],
    "independentModules": [
      {
        "id": 2,
        "name": "Independent Module Name",
        "studyPack": {
          "id": 1,
          "name": "Study Pack Name",
          "yearNumber": "1",
          "type": "REGULAR"
        },
        "courses": [
          {
            "id": 2,
            "name": "Course Name",
            "description": "Course Description"
          }
        ]
      }
    ]
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to get content filters"
}
```

### 1. Create Course Resource

Creates a new course resource.

**Endpoint:** `POST /api/admin/content/resources`

**Authorization:** Admin or Employee

**Request Body:**

```json
{
  "courseId": 1,
  "type": "DOCUMENT",
  "title": "Medical Anatomy Guide",
  "description": "Comprehensive guide to human anatomy for medical students",
  "filePath": "/uploads/documents/anatomy-guide.pdf",
  "externalUrl": "https://example.com/resource",
  "youtubeVideoId": "dQw4w9WgXcQ",
  "isPaid": false,
  "price": 0
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | number | Yes | ID of the course this resource belongs to |
| `type` | string | Yes | Resource type (DOCUMENT, VIDEO, LINK, AUDIO, IMAGE) |
| `title` | string | Yes | Resource title (3-200 characters) |
| `description` | string | No | Resource description (max 1000 characters) |
| `filePath` | string | No | Path to uploaded file |
| `externalUrl` | string | No | External URL (must be valid URL) |
| `youtubeVideoId` | string | No | YouTube video ID (11 characters) |
| `isPaid` | boolean | No | Whether resource is paid (default: false) |
| `price` | number | No | Price in currency units (min: 0) |

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Course resource created successfully",
  "resource": {
    "id": 1,
    "courseId": 1,
    "type": "DOCUMENT",
    "title": "Medical Anatomy Guide",
    "description": "Comprehensive guide to human anatomy for medical students",
    "filePath": "/uploads/documents/anatomy-guide.pdf",
    "externalUrl": null,
    "youtubeVideoId": null,
    "isPaid": false,
    "price": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "course": {
      "name": "Advanced Medical Anatomy"
    }
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "courseId",
      "message": "Course ID must be positive"
    },
    {
      "field": "title",
      "message": "Resource title must be at least 3 characters"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found - Course Not Found:**
```json
{
  "success": false,
  "message": "Course with ID 999 not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to create course resource"
}
```

### 2. Update Course Resource

Updates an existing course resource.

**Endpoint:** `PUT /api/admin/content/resources/:id`

**Authorization:** Admin or Employee

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID of the resource to update |

**Request Body:**

```json
{
  "title": "Updated Medical Anatomy Guide",
  "description": "Updated comprehensive guide with latest research",
  "isPaid": true,
  "price": 19.99
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Course resource updated successfully",
  "resource": {
    "id": 1,
    "courseId": 1,
    "type": "DOCUMENT",
    "title": "Updated Medical Anatomy Guide",
    "description": "Updated comprehensive guide with latest research",
    "filePath": "/uploads/documents/anatomy-guide.pdf",
    "externalUrl": null,
    "youtubeVideoId": null,
    "isPaid": true,
    "price": 19.99,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z",
    "course": {
      "name": "Advanced Medical Anatomy"
    }
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid ID:**
```json
{
  "success": false,
  "message": "Valid course resource ID is required"
}
```

**404 Not Found - Resource Not Found:**
```json
{
  "success": false,
  "message": "Course resource with ID 999 not found"
}
```

**404 Not Found - Course Not Found (when updating courseId):**
```json
{
  "success": false,
  "message": "Course with ID 999 not found"
}
```

### 3. Delete Course Resource

Deletes a course resource.

**Endpoint:** `DELETE /api/admin/content/resources/:id`

**Authorization:** Admin or Employee

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID of the resource to delete |

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Course resource deleted successfully"
}
```

**Error Responses:**

**400 Bad Request - Invalid ID:**
```json
{
  "success": false,
  "message": "Valid course resource ID is required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Course resource with ID 999 not found"
}
```

## Validation Rules

### Title Validation
- **Required:** Yes
- **Min Length:** 3 characters
- **Max Length:** 200 characters
- **Pattern:** Trimmed string

### Description Validation
- **Required:** No
- **Max Length:** 1000 characters
- **Pattern:** Trimmed string

### Course ID Validation
- **Required:** Yes
- **Type:** Integer
- **Min Value:** 1 (positive)
- **Must Exist:** Course must exist in database

### External URL Validation
- **Required:** No (when type is LINK)
- **Format:** Valid URL format
- **Example:** `https://example.com/resource`

### YouTube Video ID Validation
- **Required:** No (when type is VIDEO)
- **Pattern:** Exactly 11 characters
- **Format:** Alphanumeric with hyphens and underscores
- **Example:** `dQw4w9WgXcQ`

### Price Validation
- **Required:** No
- **Type:** Number
- **Min Value:** 0
- **Required When:** `isPaid` is true

## Business Logic

### Resource Type Constraints

1. **DOCUMENT Resources:**
   - Should have `filePath` for uploaded files
   - Can be free or paid

2. **VIDEO Resources:**
   - Can have `filePath` for uploaded videos
   - Can have `youtubeVideoId` for YouTube videos
   - Cannot have both `filePath` and `youtubeVideoId`

3. **LINK Resources:**
   - Must have `externalUrl`
   - Cannot have `filePath` or `youtubeVideoId`

4. **AUDIO Resources:**
   - Should have `filePath` for uploaded audio files
   - Can be free or paid

5. **IMAGE Resources:**
   - Should have `filePath` for uploaded images
   - Can be free or paid

### Paid Resource Logic

- When `isPaid` is `true`, `price` should be provided
- When `isPaid` is `false`, `price` is ignored
- Price must be a positive number

### Activity Logging

All resource operations are logged in the `employeeActivity` table:
- **CREATE:** `RESOURCE_ADDED` activity type
- **UPDATE:** Activity logged with resource details
- **DELETE:** Activity logged with resource details
