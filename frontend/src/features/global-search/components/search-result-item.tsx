import { useRouter } from 'next/navigation';
import type { NavigationItem } from '../types/search-result';
import {
  LayoutDashboard,
  HardDrive,
  Users,
  Unplug,
  LineChart,
  Settings,
  Plus,
  UserPlus,
  Link,
  ChevronRight,
} from 'lucide-react';

interface SearchResultItemProps {
  result: NavigationItem;
  onSelect: () => void;
  isSelected?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  HardDrive,
  Users,
  Unplug,
  LineChart,
  Settings,
  Plus,
  UserPlus,
  Link,
};

export function SearchResultItem({
  result,
  onSelect,
  isSelected = false,
}: SearchResultItemProps) {
  const router = useRouter();
  const Icon = result.icon ? ICON_MAP[result.icon] : ChevronRight;

  const handleClick = () => {
    router.push(result.href);
    onSelect();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left group ${
        isSelected ? 'bg-accent' : 'hover:bg-accent'
      }`}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm mb-0.5">{result.title}</p>
        {result.description && (
          <p className="text-xs text-muted-foreground truncate">
            {result.description}
          </p>
        )}
      </div>
      <ChevronRight
        className={`h-4 w-4 text-muted-foreground transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      />
    </button>
  );
}
