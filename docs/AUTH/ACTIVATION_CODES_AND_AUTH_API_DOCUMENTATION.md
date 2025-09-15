# Activation Codes & Authentication API Documentation

## Overview

This document provides comprehensive API documentation for the Medcin Platform's activation code system and authentication token management. The system enables students to redeem activation codes for subscription access and provides secure token refresh capabilities.

**Base URL:** `http://localhost:3005/api/v1`  
**Version:** v1  
**Last Updated:** January 2025

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Student Activation Code Endpoints](#student-activation-code-endpoints)
3. [Admin Activation Code Management](#admin-activation-code-management)
4. [Error Handling](#error-handling)
5. [Security Features](#security-features)
6. [Rate Limiting](#rate-limiting)
7. [Testing Examples](#testing-examples)

---

## Authentication Endpoints

### Refresh Authentication Token

Refreshes expired access tokens using a valid refresh token.

**Endpoint:** `POST /auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "old refresh token"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "message": "Tokens refreshed successfully",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": {
    "message": "Refresh token is required",
    "statusCode": 400
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": {
    "message": "Refresh token has expired. Please log in again.",
    "statusCode": 401
  }
}
```

**Response (Error - 401 - Invalid Token):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid refresh token. Please log in again.",
    "statusCode": 401
  }
}
```

**Response (Error - 401 - User Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "User account not found. Please contact support.",
    "statusCode": 401
  }
}
```

**Response (Error - 401 - Account Deactivated):**
```json
{
  "success": false,
  "error": {
    "message": "Your account has been deactivated. Please contact support for assistance.",
    "statusCode": 401
  }
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": {
    "message": "We're experiencing technical difficulties. Please try again later.",
    "statusCode": 500
  }
}
```

**Business Logic:**
- Validates the provided refresh token
- Checks if the token exists in the database
- Verifies token hasn't expired
- Ensures user account is active
- Generates new access and refresh tokens
- Updates session token for single-session validation
- Invalidates previous sessions for security

**Security Features:**
- Single-session validation (invalidates previous sessions)
- JTI (JWT ID) caching for immediate session invalidation
- Automatic token rotation
- Account status validation

---

## Student Activation Code Endpoints

### Validate Activation Code

Validates an activation code and returns detailed information about the code and associated study packs.

**Endpoint:** `POST /students/codes/validate`

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
    "message": "Activation code is valid",
    "isValid": true,
    "code": {
      "id": 2,
      "code": "KN4371RN2JCL",
      "durationMonths": 6,
      "maxUses": 5,
      "currentUses": 0,
      "expiresAt": "2025-11-10T13:10:47.438Z"
    },
    "studyPacks": [
      {
        "id": 17,
        "name": "First Year Medicine",
        "type": "YEAR",
        "yearNumber": "ONE"
      },
      {
        "id": 18,
        "name": "Second Year Medicine",
        "type": "YEAR",
        "yearNumber": "TWO"
      }
    ]
  }
}
```

**Response (Error - 400 - Invalid Format):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid activation code format",
    "statusCode": 400
  }
}
```

**Response (Error - 400 - Empty Code):**
```json
{
  "success": false,
  "error": {
    "message": "Activation code is required",
    "statusCode": 400
  }
}
```

**Response (Error - 404 - Code Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Activation code not found",
    "statusCode": 404
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

**Response (Error - 400 - Code Inactive):**
```json
{
  "success": false,
  "error": {
    "message": "Activation code is no longer active",
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

**Business Logic:**
- Validates the activation code format and existence
- Checks if the code is active and not expired
- Verifies the code hasn't reached maximum usage limit
- Prevents duplicate redemptions by the same user
- Creates new subscriptions for each study pack associated with the code
- Updates the code's usage count
- Calculates subscription end date based on duration

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

---

## Security Features

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Student, Admin, Employee)
- **Single-session validation** prevents concurrent logins
- **Token rotation** on refresh for enhanced security
- **Account status validation** (active/inactive accounts)

### Input Validation
- **Required field validation** for all endpoints
- **Data type validation** (numbers, dates, strings)
- **Format validation** (activation code format, email format)
- **Business logic validation** (future dates, positive numbers)
- **Rate limiting** to prevent abuse

### Session Management
- **JTI (JWT ID) caching** for immediate session invalidation
- **Automatic session cleanup** on logout
- **Session token rotation** on login/refresh
- **Concurrent session prevention**

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Activation code validation**: 10 requests per minute per user
- **Activation code redemption**: 5 requests per minute per user
- **Token refresh**: 20 requests per minute per user
- **General API endpoints**: 100 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

---

## Testing Examples

### Complete Activation Code Flow

```bash
# 1. Login as student
curl -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Validate activation code
curl -X POST http://localhost:3005/api/v1/students/codes/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "code": "KN4371RN2JCL"
  }'

# 3. Redeem activation code
curl -X POST http://localhost:3005/api/v1/students/codes/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "code": "KN4371RN2JCL"
  }'
```

### Token Refresh Flow

```bash
# 1. Login to get initial tokens
curl -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Refresh tokens when access token expires
curl -X POST http://localhost:3005/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

### Admin Management Flow

```bash
# 1. Login as admin
curl -X POST http://localhost:3005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medcin.dz",
    "password": "password123"
  }'

# 2. Create activation code
curl -X POST http://localhost:3005/api/v1/admin/activation-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_access_token>" \
  -d '{
    "description": "Student test activation code for 6 months access",
    "durationMonths": 6,
    "maxUses": 5,
    "expiresAt": "2025-12-31T23:59:59.999Z",
    "studyPackIds": [17, 18]
  }'

# 3. List activation codes
curl -X GET "http://localhost:3005/api/v1/admin/activation-codes?page=1&limit=10" \
  -H "Authorization: Bearer <admin_access_token>"

# 4. Deactivate activation code
curl -X PATCH http://localhost:3005/api/v1/admin/activation-codes/1/deactivate \
  -H "Authorization: Bearer <admin_access_token>"
```

---

## Data Models

### Activation Code
```typescript
interface ActivationCode {
  id: number;
  code: string;
  description: string;
  durationMonths: number;
  maxUses: number;
  currentUses: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  studyPacks: StudyPack[];
}
```

### Study Pack
```typescript
interface StudyPack {
  id: number;
  name: string;
  type: 'YEAR' | 'RESIDENCY';
  yearNumber?: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN';
}
```

### Subscription
```typescript
interface Subscription {
  id: number;
  studyPackId: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: Date;
  endDate: Date;
  studyPack: StudyPack;
}
```

### Auth Tokens
```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
```

---

## Best Practices

### For Frontend Integration

1. **Token Management:**
   - Store tokens securely (httpOnly cookies recommended)
   - Implement automatic token refresh before expiration
   - Handle token refresh failures gracefully

2. **Error Handling:**
   - Implement proper error handling for all API calls
   - Show user-friendly error messages
   - Handle network errors and timeouts

3. **User Experience:**
   - Show loading states during API calls
   - Implement optimistic updates where appropriate
   - Provide clear feedback for successful operations

### For Backend Integration

1. **Security:**
   - Always validate input data
   - Implement proper authentication checks
   - Use HTTPS in production
   - Monitor for suspicious activity

2. **Performance:**
   - Implement caching where appropriate
   - Use database indexes for frequently queried fields
   - Monitor API response times

3. **Monitoring:**
   - Log all API calls and errors
   - Monitor rate limiting effectiveness
   - Track activation code usage patterns

---

## Support

For technical support or questions about the API:

- **Email:** support@medcin.dz
- **Documentation:** [API Documentation](./API_DOCUMENTATION.md)
- **Test Files:** Available in the project root directory

---

**Last Updated:** January 2025  
**Version:** 1.0.0
