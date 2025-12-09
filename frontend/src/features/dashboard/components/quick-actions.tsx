import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
          asChild
        >
          <Link href="/dashboard/devices">
            <HardDrive className="mr-2 h-4 w-4" />
            Add New Device
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
          asChild
        >
          <Link href="/dashboard/assignments">
            <Users className="mr-2 h-4 w-4" />
            Assign to Farm
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
          asChild
        >
          <Link href="/dashboard/data">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Analytics
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
