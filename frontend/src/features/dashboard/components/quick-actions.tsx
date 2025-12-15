import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, Users, TrendingUp, Unplug } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    id: 'add-device',
    label: 'Add New Device',
    href: '/dashboard/devices?action=add',
    icon: HardDrive,
  },
  {
    id: 'add-farmer',
    label: 'Add New Farmer',
    href: '/dashboard/farmers?action=add',
    icon: Users,
  },
  {
    id: 'assign-device',
    label: 'Assign to Farm',
    href: '/dashboard/assignments',
    icon: Unplug,
  },
  {
    id: 'view-analytics',
    label: 'View Analytics',
    href: '/dashboard/data',
    icon: TrendingUp,
  },
];

export function QuickActions({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            variant="outline"
            className="w-full justify-start"
            size="sm"
            key={action.id}
            asChild
          >
            <Link href={action.href}>
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
