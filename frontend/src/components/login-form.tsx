"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Field,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sprout } from "lucide-react";
import Link from "next/link";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-8 md:p-10">
						<FieldGroup>
							<div className="flex flex-col items-center gap-3 text-center mb-2">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
									<Sprout className="h-7 w-7" />
								</div>
								<div>
									<h1 className="text-2xl font-bold">Welcome back</h1>
									<p className="text-muted-foreground text-balance text-sm mt-1">
										Login to your Kampoeng Tani admin account
									</p>
								</div>
							</div>
							<Field>
								<FieldLabel htmlFor="username">Username</FieldLabel>
								<Input
									id="username"
									type="text"
									placeholder="admin"
									required
									autoComplete="username"
								/>
							</Field>
							<Field>
								<div className="flex items-center justify-between">
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<Link
										href="#"
										className="text-xs text-muted-foreground hover:text-foreground transition-colors"
									>
										Forgot password?
									</Link>
								</div>
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									required
									autoComplete="current-password"
								/>
							</Field>
							<Field>
								<Button type="submit" className="w-full">
									Sign in
								</Button>
							</Field>
						</FieldGroup>
					</form>
					<div className="bg-muted relative hidden md:block">
						<div className="absolute inset-0 flex items-center justify-center p-10">
							<div className="space-y-4 text-center">
								<h2 className="text-3xl font-bold tracking-tight">
									IoT Device Management
								</h2>
								<p className="text-muted-foreground text-balance">
									Monitor and manage agricultural IoT devices across multiple farms
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
