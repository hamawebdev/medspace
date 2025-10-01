# Activation Code Duration API Documentation

## Overview

This document describes the enhanced activation code system that now supports both **months** and **days** duration types while maintaining full backward compatibility with existing functionality.

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Request/Response Examples](#requestresponse-examples)
3. [Validation Rules](#validation-rules)
4. [Error Handling](#error-handling)
5. [Migration Guide](#migration-guide)
6. [Testing Examples](#testing-examples)

---

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

### 3. Validate Activation Code

**Endpoint:** `POST /api/v1/students/codes/validate`

**Authentication:** Student only

**Description:** Validates an activation code before redemption.

#### Request Body

```json
{
  "code": "string (required)"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Activation code is valid",
    "isValid": true,
    "code": {
      "id": 4,
      "code": "LUPNUXVCDONJ",
      "description": "30-day trial",
      "durationMonths": null,
      "maxUses": 3,
      "currentUses": 0,
      "expiresAt": "2025-12-31T23:59:59.000Z"
    },
    "studyPacks": [...]
  }
}
```

### 4. Redeem Activation Code

**Endpoint:** `POST /api/v1/students/codes/redeem`

**Authentication:** Student only

**Description:** Redeems an activation code and creates subscriptions.

#### Request Body

```json
{
  "code": "string (required)"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Activation code redeemed successfully",
    "data": {
      "subscriptions": [
        {
          "id": 116,
          "userId": 57,
          "studyPackId": 8,
          "status": "ACTIVE",
          "startDate": "2025-10-01T16:10:59.008Z",
          "endDate": "2025-11-01T16:10:59.008Z",
          "amountPaid": 0,
          "paymentMethod": "ACTIVATION_CODE",
          "paymentReference": "LUPNUXVCDONJ",
          "studyPack": {...}
        }
      ],
      "redemption": {...},
      "activationCode": {...}
    }
  }
}
```

---

## Request/Response Examples

### Example 1: Create Days Duration Code

```bash
curl -X POST http://localhost:3005/api/v1/admin/activation-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "description": "30-day trial",
    "durationDays": 30,
    "durationType": "DAYS",
    "maxUses": 5,
    "expiresAt": "2025-12-31T23:59:59Z",
    "studyPackIds": [8]
  }'
```

### Example 2: Create Months Duration Code (Legacy)

```bash
curl -X POST http://localhost:3005/api/v1/admin/activation-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "description": "3-month subscription",
    "durationMonths": 3,
    "maxUses": 10,
    "expiresAt": "2025-12-31T23:59:59Z",
    "studyPackIds": [8, 9]
  }'
```

### Example 3: Create Explicit Months Code

```bash
curl -X POST http://localhost:3005/api/v1/admin/activation-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -d '{
    "description": "6-month premium",
    "durationMonths": 6,
    "durationType": "MONTHS",
    "maxUses": 20,
    "expiresAt": "2025-12-31T23:59:59Z",
    "studyPackIds": [8, 9, 10]
  }'
```

### Example 4: Student Code Redemption

```bash
curl -X POST http://localhost:3005/api/v1/students/codes/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [STUDENT_TOKEN]" \
  -d '{
    "code": "LUPNUXVCDONJ"
  }'
```

---

## Validation Rules

### Duration Validation

#### Months Duration
- **Range**: 1-60 months
- **Required when**: `durationType` is "MONTHS" or not specified
- **Calculation**: `endDate.setMonth(startDate.getMonth() + durationMonths)`

#### Days Duration
- **Range**: 1-1825 days (5 years maximum)
- **Required when**: `durationType` is "DAYS"
- **Calculation**: `endDate.setDate(startDate.getDate() + durationDays)`

### Cross-Field Validation

```javascript
// Validation logic
if (!data.durationMonths && !data.durationDays) {
  return false; // At least one duration must be specified
}

if (data.durationType === 'MONTHS' && !data.durationMonths) {
  return false; // Months duration required for MONTHS type
}

if (data.durationType === 'DAYS' && !data.durationDays) {
  return false; // Days duration required for DAYS type
}
```

### Other Validation Rules

| Field | Rules |
|-------|-------|
| `description` | 1-500 characters |
| `maxUses` | 1-10000 (integer) |
| `expiresAt` | Must be in the future (ISO 8601) |
| `studyPackIds` | 1-50 study pack IDs |

---

## Error Handling

### Validation Errors

**Error (400):**
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Request validation failed: durationMonths.durationDays: Duration must be specified based on the duration type (durationMonths for MONTHS, durationDays for DAYS)",
    "timestamp": "2025-10-01T16:09:19.726Z",
    "requestId": "lyu92nfaoc4fwy4sedvj8",
    "details": {
      "errors": [
        {
          "field": "durationMonths.durationDays",
          "message": "Duration must be specified based on the duration type (durationMonths for MONTHS, durationDays for DAYS)",
          "code": "custom"
        }
      ],
      "hint": "Please ensure all required fields are provided with correct data types and formats"
    }
  }
}
```

### Common Error Scenarios

1. **No Duration Specified**
   ```json
   {
     "description": "Invalid test",
     "maxUses": 3,
     "expiresAt": "2025-12-31T23:59:59Z"
   }
   ```
   **Error**: Duration must be specified based on the duration type

2. **Mismatched Duration Type**
   ```json
   {
     "description": "Invalid test",
     "durationDays": 30,
     "durationType": "MONTHS",
     "maxUses": 3,
     "expiresAt": "2025-12-31T23:59:59Z"
   }
   ```
   **Error**: Duration must be specified based on the duration type

3. **Invalid Duration Range**
   ```json
   {
     "description": "Invalid test",
     "durationDays": 2000,
     "durationType": "DAYS",
     "maxUses": 3,
     "expiresAt": "2025-12-31T23:59:59Z"
   }
   ```
   **Error**: Duration cannot exceed 1825 days (5 years)

---

