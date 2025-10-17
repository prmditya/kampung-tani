"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, Crop } from "lucide-react";
import type { FarmerResponse, FarmResponse } from "@/types/api";
import { AddFarmDialog } from "./add-farm-dialog";
import { EditFarmDialog } from "./edit-farm-dialog";
import { DeleteFarmButton } from "./delete-farm-button";

interface ViewFarmerDialogProps {
  farmer: FarmerResponse;
  farms: FarmResponse[];
}

export function ViewFarmerDialog({ farmer, farms }: ViewFarmerDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
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
              <h3 className="font-semibold text-sm text-muted-foreground">Name</h3>
              <p className="text-base">{farmer.name}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Contact</h3>
              <p className="text-base">{farmer.contact || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Address</h3>
              <p className="text-base">{farmer.address || "-"}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Farms</h3>
                <p className="text-sm text-muted-foreground">
                  {farms.length} {farms.length === 1 ? "farm" : "farms"} registered
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
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Farm Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Area (ha)</TableHead>
                      <TableHead>Soil Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {farms.map((farm) => (
                      <TableRow key={farm.id}>
                        <TableCell className="font-medium">{farm.name}</TableCell>
                        <TableCell>
                          {farm.location ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{farm.location}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {farm.area_size ? (
                            <span>{farm.area_size} ha</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {farm.soil_type ? (
                            <Badge variant="secondary">{farm.soil_type}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditFarmDialog farm={farm} />
                            <DeleteFarmButton
                              farmId={farm.id}
                              farmName={farm.name}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
