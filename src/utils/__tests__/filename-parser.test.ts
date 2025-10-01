/**
 * Tests for filename parser utility functions
 */

import {
  extractExamYear,
  extractRotation,
  isRATTSource,
  extractCourseString,
  parseFilenameMetadata,
  fuzzyMatchCourse,
  findBestMatchingCourse
} from '../filename-parser';

describe('extractExamYear', () => {
  it('should extract valid 4-digit year from filename', () => {
    expect(extractExamYear('pit_questions_2018.json')).toBe(2018);
    expect(extractExamYear('exam_2020_final.json')).toBe(2020);
    expect(extractExamYear('2019_questions.json')).toBe(2019);
  });

  it('should return undefined for invalid years', () => {
    expect(extractExamYear('questions_1800.json')).toBeUndefined(); // Too old
    expect(extractExamYear('questions_3000.json')).toBeUndefined(); // Too future
    expect(extractExamYear('questions.json')).toBeUndefined(); // No year
  });

  it('should extract first valid year if multiple years present', () => {
    expect(extractExamYear('2018_2019_questions.json')).toBe(2018);
  });
});

describe('extractRotation', () => {
  it('should extract rotation from filename', () => {
    expect(extractRotation('pit_2018_R1.json')).toBe('R1');
    expect(extractRotation('exam_R2_2020.json')).toBe('R2');
    expect(extractRotation('questions-R3.json')).toBe('R3');
    expect(extractRotation('test_r4.json')).toBe('R4'); // Case insensitive
  });

  it('should return undefined if no rotation found', () => {
    expect(extractRotation('questions.json')).toBeUndefined();
    expect(extractRotation('exam_2018.json')).toBeUndefined();
  });

  it('should handle various separators', () => {
    expect(extractRotation('exam_R1_2018.json')).toBe('R1');
    expect(extractRotation('exam-R2-2018.json')).toBe('R2');
    expect(extractRotation('exam R3 2018.json')).toBe('R3');
  });
});

describe('isRATTSource', () => {
  it('should detect RATT in filename', () => {
    expect(isRATTSource('pit_2018_RATT.json')).toBe(true);
    expect(isRATTSource('RATT_questions.json')).toBe(true);
    expect(isRATTSource('exam_ratt_2020.json')).toBe(true); // Case insensitive
  });

  it('should return false if RATT not present', () => {
    expect(isRATTSource('questions.json')).toBe(false);
    expect(isRATTSource('exam_2018.json')).toBe(false);
  });
});

describe('extractCourseString', () => {
  it('should extract course identifier from filename', () => {
    expect(extractCourseString('pit_questions_2018.json')).toBe('pit');
    expect(extractCourseString('cardio_2020_R1.json')).toBe('cardio');
    expect(extractCourseString('anatomy_exam_2019.json')).toBe('anatomy');
  });

  it('should handle complex filenames', () => {
    expect(extractCourseString('pit_questions_2018_RATT_R1.json')).toBe('pit');
    expect(extractCourseString('neuro-exam-2020-R2.json')).toBe('neuro');
  });

  it('should return undefined for filenames with no course identifier', () => {
    expect(extractCourseString('2018.json')).toBeUndefined();
    expect(extractCourseString('questions.json')).toBeUndefined();
  });

  it('should remove common words', () => {
    expect(extractCourseString('pit_questions_2018.json')).toBe('pit');
    expect(extractCourseString('cardio_exam_2020.json')).toBe('cardio');
    expect(extractCourseString('anatomy_test_2019.json')).toBe('anatomy');
  });
});

describe('parseFilenameMetadata', () => {
  it('should parse all metadata from filename', () => {
    const result = parseFilenameMetadata('pit_questions_2018_RATT_R1.json');
    expect(result).toEqual({
      examYear: 2018,
      courseString: 'pit',
      rotation: 'R1',
      isRATT: true,
      sourceId: 4
    });
  });

  it('should handle partial metadata', () => {
    const result = parseFilenameMetadata('cardio_2020.json');
    expect(result).toEqual({
      examYear: 2020,
      courseString: 'cardio',
      rotation: undefined,
      isRATT: false,
      sourceId: undefined
    });
  });

  it('should handle RATT without rotation', () => {
    const result = parseFilenameMetadata('anatomy_2019_RATT.json');
    expect(result).toEqual({
      examYear: 2019,
      courseString: 'anatomy',
      rotation: undefined,
      isRATT: true,
      sourceId: 4
    });
  });
});

describe('fuzzyMatchCourse', () => {
  it('should return 1.0 for exact match', () => {
    expect(fuzzyMatchCourse('cardiology', 'cardiology')).toBe(1.0);
  });

  it('should return high score for contains match', () => {
    expect(fuzzyMatchCourse('cardio', 'cardiology')).toBe(0.8);
    expect(fuzzyMatchCourse('cardiology', 'cardio')).toBe(0.8);
  });

  it('should handle case insensitivity', () => {
    expect(fuzzyMatchCourse('CARDIO', 'cardiology')).toBe(0.8);
    expect(fuzzyMatchCourse('Cardio', 'CARDIOLOGY')).toBe(0.8);
  });

  it('should handle accents and special characters', () => {
    const score = fuzzyMatchCourse('cardiologie', 'Cardiologie');
    expect(score).toBeGreaterThan(0.8);
  });

  it('should return 0 for no match', () => {
    expect(fuzzyMatchCourse('cardio', 'neurology')).toBe(0);
  });

  it('should handle partial word matches', () => {
    const score = fuzzyMatchCourse('neuro', 'neurologie');
    expect(score).toBeGreaterThan(0.6);
  });
});

describe('findBestMatchingCourse', () => {
  const courses = [
    { id: 1, name: 'Cardiologie' },
    { id: 2, name: 'Neurologie' },
    { id: 3, name: 'Anatomie' },
    { id: 4, name: 'Physiologie' }
  ];

  it('should find exact match', () => {
    const result = findBestMatchingCourse('Cardiologie', courses);
    expect(result).toEqual({ id: 1, name: 'Cardiologie' });
  });

  it('should find best fuzzy match', () => {
    const result = findBestMatchingCourse('cardio', courses);
    expect(result).toEqual({ id: 1, name: 'Cardiologie' });
  });

  it('should return null if no match above threshold', () => {
    const result = findBestMatchingCourse('xyz', courses, 0.7);
    expect(result).toBeNull();
  });

  it('should return null for empty search string', () => {
    const result = findBestMatchingCourse('', courses);
    expect(result).toBeNull();
  });

  it('should return null for empty courses array', () => {
    const result = findBestMatchingCourse('cardio', []);
    expect(result).toBeNull();
  });

  it('should handle case insensitive matching', () => {
    const result = findBestMatchingCourse('NEURO', courses);
    expect(result).toEqual({ id: 2, name: 'Neurologie' });
  });

  it('should respect custom threshold', () => {
    const result = findBestMatchingCourse('card', courses, 0.9);
    expect(result).toBeNull(); // 'card' vs 'Cardiologie' might not reach 0.9
  });
});

describe('Integration tests', () => {
  it('should handle real-world filename patterns', () => {
    const testCases = [
      {
        filename: 'pit_questions_2018_RATT_R1.json',
        expected: {
          examYear: 2018,
          courseString: 'pit',
          rotation: 'R1',
          isRATT: true,
          sourceId: 4
        }
      },
      {
        filename: 'cardio_2020_R2.json',
        expected: {
          examYear: 2020,
          courseString: 'cardio',
          rotation: 'R2',
          isRATT: false,
          sourceId: undefined
        }
      },
      {
        filename: 'anatomy-exam-2019-RATT.json',
        expected: {
          examYear: 2019,
          courseString: 'anatomy',
          rotation: undefined,
          isRATT: true,
          sourceId: 4
        }
      }
    ];

    testCases.forEach(({ filename, expected }) => {
      const result = parseFilenameMetadata(filename);
      expect(result).toEqual(expected);
    });
  });

  it('should handle edge cases gracefully', () => {
    const edgeCases = [
      'questions.json',
      '2018.json',
      'RATT.json',
      'R1.json',
      '.json',
      ''
    ];

    edgeCases.forEach(filename => {
      expect(() => parseFilenameMetadata(filename)).not.toThrow();
    });
  });
});

