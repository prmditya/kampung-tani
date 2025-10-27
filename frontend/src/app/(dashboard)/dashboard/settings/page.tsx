'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AccountTab from '@/features/settings/components/account-tab';
import AdminTab from '@/features/settings/components/admin-tab';
import { useCurrentUser, isSuperAdmin } from '@/features/auth/hooks/use-auth';
import { ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const currentUser = useCurrentUser();
  const isUserSuperAdmin = isSuperAdmin(currentUser);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          {isUserSuperAdmin && (
            <TabsTrigger value="admins">Admin Users</TabsTrigger>
          )}
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <AccountTab />
        </TabsContent>

        {/* Admin Users Tab - Only for Super Admins */}
        {isUserSuperAdmin ? (
          <TabsContent value="admins" className="space-y-4">
            <AdminTab />
          </TabsContent>
        ) : (
          <TabsContent value="admins" className="space-y-4">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <ShieldAlert className="h-5 w-5" />
                  Access Denied
                </CardTitle>
                <CardDescription>
                  You need super admin privileges to access this section.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
