# Module-Level Import Flow

## Overview

The import flow has been updated to allow bulk import directly at the module level, without requiring course selection first.

## New Flow

### Previous Flow
```
University → Study Pack → Unit → Module → Course → Course Actions → Bulk Import
```

### New Flow
```
University → Study Pack → Unit → Module → Module Actions
                                              ├─→ Select Course → Course Actions → Bulk Import
                                              └─→ Bulk Import (directly)
```

## Changes Made

### 1. Added New Step: `moduleActions`

**Type Definition:**
```typescript
type Step = 'university' | 'studyPack' | 'unit' | 'module' | 'moduleActions' | 'course' | 'courseActions' | 'import' | 'bulkImport';
```

### 2. Updated Navigation Flow

**After selecting Module/Independent Module:**
- Now goes to `moduleActions` step (instead of `course`)
- Shows action cards for:
  - **Select Course**: Continue to course selection (existing flow)
  - **Bulk Import**: Import directly to module (new flow)

### 3. Module Actions UI

When a module or independent module is selected, users see:

```
┌─────────────────────────────────────────┐
│  Module: [Module Name]                  │
│  Choose an action for this module       │
└─────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  Select Course   │  │  Bulk Import     │
│  Choose a        │  │  Import multiple │
│  specific course │  │  JSON files with │
│  to import       │  │  auto-detection  │
│  questions       │  │                  │
└──────────────────┘  └──────────────────┘
```

### 4. Back Navigation

**Updated back button logic:**
- From `moduleActions` → back to `module` selection
- From `course` → back to `moduleActions`
- From `courseActions` → back to `course` selection
- From `bulkImport`:
  - If course selected → back to `courseActions`
  - If no course → back to `moduleActions`

### 5. Breadcrumb Updates

**New breadcrumb structure:**
```
University > Study Pack > Unit > [Module Name] > Bulk Import
                                      ↑
                                 moduleActions
```

Or with course:
```
University > Study Pack > Unit > [Module Name] > [Course Name] > Bulk Import
                                      ↑              ↑
                                 moduleActions   courseActions
```

## User Experience

### Scenario 1: Direct Module Import

1. User selects: University → Study Pack → Unit → Module
2. **Module Actions** screen appears with two options
3. User clicks **"Bulk Import"**
4. Enhanced Bulk Import wizard opens
5. User uploads files with auto-detection
6. Questions are imported to the module

### Scenario 2: Course-Specific Import

1. User selects: University → Study Pack → Unit → Module
2. **Module Actions** screen appears
3. User clicks **"Select Course"**
4. Course selection screen appears
5. User selects a course
6. **Course Actions** screen appears
7. User clicks **"Bulk Import"** or **"Single Import"**
8. Import wizard opens
9. Questions are imported to the specific course

## Benefits

### ✅ Faster Workflow
- Skip course selection when importing to module level
- Fewer clicks for bulk imports

### ✅ Flexibility
- Can still select specific course if needed
- Supports both module-level and course-level imports

### ✅ Clear Navigation
- Action cards make options obvious
- Breadcrumbs show current location
- Back button works intuitively

### ✅ Consistent UX
- Same pattern as course actions
- Familiar card-based selection
- Consistent with existing design

## Technical Details

### Step Transitions

```typescript
// Module selected
case 'module':
  setCurrentStep('moduleActions');
  break;

// Independent Module selected
case 'independentModule':
  setCurrentStep('moduleActions');
  break;

// Course selected (from moduleActions)
case 'course':
  setCurrentStep('courseActions');
  break;
```

### Back Navigation Logic

```typescript
case 'moduleActions':
  // Go back to module/independent module selection
  if (selection.independentModule) {
    updateSelection('independentModule', undefined);
  } else {
    updateSelection('module', undefined);
  }
  setCurrentStep(selection.unit ? 'module' : 'unit');
  break;

case 'course':
  // Go back to module actions
  if (selection.independentModule) {
    updateSelection('independentModule', undefined);
  } else {
    updateSelection('module', undefined);
  }
  setCurrentStep('moduleActions');
  break;

case 'bulkImport':
  // Go back to appropriate actions screen
  if (selection.course) {
    setCurrentStep('courseActions');
  } else {
    setCurrentStep('moduleActions');
  }
  break;
```

### Step Info

```typescript
case 'moduleActions':
  return {
    title: 'Module Actions',
    description: `Choose an action for ${selection.module?.name || selection.independentModule?.name}`,
    icon: GraduationCap
  };
```

## Files Modified

- `src/app/admin/content/page.tsx`
  - Added `moduleActions` step type
  - Updated navigation flow
  - Added moduleActions UI section
  - Updated breadcrumbs
  - Updated back button logic
  - Updated "Add Entity" button conditions

## Testing Checklist

- [ ] Select module → see Module Actions screen
- [ ] Click "Select Course" → see course selection
- [ ] Click "Bulk Import" from module actions → see bulk import wizard
- [ ] Back button from module actions → return to module selection
- [ ] Back button from course selection → return to module actions
- [ ] Back button from bulk import (no course) → return to module actions
- [ ] Back button from bulk import (with course) → return to course actions
- [ ] Breadcrumbs show correct path
- [ ] Breadcrumbs are clickable and navigate correctly
- [ ] "Add Entity" button doesn't show on moduleActions screen
- [ ] Independent modules work the same way

## Future Enhancements

1. **Single Import at Module Level**
   - Add "Single Import" option to module actions
   - Allow importing single JSON file to module

2. **Create Question at Module Level**
   - Add "Create Question" option to module actions
   - Allow creating individual questions for module

3. **Module Statistics**
   - Show question count for module
   - Show course count in module
   - Display recent imports

4. **Quick Actions**
   - "Import to Last Used Course" shortcut
   - "Repeat Last Import" option
   - Favorite courses for quick access

