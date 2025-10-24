"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and token is not expired
    const token = localStorage.getItem("token");
    const tokenExpiration = localStorage.getItem("token_expiration");
    let isAuthenticated = false;

    if (token && tokenExpiration) {
      const expirationTime = parseInt(tokenExpiration, 10);
      const isExpired = expirationTime < Date.now();

      if (isExpired) {
        // Token expired, clean up
        localStorage.removeItem("token");
        localStorage.removeItem("token_expiration");
      } else {
        isAuthenticated = true;
      }
    }

    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
