'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  School, 
  BookOpen, 
  Layers, 
  GraduationCap, 
  Database,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { AdminContentService } from '@/lib/api-services';

type EntityType = 'university' | 'studyPack' | 'unit' | 'module' | 'course';

interface BaseEntity {
  id: number;
  name: string;
  description?: string;
}

interface University extends BaseEntity {
  country: string;
  city: string;
}

interface StudyPack extends BaseEntity {
  type: 'YEAR' | 'RESIDENCY';
  yearNumber?: string;
  price: number;
  description: string;
}

interface Unit extends BaseEntity {
  studyPackId: number;
  description: string;
}

interface Module extends BaseEntity {
  uniteId: number;
  description: string;
}

interface Course extends BaseEntity {
  moduleId: number;
  description: string;
}

type EntityData = University | StudyPack | Unit | Module | Course;

interface EntityCardProps {
  entity: EntityData;
  entityType: EntityType;
  onSelect?: (entity: EntityData) => void;
  onEdit?: (entity: EntityData) => void;
  onDelete?: (entityId: number) => void;
  isSelectable?: boolean;
  showActions?: boolean;
}

export function EntityCard({
  entity,
  entityType,
  onSelect,
  onEdit,
  onDelete,
  isSelectable = true,
  showActions = true
}: EntityCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getEntityIcon = () => {
    switch (entityType) {
      case 'university':
        return School;
      case 'studyPack':
        return BookOpen;
      case 'unit':
        return Layers;
      case 'module':
        return GraduationCap;
      case 'course':
        return Database;
      default:
        return School;
    }
  };

  const getEntityDetails = () => {
    switch (entityType) {
      case 'university':
        const university = entity as University;
        return (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{university.country}</p>
            <p className="text-xs text-muted-foreground">{university.city}</p>
          </div>
        );
      case 'studyPack':
        const studyPack = entity as StudyPack;
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{studyPack.description}</p>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {studyPack.type === 'YEAR' ? `Year ${studyPack.yearNumber}` : studyPack.type}
              </Badge>
              <Badge variant="outline">
                ${studyPack.price}
              </Badge>
            </div>
          </div>
        );
      case 'unit':
      case 'module':
      case 'course':
        return (
          <p className="text-sm text-muted-foreground">
            {entity.description}
          </p>
        );
      default:
        return null;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      let result;
      
      switch (entityType) {
        case 'university':
          result = await AdminContentService.deleteUniversity(entity.id);
          break;
        case 'studyPack':
          result = await AdminContentService.deleteStudyPack(entity.id);
          break;
        case 'unit':
          result = await AdminContentService.deleteUnit(entity.id);
          break;
        case 'module':
          result = await AdminContentService.deleteModule(entity.id);
          break;
        case 'course':
          result = await AdminContentService.deleteCourse(entity.id);
          break;
      }

      if (result?.success) {
        toast.success(`${entityType} deleted successfully!`);
        onDelete?.(entity.id);
      } else {
        toast.error(result?.error || `Failed to delete ${entityType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${entityType}:`, error);
      toast.error(`Failed to delete ${entityType}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const Icon = getEntityIcon();

  return (
    <>
      <Card 
        className={`transition-all duration-200 ${
          isSelectable 
            ? 'cursor-pointer hover:shadow-md hover:border-primary/50' 
            : ''
        }`}
        onClick={isSelectable ? () => onSelect?.(entity) : undefined}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Icon className="h-5 w-5 text-primary" />
              <span>{entity.name}</span>
            </CardTitle>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(entity);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {getEntityDetails()}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {entityType}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{entity.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
