"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone } from "lucide-react";
import { useFarmers } from "@/hooks/use-farmers";
import { useFarms } from "@/hooks/use-farms";
import { AddFarmerDialog } from "@/components/farmers/add-farmer-dialog";
import { EditFarmerDialog } from "@/components/farmers/edit-farmer-dialog";
import { DeleteFarmerButton } from "@/components/farmers/delete-farmer-button";
import { ViewFarmerDialog } from "@/components/farmers/view-farmer-dialog";
import type { FarmResponse } from "@/types/api";

export default function FarmersPage() {
  const { data: farmersData, isLoading, error } = useFarmers({ size: 100 });
  const { data: farmsData } = useFarms({ size: 100 });

  const farmers = farmersData?.items || [];
  const farms = farmsData?.items || [];

  // Helper function to get farms count for a farmer
  const getFarmsCount = (farmerId: number) => {
    return farms.filter((farm: FarmResponse) => farm.farmer_id === farmerId).length;
  };

  // Helper function to get farmer's farms
  const getFarmerFarms = (farmerId: number) => {
    return farms.filter((farm: FarmResponse) => farm.farmer_id === farmerId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Farmers</h1>
            <p className="text-muted-foreground">
              Manage farmer profiles and farm information
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">Loading farmers...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Farmers</h1>
            <p className="text-muted-foreground">
              Manage farmer profiles and farm information
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading farmers: {error.message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure the backend server is running on http://localhost:5000
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farmers</h1>
          <p className="text-muted-foreground">
            Manage farmer profiles and farm information
          </p>
        </div>
        <AddFarmerDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farmers.length}</div>
            <p className="text-xs text-muted-foreground">Registered farmers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farms.length}</div>
            <p className="text-xs text-muted-foreground">Registered farms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Farmers with Farms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.filter((f) => getFarmsCount(f.id) > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Farmers who have farms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Farmers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Farmers</CardTitle>
        </CardHeader>
        <CardContent>
          {!farmers || farmers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No farmers found. Add a new farmer to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer Name</TableHead>
                  <TableHead>Farms</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farmers.map((farmer) => {
                  const farmerFarms = getFarmerFarms(farmer.id);
                  return (
                    <TableRow key={farmer.id}>
                      <TableCell className="font-medium">
                        {farmer.name}
                      </TableCell>
                      <TableCell>
                        {farmerFarms.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="default" className="w-fit">
                              {farmerFarms.length} {farmerFarms.length === 1 ? "farm" : "farms"}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {farmerFarms.slice(0, 2).map((farm) => (
                                <div key={farm.id}>• {farm.name}</div>
                              ))}
                              {farmerFarms.length > 2 && (
                                <div>• +{farmerFarms.length - 2} more</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary">No farms</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {farmer.address ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{farmer.address}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {farmer.contact ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{farmer.contact}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(farmer.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ViewFarmerDialog farmer={farmer} farms={farmerFarms} />
                          <EditFarmerDialog farmer={farmer} />
                          <DeleteFarmerButton
                            farmerId={farmer.id}
                            farmerName={farmer.name}
                            farmsCount={farmerFarms.length}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
