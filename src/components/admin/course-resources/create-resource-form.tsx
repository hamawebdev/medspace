/**
 * Course Resource Creation Form Component
 * Comprehensive form for creating course resources with validation
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  FileText,
  Video,
  Link,
  Headphones,
  Image,
  AlertCircle,
  Upload,
  X,
  CheckCircle,
  File
} from 'lucide-react';
import { CreateResourceData, Course } from '@/hooks/admin/use-admin-course-resources';

interface CreateResourceFormProps {
  course: Course;
  onSubmit: (data: CreateResourceData, file?: File, onProgress?: (progress: number) => void) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

const RESOURCE_TYPES = [
  { value: 'SLIDE', label: 'Slide', icon: FileText, description: 'Presentation slides and documents' },
  { value: 'VIDEO', label: 'Video', icon: Video, description: 'Video files or YouTube videos' },
  { value: 'BOOK', label: 'Book', icon: Link, description: 'Books and reading materials' },
  { value: 'SUMMARY', label: 'Summary', icon: Headphones, description: 'Study summaries and notes' },
  { value: 'OTHER', label: 'Other', icon: Image, description: 'Other types of resources' }
] as const;

export function CreateResourceForm({ course, onSubmit, onCancel, loading = false }: CreateResourceFormProps) {
  const [formData, setFormData] = useState<CreateResourceData>({
    courseId: course.id,
    type: 'SLIDE',
    title: '',
    description: '',
    filePath: '',
    externalUrl: '',
    youtubeVideoId: '',
    isPaid: false,
    price: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    file: null,
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file upload state
    setFileUpload(prev => ({
      ...prev,
      file: null,
      error: null,
      success: false,
      progress: 0,
      uploading: false
    }));

    // Validate file type and size
    const maxSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
      'image/svg+xml'
    ];

    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    // Check file extension
    if (!allowedExtensions.includes(fileExtension)) {
      setFileUpload(prev => ({
        ...prev,
        error: `Invalid file extension "${fileExtension}". Allowed: ${allowedExtensions.join(', ')}`,
        file: null
      }));
      return;
    }

    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
      setFileUpload(prev => ({
        ...prev,
        error: `Invalid file type "${file.type}". Please upload PDF or image files only.`,
        file: null
      }));
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      setFileUpload(prev => ({
        ...prev,
        error: `File size (${sizeMB}MB) exceeds the 20MB limit.`,
        file: null
      }));
      return;
    }

    // Check for empty file
    if (file.size === 0) {
      setFileUpload(prev => ({
        ...prev,
        error: 'File appears to be empty. Please select a valid file.',
        file: null
      }));
      return;
    }

    // Additional validation for PDF files
    if (file.type === 'application/pdf') {
      // Basic PDF header check
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4));
        const header = Array.from(uint8Array).map(b => String.fromCharCode(b)).join('');

        if (header !== '%PDF') {
          setFileUpload(prev => ({
            ...prev,
            error: 'Invalid PDF file. The file appears to be corrupted or not a valid PDF.',
            file: null
          }));
          return;
        }

        // PDF is valid
        setFileUpload(prev => ({
          ...prev,
          file,
          error: null,
          success: false,
          progress: 0
        }));
      };

      reader.onerror = () => {
        setFileUpload(prev => ({
          ...prev,
          error: 'Failed to read the file. Please try again.',
          file: null
        }));
      };

      reader.readAsArrayBuffer(file.slice(0, 1024)); // Read first 1KB for header check
    } else {
      // For non-PDF files, accept immediately after basic validation
      setFileUpload(prev => ({
        ...prev,
        file,
        error: null,
        success: false,
        progress: 0
      }));
    }
  };

  const removeFile = () => {
    setFileUpload({
      file: null,
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Type-specific validations
    if (formData.type === 'BOOK' && !formData.externalUrl?.trim()) {
      newErrors.externalUrl = 'External URL is required for book resources';
    }

    if (formData.externalUrl && formData.externalUrl.trim()) {
      try {
        new URL(formData.externalUrl);
      } catch {
        newErrors.externalUrl = 'Please enter a valid URL';
      }
    }

    // YouTube video ID validation
    if (formData.youtubeVideoId && formData.youtubeVideoId.trim()) {
      if (formData.youtubeVideoId.length !== 11) {
        newErrors.youtubeVideoId = 'YouTube video ID must be exactly 11 characters';
      }
    }

    // File upload validation
    if (fileUpload.uploading) {
      newErrors.file = 'Please wait for file upload to complete';
    }

    if (fileUpload.error) {
      newErrors.file = fileUpload.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Set uploading state if we have a file
    if (fileUpload.file) {
      setFileUpload(prev => ({
        ...prev,
        uploading: true,
        progress: 0,
        error: null
      }));
    }

    // Clean up the data before submission - always set isPaid: false, price: 0
    const cleanData: CreateResourceData = {
      courseId: formData.courseId,
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      filePath: formData.filePath?.trim() || undefined,
      externalUrl: formData.externalUrl?.trim() || undefined,
      youtubeVideoId: formData.youtubeVideoId?.trim() || undefined,
      isPaid: false,
      price: 0
    };

    try {
      const success = await onSubmit(cleanData, fileUpload.file || undefined, (progress: number) => {
        setFileUpload(prev => ({
          ...prev,
          progress
        }));
      });

      if (success && fileUpload.file) {
        setFileUpload(prev => ({
          ...prev,
          uploading: false,
          success: true,
          progress: 100
        }));
      }
    } catch (error) {
      if (fileUpload.file) {
        setFileUpload(prev => ({
          ...prev,
          uploading: false,
          error: 'Upload failed',
          progress: 0
        }));
      }
    }
  };

  const updateFormData = (field: keyof CreateResourceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedResourceType = RESOURCE_TYPES.find(type => type.value === formData.type);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {selectedResourceType && <selectedResourceType.icon className="h-5 w-5" />}
          Create Course Resource
        </CardTitle>
        <CardDescription>
          Add a new resource to <strong>{course.name}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resource Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Resource Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => updateFormData('type', value as CreateResourceData['type'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Enter resource title"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <div className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Enter resource description (optional)"
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <div className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>File Upload</Label>
            <div className="text-sm text-muted-foreground mb-3">
              Upload PDF or image files (max 20MB). Supported formats: PDF, JPG, PNG, GIF, BMP, TIFF, WebP, SVG
            </div>

            <div className="space-y-3">
              {!fileUpload.file ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <div className="text-sm text-muted-foreground mb-2">
                    Drag and drop a file here, or click to browse
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp,.svg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="h-8 w-8 text-primary" />
                      <div>
                        <div className="font-medium text-sm">{fileUpload.file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fileUpload.success && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {fileUpload.uploading && (
                    <div className="mt-3">
                      <Progress value={fileUpload.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        Uploading... {fileUpload.progress}%
                      </div>
                    </div>
                  )}
                </div>
              )}

              {fileUpload.error && (
                <div className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fileUpload.error}
                </div>
              )}
            </div>
          </div>


          {/* External URL */}
          <div className="space-y-2">
            <Label htmlFor="externalUrl">
              External URL {formData.type === 'BOOK' && '*'}
            </Label>
            <Input
              id="externalUrl"
              value={formData.externalUrl}
              onChange={(e) => updateFormData('externalUrl', e.target.value)}
              placeholder="https://example.com/resource"
              className={errors.externalUrl ? 'border-destructive' : ''}
            />
            {errors.externalUrl && (
              <div className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.externalUrl}
              </div>
            )}
          </div>

          {/* YouTube Video ID */}
          {formData.type === 'VIDEO' && (
            <div className="space-y-2">
              <Label htmlFor="youtubeVideoId">YouTube Video ID</Label>
              <Input
                id="youtubeVideoId"
                value={formData.youtubeVideoId}
                onChange={(e) => updateFormData('youtubeVideoId', e.target.value)}
                placeholder="dQw4w9WgXcQ"
                maxLength={11}
                className={errors.youtubeVideoId ? 'border-destructive' : ''}
              />
              {errors.youtubeVideoId && (
                <div className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.youtubeVideoId}
                </div>
              )}
            </div>
          )}



          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || fileUpload.uploading || !!fileUpload.error}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Resource
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading || fileUpload.uploading}
            >
              Cancel
            </Button>
          </div>

          {/* Form validation summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before submitting the form.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
