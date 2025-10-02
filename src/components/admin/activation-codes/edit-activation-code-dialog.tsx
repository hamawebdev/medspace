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
import { Loader2, AlertCircle, Calendar, Users, Clock, Package } from 'lucide-react';
import { AdminService, StudentService } from '@/lib/api-services';
import { ActivationCode, UpdateActivationCodeRequest, StudyPack } from '@/types/api';
import { toast } from 'sonner';

interface EditActivationCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCode: (codeId: number, codeData: UpdateActivationCodeRequest) => Promise<void>;
  activationCode: ActivationCode | null;
}

export function EditActivationCodeDialog({
  open,
  onOpenChange,
  onUpdateCode,
  activationCode,
}: EditActivationCodeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [studyPacks, setStudyPacks] = useState<StudyPack[]>([]);
  const [studyPacksLoading, setStudyPacksLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateActivationCodeRequest>({
    description: '',
    durationMonths: 1,
    durationDays: undefined,
    durationType: 'MONTHS',
    maxUses: 100,
    expiresAt: '',
    studyPackIds: [],
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load study packs when dialog opens
  useEffect(() => {
    if (open) {
      loadStudyPacks();
    }
  }, [open]);

  // Populate form when activation code changes
  useEffect(() => {
    if (activationCode) {
      const expiryDate = new Date(activationCode.expiresAt);
      const formattedDate = expiryDate.toISOString().split('T')[0];
      
      setFormData({
        description: activationCode.description || '',
        durationMonths: activationCode.durationMonths,
        durationDays: activationCode.durationDays,
        durationType: activationCode.durationType || 'MONTHS',
        maxUses: activationCode.maxUses,
        expiresAt: formattedDate,
        studyPackIds: activationCode.studyPacks?.map(sp => sp.id) || [],
        isActive: activationCode.isActive,
      });
    }
  }, [activationCode]);

  const loadStudyPacks = async () => {
    try {
      setStudyPacksLoading(true);
      // Use the correct endpoint: GET /api/v1/study-packs
      const response = await StudentService.getStudyPacks({ limit: 100 });

      if (response.success && response.data) {
        // Handle the nested response structure from the API
        const data = response.data?.data?.data || response.data?.data || response.data || [];
        const studyPacks = Array.isArray(data) ? data : [];

        // Filter only active study packs
        const activeStudyPacks = studyPacks.filter((pack: StudyPack) => pack.isActive);
        setStudyPacks(activeStudyPacks);
      } else {
        throw new Error('Failed to load study packs');
      }
    } catch (error) {
      console.error('Failed to load study packs:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les Study Packs.',
      });
    } finally {
      setStudyPacksLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate duration based on type
    if (formData.durationType === 'MONTHS') {
      if (!formData.durationMonths || formData.durationMonths < 1 || formData.durationMonths > 60) {
        newErrors.duration = 'Duration must be between 1 and 60 months';
      }
    } else if (formData.durationType === 'DAYS') {
      if (!formData.durationDays || formData.durationDays < 1 || formData.durationDays > 1825) {
        newErrors.duration = 'Duration must be between 1 and 1825 days';
      }
    }

    if (!formData.maxUses || formData.maxUses < 1) {
      newErrors.maxUses = 'Max uses must be at least 1';
    }

    if (!formData.expiresAt) {
      newErrors.expiresAt = 'Expiration date is required';
    } else {
      const expiryDate = new Date(formData.expiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        newErrors.expiresAt = 'Expiration date must be in the future';
      }
    }

    if (!formData.studyPackIds || formData.studyPackIds.length === 0) {
      newErrors.studyPackIds = 'Au moins un Study Pack doit être sélectionné';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activationCode || !validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Convert date to ISO string with time
      const expiryDateTime = new Date(formData.expiresAt + 'T23:59:59.999Z');
      
      const codeData: UpdateActivationCodeRequest = {
        description: formData.description?.trim() || undefined,
        durationType: formData.durationType,
        maxUses: formData.maxUses,
        expiresAt: expiryDateTime.toISOString(),
        studyPackIds: formData.studyPackIds,
        isActive: formData.isActive,
        ...(formData.durationType === 'MONTHS' 
          ? { durationMonths: formData.durationMonths } 
          : { durationDays: formData.durationDays }
        ),
      };

      await onUpdateCode(activationCode.id, codeData);
      
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
        ? [...(prev.studyPackIds || []), studyPackId]
        : (prev.studyPackIds || []).filter(id => id !== studyPackId)
    }));
  };

  const handleDurationTypeChange = (newType: 'MONTHS' | 'DAYS') => {
    setFormData(prev => ({
      ...prev,
      durationType: newType,
      durationMonths: newType === 'MONTHS' ? (prev.durationMonths || 1) : undefined,
      durationDays: newType === 'DAYS' ? (prev.durationDays || 30) : undefined,
    }));
  };

  if (!activationCode) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Edit Activation Code
          </DialogTitle>
          <DialogDescription>
            Update the activation code details. Code: <strong>{activationCode.code}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter a description for this activation code..."
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Duration Type and Duration */}
          <div className="space-y-4">
            {/* Duration Type Toggle */}
            <div className="space-y-2">
              <Label>
                <Clock className="inline h-4 w-4 mr-1" />
                Duration Type
              </Label>
              <Select value={formData.durationType} onValueChange={handleDurationTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHS">Months</SelectItem>
                  <SelectItem value="DAYS">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration Value and Max Uses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duration ({formData.durationType === 'MONTHS' ? 'Months' : 'Days'}) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max={formData.durationType === 'MONTHS' ? "60" : "1825"}
                  value={formData.durationType === 'MONTHS' ? formData.durationMonths || '' : formData.durationDays || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setFormData(prev => ({ 
                      ...prev, 
                      ...(formData.durationType === 'MONTHS' 
                        ? { durationMonths: value } 
                        : { durationDays: value }
                      )
                    }));
                  }}
                  placeholder={formData.durationType === 'MONTHS' ? '1-60 months' : '1-1825 days'}
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.durationType === 'MONTHS' ? 'Range: 1-60 months' : 'Range: 1-1825 days (5 years)'}
                </p>
              </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Max Uses *
              </Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                max="10000"
                value={formData.maxUses || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  maxUses: parseInt(e.target.value) || 1 
                }))}
                className={errors.maxUses ? 'border-red-500' : ''}
              />
              {errors.maxUses && (
                <p className="text-sm text-red-500">{errors.maxUses}</p>
              )}
              </div>
            </div>
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date *</Label>
            <Input
              id="expiresAt"
              type="date"
              value={formData.expiresAt || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              className={errors.expiresAt ? 'border-red-500' : ''}
            />
            {errors.expiresAt && (
              <p className="text-sm text-red-500">{errors.expiresAt}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                isActive: checked as boolean 
              }))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {/* Study Packs */}
          <div className="space-y-2">
            <Label>Study Packs *</Label>
            {studyPacksLoading ? (
              <div className="flex items-center justify-center py-4 border rounded-md bg-muted/50">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Chargement des Study Packs...</span>
              </div>
            ) : studyPacks.length > 0 ? (
              <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2 bg-background">
                {studyPacks.map((pack) => (
                  <div key={pack.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={`pack-${pack.id}`}
                      checked={(formData.studyPackIds || []).includes(pack.id)}
                      onCheckedChange={(checked) => handleStudyPackToggle(pack.id, checked as boolean)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`pack-${pack.id}`}
                      className="text-sm font-normal cursor-pointer flex-1 leading-none"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{pack.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {pack.type}{pack.yearNumber ? ` • Année ${pack.yearNumber}` : ''}{pack.price ? ` • ${pack.price}€` : ''}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 border rounded-md bg-muted/50">
                <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Aucun Study Pack disponible.</span>
              </div>
            )}
            {errors.studyPackIds && (
              <p className="text-sm text-red-500">{errors.studyPackIds}</p>
            )}
            {(formData.studyPackIds || []).length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
                <Package className="h-4 w-4" />
                <span>
                  {(formData.studyPackIds || []).length} Study Pack{(formData.studyPackIds || []).length > 1 ? 's' : ''} sélectionné{(formData.studyPackIds || []).length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
