# Grouped Bulk Import Feature with Metadata Hierarchy

## Overview

The Enhanced Bulk Import feature now supports **automatic file grouping** and **hierarchical metadata assignment** with a flexible priority system. This allows users to efficiently import multiple JSON files with different courses, exam years, sources, and rotations in a single operation.

## Key Features

### 1. Automatic File Grouping

Files are automatically grouped by **course name** detected in the filename:

**Example:**
```
Group 1: "Cytokines, Chimiokines et leurs récepteurs"
├─ Cytokines, Chimiokines et leurs récepteurs_questions_2012.json
├─ Cytokines, Chimiokines et leurs récepteurs_questions_2020.json
└─ Cytokines, Chimiokines et leurs récepteurs_questions_2021_RATT.json

Group 2: "Les lymphocytes B et les Immunoglobulines"
├─ Les lymphocytes B et les Immunoglobulines_questions_2019.json
└─ Les lymphocytes B et les Immunoglobulines_questions_2021_RATT.json

Group 3: "Les molécules d'adhésion cellulaire et la réaction inflammatoire"
├─ Les_molécules_d'adhésion_cellulaire_et_la_réaction_inflammatoire_questions_2019_RATT_R2.json
└─ Les_molécules_d'adhésion_cellulaire_et_la_réaction_inflammatoire_questions_2020.json
```

### 2. Auto-Detection from Filenames

Within each group, the system automatically detects:

- **Exam Year**: Extracted using regex on 4-digit years (e.g., `2012`, `2021`)
- **Rotation**: Detected patterns like `R1`, `R2`, `R3`, `R4`
- **Source ID**: If filename contains `"RATT"`, assigns `sourceId = 4`
- **Course ID**: Matches course name with courses from `/admin/content/filters` API

**Filename Pattern:**
```
{CourseName}_questions_{Year}[_RATT][_R1-R4].json
```

**Examples:**
- `Cytokines, Chimiokines et leurs récepteurs_questions_2012.json`
  - Course: "Cytokines, Chimiokines et leurs récepteurs"
  - Year: 2012
  - Source: Not RATT (manual selection required)
  - Rotation: Not specified

- `Les lymphocytes B et les Immunoglobulines_questions_2021_RATT.json`
  - Course: "Les lymphocytes B et les Immunoglobulines"
  - Year: 2021
  - Source: RATT (sourceId = 4)
  - Rotation: Not specified

- `Les_molécules_d'adhésion_cellulaire_et_la_réaction_inflammatoire_questions_2019_RATT_R2.json`
  - Course: "Les molécules d'adhésion cellulaire et la réaction inflammatoire"
  - Year: 2019
  - Source: RATT (sourceId = 4)
  - Rotation: R2

### 3. Hierarchical Metadata Assignment

The system supports three levels of metadata assignment with a clear priority system:

#### Priority Levels (Highest to Lowest)

1. **File-level** (Highest Priority)
   - User manually sets metadata for a specific file
   - Overrides both group and global settings
   - Marked as "File-specific" in UI

2. **Group-level** (Medium Priority)
   - User sets metadata for all files in a course group
   - Overrides global settings
   - Does not override file-specific settings
   - Marked as "From group" in UI

3. **Global-level** (Lowest Priority)
   - User sets metadata once for all files
   - Applied only if not set at group or file level
   - Marked as "Global setting" in UI

4. **Auto-detected** (Initial State)
   - Automatically detected from filename
   - Can be overridden at any level
   - Marked as "Auto-detected" in UI

#### Metadata Fields by Level

**Global Settings:**
- Source ID
- Rotation

**Group Settings:**
- Course ID
- Source ID
- Rotation
- Exam Year (less common, usually per-file)

**File Settings:**
- Exam Year
- Course ID
- Source ID
- Rotation

## User Workflow

### Step 1: Upload Files

1. Navigate to: **Admin → Content → Select Module → Bulk Import**
2. Upload multiple `.json` files (multi-select or drag-and-drop)
3. Files are automatically grouped by course name

### Step 2: Review Auto-Detection

The system displays:
- Files grouped by course
- Auto-detected metadata for each file
- Validation status per file and per group

### Step 3: Set Global Metadata (Optional)

At the top of the page, set global defaults:
- **Source**: Applies to all files (unless overridden)
- **Rotation**: Applies to all files (unless overridden)

**Use Case:** If all files are from the same source (e.g., "RATT") and rotation (e.g., "R2"), set it once globally.

### Step 4: Set Group Metadata (Optional)

For each course group, set:
- **Course**: Select the correct course from dropdown
- **Source**: Override global setting for this group
- **Rotation**: Override global setting for this group

**Use Case:** If all files in a group belong to the same course, set it once for the group.

### Step 5: Set File Metadata (Optional)

For individual files, override:
- **Exam Year**: Edit if auto-detection failed or is incorrect
- **Course**: Select different course for this specific file
- **Source**: Override group/global setting
- **Rotation**: Override group/global setting

**Use Case:** Fix incorrect auto-detection or handle special cases.

### Step 6: Validate and Import

1. Review validation summary
2. Ensure all required fields are set
3. Click "Start Import"
4. Monitor progress per file

## Technical Implementation

### File Structure

```
src/
├── components/admin/content/
│   ├── enhanced-bulk-import-wizard.tsx    # Main wizard component
│   ├── enhanced-bulk-file-upload.tsx      # File upload with grouping
│   └── grouped-file-list.tsx              # Grouped file display
├── utils/
│   ├── filename-parser.ts                 # Filename parsing and grouping
│   ├── metadata-hierarchy.ts              # Metadata priority system
│   └── bulk-import-validation.ts          # Validation logic
└── types/
    └── question-import.ts                 # TypeScript types
```

### Key Functions

#### Filename Parsing (`filename-parser.ts`)

```typescript
// Extract course name from filename
extractCourseString(filename: string): string | undefined

// Extract exam year (4-digit)
extractExamYear(filename: string): number | null

// Extract rotation (R1-R4)
extractRotation(filename: string): string | null

// Check if RATT exam
isRattrapageExam(filename: string): boolean

// Group files by course name
groupFilesByCourseName(filenames: string[]): Array<{
  groupKey: string;
  displayName: string;
  fileIndices: number[];
}>

// Match course with API data
matchCourseFromFilename(
  filename: string,
  availableCourses: Array<{ id: number; name: string }>
): number | null
```

#### Metadata Hierarchy (`metadata-hierarchy.ts`)

```typescript
// Apply global metadata to files
updateGlobalMetadata(
  files: BulkImportFile[],
  updates: { sourceId?: number; rotation?: string }
): BulkImportFile[]

// Apply group metadata to files in a group
updateGroupMetadata(
  files: BulkImportFile[],
  groupKey: string,
  updates: { courseId?: number; sourceId?: number; rotation?: string; examYear?: number }
): BulkImportFile[]

// Apply file-specific metadata
updateFileMetadata(
  file: BulkImportFile,
  updates: { examYear?: number; courseId?: number; sourceId?: number; rotation?: string }
): BulkImportFile

// Get metadata source label for display
getMetadataSourceLabel(
  source: 'auto' | 'file' | 'group' | 'global' | undefined
): string
```

### Data Types

```typescript
interface BulkImportFile {
  id: string;
  file: File;
  filename: string;
  groupKey?: string;                    // For grouping
  examYear?: number;
  courseId?: number;
  courseName?: string;
  sourceId?: number;
  rotation?: string;
  isValid: boolean;
  status: 'pending' | 'validating' | 'valid' | 'invalid' | 'uploading' | 'success' | 'error';
  metadataSource?: {                    // Track metadata origin
    examYear?: 'auto' | 'file' | 'group' | 'global';
    courseId?: 'auto' | 'file' | 'group' | 'global';
    sourceId?: 'auto' | 'file' | 'group' | 'global';
    rotation?: 'auto' | 'file' | 'group' | 'global';
  };
}

interface GlobalMetadata {
  sourceId?: number;
  rotation?: string;
}

interface FileGroupMetadata {
  groupKey: string;
  displayName: string;
  fileIds: string[];
  courseId?: number;
  sourceId?: number;
  rotation?: string;
  examYear?: number;
}
```

## Validation Rules

### File-Level Validation

✅ **Valid File:**
- Valid JSON format
- Contains questions array
- All required metadata set (examYear, courseId, sourceId)

❌ **Invalid File:**
- Invalid JSON
- Missing questions
- Missing required metadata

### Group-Level Validation

✅ **Valid Group:**
- All files in group are valid
- All files have required metadata

⚠️ **Pending Group:**
- Some files missing metadata
- User needs to set group or file-level metadata

### Import-Level Validation

✅ **Can Import:**
- All files are valid
- All required metadata is set
- No validation errors

❌ **Cannot Import:**
- At least one file is invalid
- At least one file missing required metadata
- Validation errors present

## UI Components

### Global Settings Card

Displays at the top with:
- Source dropdown (applies to all files)
- Rotation dropdown (applies to all files)

### Group Cards (Collapsible)

For each course group:
- **Header**: Course name, file count, validation status
- **Group Settings**: Course, Source, Rotation dropdowns
- **File List**: Individual files with metadata

### File Cards

For each file:
- Filename
- Question count
- Metadata fields (Year, Course, Source, Rotation)
- Edit buttons for each field
- Remove button
- Metadata source indicators

## Example Scenarios

### Scenario 1: All Files Same Source and Rotation

**Files:**
- `Course_A_questions_2019_RATT_R2.json`
- `Course_B_questions_2020_RATT_R2.json`
- `Course_C_questions_2021_RATT_R2.json`

**Workflow:**
1. Upload all files
2. Set global: Source = RATT, Rotation = R2
3. Auto-detection handles years and courses
4. Import

### Scenario 2: Multiple Courses, Different Years

**Files:**
- `Immunology_questions_2019.json`
- `Immunology_questions_2020.json`
- `Immunology_questions_2021_RATT.json`
- `Cardiology_questions_2019.json`
- `Cardiology_questions_2020_RATT.json`

**Workflow:**
1. Upload all files
2. Files auto-group into "Immunology" and "Cardiology"
3. Set course for each group
4. Years auto-detected
5. RATT source auto-detected for RATT files
6. Manually set source for non-RATT files (group or global)
7. Import

### Scenario 3: Mixed Metadata

**Files:**
- `Course_A_questions_2019.json` (needs manual source)
- `Course_A_questions_2020_RATT.json` (RATT auto-detected)
- `Course_B_questions_2021.json` (needs manual source)

**Workflow:**
1. Upload all files
2. Set global source for non-RATT files
3. RATT files keep auto-detected source
4. Import

## Benefits

1. **Efficiency**: Import multiple files with different metadata in one operation
2. **Flexibility**: Three-level priority system accommodates various scenarios
3. **Accuracy**: Auto-detection reduces manual entry errors
4. **Clarity**: Visual indicators show metadata source (auto/file/group/global)
5. **Control**: Users can override at any level as needed
6. **Organization**: Grouping by course makes it easy to manage related files

## Future Enhancements

- Bulk edit for multiple groups
- Save/load metadata templates
- Import history with metadata tracking
- Duplicate detection across groups
- Advanced filtering and sorting of groups

