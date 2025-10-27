import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

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
  const initials = getInitials(user.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex gap-2 py-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-emerald-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
