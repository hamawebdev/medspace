// @ts-nocheck
'use client';

import React from 'react';
import { TrackerCreatePage } from '@/components/student/course-tracking/tracker-create-page';
import { ErrorBoundary } from '@/components/error-boundary';

export default function CreateTrackerPageRoute() {
  return (
    <ErrorBoundary>
      <TrackerCreatePage />
    </ErrorBoundary>
  );
}
