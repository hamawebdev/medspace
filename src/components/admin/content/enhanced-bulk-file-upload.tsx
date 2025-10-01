'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Calendar,
  Edit2,
  X,
  BookOpen,
  Tag,
  RotateCw
} from 'lucide-react';
import { BulkImportFile } from '@/types/question-import';
import {
  parseFilenameMetadata,
  findBestMatchingCourse,
  getCoursesFromModule,
  getAllCoursesFromFilters,
  groupFilesByCourseName
} from '@/utils/filename-parser';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EnhancedBulkFileUploadProps {
  files: BulkImportFile[];
  onFilesChange: (files: BulkImportFile[]) => void;
  disabled?: boolean;
  selection: any; // SelectionState from question-import types
  filtersData: any; // Content filters data
  questionSources: Array<{ id: number; name: string }>;
}

export function EnhancedBulkFileUpload({ 
  files, 
  onFilesChange, 
  disabled,
  selection,
  filtersData,
  questionSources
}: EnhancedBulkFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [yearInput, setYearInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID for file
  const generateFileId = useCallback(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  // Auto-detect metadata from filename
  const detectMetadata = useCallback((filename: string): Partial<BulkImportFile> => {
    const metadata = parseFilenameMetadata(filename);

    // Get courses from selected module only for fuzzy matching
    const moduleId = selection.module?.id || selection.independentModule?.id;
    const moduleCourses = moduleId && filtersData
      ? getCoursesFromModule(moduleId, filtersData)
      : [];

    // Try to find matching course
    let courseId: number | undefined;
    let courseName: string | undefined;
    let needsCourseSelection = false;

    if (metadata.courseString && moduleCourses.length > 0) {
      const matchedCourse = findBestMatchingCourse(metadata.courseString, moduleCourses, 0.7);
      if (matchedCourse) {
        courseId = matchedCourse.id;
        courseName = matchedCourse.name;
      } else {
        // No good match found, user needs to select manually
        needsCourseSelection = true;
      }
    } else {
      needsCourseSelection = true;
    }

    // Determine if source selection is needed
    const needsSourceSelection = !metadata.isRATT;

    return {
      examYear: metadata.examYear,
      courseId,
      courseName,
      sourceId: metadata.sourceId,
      rotation: metadata.rotation,
      needsCourseSelection,
      needsSourceSelection
    };
  }, [filtersData, selection]);

  // Handle file selection
  const handleFiles = useCallback((fileList: FileList) => {
    const fileArray = Array.from(fileList).filter(file => file.name.endsWith('.json'));

    // Group files by course name
    const filenames = fileArray.map(f => f.name);
    const groups = groupFilesByCourseName(filenames);

    const newFiles: BulkImportFile[] = fileArray.map((file, index) => {
      const detectedMetadata = detectMetadata(file.name);

      // Find which group this file belongs to
      const group = groups.find(g => g.fileIndices.includes(index));

      return {
        id: generateFileId(),
        file,
        filename: file.name,
        groupKey: group?.groupKey,
        ...detectedMetadata,
        isValid: false,
        status: 'pending' as const,
        metadataSource: {
          examYear: detectedMetadata.examYear ? 'auto' : undefined,
          courseId: detectedMetadata.courseId ? 'auto' : undefined,
          sourceId: detectedMetadata.sourceId ? 'auto' : undefined,
          rotation: detectedMetadata.rotation ? 'auto' : undefined,
        }
      };
    });

    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange, detectMetadata, generateFileId]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  }, [handleFiles]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  }, [files, onFilesChange]);

  // Update file metadata
  const updateFileMetadata = useCallback((fileId: string, updates: Partial<BulkImportFile>) => {
    onFilesChange(files.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  }, [files, onFilesChange]);

  // Handle year edit
  const handleYearEdit = useCallback((fileId: string, currentYear?: number) => {
    setEditingYear(fileId);
    setYearInput(currentYear?.toString() || '');
  }, []);

  // Save year edit
  const saveYearEdit = useCallback(() => {
    if (editingYear && yearInput) {
      const year = parseInt(yearInput);
      const currentYear = new Date().getFullYear();
      
      if (year >= 1900 && year <= currentYear && yearInput.length === 4) {
        updateFileMetadata(editingYear, { examYear: year });
        setEditingYear(null);
        setYearInput('');
      }
    }
  }, [editingYear, yearInput, updateFileMetadata]);

  // Cancel year edit
  const cancelYearEdit = useCallback(() => {
    setEditingYear(null);
    setYearInput('');
  }, []);

  // Get status icon
  const getStatusIcon = (file: BulkImportFile) => {
    switch (file.status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'invalid':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'validating':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  // Get courses for dropdown (from selected module)
  const getAvailableCourses = useCallback(() => {
    if (selection.module) {
      return getCoursesFromModule(selection.module.id, filtersData);
    } else if (selection.independentModule) {
      return getCoursesFromModule(selection.independentModule.id, filtersData);
    }
    return [];
  }, [selection, filtersData]);

  const availableCourses = getAvailableCourses();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload JSON Files</CardTitle>
          <CardDescription>
            Select or drag and drop multiple .json files. Metadata will be automatically detected from filenames.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dragActive ? 'Drop files here' : 'Choose files or drag and drop'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              JSON files only. Multiple files supported. Metadata auto-detected from filenames.
            </p>
            <Button variant="outline" disabled={disabled}>
              Select Files
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".json"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </div>
  );
}

