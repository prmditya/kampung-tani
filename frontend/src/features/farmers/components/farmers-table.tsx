import { MapPin, Phone } from "lucide-react";
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
import {
  EditFarmerDialog,
  DeleteFarmerButton,
  ViewFarmerDialog,
} from "@/features/farmers";
import { FarmerResponse, FarmResponse } from "@/types/api";

interface FarmersTableProps {
  farmers: FarmerResponse[];
  getFarmerFarms: (farmerId: number) => FarmResponse[];
}

export default function FarmersTable({
  farmers,
  getFarmerFarms,
}: FarmersTableProps) {
  return (
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
                    <TableCell className="font-medium">{farmer.name}</TableCell>
                    <TableCell>
                      {farmerFarms.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant="default" className="w-fit">
                            {farmerFarms.length}{" "}
                            {farmerFarms.length === 1 ? "farm" : "farms"}
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
  );
}
