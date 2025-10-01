# Bulk Import with Auto-Detection Feature

## Overview

The bulk import feature now supports automatic detection of exam year, source, and rotation directly from filenames. This streamlines the import process by reducing manual data entry while maintaining full control through editable fields.

## Feature Highlights

### 1. **Auto-Detection from Filenames**
- **Exam Year**: Automatically extracts 4-digit years (1900-current year)
- **Rotation**: Detects R1, R2, R3, or R4 patterns
- **Source**: Identifies RATT vs Session normal based on filename

### 2. **Per-File Metadata**
Each file has its own metadata that can be:
- Auto-detected from the filename
- Manually edited before import
- Validated before submission

### 3. **Editable Fields**
All auto-detected values can be overridden:
- Exam year (input field)
- Rotation (dropdown: R1-R4 or None)
- Source (dropdown from available sources)

## Filename Patterns

### Recommended Naming Convention

```
{course}_{type}_questions_{year}_{source}_{rotation}.json
```

### Examples

#### Example 1: RATT Exam with Rotation
```
pit_questions_2018_RATT_R1.json
```
**Auto-detected:**
- Exam Year: `2018`
- Source: `RATT` (sourceId: 4)
- Rotation: `R1`

#### Example 2: Normal Session with Rotation
```
pit_questions_2019_R2.json
```
**Auto-detected:**
- Exam Year: `2019`
- Source: `Session normal` (sourceId: 6) - default when RATT not present
- Rotation: `R2`

#### Example 3: RATT without Rotation
```
cardio_2020_RATT.json
```
**Auto-detected:**
- Exam Year: `2020`
- Source: `RATT` (sourceId: 4)
- Rotation: None

#### Example 4: Normal Session without Rotation
```
neuro_2021.json
```
**Auto-detected:**
- Exam Year: `2021`
- Source: `Session normal` (sourceId: 6)
- Rotation: None

## Detection Rules

### Exam Year Detection
- **Pattern**: Any 4-digit number between 1900 and current year
- **Regex**: `/(\d{4})/`
- **Example matches**: `2018`, `2019`, `2020`, `2021`

### Rotation Detection
- **Pattern**: R followed by 1-4, with word boundaries
- **Regex**: `/[_\-\s](R[1-4])(?:[_\-\s\.]|$)/i`
- **Valid values**: `R1`, `R2`, `R3`, `R4`
- **Case insensitive**: `r1`, `R1` both work

### Source Detection
- **Pattern**: Case-insensitive search for "RATT"
- **Regex**: `/RATT/i`
- **Mapping**:
  - Contains "RATT" → sourceId: 4 (RATT)
  - No "RATT" → sourceId: 6 (Session normal)

## Import Workflow

### Step 1: Navigate to Import
```
University → Study Pack → Unit → Module → Course → Import Multiple Files
```

### Step 2: Upload Files
- Select multiple `.json` files
- Or drag and drop files
- Files are automatically validated

### Step 3: Review Auto-Detected Metadata
For each file, review:
- ✓ Exam year (auto-detected or set manually)
- ✓ Rotation (auto-detected or select from dropdown)
- ✓ Source (auto-detected or select from dropdown)

### Step 4: Edit if Needed
- Click edit icon next to exam year to change
- Use dropdown to change rotation
- Use dropdown to change source

### Step 5: Import
- All files must have valid metadata
- Each file is imported separately with its own metadata
- Progress is shown for each file

## API Request Format

Each file generates a separate API request:

```json
POST /api/v1/admin/questions/bulk

{
  "metadata": {
    "courseId": 123,
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
      "questionText": "...",
      "questionType": "SINGLE_CHOICE",
      "answers": [...]
    }
  ]
}
```

## Validation Rules

### Required Fields (Per File)
- ✓ Exam year must be set
- ✓ Source must be selected
- ✓ Valid JSON structure
- ✓ At least one question

### Optional Fields
- Rotation (can be empty)

### File Validation
- Must be `.json` format
- Must contain valid question array
- Questions must follow schema:
  - `questionText` (required)
  - `questionType` (required: SINGLE_CHOICE or MULTIPLE_CHOICE)
  - `answers` (required: array with at least 2 items)
  - `explanation` (optional)

## Source Mapping

| Source Name      | Source ID | Detection Rule           |
|------------------|-----------|--------------------------|
| RATT             | 4         | Filename contains "RATT" |
| Session normal   | 6         | Default (no "RATT")      |

**Note**: These are the default mappings. The actual source list is loaded from the database and can be customized.

## User Interface

### File List Display
Each uploaded file shows:
- 📄 Filename
- 📅 Exam year (editable)
- 🔄 Rotation (dropdown)
- 📋 Source (dropdown)
- ✓ Validation status

### Validation Summary
Shows aggregate statistics:
- Total files
- Valid files
- Invalid files
- Total questions
- Files missing metadata

### Import Progress
Real-time progress showing:
- Current file being imported
- Progress percentage
- Success/error status per file

## Error Handling

### Common Errors

**Missing Exam Year**
```
Error: X file(s) missing exam year. Please set them before importing.
```
**Solution**: Click edit icon and enter year manually

**Missing Source**
```
Error: X file(s) missing question source. Please set them before importing.
```
**Solution**: Select source from dropdown

**Invalid JSON**
```
Error: Invalid JSON format
```
**Solution**: Check file structure, ensure valid JSON

**Validation Errors**
```
Error: Question at index X is missing required field 'questionText'
```
**Solution**: Fix JSON structure in the file

## Best Practices

### 1. Consistent Naming
Use a consistent naming pattern across all files:
```
{course}_{year}_{source}_{rotation}.json
```

### 2. Include All Metadata in Filename
Even if optional, including rotation and source in filename saves time:
```
✓ Good: cardio_2020_RATT_R1.json
✗ Okay: cardio_2020.json (requires manual entry)
```

### 3. Validate Before Upload
Ensure JSON files are valid before uploading to avoid validation errors.

### 4. Batch Similar Files
Upload files with similar metadata together for easier review.

### 5. Review Auto-Detection
Always review auto-detected values before importing, especially for:
- Files with multiple years in the name
- Files with ambiguous rotation patterns

## Technical Implementation

### Components Modified
1. **BulkImportFile Type** (`src/types/question-import.ts`)
   - Added `rotation`, `sourceId`, `sourceName` fields

2. **BulkFileUpload Component** (`src/components/admin/content/bulk-file-upload.tsx`)
   - Added extraction functions for year, rotation, source
   - Added UI for editing per-file metadata
   - Added Select components for rotation and source

3. **BulkImportWizard Component** (`src/components/admin/content/bulk-import-wizard.tsx`)
   - Removed shared metadata (rotation, source)
   - Updated to use per-file metadata
   - Enhanced validation to check all files have required metadata

### Extraction Functions

```typescript
// Extract exam year
const extractExamYear = (filename: string): number | undefined => {
  const yearMatch = filename.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    const currentYear = new Date().getFullYear();
    if (year >= 1900 && year <= currentYear) {
      return year;
    }
  }
  return undefined;
};

// Extract rotation
const extractRotation = (filename: string): 'R1' | 'R2' | 'R3' | 'R4' | undefined => {
  const rotationMatch = filename.match(/[_\-\s](R[1-4])(?:[_\-\s\.]|$)/i);
  if (rotationMatch) {
    return rotationMatch[1].toUpperCase() as 'R1' | 'R2' | 'R3' | 'R4';
  }
  return undefined;
};

// Extract source
const extractSource = (filename: string): { sourceId: number; sourceName: string } => {
  const hasRATT = /RATT/i.test(filename);
  if (hasRATT) {
    return { sourceId: 4, sourceName: 'RATT' };
  }
  return { sourceId: 6, sourceName: 'Session normal' };
};
```

## Future Enhancements

Potential improvements for future versions:

1. **Bulk Edit**: Edit metadata for multiple files at once
2. **Template Patterns**: Save and reuse filename patterns
3. **Advanced Detection**: Support more complex naming patterns
4. **Validation Preview**: Show detected metadata before upload
5. **Import History**: Track previous imports and patterns
6. **Custom Source Mapping**: Allow admins to configure source detection rules

## Support

For issues or questions:
1. Check filename follows recommended patterns
2. Verify JSON structure is valid
3. Review validation errors in the UI
4. Contact system administrator if problems persist

