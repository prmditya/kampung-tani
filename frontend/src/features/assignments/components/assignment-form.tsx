"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateAssignment } from "@/features/assignments/hooks/use-assignment";
import type {
  GatewayResponse,
  FarmResponse,
  GatewayAssignmentCreate,
} from "@/types/api";

interface AssignmentFormProps {
  gateways: GatewayResponse[];
  farms: FarmResponse[];
}

export function AssignmentForm({ gateways, farms }: AssignmentFormProps) {
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  const [selectedFarm, setSelectedFarm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const createMutation = useCreateAssignment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGateway || !selectedFarm) {
      return;
    }

    // Convert date strings to ISO datetime format (add time component)
    const formatDateTime = (dateStr: string) => {
      if (!dateStr) return null;
      // Add time component (00:00:00) to make it a valid datetime
      return `${dateStr}T00:00:00`;
    };

    const data: GatewayAssignmentCreate = {
      gateway_id: parseInt(selectedGateway),
      farm_id: parseInt(selectedFarm),
      start_date: formatDateTime(startDate),
      end_date: formatDateTime(endDate),
    };

    createMutation.mutate(data, {
      onSuccess: () => {
        // Reset form
        setSelectedGateway("");
        setSelectedFarm("");
        setStartDate("");
        setEndDate("");
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="gateway">Gateway *</Label>
              <Select
                value={selectedGateway}
                onValueChange={setSelectedGateway}
                disabled={createMutation.isPending}
              >
                <SelectTrigger id="gateway">
                  <SelectValue placeholder="Select a gateway" />
                </SelectTrigger>
                <SelectContent>
                  {gateways.map((gateway) => (
                    <SelectItem key={gateway.id} value={gateway.id.toString()}>
                      {gateway.name || gateway.gateway_uid} (
                      {gateway.gateway_uid})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="farm">Farm *</Label>
              <Select
                value={selectedFarm}
                onValueChange={setSelectedFarm}
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="start_date">Start Date (Optional)</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          {createMutation.isError && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {createMutation.error?.message || "Failed to create assignment"}
            </div>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              disabled={
                !selectedGateway || !selectedFarm || createMutation.isPending
              }
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createMutation.isPending ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
