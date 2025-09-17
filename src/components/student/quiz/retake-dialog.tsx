// @ts-nocheck
'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export type RetakeType = 'SAME' | 'INCORRECT_ONLY' | 'CORRECT_ONLY' | 'NOT_RESPONDED';

interface RetakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { retakeType: RetakeType; title?: string }) => Promise<void> | void;
  defaultTitle?: string;
}

export function RetakeDialog({ open, onOpenChange, onConfirm, defaultTitle }: RetakeDialogProps) {
  const [retakeType, setRetakeType] = useState<RetakeType>('SAME');
  const [title, setTitle] = useState<string>(defaultTitle || '');
  const [submitting, setSubmitting] = useState(false);

  const validTitle = useMemo(() => {
    if (!title) return true; // optional
    const trimmed = title.trim();
    return trimmed.length >= 3 && trimmed.length <= 100;
  }, [title]);

  const canSubmit = useMemo(() => {
    return !!retakeType && validTitle;
  }, [retakeType, validTitle]);

  const handleConfirm = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      console.log('🔄 [RetakeDialog] Submitting retake request:', {
        retakeType,
        title: title?.trim() || undefined
      });

      await onConfirm({ retakeType, title: title?.trim() || undefined });

      // Only close dialog if onConfirm doesn't throw an error
      // The parent component will handle closing the dialog
    } catch (error) {
      console.error('💥 [RetakeDialog] Error in onConfirm:', error);
      // Don't close dialog on error - let user try again
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Retake Session</DialogTitle>
          <DialogDescription>Choose what to include in the retake and optionally rename it.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label>Retake Type</Label>
            <RadioGroup value={retakeType} onValueChange={(v: any) => setRetakeType(v)} className="grid grid-cols-1 gap-2">
              <label className={cn('flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/40', retakeType==='SAME' && 'border-primary bg-primary/10') }>
                <RadioGroupItem value="SAME" id="retake_same" />
                <div>
                  <div className="font-medium">Same Questions</div>
                  <div className="text-xs text-muted-foreground">Create a new session with the exact same questions</div>
                </div>
              </label>
              <label className={cn('flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/40', retakeType==='INCORRECT_ONLY' && 'border-primary bg-primary/10') }>
                <RadioGroupItem value="INCORRECT_ONLY" id="retake_incorrect" />
                <div>
                  <div className="font-medium">Incorrect Only</div>
                  <div className="text-xs text-muted-foreground">Include only questions you previously answered incorrectly</div>
                </div>
              </label>
              <label className={cn('flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/40', retakeType==='CORRECT_ONLY' && 'border-primary bg-primary/10') }>
                <RadioGroupItem value="CORRECT_ONLY" id="retake_correct" />
                <div>
                  <div className="font-medium">Correct Only</div>
                  <div className="text-xs text-muted-foreground">Redo the questions you got right</div>
                </div>
              </label>
              <label className={cn('flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/40', retakeType==='NOT_RESPONDED' && 'border-primary bg-primary/10') }>
                <RadioGroupItem value="NOT_RESPONDED" id="retake_skipped" />
                <div>
                  <div className="font-medium">Not Responded</div>
                  <div className="text-xs text-muted-foreground">Only include questions you skipped or didn’t answer</div>
                </div>
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retake_title">Title (optional)</Label>
            <Input id="retake_title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Anatomy - Incorrect Only" />
            {!validTitle && (
              <div className="text-xs text-destructive">Title must be 3-100 characters</div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!canSubmit || submitting}>
            {submitting ? 'Creating…' : 'Create Retake'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

