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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Battery } from "lucide-react";
import { dummyDevices } from "@/lib/dummy-data";
import type { Device } from "@/lib/types";

export default function DevicesPage() {
	const [devices, setDevices] = useState<Device[]>(dummyDevices);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const getStatusColor = (status: Device["status"]) => {
		switch (status) {
			case "active":
				return "default";
			case "inactive":
				return "secondary";
			case "maintenance":
				return "outline";
			default:
				return "secondary";
		}
	};

	const getBatteryColor = (level: number) => {
		if (level >= 60) return "text-green-500";
		if (level >= 20) return "text-yellow-500";
		return "text-red-500";
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Device Management</h1>
					<p className="text-muted-foreground">
						Manage and monitor all IoT devices
					</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add Device
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Device</DialogTitle>
							<DialogDescription>
								Register a new IoT device to the system
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="device-id">Device ID</Label>
								<Input id="device-id" placeholder="DEV006" />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="device-name">Device Name</Label>
								<Input id="device-name" placeholder="Water Sensor Zeta" />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="status">Status</Label>
								<Select defaultValue="inactive">
									<SelectTrigger id="status">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="maintenance">Maintenance</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={() => setIsDialogOpen(false)}>
								Add Device
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Devices</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Device ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Farm</TableHead>
								<TableHead>Last Active</TableHead>
								<TableHead>Battery</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{devices.map((device) => (
								<TableRow key={device.id}>
									<TableCell className="font-medium">{device.id}</TableCell>
									<TableCell>{device.name}</TableCell>
									<TableCell>
										<Badge variant={getStatusColor(device.status)}>
											{device.status}
										</Badge>
									</TableCell>
									<TableCell>
										{device.farmName || (
											<span className="text-muted-foreground">Unassigned</span>
										)}
									</TableCell>
									<TableCell>
										{new Date(device.lastActive).toLocaleString("en-US", {
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Battery
												className={`h-4 w-4 ${getBatteryColor(device.batteryLevel || 0)}`}
											/>
											<span className="text-sm">{device.batteryLevel}%</span>
										</div>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button variant="ghost" size="icon">
												<Pencil className="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="icon">
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
