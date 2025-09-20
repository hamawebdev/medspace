# Question Image Endpoints Implementation

## Overview
This document describes the implementation of two new admin endpoints for managing question images and explanation images in the MedCortex platform.

## New Endpoints

### 1. Update Question Images
- **Endpoint**: `PUT /api/admin/image/{questionId}/question-images`
- **Purpose**: Replace all existing question images with new ones
- **Access**: Admin and Employee roles
- **File Upload**: Multiple image files (up to 10)
- **Field Name**: `questionImages`

### 2. Update Question Explanation Images
- **Endpoint**: `PUT /api/admin/image/{questionId}/explanation-images`
- **Purpose**: Replace all existing question explanation images with new ones
- **Access**: Admin and Employee roles
- **File Upload**: Multiple image files (up to 10)
- **Field Name**: `explanationImages`

## Implementation Details

### Files Modified

#### 1. `backend/src/modules/admin/admin.routes.ts`
- Added two new PUT routes for image management
- Routes include proper middleware for authentication, authorization, file upload, and validation
- Uses `FileType.IMAGE` for question images and `FileType.EXPLANATION` for explanation images

#### 2. `backend/src/modules/admin/admin.controller.ts`
- Added `updateQuestionImages()` method
- Added `updateQuestionExplanationImages()` method
- Both methods handle file processing and call corresponding service methods
- Include proper error handling and response formatting

#### 3. `backend/src/modules/admin/admin.service.ts`
- Added `updateQuestionImages()` service method
- Added `updateQuestionExplanationImages()` service method
- Both methods use database transactions for atomicity
- Delete existing images before creating new ones (replace behavior)
- Log admin activities for audit trail

### Database Operations

Both endpoints perform the following operations:
1. Verify the question exists
2. Delete all existing images of the specified type
3. Create new image records with uploaded file information
4. Log the activity in the employee activities table

### File Handling

- **Question Images**: Stored using `FileType.IMAGE` (10MB max per file)
- **Explanation Images**: Stored using `FileType.EXPLANATION` (15MB max per file)
- **Supported Formats**: JPEG, PNG, GIF, BMP, TIFF, WebP, SVG
- **Max Files**: 10 files per request
- **Storage**: Files are processed and stored in appropriate subdirectories

## Testing

### Test Scripts Created

#### 1. `test-question-image-endpoints.js`
- Comprehensive Node.js test suite
- Tests all scenarios including success cases, error cases, and edge cases
- Requires `form-data` and `node-fetch` packages

#### 2. `run-question-image-tests.sh`
- Shell script to run the Node.js tests
- Handles dependency installation
- Creates sample test images if needed
- Provides detailed setup instructions

#### 3. `test-question-images-curl.sh`
- Quick curl-based testing script
- Tests all endpoints with various scenarios
- No additional dependencies required
- Easy to use for quick validation

### Test Scenarios

1. **Success Cases**:
   - Upload question images successfully
   - Upload explanation images successfully

2. **Error Cases**:
   - Invalid question ID (404)
   - No files uploaded (400)
   - Unauthorized access (401)
   - Invalid file types (400)

3. **Edge Cases**:
   - Multiple files upload
   - Large file handling
   - File replacement behavior

## Usage Examples

### Using curl

```bash
# Update question images
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "questionImages=@image1.jpg" \
  -F "questionImages=@image2.jpg" \
  http://localhost:3000/api/admin/image/123/question-images

# Update explanation images
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "explanationImages=@explanation1.jpg" \
  -F "explanationImages=@explanation2.jpg" \
  http://localhost:3000/api/admin/image/123/explanation-images
```

### Using the test scripts

```bash
# Run comprehensive tests
ADMIN_TOKEN="your-token" ./run-question-image-tests.sh

# Run quick curl tests
./test-question-images-curl.sh 123 "your-token"
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Question images updated successfully",
  "data": {
    "questionId": 123,
    "images": [
      {
        "id": 1,
        "questionId": 123,
        "imagePath": "/uploads/images/filename.jpg",
        "altText": "original-filename.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "uploadedFiles": [
      {
        "filename": "processed-filename.jpg",
        "originalname": "original-filename.jpg",
        "url": "/uploads/images/processed-filename.jpg",
        "size": 1024000
      }
    ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Question not found",
  "error": "NotFoundError"
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid admin or employee authentication
2. **Authorization**: Role-based access control (admin or employee only)
3. **File Validation**: File type and size validation
4. **Input Validation**: Question ID validation using Zod schema
5. **Activity Logging**: All operations are logged for audit purposes

## Database Schema

The implementation uses existing database tables:
- `QuestionImage`: Stores question images
- `QuestionExplanationImage`: Stores question explanation images
- `EmployeeActivity`: Logs admin activities

## Future Enhancements

Potential improvements for future versions:
1. **Image Optimization**: Automatic image resizing and compression
2. **CDN Integration**: Store images on CDN for better performance
3. **Image Metadata**: Store additional image metadata (dimensions, format, etc.)
4. **Bulk Operations**: Support for updating multiple questions at once
5. **Image Preview**: Generate thumbnails for quick preview
6. **Version History**: Track image changes over time

## Troubleshooting

### Common Issues

1. **File Upload Fails**:
   - Check file size limits
   - Verify file format is supported
   - Ensure proper field names in form data

2. **Authentication Errors**:
   - Verify admin token is valid
   - Check token expiration
   - Ensure user has admin or employee role

3. **Question Not Found**:
   - Verify question ID exists in database
   - Check question is not deleted

4. **Server Errors**:
   - Check server logs for detailed error messages
   - Verify database connection
   - Check file system permissions

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=medcortex:* npm start
```

## Conclusion

The question image endpoints have been successfully implemented with proper error handling, security measures, and comprehensive testing. The endpoints provide a clean API for managing question images and explanation images with replace functionality, ensuring data consistency and proper audit trails.
