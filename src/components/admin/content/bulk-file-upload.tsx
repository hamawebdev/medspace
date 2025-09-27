'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit2,
  Calendar
} from 'lucide-react';
import { BulkImportFile } from '@/types/question-import';

interface BulkFileUploadProps {
  files: BulkImportFile[];
  onFilesChange: (files: BulkImportFile[]) => void;
  disabled?: boolean;
}

export function BulkFileUpload({ files, onFilesChange, disabled }: BulkFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [yearInput, setYearInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract exam year from filename using regex
  const extractExamYear = useCallback((filename: string): number | undefined => {
    const yearMatch = filename.match(/(\d{4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      const currentYear = new Date().getFullYear();
      if (year >= 1900 && year <= currentYear) {
        return year;
      }
    }
    return undefined;
  }, []);

  // Generate unique ID for file
  const generateFileId = useCallback(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  // Handle file selection
  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: BulkImportFile[] = Array.from(fileList)
      .filter(file => file.name.endsWith('.json'))
      .map(file => {
        const examYear = extractExamYear(file.name);
        return {
          id: generateFileId(),
          file,
          filename: file.name,
          examYear,
          isValid: false,
          status: 'pending' as const
        };
      });

    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange, extractExamYear, generateFileId]);

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

  // Update exam year
  const updateExamYear = useCallback((fileId: string, year: number) => {
    onFilesChange(files.map(f => 
      f.id === fileId ? { ...f, examYear: year } : f
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
        updateExamYear(editingYear, year);
        setEditingYear(null);
        setYearInput('');
      }
    }
  }, [editingYear, yearInput, updateExamYear]);

  // Cancel year edit
  const cancelYearEdit = useCallback(() => {
    setEditingYear(null);
    setYearInput('');
  }, []);

  // Get status icon
  const getStatusIcon = (file: BulkImportFile) => {
    switch (file.status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'validating':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 animate-pulse" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get status badge
  const getStatusBadge = (file: BulkImportFile) => {
    const variants = {
      pending: 'secondary',
      validating: 'secondary',
      valid: 'default',
      invalid: 'destructive',
      uploading: 'secondary',
      success: 'default',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[file.status] || 'secondary'}>
        {file.status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload JSON Files</CardTitle>
          <CardDescription>
            Select or drag and drop multiple .json files. Exam years will be automatically detected from filenames.
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
              JSON files only. Multiple files supported.
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

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files ({files.length})</CardTitle>
            <CardDescription>
              Review and edit exam years as needed. Files must be valid before import.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.filename}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {editingYear === file.id ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="1900"
                                max={new Date().getFullYear()}
                                value={yearInput}
                                onChange={(e) => setYearInput(e.target.value)}
                                className="w-20 h-6 text-xs"
                                placeholder="Year"
                              />
                              <Button size="sm" variant="outline" onClick={saveYearEdit}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelYearEdit}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {file.examYear ? `Year: ${file.examYear}` : 'No year detected'}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleYearEdit(file.id, file.examYear)}
                                className="h-4 w-4 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(file)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(file.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Show validation errors */}
                  {file.status === 'invalid' && file.validationResult && file.validationResult.errors.length > 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <p className="font-medium text-red-800 mb-1">Validation Errors:</p>
                      <ul className="list-disc list-inside text-red-700 space-y-1">
                        {file.validationResult.errors.slice(0, 3).map((error, index) => (
                          <li key={index}>{error.message}</li>
                        ))}
                        {file.validationResult.errors.length > 3 && (
                          <li>... and {file.validationResult.errors.length - 3} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Show upload progress */}
                  {file.status === 'uploading' && file.uploadProgress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Uploading...</span>
                        <span>{file.uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${file.uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Show success message */}
                  {file.status === 'success' && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <p className="text-green-800">
                        ✓ Successfully imported {file.validationResult?.questionCount || 0} questions
                      </p>
                    </div>
                  )}

                  {/* Show error message */}
                  {file.status === 'error' && file.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <p className="text-red-800">✗ Import failed: {file.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {files.some(f => !f.examYear) && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Some files don't have detected exam years. Please set them manually before proceeding.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
