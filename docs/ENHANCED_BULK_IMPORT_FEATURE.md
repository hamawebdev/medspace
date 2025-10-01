# Enhanced Bulk Import Feature with Auto-Detection

## Overview

The enhanced bulk import feature allows administrators to upload multiple JSON files containing questions with **automatic detection** of course, exam year, source, and rotation from filenames. This significantly reduces manual data entry and speeds up the import process.

## Key Features

### ✅ Auto-Detection from Filenames

1. **Exam Year Detection**
   - Automatically extracts 4-digit years (1900 - current year)
   - Example: `pit_questions_2018.json` → Year: 2018

2. **Course Detection**
   - Extracts course identifier from filename
   - Performs fuzzy matching against available courses
   - Falls back to manual selection if no match found
   - Example: `pit_questions_2018.json` → Course: "PIT" (if exists)

3. **Source Detection**
   - Automatically detects RATT source (sourceId = 4)
   - Prompts for manual selection for non-RATT files
   - Example: `pit_questions_2018_RATT.json` → Source: RATT (ID: 4)

4. **Rotation Detection**
   - Automatically extracts R1, R2, R3, or R4 from filename
   - Optional field (can be left empty)
   - Example: `pit_questions_2018_RATT_R1.json` → Rotation: R1

### ✅ Per-File Metadata

Each file can have different metadata:
- Different courses
- Different exam years
- Different sources
- Different rotations

This allows importing questions from multiple courses/years in a single batch.

### ✅ Strict Validation

- All files must pass validation before import can start
- Required fields: courseId, examYear, sourceId
- Optional field: rotation
- Invalid files block the entire import process
- Clear error messages for each validation issue

### ✅ Fuzzy Course Matching

The system uses intelligent fuzzy matching to find courses:
1. **Exact match** (score: 1.0)
2. **Contains match** (score: 0.8)
3. **Normalized match** (removes accents, special chars) (score: 0.9/0.7)
4. **Word-by-word matching** (score: 0.6)

Minimum threshold: 0.7 (70% match confidence)

### ✅ Manual Override

Users can manually edit any auto-detected field:
- Edit exam year
- Change course selection
- Change source
- Modify rotation

## Filename Patterns

### Recommended Naming Convention

```
{course}_{year}_{source}_{rotation}.json
```

### Examples

✅ **Good Examples:**
```
pit_questions_2018_RATT_R1.json
  → Course: pit
  → Year: 2018
  → Source: RATT (ID: 4)
  → Rotation: R1

cardio_2020_R2.json
  → Course: cardio
  → Year: 2020
  → Source: (manual selection required)
  → Rotation: R2

anatomy_2019_RATT.json
  → Course: anatomy
  → Year: 2019
  → Source: RATT (ID: 4)
  → Rotation: (optional)
```

❌ **Poor Examples (require more manual input):**
```
questions.json
  → All fields need manual input

data_2018.json
  → Only year detected, course and source need manual input
```

## Import Workflow

### Step 1: Navigate to Import Page
```
Admin → Content → Question Import → Select Hierarchy → Bulk Import
```

### Step 2: Upload Files
- Drag and drop multiple `.json` files
- Or click to select files
- System automatically detects metadata from filenames

### Step 3: Review Auto-Detected Metadata
- Each file shows detected metadata
- Green badges: Successfully detected
- Red badges: Not detected (requires manual input)
- Edit icon: Click to manually override

### Step 4: Manual Corrections (if needed)
- **Course**: Dropdown shows only courses from selected module
- **Source**: Dropdown shows all available question sources
- **Exam Year**: Input field with validation (1900 - current year)
- **Rotation**: Dropdown with R1, R2, R3, R4 options

### Step 5: Validation
- System validates all files automatically
- Shows validation summary:
  - Total files
  - Valid files
  - Invalid files
  - Total questions
  - Missing metadata warnings

### Step 6: Import
- "Start Import" button enabled only when all files are valid
- Progress bar shows import status
- Each file imported separately
- Errors in one file don't stop others
- Success/failure summary at the end

## UI Components

### File List Display

Each file shows:
- ✅ Status icon (pending, validating, valid, invalid, uploading, success, error)
- 📄 Filename
- 📅 Exam Year (editable)
- 📚 Course (dropdown if not detected)
- 🏷️ Source (dropdown if not RATT)
- 🔄 Rotation (optional dropdown)
- ❌ Remove button
- ⚠️ Validation errors (if any)

### Validation Summary Card

Shows:
- Total files count
- Valid files count (green)
- Invalid files count (red)
- Total questions count (blue)
- Missing metadata warnings (yellow)

### Import Progress

- Progress bar (0-100%)
- "X of Y files completed" counter
- Per-file status updates

## API Integration

### Endpoint
```
POST /api/v1/admin/questions/bulk
```

### Request Payload (per file)
```json
{
  "metadata": {
    "courseId": 105,
    "universityId": 1,
    "studyPackId": 5,
    "unitId": 10,
    "moduleId": 45,
    "examYear": 2018,
    "rotation": "R1",
    "sourceId": 4
  },
  "questions": [
    {
      "questionText": "What is...",
      "questionType": "SINGLE_CHOICE",
      "explanation": "...",
      "answers": [
        {
          "answerText": "Answer 1",
          "isCorrect": true,
          "explanation": "..."
        }
      ]
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "data": {
    "questions": [...],
    "totalCreated": 50
  }
}
```

## Validation Rules

### File Structure
- Must be valid JSON
- Must contain array of questions or object with `questions` property
- Each question must have required fields

### Question Validation
- `questionText`: Required, string
- `questionType`: Required, "SINGLE_CHOICE" or "MULTIPLE_CHOICE"
- `answers`: Required, array with minimum 2 items
- `answers[].answerText`: Required, string
- `answers[].isCorrect`: Required, boolean

### Answer Count Validation
- **SINGLE_CHOICE**: Exactly 1 correct answer
- **MULTIPLE_CHOICE**: At least 1 correct answer

### Metadata Validation
- `courseId`: Required, must be valid course from selected module
- `examYear`: Required, 1900 - current year
- `sourceId`: Required, must be valid source
- `rotation`: Optional, must be R1, R2, R3, or R4 if provided

## Error Handling

### Validation Errors
- Displayed inline for each file
- Shows first 3 errors, with count of additional errors
- Blocks import until resolved

### Import Errors
- File marked as "error" status
- Error message displayed
- Other files continue importing
- Summary shows success/failure counts

### Network Errors
- Toast notification
- File status updated to "error"
- User can retry by clicking "Start Import" again

## Technical Implementation

### Key Files

1. **Types**: `src/types/question-import.ts`
   - Enhanced `BulkImportFile` interface with new metadata fields

2. **Utilities**:
   - `src/utils/filename-parser.ts` - Metadata extraction and fuzzy matching
   - `src/utils/bulk-import-validation.ts` - Enhanced validation logic

3. **Components**:
   - `src/components/admin/content/enhanced-bulk-file-upload.tsx` - File upload with metadata editing
   - `src/components/admin/content/enhanced-bulk-import-wizard.tsx` - Main wizard component

4. **Page**: `src/app/admin/content/page.tsx`
   - Integration point for the enhanced bulk import

### Metadata Detection Algorithm

```typescript
1. Parse filename to extract:
   - Year (regex: /(\d{4})/)
   - Rotation (regex: /[_\-\s]?(R[1-4])[_\-\s\.]?/i)
   - RATT indicator (regex: /RATT/i)
   - Course string (remove year, rotation, RATT, common words)

2. Course matching:
   - Get all courses from filters
   - Try exact match
   - Try fuzzy match (threshold: 0.7)
   - If no match → require manual selection

3. Source detection:
   - If RATT in filename → sourceId = 4
   - Else → require manual selection

4. Validation:
   - Check all required fields present
   - Validate field values
   - Return validation result
```

## Best Practices

### For Administrators

1. **Use consistent naming conventions** for easier auto-detection
2. **Review auto-detected metadata** before importing
3. **Import in batches** by course or year for better organization
4. **Keep backup** of JSON files before importing
5. **Check validation summary** before starting import

### For Developers

1. **Maintain fuzzy matching threshold** at 0.7 for good balance
2. **Add new sources** to the question sources management
3. **Test with various filename patterns** to ensure robust detection
4. **Log detection results** for debugging
5. **Handle edge cases** gracefully with clear error messages

## Future Enhancements

- [ ] Bulk edit metadata for multiple files at once
- [ ] Save/load filename parsing rules
- [ ] Import history and rollback
- [ ] Duplicate detection across files
- [ ] Preview questions before import
- [ ] Export template with naming guidelines
- [ ] Batch operations (delete, retry failed imports)
- [ ] Advanced filtering in file list
- [ ] Drag-and-drop reordering of files

## Troubleshooting

### Course Not Auto-Detected
- **Cause**: Course name in filename doesn't match any course in the module
- **Solution**: Manually select course from dropdown

### Source Not Auto-Detected
- **Cause**: Filename doesn't contain "RATT"
- **Solution**: Manually select source from dropdown

### Year Not Detected
- **Cause**: No 4-digit year in filename, or year out of range
- **Solution**: Click edit icon and enter year manually

### Import Fails for Some Files
- **Cause**: Network error, invalid data, or server-side validation failure
- **Solution**: Check error message, fix issues, and retry import

### All Files Show as Invalid
- **Cause**: Missing required metadata (course, year, or source)
- **Solution**: Fill in missing metadata for each file

## Support

For issues or questions:
1. Check validation error messages
2. Review filename patterns
3. Verify course exists in selected module
4. Check question sources are configured
5. Contact system administrator if issues persist

