'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Field,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import {
  useCurrentUser,
  useUpdateOwnProfile,
  useChangePassword,
} from '@/features/auth/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function AccountTab() {
  const { data: currentUser } = useCurrentUser();
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateOwnProfile();
  const changePasswordMutation = useChangePassword();

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!currentUser) return;

    updateProfile(
      { email },
      {
        onSuccess: () => {
          toast.success('Profile updated successfully!');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        onError: (error) => {
          toast.error(
            error?.message || 'Failed to update profile. Please try again.',
          );
        },
      },
    );
  };

  const handleChangePassword = (
    data: z.infer<typeof changePasswordSchema>,
  ) => {
    changePasswordMutation.mutate(
      {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      },
      {
        onSuccess: () => {
          toast.success('Password changed successfully!');
          passwordForm.reset();
        },
        onError: (error) => {
          toast.error(
            error?.message || 'Failed to change password. Please try again.',
          );
        },
      },
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
          <form
            onSubmit={passwordForm.handleSubmit(handleChangePassword)}
            className="space-y-4"
          >
            <FieldGroup>
              <Controller
                name="currentPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                      disabled={changePasswordMutation.isPending}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="newPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      disabled={changePasswordMutation.isPending}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      disabled={changePasswordMutation.isPending}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FieldGroup>

            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Update Password'
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
                    currentUser.role === 'super admin' ? 'default' : 'secondary'
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
                  'Save Changes'
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
