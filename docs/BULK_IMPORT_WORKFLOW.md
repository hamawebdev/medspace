# Bulk Import Workflow - Visual Guide

## Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BULK IMPORT WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Navigation                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Admin → Content → University → Study Pack → Unit → Module     │
│                                                                 │
│                          ↓                                      │
│                                                                 │
│                    Select Course                                │
│                                                                 │
│                          ↓                                      │
│                                                                 │
│              Click "Import Multiple Files"                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: File Upload                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  📁 Drag & Drop or Click to Select Files             │     │
│  │                                                       │     │
│  │  Supported: .json files only                         │     │
│  │  Multiple files: ✓                                   │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                 │
│  User uploads:                                                  │
│  • pit_questions_2018_RATT_R1.json                             │
│  • cardio_2019_R2.json                                         │
│  • neuro_2020_RATT.json                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Auto-Detection                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  For each file, system automatically detects:                   │
│                                                                 │
│  File: pit_questions_2018_RATT_R1.json                         │
│  ├─ 📅 Exam Year: 2018      ✓ Detected                        │
│  ├─ 🔄 Rotation: R1         ✓ Detected                        │
│  └─ 📋 Source: RATT (ID: 4) ✓ Detected                        │
│                                                                 │
│  File: cardio_2019_R2.json                                     │
│  ├─ 📅 Exam Year: 2019           ✓ Detected                   │
│  ├─ 🔄 Rotation: R2              ✓ Detected                   │
│  └─ 📋 Source: Session normal (ID: 6) ✓ Detected              │
│                                                                 │
│  File: neuro_2020_RATT.json                                    │
│  ├─ 📅 Exam Year: 2020      ✓ Detected                        │
│  ├─ 🔄 Rotation: None       ⚠️ Not detected (editable)        │
│  └─ 📋 Source: RATT (ID: 4) ✓ Detected                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Review & Edit (Optional)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Each file displays editable metadata:                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📄 pit_questions_2018_RATT_R1.json                     │   │
│  │                                                         │   │
│  │ 📅 Year: 2018 [✏️]  🔄 [R1 ▼]  📋 [RATT ▼]          │   │
│  │                                                         │   │
│  │ Status: ✓ Valid (45 questions)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  User can:                                                      │
│  • Click ✏️ to edit exam year                                  │
│  • Use dropdown to change rotation                             │
│  • Use dropdown to change source                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Validation                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  System validates:                                              │
│                                                                 │
│  ✓ All files have exam year                                    │
│  ✓ All files have source                                       │
│  ✓ All files have valid JSON structure                         │
│  ✓ All questions have required fields                          │
│                                                                 │
│  Validation Summary:                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Total Files: 3        Valid Files: 3                   │   │
│  │  Invalid Files: 0      Total Questions: 120             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  If validation fails:                                           │
│  ⚠️ Shows specific errors per file                             │
│  ⚠️ Blocks import until fixed                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: Import Execution                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Click "Start Import (3 files)"                                 │
│                                                                 │
│  For each file:                                                 │
│                                                                 │
│  1. Prepare API request with file's metadata                    │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ POST /api/v1/admin/questions/bulk                   │    │
│     │ {                                                    │    │
│     │   "metadata": {                                      │    │
│     │     "courseId": 123,                                 │    │
│     │     "universityId": 1,                               │    │
│     │     "examYear": 2018,                                │    │
│     │     "rotation": "R1",                                │    │
│     │     "sourceId": 4                                    │    │
│     │   },                                                 │    │
│     │   "questions": [...]                                 │    │
│     │ }                                                    │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│  2. Send request                                                │
│  3. Update file status (uploading → success/error)              │
│  4. Update progress bar                                         │
│                                                                 │
│  Progress:                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Importing files... 2 / 3                               │   │
│  │  ████████████████████░░░░░░░░░░ 67%                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: Results                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Import Complete!                                               │
│                                                                 │
│  ✓ Successfully imported 3 file(s) with 120 questions           │
│                                                                 │
│  File Results:                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✓ pit_questions_2018_RATT_R1.json (45 questions)       │   │
│  │ ✓ cardio_2019_R2.json (50 questions)                   │   │
│  │ ✓ neuro_2020_RATT.json (25 questions)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  If errors occurred:                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✗ Failed to import 1 file(s): anatomy_2021.json        │   │
│  │   Error: Invalid question structure at index 5          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Detection Logic Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    FILENAME PARSING                             │
└─────────────────────────────────────────────────────────────────┘

Input: "pit_questions_2018_RATT_R1.json"
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Extract Exam Year                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Regex: /(\d{4})/                                              │
│  Match: "2018"                                                  │
│  Validate: 1900 ≤ 2018 ≤ 2025 ✓                                │
│  Result: examYear = 2018                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Extract Rotation                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Regex: /[_\-\s](R[1-4])(?:[_\-\s\.]|$)/i                      │
│  Match: "R1"                                                    │
│  Normalize: toUpperCase()                                       │
│  Validate: R1 ∈ {R1, R2, R3, R4} ✓                            │
│  Result: rotation = "R1"                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Extract Source                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Regex: /RATT/i                                                │
│  Match: "RATT" found ✓                                         │
│  Mapping:                                                       │
│    RATT found → sourceId = 4, sourceName = "RATT"             │
│    RATT not found → sourceId = 6, sourceName = "Session normal"│
│  Result: sourceId = 4, sourceName = "RATT"                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Final Result                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  {                                                              │
│    examYear: 2018,                                              │
│    rotation: "R1",                                              │
│    sourceId: 4,                                                 │
│    sourceName: "RATT"                                           │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## State Transitions

```
File Upload Lifecycle:

pending
  ↓
  ├─ Parse filename
  ├─ Extract metadata
  └─ Read file content
  ↓
validating
  ↓
  ├─ Validate JSON structure
  ├─ Validate questions schema
  └─ Check required fields
  ↓
  ├─ Success → valid
  └─ Failure → invalid
  ↓
[User reviews and edits metadata]
  ↓
[User clicks "Start Import"]
  ↓
uploading
  ↓
  ├─ Build API request
  ├─ Send to server
  └─ Wait for response
  ↓
  ├─ Success → success
  └─ Failure → error
```

## Data Flow

```
┌──────────────┐
│   Browser    │
│  (Frontend)  │
└──────┬───────┘
       │
       │ 1. Upload files
       ↓
┌──────────────────────────────────────┐
│  BulkFileUpload Component            │
│  • Extract metadata from filenames   │
│  • Validate JSON structure           │
│  • Display editable metadata         │
└──────┬───────────────────────────────┘
       │
       │ 2. Files with metadata
       ↓
┌──────────────────────────────────────┐
│  BulkImportWizard Component          │
│  • Validate all files have metadata  │
│  • Show validation summary           │
│  • Manage import process             │
└──────┬───────────────────────────────┘
       │
       │ 3. For each file
       ↓
┌──────────────────────────────────────┐
│  API Request Builder                 │
│  • Build payload with file metadata  │
│  • Include course context            │
│  • Add questions array               │
└──────┬───────────────────────────────┘
       │
       │ 4. POST /api/v1/admin/questions/bulk
       ↓
┌──────────────────────────────────────┐
│  Backend API                         │
│  • Validate request                  │
│  • Create questions in database      │
│  • Return created questions          │
└──────┬───────────────────────────────┘
       │
       │ 5. Response
       ↓
┌──────────────────────────────────────┐
│  Result Handler                      │
│  • Update file status                │
│  • Show success/error messages       │
│  • Update progress                   │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
BulkImportWizard
├── Import Context Card
│   └── Selection Summary (University, Study Pack, Course)
│
├── Upload & Configure Files Card
│   └── BulkFileUpload
│       ├── File Upload Zone (Drag & Drop)
│       └── File List
│           └── For each file:
│               ├── Status Icon
│               ├── Filename
│               ├── Metadata Controls
│               │   ├── Exam Year Input
│               │   ├── Rotation Dropdown
│               │   └── Source Dropdown
│               ├── Validation Errors
│               └── Remove Button
│
├── Validation Summary Card
│   ├── Statistics (Total, Valid, Invalid, Questions)
│   └── Warnings (Missing metadata, Validation errors)
│
├── Import Progress Card (when importing)
│   └── Progress Bar
│
└── Import Button
    └── Disabled until all files valid and have metadata
```

## Error Handling Flow

```
Error Detection
  ↓
  ├─ Missing Exam Year
  │   └─ Show warning: "X file(s) missing exam year"
  │   └─ Block import
  │   └─ Highlight affected files
  │
  ├─ Missing Source
  │   └─ Show warning: "X file(s) missing source"
  │   └─ Block import
  │   └─ Highlight affected files
  │
  ├─ Invalid JSON
  │   └─ Show error in file card
  │   └─ Mark file as invalid
  │   └─ Block import
  │
  ├─ Validation Errors
  │   └─ Show specific errors per file
  │   └─ Mark file as invalid
  │   └─ Block import
  │
  └─ Import Failure
      └─ Mark file as error
      └─ Show error message
      └─ Continue with other files
```

