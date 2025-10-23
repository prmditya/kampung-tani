"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLogin } from "@/features/auth/hooks/use-auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <form className="p-8 md:p-10" onSubmit={onSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-3 text-center mb-2">
                <Image
                  src="/assets/kt-logo.webp"
                  alt="Kampoeng Tani Logo"
                  width={200}
                  height={100}
                />
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
                  onChange={(e) => setUsername(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {loginMutation.isError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {loginMutation.error?.message ||
                    "Login failed. Please try again."}
                </div>
              )}
              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign in"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
