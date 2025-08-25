'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AdminContentService } from '@/lib/api-services';

// Schemas for different entity types
const universitySchema = z.object({
  name: z.string().min(1, 'University name is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
});

const studyPackSchema = z.object({
  name: z.string().min(1, 'Study pack name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['YEAR', 'RESIDENCY']),
  yearNumber: z.enum(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN']).optional(),
  price: z.number().min(0, 'Price must be positive'),
});

const unitSchema = z.object({
  name: z.string().min(1, 'Unit name is required'),
  description: z.string().min(1, 'Description is required'),
});

const moduleSchema = z.object({
  name: z.string().min(1, 'Module name is required'),
  description: z.string().min(1, 'Description is required'),
});

const courseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  description: z.string().min(1, 'Description is required'),
});

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

interface EditEntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entity: EntityData | null;
  onSuccess: () => void;
}

export function EditEntityDialog({
  isOpen,
  onClose,
  entityType,
  entity,
  onSuccess
}: EditEntityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get schema based on entity type
  const getSchema = () => {
    switch (entityType) {
      case 'university':
        return universitySchema;
      case 'studyPack':
        return studyPackSchema;
      case 'unit':
        return unitSchema;
      case 'module':
        return moduleSchema;
      case 'course':
        return courseSchema;
      default:
        return universitySchema;
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      name: '',
      description: '',
      country: '',
      city: '',
      type: 'YEAR' as const,
      yearNumber: 'ONE' as const,
      price: 0,
    },
  });

  // Reset form when entity changes
  useEffect(() => {
    if (entity) {
      const formData: any = {
        name: entity.name,
        description: entity.description || '',
      };

      if (entityType === 'university') {
        const university = entity as University;
        formData.country = university.country;
        formData.city = university.city;
      } else if (entityType === 'studyPack') {
        const studyPack = entity as StudyPack;
        formData.type = studyPack.type;
        formData.yearNumber = studyPack.yearNumber || 'ONE';
        formData.price = studyPack.price;
      }

      form.reset(formData);
    }
  }, [entity, entityType, form]);

  // Get entity info
  const getEntityInfo = () => {
    switch (entityType) {
      case 'university':
        return {
          title: 'Edit University',
          description: 'Update university information',
          fields: ['name', 'country', 'city']
        };
      case 'studyPack':
        return {
          title: 'Edit Study Pack',
          description: 'Update study pack information',
          fields: ['name', 'description', 'type', 'yearNumber', 'price']
        };
      case 'unit':
        return {
          title: 'Edit Unit',
          description: 'Update unit information',
          fields: ['name', 'description']
        };
      case 'module':
        return {
          title: 'Edit Module',
          description: 'Update module information',
          fields: ['name', 'description']
        };
      case 'course':
        return {
          title: 'Edit Course',
          description: 'Update course information',
          fields: ['name', 'description']
        };
      default:
        return {
          title: 'Edit Entity',
          description: 'Update entity information',
          fields: ['name']
        };
    }
  };

  const onSubmit = async (data: any) => {
    if (!entity) return;
    
    setIsSubmitting(true);
    try {
      let result;
      
      switch (entityType) {
        case 'university':
          result = await AdminContentService.updateUniversity(entity.id, {
            name: data.name,
            country: data.country,
            city: data.city,
          });
          break;
        case 'studyPack':
          result = await AdminContentService.updateStudyPack(entity.id, {
            name: data.name,
            description: data.description,
            type: data.type,
            yearNumber: data.type === 'YEAR' ? data.yearNumber : undefined,
            price: data.price,
          });
          break;
        case 'unit':
          const unitEntity = entity as Unit;
          result = await AdminContentService.updateUnit(entity.id, {
            name: data.name,
            description: data.description,
            studyPackId: unitEntity.studyPackId,
          });
          break;
        case 'module':
          const moduleEntity = entity as Module;
          result = await AdminContentService.updateModule(entity.id, {
            name: data.name,
            description: data.description,
            uniteId: moduleEntity.uniteId,
          });
          break;
        case 'course':
          const courseEntity = entity as Course;
          result = await AdminContentService.updateCourse(entity.id, {
            name: data.name,
            description: data.description,
            moduleId: courseEntity.moduleId,
          });
          break;
      }

      if (result?.success) {
        toast.success(`${entityInfo.title.replace('Edit ', '')} updated successfully!`);
        form.reset();
        onClose();
        onSuccess();
      } else {
        toast.error(result?.error || result?.message || `Failed to update ${entityType}`);
      }
    } catch (error) {
      console.error(`Error updating ${entityType}:`, error);
      toast.error(`Failed to update ${entityType}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const entityInfo = getEntityInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{entityInfo.title}</DialogTitle>
          <DialogDescription>
            {entityInfo.description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {entityInfo.fields.includes('name') && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {entityInfo.fields.includes('description') && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {entityInfo.fields.includes('country') && (
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {entityInfo.fields.includes('city') && (
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {entityInfo.fields.includes('type') && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="YEAR">Year</option>
                        <option value="RESIDENCY">Residency</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {entityInfo.fields.includes('yearNumber') && (
              <FormField
                control={form.control}
                name="yearNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Number</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="ONE">First Year</option>
                        <option value="TWO">Second Year</option>
                        <option value="THREE">Third Year</option>
                        <option value="FOUR">Fourth Year</option>
                        <option value="FIVE">Fifth Year</option>
                        <option value="SIX">Sixth Year</option>
                        <option value="SEVEN">Seventh Year</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {entityInfo.fields.includes('price') && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter price"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
