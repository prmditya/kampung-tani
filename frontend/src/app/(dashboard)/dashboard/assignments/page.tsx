"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Unplug, Link2Off } from "lucide-react";
import {
	dummyAssignments,
	dummyDevices,
	dummyFarmers,
	dummyFarms,
} from "@/lib/dummy-data";
import type { Assignment } from "@/lib/types";

export default function AssignmentsPage() {
	const [assignments, setAssignments] = useState<Assignment[]>(dummyAssignments);
	const [selectedDevice, setSelectedDevice] = useState("");
	const [selectedFarmer, setSelectedFarmer] = useState("");
	const [selectedFarm, setSelectedFarm] = useState("");

	// Filter only unassigned devices
	const unassignedDevices = dummyDevices.filter(
		(device) => !assignments.some((a) => a.deviceId === device.id)
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Assignment Management
				</h1>
				<p className="text-muted-foreground">
					Assign devices to farmers and manage deployments
				</p>
			</div>

			{/* Assignment Form */}
			<Card>
				<CardHeader>
					<CardTitle>Create New Assignment</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6 md:grid-cols-3">
						<div className="grid gap-2">
							<Label htmlFor="device">Select Device</Label>
							<Select value={selectedDevice} onValueChange={setSelectedDevice}>
								<SelectTrigger id="device">
									<SelectValue placeholder="Choose a device" />
								</SelectTrigger>
								<SelectContent>
									{unassignedDevices.map((device) => (
										<SelectItem key={device.id} value={device.id}>
											{device.name} ({device.id})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="farmer">Select Farmer</Label>
							<Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
								<SelectTrigger id="farmer">
									<SelectValue placeholder="Choose a farmer" />
								</SelectTrigger>
								<SelectContent>
									{dummyFarmers.map((farmer) => (
										<SelectItem key={farmer.id} value={farmer.id}>
											{farmer.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="farm">Select Farm</Label>
							<Select value={selectedFarm} onValueChange={setSelectedFarm}>
								<SelectTrigger id="farm">
									<SelectValue placeholder="Choose a farm" />
								</SelectTrigger>
								<SelectContent>
									{dummyFarms.map((farm) => (
										<SelectItem key={farm.id} value={farm.id}>
											{farm.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="mt-6 flex gap-3">
						<Button className="flex-1">
							<Unplug className="mr-2 h-4 w-4" />
							Assign Device
						</Button>
						<Button variant="outline" className="flex-1">
							<Link2Off className="mr-2 h-4 w-4" />
							Unassign Selected
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Assignments Table */}
			<Card>
				<CardHeader>
					<CardTitle>Current Assignments</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Assignment ID</TableHead>
								<TableHead>Device</TableHead>
								<TableHead>Farmer</TableHead>
								<TableHead>Farm</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Assigned Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{assignments.map((assignment) => {
								const farm = dummyFarms.find((f) => f.id === assignment.farmId);
								return (
									<TableRow key={assignment.id}>
										<TableCell className="font-medium">
											{assignment.id}
										</TableCell>
										<TableCell>{assignment.deviceName}</TableCell>
										<TableCell>{assignment.farmerName}</TableCell>
										<TableCell>{assignment.farmName}</TableCell>
										<TableCell className="text-muted-foreground">
											{farm?.location}
										</TableCell>
										<TableCell>
											{new Date(assignment.assignedAt).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													assignment.status === "active" ? "default" : "secondary"
												}
											>
												{assignment.status}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Button variant="ghost" size="sm">
												<Link2Off className="mr-2 h-4 w-4" />
												Unassign
											</Button>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
