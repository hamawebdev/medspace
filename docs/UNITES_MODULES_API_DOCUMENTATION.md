# Unites & Modules API Documentation

## Overview
This documentation covers the API endpoints for managing Unites and Modules in the MedCortex platform. Both entities support logo image uploads and have specific validation requirements.

## Base URL
```
https://med-cortex.com/api/v1/admin
```

## Authentication
All endpoints require admin authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## UNITES MANAGEMENT

### 1. Create Unite

**Endpoint:** `POST /content/unites`

**Description:** Creates a new unite with optional logo upload.

**Authorization:** Admin Only

**Request Format:** `multipart/form-data`

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `studyPackId` | integer | Yes | ID of the study pack this unite belongs to |
| `name` | string | Yes | Name of the unite (min 2 characters) |
| `description` | string | No | Optional description |
| `logo` | file | No | Logo image file (max 5MB) |

#### Logo File Requirements
- **File Types:** JPEG, JPG, PNG, GIF, WebP, SVG
- **Max Size:** 5MB
- **Field Name:** `logo`
- **MIME Types:** `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`

#### Example Request (cURL)
```bash
curl -X POST "https://med-cortex.com/api/v1/admin/content/unites" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "studyPackId=1" \
  -F "name=Cardiologie" \
  -F "description=Unite de cardiologie pour les étudiants en médecine" \
  -F "logo=@/path/to/logo.png"
```

#### Example Request (JavaScript/Fetch)
```javascript
const formData = new FormData();
formData.append('studyPackId', '1');
formData.append('name', 'Cardiologie');
formData.append('description', 'Unite de cardiologie pour les étudiants en médecine');
formData.append('logo', logoFile); // File object

const response = await fetch('https://med-cortex.com/api/v1/admin/content/unites', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Unite created successfully",
  "data": {
    "unite": {
      "id": 1,
      "studyPackId": 1,
      "name": "Cardiologie",
      "description": "Unite de cardiologie pour les étudiants en médecine",
      "logoUrl": "https://med-cortex.com/api/v1/media/logos/logos_1234567890-123456789.png",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Error Responses
```json
// 400 - Bad Request
{
  "success": false,
  "error": "Invalid file type for logos. Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/webp, image/svg+xml"
}

// 404 - Not Found
{
  "success": false,
  "error": "Study pack not found"
}

// 401 - Unauthorized
{
  "success": false,
  "error": "Unauthorized access"
}
```

### 2. Update Unite

**Endpoint:** `PUT /content/unites/:id`

**Description:** Updates an existing unite with optional logo replacement.

**Authorization:** Admin Only

**Request Format:** `multipart/form-data`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | ID of the unite to update |

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `studyPackId` | integer | Yes | ID of the study pack this unite belongs to |
| `name` | string | Yes | Name of the unite (min 2 characters) |
| `description` | string | No | Optional description |
| `logo` | file | No | New logo image file (max 5MB) |

#### Example Request (cURL)
```bash
curl -X PUT "https://med-cortex.com/api/v1/admin/content/unites/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "studyPackId=1" \
  -F "name=Cardiologie Avancée" \
  -F "description=Unite de cardiologie avancée" \
  -F "logo=@/path/to/new-logo.png"
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Unite updated successfully",
  "data": {
    "unite": {
      "id": 1,
      "studyPackId": 1,
      "name": "Cardiologie Avancée",
      "description": "Unite de cardiologie avancée",
      "logoUrl": "https://med-cortex.com/api/v1/media/logos/logos_1234567890-987654321.png",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:45:00.000Z"
    }
  }
}
```

### 3. Delete Unite

**Endpoint:** `DELETE /content/unites/:id`

**Description:** Deletes an existing unite.

**Authorization:** Admin Only

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | ID of the unite to delete |

#### Example Request (cURL)
```bash
curl -X DELETE "https://med-cortex.com/api/v1/admin/content/unites/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Unite deleted successfully"
}
```

---

## MODULES MANAGEMENT

### 1. Create Module

**Endpoint:** `POST /content/modules`

**Description:** Creates a new module with optional logo upload. Module can belong to either a unite or directly to a study pack.

**note** : if there is no unitId provided, 

**Authorization:** Admin Only

**Request Format:** `multipart/form-data`


Request Body (independent module):
{
  "studyPackId": 1,
  "name": "Advanced Cardiology",
  "description": "Comprehensive cardiology module for advanced students",
  "logoUrl": "https://example.com/logo.png" // Optional
}

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uniteId` | integer | No* | ID of the unite this module belongs to |
| `studyPackId` | integer | No* | ID of the study pack this module belongs to |
| `name` | string | Yes | Name of the module (min 2 characters) |
| `description` | string | No | Optional description |
| `logo` | file | No | Logo image file (max 5MB) |

*Either `uniteId` or `studyPackId` must be provided, but not both.

#### Logo File Requirements
- **File Types:** JPEG, JPG, PNG, GIF, WebP, SVG
- **Max Size:** 5MB
- **Field Name:** `logo`
- **MIME Types:** `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`

#### Example Request (cURL) - Module under Unite
```bash
curl -X POST "https://med-cortex.com/api/v1/admin/content/modules" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "uniteId=1" \
  -F "name=Anatomie du Cœur" \
  -F "description=Module d'anatomie du cœur" \
  -F "logo=@/path/to/logo.png"
```

#### Example Request (cURL) - Module under Study Pack
```bash
curl -X POST "https://med-cortex.com/api/v1/admin/content/modules" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "studyPackId=1" \
  -F "name=Physiologie Générale" \
  -F "description=Module de physiologie générale" \
  -F "logo=@/path/to/logo.png"
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Module created successfully",
  "data": {
    "module": {
      "id": 1,
      "uniteId": 1,
      "studyPackId": null,
      "name": "Anatomie du Cœur",
      "description": "Module d'anatomie du cœur",
      "logoUrl": "https://med-cortex.com/api/v1/media/logos/logos_1234567890-123456789.png",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "unite": {
        "name": "Cardiologie"
      },
      "studyPack": null
    }
  }
}
```

#### Error Responses
```json
// 400 - Bad Request (Validation Error)
{
  "success": false,
  "error": "Either uniteId or studyPackId must be provided, but not both"
}

// 400 - Bad Request (File Error)
{
  "success": false,
  "error": "Invalid file type for logos. Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/webp, image/svg+xml"
}

// 404 - Not Found
{
  "success": false,
  "error": "Unite not found"
}
```

### 2. Update Module

**Endpoint:** `PUT /content/modules/:id`

**Description:** Updates an existing module with optional logo replacement.

**Authorization:** Admin Only

**Request Format:** `multipart/form-data`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | ID of the module to update |

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uniteId` | integer | No* | ID of the unite this module belongs to |
| `studyPackId` | integer | No* | ID of the study pack this module belongs to |
| `name` | string | Yes | Name of the module (min 2 characters) |
| `description` | string | No | Optional description |
| `logo` | file | No | New logo image file (max 5MB) |

*Either `uniteId` or `studyPackId` must be provided, but not both.

#### Example Request (cURL)
```bash
curl -X PUT "https://med-cortex.com/api/v1/admin/content/modules/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "uniteId=1" \
  -F "name=Anatomie du Cœur Avancée" \
  -F "description=Module d'anatomie du cœur avancée" \
  -F "logo=@/path/to/new-logo.png"
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Module updated successfully",
  "data": {
    "module": {
      "id": 1,
      "uniteId": 1,
      "studyPackId": null,
      "name": "Anatomie du Cœur Avancée",
      "description": "Module d'anatomie du cœur avancée",
      "logoUrl": "https://med-cortex.com/api/v1/media/logos/logos_1234567890-987654321.png",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:45:00.000Z"
    }
  }
}
```

### 3. Delete Module

**Endpoint:** `DELETE /content/modules/:id`

**Description:** Deletes an existing module.

**Authorization:** Admin Only

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | ID of the module to delete |

#### Example Request (cURL)
```bash
curl -X DELETE "https://med-cortex.com/api/v1/admin/content/modules/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Module deleted successfully"
}
```

---

## IMAGE UPLOAD DETAILS

### File Storage Structure
```
uploads/
├── logos/           # Unite and Module logos
├── images/          # Question images
├── explanations/    # Explanation images
├── pdfs/           # PDF files
└── study-packs/    # Study pack files
```

### File Naming Convention
- **Format:** `{fileType}_{timestamp}-{randomNumber}.{extension}`
- **Example:** `logos_1705312200000-123456789.png`

### File Access URLs
- **Base URL:** `https://med-cortex.com/api/v1/media/{fileType}/{filename}`
- **Example:** `https://med-cortex.com/api/v1/media/logos/logos_1705312200000-123456789.png`

### File Type Configuration
| File Type | Max Size | Allowed Extensions | MIME Types |
|-----------|----------|-------------------|------------|
| LOGO | 5MB | jpg, jpeg, png, gif, webp, svg | image/jpeg, image/jpg, image/png, image/gif, image/webp, image/svg+xml |

### Error Handling for File Uploads
- **File too large:** Returns 400 with specific size limit
- **Invalid file type:** Returns 400 with allowed types list
- **Upload failure:** Returns 500 with generic error message
- **File processing error:** Returns 500 with processing error details

---

## VALIDATION SCHEMAS

### Create Unite Schema
```typescript
{
  studyPackId: z.coerce.number().int().positive(),
  name: z.string().min(2),
  description: z.string().optional(),
  logoUrl: z.string().url().optional()
}
```

### Create Module Schema
```typescript
{
  uniteId: z.coerce.number().int().positive().optional(),
  studyPackId: z.coerce.number().int().positive().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  logoUrl: z.string().url().optional()
}.refine((data) => {
  return (data.uniteId && !data.studyPackId) || (!data.uniteId && data.studyPackId);
}, {
  message: "Either uniteId or studyPackId must be provided, but not both",
  path: ["uniteId", "studyPackId"]
})
```

---

## DATABASE SCHEMA

### Unite Table
```sql
CREATE TABLE unites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  study_pack_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (study_pack_id) REFERENCES study_packs(id) ON DELETE CASCADE
);
```

### Module Table
```sql
CREATE TABLE modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unite_id INTEGER,
  study_pack_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unite_id) REFERENCES unites(id) ON DELETE CASCADE,
  FOREIGN KEY (study_pack_id) REFERENCES study_packs(id) ON DELETE CASCADE
);
```

---

## TESTING EXAMPLES

### JavaScript/Node.js Example
```javascript
const FormData = require('form-data');
const fs = require('fs');

async function createUniteWithLogo() {
  const form = new FormData();
  form.append('studyPackId', '1');
  form.append('name', 'Neurologie');
  form.append('description', 'Unite de neurologie');
  form.append('logo', fs.createReadStream('./logo.png'));

  try {
    const response = await fetch('https://med-cortex.com/api/v1/admin/content/unites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN',
        ...form.getHeaders()
      },
      body: form
    });

    const result = await response.json();
    console.log('Unite created:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Python Example
```python
import requests

def create_module_with_logo():
    url = "https://med-cortex.com/api/v1/admin/content/modules"
    headers = {
        "Authorization": "Bearer YOUR_JWT_TOKEN"
    }
    
    data = {
        'uniteId': '1',
        'name': 'Physiologie Cardiaque',
        'description': 'Module de physiologie cardiaque'
    }
    
    files = {
        'logo': ('logo.png', open('logo.png', 'rb'), 'image/png')
    }
    
    try:
        response = requests.post(url, headers=headers, data=data, files=files)
        result = response.json()
        print('Module created:', result)
    except Exception as error:
        print('Error:', error)
```

---

## COMMON ISSUES & SOLUTIONS

### 1. File Upload Issues
**Problem:** "Invalid file type" error
**Solution:** Ensure file is one of the allowed types (JPEG, PNG, GIF, WebP, SVG) and MIME type matches

### 2. File Size Issues
**Problem:** "File too large" error
**Solution:** Compress image or use smaller file (max 5MB for logos)

### 3. Validation Errors
**Problem:** "Either uniteId or studyPackId must be provided, but not both"
**Solution:** Provide exactly one of uniteId or studyPackId, not both

### 4. Authentication Issues
**Problem:** "Unauthorized access" error
**Solution:** Ensure valid JWT token and admin role

### 5. Database Errors
**Problem:** "Study pack not found" or "Unite not found"
**Solution:** Verify the referenced IDs exist in the database

---

## RATE LIMITING
- **File Uploads:** 10 requests per minute per user
- **API Calls:** 100 requests per minute per user
- **Large Files:** 5MB max per file

---

## SUPPORT
For technical support or questions about the API, contact the development team or refer to the main API documentation.
