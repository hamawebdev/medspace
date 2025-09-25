'use client';

import { SoundToggleTest } from '@/components/student/quiz/sound-toggle-test';
import { SoundToggle } from '@/components/student/quiz/sound-toggle';

export default function TestSoundPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Sound Toggle Test</h1>
          <p className="text-muted-foreground">
            This page is for testing the sound toggle functionality.
          </p>
        </div>

        <div className="grid gap-8">
          <SoundToggleTest />
          
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">Original Sound Toggle Component</h3>
            <div className="flex gap-4 items-center">
              <SoundToggle />
              <SoundToggle showLabel />
              <SoundToggle variant="ghost" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
