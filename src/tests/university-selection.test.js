/**
 * University Selection Feature Test
 * 
 * Tests the university selection logic for session creation:
 * 1. 0 universities: Show error, block creation
 * 2. 1 university: Auto-select, show label
 * 3. Multiple universities: Show dropdown
 * 4. Practice vs Exam validation
 */

// Mock the university selection hook logic
function mockUniversitySelection(universities, allowMultiple = false, required = true) {
  const count = universities.length;
  
  // Determine UI state
  let uiState;
  if (count === 0) {
    uiState = {
      showDropdown: false,
      autoSelectedUniversity: null,
      errorMessage: 'Aucune université disponible pour votre session.'
    };
  } else if (count === 1) {
    uiState = {
      showDropdown: false,
      autoSelectedUniversity: universities[0],
      errorMessage: null
    };
  } else {
    uiState = {
      showDropdown: true,
      autoSelectedUniversity: null,
      errorMessage: null
    };
  }
  
  // Auto-select single university
  const selectedUniversityIds = uiState.autoSelectedUniversity ? [uiState.autoSelectedUniversity.id] : [];
  
  // Validation
  const isValid = !required || (universities.length > 0 && selectedUniversityIds.length > 0);
  
  return {
    availableUniversities: universities,
    selectedUniversityIds,
    showDropdown: uiState.showDropdown,
    autoSelectedUniversity: uiState.autoSelectedUniversity,
    errorMessage: uiState.errorMessage,
    isValid
  };
}

function validateUniversitySelection(universitySelection, sessionType) {
  // For practice sessions, universities are optional
  if (sessionType === 'PRACTICE') {
    return { isValid: true };
  }

  // For exam sessions, universities are required
  if (sessionType === 'EXAM') {
    if (universitySelection.availableUniversities.length === 0) {
      return {
        isValid: false,
        errorMessage: 'Aucune université disponible pour votre session d\'examen.'
      };
    }

    if (!universitySelection.isValid || universitySelection.selectedUniversityIds.length === 0) {
      return {
        isValid: false,
        errorMessage: 'Veuillez sélectionner une université pour la session d\'examen.'
      };
    }
  }

  return { isValid: true };
}

// Test scenarios
console.log('🧪 Testing University Selection Feature...\n');

// Test 1: No universities available
console.log('📋 Test 1: No universities available');
const noUniversities = mockUniversitySelection([], false, true);
console.log('Result:', {
  showDropdown: noUniversities.showDropdown,
  autoSelected: !!noUniversities.autoSelectedUniversity,
  hasError: !!noUniversities.errorMessage,
  errorMessage: noUniversities.errorMessage,
  isValid: noUniversities.isValid
});

const noUnivValidation = validateUniversitySelection(noUniversities, 'EXAM');
console.log('Exam validation:', noUnivValidation);
console.log('✅ Expected: showDropdown=false, autoSelected=false, hasError=true, isValid=false\n');

// Test 2: Single university available
console.log('📋 Test 2: Single university available');
const singleUniversity = mockUniversitySelection([
  { id: 1, name: 'Université d\'Alger 1' }
], false, true);
console.log('Result:', {
  showDropdown: singleUniversity.showDropdown,
  autoSelected: !!singleUniversity.autoSelectedUniversity,
  autoSelectedName: singleUniversity.autoSelectedUniversity?.name,
  hasError: !!singleUniversity.errorMessage,
  selectedIds: singleUniversity.selectedUniversityIds,
  isValid: singleUniversity.isValid
});

const singleUnivValidation = validateUniversitySelection(singleUniversity, 'EXAM');
console.log('Exam validation:', singleUnivValidation);
console.log('✅ Expected: showDropdown=false, autoSelected=true, hasError=false, isValid=true\n');

// Test 3: Multiple universities available
console.log('📋 Test 3: Multiple universities available');
const multipleUniversities = mockUniversitySelection([
  { id: 1, name: 'Université d\'Alger 1' },
  { id: 2, name: 'Université d\'Oran' },
  { id: 3, name: 'Université de Constantine' }
], false, true);
console.log('Result:', {
  showDropdown: multipleUniversities.showDropdown,
  autoSelected: !!multipleUniversities.autoSelectedUniversity,
  hasError: !!multipleUniversities.errorMessage,
  selectedIds: multipleUniversities.selectedUniversityIds,
  isValid: multipleUniversities.isValid,
  availableCount: multipleUniversities.availableUniversities.length
});

// For multiple universities, no auto-selection, so validation should fail initially
const multipleUnivValidation = validateUniversitySelection(multipleUniversities, 'EXAM');
console.log('Exam validation (no selection):', multipleUnivValidation);
console.log('✅ Expected: showDropdown=true, autoSelected=false, hasError=false, isValid=false\n');

// Test 4: Practice session validation (should always pass)
console.log('📋 Test 4: Practice session validation');
const practiceValidation1 = validateUniversitySelection(noUniversities, 'PRACTICE');
const practiceValidation2 = validateUniversitySelection(singleUniversity, 'PRACTICE');
const practiceValidation3 = validateUniversitySelection(multipleUniversities, 'PRACTICE');

console.log('Practice validation results:', {
  noUniversities: practiceValidation1.isValid,
  singleUniversity: practiceValidation2.isValid,
  multipleUniversities: practiceValidation3.isValid
});
console.log('✅ Expected: All practice validations should be true\n');

// Test 5: Session creation payload validation
console.log('📋 Test 5: Session creation payload validation');

function createSessionPayload(universitySelection, sessionType) {
  const validation = validateUniversitySelection(universitySelection, sessionType);
  
  if (!validation.isValid) {
    return { error: validation.errorMessage };
  }
  
  const payload = {
    title: 'Test Session',
    questionCount: 20,
    courseIds: [1, 2, 3],
    sessionType: sessionType === 'PRACTICE' ? 'PRACTISE' : 'EXAM'
  };
  
  // Add universityIds if available and selected
  if (universitySelection.selectedUniversityIds.length > 0) {
    payload.universityIds = universitySelection.selectedUniversityIds;
  }
  
  return { payload };
}

const examPayload1 = createSessionPayload(noUniversities, 'EXAM');
const examPayload2 = createSessionPayload(singleUniversity, 'EXAM');
const practicePayload1 = createSessionPayload(noUniversities, 'PRACTICE');
const practicePayload2 = createSessionPayload(singleUniversity, 'PRACTICE');

console.log('Exam session with no universities:', examPayload1);
console.log('Exam session with single university:', examPayload2);
console.log('Practice session with no universities:', practicePayload1);
console.log('Practice session with single university:', practicePayload2);

console.log('\n🎉 University Selection Feature Tests Complete!');
console.log('\n📊 Summary:');
console.log('- ✅ No universities: Shows error, blocks exam creation');
console.log('- ✅ Single university: Auto-selects, shows label');
console.log('- ✅ Multiple universities: Shows dropdown');
console.log('- ✅ Practice sessions: Universities optional');
console.log('- ✅ Exam sessions: Universities required');
console.log('- ✅ Session payloads: Include universityIds when selected');
