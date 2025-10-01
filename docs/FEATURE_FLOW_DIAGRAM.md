# Enhanced Bulk Import - Feature Flow Diagram

## Overall Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENHANCED BULK IMPORT FLOW                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  1. Navigation  │
│  Admin → Content│
│  → Import       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. Select      │
│  Hierarchy      │
│  • University   │
│  • Study Pack   │
│  • Unit         │
│  • Module       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. Upload      │
│  Files          │
│  • Drag & Drop  │
│  • File Select  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. AUTO-DETECTION (filename-parser.ts)                         │
│                                                                  │
│  Input: "pit_questions_2018_RATT_R1.json"                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Extract Year:     /(\d{4})/          → 2018             │  │
│  │ Extract Rotation: /R[1-4]/i          → R1               │  │
│  │ Detect RATT:      /RATT/i            → true (ID: 4)     │  │
│  │ Extract Course:   Remove year/RATT/R1 → "pit"           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Fuzzy Match Course:                                       │  │
│  │   "pit" vs "PIT"           → Exact match (1.0)           │  │
│  │   "pit" vs "Physiologie"   → Partial match (0.7)         │  │
│  │   "cardio" vs "Cardiologie"→ Fuzzy match (0.8)           │  │
│  │                                                            │  │
│  │   Threshold: 0.7 (70% confidence)                         │  │
│  │   If match found → Auto-assign courseId                   │  │
│  │   If no match   → Flag for manual selection              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. METADATA ASSIGNMENT                                          │
│                                                                  │
│  File: pit_questions_2018_RATT_R1.json                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ examYear:  2018              ✅ Auto-detected             │ │
│  │ courseId:  105               ✅ Fuzzy matched             │ │
│  │ courseName: "PIT"            ✅ Auto-assigned             │ │
│  │ sourceId:  4                 ✅ RATT detected             │ │
│  │ rotation:  "R1"              ✅ Auto-detected             │ │
│  │ needsCourseSelection: false  ✅ Match found               │ │
│  │ needsSourceSelection: false  ✅ RATT detected             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  File: cardio_2020.json                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ examYear:  2020              ✅ Auto-detected             │ │
│  │ courseId:  undefined         ❌ No match                  │ │
│  │ sourceId:  undefined         ❌ Not RATT                  │ │
│  │ rotation:  undefined         ⚪ Optional                  │ │
│  │ needsCourseSelection: true   ⚠️  Manual required          │ │
│  │ needsSourceSelection: true   ⚠️  Manual required          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. USER REVIEW & EDIT                                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ File: pit_questions_2018_RATT_R1.json                    │  │
│  │ ┌──────────┬──────────┬──────────┬──────────┐            │  │
│  │ │ Year     │ Course   │ Source   │ Rotation │            │  │
│  │ │ 2018 ✅  │ PIT ✅   │ RATT ✅  │ R1 ✅    │            │  │
│  │ │ [Edit]   │ [Edit]   │ [Edit]   │ [Edit]   │            │  │
│  │ └──────────┴──────────┴──────────┴──────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ File: cardio_2020.json                                    │  │
│  │ ┌──────────┬──────────┬──────────┬──────────┐            │  │
│  │ │ Year     │ Course   │ Source   │ Rotation │            │  │
│  │ │ 2020 ✅  │ [Select] │ [Select] │ [Select] │            │  │
│  │ │          │ ❌       │ ❌       │ ⚪       │            │  │
│  │ └──────────┴──────────┴──────────┴──────────┘            │  │
│  │                                                            │  │
│  │ User selects:                                              │  │
│  │ • Course: "Cardiologie" (ID: 110)                         │  │
│  │ • Source: "Exam Bank" (ID: 2)                             │  │
│  │ • Rotation: "R2"                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. VALIDATION (bulk-import-validation.ts)                       │
│                                                                  │
│  For each file:                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Parse JSON                                              │ │
│  │    ✅ Valid JSON format                                    │ │
│  │    ✅ Contains questions array                             │ │
│  │                                                             │ │
│  │ 2. Validate Questions                                       │ │
│  │    ✅ questionText (required, string)                      │ │
│  │    ✅ questionType (SINGLE_CHOICE | MULTIPLE_CHOICE)       │ │
│  │    ✅ answers (array, min 2 items)                         │ │
│  │    ✅ answers[].answerText (required, string)              │ │
│  │    ✅ answers[].isCorrect (required, boolean)              │ │
│  │                                                             │ │
│  │ 3. Validate Answer Counts                                   │ │
│  │    ✅ SINGLE_CHOICE: exactly 1 correct                     │ │
│  │    ✅ MULTIPLE_CHOICE: at least 1 correct                  │ │
│  │                                                             │ │
│  │ 4. Validate Metadata                                        │ │
│  │    ✅ examYear (required, 1900-current)                    │ │
│  │    ✅ courseId (required, valid course)                    │ │
│  │    ✅ sourceId (required, valid source)                    │ │
│  │    ⚪ rotation (optional, R1-R4)                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Validation Summary:                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Total Files:        5                                      │ │
│  │ Valid Files:        4  ✅                                  │ │
│  │ Invalid Files:      1  ❌                                  │ │
│  │ Total Questions:    250                                    │ │
│  │ Missing Year:       0                                      │ │
│  │ Missing Course:     0                                      │ │
│  │ Missing Source:     0                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ❌ Import Blocked: At least one file is invalid               │ │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  8. Fix Errors  │
│  • Review errors│
│  • Fix JSON     │
│  • Re-upload    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  9. IMPORT (enhanced-bulk-import-wizard.tsx)                     │
│                                                                  │
│  ✅ All files valid → "Start Import" enabled                    │
│                                                                  │
│  For each file (sequential):                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ File 1: pit_questions_2018_RATT_R1.json                    │ │
│  │ Status: Uploading... 🔄                                    │ │
│  │                                                             │ │
│  │ POST /api/v1/admin/questions/bulk                          │ │
│  │ {                                                           │ │
│  │   "metadata": {                                             │ │
│  │     "courseId": 105,                                        │ │
│  │     "universityId": 1,                                      │ │
│  │     "studyPackId": 5,                                       │ │
│  │     "unitId": 10,                                           │ │
│  │     "moduleId": 45,                                         │ │
│  │     "examYear": 2018,                                       │ │
│  │     "sourceId": 4,                                          │ │
│  │     "rotation": "R1"                                        │ │
│  │   },                                                        │ │
│  │   "questions": [...]                                        │ │
│  │ }                                                           │ │
│  │                                                             │ │
│  │ Response: Success ✅                                        │ │
│  │ Status: Success (50 questions created)                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Progress: ████████████████░░░░ 80% (4/5 files)                │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  10. RESULTS                                                     │
│                                                                  │
│  Import Complete! 🎉                                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ✅ Successfully imported 4 file(s)                         │ │
│  │ ❌ Failed to import 1 file(s)                              │ │
│  │                                                             │ │
│  │ Details:                                                    │ │
│  │ • pit_questions_2018_RATT_R1.json    ✅ 50 questions      │ │
│  │ • cardio_2020_R2.json                ✅ 75 questions      │ │
│  │ • anatomy_2019_RATT.json             ✅ 60 questions      │ │
│  │ • neuro_2021.json                    ✅ 45 questions      │ │
│  │ • invalid_file.json                  ❌ Error: ...        │ │
│  │                                                             │ │
│  │ Total Questions Created: 230                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  🔄 Stay on same page (no redirect)                             │
│  📋 Can review results and retry failed files                   │
└─────────────────────────────────────────────────────────────────┘
```

## Metadata Detection Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                    METADATA DETECTION LOGIC                      │
└─────────────────────────────────────────────────────────────────┘

Filename: "pit_questions_2018_RATT_R1.json"
│
├─ EXAM YEAR
│  │
│  ├─ Regex: /(\d{4})/
│  ├─ Found: "2018"
│  ├─ Validate: 1900 ≤ 2018 ≤ 2025 ✅
│  └─ Result: examYear = 2018
│
├─ ROTATION
│  │
│  ├─ Regex: /[_\-\s]?(R[1-4])[_\-\s\.]?/i
│  ├─ Found: "R1"
│  └─ Result: rotation = "R1"
│
├─ SOURCE
│  │
│  ├─ Regex: /RATT/i
│  ├─ Found: "RATT"
│  └─ Result: sourceId = 4, isRATT = true
│
└─ COURSE
   │
   ├─ Extract: Remove year, rotation, RATT, common words
   ├─ Result: "pit"
   │
   ├─ Fuzzy Match:
   │  │
   │  ├─ Get all courses from selected module
   │  │  └─ Courses: ["PIT", "Cardiologie", "Neurologie", ...]
   │  │
   │  ├─ Try exact match: "pit" == "PIT" (case-insensitive)
   │  │  └─ Match! Score: 1.0 ✅
   │  │
   │  ├─ If no exact match, try fuzzy:
   │  │  ├─ "pit" contains in "PIT"? → Score: 0.8
   │  │  ├─ Normalize and compare → Score: 0.9
   │  │  └─ Word-by-word match → Score: 0.6
   │  │
   │  ├─ Find best score above threshold (0.7)
   │  │  └─ Best: "PIT" with score 1.0
   │  │
   │  └─ Result: courseId = 105, courseName = "PIT"
   │
   └─ If no match found:
      └─ Result: needsCourseSelection = true
```

## Validation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      VALIDATION FLOW                             │
└─────────────────────────────────────────────────────────────────┘

File Upload
│
├─ Parse JSON
│  ├─ Valid JSON? ────────────────────────────────────┐
│  │  ├─ Yes → Continue                               │
│  │  └─ No → Error: "Invalid JSON format" ──────────┼─→ INVALID
│  │                                                   │
│  ├─ Has questions array? ─────────────────────────┐ │
│  │  ├─ Yes → Continue                             │ │
│  │  └─ No → Error: "No questions array" ─────────┼─┼─→ INVALID
│  │                                                 │ │
│  └─ Questions count > 0? ─────────────────────────┤ │
│     ├─ Yes → Continue                             │ │
│     └─ No → Error: "Empty questions array" ──────┼─┼─→ INVALID
│                                                    │ │
├─ Validate Each Question                           │ │
│  ├─ questionText exists? ─────────────────────────┤ │
│  ├─ questionType valid? ──────────────────────────┤ │
│  ├─ answers array exists? ────────────────────────┤ │
│  ├─ answers.length ≥ 2? ──────────────────────────┤ │
│  ├─ Each answer has answerText? ──────────────────┤ │
│  ├─ Each answer has isCorrect? ───────────────────┤ │
│  └─ Correct answer count valid? ──────────────────┤ │
│     ├─ SINGLE_CHOICE: exactly 1 ✅               │ │
│     └─ MULTIPLE_CHOICE: at least 1 ✅            │ │
│                                                    │ │
├─ Validate Metadata                                │ │
│  ├─ examYear exists? ─────────────────────────────┤ │
│  │  ├─ Yes → Continue                             │ │
│  │  └─ No → Error: "Missing exam year" ──────────┼─┼─→ INVALID
│  │                                                 │ │
│  ├─ courseId exists? ─────────────────────────────┤ │
│  │  ├─ Yes → Continue                             │ │
│  │  └─ No → Error: "Missing course" ─────────────┼─┼─→ INVALID
│  │                                                 │ │
│  └─ sourceId exists? ─────────────────────────────┤ │
│     ├─ Yes → Continue                             │ │
│     └─ No → Error: "Missing source" ─────────────┼─┼─→ INVALID
│                                                    │ │
└─ All Checks Passed ───────────────────────────────┴─┴─→ VALID ✅
```

