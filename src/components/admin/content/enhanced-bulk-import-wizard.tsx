'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  FileText,
  Loader2,
  Info
} from 'lucide-react';
import { EnhancedBulkFileUpload } from './enhanced-bulk-file-upload';
import { GroupedFileList } from './grouped-file-list';
import { useQuestionSources } from '@/hooks/admin/use-question-sources';
import {
  BulkImportFile,
  BulkImportComponentProps,
  BulkImportResponse,
  GlobalMetadata,
  FileGroupMetadata
} from '@/types/question-import';
import {
  validateAllFiles,
  areAllFilesValid,
  getValidationSummary
} from '@/utils/bulk-import-validation';
import {
  updateGlobalMetadata,
  updateGroupMetadata,
  updateFileMetadata as applyFileMetadata
} from '@/utils/metadata-hierarchy';
import { getCoursesFromModule } from '@/utils/filename-parser';
import { UniversityService, AdminCourseResourcesService } from '@/lib/api-services';
import { toast } from 'sonner';

export function EnhancedBulkImportWizard({
  selection,
  onImportComplete,
  onCancel
}: BulkImportComponentProps) {
  const [files, setFiles] = useState<BulkImportFile[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [completedFiles, setCompletedFiles] = useState(0);
  const [filtersData, setFiltersData] = useState<any>(null);
  const [globalMetadata, setGlobalMetadata] = useState<GlobalMetadata>({});
  const [groupsMetadata, setGroupsMetadata] = useState<Map<string, FileGroupMetadata>>(new Map());

  // Use question sources hook
  const {
    questionSources,
    loading: sourcesLoading,
    error: sourcesError
  } = useQuestionSources();

  // Fetch filters data for course matching
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await AdminCourseResourcesService.getAdminContentFilters();
        if (response.success && response.data) {
          setFiltersData(response.data);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
        toast.error('Failed to load course data');
      }
    };
    fetchFilters();
  }, []);

  // Validate files when they change
  useEffect(() => {
    const validateFiles = async () => {
      if (files.length === 0) return;
      
      // Only validate files that are pending or have been modified
      const filesToValidate = files.filter(f => 
        f.status === 'pending' || 
        (f.status === 'invalid' && f.examYear && f.courseId && f.sourceId)
      );
      
      if (filesToValidate.length === 0) return;

      setIsValidating(true);
      
      try {
        const validatedFiles = await validateAllFiles(files);
        setFiles(validatedFiles);
      } catch (error) {
        console.error('Validation error:', error);
        toast.error('Error validating files');
      } finally {
        setIsValidating(false);
      }
    };

    // Debounce validation
    const timeoutId = setTimeout(validateFiles, 500);
    return () => clearTimeout(timeoutId);
  }, [files]);

  // Handle import
  const handleImport = useCallback(async () => {
    if (!areAllFilesValid(files)) {
      toast.error('Please fix all validation errors before importing');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setCompletedFiles(0);

    const results: BulkImportResponse[] = [];
    const totalFiles = files.length;

    try {
      // Import each file separately
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update file status to uploading
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'uploading' } : f
        ));

        try {
          // Prepare request payload with per-file metadata
          const payload = {
            metadata: {
              courseId: file.courseId!,
              universityId: selection.university?.id,
              studyPackId: selection.studyPack?.id,
              unitId: selection.unit?.id,
              moduleId: selection.module?.id || selection.independentModule?.id,
              examYear: file.examYear!,
              sourceId: file.sourceId!,
              rotation: file.rotation
            },
            questions: file.parsedQuestions!
          };

          // Make API call using the existing API service
          const result = await UniversityService.bulkImportQuestions(payload);

          // Check if the API call was successful
          if (result.success) {
            // Update file status to success
            setFiles(prev => prev.map(f =>
              f.id === file.id ? { ...f, status: 'success' } : f
            ));

            results.push({
              fileId: file.id,
              success: true,
              data: result.data
            });

            setCompletedFiles(i + 1);
            setImportProgress(((i + 1) / totalFiles) * 100);
          } else {
            throw new Error('API returned unsuccessful response');
          }
        } catch (error) {
          console.error(`Error importing file ${file.filename}:`, error);
          
          // Update file status to error
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { 
              ...f, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Import failed'
            } : f
          ));

          results.push({
            fileId: file.id,
            success: false,
            error: error instanceof Error ? error.message : 'Import failed'
          });

          setCompletedFiles(i + 1);
          setImportProgress(((i + 1) / totalFiles) * 100);
        }
      }

      // Show summary
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} file(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to import ${failCount} file(s)`);
      }

      // Call completion callback
      if (onImportComplete) {
        onImportComplete(results);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import process failed');
    } finally {
      setIsImporting(false);
    }
  }, [files, selection, onImportComplete]);

  // Handle global metadata update
  const handleGlobalMetadataUpdate = useCallback((updates: GlobalMetadata) => {
    setGlobalMetadata(prev => ({ ...prev, ...updates }));
    setFiles(prev => updateGlobalMetadata(prev, updates));
  }, []);

  // Handle group metadata update
  const handleGroupMetadataUpdate = useCallback((groupKey: string, updates: any) => {
    setGroupsMetadata(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(groupKey) || {
        groupKey,
        displayName: groupKey,
        fileIds: files.filter(f => f.groupKey === groupKey).map(f => f.id)
      };
      newMap.set(groupKey, { ...existing, ...updates });
      return newMap;
    });
    setFiles(prev => updateGroupMetadata(prev, groupKey, updates));
  }, [files]);

  // Handle file metadata update
  const handleFileMetadataUpdate = useCallback((fileId: string, updates: Partial<BulkImportFile>) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        // Extract metadata updates
        const metadataUpdates: any = {};
        if (updates.examYear !== undefined) metadataUpdates.examYear = updates.examYear;
        if (updates.courseId !== undefined) metadataUpdates.courseId = updates.courseId;
        if (updates.sourceId !== undefined) metadataUpdates.sourceId = updates.sourceId;
        if (updates.rotation !== undefined) metadataUpdates.rotation = updates.rotation;

        // Apply with proper source tracking
        return applyFileMetadata(f, metadataUpdates);
      }
      return f;
    }));
  }, []);

  // Handle file removal
  const handleFileRemove = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Get available courses from the selected module only
  const moduleId = selection.module?.id || selection.independentModule?.id;
  const availableCourses = filtersData && moduleId
    ? getCoursesFromModule(moduleId, filtersData)
    : [];

  // Get validation summary
  const validationSummary = getValidationSummary(files);
  const canImport = areAllFilesValid(files) && !isImporting && !isValidating;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Bulk Import Questions</h2>
          <p className="text-muted-foreground">
            Import multiple JSON files with automatic metadata detection
          </p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      {/* File Upload Component */}
      <EnhancedBulkFileUpload
        files={files}
        onFilesChange={setFiles}
        questionSources={questionSources}
        filtersData={filtersData}
        selection={selection}
      />

      {/* Grouped File List */}
      {files.length > 0 && (
        <GroupedFileList
          files={files}
          questionSources={questionSources}
          availableCourses={availableCourses}
          onFileUpdate={handleFileMetadataUpdate}
          onFileRemove={handleFileRemove}
          onGroupUpdate={handleGroupMetadataUpdate}
          onGlobalUpdate={handleGlobalMetadataUpdate}
        />
      )}

      {/* Validation Summary */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Import Summary
            </CardTitle>
            <CardDescription>
              Review the validation status before importing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">{validationSummary.totalFiles}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valid Files</p>
                <p className="text-2xl font-bold text-green-600">
                  {validationSummary.validFiles}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Invalid Files</p>
                <p className="text-2xl font-bold text-red-600">
                  {validationSummary.invalidFiles}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {validationSummary.totalQuestions}
                </p>
              </div>
            </div>

            {/* Warnings */}
            {(validationSummary.filesWithoutYear > 0 || 
              validationSummary.filesWithoutCourse > 0 || 
              validationSummary.filesWithoutSource > 0) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationSummary.filesWithoutYear > 0 && (
                      <li>{validationSummary.filesWithoutYear} file(s) missing exam year</li>
                    )}
                    {validationSummary.filesWithoutCourse > 0 && (
                      <li>{validationSummary.filesWithoutCourse} file(s) missing course</li>
                    )}
                    {validationSummary.filesWithoutSource > 0 && (
                      <li>{validationSummary.filesWithoutSource} file(s) missing source</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {isImporting && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
            <CardDescription>
              {completedFiles} of {files.length} files completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={importProgress} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {files.length > 0 && (
        <div className="flex justify-end gap-4">
          <Button
            onClick={handleImport}
            disabled={!canImport}
            size="lg"
            className="min-w-[200px]"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Start Import
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

