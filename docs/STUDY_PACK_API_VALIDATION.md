# Study Pack API Validation & Fixes

## Overview
This document outlines the validation and fixes implemented for the study pack creation and update APIs to ensure proper request structure and prevent invalid data formats.

## Issues Fixed

### 1. Missing Required Price Fields
**Problem**: API only used single `price` field instead of separate `pricePerMonth` and `pricePerYear`
**Solution**: 
- Updated `StudyPack` interface to include both `pricePerMonth` and `pricePerYear` as required fields
- Maintained `price` field for backward compatibility
- Added validation to ensure both price fields are present and are positive numbers

### 2. Incorrect Type Enum Values
**Problem**: Type enum was missing `MODULE` and `COURSE` options as specified in requirements
**Solution**:
- Updated type enum from `'YEAR' | 'RESIDENCY'` to `'YEAR' | 'MODULE' | 'COURSE'`
- Added validation constants `STUDY_PACK_TYPES` and `YEAR_NUMBERS` for consistent validation

### 3. String vs Number Type Validation
**Problem**: No validation to prevent string values being passed for numeric fields
**Solution**:
- Added strict type checking: `typeof studyPackData.pricePerMonth !== 'number'`
- Added positive number validation: `studyPackData.pricePerMonth <= 0`
- Prevents invalid formats like `"pricePerMonth": "2000"` (string instead of number)

### 4. Inconsistent API Function Signatures
**Problem**: Multiple `createStudyPack` functions with different signatures
**Solution**:
- Consolidated to single validated function using proper TypeScript interfaces
- Removed duplicate function definitions
- Added comprehensive validation for all required fields

## API Endpoints

### Create Study Pack
**POST** `/admin/study-packs`

**Request Body**:
```typescript
interface CreateStudyPackRequest {
  name: string;                    // Required, non-empty string
  description: string;             // Required, non-empty string  
  type: 'YEAR' | 'MODULE' | 'COURSE'; // Required, valid enum
  yearNumber: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN'; // Required, valid enum
  pricePerMonth: number;           // Required, positive number
  pricePerYear: number;            // Required, positive number
}
```

**Validation Rules**:
- `name`: Required string, cannot be empty or whitespace-only
- `description`: Required string, cannot be empty or whitespace-only
- `type`: Must be one of: YEAR, MODULE, COURSE
- `yearNumber`: Must be one of: ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN
- `pricePerMonth`: Must be a positive number (not string)
- `pricePerYear`: Must be a positive number (not string)

### Update Study Pack
**PUT** `/admin/study-packs/:id`

**Path Parameter**:
- `id`: Required number (study pack ID)

**Request Body**:
```typescript
interface UpdateStudyPackRequest {
  name?: string;                   // Optional, non-empty string when provided
  description?: string;            // Optional, non-empty string when provided
  type?: 'YEAR' | 'MODULE' | 'COURSE'; // Optional, valid enum when provided
  yearNumber?: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN'; // Optional, valid enum when provided
  pricePerMonth?: number;          // Optional, positive number when provided
  pricePerYear?: number;           // Optional, positive number when provided
  isActive?: boolean;              // Optional, boolean when provided
}
```

**Validation Rules**:
- All fields are optional for updates
- When provided, same validation rules as create apply
- `id` parameter must be a valid number
- String fields cannot be empty or whitespace-only when provided
- Numeric fields must be positive numbers when provided
- Boolean fields must be actual booleans when provided

## Error Handling

### Validation Errors
The API will throw descriptive errors for invalid requests:

```typescript
// Invalid type
throw new Error('Type is required and must be one of: YEAR, MODULE, COURSE');

// Invalid price format
throw new Error('PricePerMonth is required and must be a positive number');

// Invalid year number
throw new Error('YearNumber is required and must be one of: ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN');
```

### Prevented Invalid Formats
- ❌ `"pricePerMonth": "2000"` (string instead of number)
- ❌ `"type": "INVALID_TYPE"` (invalid enum value)
- ❌ `"yearNumber": "EIGHT"` (invalid year number)
- ❌ `"name": ""` (empty string)
- ❌ `"pricePerMonth": -100` (negative number)

### Valid Formats
- ✅ `"pricePerMonth": 2000` (number)
- ✅ `"type": "YEAR"` (valid enum)
- ✅ `"yearNumber": "THREE"` (valid year)
- ✅ `"name": "Third Year Medicine"` (non-empty string)
- ✅ `"pricePerMonth": 150.50` (positive decimal)

## Implementation Files

### Updated Files
1. **`/src/types/api.ts`**:
   - Updated `StudyPack` interface with required price fields
   - Added `CreateStudyPackRequest` and `UpdateStudyPackRequest` interfaces
   - Added validation constants `STUDY_PACK_TYPES` and `YEAR_NUMBERS`
   - Added proper response type interfaces

2. **`/src/lib/api-services.ts`**:
   - Updated `AdminStudyPackService.createStudyPack()` with comprehensive validation
   - Updated `AdminStudyPackService.updateStudyPack()` with optional field validation
   - Removed duplicate function definitions
   - Added proper TypeScript typing with new interfaces

### Validation Constants
```typescript
export const STUDY_PACK_TYPES = ['YEAR', 'MODULE', 'COURSE'] as const;
export const YEAR_NUMBERS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'] as const;
```

## Testing Recommendations

### Create Study Pack Tests
```javascript
// Valid request
const validRequest = {
  name: "Third Year Medicine",
  description: "Complete third year medical curriculum",
  type: "YEAR",
  yearNumber: "THREE", 
  pricePerMonth: 150.00,
  pricePerYear: 1500.00
};

// Invalid requests to test
const invalidRequests = [
  { ...validRequest, pricePerMonth: "150" }, // String instead of number
  { ...validRequest, type: "INVALID" },      // Invalid enum
  { ...validRequest, name: "" },             // Empty string
  { ...validRequest, pricePerYear: -100 },   // Negative number
];
```

### Update Study Pack Tests
```javascript
// Valid partial update
const validUpdate = {
  pricePerMonth: 175.00,
  isActive: true
};

// Invalid updates to test
const invalidUpdates = [
  { pricePerMonth: "175" },    // String instead of number
  { type: "INVALID_TYPE" },    // Invalid enum
  { name: "   " },             // Whitespace-only string
];
```

## Summary

The study pack creation and update APIs now have:
- ✅ Comprehensive field validation
- ✅ Proper enum value checking  
- ✅ Number type enforcement
- ✅ Required field validation
- ✅ Consistent error messages
- ✅ TypeScript interface compliance
- ✅ Prevention of invalid data formats

All requirements from the original task have been implemented and validated.
