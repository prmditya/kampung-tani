'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { MapView } from '@/components/ui/map-view';
import { Eye, MapPin, Crop, MessageCircle } from 'lucide-react';
import type { FarmerResponse, FarmResponse } from '@/types/api';
import { AddFarmDialog } from './add-farm-dialog';
import { EditFarmDialog } from './edit-farm-dialog';
import { DeleteFarmButton } from './delete-farm-button';

interface ViewFarmerDialogProps {
  farmer: FarmerResponse;
  farms: FarmResponse[];
  // For URL-controlled mode
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function ViewFarmerDialog({
  farmer,
  farms,
  externalOpen,
  onExternalOpenChange,
  hideTrigger = false,
}: ViewFarmerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? onExternalOpenChange! : setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Farmer Details</DialogTitle>
          <DialogDescription>
            View farmer information and manage their farms
          </DialogDescription>
        </DialogHeader>

        {/* Farmer Info */}
        <div className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Name
              </h3>
              <p className="text-base">{farmer.name}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Contact
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-base">{farmer.contact || '-'}</p>
                {farmer.contact && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${farmer.contact.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Chat via WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                Address
              </h3>
              <p className="text-base">{farmer.address || '-'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Farms</h3>
                <p className="text-sm text-muted-foreground">
                  {farms.length} {farms.length === 1 ? 'farm' : 'farms'}{' '}
                  registered
                </p>
              </div>
              <AddFarmDialog farmerId={farmer.id} />
            </div>

            {farms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                <Crop className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No farms registered yet.</p>
                <p className="text-sm">Add a farm to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {farms.map((farm) => (
                  <div
                    key={farm.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    {/* Header: Farm name + actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{farm.name}</div>
                      <div className="flex gap-1 shrink-0">
                        <EditFarmDialog farm={farm} />
                        <DeleteFarmButton
                          farmId={farm.id}
                          farmName={farm.name}
                        />
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="text-muted-foreground">Location</div>
                      <div>
                        {farm.location ? (
                          farm.latitude && farm.longitude ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 gap-1 text-left font-normal hover:bg-transparent hover:text-primary"
                                >
                                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                                  <span className="truncate">
                                    {farm.location}
                                  </span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[280px] p-0"
                                align="start"
                              >
                                <div className="p-3 border-b">
                                  <p className="font-medium text-sm">
                                    {farm.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {farm.location}
                                  </p>
                                </div>
                                <MapView
                                  latitude={farm.latitude}
                                  longitude={farm.longitude}
                                  height="150px"
                                  zoom={13}
                                  className="border-0 rounded-none"
                                />
                                <div className="p-2 border-t bg-muted/30">
                                  <p className="text-xs text-muted-foreground text-center">
                                    {farm.latitude.toFixed(6)},{' '}
                                    {farm.longitude.toFixed(6)}
                                  </p>
                                </div>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{farm.location}</span>
                            </div>
                          )
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>

                      <div className="text-muted-foreground">Area</div>
                      <div>
                        {farm.area_size ? (
                          `${farm.area_size} ha`
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>

                      <div className="text-muted-foreground">Soil Type</div>
                      <div>
                        {farm.soil_type ? (
                          <Badge variant="secondary" className="text-xs">
                            {farm.soil_type}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
