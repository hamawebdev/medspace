# Bulk Import - Quick Reference Card

## 🚀 Quick Start (3 Steps)

1. **Navigate**: Admin → Content → Select Course → "Import Multiple Files"
2. **Upload**: Drag & drop `.json` files (metadata auto-detected)
3. **Import**: Review, edit if needed, click "Start Import"

---

## 📝 Filename Format

### Recommended Pattern
```
{course}_{year}_{source}_{rotation}.json
```

### Examples
```
✓ pit_questions_2018_RATT_R1.json
✓ cardio_2019_R2.json
✓ neuro_2020_RATT.json
✓ anatomy_2021.json
```

---

## 🔍 Auto-Detection Rules

| Field | Pattern | Example | Result |
|-------|---------|---------|--------|
| **Year** | 4 digits (1900-now) | `2018` | `2018` |
| **Rotation** | R1, R2, R3, R4 | `R1` | `R1` |
| **Source** | Contains "RATT" | `RATT` | RATT (ID: 4) |
| **Source** | No "RATT" | - | Session normal (ID: 6) |

---

## ✏️ Editable Fields (Per File)

- 📅 **Exam Year**: Click edit icon to change
- 🔄 **Rotation**: Dropdown (R1, R2, R3, R4, None)
- 📋 **Source**: Dropdown (from database)

---

## ✅ Validation Checklist

Before import, ensure:
- [ ] All files are `.json` format
- [ ] All files have exam year set
- [ ] All files have source selected
- [ ] All files show "Valid" status
- [ ] JSON structure is correct

---

## 📋 JSON Structure

### Minimal Example
```json
[
  {
    "questionText": "What is the primary function of the heart?",
    "questionType": "SINGLE_CHOICE",
    "answers": [
      {
        "answerText": "Pumping blood",
        "isCorrect": true
      },
      {
        "answerText": "Filtering toxins",
        "isCorrect": false
      }
    ]
  }
]
```

### Required Fields
- `questionText` (string)
- `questionType` ("SINGLE_CHOICE" or "MULTIPLE_CHOICE")
- `answers` (array, min 2 items)
  - `answerText` (string)
  - `isCorrect` (boolean)

### Optional Fields
- `explanation` (string)
- `answers[].explanation` (string)

---

## ⚠️ Common Issues & Solutions

### Issue: "File missing exam year"
**Solution**: Click ✏️ icon and enter year manually

### Issue: "File missing source"
**Solution**: Select source from dropdown

### Issue: "Invalid JSON"
**Solution**: Validate JSON structure at jsonlint.com

### Issue: "Wrong year detected"
**Solution**: Click ✏️ icon and correct the year

### Issue: "Wrong source detected"
**Solution**: Use source dropdown to select correct source

---

## 🎯 Best Practices

1. ✅ Use consistent naming: `{course}_{year}_{source}_{rotation}.json`
2. ✅ Include all metadata in filename when possible
3. ✅ Test with one file before bulk upload
4. ✅ Keep backup of original files
5. ✅ Review auto-detected values before importing

---

## 📊 Import Process

```
Upload Files → Auto-Detect → Review/Edit → Validate → Import → Results
```

**Progress shown for each file:**
- ⏳ Pending
- 🔄 Validating
- ✅ Valid
- ❌ Invalid
- 📤 Uploading
- ✓ Success
- ✗ Error

---

## 🔢 Source Mapping

| Source Name | Source ID | Detection |
|-------------|-----------|-----------|
| RATT | 4 | Filename contains "RATT" |
| Session normal | 6 | Default (no "RATT") |

---

## 📞 Need Help?

1. Check filename follows pattern: `{course}_{year}_{source}_{rotation}.json`
2. Verify JSON is valid
3. Review validation errors in UI
4. Contact system administrator

---

## 💡 Pro Tips

- **Batch similar files**: Upload files with similar metadata together
- **Use separators**: Underscores (`_`) or hyphens (`-`) work best
- **Case doesn't matter**: `RATT`, `ratt`, `R1`, `r1` all work
- **Multiple years**: First year in filename is used
- **Override anytime**: All auto-detected values can be edited

---

## 🎓 Example Workflow

**Scenario**: Import 4 years of RATT exams for PIT course

**Files**:
```
pit_questions_2018_RATT_R1.json
pit_questions_2019_RATT_R1.json
pit_questions_2020_RATT_R1.json
pit_questions_2021_RATT_R1.json
```

**Steps**:
1. Navigate to PIT course
2. Click "Import Multiple Files"
3. Drag all 4 files
4. Verify auto-detection (all should be correct)
5. Click "Start Import (4 files)"
6. Wait for completion
7. See success message with total questions imported

**Result**: All 4 files imported with correct metadata, no manual editing needed!

---

## 📈 Validation Summary

After upload, you'll see:
- **Total Files**: Number of files uploaded
- **Valid Files**: Files ready to import
- **Invalid Files**: Files with errors
- **Total Questions**: Sum of all questions

**Import is enabled only when:**
- ✅ All files are valid
- ✅ All files have exam year
- ✅ All files have source

---

## 🔄 Rotation Values

Valid rotations:
- `R1` - Rotation 1
- `R2` - Rotation 2
- `R3` - Rotation 3
- `R4` - Rotation 4
- `None` - No rotation (optional)

---

## 📦 API Request (Per File)

Each file generates one API request:

```json
POST /api/v1/admin/questions/bulk
{
  "metadata": {
    "courseId": 123,
    "universityId": 1,
    "examYear": 2018,
    "rotation": "R1",
    "sourceId": 4
  },
  "questions": [...]
}
```

---

## ⏱️ Import Time

Approximate time per file:
- Small (1-10 questions): ~1-2 seconds
- Medium (11-50 questions): ~2-5 seconds
- Large (51-100 questions): ~5-10 seconds
- Very large (100+ questions): ~10-20 seconds

**Total time** = Sum of all files + network latency

---

## 🎨 UI Indicators

**File Status Icons**:
- 📄 Pending (gray)
- 🔄 Validating (yellow, animated)
- ✅ Valid (green)
- ❌ Invalid (red)
- 📤 Uploading (blue, animated)
- ✓ Success (green)
- ✗ Error (red)

**Metadata Icons**:
- 📅 Exam Year
- 🔄 Rotation
- 📋 Source

---

## 🚫 What NOT to Do

❌ Don't upload non-JSON files
❌ Don't skip validation errors
❌ Don't import without reviewing auto-detection
❌ Don't use invalid rotation values (R5, R6, etc.)
❌ Don't use years before 1900 or after current year
❌ Don't forget to backup original files

---

## ✨ Feature Highlights

- ✅ **Auto-detection**: Year, rotation, source from filename
- ✅ **Per-file metadata**: Each file can have different values
- ✅ **Editable**: Override any auto-detected value
- ✅ **Validation**: Real-time validation before import
- ✅ **Progress tracking**: See status of each file
- ✅ **Error handling**: Clear error messages
- ✅ **Batch import**: Import multiple files at once

---

## 📚 Related Documentation

- **Full Guide**: `BULK_IMPORT_AUTO_DETECTION.md`
- **Examples**: `BULK_IMPORT_EXAMPLES.md`
- **Workflow**: `BULK_IMPORT_WORKFLOW.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`

---

**Last Updated**: 2025-10-01
**Version**: 1.0

