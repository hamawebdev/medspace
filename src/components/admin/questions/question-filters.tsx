'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';
import { AdminQuestionFilters, QuestionCreationUnit, QuestionCreationModule, QuestionCreationCourse } from '@/types/api';
import { AdminService } from '@/lib/api-services';

interface QuestionFiltersProps {
  filters: AdminQuestionFilters;
  onFiltersChange: (filters: Partial<AdminQuestionFilters>) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

interface University {
  id: number;
  name: string;
  country: string;
}

interface StudyPack {
  id: number;
  name: string;
  yearNumber: string;
  type: 'YEAR' | 'RESIDENCY';
}

export default function QuestionFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  hasFilters,
}: QuestionFiltersProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [studyPacks, setStudyPacks] = useState<StudyPack[]>([]);
  const [units, setUnits] = useState<QuestionCreationUnit[]>([]);
  const [independentModules, setIndependentModules] = useState<QuestionCreationModule[]>([]);
  const [availableModules, setAvailableModules] = useState<QuestionCreationModule[]>([]);
  const [availableCourses, setAvailableCourses] = useState<QuestionCreationCourse[]>([]);
  const [examYears, setExamYears] = useState<number[]>([]);
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Load filter data
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setLoadingData(true);

        // Load universities
        const universitiesResponse = await AdminService.getUniversitiesForQuestions();
        if (universitiesResponse.success && universitiesResponse.data?.universities) {
          setUniversities(universitiesResponse.data.universities);
        }

        // Load study packs for years
        const studyPacksResponse = await AdminService.getStudyPacksForQuestions();
        if (studyPacksResponse.success && studyPacksResponse.data?.studyPacks) {
          setStudyPacks(studyPacksResponse.data.studyPacks);
        }

        // Load hierarchical content filters
        const contentResponse = await AdminService.getQuestionContentFilters();
        if (contentResponse.success && contentResponse.data) {
          setUnits(contentResponse.data.units || []);
          setIndependentModules(contentResponse.data.independentModules || []);
        }

        // Load exam years and question types
        const filtersResponse = await AdminService.getQuestionFilters();
        if (filtersResponse.success && filtersResponse.data?.filters) {
          setExamYears(filtersResponse.data.filters.examYears || []);
          setQuestionTypes(filtersResponse.data.filters.questionTypes || []);
        }
      } catch (error) {
        console.error('Failed to load filter data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadFilterData();
  }, []);

  // Handle cascading updates when unit filter changes
  useEffect(() => {
    if (filters.unitId) {
      const selectedUnit = units.find(u => u.id === filters.unitId);
      setAvailableModules(selectedUnit?.modules || []);
      setAvailableCourses([]);
    } else {
      setAvailableModules([]);
      setAvailableCourses([]);
    }
  }, [filters.unitId, units]);

  // Handle cascading updates when module filter changes
  useEffect(() => {
    if (filters.moduleId) {
      let selectedModule: QuestionCreationModule | undefined;

      // Find module in units or independent modules
      for (const unit of units) {
        const module = unit.modules.find(m => m.id === filters.moduleId);
        if (module) {
          selectedModule = module;
          break;
        }
      }

      if (!selectedModule) {
        selectedModule = independentModules.find(m => m.id === filters.moduleId);
      }

      setAvailableCourses(selectedModule?.courses || []);
    } else {
      setAvailableCourses([]);
    }
  }, [filters.moduleId, units, independentModules]);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  // Hierarchical selection handlers
  const handleUnitChange = (value: string) => {
    const unitId = value === 'all' ? undefined : parseInt(value);
    const selectedUnit = units.find(u => u.id === unitId);

    onFiltersChange({
      unitId,
      moduleId: undefined,
      courseId: undefined
    });

    setAvailableModules(selectedUnit?.modules || []);
    setAvailableCourses([]);
  };

  const handleModuleChange = (value: string) => {
    const moduleId = value === 'all' ? undefined : parseInt(value);
    let selectedModule: QuestionCreationModule | undefined;

    // Find module in units or independent modules
    for (const unit of units) {
      const module = unit.modules.find(m => m.id === moduleId);
      if (module) {
        selectedModule = module;
        break;
      }
    }

    if (!selectedModule) {
      selectedModule = independentModules.find(m => m.id === moduleId);
    }

    onFiltersChange({
      moduleId,
      courseId: undefined
    });

    setAvailableCourses(selectedModule?.courses || []);
  };

  const handleCourseChange = (value: string) => {
    onFiltersChange({
      courseId: value === 'all' ? undefined : parseInt(value)
    });
  };

  const handleUniversityChange = (value: string) => {
    onFiltersChange({
      universityId: value === 'all' ? undefined : parseInt(value)
    });
  };

  const handleQuestionTypeChange = (value: string) => {
    onFiltersChange({
      questionType: value === 'all'
        ? undefined
        : (value === 'SINGLE_CHOICE' ? 'SINGLE_CHOICE' : 'MULTIPLE_CHOICE')
    });
  };

  const handleYearLevelChange = (value: string) => {
    onFiltersChange({
      yearLevel: value === 'all' ? undefined : value
    });
  };

  const handleExamYearChange = (value: string) => {
    onFiltersChange({
      examYear: value === 'all' ? undefined : parseInt(value)
    });
  };

  // Handle direct module dropdown click (show independent modules)
  const handleModuleDropdownClick = () => {
    if (!filters.unitId) {
      setLoadingModules(true);
      setAvailableModules(independentModules);
      setLoadingModules(false);
    }
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      isActive: value === 'all' ? undefined : value === 'active'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.unitId) count++;
    if (filters.moduleId) count++;
    if (filters.courseId) count++;
    if (filters.universityId) count++;
    if (filters.questionType) count++;
    if (filters.yearLevel) count++;
    if (filters.examYear) count++;
    if (filters.isActive !== undefined) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Questions</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by question text..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Hierarchical Filter Controls */}
      <div className="space-y-4">
        {/* Content Hierarchy Filters */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Unit Filter */}
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select
              value={filters.unitId?.toString() || 'all'}
              onValueChange={handleUnitChange}
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingData ? "Loading..." : "All units"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name} ({unit.studyPack.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Module Filter */}
          <div className="space-y-2">
            <Label>Module</Label>
            <Select
              value={filters.moduleId?.toString() || 'all'}
              onValueChange={handleModuleChange}
              disabled={loadingData || loadingModules}
              onOpenChange={(open) => {
                if (open && !filters.unitId) {
                  handleModuleDropdownClick();
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingData || loadingModules ? "Loading..." :
                  availableModules.length === 0 ? "Select unit first or click to see independent modules" :
                  "All modules"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {availableModules.map((module) => (
                  <SelectItem key={module.id} value={module.id.toString()}>
                    {module.name}
                    {module.studyPack ? ' (' + module.studyPack.name + ')' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Course Filter */}
          <div className="space-y-2">
            <Label>Course</Label>
            <Select
              value={filters.courseId?.toString() || 'all'}
              onValueChange={handleCourseChange}
              disabled={loadingData || loadingCourses || availableCourses.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingData || loadingCourses ? "Loading..." :
                  availableCourses.length === 0 ? "Select module first" :
                  "All courses"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {availableCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Other Filters */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* University Filter */}
          <div className="space-y-2">
            <Label>University</Label>
            <Select
              value={filters.universityId?.toString() || 'all'}
              onValueChange={handleUniversityChange}
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingData ? "Loading..." : "All universities"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {universities.map((university) => (
                  <SelectItem key={university.id} value={university.id.toString()}>
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Type Filter */}
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={filters.questionType || 'all'}
              onValueChange={handleQuestionTypeChange}
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingData ? "Loading..." : "All types"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {questionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'SINGLE_CHOICE' ? 'Single Choice' : 'Multiple Choice'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Level Filter */}
          <div className="space-y-2">
            <Label>Year Level</Label>
            <Select
              value={filters.yearLevel || 'all'}
              onValueChange={handleYearLevelChange}
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingData ? "Loading..." : "All years"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {studyPacks.map((pack) => (
                  <SelectItem key={pack.id} value={pack.yearNumber}>
                    {pack.name} ({pack.yearNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Year Filter */}
          <div className="space-y-2">
            <Label>Exam Year</Label>
            <Select
              value={filters.examYear?.toString() || 'all'}
              onValueChange={handleExamYearChange}
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingData ? "Loading..." : "All exam years"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exam Years</SelectItem>
              {examYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={
                filters.isActive === undefined
                  ? 'all'
                  : filters.isActive
                    ? 'active'
                    : 'inactive'
              }
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>


      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Active filters:</span>

          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ search: '' })}
              />
            </Badge>
          )}

          {filters.unitId && (
            <Badge variant="secondary" className="gap-1">
              Unit: {units.find(u => u.id === filters.unitId)?.name || 'Unknown'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ unitId: undefined })}
              />
            </Badge>
          )}

          {filters.moduleId && (
            <Badge variant="secondary" className="gap-1">
              Module: {
                (() => {
                  // Find module in units or independent modules
                  for (const unit of units) {
                    const module = unit.modules.find(m => m.id === filters.moduleId);
                    if (module) return module.name;
                  }
                  const independentModule = independentModules.find(m => m.id === filters.moduleId);
                  return independentModule?.name || 'Unknown';
                })()
              }
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ moduleId: undefined })}
              />
            </Badge>
          )}

          {filters.courseId && (
            <Badge variant="secondary" className="gap-1">
              Course: {availableCourses.find(c => c.id === filters.courseId)?.name || 'Unknown'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ courseId: undefined })}
              />
            </Badge>
          )}

          {filters.universityId && (
            <Badge variant="secondary" className="gap-1">
              University: {universities.find(u => u.id === filters.universityId)?.name || 'Unknown'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ universityId: undefined })}
              />
            </Badge>
          )}

          {filters.questionType && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.questionType === 'SINGLE_CHOICE' ? 'Single Choice' : 'Multiple Choice'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ questionType: undefined })}
              />
            </Badge>
          )}

          {filters.yearLevel && (
            <Badge variant="secondary" className="gap-1">
              Year: {filters.yearLevel}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ yearLevel: undefined })}
              />
            </Badge>
          )}

          {filters.examYear && (
            <Badge variant="secondary" className="gap-1">
              Exam Year: {filters.examYear}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ examYear: undefined })}
              />
            </Badge>
          )}

          {filters.isActive !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.isActive ? 'Active' : 'Inactive'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ isActive: undefined })}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Clear Filters Button */}
      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear All Filters ({activeFiltersCount})
          </Button>
        </div>
      )}
    </div>
  );
}

export type { QuestionFiltersProps };

export { QuestionFilters };
