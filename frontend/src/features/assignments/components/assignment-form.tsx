'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCreateAssignment } from '@/features/assignments/hooks/use-assignment';
import useAssignments from '@/features/assignments/hooks/use-assignment';
import type {
  GatewayResponse,
  FarmResponse,
  GatewayAssignmentCreate,
} from '@/types/api';
import { formatDateTimeToISO } from '@/lib/utils';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  assignmentSchema,
  AssignmentFormData,
} from '@/features/assignments/schemas';

interface AssignmentFormProps {
  gateways: GatewayResponse[];
  farms: FarmResponse[];
}

export function AssignmentForm({ gateways, farms }: AssignmentFormProps) {
  const createMutation = useCreateAssignment();
  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useAssignments({ size: 100 });

  // Get list of gateway IDs that are currently assigned
  const assignedGatewayIds = useMemo(() => {
    if (!assignmentsData?.items) return new Set<number>();
    const assigned = new Set(
      assignmentsData.items
        .filter((assignment) => {
          return assignment.is_active;
        })
        .map((assignment) => assignment.gateway_id),
    );
    return assigned;
  }, [assignmentsData]);

  // Filter to show only unassigned gateways
  const availableGateways = useMemo(() => {
    const available = gateways.filter((gateway) => {
      const isAssigned = assignedGatewayIds.has(gateway.id);
      console.log(
        `Gateway ${gateway.id} (${gateway.gateway_uid}): isAssigned = ${isAssigned}`,
      );
      return !isAssigned;
    });
    return available;
  }, [gateways, assignedGatewayIds]);

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      gateway_id: '',
      farm_id: '',
      start_date: new Date().toISOString(),
    },
  });

  const handleSubmit = (data: AssignmentFormData) => {
    createMutation.mutate(
      {
        gateway_id: parseInt(data.gateway_id, 10),
        farm_id: parseInt(data.farm_id, 10),
        start_date: data.start_date,
        end_date: data.end_date,
      } as GatewayAssignmentCreate,
      {
        onSuccess: () => {
          toast.success('Assignment created successfully');
          form.reset();
        },
        onError: (error) => {
          toast.error(
            error?.message || 'Failed to create assignment. Please try again.',
          );
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup className="grid gap-4 md:grid-cols-2 items-start">
            <Controller
              name="gateway_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="gateway">
                    Gateway<span className="text-red-500 ml-[-5px]">*</span>
                  </Label>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={createMutation.isPending}
                  >
                    <SelectTrigger id="gateway">
                      <SelectValue placeholder="Select a gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGateways.length === 0 ? (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          No available gateways. All gateways are currently
                          assigned.
                        </div>
                      ) : (
                        availableGateways.map((gateway) => (
                          <SelectItem
                            key={gateway.id}
                            value={gateway.id.toString()}
                          >
                            {gateway.name || gateway.gateway_uid} (
                            {gateway.gateway_uid})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="farm_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="farm">
                    Farm<span className="text-red-500 ml-[-5px]">*</span>
                  </Label>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={createMutation.isPending}
                  >
                    <SelectTrigger id="farm">
                      <SelectValue placeholder="Select a farm" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id.toString()}>
                          {farm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="start_date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="grid gap-2">
                  <Label>
                    Start Date<span className="text-red-500 ml-[-5px]">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                        disabled={createMutation.isPending}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(new Date(field.value), 'PPP')
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : new Date()
                        }
                        onSelect={(date) =>
                          field.onChange(
                            date ? formatDateTimeToISO(date) : undefined,
                          )
                        }
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="end_date"
              control={form.control}
              render={({ field, fieldState }) => {
                const startDate = form.watch('start_date');
                return (
                  <Field className="grid gap-2">
                    <Label>End Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                          disabled={createMutation.isPending}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), 'PPP')
                            : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(
                              date ? formatDateTimeToISO(date) : undefined,
                            )
                          }
                          disabled={(date) =>
                            startDate ? date < new Date(startDate) : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
