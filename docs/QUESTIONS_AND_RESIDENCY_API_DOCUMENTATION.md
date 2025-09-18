# Questions & Residency Questions API Documentation

## Overview

This documentation covers the Questions and Residency Questions APIs with file upload capabilities. Both modules support image uploads for questions and explanations, with consistent file handling via `media.utils.ts`.

---

## Questions API

### Create Question with Images

**POST** `/admin/questions`

Creates a new question with optional image uploads.

#### Request

**Content-Type**: `multipart/form-data`

**Required Fields:**
- `questionText` (string): Question text (min 5 characters)
- `answers` (JSON string): Array of answer objects

**Optional Fields:**
- `explanation` (string): Question explanation
- `questionType` (string): `SINGLE_CHOICE` or `MULTIPLE_CHOICE` (default: `SINGLE_CHOICE`)
- `courseId` (number): Course ID
- `examId` (number): Exam ID
- `sourceId` (number): Question source ID
- `universityId` (number): University ID
- `yearLevel` (string): `ONE`, `TWO`, `THREE`, `FOUR`, `FIVE`, `SIX`, `SEVEN`
- `examYear` (number): Exam year (2000-2100)
- `rotation` (string): `R1`, `R2`, `R3`, `R4`
- `metadata` (string): Additional metadata (max 5000 characters)

**File Upload Fields:**
- `questionImages` (file[]): Question images (max 10 files, 10MB each)
- `explanationImages` (file[]): Explanation images (max 10 files, 10MB each)

**Supported File Types:**
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`, `.webp`, `.svg`
- Max file size: 10MB per file

#### Request Example

```javascript
const formData = new FormData();

// Add question images
formData.append('questionImages', file1);
formData.append('questionImages', file2);

// Add explanation images
formData.append('explanationImages', file3);

// Add question data
formData.append('questionText', 'What is the capital of France?');
formData.append('explanation', 'Paris is the capital and largest city of France.');
formData.append('questionType', 'SINGLE_CHOICE');
formData.append('answers', JSON.stringify([
  { answerText: 'Paris', isCorrect: true },
  { answerText: 'London', isCorrect: false },
  { answerText: 'Berlin', isCorrect: false }
]));

fetch('/api/v1/admin/questions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

#### Response Example

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "questionText": "What is the capital of France?",
    "explanation": "Paris is the capital and largest city of France.",
    "questionType": "SINGLE_CHOICE",
    "questionImages": [
      {
        "id": 1,
        "imagePath": "/api/v1/media/images/images_1234567890_123456789.png",
        "altText": "question-image-1.png"
      }
    ],
    "questionExplanationImages": [
      {
        "id": 2,
        "imagePath": "/api/v1/media/images/images_1234567891_123456790.png",
        "altText": "explanation-image-1.png"
      }
    ],
    "questionAnswers": [
      {
        "id": 1,
        "answerText": "Paris",
        "isCorrect": true
      }
    ]
  },
  "message": "Question created successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Invalid file type for images. Allowed types: image/jpeg, image/png, image/gif, image/bmp, image/tiff, image/webp, image/svg+xml"
}
```

---

### Get Question

**GET** `/admin/questions/:id`

Retrieves a specific question with all associated images and answers.

#### Response Example

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "questionText": "What is the capital of France?",
    "explanation": "Paris is the capital and largest city of France.",
    "questionType": "SINGLE_CHOICE",
    "questionImages": [
      {
        "id": 1,
        "imagePath": "/api/v1/media/images/images_1234567890_123456789.png",
        "altText": "question-image-1.png"
      }
    ],
    "questionExplanationImages": [
      {
        "id": 2,
        "imagePath": "/api/v1/media/images/images_1234567891_123456790.png",
        "altText": "explanation-image-1.png"
      }
    ],
    "questionAnswers": [
      {
        "id": 1,
        "answerText": "Paris",
        "isCorrect": true,
        "explanation": null
      }
    ]
  }
}
```

---

### Update Question with Images

**PUT** `/admin/questions/:id`

Updates an existing question with optional new image uploads.

#### Request

**Content-Type**: `multipart/form-data`

**Optional Fields:**
- `questionText` (string): Updated question text
- `explanation` (string): Updated explanation
- `questionType` (string): Updated question type
- `courseId` (number): Updated course ID
- `examId` (number): Updated exam ID
- `sourceId` (number): Updated source ID
- `universityId` (number): Updated university ID
- `yearLevel` (string): Updated year level
- `examYear` (number): Updated exam year
- `rotation` (string): Updated rotation
- `metadata` (string): Updated metadata

**File Upload Fields:**
- `questionImages` (file[]): New question images (max 10 files, 10MB each)
- `explanationImages` (file[]): New explanation images (max 10 files, 10MB each)

#### Request Example

```javascript
const formData = new FormData();

// Add new images
formData.append('questionImages', newImageFile);
formData.append('explanationImages', newExplanationFile);

// Update question data
formData.append('questionText', 'Updated: What is the capital of France?');
formData.append('explanation', 'Updated explanation text.');

fetch('/api/v1/admin/questions/123', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

---


### Add Explanation Images to Question

**POST** `/admin/questions/:id/explanation-images`

Adds additional explanation images to an existing question.

#### Request

**Content-Type**: `multipart/form-data`

**Required Fields:**
- `explanationImages` (file[]): Explanation images to add (max 10 files, 10MB each)

#### Request Example

```javascript
const formData = new FormData();
formData.append('explanationImages', explanationImageFile1);
formData.append('explanationImages', explanationImageFile2);

fetch('/api/v1/admin/questions/123/explanation-images', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

---

### Delete Question

**DELETE** `/admin/questions/:id`

Deletes a question and automatically cleans up all associated image files.

#### Response Example

**Success (200):**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

---

## Residency Questions API

### Create Residency Question with Images

**POST** `/admin/residency-questions`

Creates a new residency question with optional image uploads.

#### Request

**Content-Type**: `multipart/form-data`

**Required Fields:**
- `questionText` (string): Question text (min 5 characters)
- `part` (string): Residency part (`E_Sciences_Fondamentales`, `E_Dossiers_Cliniques`, `E_Pathologies_M_C`)
- `questionAnswers` (JSON string): Array of answer objects

**Optional Fields:**
- `explanation` (string): Question explanation
- `universityId` (number): University ID
- `examYear` (number): Exam year
- `metadata` (string): Additional metadata

**File Upload Fields:**
- `questionImages` (file[]): Question images (max 5 files, 10MB each)
- `questionExplanationImages` (file[]): Explanation images (max 5 files, 10MB each)

#### Request Example

```javascript
const formData = new FormData();

// Add question images
formData.append('questionImages', file1);
formData.append('questionImages', file2);

// Add explanation images
formData.append('questionExplanationImages', file3);

// Add question data
formData.append('questionText', 'What is the most common cause of acute myocardial infarction?');
formData.append('explanation', 'Atherosclerotic coronary artery disease is the most common cause.');
formData.append('part', 'E_Sciences_Fondamentales');
formData.append('universityId', '1');
formData.append('examYear', '2023');
formData.append('questionAnswers', JSON.stringify([
  { answerText: 'Atherosclerotic coronary artery disease', isCorrect: true },
  { answerText: 'Vasospasm', isCorrect: false },
  { answerText: 'Embolism', isCorrect: false }
]));

fetch('/api/v1/admin/residency-questions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

#### Response Example

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "questionId": 789,
    "part": "E_Sciences_Fondamentales",
    "question": {
      "id": 789,
      "questionText": "What is the most common cause of acute myocardial infarction?",
      "explanation": "Atherosclerotic coronary artery disease is the most common cause.",
      "questionType": "SINGLE_CHOICE",
      "questionImages": [
        {
          "id": 3,
          "imagePath": "/api/v1/media/images/images_1234567892_123456791.png",
          "altText": "residency-question-image-1.png"
        }
      ],
      "questionExplanationImages": [
        {
          "id": 4,
          "imagePath": "/api/v1/media/images/images_1234567893_123456792.png",
          "altText": "residency-explanation-image-1.png"
        }
      ],
      "questionAnswers": [
        {
          "id": 2,
          "answerText": "Atherosclerotic coronary artery disease",
          "isCorrect": true
        }
      ]
    }
  },
  "message": "Residency question created successfully"
}
```

---

### Get Residency Question

**GET** `/admin/residency-questions/:id`

Retrieves a specific residency question with all associated images and answers.

#### Response Example

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "questionId": 789,
    "part": "E_Sciences_Fondamentales",
    "question": {
      "id": 789,
      "questionText": "What is the most common cause of acute myocardial infarction?",
      "explanation": "Atherosclerotic coronary artery disease is the most common cause.",
      "questionType": "SINGLE_CHOICE",
      "questionImages": [
        {
          "id": 3,
          "imagePath": "/api/v1/media/images/images_1234567892_123456791.png",
          "altText": "residency-question-image-1.png"
        }
      ],
      "questionExplanationImages": [
        {
          "id": 4,
          "imagePath": "/api/v1/media/images/images_1234567893_123456792.png",
          "altText": "residency-explanation-image-1.png"
        }
      ],
      "questionAnswers": [
        {
          "id": 2,
          "answerText": "Atherosclerotic coronary artery disease",
          "isCorrect": true
        }
      ]
    }
  }
}
```

---

### Update Residency Question with Images

**PUT** `/admin/residency-questions/:id`

Updates an existing residency question with optional new image uploads.

#### Request

**Content-Type**: `multipart/form-data`

**Optional Fields:**
- `questionText` (string): Updated question text
- `explanation` (string): Updated explanation
- `part` (string): Updated residency part
- `universityId` (number): Updated university ID
- `examYear` (number): Updated exam year
- `metadata` (string): Updated metadata

**File Upload Fields:**
- `questionImages` (file[]): New question images (max 5 files, 10MB each)
- `questionExplanationImages` (file[]): New explanation images (max 5 files, 10MB each)

#### Request Example

```javascript
const formData = new FormData();

// Add new images
formData.append('questionImages', newImageFile);
formData.append('questionExplanationImages', newExplanationFile);

// Update question data
formData.append('questionText', 'Updated: What is the most common cause of acute myocardial infarction?');
formData.append('explanation', 'Updated explanation text.');

fetch('/api/v1/admin/residency-questions/456', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

---

### Delete Residency Question

**DELETE** `/admin/residency-questions/:id`

Deletes a residency question and automatically cleans up all associated image files.

#### Response Example

**Success (200):**
```json
{
  "success": true,
  "message": "Residency question deleted successfully"
}
```

---

## File Serving

### Serve Images

**GET** `/api/v1/media/images/:filename`

Serves uploaded images directly. This endpoint is used by the `imagePath` URLs returned in question responses.

#### Response

**Success (200):**
- **Content-Type**: `image/jpeg`, `image/png`, `image/gif`, etc.
- **Body**: Binary image data

**Error (404):**
```json
{
  "success": false,
  "message": "File not found"
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed: questionText: Question text must be at least 5 characters"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Question not found"
}
```

**413 Payload Too Large:**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB"
}
```

**415 Unsupported Media Type:**
```json
{
  "success": false,
  "message": "Invalid file type for images. Allowed types: image/jpeg, image/png, image/gif, image/bmp, image/tiff, image/webp, image/svg+xml"
}
```

---

## File Upload Guidelines

### Supported File Types

**Images:**
- `.jpg`, `.jpeg` - JPEG images
- `.png` - PNG images
- `.gif` - GIF images
- `.bmp` - Bitmap images
- `.tiff` - TIFF images
- `.webp` - WebP images
- `.svg` - SVG vector images

### File Size Limits

- **Maximum file size**: 10MB per file
- **Maximum files per field**: 10 files for questions, 5 files for residency questions
- **Total request size**: No specific limit (handled by server configuration)

### File Validation

Files are validated on:
1. **File extension** - Must match supported types
2. **MIME type** - Must match expected MIME types
3. **File size** - Must not exceed 10MB
4. **File count** - Must not exceed field limits

### File Storage

- **Storage location**: `/uploads/images/`
- **File naming**: `images_{timestamp}_{random}.{extension}`
- **URL format**: `/api/v1/media/images/{filename}`
- **Automatic cleanup**: Files are deleted when questions are deleted

---

## Frontend Integration Examples

### React/JavaScript Example

```javascript
// Create question with images
const createQuestionWithImages = async (questionData, imageFiles) => {
  const formData = new FormData();
  
  // Add images
  imageFiles.forEach(file => {
    formData.append('questionImages', file);
  });
  
  // Add question data
  Object.keys(questionData).forEach(key => {
    if (key === 'answers') {
      formData.append(key, JSON.stringify(questionData[key]));
    } else {
      formData.append(key, questionData[key]);
    }
  });
  
  try {
    const response = await fetch('/api/v1/admin/questions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// Display images
const QuestionImage = ({ imagePath, altText }) => {
  return (
    <img 
      src={`http://localhost:3005${imagePath}`}
      alt={altText}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};
```

### Vue.js Example

```javascript
// Vue component for question creation
export default {
  data() {
    return {
      questionData: {
        questionText: '',
        explanation: '',
        answers: []
      },
      selectedImages: []
    };
  },
  methods: {
    async createQuestion() {
      const formData = new FormData();
      
      // Add images
      this.selectedImages.forEach(file => {
        formData.append('questionImages', file);
      });
      
      // Add question data
      formData.append('questionText', this.questionData.questionText);
      formData.append('explanation', this.questionData.explanation);
      formData.append('answers', JSON.stringify(this.questionData.answers));
      
      try {
        const response = await this.$http.post('/admin/questions', formData, {
          headers: {
            'Authorization': `Bearer ${this.$store.state.authToken}`
          }
        });
        
        this.$toast.success('Question created successfully!');
        this.resetForm();
      } catch (error) {
        this.$toast.error('Failed to create question: ' + error.message);
      }
    },
    
    onImageSelect(event) {
      this.selectedImages = Array.from(event.target.files);
    }
  }
};
```

---

## Testing

### Running Tests

```bash
# Run comprehensive file upload tests
./run-comprehensive-file-tests.sh

# Or run directly with Node.js
node test-comprehensive-file-uploads.js
```

### Test Coverage

The test suite covers:
- ✅ Question creation with images
- ✅ Residency question creation with images
- ✅ File upload validation
- ✅ File serving
- ✅ File cleanup on deletion
- ✅ Error handling for invalid files
- ✅ CRUD operations with file uploads

---

## Notes for Frontend Developers

1. **Always use `multipart/form-data`** for requests with file uploads
2. **Include `Authorization: Bearer {token}`** header for all requests
3. **Handle file size limits** on the frontend before upload
4. **Validate file types** on the frontend for better UX
5. **Use the returned `imagePath` URLs** to display images
6. **Files are automatically cleaned up** when questions are deleted
7. **Image URLs are absolute paths** starting with `/api/v1/media/images/`
8. **Maximum 10 images per field** for questions, 5 for residency questions
9. **File size limit is 10MB per file**
10. **Supported formats**: JPG, PNG, GIF, BMP, TIFF, WebP, SVG
