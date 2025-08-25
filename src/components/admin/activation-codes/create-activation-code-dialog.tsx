'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Calendar, Users, Clock } from 'lucide-react';
import { AdminService } from '@/lib/api-services';
import { CreateActivationCodeRequest, StudyPack } from '@/types/api';
import { toast } from 'sonner';

interface CreateActivationCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCode: (codeData: CreateActivationCodeRequest) => Promise<void>;
}

export function CreateActivationCodeDialog({
  open,
  onOpenChange,
  onCreateCode,
}: CreateActivationCodeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [studyPacks, setStudyPacks] = useState<StudyPack[]>([]);
  const [studyPacksLoading, setStudyPacksLoading] = useState(false);
  const [formData, setFormData] = useState<CreateActivationCodeRequest>({
    description: '',
    durationMonths: 1,
    maxUses: 100,
    expiresAt: '',
    studyPackIds: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load study packs when dialog opens
  useEffect(() => {
    if (open) {
      loadStudyPacks();
      // Set default expiry date to 1 year from now
      const defaultExpiry = new Date();
      defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
      setFormData(prev => ({
        ...prev,
        expiresAt: defaultExpiry.toISOString().split('T')[0],
      }));
    }
  }, [open]);

  const loadStudyPacks = async () => {
    try {
      setStudyPacksLoading(true);
      const response = await AdminService.getStudyPacks({ limit: 100 });
      
      if (response.success && response.data) {
        const packs = response.data.studyPacks || [];
        setStudyPacks(packs.filter(pack => pack.isActive));
      }
    } catch (error) {
      console.error('Failed to load study packs:', error);
      toast.error('Failed to load study packs');
    } finally {
      setStudyPacksLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.durationMonths < 1 || formData.durationMonths > 60) {
      newErrors.durationMonths = 'Duration must be between 1 and 60 months';
    }

    if (formData.maxUses < 1 || formData.maxUses > 10000) {
      newErrors.maxUses = 'Max uses must be between 1 and 10,000';
    }

    if (!formData.expiresAt) {
      newErrors.expiresAt = 'Expiry date is required';
    } else {
      const expiryDate = new Date(formData.expiresAt);
      if (expiryDate <= new Date()) {
        newErrors.expiresAt = 'Expiry date must be in the future';
      }
    }

    if (formData.studyPackIds.length === 0) {
      newErrors.studyPackIds = 'At least one study pack must be selected';
    } else if (formData.studyPackIds.length > 50) {
      newErrors.studyPackIds = 'Maximum 50 study packs can be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Convert date to ISO string with time
      const expiryDateTime = new Date(formData.expiresAt + 'T23:59:59.999Z');
      
      const codeData: CreateActivationCodeRequest = {
        ...formData,
        description: formData.description.trim() || undefined,
        expiresAt: expiryDateTime.toISOString(),
      };

      await onCreateCode(codeData);
      
      // Reset form
      setFormData({
        description: '',
        durationMonths: 1,
        maxUses: 100,
        expiresAt: '',
        studyPackIds: [],
      });
      setErrors({});
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleStudyPackToggle = (studyPackId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      studyPackIds: checked
        ? [...prev.studyPackIds, studyPackId]
        : prev.studyPackIds.filter(id => id !== studyPackId),
    }));
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        description: '',
        durationMonths: 1,
        maxUses: 100,
        expiresAt: '',
        studyPackIds: [],
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Activation Code</DialogTitle>
          <DialogDescription>
            Create a new activation code that students can use to get subscriptions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Promo code for new students"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Duration and Max Uses */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">
                <Clock className="inline h-4 w-4 mr-1" />
                Duration (Months)
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="60"
                value={formData.durationMonths}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  durationMonths: parseInt(e.target.value) || 1 
                }))}
              />
              {errors.durationMonths && (
                <p className="text-sm text-red-600">{errors.durationMonths}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses">
                <Users className="inline h-4 w-4 mr-1" />
                Max Uses
              </Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                max="10000"
                value={formData.maxUses}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  maxUses: parseInt(e.target.value) || 1 
                }))}
              />
              {errors.maxUses && (
                <p className="text-sm text-red-600">{errors.maxUses}</p>
              )}
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">
              <Calendar className="inline h-4 w-4 mr-1" />
              Expiry Date
            </Label>
            <Input
              id="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
            />
            {errors.expiresAt && (
              <p className="text-sm text-red-600">{errors.expiresAt}</p>
            )}
          </div>

          {/* Study Packs Selection */}
          <div className="space-y-2">
            <Label>Study Packs</Label>
            <p className="text-sm text-muted-foreground">
              Select which study packs this activation code will grant access to.
            </p>
            
            {studyPacksLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading study packs...
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                {studyPacks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active study packs available</p>
                ) : (
                  studyPacks.map((pack) => (
                    <div key={pack.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pack-${pack.id}`}
                        checked={formData.studyPackIds.includes(pack.id)}
                        onCheckedChange={(checked) => 
                          handleStudyPackToggle(pack.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`pack-${pack.id}`} 
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        <div>
                          <div className="font-medium">{pack.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {pack.type} • ${pack.price}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {errors.studyPackIds && (
              <p className="text-sm text-red-600">{errors.studyPackIds}</p>
            )}
            
            {formData.studyPackIds.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {formData.studyPackIds.length} study pack(s) selected
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
