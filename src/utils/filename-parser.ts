/**
 * Utility functions for parsing metadata from filenames
 * Used in bulk import feature to auto-detect course, exam year, source, and rotation
 */

export interface ParsedFilenameMetadata {
  examYear?: number;
  courseString?: string; // Raw course string extracted from filename
  rotation?: 'R1' | 'R2' | 'R3' | 'R4';
  isRATT: boolean; // True if filename contains "RATT"
  sourceId?: number; // 4 if RATT detected
}

/**
 * Extract exam year from filename
 * Looks for 4-digit year between 1900 and current year
 */
export function extractExamYear(filename: string): number | undefined {
  const yearMatch = filename.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    const currentYear = new Date().getFullYear();
    if (year >= 1900 && year <= currentYear) {
      return year;
    }
  }
  return undefined;
}

/**
 * Extract rotation from filename
 * Looks for R1, R2, R3, or R4 patterns
 */
export function extractRotation(filename: string): 'R1' | 'R2' | 'R3' | 'R4' | undefined {
  const rotationMatch = filename.match(/[_\-\s]?(R[1-4])[_\-\s\.]?/i);
  if (rotationMatch) {
    return rotationMatch[1].toUpperCase() as 'R1' | 'R2' | 'R3' | 'R4';
  }
  return undefined;
}

/**
 * Check if filename contains RATT indicator
 */
export function isRATTSource(filename: string): boolean {
  return /RATT/i.test(filename);
}

/**
 * Extract course string from filename
 * Examples:
 * - "Cytokines, Chimiokines et leurs récepteurs_questions_2012.json"
 *   -> "Cytokines, Chimiokines et leurs récepteurs"
 * - "Les lymphocytes B et les Immunoglobulines_questions_2021_RATT.json"
 *   -> "Les lymphocytes B et les Immunoglobulines"
 * - "Les_molécules_d'adhésion_cellulaire_et_la_réaction_inflammatoire_questions_2019_RATT_R2.json"
 *   -> "Les molécules d'adhésion cellulaire et la réaction inflammatoire"
 *
 * Strategy:
 * 1. Remove file extension
 * 2. Split by "_questions_" to get course name part
 * 3. Replace underscores with spaces
 * 4. Clean up and normalize
 */
export function extractCourseString(filename: string): string | undefined {
  // Remove file extension
  let name = filename.replace(/\.json$/i, '');

  // Split by _questions_ to get the course name part
  const parts = name.split(/_questions_/i);
  if (parts.length > 0 && parts[0]) {
    // Replace underscores with spaces and clean up
    let courseName = parts[0]
      .replace(/_/g, ' ')
      .trim();

    // Normalize spaces
    courseName = courseName.replace(/\s+/g, ' ');

    return courseName || undefined;
  }

  // Fallback to old logic if _questions_ pattern not found
  // Remove year if present
  name = name.replace(/[_\-\s]?\d{4}[_\-\s]?/g, '_');

  // Remove rotation if present
  name = name.replace(/[_\-\s]?R[1-4][_\-\s]?/gi, '_');

  // Remove RATT if present
  name = name.replace(/[_\-\s]?RATT[_\-\s]?/gi, '_');

  // Remove common words
  name = name.replace(/[_\-\s]?(questions?|exam|test|quiz)[_\-\s]?/gi, '_');

  // Clean up multiple underscores/dashes/spaces
  name = name.replace(/[_\-\s]+/g, ' ');

  // Trim spaces from start and end
  name = name.trim();

  // If we have something left, return it
  if (name && name.length > 0) {
    return name;
  }

  return undefined;
}

/**
 * Parse all metadata from filename
 */
export function parseFilenameMetadata(filename: string): ParsedFilenameMetadata {
  const examYear = extractExamYear(filename);
  const courseString = extractCourseString(filename);
  const rotation = extractRotation(filename);
  const isRATT = isRATTSource(filename);
  
  return {
    examYear,
    courseString,
    rotation,
    isRATT,
    sourceId: isRATT ? 4 : undefined, // RATT source ID is 4
  };
}

/**
 * Fuzzy match course name
 * Returns a score between 0 and 1 indicating match quality
 */
export function fuzzyMatchCourse(
  searchString: string,
  courseName: string
): number {
  const search = searchString.toLowerCase().trim();
  const name = courseName.toLowerCase().trim();
  
  // Exact match
  if (search === name) {
    return 1.0;
  }
  
  // Contains match
  if (name.includes(search) || search.includes(name)) {
    return 0.8;
  }
  
  // Remove accents and special characters for comparison
  const normalizeString = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };
  
  const normalizedSearch = normalizeString(search);
  const normalizedName = normalizeString(name);
  
  // Normalized exact match
  if (normalizedSearch === normalizedName) {
    return 0.9;
  }
  
  // Normalized contains match
  if (normalizedName.includes(normalizedSearch) || normalizedSearch.includes(normalizedName)) {
    return 0.7;
  }
  
  // Word-by-word matching
  const searchWords = normalizedSearch.split(' ');
  const nameWords = normalizedName.split(' ');
  
  let matchedWords = 0;
  for (const searchWord of searchWords) {
    if (nameWords.some(nameWord => nameWord.includes(searchWord) || searchWord.includes(nameWord))) {
      matchedWords++;
    }
  }
  
  if (matchedWords > 0) {
    return (matchedWords / Math.max(searchWords.length, nameWords.length)) * 0.6;
  }
  
  return 0;
}

/**
 * Find best matching course from a list
 * Returns the course with the highest match score above threshold
 */
export function findBestMatchingCourse<T extends { id: number; name: string }>(
  searchString: string,
  courses: T[],
  threshold: number = 0.7
): T | null {
  if (!searchString || courses.length === 0) {
    return null;
  }
  
  let bestMatch: T | null = null;
  let bestScore = threshold;
  
  for (const course of courses) {
    const score = fuzzyMatchCourse(searchString, course.name);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = course;
    }
  }
  
  return bestMatch;
}

/**
 * Get courses from the currently selected module
 * This is used when we need to show a dropdown for manual course selection
 */
export function getCoursesFromModule(
  moduleId: number | undefined,
  filtersData: any
): Array<{ id: number; name: string; description: string }> {
  if (!moduleId || !filtersData) {
    return [];
  }
  
  // Check in unites
  if (filtersData.unites) {
    for (const unite of filtersData.unites) {
      if (unite.modules) {
        const module = unite.modules.find((m: any) => m.id === moduleId);
        if (module?.courses) {
          return module.courses;
        }
      }
    }
  }
  
  // Check in independent modules
  if (filtersData.independentModules) {
    const module = filtersData.independentModules.find((m: any) => m.id === moduleId);
    if (module?.courses) {
      return module.courses;
    }
  }
  
  return [];
}

/**
 * Get all courses from filters data (for fuzzy matching)
 */
export function getAllCoursesFromFilters(
  filtersData: any
): Array<{ id: number; name: string; description: string }> {
  const courses: Array<{ id: number; name: string; description: string }> = [];
  
  // Get courses from unites
  if (filtersData.unites) {
    for (const unite of filtersData.unites) {
      if (unite.modules) {
        for (const module of unite.modules) {
          if (module.courses) {
            courses.push(...module.courses);
          }
        }
      }
    }
  }
  
  // Get courses from independent modules
  if (filtersData.independentModules) {
    for (const module of filtersData.independentModules) {
      if (module.courses) {
        courses.push(...module.courses);
      }
    }
  }
  
  return courses;
}

/**
 * Normalize course name for grouping
 * - Convert to lowercase
 * - Remove accents
 * - Remove special characters
 * - Normalize spaces
 */
export function normalizeCourseNameForGrouping(courseName: string): string {
  return courseName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Group files by course name
 * Returns array of groups, each containing file indices that belong together
 */
export function groupFilesByCourseName(filenames: string[]): Array<{
  groupKey: string;
  displayName: string;
  fileIndices: number[];
}> {
  const groupsMap = new Map<string, number[]>();

  filenames.forEach((filename, index) => {
    const courseString = extractCourseString(filename);
    if (courseString) {
      const normalized = normalizeCourseNameForGrouping(courseString);
      if (!groupsMap.has(normalized)) {
        groupsMap.set(normalized, []);
      }
      groupsMap.get(normalized)!.push(index);
    } else {
      // Files without detectable course name go into individual groups
      groupsMap.set(`__ungrouped_${index}__`, [index]);
    }
  });

  // Convert map to array of groups
  const groups: Array<{
    groupKey: string;
    displayName: string;
    fileIndices: number[];
  }> = [];

  groupsMap.forEach((fileIndices, groupKey) => {
    let displayName = groupKey;

    // For ungrouped files, use the filename as display name
    if (groupKey.startsWith('__ungrouped_')) {
      const fileIndex = fileIndices[0];
      displayName = filenames[fileIndex] || 'Unknown';
    } else {
      // Use the course string from the first file in the group
      const firstFileIndex = fileIndices[0];
      const firstFilename = filenames[firstFileIndex];
      if (firstFilename) {
        const courseString = extractCourseString(firstFilename);
        if (courseString) {
          displayName = courseString;
        }
      }
    }

    groups.push({
      groupKey,
      displayName,
      fileIndices
    });
  });

  return groups;
}

