"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
	const router = useRouter();

	useEffect(() => {
		// Check if user is authenticated (you would check localStorage, cookies, or session here)
		const isAuthenticated = false; // Replace with actual auth check

		if (isAuthenticated) {
			router.push("/dashboard");
		} else {
			router.push("/login");
		}
	}, [router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-semibold">Loading...</h1>
			</div>
		</div>
	);
}
