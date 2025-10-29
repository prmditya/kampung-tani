'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}) {
  const [initials, setInitials] = useState('');

  useEffect(() => {
    setInitials(getInitials(user.name));
  }, [user.name]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex gap-2 py-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={user.avatar}
              alt={user.name}
              suppressHydrationWarning
            />
            <AvatarFallback className="rounded-lg bg-emerald-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div
            className="grid flex-1 text-left text-sm leading-tight"
            suppressHydrationWarning
          >
            <span className="truncate font-medium" suppressHydrationWarning>
              {user.name}
            </span>
            <span
              className="text-muted-foreground truncate text-xs"
              suppressHydrationWarning
            >
              {user.email}
            </span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
