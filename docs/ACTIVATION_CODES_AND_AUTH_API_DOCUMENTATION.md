# Activation Codes & Authentication API Documentation



## Student Activation Code Endpoints

### Redeem Activation Code

Redeems a valid activation code and creates new subscriptions for the student.

**Endpoint:** `POST /students/codes/redeem`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "code": "string"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "message": "Activation code redeemed successfully",
    "subscription": {
      "id": 123,
      "studyPackId": 17,
      "status": "ACTIVE",
      "startDate": "2025-09-11T13:10:47.438Z",
      "endDate": "2026-03-11T13:10:47.438Z",
      "studyPack": {
        "id": 17,
        "name": "First Year Medicine",
        "type": "YEAR",
        "yearNumber": "ONE"
      }
    }
  }
}
```

**Response (Error - 400 - Already Redeemed):**
```json
{
  "success": false,
  "error": {
    "message": "You have already redeemed this activation code",
    "statusCode": 400,
    "details": {
      "code": "ALREADY_REDEEMED",
      "previousRedemption": {
        "subscriptionId": 120,
        "redeemedAt": "2025-09-10T10:30:00.000Z"
      }
    }
  }
}
```

**Response (Error - 400 - Invalid Code):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid activation code",
    "statusCode": 400
  }
}
```

**Response (Error - 400 - Code Expired):**
```json
{
  "success": false,
  "error": {
    "message": "Activation code has expired",
    "statusCode": 400
  }
}
```

**Response (Error - 400 - Code Exhausted):**
```json
{
  "success": false,
  "error": {
    "message": "Activation code has reached maximum usage limit",
    "statusCode": 400
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized access",
    "statusCode": 401
  }
}
```

**Response (Error - 429 - Rate Limited):**
```json
{
  "success": false,
  "error": {
    "message": "Too many requests. Please try again later.",
    "statusCode": 429
  }
}
```


---

## Admin Activation Code Management

### Create Activation Code

Creates a new activation code with specified parameters.

**Endpoint:** `POST /admin/activation-codes`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "description": "string",
  "durationMonths": "number",
  "maxUses": "number",
  "expiresAt": "string (ISO 8601)",
  "studyPackIds": ["number"]
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "message": "Activation code created successfully",
    "activationCode": {
      "id": 1,
      "code": "7T2Y7YZFXR71",
      "description": "Test activation code for 3 months access",
      "durationMonths": 3,
      "maxUses": 10,
      "expiresAt": "2025-10-11T13:10:41.384Z",
      "isActive": true,
      "currentUses": 0,
      "createdAt": "2025-09-11T13:10:41.384Z"
    }
  }
}
```

### List Activation Codes

Retrieves all activation codes with pagination and filtering.

**Endpoint:** `GET /admin/activation-codes`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for code or description
- `isActive` (optional): Filter by active status (true/false)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "activationCodes": [
      {
        "id": 1,
        "code": "7T2Y7YZFXR71",
        "description": "Test activation code for 3 months access",
        "durationMonths": 3,
        "maxUses": 10,
        "currentUses": 2,
        "expiresAt": "2025-10-11T13:10:41.384Z",
        "isActive": true,
        "createdAt": "2025-09-11T13:10:41.384Z",
        "studyPacks": [
          {
            "id": 17,
            "name": "First Year Medicine",
            "type": "YEAR"
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    }
  }
}
```

### Deactivate Activation Code

Deactivates an existing activation code.

**Endpoint:** `PATCH /admin/activation-codes/:id/deactivate`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "message": "Activation code deactivated successfully",
    "activationCode": {
      "id": 1,
      "code": "7T2Y7YZFXR71",
      "isActive": false
    }
  }
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "message": "Validation error message",
    "statusCode": 400,
    "details": {
      "field": "Specific field error"
    }
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized access",
    "statusCode": 401
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "message": "Access forbidden",
    "statusCode": 403
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Resource not found",
    "statusCode": 404
  }
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": {
    "message": "Too many requests. Please try again later.",
    "statusCode": 429
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "message": "We're experiencing technical difficulties. Please try again later.",
    "statusCode": 500
  }
}
```
