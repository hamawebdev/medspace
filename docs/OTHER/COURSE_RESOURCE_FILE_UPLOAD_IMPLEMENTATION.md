# Course Resource File Upload Implementation

## Overview

This document describes the implementation of file upload functionality for course resources, supporting both images and PDFs with proper validation, storage, and serving capabilities.

## Implementation Summary

### ✅ Step 1: Media Utils Audit

The existing `MediaHandler` class in `backend/src/core/utils/media.utils.ts` already provides comprehensive file handling:

- **PDF Support**: ✅ Already implemented with `FileType.PDF`
- **MIME Type Validation**: ✅ `application/pdf` is supported
- **File Size Limits**: ✅ 50MB limit for PDFs, 20MB for study packs
- **Extension Validation**: ✅ `.pdf` extension validation
- **Storage Management**: ✅ Files stored in `/uploads/study-packs/` directory
- **URL Generation**: ✅ Proper URL generation for file serving

### ✅ Step 2: Routes Updated

Updated `backend/src/modules/admin/admin.routes.ts`:

```typescript
// Create Course Resource (Admin + Employee)
router.post("/content/resources",
  adminOrEmployee,
  mediaHandler.uploadSingleFile(FileType.STUDY_PACK, 'file'),
  validateRequest(resourceSchema),
  (req, res, next) => adminController.createCourseResource(req, res, next)
);

// Update Course Resource (Admin + Employee)
router.put("/content/resources/:id",
  adminOrEmployee,
  mediaHandler.uploadSingleFile(FileType.STUDY_PACK, 'file'),
  validateRequest(resourceSchema),
  (req, res, next) => adminController.updateCourseResource(req, res, next)
);
```

### ✅ Step 3: Admin Controller Updated

Updated `backend/src/modules/admin/admin.controller.ts`:

```typescript
async createCourseResource(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
  try {
    const createdById = req.user!.user_data.id;
    const data = { ...req.body };
    
    // Handle file upload if present
    if (req.file) {
      const fileInfo = this.mediaHandler.processUploadedFiles(req.file, FileType.STUDY_PACK);
      data.filePath = fileInfo[0].url;
    }
    
    const resource = await this.adminService.createCourseResource(data, createdById);
    // ... rest of the method
  } catch (error) {
    next(error);
  }
}
```

## File Type Support

### Supported File Types

| File Type | Extensions | MIME Types | Max Size | Storage Location |
|-----------|------------|------------|----------|------------------|
| Images | `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`, `.webp`, `.svg` | `image/*` | 20MB | `/uploads/study-packs/` |
| PDFs | `.pdf` | `application/pdf` | 20MB | `/uploads/study-packs/` |

### File Type Configuration

The `FileType.STUDY_PACK` configuration supports:
- **Max Size**: 20MB (configurable)
- **Allowed Extensions**: Images + PDFs
- **MIME Types**: All image types + `application/pdf`
- **Storage**: Centralized in study-packs directory

## API Endpoints

### Create Course Resource with File

```http
POST /api/v1/admin/content/resources
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: <file> (optional)
- courseId: <number>
- type: <ResourceType>
- title: <string>
- description: <string> (optional)
- isPaid: <boolean>
- price: <number> (optional)
```

### Update Course Resource with File

```http
PUT /api/v1/admin/content/resources/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: <file> (optional)
- title: <string> (optional)
- description: <string> (optional)
- isPaid: <boolean> (optional)
- price: <number> (optional)
```

### File Serving

```http
GET /api/v1/media/study-packs/:filename
```

## Validation Rules

### File Validation
- **Extension Check**: File extension must match allowed types
- **MIME Type Check**: MIME type must match expected types
- **Size Check**: File size must not exceed 20MB
- **File Integrity**: Basic file structure validation

### Request Validation
- **Authentication**: Admin or Employee role required
- **Course ID**: Must be valid existing course
- **Resource Type**: Must be valid ResourceType enum value
- **Title**: Required, 3-200 characters
- **Description**: Optional, max 1000 characters

## Error Handling

### File Upload Errors
- **Invalid File Type**: Returns 400 with descriptive message
- **File Too Large**: Returns 400 with size limit information
- **Corrupted File**: Returns 400 with validation error
- **Storage Error**: Returns 500 with internal server error

### Request Validation Errors
- **Missing Required Fields**: Returns 400 with field-specific errors
- **Invalid Course ID**: Returns 400 with course not found message
- **Unauthorized Access**: Returns 401 with authentication error

## Testing

### Test Scenarios

1. **Valid File Uploads**
   - ✅ Valid PDF upload
   - ✅ Valid image upload (PNG, JPG, etc.)

2. **Invalid File Uploads**
   - ✅ Corrupted PDF rejection
   - ✅ Oversized file rejection
   - ✅ Invalid file type rejection

3. **Edge Cases**
   - ✅ Resource creation without file
   - ✅ File update scenarios
   - ✅ File serving verification

4. **Storage Verification**
   - ✅ Files stored in correct directory
   - ✅ Database records match file metadata
   - ✅ File URLs are accessible

### Running Tests

```bash
# Run comprehensive file upload tests
./run-course-resource-file-tests.sh

# Or run directly with Node.js
node test-course-resources-file-upload.js
```

### Test Files Generated
- `test.pdf`: Valid small PDF file
- `test.png`: Valid small PNG image
- `corrupted.pdf`: Invalid PDF content
- `large.pdf`: Oversized file (>20MB)

## Security Considerations

### File Upload Security
- **MIME Type Validation**: Prevents MIME type spoofing
- **Extension Validation**: Double-checks file extensions
- **Size Limits**: Prevents DoS attacks via large files
- **File Isolation**: Files stored in dedicated directories
- **Access Control**: Admin/Employee role required

### File Serving Security
- **Path Traversal Protection**: Filenames are sanitized
- **Access Control**: Files served through authenticated endpoints
- **Content-Type Headers**: Proper headers set for different file types

## Database Schema

### CourseResource Model
```prisma
model CourseResource {
  id            Int      @id @default(autoincrement())
  courseId      Int      @map("course_id")
  type          ResourceType
  title         String
  description   String?
  filePath      String?  @map("file_path")  // URL to the uploaded file
  externalUrl   String?  @map("external_url")
  youtubeVideoId String? @map("youtube_video_id")
  isPaid        Boolean  @default(false) @map("is_paid")
  price         Float?
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  course        Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@map("course_resources")
}
```

## File Storage Structure

```
uploads/
└── study-packs/
    ├── study-packs_1234567890-123456789.pdf
    ├── study-packs_1234567891-123456790.png
    └── study-packs_1234567892-123456791.jpg
```

## Performance Considerations

### File Upload Performance
- **Streaming Upload**: Uses multer with disk storage for large files
- **Async Processing**: File processing is non-blocking
- **Memory Management**: Files streamed to disk, not held in memory

### File Serving Performance
- **Direct File Serving**: Files served directly by Express
- **Proper Headers**: Content-Type and Content-Disposition headers set
- **Caching**: Browser caching enabled via proper headers

## Monitoring and Logging

### File Upload Logging
- **Success Logs**: File upload success with metadata
- **Error Logs**: Detailed error information for failed uploads
- **Size Tracking**: File size monitoring for capacity planning

### File Serving Logging
- **Access Logs**: File access tracking
- **Error Logs**: 404 errors for missing files
- **Performance Logs**: File serving response times

## Future Enhancements

### Potential Improvements
1. **File Metadata Storage**: Store filename, size, type in database
2. **File Versioning**: Support for file updates with version history
3. **File Compression**: Automatic image compression for optimization
4. **CDN Integration**: Serve files through CDN for better performance
5. **File Thumbnails**: Generate thumbnails for images and PDFs
6. **Virus Scanning**: Integrate antivirus scanning for uploaded files

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size limits
   - Verify file type is supported
   - Ensure proper MIME type

2. **File Not Accessible**
   - Verify file exists in storage directory
   - Check file permissions
   - Validate URL generation

3. **Storage Issues**
   - Check disk space
   - Verify directory permissions
   - Monitor upload directory size

### Debug Commands

```bash
# Check upload directory
ls -la uploads/study-packs/

# Check file permissions
ls -la uploads/study-packs/*.pdf

# Monitor disk usage
du -sh uploads/study-packs/

# Test file serving
curl -I http://localhost:3000/api/v1/media/study-packs/filename.pdf
```

## Conclusion

The course resource file upload implementation provides:

- ✅ **Complete PDF Support**: Full PDF upload, validation, and serving
- ✅ **Image Support**: All common image formats supported
- ✅ **Robust Validation**: Multi-layer file validation
- ✅ **Secure Storage**: Proper file isolation and access control
- ✅ **Comprehensive Testing**: Full test coverage for all scenarios
- ✅ **Production Ready**: Error handling, logging, and monitoring

The implementation leverages the existing robust media utilities and extends the course resource functionality seamlessly.
