import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardDrive, Users, TrendingUp } from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <HardDrive className="mr-2 h-4 w-4" />
          Add New Device
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <Users className="mr-2 h-4 w-4" />
          Assign to Farm
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
