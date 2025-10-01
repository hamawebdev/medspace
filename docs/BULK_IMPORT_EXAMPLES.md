# Bulk Import - Filename Examples & Test Cases

## Quick Reference

### Filename Pattern
```
{course}_{year}_{source}_{rotation}.json
```

### Detection Summary
| Element | Pattern | Example | Result |
|---------|---------|---------|--------|
| Year | 4-digit number (1900-current) | `2018` | examYear: 2018 |
| Rotation | R1, R2, R3, or R4 | `R1` | rotation: "R1" |
| Source | Contains "RATT" | `RATT` | sourceId: 4 |
| Source | No "RATT" | - | sourceId: 6 (Session normal) |

## Test Cases

### ✅ Valid Examples

#### 1. Complete Metadata - RATT with Rotation
```
Filename: pit_questions_2018_RATT_R1.json
```
**Auto-detected:**
- examYear: `2018`
- rotation: `R1`
- sourceId: `4` (RATT)
- sourceName: `RATT`

---

#### 2. Complete Metadata - Normal Session with Rotation
```
Filename: cardio_questions_2019_R2.json
```
**Auto-detected:**
- examYear: `2019`
- rotation: `R2`
- sourceId: `6` (Session normal)
- sourceName: `Session normal`

---

#### 3. RATT without Rotation
```
Filename: neuro_2020_RATT.json
```
**Auto-detected:**
- examYear: `2020`
- rotation: `undefined` (can be set manually)
- sourceId: `4` (RATT)
- sourceName: `RATT`

---

#### 4. Normal Session without Rotation
```
Filename: anatomy_2021.json
```
**Auto-detected:**
- examYear: `2021`
- rotation: `undefined` (can be set manually)
- sourceId: `6` (Session normal)
- sourceName: `Session normal`

---

#### 5. Different Separators
```
Filename: physio-2019-RATT-R3.json
```
**Auto-detected:**
- examYear: `2019`
- rotation: `R3`
- sourceId: `4` (RATT)
- sourceName: `RATT`

---

#### 6. Spaces in Filename
```
Filename: biochem 2020 R4.json
```
**Auto-detected:**
- examYear: `2020`
- rotation: `R4`
- sourceId: `6` (Session normal)
- sourceName: `Session normal`

---

#### 7. Case Insensitive RATT
```
Filename: pathology_2018_ratt_R1.json
```
**Auto-detected:**
- examYear: `2018`
- rotation: `R1`
- sourceId: `4` (RATT)
- sourceName: `RATT`

---

#### 8. Case Insensitive Rotation
```
Filename: pharmacology_2019_r2.json
```
**Auto-detected:**
- examYear: `2019`
- rotation: `R2` (normalized to uppercase)
- sourceId: `6` (Session normal)
- sourceName: `Session normal`

---

### ⚠️ Partial Detection Examples

#### 9. Year Only
```
Filename: questions_2020.json
```
**Auto-detected:**
- examYear: `2020`
- rotation: `undefined` ⚠️ **Needs manual selection**
- sourceId: `6` (Session normal)
- sourceName: `Session normal`

**Action Required:** Select rotation from dropdown if needed

---

#### 10. No Year
```
Filename: pit_questions_RATT_R1.json
```
**Auto-detected:**
- examYear: `undefined` ⚠️ **Needs manual entry**
- rotation: `R1`
- sourceId: `4` (RATT)
- sourceName: `RATT`

**Action Required:** Click edit and enter year manually

---

#### 11. Multiple Years (First Match Used)
```
Filename: pit_2018_to_2020_RATT_R1.json
```
**Auto-detected:**
- examYear: `2018` ⚠️ **First match used**
- rotation: `R1`
- sourceId: `4` (RATT)
- sourceName: `RATT`

**Action Required:** Verify year is correct, edit if needed

---

### ❌ Invalid Examples (Require Manual Entry)

#### 12. No Detectable Year
```
Filename: questions_RATT_R1.json
```
**Auto-detected:**
- examYear: `undefined` ❌ **Must be entered manually**
- rotation: `R1`
- sourceId: `4` (RATT)
- sourceName: `RATT`

**Error:** "File missing exam year. Please set manually before importing."

---

#### 13. Invalid Year (Out of Range)
```
Filename: questions_1850_RATT_R1.json
```
**Auto-detected:**
- examYear: `undefined` ❌ **Year 1850 is before 1900**
- rotation: `R1`
- sourceId: `4` (RATT)
- sourceName: `RATT`

**Action Required:** Enter valid year (1900-current)

---

#### 14. Invalid Rotation
```
Filename: questions_2020_RATT_R5.json
```
**Auto-detected:**
- examYear: `2020`
- rotation: `undefined` ❌ **R5 is not valid (only R1-R4)**
- sourceId: `4` (RATT)
- sourceName: `RATT`

**Action Required:** Select valid rotation (R1-R4) or leave empty

---

## Sample JSON File Structure

### Minimal Valid File
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

### Complete File with All Fields
```json
[
  {
    "questionText": "What is the primary function of the heart?",
    "explanation": "The heart is a muscular organ that pumps blood throughout the body via the circulatory system.",
    "questionType": "SINGLE_CHOICE",
    "answers": [
      {
        "answerText": "Pumping blood",
        "isCorrect": true,
        "explanation": "Correct - the heart's main function is to pump blood through the circulatory system."
      },
      {
        "answerText": "Filtering toxins",
        "isCorrect": false,
        "explanation": "This is the function of the kidneys and liver."
      },
      {
        "answerText": "Producing hormones",
        "isCorrect": false,
        "explanation": "While the heart does produce some hormones, this is not its primary function."
      }
    ]
  },
  {
    "questionText": "Which of the following are components of blood? (Select all that apply)",
    "explanation": "Blood consists of plasma, red blood cells, white blood cells, and platelets.",
    "questionType": "MULTIPLE_CHOICE",
    "answers": [
      {
        "answerText": "Red blood cells",
        "isCorrect": true,
        "explanation": "Correct - RBCs carry oxygen."
      },
      {
        "answerText": "White blood cells",
        "isCorrect": true,
        "explanation": "Correct - WBCs fight infection."
      },
      {
        "answerText": "Platelets",
        "isCorrect": true,
        "explanation": "Correct - platelets help with clotting."
      },
      {
        "answerText": "Neurons",
        "isCorrect": false,
        "explanation": "Neurons are nerve cells, not blood components."
      }
    ]
  }
]
```

## Batch Import Example

### Scenario: Importing Multiple Years of RATT Exams

**Files to upload:**
```
pit_questions_2018_RATT_R1.json  → Year: 2018, Source: RATT, Rotation: R1
pit_questions_2019_RATT_R1.json  → Year: 2019, Source: RATT, Rotation: R1
pit_questions_2020_RATT_R1.json  → Year: 2020, Source: RATT, Rotation: R1
pit_questions_2021_RATT_R1.json  → Year: 2021, Source: RATT, Rotation: R1
```

**Result:**
- All files auto-detect correctly
- No manual editing needed
- Click "Start Import" to import all 4 files

---

### Scenario: Mixed Sources and Rotations

**Files to upload:**
```
cardio_2020_RATT_R1.json         → Year: 2020, Source: RATT, Rotation: R1
cardio_2020_RATT_R2.json         → Year: 2020, Source: RATT, Rotation: R2
cardio_2020_R1.json              → Year: 2020, Source: Session normal, Rotation: R1
cardio_2020_R2.json              → Year: 2020, Source: Session normal, Rotation: R2
```

**Result:**
- Each file gets its own metadata
- RATT files → sourceId: 4
- Non-RATT files → sourceId: 6
- All rotations detected correctly

---

## Troubleshooting

### Issue: Year Not Detected
**Symptoms:** File shows "No year detected"

**Solutions:**
1. Check filename contains 4-digit year (1900-current)
2. Click edit icon and enter year manually
3. Rename file to include year: `questions_2020.json`

---

### Issue: Wrong Source Detected
**Symptoms:** File shows wrong source (RATT vs Session normal)

**Solutions:**
1. Use source dropdown to select correct source
2. For RATT: ensure filename contains "RATT"
3. For Session normal: remove "RATT" from filename

---

### Issue: Rotation Not Detected
**Symptoms:** Rotation shows as empty

**Solutions:**
1. Check filename has R1, R2, R3, or R4 with separators
2. Use rotation dropdown to select manually
3. Rename file: `questions_2020_R1.json`

---

### Issue: Multiple Years in Filename
**Symptoms:** Wrong year detected (e.g., first year in range)

**Solutions:**
1. Click edit icon and change to correct year
2. Rename file to have only target year
3. Use format: `questions_2020.json` instead of `questions_2018_2020.json`

---

## Best Practices Summary

1. ✅ **Use consistent naming**: `{course}_{year}_{source}_{rotation}.json`
2. ✅ **Include all metadata in filename** when possible
3. ✅ **Use underscores or hyphens** as separators
4. ✅ **Verify auto-detection** before importing
5. ✅ **Batch similar files** together
6. ✅ **Test with one file** before bulk upload
7. ✅ **Keep backup** of original files
8. ✅ **Validate JSON** before upload

## Quick Start Checklist

- [ ] Files are in `.json` format
- [ ] Filenames include year (YYYY format)
- [ ] Filenames include source indicator (RATT or not)
- [ ] Filenames include rotation if applicable (R1-R4)
- [ ] JSON structure is valid
- [ ] Questions have required fields
- [ ] Ready to upload and review auto-detection

