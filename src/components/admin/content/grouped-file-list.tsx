'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  BookOpen,
  Tag,
  RotateCw,
  Edit2,
  X,
  Loader2
} from 'lucide-react';
import { BulkImportFile } from '@/types/question-import';
import { extractCourseString } from '@/utils/filename-parser';
import { getMetadataSourceLabel } from '@/utils/metadata-hierarchy';

interface GroupedFileListProps {
  files: BulkImportFile[];
  questionSources: Array<{ id: number; name: string }>;
  availableCourses: Array<{ id: number; name: string }>;
  onFileUpdate: (fileId: string, updates: Partial<BulkImportFile>) => void;
  onFileRemove: (fileId: string) => void;
  onGroupUpdate: (groupKey: string, updates: any) => void;
  onGlobalUpdate: (updates: any) => void;
}

export function GroupedFileList({
  files,
  questionSources,
  availableCourses,
  onFileUpdate,
  onFileRemove,
  onGroupUpdate,
  onGlobalUpdate
}: GroupedFileListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [yearInput, setYearInput] = useState('');

  // Group files by groupKey
  const groupedFiles = files.reduce((acc, file) => {
    const key = file.groupKey || `__single_${file.id}__`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(file);
    return acc;
  }, {} as Record<string, BulkImportFile[]>);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const getGroupDisplayName = (groupKey: string, groupFiles: BulkImportFile[]): string => {
    if (groupKey.startsWith('__single_') || groupKey.startsWith('__ungrouped_')) {
      return groupFiles[0]?.filename || 'Unknown';
    }
    
    const firstFile = groupFiles[0];
    if (firstFile) {
      const courseName = extractCourseString(firstFile.filename);
      return courseName || groupKey;
    }
    
    return groupKey;
  };

  const getGroupStatus = (groupFiles: BulkImportFile[]) => {
    const allValid = groupFiles.every(f => f.isValid);
    const someInvalid = groupFiles.some(f => !f.isValid);
    const allHaveMetadata = groupFiles.every(f => 
      f.examYear && f.courseId && f.sourceId
    );

    if (allValid && allHaveMetadata) return 'valid';
    if (someInvalid) return 'invalid';
    return 'pending';
  };

  const handleYearEdit = (fileId: string, currentYear?: number) => {
    setEditingYear(fileId);
    setYearInput(currentYear?.toString() || '');
  };

  const saveYearEdit = (fileId: string) => {
    if (yearInput) {
      const year = parseInt(yearInput);
      const currentYear = new Date().getFullYear();
      
      if (year >= 1900 && year <= currentYear && yearInput.length === 4) {
        onFileUpdate(fileId, { 
          examYear: year,
          metadataSource: {
            ...files.find(f => f.id === fileId)?.metadataSource,
            examYear: 'file'
          }
        });
        setEditingYear(null);
        setYearInput('');
      }
    }
  };

  const cancelYearEdit = () => {
    setEditingYear(null);
    setYearInput('');
  };

  return (
    <div className="space-y-4">
      {/* Global Metadata Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Global Settings</CardTitle>
          <CardDescription className="text-xs">
            Apply to all files (can be overridden per group or file)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Source</label>
            <Select
              onValueChange={(value) => onGlobalUpdate({ sourceId: parseInt(value) })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select source..." />
              </SelectTrigger>
              <SelectContent>
                {questionSources.map(source => (
                  <SelectItem key={source.id} value={source.id.toString()}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Rotation</label>
            <Select
              onValueChange={(value) => onGlobalUpdate({ rotation: value })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select rotation..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R1">R1</SelectItem>
                <SelectItem value="R2">R2</SelectItem>
                <SelectItem value="R3">R3</SelectItem>
                <SelectItem value="R4">R4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Files */}
      {Object.entries(groupedFiles).map(([groupKey, groupFiles]) => {
        const isExpanded = expandedGroups.has(groupKey);
        const displayName = getGroupDisplayName(groupKey, groupFiles);
        const status = getGroupStatus(groupFiles);
        const isSingleFile = groupKey.startsWith('__single_') || groupFiles.length === 1;

        return (
          <Card key={groupKey} className="overflow-hidden">
            <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(groupKey)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className="text-sm font-medium">{displayName}</CardTitle>
                        <CardDescription className="text-xs">
                          {groupFiles.length} file{groupFiles.length > 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === 'valid' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Valid
                        </Badge>
                      )}
                      {status === 'invalid' && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Invalid
                        </Badge>
                      )}
                      {status === 'pending' && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {/* Group-level metadata (only show for multi-file groups) */}
                  {!isSingleFile && (
                    <div className="bg-muted/30 p-3 rounded-lg space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">Group Settings</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium">Course</label>
                          <Select
                            onValueChange={(value) => onGroupUpdate(groupKey, { courseId: parseInt(value) })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select course..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCourses.map(course => (
                                <SelectItem key={course.id} value={course.id.toString()}>
                                  {course.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium">Source</label>
                          <Select
                            onValueChange={(value) => onGroupUpdate(groupKey, { sourceId: parseInt(value) })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select source..." />
                            </SelectTrigger>
                            <SelectContent>
                              {questionSources.map(source => (
                                <SelectItem key={source.id} value={source.id.toString()}>
                                  {source.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Individual files */}
                  <div className="space-y-2">
                    {groupFiles.map(file => (
                      <div
                        key={file.id}
                        className="border rounded-lg p-3 space-y-2 bg-background"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{file.filename}</p>
                              {file.isValid ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-5 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Valid
                                </Badge>
                              ) : file.status === 'invalid' ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 h-5 text-xs">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Invalid
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 h-5 text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                            {file.validationResult && (
                              <p className="text-xs text-muted-foreground">
                                {file.validationResult.questionCount} questions
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFileRemove(file.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* File metadata */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {/* Exam Year */}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {editingYear === file.id ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={yearInput}
                                  onChange={(e) => setYearInput(e.target.value)}
                                  className="h-6 w-16 text-xs"
                                  placeholder="Year"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => saveYearEdit(file.id)}
                                  className="h-6 px-2"
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelYearEdit}
                                  className="h-6 px-2"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className={file.examYear ? '' : 'text-muted-foreground'}>
                                  {file.examYear || 'No year'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleYearEdit(file.id, file.examYear)}
                                  className="h-4 w-4 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Rotation */}
                          <div className="flex items-center gap-2">
                            <RotateCw className="h-3 w-3 text-muted-foreground" />
                            <Select
                              value={file.rotation || ''}
                              onValueChange={(value) => onFileUpdate(file.id, {
                                rotation: value,
                                metadataSource: {
                                  ...file.metadataSource,
                                  rotation: 'file'
                                }
                              })}
                            >
                              <SelectTrigger className="h-6 text-xs w-20">
                                <SelectValue placeholder="Rotation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="R1">R1</SelectItem>
                                <SelectItem value="R2">R2</SelectItem>
                                <SelectItem value="R3">R3</SelectItem>
                                <SelectItem value="R4">R4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}

