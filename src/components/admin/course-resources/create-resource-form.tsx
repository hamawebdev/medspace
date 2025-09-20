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

  // Update form fields visibility based on resource type (from test file pattern)
  const updateFormFields = () => {
    // Clear YouTube video ID if not VIDEO type
    if (formData.type !== 'VIDEO' && formData.youtubeVideoId) {
      setFormData(prev => ({ ...prev, youtubeVideoId: '' }));
    }

    // Clear external URL validation errors when type changes
    if (errors.externalUrl && formData.type !== 'BOOK') {
      setErrors(prev => ({ ...prev, externalUrl: '' }));
    }
  };

  // File upload handlers (improved from test file pattern)
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

    // Validate file type and size (expanded from test file)
    const maxSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
      'image/svg+xml'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    // Check file extension
    if (!allowedExtensions.includes(fileExtension)) {
      setFileUpload(prev => ({
        ...prev,
        error: `Invalid file extension "${fileExtension}". Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, JPG, PNG, GIF, BMP, TIFF, WebP, SVG`,
        file: null
      }));
      return;
    }

    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
      setFileUpload(prev => ({
        ...prev,
        error: `Invalid file type "${file.type}". Please upload supported file formats only.`,
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

    // Simplified file validation (from test file pattern)
    // Accept file immediately after basic validation - let server handle detailed validation
    setFileUpload(prev => ({
      ...prev,
      file,
      error: null,
      success: false,
      progress: 0
    }));

    console.log('✅ File selected successfully:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type
    });
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
    // Clear file-related errors
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: '' }));
    }
    // Clear content validation error if it exists
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation (enhanced from test file)
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Course ID validation (from test file)
    if (!formData.courseId || formData.courseId < 1) {
      newErrors.courseId = 'Valid course ID is required';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Type-specific validations (enhanced from test file)
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

    // YouTube video ID validation (enhanced from test file)
    if (formData.type === 'VIDEO' && formData.youtubeVideoId && formData.youtubeVideoId.trim()) {
      const videoId = formData.youtubeVideoId.trim();
      if (videoId.length !== 11) {
        newErrors.youtubeVideoId = 'YouTube video ID must be exactly 11 characters';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(videoId)) {
        newErrors.youtubeVideoId = 'YouTube video ID contains invalid characters';
      }
    }

    // File upload validation
    if (fileUpload.uploading) {
      newErrors.file = 'Please wait for file upload to complete';
    }

    if (fileUpload.error) {
      newErrors.file = fileUpload.error;
    }

    // Ensure at least one content source is provided (from test file logic)
    const hasFile = !!fileUpload.file;
    const hasExternalUrl = !!formData.externalUrl?.trim();
    const hasYouTubeId = formData.type === 'VIDEO' && !!formData.youtubeVideoId?.trim();

    if (!hasFile && !hasExternalUrl && !hasYouTubeId) {
      newErrors.content = 'Please provide either a file upload, external URL, or YouTube video ID';
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
    // Clear content validation error when any content field is updated
    if (['externalUrl', 'youtubeVideoId'].includes(field) && errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
    // Update form fields when type changes (from test file pattern)
    if (field === 'type') {
      updateFormFields();
    }
  };

  // Clear form function (from test file)
  const clearForm = () => {
    setFormData({
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
    setErrors({});
    removeFile();
  };

  // Load sample data function (from test file)
  const loadSampleData = () => {
    const resourceType = formData.type;

    switch(resourceType) {
      case 'SLIDE':
        setFormData(prev => ({
          ...prev,
          title: 'Anatomy Slides - Cardiovascular System',
          description: 'Comprehensive slides covering cardiovascular anatomy and physiology',
          externalUrl: 'https://example.com/anatomy-slides.pdf'
        }));
        break;
      case 'VIDEO':
        setFormData(prev => ({
          ...prev,
          title: 'Cardiology Lecture Series',
          description: 'In-depth video lectures on cardiology fundamentals',
          youtubeVideoId: 'dQw4w9WgXcQ'
        }));
        break;
      case 'BOOK':
        setFormData(prev => ({
          ...prev,
          title: 'Medical Physiology Textbook',
          description: 'Comprehensive textbook on human physiology',
          externalUrl: 'https://example.com/physiology-textbook.pdf'
        }));
        break;
      case 'SUMMARY':
        setFormData(prev => ({
          ...prev,
          title: 'Pharmacology Quick Reference',
          description: 'Quick reference guide for common medications',
          externalUrl: 'https://example.com/pharmacology-summary.pdf'
        }));
        break;
      case 'OTHER':
        setFormData(prev => ({
          ...prev,
          title: 'Clinical Practice Guidelines',
          description: 'Official guidelines for clinical practice',
          externalUrl: 'https://example.com/clinical-guidelines.pdf'
        }));
        break;
    }

    updateFormFields();
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
              Upload files (max 20MB). Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, JPG, PNG, GIF, BMP, TIFF, WebP, SVG
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
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp,.svg"
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
          <div className="space-y-3 pt-4">
            <div className="flex gap-3">
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

            {/* Development helpers (from test file) */}
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearForm}
                disabled={loading || fileUpload.uploading}
              >
                🗑️ Clear Form
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadSampleData}
                disabled={loading || fileUpload.uploading}
              >
                📝 Load Sample Data
              </Button>
            </div>
          </div>

          {/* Content validation error */}
          {errors.content && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errors.content}
              </AlertDescription>
            </Alert>
          )}

          {/* Form validation summary */}
          {Object.keys(errors).filter(key => key !== 'content').length > 0 && (
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
