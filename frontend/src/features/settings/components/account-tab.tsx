"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  useCurrentUser,
  useUpdateOwnProfile,
  useChangePassword,
} from "@/features/auth/hooks/use-auth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AccountTab() {
  const currentUser = useCurrentUser();
  const {
    mutate: updateProfile,
    isPending: isUpdating,
    isSuccess: isProfileSuccess,
    isError: isProfileError,
    error: profileError,
  } = useUpdateOwnProfile();
  const {
    mutate: changePassword,
    isPending: isChangingPassword,
    isSuccess: isPasswordSuccess,
    isError: isPasswordError,
    error: passwordError,
    reset: resetPasswordMutation,
  } = useChangePassword();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (!currentUser) return;

    updateProfile(
      { email },
      {
        onSuccess: () => {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
      }
    );
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return; // Error will be shown in the UI
    }

    if (passwordForm.newPassword.length < 6) {
      return; // Error will be shown in the UI
    }

    changePassword(
      {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      },
      {
        onSuccess: () => {
          // Reset form
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          // Reset mutation state after showing success message
          setTimeout(() => {
            resetPasswordMutation();
          }, 3000);
        },
      }
    );
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading user information...
          </div>
        </CardContent>
      </Card>
    );
  }

  const passwordsMatch =
    passwordForm.newPassword === passwordForm.confirmPassword;
  const isPasswordValid = passwordForm.newPassword.length >= 6;
  const showPasswordMismatch =
    passwordForm.confirmPassword.length > 0 && !passwordsMatch;
  const showPasswordTooShort =
    passwordForm.newPassword.length > 0 && !isPasswordValid;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPasswordSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              Password changed successfully!
            </div>
          )}
          {isPasswordError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <XCircle className="h-4 w-4" />
              {passwordError?.message ||
                "Failed to change password. Please try again."}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                required
                disabled={isChangingPassword}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                required
                disabled={isChangingPassword}
                minLength={6}
              />
              {showPasswordTooShort && (
                <p className="text-xs text-red-600">
                  Password must be at least 6 characters
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                required
                disabled={isChangingPassword}
              />
              {showPasswordMismatch && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={
                isChangingPassword ||
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword ||
                !passwordsMatch ||
                !isPasswordValid
              }
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            View and update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProfileSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              Profile updated successfully!
            </div>
          )}
          {isProfileError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <XCircle className="h-4 w-4" />
              {profileError?.message ||
                "Failed to update profile. Please try again."}
            </div>
          )}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={currentUser.username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={currentUser.email}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <div>
                <Badge
                  variant={
                    currentUser.role === "super admin" ? "default" : "secondary"
                  }
                >
                  {currentUser.role}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button type="button" variant="outline" disabled={isUpdating}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
