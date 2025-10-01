# Bulk Import Quick Reference Guide

## Filename Format

```
{CourseName}_questions_{Year}[_RATT][_R1-R4].json
```

### Examples

✅ **Good Filenames:**
```
Cytokines, Chimiokines et leurs récepteurs_questions_2012.json
Les lymphocytes B et les Immunoglobulines_questions_2021_RATT.json
Les_molécules_d'adhésion_cellulaire_et_la_réaction_inflammatoire_questions_2019_RATT_R2.json
Immunology_questions_2020.json
Cardiology_questions_2021_RATT_R1.json
```

❌ **Poor Filenames:**
```
questions.json                    # No course name or year
data_2021.json                    # No "questions" keyword
Immunology.json                   # No year
2021_questions.json               # No course name
```

## Auto-Detection Rules

| Field | Detection Rule | Example |
|-------|---------------|---------|
| **Course Name** | Everything before `_questions_` | `Immunology_questions_2020.json` → "Immunology" |
| **Exam Year** | 4-digit year (2000-2099) | `..._2021_...` → 2021 |
| **Source** | Contains "RATT" → sourceId = 4 | `..._RATT_...` → RATT source |
| **Rotation** | R1, R2, R3, or R4 | `..._R2.json` → R2 |

## Metadata Priority

```
File-level > Group-level > Global-level > Auto-detected
```

### When to Use Each Level

| Level | Use When | Example |
|-------|----------|---------|
| **Global** | All files share same source/rotation | All files are RATT R2 |
| **Group** | All files in a course share metadata | All "Immunology" files are from same source |
| **File** | Individual file needs special handling | One file has different year than auto-detected |

## Quick Workflow

### 1. Upload Files
- Drag & drop or click to select
- Multiple files supported
- Only `.json` files accepted

### 2. Review Groups
- Files automatically grouped by course name
- Expand/collapse groups to review

### 3. Set Metadata (Priority Order)

**Option A: Set Global First (Recommended for uniform data)**
1. Set global source and rotation
2. Override at group level if needed
3. Override at file level for exceptions

**Option B: Set Group First (Recommended for varied data)**
1. Set course for each group
2. Set source/rotation per group
3. Override at file level for exceptions

**Option C: Set File-by-File (For complex scenarios)**
1. Edit each file individually
2. Most control, but most time-consuming

### 4. Validate
- Check validation summary
- Ensure all files are valid
- Fix any errors

### 5. Import
- Click "Start Import"
- Monitor progress
- Review results

## Validation Checklist

Before importing, ensure:

- [ ] All files have valid JSON format
- [ ] All files contain questions array
- [ ] All files have exam year set
- [ ] All files have course selected
- [ ] All files have source selected
- [ ] No validation errors shown

## Common Issues & Solutions

### Issue: Course not auto-detected

**Solution:**
- Check filename format (should have `_questions_` separator)
- Manually select course at group or file level

### Issue: Year not detected

**Solution:**
- Ensure year is 4 digits (e.g., 2021, not 21)
- Manually edit year for the file

### Issue: Source not detected

**Solution:**
- Only RATT is auto-detected
- Set source at global or group level for non-RATT files

### Issue: Files not grouping correctly

**Solution:**
- Check course name consistency in filenames
- Use underscores or spaces consistently
- Manually override course at file level if needed

### Issue: Cannot import (button disabled)

**Solution:**
- Check validation summary for errors
- Ensure all required metadata is set
- Fix any invalid files

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Upload files | Click upload area |
| Expand/collapse group | Click group header |
| Edit year | Click edit icon next to year |
| Save year edit | Enter key |
| Cancel year edit | Escape key |

## Tips & Best Practices

### Filename Tips

1. **Use consistent naming**: Stick to one format for all files
2. **Include year**: Always include 4-digit year in filename
3. **Use `_questions_` separator**: Helps auto-detection
4. **Be specific**: Include course name exactly as it appears in system

### Metadata Tips

1. **Start with global**: Set common metadata globally first
2. **Group similar files**: Upload files with similar metadata together
3. **Review auto-detection**: Always verify auto-detected values
4. **Use groups**: Leverage group settings for efficiency

### Import Tips

1. **Test with small batch**: Try 2-3 files first
2. **Validate before import**: Fix all errors before clicking import
3. **Monitor progress**: Watch for any failures during import
4. **Review results**: Check success/failure counts after import

## Example Workflows

### Workflow 1: Same Source, Different Courses

**Scenario:** 10 files, all RATT R2, different courses and years

**Steps:**
1. Upload all 10 files
2. Set global: Source = RATT, Rotation = R2
3. Review auto-detected courses and years
4. Fix any incorrect auto-detections
5. Import

**Time saved:** ~5 minutes vs. setting each file individually

### Workflow 2: Multiple Courses, Multiple Years

**Scenario:** 15 files, 3 courses, various years, mixed sources

**Steps:**
1. Upload all 15 files
2. Files auto-group into 3 course groups
3. Set course for each group
4. Set source per group (or globally if same)
5. Review auto-detected years
6. Import

**Time saved:** ~10 minutes vs. setting each file individually

### Workflow 3: Complex Mixed Metadata

**Scenario:** 20 files, various courses, years, sources, rotations

**Steps:**
1. Upload all 20 files
2. Set global rotation (if most files share it)
3. Set course per group
4. Set source per group or file as needed
5. Review and fix auto-detected years
6. Override any file-specific exceptions
7. Import

**Time saved:** ~15 minutes vs. setting each file individually

## Troubleshooting

### Files not uploading

- Check file format (must be `.json`)
- Check file size (should be reasonable)
- Check browser console for errors

### Auto-detection not working

- Verify filename format
- Check for special characters
- Ensure `_questions_` separator is present

### Validation failing

- Open file in text editor to check JSON format
- Ensure questions array exists
- Check for required fields in questions

### Import failing

- Check network connection
- Verify all metadata is set
- Check browser console for errors
- Contact support if issue persists

## Support

For additional help:
- Review full documentation: `docs/GROUPED_BULK_IMPORT_FEATURE.md`
- Check implementation details: `docs/IMPLEMENTATION_SUMMARY.md`
- Contact system administrator

