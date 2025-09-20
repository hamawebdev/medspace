# Delete Question Images API Documentation

## Overview
This document describes the new API endpoints for deleting question images and explanation images from the Medcin platform.

## Endpoints

### 1. Delete Question Images
**Endpoint:** `DELETE /api/v1/admin/image/{questionId}/question-images`

**Description:** Deletes all question images associated with a specific question.

**Authentication:** Required (Admin or Employee)

**Parameters:**
- `questionId` (path parameter): The ID of the question whose images should be deleted

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Question images deleted successfully",
  "data": {
    "questionId": 123,
    "deletedCount": 3,
    "deletedImages": [
      {
        "id": 1,
        "imagePath": "/uploads/images/question_123_1.jpg",
        "altText": "Question Image 1"
      },
      {
        "id": 2,
        "imagePath": "/uploads/images/question_123_2.jpg", 
        "altText": "Question Image 2"
      }
    ]
  }
}
```

**Error Responses:**
- `404 Not Found`: Question not found
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: Insufficient permissions (not admin or employee)
- `500 Internal Server Error`: Server error during deletion

### 2. Delete Question Explanation Images
**Endpoint:** `DELETE /api/v1/admin/image/{questionId}/explanation-images`

**Description:** Deletes all explanation images associated with a specific question.

**Authentication:** Required (Admin or Employee)

**Parameters:**
- `questionId` (path parameter): The ID of the question whose explanation images should be deleted

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Question explanation images deleted successfully",
  "data": {
    "questionId": 123,
    "deletedCount": 2,
    "deletedImages": [
      {
        "id": 1,
        "imagePath": "/uploads/explanations/question_123_explanation_1.jpg",
        "altText": "Explanation Image 1"
      },
      {
        "id": 2,
        "imagePath": "/uploads/explanations/question_123_explanation_2.jpg",
        "altText": "Explanation Image 2"
      }
    ]
  }
}
```

**Error Responses:**
- `404 Not Found`: Question not found
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: Insufficient permissions (not admin or employee)
- `500 Internal Server Error`: Server error during deletion

## Implementation Details

### Database Operations
Both endpoints perform the following operations:
1. Verify the question exists
2. Retrieve existing images before deletion (for logging)
3. Delete all images in a database transaction
4. Log the admin activity
5. Return deletion results

### Security Features
- **Authentication Required**: Both endpoints require valid authentication tokens
- **Role-Based Access**: Only admin and employee roles can access these endpoints
- **Transaction Safety**: Database operations are wrapped in transactions for data consistency
- **Activity Logging**: All deletions are logged in the employee activity table

### Error Handling
- Comprehensive error handling with appropriate HTTP status codes
- Detailed error messages for debugging
- Graceful handling of database errors
- Proper validation of question existence

## Usage Examples

### cURL Examples

#### Delete Question Images
```bash
curl -X DELETE "http://localhost:3000/api/v1/admin/image/123/question-images" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

#### Delete Explanation Images
```bash
curl -X DELETE "http://localhost:3000/api/v1/admin/image/123/explanation-images" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript/Node.js Example
```javascript
const deleteQuestionImages = async (questionId, token) => {
  try {
    const response = await fetch(`/api/v1/admin/image/${questionId}/question-images`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`Deleted ${result.data.deletedCount} images`);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error deleting question images:', error);
    throw error;
  }
};
```

## Testing

A test script `test-delete-question-images.sh` is provided to verify the endpoints work correctly. The script:
1. Authenticates as an admin user
2. Tests both delete endpoints
3. Validates the responses
4. Reports success/failure status

To run the test:
```bash
./test-delete-question-images.sh
```

## Related Endpoints

These delete endpoints complement the existing image management endpoints:
- `PUT /api/v1/admin/image/{questionId}/question-images` - Update question images
- `PUT /api/v1/admin/image/{questionId}/explanation-images` - Update explanation images

## Notes

- These endpoints delete ALL images of the specified type for a question
- The deletion is permanent and cannot be undone
- All deletions are logged for audit purposes
- The endpoints return information about what was deleted for confirmation
