# Enhanced Bulk Import - Usage Guide

## Quick Start

### Step 1: Prepare Your Files

Name your JSON files following this pattern:
```
{course}_{year}_{source}_{rotation}.json
```

**Examples:**
- `pit_questions_2018_RATT_R1.json`
- `cardio_2020_R2.json`
- `anatomy_2019_RATT.json`

### Step 2: Navigate to Import Page

1. Go to **Admin** → **Content** → **Question Import**
2. Select your hierarchy:
   - University
   - Study Pack
   - Unit
   - Module
3. Click **"Bulk Import"**

### Step 3: Upload Files

- **Drag and drop** multiple `.json` files into the upload area
- Or **click** to select files from your computer
- System automatically detects metadata from filenames

### Step 4: Review Auto-Detected Metadata

Each file shows:
- ✅ **Green badge**: Successfully detected
- ❌ **Red badge**: Not detected (requires manual input)
- 📝 **Edit icon**: Click to manually override

### Step 5: Fill Missing Metadata

If any field shows "Not detected":
1. Click the dropdown or edit icon
2. Select the correct value
3. System validates automatically

### Step 6: Start Import

1. Review the **Import Summary** card
2. Ensure all files show as "Valid"
3. Click **"Start Import"**
4. Wait for completion (progress bar shows status)

## Detailed Instructions

### File Naming Best Practices

#### ✅ Good Naming Examples

```
pit_questions_2018_RATT_R1.json
├─ Course: pit
├─ Year: 2018
├─ Source: RATT (auto-detected)
└─ Rotation: R1

cardio_2020_R2.json
├─ Course: cardio
├─ Year: 2020
├─ Source: (manual selection)
└─ Rotation: R2

anatomy-exam-2019-RATT.json
├─ Course: anatomy
├─ Year: 2019
├─ Source: RATT (auto-detected)
└─ Rotation: (optional)

neuro_questions_2021.json
├─ Course: neuro
├─ Year: 2021
├─ Source: (manual selection)
└─ Rotation: (optional)
```

#### ❌ Poor Naming Examples

```
questions.json
└─ All fields need manual input

data.json
└─ All fields need manual input

2018.json
└─ Only year detected

file123.json
└─ No metadata detected
```

### Understanding Auto-Detection

#### Exam Year
- **Pattern**: Any 4-digit number between 1900 and current year
- **Examples**: 
  - `exam_2018.json` → 2018
  - `2020_questions.json` → 2020
  - `questions_2019_final.json` → 2019

#### Course
- **Pattern**: Text before/after year, excluding common words
- **Matching**: Fuzzy matching against courses in selected module
- **Examples**:
  - `pit_2018.json` → Matches "PIT" or "Physiologie"
  - `cardio_2020.json` → Matches "Cardiologie"
  - `neuro_2019.json` → Matches "Neurologie"

#### Source
- **RATT Detection**: If filename contains "RATT" (case-insensitive)
- **Auto-assigned**: sourceId = 4
- **Examples**:
  - `exam_RATT_2018.json` → RATT (ID: 4)
  - `2020_ratt_questions.json` → RATT (ID: 4)
  - `exam_2018.json` → Manual selection required

#### Rotation
- **Pattern**: R1, R2, R3, or R4 (case-insensitive)
- **Examples**:
  - `exam_R1_2018.json` → R1
  - `2020_r2_questions.json` → R2
  - `exam-R3-2019.json` → R3

### Manual Editing

#### Edit Exam Year
1. Click the **edit icon** (✏️) next to the year
2. Enter the correct year (1900 - current year)
3. Click **"Save"**

#### Select Course
1. If course not detected, dropdown appears automatically
2. Click dropdown to see available courses
3. Select the correct course
4. **Note**: Only courses from the selected module are shown

#### Select Source
1. If source not detected (non-RATT files), dropdown appears
2. Click dropdown to see all question sources
3. Select the appropriate source

#### Select Rotation (Optional)
1. Click the rotation dropdown
2. Select R1, R2, R3, or R4
3. Or leave empty if not applicable

### Validation

#### File Validation
Each file is validated for:
- ✅ Valid JSON format
- ✅ Contains questions array
- ✅ Each question has required fields
- ✅ Correct answer counts
- ✅ All metadata present

#### Metadata Validation
Required fields:
- ✅ Exam Year (1900 - current year)
- ✅ Course ID (must exist in selected module)
- ✅ Source ID (must be valid source)

Optional fields:
- ⚪ Rotation (R1, R2, R3, or R4)

#### Validation Summary

The summary card shows:
- **Total Files**: Number of uploaded files
- **Valid Files**: Files ready for import (green)
- **Invalid Files**: Files with errors (red)
- **Total Questions**: Sum of questions across all files

Missing metadata warnings:
- ⚠️ Files without exam year
- ⚠️ Files without course
- ⚠️ Files without source

### Import Process

#### Before Import
- ✅ All files must be valid
- ✅ All required metadata must be set
- ✅ "Start Import" button is enabled

#### During Import
- 📊 Progress bar shows overall progress
- 📝 "X of Y files completed" counter
- 🔄 Each file status updates in real-time:
  - Pending → Uploading → Success/Error

#### After Import
- ✅ Success message with count
- ❌ Error message if any failures
- 📋 Detailed results for each file
- 🔄 Stay on same page (no redirect)

### Error Handling

#### Validation Errors
**Symptom**: File shows as "Invalid" with red X

**Common Causes**:
- Missing required fields in questions
- Invalid question type
- Wrong answer count
- Missing metadata

**Solution**:
1. Click on the file to see error details
2. Fix the JSON file
3. Re-upload the corrected file

#### Import Errors
**Symptom**: File shows "Error" status after import attempt

**Common Causes**:
- Network connection issues
- Server-side validation failure
- Duplicate questions
- Invalid course/source IDs

**Solution**:
1. Check error message
2. Verify metadata is correct
3. Check network connection
4. Retry import

#### Course Not Found
**Symptom**: Course dropdown is empty or doesn't show expected course

**Cause**: Course doesn't exist in the selected module

**Solution**:
1. Go back and select correct module
2. Or create the course first
3. Then retry import

## Advanced Usage

### Importing Multiple Courses

You can import questions for different courses in one batch:

1. Upload files with different course names:
   ```
   pit_2018_RATT_R1.json
   cardio_2018_RATT_R1.json
   neuro_2018_RATT_R1.json
   ```

2. System detects each course separately
3. Review and confirm each course assignment
4. Import all at once

### Importing Multiple Years

Import questions from different years:

1. Upload files with different years:
   ```
   pit_2018_RATT_R1.json
   pit_2019_RATT_R1.json
   pit_2020_RATT_R1.json
   ```

2. Each file gets its own year
3. Import all together

### Importing Multiple Rotations

Import different rotations:

1. Upload files with different rotations:
   ```
   pit_2018_RATT_R1.json
   pit_2018_RATT_R2.json
   pit_2018_RATT_R3.json
   ```

2. Each file gets its own rotation
3. Import all at once

## Tips & Tricks

### 1. Consistent Naming
Use a consistent naming pattern for all your files to maximize auto-detection.

### 2. Batch by Module
Import files for one module at a time for better organization.

### 3. Test First
Upload one file first to verify the format and metadata detection before uploading many files.

### 4. Keep Backups
Always keep backup copies of your JSON files before importing.

### 5. Review Before Import
Always review the validation summary before clicking "Start Import".

### 6. Use RATT in Filename
If your source is RATT, include "RATT" in the filename for automatic detection.

### 7. Clear Separators
Use underscores (_) or dashes (-) to separate parts of the filename.

### 8. Avoid Special Characters
Stick to alphanumeric characters, underscores, and dashes in filenames.

## Troubleshooting

### Problem: Course not auto-detected
**Solution**: 
- Check if course name in filename matches course in module
- Try exact course name from the system
- Use manual selection if fuzzy match fails

### Problem: Year not detected
**Solution**:
- Ensure year is 4 digits
- Verify year is between 1900 and current year
- Use manual edit to set year

### Problem: All files show as invalid
**Solution**:
- Check JSON format is valid
- Verify all required fields are present
- Review validation error messages
- Fix issues and re-upload

### Problem: Import fails for some files
**Solution**:
- Check error messages for each failed file
- Verify metadata is correct
- Check for duplicate questions
- Retry failed files individually

### Problem: Can't find my course in dropdown
**Solution**:
- Verify you selected the correct module
- Check if course exists in the system
- Create course first if it doesn't exist
- Go back and select correct module

## FAQ

**Q: Can I import files with different metadata?**
A: Yes! Each file can have different course, year, source, and rotation.

**Q: What happens if one file fails?**
A: Other files continue importing. Only the failed file is marked as error.

**Q: Can I edit metadata after upload?**
A: Yes, you can edit any field before clicking "Start Import".

**Q: Is rotation required?**
A: No, rotation is optional. You can leave it empty.

**Q: Can I import non-RATT sources?**
A: Yes, just select the source manually from the dropdown.

**Q: What if I make a mistake?**
A: You can remove files and re-upload, or edit metadata before importing.

**Q: How many files can I upload at once?**
A: There's no hard limit, but we recommend batches of 10-20 files for better performance.

**Q: Can I cancel during import?**
A: No, once import starts, it must complete. However, you can close the page and files will continue importing.

## Support

If you encounter issues:
1. Check this guide
2. Review error messages
3. Verify file format and metadata
4. Contact system administrator
5. Report bugs with example files

## Examples

See the `docs/examples/` directory for sample JSON files:
- `pit_questions_2018_RATT_R1.json` - Full example with all metadata
- `cardio_2020_R2.json` - Example without RATT source

