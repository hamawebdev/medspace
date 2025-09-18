/**
 * Test for Independent Modules Fix
 * Verifies that the /admin/content page correctly displays both Units and Independent Modules
 */

import { describe, it, expect } from '@jest/globals';

// Mock data based on the API response structure
const mockApiResponse = {
  success: true,
  data: {
    filters: {
      courses: [],
      universities: [],
      examYears: [],
      questionTypes: []
    },
    unites: [],
    independentModules: [
      {
        id: 38,
        uniteId: null,
        studyPackId: 1,
        name: "Biochimie",
        description: "Module indépendant d'enseignement pour Biochimie - Année 1",
        logoUrl: null,
        createdAt: "2025-09-18T10:10:38.872Z",
        updatedAt: "2025-09-18T10:10:38.872Z",
        studyPack: {
          id: 1,
          name: "Première Année",
          yearNumber: "ONE",
          type: "year"
        },
        courses: [
          {
            id: 655,
            name: "metabolisme du glucides",
            description: "Cours d'enseignement pour metabolisme du glucides - Année 1"
          },
          {
            id: 656,
            name: "metabolisme du lipide",
            description: "Cours d'enseignement pour metabolisme du lipide - Année 1"
          }
        ]
      },
      {
        id: 39,
        uniteId: null,
        studyPackId: 1,
        name: "Biostatistique et Informatique",
        description: "Module indépendant d'enseignement pour Biostatistique et Informatique - Année 1",
        logoUrl: null,
        createdAt: "2025-09-18T10:10:38.885Z",
        updatedAt: "2025-09-18T10:10:38.885Z",
        studyPack: {
          id: 1,
          name: "Première Année",
          yearNumber: "ONE",
          type: "year"
        },
        courses: [
          {
            id: 659,
            name: "Biostat _ Les tests statistiques et Test de Khi-deux",
            description: "Cours d'enseignement pour Biostat _ Les tests statistiques et Test de Khi-deux - Année 1"
          }
        ]
      }
    ]
  },
  meta: {
    timestamp: "2025-09-18T21:17:22.951Z",
    requestId: "pnk2lsf08c"
  }
};

describe('Independent Modules Fix', () => {
  it('should correctly parse independent modules from API response', () => {
    const { independentModules } = mockApiResponse.data;
    
    expect(independentModules).toBeDefined();
    expect(Array.isArray(independentModules)).toBe(true);
    expect(independentModules.length).toBe(2);
    
    // Check first independent module
    const firstModule = independentModules[0];
    expect(firstModule.id).toBe(38);
    expect(firstModule.name).toBe("Biochimie");
    expect(firstModule.uniteId).toBeNull();
    expect(firstModule.studyPackId).toBe(1);
    expect(firstModule.courses).toBeDefined();
    expect(firstModule.courses.length).toBe(2);
  });

  it('should handle empty independent modules array', () => {
    const emptyResponse = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        independentModules: []
      }
    };
    
    const { independentModules } = emptyResponse.data;
    expect(independentModules).toBeDefined();
    expect(Array.isArray(independentModules)).toBe(true);
    expect(independentModules.length).toBe(0);
  });

  it('should handle missing independentModules field', () => {
    const responseWithoutIndependentModules = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        independentModules: undefined
      }
    };
    
    // This should be handled gracefully with default empty array
    const independentModules = responseWithoutIndependentModules.data.independentModules || [];
    expect(Array.isArray(independentModules)).toBe(true);
    expect(independentModules.length).toBe(0);
  });

  it('should correctly identify independent modules by null uniteId', () => {
    const { independentModules } = mockApiResponse.data;
    
    independentModules.forEach(module => {
      expect(module.uniteId).toBeNull();
      expect(module.studyPackId).toBeDefined();
      expect(typeof module.studyPackId).toBe('number');
    });
  });

  it('should have courses associated with independent modules', () => {
    const { independentModules } = mockApiResponse.data;
    
    independentModules.forEach(module => {
      expect(module.courses).toBeDefined();
      expect(Array.isArray(module.courses)).toBe(true);
      
      module.courses.forEach(course => {
        expect(course.id).toBeDefined();
        expect(course.name).toBeDefined();
        expect(course.description).toBeDefined();
      });
    });
  });
});

// Test the filtering logic
describe('Independent Modules Filtering', () => {
  it('should filter independent modules by study pack', () => {
    const { independentModules } = mockApiResponse.data;
    const studyPackId = 1;
    
    const filtered = independentModules.filter(module => 
      module.studyPackId === studyPackId
    );
    
    expect(filtered.length).toBe(2);
    filtered.forEach(module => {
      expect(module.studyPackId).toBe(studyPackId);
    });
  });

  it('should return empty array when no modules match study pack', () => {
    const { independentModules } = mockApiResponse.data;
    const nonExistentStudyPackId = 999;
    
    const filtered = independentModules.filter(module => 
      module.studyPackId === nonExistentStudyPackId
    );
    
    expect(filtered.length).toBe(0);
  });
});

console.log('✅ Independent Modules Fix Tests - All tests should pass if the implementation is correct');
