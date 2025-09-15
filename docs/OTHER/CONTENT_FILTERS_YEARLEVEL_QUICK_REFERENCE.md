# Content Filters YearLevel - Quick Reference

## Endpoint
```
GET /api/v1/students/content/filters
```

## New Query Parameter
- `yearLevel` (optional): Filter by specific year level (ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN)

## Usage Examples

### 1. Default Behavior (No yearLevel)
```bash
GET /api/v1/students/content/filters
# Returns content based on user's accessible year levels
```

### 2. Filter by Year Level FOUR
```bash
GET /api/v1/students/content/filters?yearLevel=FOUR
# Returns only content from year level FOUR
```

### 3. Filter by Year Level SEVEN
```bash
GET /api/v1/students/content/filters?yearLevel=SEVEN
# Returns only content from year level SEVEN
```

### 4. Residency Mode
```bash
GET /api/v1/students/content/filters?isResidency=true
# Returns all content grouped by year levels
```

## Key Points

✅ **No Access Checking**: When `yearLevel` is provided, no subscription access validation is performed

✅ **Pure Filtering**: Filter is based solely on study pack's `yearNumber` field

✅ **Backward Compatible**: Existing behavior preserved when `yearLevel` is not provided

✅ **Empty Results**: Invalid year levels return empty arrays (no errors)

## Response Structure

```json
{
  "success": true,
  "data": {
    "success": true,
    "data": {
      "unites": [...],           // Array of unites for the year level
      "independentModules": [...] // Array of independent modules for the year level
    }
  }
}
```

## Test Results

| Test Case | Status | Result |
|-----------|--------|--------|
| No yearLevel | ✅ | Returns all accessible content |
| yearLevel=FOUR | ✅ | Returns only FOUR year content |
| yearLevel=SEVEN | ✅ | Returns only SEVEN year content |
| yearLevel=INVALID | ✅ | Returns empty arrays |
| isResidency=true | ✅ | Returns grouped content (with access check) |

## Implementation Files Modified

- `src/modules/students/student.controller.ts` - Added yearLevel parameter handling
- `src/modules/students/student.service.ts` - Added filtering logic
- `src/modules/students/student.repository.ts` - Added new repository method

## Testing Scripts

- `test-content-filters-curl.sh` - cURL-based testing
- `test-content-filters-yearlevel.js` - Node.js testing script
