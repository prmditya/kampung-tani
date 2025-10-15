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
import { Plus, Pencil, Trash2, MapPin, Phone, Mail } from "lucide-react";
import { dummyFarmers } from "@/lib/dummy-data";
import type { Farmer } from "@/lib/types";

export default function FarmersPage() {
	const [farmers, setFarmers] = useState<Farmer[]>(dummyFarmers);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Farmers</h1>
					<p className="text-muted-foreground">
						Manage farmer profiles and farm information
					</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add Farmer
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle>Add New Farmer</DialogTitle>
							<DialogDescription>
								Register a new farmer to the system
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="farmer-name">Full Name</Label>
								<Input id="farmer-name" placeholder="John Doe" />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="farmer-email">Email</Label>
								<Input
									id="farmer-email"
									type="email"
									placeholder="john@example.com"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="farmer-phone">Phone Number</Label>
								<Input
									id="farmer-phone"
									type="tel"
									placeholder="+62 812-3456-7890"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="farm-name">Farm Name</Label>
								<Input id="farm-name" placeholder="Green Valley Farm" />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="location">Location</Label>
								<Input id="location" placeholder="Bandung, West Java" />
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={() => setIsDialogOpen(false)}>Add Farmer</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
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
						<CardTitle className="text-sm font-medium">Active Farms</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{farmers.length}</div>
						<p className="text-xs text-muted-foreground">Operational farms</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Devices
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{farmers.reduce((acc, farmer) => acc + farmer.devicesActive, 0)}
						</div>
						<p className="text-xs text-muted-foreground">
							Devices in use by farmers
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
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Farmer Name</TableHead>
								<TableHead>Farm</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Devices Active</TableHead>
								<TableHead>Joined Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{farmers.map((farmer) => (
								<TableRow key={farmer.id}>
									<TableCell className="font-medium">{farmer.name}</TableCell>
									<TableCell>{farmer.farmName}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<MapPin className="h-3 w-3 text-muted-foreground" />
											<span className="text-sm">{farmer.location}</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-1">
											<div className="flex items-center gap-2">
												<Mail className="h-3 w-3 text-muted-foreground" />
												<span className="text-xs">{farmer.email}</span>
											</div>
											<div className="flex items-center gap-2">
												<Phone className="h-3 w-3 text-muted-foreground" />
												<span className="text-xs">{farmer.phone}</span>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={farmer.devicesActive > 0 ? "default" : "secondary"}>
											{farmer.devicesActive}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(farmer.createdAt).toLocaleDateString()}
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
