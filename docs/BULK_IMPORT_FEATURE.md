# Bulk Import Feature with Auto Exam Year Detection

## Overview

The bulk import feature allows administrators to upload multiple JSON files containing questions, with automatic exam year detection from filenames and shared metadata configuration.

## Features

### ✅ Implemented Features

1. **Multi-File Upload**
   - Drag and drop multiple `.json` files
   - File selection dialog with multi-select support
   - Real-time file list with status indicators

2. **Auto Exam Year Detection**
   - Extracts 4-digit years from filenames using regex `/(\d{4})/`
   - Validates years are between 1900 and current year
   - Manual year editing for files without detected years

3. **Shared Metadata**
   - Rotation selection (R1, R2, R3, R4) - optional
   - Source selection - required
   - Applied to all uploaded files

4. **Client-Side Validation**
   - JSON structure validation
   - Question schema validation
   - Answer validation (correct count, required fields)
   - Real-time validation status updates

5. **Strict Validation**
   - Blocks import if any file is invalid
   - Shows detailed error messages per file
   - Requires all files to have exam years set

6. **Multi-Request Import**
   - Sends separate API request for each file
   - Progress tracking per file
   - Individual success/failure handling

7. **User Feedback**
   - Real-time validation status
   - Upload progress indicators
   - Detailed success/error messages
   - Per-file status display

## Usage Workflow

### 1. Navigation
```
Admin → Content → University → Study Pack → Unit → Module → Course → Bulk Import
```

### 2. File Upload
- Select or drag multiple `.json` files
- System automatically detects exam years from filenames
- Edit years manually if not detected

### 3. Metadata Configuration
- Select rotation (optional): R1, R2, R3, R4
- Select question source (required)

### 4. Validation
- System validates all files client-side
- Shows validation summary with counts
- Displays errors for invalid files

### 5. Import
- Click "Start Import" when all files are valid
- System sends separate request for each file
- Shows progress and results

## File Naming Convention

For automatic exam year detection, include a 4-digit year in the filename:

✅ **Good Examples:**
- `cour_2018.json` → Year: 2018
- `cour_2029.json` → Year: 2029
- `questions_2020_final.json` → Year: 2020
- `exam2019.json` → Year: 2019
- `2021_questions.json` → Year: 2021

❌ **No Year Detected:**
- `questions.json`
- `no_year_here.json`
- `year_1800.json` (too old)
- `year_3000.json` (too future)

## JSON File Format

Each file must contain questions in one of two supported formats:

### Format 1: Direct Array (Legacy)
```json
[
  {
    "questionText": "What is 2+2?",
    "questionType": "SINGLE_CHOICE",
    "explanation": "Basic arithmetic question",
    "answers": [
      {
        "answerText": "3",
        "isCorrect": false,
        "explanation": "Incorrect answer"
      },
      {
        "answerText": "4",
        "isCorrect": true,
        "explanation": "Correct answer"
      },
      {
        "answerText": "5",
        "isCorrect": false
      }
    ]
  }
]
```

### Format 2: Object with Questions Array (Current)
```json
{
  "questions": [
    {
      "questionText": "What is 2+2?",
      "questionType": "SINGLE_CHOICE",
      "explanation": "Basic arithmetic question",
      "answers": [
        {
          "answerText": "3",
          "isCorrect": false,
          "explanation": "Incorrect answer"
        },
        {
          "answerText": "4",
          "isCorrect": true,
          "explanation": "Correct answer"
        },
        {
          "answerText": "5",
          "isCorrect": false
        }
      ]
    }
  ]
}
```

### Required Fields
- `questionText` (string)
- `questionType` ("SINGLE_CHOICE" | "MULTIPLE_CHOICE")
- `answers` (array with at least 2 items)
- `answers[].answerText` (string)
- `answers[].isCorrect` (boolean)

### Optional Fields
- `explanation` (string)
- `answers[].explanation` (string)

### Validation Rules
- **SINGLE_CHOICE**: Exactly 1 correct answer
- **MULTIPLE_CHOICE**: At least 1 correct answer
- Minimum 2 answers per question

## API Integration

The feature uses the existing bulk import endpoint:

```typescript
POST /api/v1/admin/questions/bulk

// Request payload for each file:
{
  "metadata": {
    "courseId": number,
    "universityId": number,
    "examYear": number,        // Auto-detected from filename
    "sourceId": number,        // User selected
    "rotation": string         // User selected (optional)
  },
  "questions": ImportQuestion[]
}
```

## Error Handling

### Validation Errors
- Invalid JSON format
- Missing required fields
- Invalid question types
- Incorrect answer counts
- Missing exam years

### Import Errors
- Network failures
- Server errors
- Individual file failures

### User Feedback
- Real-time validation status
- Detailed error messages
- Progress indicators
- Success/failure summaries

## Components

### Main Components
- `BulkImportWizard` - Main import interface
- `BulkFileUpload` - File upload and list management
- `bulk-import-validation.ts` - Validation utilities

### Integration
- Added to `/admin/content` page as "Bulk Import" option
- Integrated with existing navigation flow
- Uses existing API services and hooks

## Testing

Run the validation tests:
```bash
npm test src/utils/__tests__/bulk-import-validation.test.ts
```

## Future Enhancements

Potential improvements:
- Batch API endpoint for better performance
- File preview functionality
- Import history tracking
- Template download feature
- Advanced filtering options
