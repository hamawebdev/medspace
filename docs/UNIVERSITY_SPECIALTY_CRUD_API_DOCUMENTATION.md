# University & Specialty Management API Documentation



## Specialty Management

### 1. Get All Specialties
**GET** `/specialties`

Retrieves all specialties with their associated data counts.

**Response:**
```json
{
  "success": true,
  "data": {
    "specialties": [
      {
        "id": 1,
        "name": "Test Specialty",
        "createdAt": "2025-09-20T13:54:45.906Z",
        "updatedAt": "2025-09-20T13:54:45.906Z",
        "_count": {
          "users": 0
        }
      }
    ]
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3005/api/v1/admin/specialties \
  -H "Authorization: Bearer <admin_token>"
```

### 2. Create Specialty
**POST** `/specialties`

Creates a new specialty.

**Request Body:**
```json
{
  "name": "Test Specialty"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Specialty created successfully",
    "specialty": {
      "id": 1,
      "name": "Test Specialty",
      "createdAt": "2025-09-20T13:54:45.906Z",
      "updatedAt": "2025-09-20T13:54:45.906Z",
      "_count": {
        "users": 0
      }
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3005/api/v1/admin/specialties \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Specialty"}'
```

### 3. Update Specialty
**PUT** `/specialties/:id`

Updates an existing specialty.

**Request Body:**
```json
{
  "name": "Updated Test Specialty"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Specialty updated successfully",
    "specialty": {
      "id": 1,
      "name": "Updated Test Specialty",
      "createdAt": "2025-09-20T13:54:45.906Z",
      "updatedAt": "2025-09-20T13:54:49.218Z",
      "_count": {
        "users": 0
      }
    }
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3005/api/v1/admin/specialties/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Test Specialty"}'
```

### 4. Delete Specialty
**DELETE** `/specialties/:id`

Deletes a specialty. **Note:** Cannot delete specialties with associated users.

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "message": "Specialty deleted successfully"
  }
}
```

**Response (Error - Has Related Data):**
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Cannot delete specialty with associated users"
  }
}
```
