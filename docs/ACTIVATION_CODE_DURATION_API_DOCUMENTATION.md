# Activation Code Duration API Documentation


## API Endpoints

### 1. Create Activation Code

**Endpoint:** `POST /api/v1/admin/activation-codes`

**Authentication:** Admin/Employee only

**Description:** Creates a new activation code with support for both months and days duration.

#### Request Body

```json
{
  "description": "string (optional)",
  "durationMonths": "number (optional)",
  "durationDays": "number (optional)", 
  "durationType": "string (optional)",
  "maxUses": "number (required)",
  "expiresAt": "string (required)",
  "studyPackIds": "array (optional)"
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | No | Optional description for the activation code |
| `durationMonths` | number | No* | Duration in months (1-60) |
| `durationDays` | number | No* | Duration in days (1-1825) |
| `durationType` | string | No | Duration type: "MONTHS" or "DAYS" (default: "MONTHS") |
| `maxUses` | number | Yes | Maximum number of uses (1-10000) |
| `expiresAt` | string | Yes | Expiration date (ISO 8601 format) |
| `studyPackIds` | array | No | Array of study pack IDs |

*At least one duration field must be provided based on durationType.

#### Response

**Success (201):**
```json
{
  "success": true,
  "data": {
    "message": "Activation code created successfully",
    "activationCode": {
      "id": 4,
      "code": "LUPNUXVCDONJ",
      "hashedCode": "LUPNUXVCDONJ",
      "description": "30-day trial",
      "durationMonths": null,
      "durationDays": 30,
      "durationType": "DAYS",
      "maxUses": 3,
      "currentUses": 0,
      "isActive": true,
      "expiresAt": "2025-12-31T23:59:59.000Z",
      "createdById": 4,
      "createdAt": "2025-10-01T16:09:12.390Z",
      "updatedAt": "2025-10-01T16:09:12.390Z",
      "studyPacks": [...]
    }
  }
}
```

### 2. Get Activation Codes

**Endpoint:** `GET /api/v1/admin/activation-codes`

**Authentication:** Admin/Employee only

**Description:** Retrieves all activation codes with filtering and pagination.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `isActive` | boolean | Filter by active status |
| `search` | string | Search by code or description |
| `createdBy` | number | Filter by creator ID |

#### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Activation codes retrieved successfully",
    "activationCodes": [
      {
        "id": 4,
        "code": "LUPNUXVCDONJ",
        "description": "30-day trial",
        "durationMonths": null,
        "durationDays": 30,
        "durationType": "DAYS",
        "maxUses": 3,
        "currentUses": 0,
        "isActive": true,
        "expiresAt": "2025-12-31T23:59:59.000Z",
        "createdBy": {...},
        "studyPacks": [...],
        "redemptions": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```
