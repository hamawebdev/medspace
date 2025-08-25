'use client';

import { useState, useEffect } from 'react';
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
import { AdminQuestionFilters } from '@/types/api';
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

interface Course {
  id: number;
  name: string;
  module: {
    id: number;
    name: string;
    unite: {
      id: number;
      name: string;
      studyPack: {
        id: number;
        name: string;
      };
    };
  };
}

export function QuestionFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  hasFilters,
}: QuestionFiltersProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [examYears, setExamYears] = useState<number[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load filter data
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setLoadingData(true);
        const response = await AdminService.getQuestionFilters();
        
        if (response.success && response.data?.filters) {
          setUniversities(response.data.filters.universities || []);
          setCourses(response.data.filters.courses || []);
          setExamYears(response.data.filters.examYears || []);
        }
      } catch (error) {
        console.error('Failed to load filter data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadFilterData();
  }, []);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
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
      questionType: value === 'all' ? undefined : value as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
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

  const handleStatusChange = (value: string) => {
    onFiltersChange({ 
      isActive: value === 'all' ? undefined : value === 'active' 
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
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

      {/* Filter Controls */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Course Filter */}
        <div className="space-y-2">
          <Label>Course</Label>
          <Select
            value={filters.courseId?.toString() || 'all'}
            onValueChange={handleCourseChange}
            disabled={loadingData}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingData ? "Loading..." : "All courses"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Year Level Filter */}
        <div className="space-y-2">
          <Label>Year Level</Label>
          <Select
            value={filters.yearLevel || 'all'}
            onValueChange={handleYearLevelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="ONE">Year 1</SelectItem>
              <SelectItem value="TWO">Year 2</SelectItem>
              <SelectItem value="THREE">Year 3</SelectItem>
              <SelectItem value="FOUR">Year 4</SelectItem>
              <SelectItem value="FIVE">Year 5</SelectItem>
              <SelectItem value="SIX">Year 6</SelectItem>
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
              <SelectValue placeholder={loadingData ? "Loading..." : "All years"} />
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
          
          {filters.courseId && (
            <Badge variant="secondary" className="gap-1">
              Course: {courses.find(c => c.id === filters.courseId)?.name || 'Unknown'}
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
