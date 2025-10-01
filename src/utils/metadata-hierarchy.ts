/**
 * Utility functions for managing metadata hierarchy in bulk import
 * Priority: Single file > Group > Global
 */

import { BulkImportFile, FileGroupMetadata, GlobalMetadata } from '@/types/question-import';

/**
 * Apply global metadata to a file
 * Only applies if the file doesn't already have the metadata set
 */
export function applyGlobalMetadata(
  file: BulkImportFile,
  globalMetadata: GlobalMetadata
): BulkImportFile {
  const updated = { ...file };
  const metadataSource = { ...file.metadataSource };

  // Apply global sourceId if not set
  if (!updated.sourceId && globalMetadata.sourceId) {
    updated.sourceId = globalMetadata.sourceId;
    metadataSource.sourceId = 'global';
  }

  // Apply global rotation if not set
  if (!updated.rotation && globalMetadata.rotation) {
    updated.rotation = globalMetadata.rotation;
    metadataSource.rotation = 'global';
  }

  updated.metadataSource = metadataSource;
  return updated;
}

/**
 * Apply group metadata to a file
 * Only applies if the file doesn't already have the metadata set
 * Takes priority over global metadata
 */
export function applyGroupMetadata(
  file: BulkImportFile,
  groupMetadata: FileGroupMetadata
): BulkImportFile {
  const updated = { ...file };
  const metadataSource = { ...file.metadataSource };

  // Apply group courseId if not set or if only set from global
  if (
    (!updated.courseId || metadataSource.courseId === 'global') &&
    groupMetadata.courseId
  ) {
    updated.courseId = groupMetadata.courseId;
    metadataSource.courseId = 'group';
  }

  // Apply group sourceId if not set or if only set from global
  if (
    (!updated.sourceId || metadataSource.sourceId === 'global') &&
    groupMetadata.sourceId
  ) {
    updated.sourceId = groupMetadata.sourceId;
    metadataSource.sourceId = 'group';
  }

  // Apply group rotation if not set or if only set from global
  if (
    (!updated.rotation || metadataSource.rotation === 'global') &&
    groupMetadata.rotation
  ) {
    updated.rotation = groupMetadata.rotation;
    metadataSource.rotation = 'group';
  }

  // Apply group examYear if not set or if only set from global
  if (
    (!updated.examYear || metadataSource.examYear === 'global') &&
    groupMetadata.examYear
  ) {
    updated.examYear = groupMetadata.examYear;
    metadataSource.examYear = 'group';
  }

  updated.metadataSource = metadataSource;
  return updated;
}

/**
 * Apply metadata hierarchy to all files
 * Priority: file-level > group-level > global-level
 */
export function applyMetadataHierarchy(
  files: BulkImportFile[],
  globalMetadata: GlobalMetadata,
  groupsMetadata: Map<string, FileGroupMetadata>
): BulkImportFile[] {
  return files.map(file => {
    let updated = { ...file };

    // Step 1: Apply global metadata (lowest priority)
    updated = applyGlobalMetadata(updated, globalMetadata);

    // Step 2: Apply group metadata (medium priority)
    if (file.groupKey && groupsMetadata.has(file.groupKey)) {
      const groupMetadata = groupsMetadata.get(file.groupKey)!;
      updated = applyGroupMetadata(updated, groupMetadata);
    }

    // Step 3: File-level metadata is already set (highest priority)
    // No need to do anything, it takes precedence

    return updated;
  });
}

/**
 * Update file-level metadata
 * Marks the metadata as coming from 'file' source
 */
export function updateFileMetadata(
  file: BulkImportFile,
  updates: {
    examYear?: number;
    courseId?: number;
    sourceId?: number;
    rotation?: string;
  }
): BulkImportFile {
  const updated = { ...file };
  const metadataSource = { ...file.metadataSource };

  if (updates.examYear !== undefined) {
    updated.examYear = updates.examYear;
    metadataSource.examYear = 'file';
  }

  if (updates.courseId !== undefined) {
    updated.courseId = updates.courseId;
    metadataSource.courseId = 'file';
  }

  if (updates.sourceId !== undefined) {
    updated.sourceId = updates.sourceId;
    metadataSource.sourceId = 'file';
  }

  if (updates.rotation !== undefined) {
    updated.rotation = updates.rotation;
    metadataSource.rotation = 'file';
  }

  updated.metadataSource = metadataSource;
  return updated;
}

/**
 * Update group metadata and apply to all files in the group
 */
export function updateGroupMetadata(
  files: BulkImportFile[],
  groupKey: string,
  updates: {
    courseId?: number;
    sourceId?: number;
    rotation?: string;
    examYear?: number;
  }
): BulkImportFile[] {
  return files.map(file => {
    if (file.groupKey !== groupKey) {
      return file;
    }

    const updated = { ...file };
    const metadataSource = { ...file.metadataSource };

    // Only update if not set at file level
    if (updates.courseId !== undefined && metadataSource.courseId !== 'file') {
      updated.courseId = updates.courseId;
      metadataSource.courseId = 'group';
    }

    if (updates.sourceId !== undefined && metadataSource.sourceId !== 'file') {
      updated.sourceId = updates.sourceId;
      metadataSource.sourceId = 'group';
    }

    if (updates.rotation !== undefined && metadataSource.rotation !== 'file') {
      updated.rotation = updates.rotation;
      metadataSource.rotation = 'group';
    }

    if (updates.examYear !== undefined && metadataSource.examYear !== 'file') {
      updated.examYear = updates.examYear;
      metadataSource.examYear = 'group';
    }

    updated.metadataSource = metadataSource;
    return updated;
  });
}

/**
 * Update global metadata and apply to all files
 */
export function updateGlobalMetadata(
  files: BulkImportFile[],
  updates: {
    sourceId?: number;
    rotation?: string;
  }
): BulkImportFile[] {
  return files.map(file => {
    const updated = { ...file };
    const metadataSource = { ...file.metadataSource };

    // Only update if not set at file or group level
    if (
      updates.sourceId !== undefined &&
      metadataSource.sourceId !== 'file' &&
      metadataSource.sourceId !== 'group'
    ) {
      updated.sourceId = updates.sourceId;
      metadataSource.sourceId = 'global';
    }

    if (
      updates.rotation !== undefined &&
      metadataSource.rotation !== 'file' &&
      metadataSource.rotation !== 'group'
    ) {
      updated.rotation = updates.rotation;
      metadataSource.rotation = 'global';
    }

    updated.metadataSource = metadataSource;
    return updated;
  });
}

/**
 * Get metadata source label for display
 */
export function getMetadataSourceLabel(
  source: 'auto' | 'file' | 'group' | 'global' | undefined
): string {
  switch (source) {
    case 'auto':
      return 'Auto-detected';
    case 'file':
      return 'File-specific';
    case 'group':
      return 'From group';
    case 'global':
      return 'Global setting';
    default:
      return 'Not set';
  }
}

/**
 * Check if a file's metadata can be overridden at a certain level
 */
export function canOverrideMetadata(
  currentSource: 'auto' | 'file' | 'group' | 'global' | undefined,
  newSource: 'file' | 'group' | 'global'
): boolean {
  const priority = {
    file: 3,
    group: 2,
    global: 1,
    auto: 0,
    undefined: 0
  };

  const currentPriority = priority[currentSource || 'undefined'];
  const newPriority = priority[newSource];

  return newPriority >= currentPriority;
}

