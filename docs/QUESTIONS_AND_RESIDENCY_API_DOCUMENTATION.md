
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
