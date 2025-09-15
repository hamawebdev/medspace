import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, University as UniversityIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UniversitySelectionState, validateUniversitySelection } from '@/hooks/use-university-selection';

interface UniversitySelectorProps {
  universitySelection: UniversitySelectionState;
  allowMultiple?: boolean;
  required?: boolean;
  loading?: boolean;
  className?: string;
  label?: string;
  sessionType?: 'PRACTICE' | 'EXAM';
}

export function UniversitySelector({
  universitySelection,
  allowMultiple = false,
  required = true,
  loading = false,
  className,
  label = 'Université',
  sessionType
}: UniversitySelectorProps) {
  const {
    availableUniversities,
    selectedUniversityIds,
    showDropdown,
    autoSelectedUniversity,
    errorMessage,
    selectUniversity,
    selectMultipleUniversities,
    isValid,
    getValidationError
  } = universitySelection;

  // Show error state if no universities available
  if (errorMessage) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="flex items-center gap-1">
          <UniversityIcon className="h-4 w-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show auto-selected university (single university case)
  if (autoSelectedUniversity && !showDropdown) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="flex items-center gap-1">
          <UniversityIcon className="h-4 w-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div className="flex-1">
            <div className="font-medium text-green-900">
              {autoSelectedUniversity.name}
            </div>
            {autoSelectedUniversity.country && (
              <div className="text-sm text-green-700">
                {autoSelectedUniversity.country}
              </div>
            )}
            <div className="text-xs text-green-600 mt-1">
              Auto-sélectionnée (seule université disponible)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show dropdown for multiple universities
  if (showDropdown) {
    const validationError = getValidationError();
    
    if (allowMultiple) {
      return (
        <div className={cn("space-y-2", className)}>
          <Label className="flex items-center gap-1">
            <UniversityIcon className="h-4 w-4" />
            {label}
            {required && <span className="text-red-500">*</span>}
            {availableUniversities.length > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                ({selectedUniversityIds.length}/{availableUniversities.length})
              </span>
            )}
          </Label>
          <MultiSelect
            options={availableUniversities.map(u => ({
              value: String(u.id),
              label: u.country ? `${u.name} (${u.country})` : u.name
            }))}
            value={selectedUniversityIds.map(String)}
            onChange={(values) => selectMultipleUniversities(values.map(Number))}
            placeholder={
              loading 
                ? "Chargement des universités..." 
                : required 
                  ? "Sélectionnez une ou plusieurs universités"
                  : "Sélectionnez des universités (optionnel)"
            }
            disabled={loading}
            className={cn(validationError && "border-red-500")}
          />
          {validationError && (
            <p className="text-sm text-red-500">{validationError}</p>
          )}
        </div>
      );
    } else {
      return (
        <div className={cn("space-y-2", className)}>
          <Label className="flex items-center gap-1">
            <UniversityIcon className="h-4 w-4" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={selectedUniversityIds.length > 0 ? String(selectedUniversityIds[0]) : ''}
            onValueChange={(value) => value && selectUniversity(Number(value))}
            disabled={loading}
          >
            <SelectTrigger className={cn(validationError && "border-red-500")}>
              <SelectValue 
                placeholder={
                  loading 
                    ? "Chargement des universités..." 
                    : required 
                      ? "Sélectionnez une université"
                      : "Sélectionnez une université (optionnel)"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {!required && (
                <SelectItem value="">Aucune sélection</SelectItem>
              )}
              {availableUniversities.map((university) => (
                <SelectItem key={university.id} value={String(university.id)}>
                  <div className="flex flex-col">
                    <span>{university.name}</span>
                    {university.country && (
                      <span className="text-xs text-muted-foreground">
                        {university.country}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationError && (
            <p className="text-sm text-red-500">{validationError}</p>
          )}
        </div>
      );
    }
  }

  return null;
}
